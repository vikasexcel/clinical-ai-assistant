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
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-chat-accent/45 bg-chat-accent/15 text-[13px] font-semibold text-chat-accent"
        aria-hidden="true"
      >
        ✓
      </span>
    );
  }

  if (isActive) {
    return (
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chat-accent text-[13px] font-semibold text-white shadow-[0_0_0_1px_rgba(16,163,127,0.35)]"
        aria-hidden="true"
      >
        {index + 1}
      </span>
    );
  }

  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-chat-border bg-chat-elevated/80 text-[13px] font-medium text-chat-muted"
      aria-hidden="true"
    >
      {index + 1}
    </span>
  );
}

function StepSkeleton() {
  return (
    <div className="mt-3 flex flex-col gap-2" aria-hidden="true">
      <div className="h-2 w-full max-w-[14rem] rounded-full bg-white/[0.14] animate-pulse" />
      <div className="h-2 w-full max-w-[11rem] rounded-full bg-white/[0.11] animate-pulse" />
      <div className="h-2 w-full max-w-[9rem] rounded-full bg-white/[0.09] animate-pulse" />
    </div>
  );
}

function UserBubble({ text, imageFileName, hasAudio, audioDurationLabel, audioPreviewUrl }) {
  const hasText = text.trim().length > 0;
  const meta = [imageFileName ? imageFileName : null].filter(Boolean);

  return (
    <article className="flex justify-end" aria-label="Your message">
      <div className="max-w-[min(100%,28rem)] space-y-2.5 rounded-3xl bg-chat-elevated px-4 py-2.5 text-[15px] leading-relaxed text-white">
        {meta.length > 0 ? (
          <p className="text-[12px] text-chat-muted">{meta.join(" · ")}</p>
        ) : null}

        {hasText ? (
          <p className="whitespace-pre-wrap">{text.trim()}</p>
        ) : null}

        {hasAudio && audioPreviewUrl ? (
          <div className="rounded-2xl border border-white/[0.08] bg-chat-bg/45 px-3 py-2.5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white/50">
              Voice memo · {audioDurationLabel}
            </p>
            <VoiceAudioPlayer src={audioPreviewUrl} />
          </div>
        ) : hasAudio ? (
          <p className="text-[12px] text-chat-muted">Voice {audioDurationLabel}</p>
        ) : null}

        {!hasText && !hasAudio && !imageFileName ? (
          <p className="text-chat-muted italic">Attachments only</p>
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
    <div
      className="max-w-[min(100%,26rem)] rounded-xl border border-white/[0.08] bg-chat-elevated/90 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.08em] text-white/55">
        Drafting clinical output
      </p>
      <p className="sr-only">Current step: {activeLabel}</p>
      <ol className="m-0 flex list-none flex-col gap-0 p-0">
        {CLINICAL_LOADING_STEPS.map((label, index) => {
          const isDone = index < phase;
          const isActive = index === phase;
          const isLast = index === CLINICAL_LOADING_STEPS.length - 1;

          return (
            <li key={label} className="relative flex gap-3.5 pb-4 last:pb-0">
              {/* Full-height segment, centered on 28px badge column (14px = half of w-7) */}
              {!isLast ? (
                <div
                  className="pointer-events-none absolute left-[14px] top-[2rem] z-0 bottom-0 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/26 via-white/16 to-white/10"
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
                      ? "font-medium text-white"
                      : isDone
                        ? "font-normal text-white/72"
                        : "font-normal text-white/42"
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
  );
}

function AssistantError({ message }) {
  return (
    <div className="max-w-[min(100%,36rem)] rounded-xl border border-red-500/30 bg-red-950/35 px-4 py-3 text-[15px] text-red-100" role="alert">
      {message}
    </div>
  );
}

export function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <UserBubble
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
      return <AssistantLoading />;
    }
    if (message.error) {
      return <AssistantError message={message.error} />;
    }
    if (message.result) {
      return (
        <div className="min-w-0 w-full">
          <StructuredResult result={message.result} />
        </div>
      );
    }
  }

  return null;
}
