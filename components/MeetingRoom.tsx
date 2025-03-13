"use client";

import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import Peer from "peerjs";

interface MeetingRoomProps {
  roomId: string; // room id
  userId: string; // user id
}

export default function VideoCall({ roomId, userId }: MeetingRoomProps) {
  useEffect(() => {
    socket.emit("join-room", { roomId, userId });
  }, [roomId, userId]);

  return (
    <div className="text-white text-center w-full h-full">
      <h2 className="w-full">Room: {roomId}</h2>
      <h2 className="w-full">user: {userId}</h2>
      {/* <video ref={} autoPlay playsInline></video>
      <video ref={} autoPlay playsInline></video> */}
    </div>
  );
}
