"use client";

import { useEffect, useRef } from "react";

interface VideoParticipantProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  name: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export default function VideoParticipant({
  stream,
  isLocal = false,
  name,
  isMuted,
  isVideoOff,
}: VideoParticipantProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-800">
      {!stream || isVideoOff ? (
        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-2xl">{name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        {name}
        {isLocal && (
          <>
            {isMuted && <span className="ml-2">🔇</span>}
            {isVideoOff && <span className="ml-2">📷❌</span>}
          </>
        )}
      </div>
    </div>
  );
}
