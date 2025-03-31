"use client";

import { ReactNode } from "react";
import { useUserStore } from "@/state/users";
import { SocketContextProvider } from "@/contexts/SocketContext";

interface MeetingProps {
  children: ReactNode;
  roomId: string;
}

export default function MeetingProvider({ children, roomId }: MeetingProps) {
  const {
    user: { userid },
  } = useUserStore();

  return (
    <SocketContextProvider roomId={roomId} userId={userid!}>
      {children}
    </SocketContextProvider>
  );
}
