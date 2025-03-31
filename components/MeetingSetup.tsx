"use client";

import { Button } from "./ui/button";
import { useSocket } from "@/contexts/SocketContext";
import { useState } from "react";

export default function MeetingSetup() {
  const { setIsSetupComplete, localStream, getMediaStream } = useSocket();
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinMeeting = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await getMediaStream();

      if (!stream) {
        setError("Could not access camera/microphone");
        return;
      }

      // If user chose to join with devices off, stop the tracks
      if (isMicCamToggledOn) {
        stream.getTracks().forEach((track) => track.stop());
      }

      setIsSetupComplete(true);
    } catch (err) {
      setError("Failed to access media devices");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-2xl font-bold">Meeting Setup</h1>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="mic-cam-toggle"
          checked={isMicCamToggledOn}
          onChange={(e) => setIsMicCamToggledOn(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="mic-cam-toggle">Join with mic and camera off</label>
      </div>

      {error && (
        <div className="text-red-500 bg-red-500/10 p-2 rounded-md max-w-md text-center">
          {error}
          <div className="text-sm mt-1">
            Please allow permissions in your browser settings and refresh the
            page.
          </div>
        </div>
      )}

      <Button
        className="rounded-sm bg-green-500 px-4 py-2.5 hover:bg-green-600"
        onClick={handleJoinMeeting}
        disabled={isLoading}
      >
        {isLoading ? "Connecting..." : "Join Meeting"}
      </Button>

      <div className="text-sm text-gray-400 mt-4">
        Note: You'll need to allow camera and microphone access to join the
        meeting.
      </div>
    </div>
  );
}
