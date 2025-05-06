import { ReactNode } from "react";
import { SocketContextProvider } from "@/contexts/SocketContext";

interface MeetingProps {
  children: ReactNode;
}

export default function MeetingProvider({ children }: MeetingProps) {
  return <SocketContextProvider>{children}</SocketContextProvider>;
}
