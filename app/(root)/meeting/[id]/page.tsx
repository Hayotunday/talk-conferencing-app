"use client";

import Loader from "@/components/Loader";
import MeetingRoom from "@/components/MeetingRoom";
import MeetingSetup from "@/components/MeetingSetup";
import { useUserStore } from "@/state/users";
import React, { useState } from "react";

const Meeting = ({ params: { id } }: { params: { id: string } }) => {
  const {
    user: { userid },
    isLoggedIn,
  } = useUserStore();
  const [isSetupComplete, setIsSetupComplete] = useState(true);
  // const { call, isCallLoading } = useGetCallbyId(id);

  if (!isLoggedIn) return <Loader />;

  console.log("id: ", id);

  return (
    <main className="h-screen w-full">
      {!isSetupComplete ? (
        <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
      ) : (
        <MeetingRoom roomId={id} userId={userid!} />
      )}
    </main>
  );
};

export default Meeting;
