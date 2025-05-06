"use client";

import { Button } from "./ui/button";
import { useSocket } from "@/contexts/SocketContext";
import { useState, useRef, useEffect } from "react";

interface DeviceInfo {
  deviceId: string;
  kind: MediaDeviceKind;
  label: string;
  groupId: string;
}

export default function MeetingSetup() {
  const { setIsSetupComplete, getMediaStream } = useSocket();
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPreview, setHasPreview] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<{
    cameras: DeviceInfo[];
    mics: DeviceInfo[];
  }>({ cameras: [], mics: [] });
  const [selectedCamera, setSelectedCamera] = useState<string>("default");
  const [selectedMic, setSelectedMic] = useState<string>("default");

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof DOMException) {
      switch (error.name) {
        case "NotAllowedError":
          return "Permissions denied. Please allow camera/microphone access";
        case "NotFoundError":
          return "No media devices found";
        case "NotReadableError":
          return "Camera/mic is already in use by another application";
        case "OverconstrainedError":
          return "Requested settings not supported by your device";
        default:
          return `Device error: ${error.message}`;
      }
    }
    return "Failed to access media devices";
  };

  // List available devices
  useEffect(() => {
    const listDevices = async () => {
      try {
        // Need to get media access first to get proper device labels
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();

        const cameras = devices.filter((d) => d.kind === "videoinput");
        const mics = devices.filter((d) => d.kind === "audioinput");

        setAvailableDevices({
          cameras: cameras.map((d) => ({
            deviceId: d.deviceId,
            kind: d.kind,
            label: d.label,
            groupId: d.groupId,
          })),
          mics: mics.map((d) => ({
            deviceId: d.deviceId,
            kind: d.kind,
            label: d.label,
            groupId: d.groupId,
          })),
        });
      } catch (err) {
        console.error("Device enumeration error:", err);
      }
    };

    listDevices();
  }, []);

  // Initialize preview with selected devices
  useEffect(() => {
    let stream: MediaStream | null = null;

    const initPreview = async () => {
      try {
        // Stop any existing stream first
        if (previewStreamRef.current) {
          previewStreamRef.current
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop());
        }

        const constraints = {
          video:
            selectedCamera === "default"
              ? true
              : { deviceId: { exact: selectedCamera } },
          audio:
            selectedMic === "default"
              ? false // Don't use audio in preview to avoid echo
              : { deviceId: { exact: selectedMic } },
        };

        stream = await navigator.mediaDevices
          .getUserMedia(constraints)
          .catch(async () => {
            // Fallback to default device if selected device fails
            return await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPreview(true);
          setError(null);
          previewStreamRef.current = stream;
        }
      } catch (err) {
        console.error("Preview initialization error:", err);
        setError(getErrorMessage(err));
        setHasPreview(false);
      }
    };

    initPreview();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [selectedCamera, selectedMic]);

  const handleJoinMeeting = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Release preview stream (we'll get a fresh one for the call)
      if (previewStreamRef.current) {
        previewStreamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }

      // Get fresh stream with both audio and video
      const streamPromise = getMediaStream();
      const stream =
        streamPromise instanceof Promise
          ? await streamPromise.catch(async () => {
              // Fallback to basic constraints if ideal fails
              return await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
              });
            })
          : streamPromise;

      if (!stream) {
        throw new Error("Could not access any media devices");
      }

      // Handle mute states
      if (isMicCamToggledOn) {
        stream
          .getAudioTracks()
          .forEach((track: MediaStreamTrack) => (track.enabled = false));
        stream
          .getVideoTracks()
          .forEach((track: MediaStreamTrack) => (track.enabled = false));
      }

      setIsSetupComplete(true);
    } catch (err) {
      console.error("Meeting join error:", err);
      setError(getErrorMessage(err));

      // Attempt to restore preview
      try {
        const preview = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = preview;
          previewStreamRef.current = preview;
        }
      } catch (previewErr) {
        console.error("Preview recovery failed:", previewErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-white p-4">
      <h1 className="text-2xl font-bold">Meeting Setup</h1>

      {/* Preview Video */}
      {/* <div className="relative w-full max-w-xl aspect-video rounded-md bg-black overflow-hidden">
        {hasPreview ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-xl">?</span>
            </div>
          </div>
        )}
      </div> */}

      {/* Device Selection */}
      <div className="w-full max-w-xl space-y-3">
        {availableDevices.cameras.length > 1 && (
          <div>
            <label className="block text-sm mb-1">Camera:</label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded"
              disabled={isLoading}
            >
              <option value="default">Default Camera</option>
              {availableDevices.cameras.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {availableDevices.mics.length > 1 && (
          <div>
            <label className="block text-sm mb-1">Microphone:</label>
            <select
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded"
              disabled={isLoading}
            >
              <option value="default">Default Microphone</option>
              {availableDevices.mics.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="mic-cam-toggle"
            checked={isMicCamToggledOn}
            onChange={(e) => setIsMicCamToggledOn(e.target.checked)}
            className="w-4 h-4"
            disabled={isLoading}
          />
          <label htmlFor="mic-cam-toggle">Join with mic and camera off</label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-xl text-red-500 bg-red-500/10 p-3 rounded-md text-center">
          {error}
          <div className="text-sm mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-red-400 hover:text-red-300"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )}

      {/* Join Button */}
      <Button
        className="rounded-sm bg-green-600 hover:bg-green-700 px-6 py-3 text-lg"
        onClick={handleJoinMeeting}
        // disabled={isLoading || (!hasPreview && !error)}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Connecting...
          </span>
        ) : (
          "Join Meeting"
        )}
      </Button>

      {/* Help Text */}
      <div className="text-sm text-gray-400 mt-2 text-center max-w-xl">
        {hasPreview
          ? "You'll enter the meeting with the devices shown above"
          : "Please allow camera/microphone access to continue"}
      </div>
    </div>
  );
}
