import { useMemo, useEffect } from "react";
import { formatDuration } from "../lib/formatDuration.js";
import { SampleScenarioMenu } from "./SampleScenarioMenu.jsx";
import { VoiceAudioPlayer } from "./VoiceAudioPlayer.jsx";

function CameraIcon({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const secondaryBtn =
  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d1d5db] bg-white px-3.5 text-[14px] font-medium text-gray-800 shadow-none transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00685b]/25 disabled:cursor-not-allowed disabled:opacity-40";

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
    <div className="w-full">
      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        <textarea
          id="clinical-draft"
          name="clinicalDraft"
          autoComplete="off"
          className="min-h-[280px] w-full resize-y rounded-lg border border-[#d1d5db] bg-white px-4 py-3.5 text-[15px] leading-relaxed text-gray-900 placeholder:text-[#9ca3af] outline-none ring-0 focus:border-[#00685b]/40 focus:ring-2 focus:ring-[#00685b]/15"
          onChange={onTextChange}
          placeholder="Paste clinical notes here, or use camera/voice to capture..."
          rows={10}
          value={text}
        />

        {imagePreviewUrl ? (
          <div className="relative inline-block max-w-fit">
            <img
              src={imagePreviewUrl}
              alt="Attached preview"
              className="max-h-[120px] rounded-lg border border-[#d1d5db]"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#d1d5db] bg-white text-[11px] text-gray-600 shadow-sm transition hover:bg-red-50 hover:text-red-800"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        ) : null}

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
          <div className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#6b7280]">
                Voice attachment
              </span>
              <button
                type="button"
                onClick={recorder.clearRecording}
                className="text-[12px] text-[#00685b] underline-offset-2 transition hover:underline"
              >
                Remove
              </button>
            </div>
            <VoiceAudioPlayer src={recorder.audioUrl} />
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className={secondaryBtn}>
              <CameraIcon className="shrink-0 text-gray-700" />
              <span>Camera</span>
              <input accept="image/*" capture="environment" className="sr-only" onChange={onImageChange} type="file" />
            </label>

            <button
              className={secondaryBtn}
              disabled={isSubmitting || !recorder.isSupported}
              onClick={recorder.isRecording ? recorder.stopRecording : recorder.startRecording}
              type="button"
            >
              <MicIcon className="shrink-0 text-gray-700" />
              {recorder.isRecording ? "Stop" : "Dictate"}
            </button>

            <SampleScenarioMenu disabled={isSubmitting} onSelectText={(value) => onTextChange({ target: { value } })} />
          </div>

          <button
            className={`h-10 shrink-0 rounded-lg px-6 text-[14px] font-semibold text-white shadow-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00685b]/35 focus-visible:ring-offset-2 sm:min-w-[9.5rem] ${
              isSubmitting
                ? "cursor-wait bg-[#7eb4ad]"
                : !canSubmit
                  ? "cursor-not-allowed bg-[#d1d5db] text-white"
                  : "bg-[#93c5be] hover:bg-[#7eb4ad]"
            }`}
            disabled={isSubmitting || !canSubmit}
            type="submit"
          >
            {isSubmitting ? "Analyzing…" : "Analyze Notes"}
          </button>
        </div>

        {canSubmit ? (
          <button
            className="self-start text-[12px] text-[#9ca3af] underline-offset-2 transition hover:text-[#6b7280] hover:underline"
            disabled={isSubmitting}
            onClick={onReset}
            type="button"
          >
            Clear draft
          </button>
        ) : null}

        {recorder.error ? <p className="text-[12px] text-red-700">{recorder.error}</p> : null}

        <p className="text-[11px] leading-snug text-[#9ca3af]">
          Draft only — verify clinical content and codes before saving to the chart.
        </p>
      </form>
    </div>
  );
}
