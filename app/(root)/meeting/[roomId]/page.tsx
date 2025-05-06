"use client";

import MeetingRoom from "@/components/MeetingRoom";
import MeetingProvider from "@/contexts/MeetingProvider";

export default function Meeting({
  params: { roomId },
}: {
  params: { roomId: string };
}) {
  return (
    <MeetingProvider>
      <MeetingRoom roomId={roomId} />
    </MeetingProvider>
  );
}
