import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import socket from "@/lib/socket";

interface iPeer {
  userId: string;
  stream: MediaStream | null;
}

interface iSocketContext {
  localStream: MediaStream | null;
  peers: iPeer[];
  isSetupComplete: boolean;
  setIsSetupComplete: (value: boolean) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
  leaveCall: () => void;
  getMediaStream: () => MediaStream | Promise<MediaStream | null>;
}

interface SocketContextProps {
  children: ReactNode;
  roomId: string;
  userId: string;
}

export const SocketContext = createContext<iSocketContext | null>(null);

export const SocketContextProvider = ({
  children,
  roomId,
  userId,
}: SocketContextProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<iPeer[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const socketRef = useRef(socket);
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});

  // Modify the getMediaStream function in your SocketContext
  const getMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 360, ideal: 720, max: 1080 },
          frameRate: { min: 16, ideal: 30, max: 30 },
        },
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeRoom = async () => {
      const stream = await getMediaStream();
      if (!stream) return;

      socketRef.current.emit("join-room", {
        roomId,
        userId,
        role: "participant",
      });
    };

    initializeRoom();

    return () => {
      leaveCall();
    };
  }, [roomId, userId]);

  // In your SocketContext.tsx
  useEffect(() => {
    const socket = socketRef.current;

    const handleUserConnected = (userId: string) => {
      if (userId !== userId && localStream) {
        createPeerConnection(userId, localStream);
      }
    };

    const handleExistingUsers = (userIds: string[]) => {
      userIds.forEach((user) => {
        if (user !== userId && localStream) {
          createPeerConnection(userId, localStream);
        }
      });
    };

    const handleOffer = async (data: {
      fromId: string;
      offer: RTCSessionDescription;
    }) => {
      const pc =
        peerConnections.current[data.fromId] ||
        (await createPeerConnection(data.fromId, localStream!));
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { target: data.fromId, answer });
      console.log(`Received offer from ${data.fromId}`);
    };

    const handleAnswer = async (data: {
      fromId: string;
      answer: RTCSessionDescription;
    }) => {
      const pc = peerConnections.current[data.fromId];
      if (pc)
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log(`Received answer from ${data.fromId}`);
    };

    const handleIceCandidate = (data: {
      fromId: string;
      candidate: RTCIceCandidate;
    }) => {
      const pc = peerConnections.current[data.fromId];
      if (pc) pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      console.log(`Received ICE candidate from ${data.fromId}`);
    };

    const handleUserDisconnected = (userId: string) => {
      // Close the peer connection
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }

      // Update peers state
      // updatePeers(peersRef.current.filter(p => p.userId !== userId));
    };

    socket.on("user-connected", handleUserConnected);
    socket.on("existing-users", handleExistingUsers);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-disconnected", handleUserDisconnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("existing-users", handleExistingUsers);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-disconnected", handleUserDisconnected);
    };
  }, [localStream, userId]);

  // const updatePeers = (newPeers: iPeer[]) => {
  //   peersRef.current = newPeers;
  //   setPeers(newPeers);
  // };

  const createPeerConnection = async (
    userId: string,
    stream: MediaStream
  ): Promise<any> => {
    if (peerConnections.current[userId]) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local stream tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          target: userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setPeers((prev) => {
        const existing = prev.find((p) => p.userId === userId);
        if (existing) {
          return prev.map((p) =>
            p.userId === userId ? { ...p, stream: event.streams[0] } : p
          );
        }
        return [...prev, { userId, stream: event.streams[0] }];
      });
    };

    peerConnections.current[userId] = pc;

    // Only create offer if we're the "newer" connection
    if (socketRef.current.id && socketRef.current.id > userId) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("offer", {
        target: userId,
        offer,
      });
    }
    console.log(`Creating peer connection with ${userId}`);
  };

  const toggleAudio = () => {
    if (localStream) {
      const newState = !isMuted;
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = newState;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const newState = !isVideoOff;
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = newState;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    setPeers([]);
    setIsSetupComplete(false);
    socketRef.current.emit("leave-room", { roomId, userId });
  };

  return (
    <SocketContext.Provider
      value={{
        localStream,
        peers,
        isSetupComplete,
        setIsSetupComplete,
        toggleAudio,
        toggleVideo,
        isMuted,
        isVideoOff,
        leaveCall,
        getMediaStream,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketContextProvider");
  }
  return context;
};
