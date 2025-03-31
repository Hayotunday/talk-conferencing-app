"use client";

import { useSocket } from "@/contexts/SocketContext";

export default function Controls() {
  const { toggleAudio, toggleVideo, isMuted, isVideoOff, leaveCall } =
    useSocket();

  return (
    <div className="p-4 bg-gray-800 flex justify-center space-x-4">
      <button
        onClick={toggleAudio}
        className={`p-3 rounded-full ${isMuted ? "bg-red-500" : "bg-gray-600"}`}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? "🔇" : "🎤"}
      </button>
      <button
        onClick={toggleVideo}
        className={`p-3 rounded-full ${
          isVideoOff ? "bg-red-500" : "bg-gray-600"
        }`}
        aria-label={isVideoOff ? "Enable video" : "Disable video"}
      >
        {isVideoOff ? "📷❌" : "📷"}
      </button>
      <button
        onClick={leaveCall}
        className="p-3 rounded-full bg-red-600"
        aria-label="Leave call"
      >
        🚪 Leave
      </button>
    </div>
  );
}
