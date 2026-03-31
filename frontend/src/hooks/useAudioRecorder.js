import { useEffect, useRef, useState } from "react";

function getRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const preferredTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];

  return preferredTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || "";
}

export function useAudioRecorder() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);

  const isSupported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined";

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopTracks() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }

  function resetRecording() {
    setAudioBlob(null);
    setDurationSeconds(0);
    setError("");

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }
  }

  async function startRecording() {
    if (!isSupported) {
      setError("This browser does not support microphone recording.");
      return;
    }

    try {
      resetRecording();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getRecordingMimeType();
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      chunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      startedAtRef.current = Date.now();
      setIsRecording(true);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        setError("Recording failed. Please try again.");
        setIsRecording(false);
        clearTimer();
        stopTracks();
      };

      mediaRecorder.onstop = () => {
        const nextBlob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        setAudioBlob(nextBlob);
        setAudioUrl(URL.createObjectURL(nextBlob));
        setIsRecording(false);
        clearTimer();
        stopTracks();
      };

      timerRef.current = window.setInterval(() => {
        const elapsedSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
        setDurationSeconds(elapsedSeconds);
      }, 250);

      mediaRecorder.start();
    } catch {
      setError("Microphone access was not granted.");
      setIsRecording(false);
      clearTimer();
      stopTracks();
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }

    mediaRecorderRef.current.stop();
  }

  function clearRecording() {
    if (isRecording) {
      stopRecording();
    }

    clearTimer();
    stopTracks();
    mediaRecorderRef.current = null;
    resetRecording();
  }

  useEffect(() => {
    return () => {
      clearTimer();
      stopTracks();

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    audioBlob,
    audioUrl,
    durationSeconds,
    error,
    isRecording,
    isSupported,
    clearRecording,
    startRecording,
    stopRecording,
  };
}
