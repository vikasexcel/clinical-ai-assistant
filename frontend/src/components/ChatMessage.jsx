import { useEffect, useState } from "react";

import { StructuredResult } from "./StructuredResult.jsx";
import { VoiceAudioPlayer } from "./VoiceAudioPlayer.jsx";

/** Phases shown while the clinical API drafts structured documentation (UX-only; not tied to server events). */
const CLINICAL_LOADING_STEPS = [
  "Parsing encounter notes, voice, and attachments…",
  "Structuring documentation, problem list, and coding context…",
  "Screening for safety risks, interactions, and red flags…",
  "Drafting clinical guidance for clinician review…",
];

const STEP_ADVANCE_MS = 2300;

function StepBadge({ index, phase }) {
  const isDone = index < phase;
  const isActive = index === phase;

  if (isDone) {
    return (
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-clinical-accent/35 bg-clinical-accent-soft text-[13px] font-semibold text-clinical-accent"
        aria-hidden="true"
      >
        ✓
      </span>
    );
  }

  if (isActive) {
    return (
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clinical-accent text-[13px] font-semibold text-white shadow-sm"
        aria-hidden="true"
      >
        {index + 1}
      </span>
    );
  }

  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-clinical-border bg-clinical-elevated text-[13px] font-medium text-clinical-muted"
      aria-hidden="true"
    >
      {index + 1}
    </span>
  );
}

function StepSkeleton() {
  return (
    <div className="mt-3 flex flex-col gap-2" aria-hidden="true">
      <div className="h-2 w-full max-w-[14rem] animate-pulse rounded-full bg-clinical-border-soft" />
      <div className="h-2 w-full max-w-[11rem] animate-pulse rounded-full bg-clinical-border-soft" />
      <div className="h-2 w-full max-w-[9rem] animate-pulse rounded-full bg-clinical-border-soft" />
    </div>
  );
}

/** Read-only intake display — form-adjacent, not a chat bubble */
function IntakeRecord({ text, imageFileName, hasAudio, audioDurationLabel, audioPreviewUrl }) {
  const hasText = text.trim().length > 0;
  const meta = [imageFileName ? imageFileName : null].filter(Boolean);

  return (
    <article className="min-w-0" aria-label="Source intake">
      <div className="rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3 text-[15px] leading-relaxed text-slate-900">
        {meta.length > 0 ? (
          <p className="mb-2 border-b border-slate-200/80 pb-2 font-mono text-[12px] text-slate-600">{meta.join(" · ")}</p>
        ) : null}

        {hasText ? (
          <p className="whitespace-pre-wrap">{text.trim()}</p>
        ) : null}

        {hasAudio && audioPreviewUrl ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500">
              Voice attachment · {audioDurationLabel}
            </p>
            <VoiceAudioPlayer src={audioPreviewUrl} />
          </div>
        ) : hasAudio ? (
          <p className="text-[12px] text-slate-600">Voice {audioDurationLabel}</p>
        ) : null}

        {!hasText && !hasAudio && !imageFileName ? (
          <p className="italic text-slate-500">Image or attachment only</p>
        ) : null}
      </div>
    </article>
  );
}

function AssistantLoading() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((previous) =>
        previous < CLINICAL_LOADING_STEPS.length - 1 ? previous + 1 : previous,
      );
    }, STEP_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, []);

  const activeLabel = CLINICAL_LOADING_STEPS[phase] ?? CLINICAL_LOADING_STEPS[0];

  return (
    <div className="w-full min-w-0">
      <div
        className="w-full rounded-xl border border-clinical-border bg-clinical-elevated/60 px-4 py-4 sm:px-5 sm:py-5"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <p className="sr-only">Current step: {activeLabel}</p>
        <ol className="m-0 flex list-none flex-col gap-0 p-0">
          {CLINICAL_LOADING_STEPS.map((label, index) => {
            const isDone = index < phase;
            const isActive = index === phase;
            const isLast = index === CLINICAL_LOADING_STEPS.length - 1;

            return (
              <li key={label} className="relative flex gap-3.5 pb-4 last:pb-0">
                {!isLast ? (
                  <div
                    className="pointer-events-none absolute bottom-0 left-[14px] top-[2rem] z-0 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-clinical-border via-clinical-border-soft to-transparent"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative z-10 flex w-7 shrink-0 justify-center">
                  <StepBadge index={index} phase={phase} />
                </div>

                <div className="relative z-10 min-w-0 flex-1 pt-0.5">
                  <p
                    className={`text-[15px] leading-[1.45] ${
                      isActive
                        ? "font-medium text-clinical-ink"
                        : isDone
                          ? "font-normal text-clinical-muted"
                          : "font-normal text-clinical-muted/70"
                    }`}
                  >
                    {label}
                  </p>
                  {isActive ? <StepSkeleton /> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function AssistantError({ message }) {
  return (
    <div
      className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-950"
      role="alert"
    >
      {message}
    </div>
  );
}

export function ChatMessage({ message, hideLabels = false }) {
  if (message.role === "user") {
    return (
      <IntakeRecord
        audioDurationLabel={message.audioDurationLabel}
        audioPreviewUrl={message.audioPreviewUrl}
        hasAudio={message.hasAudio}
        imageFileName={message.imageFileName}
        text={message.text}
      />
    );
  }

  if (message.role === "assistant") {
    if (message.pending) {
      return (
        <div className="min-w-0 w-full">
          {hideLabels ? null : (
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-clinical-muted">Processing</p>
          )}
          <AssistantLoading />
        </div>
      );
    }
    if (message.error) {
      return <AssistantError message={message.error} />;
    }
    if (message.result) {
      return (
        <div className="min-w-0 w-full">
          {hideLabels ? null : (
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-clinical-muted">Structured output</p>
          )}
          <StructuredResult result={message.result} />
        </div>
      );
    }
  }

  return null;
}
