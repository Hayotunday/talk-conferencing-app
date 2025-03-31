"use client";

import { useSocket } from "@/contexts/SocketContext";
import VideoParticipant from "./VideoParticipant";
import Controls from "./Controls";

export default function MeetingRoom({ roomId }: { roomId: string }) {
  const { localStream, peers } = useSocket();

  console.log("peers: ", peers);
  const gridClass =
    peers.length <= 1
      ? "grid-cols-1"
      : peers.length <= 4
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className={`flex-grow p-4 grid ${gridClass} gap-4`}>
        {localStream && (
          <VideoParticipant stream={localStream} isLocal name="You" />
        )}
        {peers.map((peer) => (
          <VideoParticipant
            key={peer.userId}
            stream={peer.stream}
            name={`User ${peer.userId.slice(0, 4)}`}
          />
        ))}
      </div>
      <Controls />
    </div>
  );
}
