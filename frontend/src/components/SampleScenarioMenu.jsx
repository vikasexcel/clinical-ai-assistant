import { useEffect, useId, useRef, useState } from "react";
import { CLINICAL_SAMPLE_SCENARIOS } from "../lib/clinicalSampleScenarios.js";

function ChevronIcon({ className, open }) {
  return (
    <svg
      aria-hidden
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className ?? ""}`}
      fill="none"
      height="14"
      viewBox="0 0 14 14"
      width="14"
    >
      <path
        d="M3.5 5.25L7 8.75l3.5-3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * “Load sample” control: short scenario names in a floating panel (opens upward above the composer).
 */
export function SampleScenarioMenu({ disabled, onSelectText }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function handlePointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        id={`${listId}-trigger`}
        onClick={() => setOpen((previous) => !previous)}
        className="group inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-clinical-border bg-clinical-surface px-3 py-1.5 text-[13px] font-medium text-clinical-ink shadow-sm transition hover:border-clinical-line/50 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-accent/30"
      >
        <span className="whitespace-nowrap">Load sample</span>
        <ChevronIcon className="text-clinical-muted group-hover:text-clinical-ink" open={open} />
      </button>

      {open ? (
        <div
          className="absolute bottom-[calc(100%+6px)] left-0 z-[100] min-w-[min(18rem,calc(100vw-2rem))] max-w-[min(22rem,calc(100vw-2rem))] origin-bottom motion-safe:animate-[sampleMenuIn_0.18s_ease-out_both]"
          role="presentation"
        >
          <div
            className="rounded-xl border border-clinical-border bg-clinical-surface/98 p-1 shadow-[0_16px_48px_rgba(22,25,23,0.12)] backdrop-blur-md"
            id={listId}
            role="listbox"
            aria-labelledby={`${listId}-trigger`}
          >
            <p className="border-b border-clinical-border-soft px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-clinical-muted">
              Test scenarios
            </p>
            <ul className="max-h-[min(50vh,280px)] overflow-y-auto py-1">
              {CLINICAL_SAMPLE_SCENARIOS.map((scenario) => (
                <li key={scenario.id}>
                  <button
                    type="button"
                    role="option"
                    className="flex w-full rounded-lg px-3 py-2.5 text-left text-[13px] leading-snug text-clinical-ink transition hover:bg-clinical-elevated focus:bg-clinical-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-clinical-accent/25"
                    onClick={() => {
                      onSelectText(scenario.text);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                  >
                    {scenario.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
