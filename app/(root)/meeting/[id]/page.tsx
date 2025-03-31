"use client";

import MeetingRoom from "@/components/MeetingRoom";
import MeetingSetup from "@/components/MeetingSetup";
import MeetingProvider from "@/provider/MeetingProvider";
import { useSocket } from "@/contexts/SocketContext";

const MeetingContent = ({ roomId }: { roomId: string }) => {
  const { isSetupComplete } = useSocket();

  return (
    <main className="h-screen w-full">
      {!isSetupComplete ? <MeetingSetup /> : <MeetingRoom roomId={roomId} />}
    </main>
  );
};

export default function Meeting({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <MeetingProvider roomId={id}>
      <MeetingContent roomId={id} />
    </MeetingProvider>
  );
}
