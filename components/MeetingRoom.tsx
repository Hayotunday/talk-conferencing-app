"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useUserStore } from "@/data/users";
import peer, { RTC_CONFIGURATION } from "@/lib/peer";
import ReactPlayer from "react-player";
import ProfilePicture from "./ProfilePicture";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa6";
import { BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs";
import {
  RemoteStreamData,
  PeerData,
  PeerFinalData,
  UserJoinedData,
} from "@/lib/type";

export default function MeetingRoom({ roomId }: { roomId: string }) {
  const {
    user: { userid, username },
  } = useUserStore();
  const userId = userid;

  const router = useRouter();
  const { socket } = useSocket();

  const [localStream, setLocalStream] = useState<MediaStream>();
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<
    Map<string, RemoteStreamData>
  >(new Map());

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectedPeersCount, setConnectedPeersCount] = useState(0);

  // 1. Get local media stream and join the meeting room
  useEffect(() => {
    const getMediaAndJoin = async () => {
      try {
        const stream = await navigator.mediaDevices
          .getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 30 },
            },
          })
          .catch(async () => {
            // Fallback for simpler constraints
            return await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: true,
            });
          });
        setLocalStream(stream);
        console.log("Local stream acquired");

        // Emit join room event once local stream is ready and socket is connected
        if (userId && roomId && socket.id) {
          socket.emit("join-room", { roomId, userId, socketId: socket.id, username });
          console.log("Joined room:", roomId);
        } else if (userId && roomId) {
          socket.once("connect", () => {
            socket.emit("join-room", { roomId, userId, username });
            console.log("Joined room:", roomId);
          });
        }
      } catch (error) {
        console.error(
          "Error accessing media devices or joining meeting room:",
          error
        );
      }
    };

    getMediaAndJoin();

    // Cleanupfunction for when the component unmounts
    return () => {
      console.log("MeetingRoom unmounting, cleaning up resources...");
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        console.log("Local stream tracks stopped...");
      }
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      console.log("All peer connections closed and cleared...");
      if (socket && roomId) {
        socket.emit("leave-room", { roomId });
        console.log("Left room:", roomId);
      }
      // Conside if socket.disconnect() is needed here
    };
  }, [userId, username, roomId, socket]);

  // 2. Function to create and configure a peer connection
  const createPeerConnection = useCallback(
    (
      remoteSocketId: string,
      remoteAppUserId: string,
      remoteUsername?: string
    ) => {
      if (peersRef.current.has(remoteSocketId)) {
        console.log("Peer connection already exists for", remoteSocketId);
        return peersRef.current.get(remoteSocketId);
      }
      console.log(
        `Creating new peer connection for ${
          remoteUsername || remoteAppUserId
        } (${remoteSocketId})`
      );
      const pc = new RTCPeerConnection(RTC_CONFIGURATION);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // console.log(`Sending ICE candidate to ${remoteSocketId}`);
          socket.emit("ice-candidate", {
            to: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        console.log(
          `Track received from ${
            remoteUsername || remoteAppUserId
          } (${remoteSocketId})`,
          event.streams[0]
        );
        setRemoteStreams((prev) =>
          new Map(prev).set(remoteSocketId, {
            stream: event.streams[0],
            appUserId: remoteAppUserId,
            username: remoteUsername,
          })
        );
      };

      pc.oniceconnectionstatechange = () => {
        console.log(
          `ICE connection state change for ${remoteSocketId}: ${pc.iceConnectionState}`
        );
        if (
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "closed" ||
          pc.iceConnectionState === "failed"
        ) {
          // Handle potential disconnection, maybe attempt to clean up
          handleUserLeft(remoteSocketId);
        }
      };

      // Add local tracks if localStream is available
      if (localStream) {
        if (localStream) {
          for (const track of localStream.getTracks()) {
            console.log(
              `Adding local ${track.kind} track to PC for ${remoteSocketId}`
            );
            pc.addTrack(track, localStream);
          }
        }
      } else {
        console.warn(
          "Local stream not available when creating peer connection for",
          remoteSocketId
        );
      }

      peersRef.current.set(remoteSocketId, pc);
      setConnectedPeersCount(peersRef.current.size);
      return pc;
    },
    [localStream, socket]
  ); // Added handleUserLeft to dependencies if it's used inside

  // 3. Function to initiate a call by creating and sending an offer
  const createAndSendOffer = useCallback(
    async (
      remoteSocketId: string,
      remoteAppUserId: string,
      remoteUsername?: string
    ) => {
      console.log(
        `Attempting to create and send offer to ${
          remoteUsername || remoteAppUserId
        } (${remoteSocketId})`
      );
      const pc = createPeerConnection(
        remoteSocketId,
        remoteAppUserId,
        remoteUsername
      );
      if (!pc) {
        console.error("Failed to create peer connection for offer.");
        return;
      }

      // Ensure local tracks are added before creating offer if pc was just created and localStream is ready
      if (localStream && pc.getSenders().length === 0) {
        localStream.getTracks().forEach((track) => {
          if (!pc.getSenders().find((s) => s.track === track)) {
            pc.addTrack(track, localStream);
          }
        });
      }

      pc.onnegotiationneeded = async () => {
        console.log(
          `Negotiation needed for ${remoteSocketId}. Creating offer.`
        );
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", {
            to: remoteSocketId,
            offer,
            fromAppUserId: userId,
            fromUsername: username,
          });
          console.log(`Offer sent to ${remoteSocketId}`);
        } catch (error) {
          console.error("Error creating offer for", remoteSocketId, error);
        }
      };
      // Manually trigger if negotiationneeded doesn't fire immediately (e.g. if tracks were added before handler)
      if (
        pc.signalingState === "stable" &&
        localStream &&
        localStream.getTracks().length > 0
      ) {
        console.log(
          `Manually triggering offer creation for ${remoteSocketId} as state is stable.`
        );
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", {
            to: remoteSocketId,
            offer,
            fromAppUserId: userid,
            fromUsername: username,
          });
          console.log(`Offer sent to ${remoteSocketId} (manual trigger)`);
        } catch (error) {
          console.error(
            "Error creating offer (manual trigger) for",
            remoteSocketId,
            error
          );
        }
      }
    },
    [createPeerConnection, socket, userid, username, localStream]
  );

  // 4. Handle an incoming offer
  const handleOffer = useCallback(
    async (
      offer: RTCSessionDescriptionInit,
      fromSocketId: string,
      fromAppUserId: string,
      fromUsername?: string
    ) => {
      console.log(
        `Received offer from ${fromUsername || fromAppUserId} (${fromSocketId})`
      );
      const pc = createPeerConnection(
        fromSocketId,
        fromAppUserId,
        fromUsername
      );
      if (!pc) {
        console.error("Failed to create peer connection for handling offer.");
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        // Ensure local tracks are added before creating an answer
        if (localStream && pc.getSenders().length === 0) {
          localStream.getTracks().forEach((track) => {
            if (!pc.getSenders().find((s) => s.track === track)) {
              pc.addTrack(track, localStream);
            }
          });
        }
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: fromSocketId, answer });
        console.log(`Answer sent to ${fromSocketId}`);
      } catch (error) {
        console.error("Error handling offer from", fromSocketId, error);
      }
    },
    [createPeerConnection, socket, localStream]
  );

  // 5. Handle an incoming answer
  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit, fromSocketId: string) => {
      console.log(`Received answer from ${fromSocketId}`);
      const pc = peersRef.current.get(fromSocketId);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log(`Answer from ${fromSocketId} processed`);
        } catch (error) {
          console.error("Error handling answer from", fromSocketId, error);
        }
      } else {
        console.warn("No peer connection found for answer from", fromSocketId);
      }
    },
    []
  );

  // 6. Handle an incoming ICE candidate
  const handleIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit, fromSocketId: string) => {
      // console.log(`Received ICE candidate from ${fromSocketId}`);
      const pc = peersRef.current.get(fromSocketId);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          // Ignore benign errors like candidate already added or peer connection closed

          if (
            error instanceof Error &&
            !error.message.includes(
              "Cannot add ICE candidate when ConnectionState is 'closed'"
            ) &&
            !error.message.includes("Error processing ICE candidate")
          ) {
            console.error(
              "Error adding ICE candidate from",
              fromSocketId,
              error
            );
          }
        }
      }
    },
    []
  );

  // 7. Handle a user leaving the room
  const handleUserLeft = useCallback((socketId: string) => {
    console.log(`User ${socketId} left or connection lost.`);
    const pc = peersRef.current.get(socketId);
    if (pc) {
      pc.close();
      peersRef.current.delete(socketId);
    }
    setRemoteStreams((prev) => {
      const newMap = new Map(prev);
      newMap.delete(socketId);
      return newMap;
    });
    setConnectedPeersCount(peersRef.current.size);
  }, []);

  // 8. Setup socket event listeners
  useEffect(() => {
    // UserJoinedData should include { userId (appId), socketId, username }
    socket.on(
      "user-joined",
      ({
        userId: joinedAppUserId,
        socketId: joinedSocketId,
        username: joinedUsername,
      }: UserJoinedData) => {
        if (joinedSocketId === socket.id) return; // It's me
        console.log(
          `User ${
            joinedUsername || joinedAppUserId
          } (${joinedSocketId}) joined. Initiating call.`
        );
        // The new user has joined, this client (an existing one) will send an offer.
        createAndSendOffer(joinedSocketId, joinedAppUserId, joinedUsername);
      }
    );

    socket.on(
      "offer",
      ({
        offer,
        fromSocketId,
        fromAppUserId,
        fromUsername,
      }: {
        offer: RTCSessionDescriptionInit;
        fromSocketId: string;
        fromAppUserId: string;
        fromUsername?: string;
      }) => {
        handleOffer(offer, fromSocketId, fromAppUserId, fromUsername);
      }
    );

    socket.on(
      "answer",
      ({
        answer,
        fromSocketId,
      }: {
        answer: RTCSessionDescriptionInit;
        fromSocketId: string;
      }) => {
        handleAnswer(answer, fromSocketId);
      }
    );

    socket.on(
      "ice-candidate",
      ({
        candidate,
        fromSocketId,
      }: {
        candidate: RTCIceCandidateInit;
        fromSocketId: string;
      }) => {
        handleIceCandidate(candidate, fromSocketId);
      }
    );

    socket.on(
      "user-left",
      ({ socketId: leftSocketId }: { socketId: string }) => {
        handleUserLeft(leftSocketId);
      }
    );

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, [
    socket,
    createAndSendOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handleUserLeft, // Added handleUserLeft
  ]);

  // 9. Media control functions
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  const handleLeaveCall = () => {
    // Cleanup is handled by the main useEffect return, this just navigates
    router.push("/");
  };

  // 10. Dynamic grid layout calculation
  const getGridColsClass = (count: number) => {
    if (count <= 1) return "grid-cols-1"; // Only local user
    if (count === 2) return "grid-cols-1 md:grid-cols-2"; // Local + 1 remote
    if (count <= 4) return "grid-cols-2"; // Up to 2x2
    if (count <= 6) return "grid-cols-2 md:grid-cols-3"; // Up to 3x2
    if (count <= 9) return "grid-cols-3"; // Up to 3x3
    // For 10, let's try to fit them. A 4x3 or 5x2 grid.
    // Tailwind doesn't have grid-cols-5 by default without customization.
    // Let's use a max of 4 columns for simplicity with default Tailwind.
    if (count <= 10) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"; // Default for more
  };

  const totalParticipants = 1 + remoteStreams.size; // Local + remotes
  const gridClass = getGridColsClass(totalParticipants);
  const remoteStreamsArray = Array.from(remoteStreams.entries());

  return (
    <div className="min-h-screen text-white p-4 md:p-6 w-full h-full flex flex-col bg-dark-2">
      <div className="flex-grow max-w-full mx-auto space-y-4 md:space-y-6 w-full h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold">Room: {roomId}</h1>
          </div>
          <Badge variant={connectedPeersCount > 0 ? "default" : "secondary"}>
            {connectedPeersCount > 0
              ? `${connectedPeersCount} Peer${
                  connectedPeersCount !== 1 ? "s" : ""
                } Connected`
              : "Waiting for peers..."}
          </Badge>
        </div>

        <div
          className={`grid ${gridClass} gap-2 md:gap-4 w-full flex-grow auto-rows-fr overflow-hidden`}
        >
          {/* Local Participant */}
          {localStream && (
            <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-800 aspect-video">
              {!isVideoEnabled && localStream.getVideoTracks().length > 0 ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <ProfilePicture profile />
                </div>
              ) : (
                <ReactPlayer
                  playing
                  muted // Local stream is muted for the local user to prevent echo
                  height="100%"
                  width="100%"
                  url={localStream}
                  className="w-full h-full object-cover scale-x-[-1]" // Mirror local video
                />
              )}
              <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs md:text-sm flex items-center">
                {"You"}
                {!isAudioEnabled && (
                  <FaMicrophoneSlash className="ml-1 md:ml-2" />
                )}
                {!isVideoEnabled && localStream.getVideoTracks().length > 0 && (
                  <BsCameraVideoOffFill className="ml-1 md:ml-2" />
                )}
              </div>
            </div>
          )}

          {/* Remote Participants */}
          {remoteStreamsArray.map(([socketId, data]) => (
            <div
              key={socketId}
              className="relative w-full h-full rounded-lg overflow-hidden bg-gray-800 aspect-video"
            >
              {data.stream ? (
                <ReactPlayer
                  playing
                  height="100%"
                  width="100%"
                  url={data.stream}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                  Connecting...
                </div>
              )}
              <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs md:text-sm">
                {data.username || data.appUserId}
                {/* Note: Displaying remote mute/video status requires additional signaling */}
              </div>
            </div>
          ))}

          {/* Placeholder for when no remote streams yet but expecting */}
          {localStream &&
            remoteStreamsArray.length === 0 &&
            connectedPeersCount === 0 && (
              <div className="rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 aspect-video">
                Waiting for others to join...
              </div>
            )}
        </div>

        {/* Controls - fixed at the bottom */}
        <div className="py-2 md:py-4">
          <div className="bg-dark-3 rounded-full shadow-lg p-2 flex items-center justify-center space-x-2 md:space-x-4 max-w-xs mx-auto">
            {localStream && (
              <>
                <Button
                  size="icon"
                  onClick={toggleAudio}
                  className={`${
                    !isAudioEnabled
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-600 hover:bg-gray-700"
                  } rounded-full text-white w-10 h-10 md:w-12 md:h-12`}
                  aria-label={
                    isAudioEnabled ? "Mute microphone" : "Unmute microphone"
                  }
                >
                  {isAudioEnabled ? (
                    <FaMicrophone className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <FaMicrophoneSlash className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  onClick={toggleVideo}
                  className={`${
                    !isVideoEnabled
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-600 hover:bg-gray-700"
                  } rounded-full text-white w-10 h-10 md:w-12 md:h-12`}
                  aria-label={
                    isVideoEnabled ? "Turn off camera" : "Turn on camera"
                  }
                >
                  {isVideoEnabled ? (
                    <BsCameraVideoFill className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <BsCameraVideoOffFill className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </Button>
              </>
            )}
            {localStream && (
              <Button
                variant="destructive"
                size="icon"
                onClick={handleLeaveCall}
                className="rounded-full bg-red-500 hover:bg-red-600 text-white w-10 h-10 md:w-12 md:h-12"
                aria-label="Leave call"
              >
                <MdCallEnd className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}