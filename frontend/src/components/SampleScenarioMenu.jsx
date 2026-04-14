import { useEffect, useId, useRef, useState } from "react";
import { CLINICAL_SAMPLE_SCENARIOS } from "../lib/clinicalSampleScenarios.js";

function ChevronIcon({ className, open }) {
  return (
    <svg
      aria-hidden
      className={`shrink-0 text-[#6b7280] transition-transform duration-200 ${open ? "rotate-180" : ""} ${className ?? ""}`}
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
 * “Load sample…” control — matches MedClaim reference dropdown styling.
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
    <div className="relative min-w-0" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        id={`${listId}-trigger`}
        onClick={() => setOpen((previous) => !previous)}
        className="inline-flex h-10 min-w-[11.5rem] max-w-full items-center justify-between gap-3 rounded-lg border border-[#d1d5db] bg-white px-3.5 py-2 text-left text-[14px] font-medium text-gray-800 shadow-none transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00685b]/25 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="truncate">Load Sample...</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-[100] min-w-[min(18rem,calc(100vw-2rem))] max-w-[min(22rem,calc(100vw-2rem))] origin-top motion-safe:animate-[sampleMenuIn_0.18s_ease-out_both]"
          role="presentation"
        >
          <div
            className="rounded-lg border border-[#d1d5db] bg-white p-1 shadow-[0_10px_40px_rgba(17,24,39,0.08)]"
            id={listId}
            role="listbox"
            aria-labelledby={`${listId}-trigger`}
          >
            <p className="border-b border-[#e5e7eb] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
              Test scenarios
            </p>
            <ul className="max-h-[min(50vh,280px)] overflow-y-auto py-1">
              {CLINICAL_SAMPLE_SCENARIOS.map((scenario) => (
                <li key={scenario.id}>
                  <button
                    type="button"
                    role="option"
                    className="flex w-full rounded-md px-3 py-2.5 text-left text-[13px] leading-snug text-gray-900 transition hover:bg-[#f9fafb] focus:bg-[#f9fafb] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00685b]/20"
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
