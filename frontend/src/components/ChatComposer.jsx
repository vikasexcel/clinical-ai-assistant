import { useMemo, useEffect } from "react";
import { formatDuration } from "../lib/formatDuration.js";
import { SampleScenarioMenu } from "./SampleScenarioMenu.jsx";
import { VoiceAudioPlayer } from "./VoiceAudioPlayer.jsx";

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
  const imagePreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );

  useEffect(() => {
    if (!imagePreviewUrl) {
      return undefined;
    }
    return () => URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  const handleRemoveImage = () => {
    onImageChange({ target: { files: [] } });
  };

  return (
    <div className="px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-5">
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <div className="flex flex-col gap-3 rounded-xl border border-clinical-border bg-clinical-elevated/80 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:px-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
            <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-clinical-muted" htmlFor="clinical-draft">
              Narrative &amp; context
            </label>
            <span className="text-[11px] text-clinical-muted/90 sm:text-right">Free text · Shift+Enter for newline</span>
          </div>
          <textarea
            id="clinical-draft"
            name="clinicalDraft"
            autoComplete="off"
            className="min-h-[120px] w-full resize-y rounded-lg border border-clinical-border-soft bg-clinical-surface px-3 py-2.5 text-[15px] leading-relaxed text-clinical-ink placeholder:text-clinical-muted/75 outline-none ring-0 focus:border-clinical-line/50 focus:ring-2 focus:ring-clinical-accent/15 sm:min-h-[160px] md:min-h-[180px]"
            onChange={onTextChange}
            placeholder="Chief complaint, interval history, exam findings, or rough bullets…"
            rows={6}
            value={text}
          />

          {imagePreviewUrl && (
            <div className="relative inline-block max-w-fit">
              <img
                src={imagePreviewUrl}
                alt="Attached preview"
                className="max-h-[120px] rounded-lg border border-clinical-border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-clinical-border bg-clinical-surface text-[11px] text-clinical-muted shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-800"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          )}

          {recorder.isRecording ? (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <span className="text-[13px] font-medium text-red-950">Recording</span>
              <span className="ml-auto tabular-nums text-[13px] text-red-800/80">
                {formatDuration(recorder.durationSeconds)}
              </span>
            </div>
          ) : null}

          {recorder.audioUrl && !recorder.isRecording ? (
            <div className="rounded-lg border border-clinical-border-soft bg-clinical-surface px-3 py-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-clinical-muted">
                  Voice attachment
                </span>
                <button
                  type="button"
                  onClick={recorder.clearRecording}
                  className="text-[12px] text-clinical-accent underline-offset-2 transition hover:underline"
                >
                  Remove
                </button>
              </div>
              <VoiceAudioPlayer src={recorder.audioUrl} />
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-clinical-border-soft pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1">
              <label className="cursor-pointer rounded-md px-2 py-1.5 text-[13px] text-clinical-muted transition hover:bg-clinical-surface hover:text-clinical-ink">
                <span className="sr-only">Attach image</span>
                <span aria-hidden="true">Image</span>
                <input accept="image/*" className="sr-only" onChange={onImageChange} type="file" />
              </label>
              {imageFile ? (
                <span className="max-w-[10rem] truncate text-[12px] text-clinical-muted" title={imageFile.name}>
                  {imageFile.name}
                </span>
              ) : null}

              <span className="text-clinical-border px-0.5" aria-hidden="true">
                ·
              </span>

              <button
                className="rounded-md px-2 py-1.5 text-[13px] text-clinical-muted transition hover:bg-clinical-surface hover:text-clinical-ink disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isSubmitting || !recorder.isSupported}
                onClick={recorder.isRecording ? recorder.stopRecording : recorder.startRecording}
                type="button"
              >
                {recorder.isRecording ? "Stop" : "Voice"}
              </button>
              {recorder.audioUrl && !recorder.isRecording ? null : (
                <button
                  className="rounded-md px-2 py-1.5 text-[13px] text-clinical-muted transition hover:bg-clinical-surface hover:text-clinical-ink disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isSubmitting || (!recorder.audioBlob && !recorder.isRecording)}
                  onClick={recorder.clearRecording}
                  type="button"
                >
                  Clear audio
                </button>
              )}

              <span className="text-clinical-border px-0.5" aria-hidden="true">
                ·
              </span>

              <SampleScenarioMenu
                disabled={isSubmitting}
                onSelectText={(value) => onTextChange({ target: { value } })}
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <button
                className="order-2 rounded-md px-2 py-2 text-[13px] text-clinical-muted transition hover:bg-clinical-surface hover:text-clinical-ink disabled:cursor-not-allowed disabled:opacity-40 sm:order-1 sm:py-1.5"
                disabled={isSubmitting}
                onClick={onReset}
                type="button"
              >
                Reset
              </button>
              <button
                className={`order-1 w-full rounded-lg px-4 py-3 text-[13px] font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-accent/40 focus-visible:ring-offset-2 sm:order-2 sm:w-auto sm:py-2.5 ${
                  isSubmitting
                    ? "cursor-wait bg-clinical-accent-hover text-clinical-on-accent"
                    : !canSubmit
                      ? "cursor-not-allowed bg-slate-200 text-slate-700"
                      : "bg-clinical-accent text-clinical-on-accent hover:bg-clinical-accent-hover"
                }`}
                disabled={isSubmitting || !canSubmit}
                type="submit"
              >
                {isSubmitting ? "Generating…" : "Generate documentation"}
              </button>
            </div>
          </div>
        </div>

        {recorder.error ? (
          <p className="text-[12px] text-red-700">{recorder.error}</p>
        ) : null}

        <p className="text-[11px] leading-snug text-clinical-muted">
          Draft only — verify clinical content and codes before saving to the chart.
        </p>
      </form>
    </div>
  );
}
