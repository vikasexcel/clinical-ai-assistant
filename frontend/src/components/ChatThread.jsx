import { useEffect, useRef } from "react";

import { ChatMessage } from "./ChatMessage.jsx";

/**
 * Pair flat [user, assistant, ...] messages into { user, assistant } for chart-style sections.
 */
function pairMessages(messages) {
  const pairs = [];
  for (let i = 0; i < messages.length; i += 2) {
    const user = messages[i];
    const assistant = messages[i + 1];
    if (user?.role === "user" && assistant?.role === "assistant") {
      pairs.push({ user, assistant });
    }
  }
  return pairs;
}

function OutputEmptyState() {
  return (
    <div className="flex min-h-[min(50svh,22rem)] flex-col items-center justify-center px-4 py-12 text-center sm:px-8">
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-clinical-border bg-clinical-surface text-clinical-muted"
        aria-hidden="true"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-clinical-accent/80">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-display text-[1.25rem] font-semibold text-clinical-ink">Documentation preview</p>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-clinical-muted">
        Billing guidance, structured chart sections, and ICD context will render in this pane—similar to a chart preview in an EHR, not a message feed.
      </p>
      <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.1em] text-clinical-muted/80">
        <span className="lg:hidden">Complete intake above, then generate</span>
        <span className="hidden lg:inline">Complete intake on the left, then generate</span>
      </p>
    </div>
  );
}

export function ChatThread({ messages }) {
  const bottomRef = useRef(null);
  const pairs = pairMessages(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (pairs.length === 0) {
    return (
      <div className="h-full min-h-[12rem]">
        <div className="border-b border-clinical-border-soft px-3 py-3 sm:px-6 sm:py-4">
          <h2 className="font-display text-[1.1rem] font-semibold text-clinical-ink">Output</h2>
          <p className="mt-1 text-[13px] text-clinical-muted">Structured documentation and coding support</p>
        </div>
        <OutputEmptyState />
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-10 border-b border-clinical-border-soft bg-clinical-bg/95 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
        <h2 className="font-display text-[1.1rem] font-semibold text-clinical-ink">Output</h2>
        <p className="mt-1 text-[13px] text-clinical-muted">Review each run below before saving to the chart</p>
      </div>

      <div className="space-y-6 px-3 pt-4 sm:space-y-10 sm:px-6 sm:pt-6">
        {pairs.map(({ user, assistant }, index) => (
          <section
            key={user.id}
            className="rounded-2xl border border-clinical-border bg-clinical-surface p-3 shadow-[0_1px_0_rgba(255,255,255,0.9),0_12px_40px_rgba(22,25,23,0.06)] sm:p-6"
            aria-labelledby={`encounter-${user.id}-title`}
          >
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2 border-b border-clinical-border-soft pb-4">
              <div>
                <h3 id={`encounter-${user.id}-title`} className="font-display text-lg font-semibold text-clinical-ink">
                  Encounter documentation
                </h3>
                <p className="mt-0.5 text-[12px] text-clinical-muted">Run {index + 1}</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-1 lg:gap-10">
              <div>
                <h4 className="mb-3 border-l-2 border-clinical-accent pl-3 text-[11px] font-bold uppercase tracking-[0.12em] text-clinical-muted">
                  Source intake
                </h4>
                <ChatMessage hideLabels message={user} />
              </div>

              <div>
                <h4 className="mb-3 border-l-2 border-slate-300 pl-3 text-[11px] font-bold uppercase tracking-[0.12em] text-clinical-muted">
                  Generated documentation
                </h4>
                <ChatMessage hideLabels message={assistant} />
              </div>
            </div>
          </section>
        ))}
      </div>
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden="true" />
    </div>
  );
}
