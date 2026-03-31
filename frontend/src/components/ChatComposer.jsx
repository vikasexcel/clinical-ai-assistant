import { useState, useEffect } from "react";
import { formatDuration } from "../lib/formatDuration.js";

export function ChatComposer({
  imageFile,
  isSubmitting,
  onImageChange,
  onReset,
  onSubmit,
  onTextChange,
  recorder,
  text,
}) {
  const canSubmit = Boolean(text.trim() || imageFile || recorder.audioBlob);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [imageFile]);

  const handleRemoveImage = () => {
    onImageChange({ target: { files: [] } });
    setImagePreviewUrl(null);
  };

  return (
    <div className="shrink-0 border-t border-chat-border bg-chat-bg">
      <div className="mx-auto w-full max-w-3xl px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-4">
        <form className="flex flex-col gap-2" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2 rounded-2xl border border-chat-border bg-chat-surface px-3 py-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] sm:px-4">
            <label className="sr-only" htmlFor="clinical-draft">
              Message
            </label>
            <textarea
              id="clinical-draft"
              name="clinicalDraft"
              autoComplete="off"
              className="max-h-[min(40vh,200px)] min-h-[44px] w-full resize-none border-0 bg-transparent text-[15px] leading-relaxed text-white placeholder:text-chat-muted outline-none ring-0"
              onChange={onTextChange}
              placeholder="Message…"
              rows={1}
              value={text}
            />

            {imagePreviewUrl && (
              <div className="relative inline-block max-w-fit">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="max-h-[120px] rounded-lg border border-white/10"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-chat-bg text-[11px] text-white transition hover:bg-red-500/20 hover:text-red-300"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <label className="cursor-pointer rounded-lg px-2 py-1.5 text-[13px] text-chat-muted transition hover:bg-white/5 hover:text-white">
                  <span className="sr-only">Attach image</span>
                  <span aria-hidden="true">Image</span>
                  <input accept="image/*" className="sr-only" onChange={onImageChange} type="file" />
                </label>
                {imageFile ? (
                  <span className="max-w-[10rem] truncate text-[12px] text-chat-muted" title={imageFile.name}>
                    {imageFile.name}
                  </span>
                ) : null}

                <span className="text-white/15" aria-hidden="true">
                  ·
                </span>

                <button
                  className="rounded-lg px-2 py-1.5 text-[13px] text-chat-muted transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isSubmitting || !recorder.isSupported}
                  onClick={recorder.isRecording ? recorder.stopRecording : recorder.startRecording}
                  type="button"
                >
                  {recorder.isRecording ? "Stop" : "Voice"}
                </button>
                <button
                  className="rounded-lg px-2 py-1.5 text-[13px] text-chat-muted transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isSubmitting || (!recorder.audioBlob && !recorder.isRecording)}
                  onClick={recorder.clearRecording}
                  type="button"
                >
                  Clear audio
                </button>
                <span className="text-[12px] text-chat-muted/90">
                  {recorder.isSupported
                    ? recorder.isRecording
                      ? formatDuration(recorder.durationSeconds)
                      : recorder.audioBlob
                        ? formatDuration(recorder.durationSeconds)
                        : null
                    : null}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg px-2 py-1.5 text-[13px] text-chat-muted transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isSubmitting}
                  onClick={onReset}
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="rounded-lg bg-chat-accent px-3.5 py-1.5 text-[13px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isSubmitting || !canSubmit}
                  type="submit"
                >
                  {isSubmitting ? "…" : "Send"}
                </button>
              </div>
            </div>
          </div>

          {recorder.audioUrl ? (
            <audio className="h-8 w-full max-w-md" controls preload="metadata" src={recorder.audioUrl}>
              Your browser does not support audio playback.
            </audio>
          ) : null}

          {recorder.error && (
            <p className="px-1 text-center text-[12px] text-red-300/90">
              {recorder.error}
            </p>
          )}

          <p className="px-1 text-center text-[11px] text-chat-muted">
            Draft only — verify clinical content and codes before use.
          </p>
        </form>
      </div>
    </div>
  );
}
