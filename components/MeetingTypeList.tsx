"use client";

import React, { useState } from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import { homecardList } from "@/constants";
import MeetingModal from "./MeetingModal";

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();

  const createMeeting = () => {};

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        className={"bg-orange-1"}
        description={"Start and instant meeting"}
        handleClick={() => setMeetingState("isInstantMeeting")}
        img={"/icons/add-meeting.svg"}
        title={"New Meeting"}
      />
      <HomeCard
        className={"bg-blue-1"}
        description={"via invitaton link "}
        handleClick={() => setMeetingState("isJoiningMeeting")}
        img={"/icons/join-meeting.svg"}
        title={"Join Meeting"}
      />
      <HomeCard
        className={"bg-purple-1"}
        description={"Plan your meeting"}
        handleClick={() => setMeetingState("isScheduleMeeting")}
        img={"/icons/schedule.svg"}
        title={"Schedule Meeting"}
      />
      <HomeCard
        className={"bg-yellow-1"}
        description={"Check out your recordings"}
        handleClick={() => router.push("/recordings")}
        img={"/icons/recordings.svg"}
        title={"View recordings"}
      />

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;
