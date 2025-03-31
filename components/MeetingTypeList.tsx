"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomeCard from "./HomeCard";
import MeetingModal from "./MeetingModal";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ReactDatePicker from "react-datepicker";
import { useUserStore } from "@/state/users";
import { createNewMeeting } from "@/actions/firebase.action";

const MeetingTypeList = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();
  const [meetingId, setMeetingId] = useState<string>("");
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const {
    isLoggedIn,
    user: { userid },
  } = useUserStore();

  const createMeeting = async () => {
    if (!isLoggedIn) return;

    try {
      if (!values.dateTime) {
        toast({
          title: "Please select a date and time for your meeting.",
        });
        return;
      }

      const meeting = await createNewMeeting(userid!);
      console.log("meeting: ", meeting);
      setMeetingId(meeting.meetingId!);

      if (!values.description) {
        router.push(`/meeting/${meeting.meetingId}`);
      }

      toast({
        title: "Meeting Created!",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to create meeting!",
      });
    }
  };

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}`;

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
        description={"via invitaton link"}
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

      {/* Modal for Schedule Meeting */}
      {!meetingId ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2 5">
            <label className="text-base text-normal leading-[22px] text-sky-2">
              Add a description
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => {
                setValues({ ...values, description: e.target.value });
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-2 5">
            <label className="text-base text-normal leading-[22px] text-sky-2">
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat={"MMMM d, yyyy h:mm aa"}
              className="w-full rounded bg-dark-3 p-2 focus:outline-none"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          className="text-center"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: "Link copied" });
          }}
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          buttonText="Copy Meeting Link"
        />
      )}

      {/* Modal for Start Instant Meeting */}
      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={() => router.push(`/meeting/${meetingId}`)}
        isInstantMeeting
        instantText={meetingLink}
        instantAction={() => {
          setValues({ ...values, description: "Instant meeting" });
          createMeeting();
        }}
        instantHandleClick={() => {
          navigator.clipboard.writeText(meetingLink);
          toast({ title: "Link copied" });
        }}
      />

      {/* Modal for Join Meeting */}
      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Enter Meeting Link"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting Link"
          className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
        />
      </MeetingModal>
    </section>
  );
};

export default MeetingTypeList;
