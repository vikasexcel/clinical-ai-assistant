import { useState } from "react";

import { ChatComposer } from "./components/ChatComposer.jsx";
import { ChatHeader } from "./components/ChatHeader.jsx";
import { ChatThread } from "./components/ChatThread.jsx";
import { StatusBanner } from "./components/StatusBanner.jsx";
import { useAudioRecorder } from "./hooks/useAudioRecorder.js";
import { formatDuration } from "./lib/formatDuration.js";
import { submitClinicalDraft } from "./lib/api.js";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recorder = useAudioRecorder();

  async function handleSubmit(event) {
    event.preventDefault();
    const draftText = text;
    const draftImage = imageFile;
    const audioBlob = recorder.audioBlob;
    const audioDurationSeconds = recorder.durationSeconds;

    if (!draftText.trim() && !draftImage && !audioBlob) {
      return;
    }

    const userMessage = {
      id: createId(),
      role: "user",
      text: draftText,
      imageFileName: draftImage?.name ?? null,
      hasAudio: Boolean(audioBlob),
      audioDurationLabel: formatDuration(audioDurationSeconds),
      audioPreviewUrl: audioBlob ? URL.createObjectURL(audioBlob) : null,
    };

    const loadingId = createId();
    const loadingMessage = { id: loadingId, role: "assistant", pending: true };

    setMessages((previous) => [...previous, userMessage, loadingMessage]);
    setStatus("");
    setIsSubmitting(true);

    // Clear composer immediately so the textarea is ready for the next message while the request runs.
    setText("");
    setImageFile(null);

    try {
      const response = await submitClinicalDraft({
        text: draftText,
        audioBlob,
        imageFile: draftImage,
      });

      setMessages((previous) =>
        previous.map((message) =>
          message.id === loadingId ? { id: loadingId, role: "assistant", result: response } : message,
        ),
      );
      recorder.clearRecording();
      setStatus("Ready — review before saving to the chart.");
    } catch (error) {
      setMessages((previous) =>
        previous.map((message) =>
          message.id === loadingId ? { id: loadingId, role: "assistant", error: error.message } : message,
        ),
      );
      setText(draftText);
      setImageFile(draftImage);
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setText("");
    setImageFile(null);
    setStatus("");
    recorder.clearRecording();
  }

  function handleImageChange(event) {
    setImageFile(event.target.files?.[0] || null);
  }

  function handleTextChange(event) {
    setText(event.target.value);
  }

  function handleClearChat() {
    setMessages((previous) => {
      for (const message of previous) {
        if (message.audioPreviewUrl) {
          URL.revokeObjectURL(message.audioPreviewUrl);
        }
      }
      return [];
    });
    setStatus("");
    handleReset();
  }

  const activeStatusMessage = recorder.error || status;
  const statusTone = recorder.error ? "error" : status ? "success" : "info";

  return (
    <>
      <a
        className="absolute left-4 top-4 z-50 -translate-y-[200%] rounded-lg border border-chat-border bg-chat-surface px-3 py-2 text-sm text-white transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white/20"
        href="#main-content"
      >
        Skip to main content
      </a>

      <div className="flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-chat-bg">
        <ChatHeader disableNewChat={isSubmitting} onNewChat={handleClearChat} />

        <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activeStatusMessage ? (
            <div className="mx-auto w-full max-w-3xl shrink-0 px-3 pt-2 sm:px-4">
              <StatusBanner message={activeStatusMessage} tone={recorder.error ? "error" : statusTone} />
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth overscroll-y-contain">
            <ChatThread messages={messages} />
          </div>

          <ChatComposer
            imageFile={imageFile}
            isSubmitting={isSubmitting}
            onImageChange={handleImageChange}
            onReset={handleReset}
            onSubmit={handleSubmit}
            onTextChange={handleTextChange}
            recorder={recorder}
            text={text}
          />
        </main>
      </div>
    </>
  );
}
