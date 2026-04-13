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
        className="absolute left-4 top-4 z-50 -translate-y-[200%] rounded-lg border border-clinical-border bg-clinical-surface px-3 py-2 text-sm text-clinical-ink shadow-sm transition focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-accent/35"
        href="#main-content"
      >
        Skip to main content
      </a>

      <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-transparent">
        <ChatHeader disableNewChat={isSubmitting} onNewChat={handleClearChat} />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Left: encounter intake (form workspace — not a chat composer dock) */}
          <aside className="flex max-h-[min(52svh,28rem)] min-h-0 shrink-0 flex-col overflow-hidden border-b border-clinical-border-soft bg-clinical-surface/90 lg:max-h-none lg:w-[min(100%,26rem)] lg:shrink-0 lg:border-b-0 lg:border-r lg:pt-0">
            <div className="shrink-0 border-b border-clinical-border-soft px-4 py-3 sm:px-5 sm:py-4 lg:border-b-0 lg:pt-5">
              <h2 className="font-display text-[1.15rem] font-semibold tracking-tight text-clinical-ink">
                Encounter intake
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-clinical-muted">
                Add free-text notes, an image, or a voice clip. This is structured like a documentation form, not a chat thread.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
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
            </div>
          </aside>

          {/* Right: documentation output (chart-style preview pane) */}
          <main
            id="main-content"
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-clinical-bg/40"
          >
            {activeStatusMessage ? (
              <div className="shrink-0 border-b border-clinical-border-soft bg-clinical-surface/60 px-3 py-2.5 sm:px-6 sm:py-3">
                <StatusBanner message={activeStatusMessage} tone={recorder.error ? "error" : statusTone} />
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth overscroll-y-contain">
              <ChatThread messages={messages} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
