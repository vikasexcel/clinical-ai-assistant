const toneClasses = {
  success: "border-emerald-200 bg-emerald-50/90 text-emerald-950",
  error: "border-red-200 bg-red-50/90 text-red-950",
  info: "border-clinical-border bg-clinical-elevated text-clinical-ink",
};

export function StatusBanner({ tone = "info", message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border px-3.5 py-2.5 text-[13px] leading-snug shadow-sm ${toneClasses[tone] ?? toneClasses.info}`}
      aria-live="polite"
    >
      <p className="break-words">{message}</p>
    </div>
  );
}
