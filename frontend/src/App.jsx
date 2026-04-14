import { useState } from "react";

import { ChatComposer } from "./components/ChatComposer.jsx";
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
  const hasOutput = messages.length > 0;

  return (
    <>
      <a
        className="absolute left-4 top-4 z-50 -translate-y-[200%] rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00685b]/35"
        href="#main-content"
      >
        Skip to main content
      </a>

      <div className="flex min-h-dvh flex-col bg-[#f9fafb]">
        <div className="mx-auto flex w-full max-w-[52rem] flex-1 flex-col px-5 pb-12 pt-10 sm:px-8 sm:pt-12">
          <header className="mb-5 sm:mb-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[1.875rem]">
                  <span className="text-[#00685b]">MedClaim</span>
                  <span className="text-gray-900"> AI</span>
                </h1>
                <p className="mt-1.5 max-w-xl text-[0.9375rem] leading-snug text-[#6b7280]">
                  Psychiatric billing assistant — structure notes, suggest codes, check risk
                </p>
              </div>
              {hasOutput ? (
                <button
                  className="shrink-0 rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-[13px] font-medium text-[#6b7280] transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Clear session and start over"
                  disabled={isSubmitting}
                  onClick={handleClearChat}
                  type="button"
                >
                  Clear session
                </button>
              ) : null}
            </div>
          </header>

          <main id="main-content" className="flex min-h-0 flex-1 flex-col">
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

            {activeStatusMessage ? (
              <div className="mt-5 border-t border-[#e5e7eb] pt-4">
                <StatusBanner message={activeStatusMessage} tone={recorder.error ? "error" : statusTone} />
              </div>
            ) : null}

            {hasOutput ? (
              <div className="mt-5 min-h-0 flex-1">
                <ChatThread messages={messages} />
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}
