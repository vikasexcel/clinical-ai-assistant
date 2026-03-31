const toneClasses = {
  success: "border-emerald-500/25 bg-emerald-950/30 text-emerald-50/95",
  error: "border-red-500/25 bg-red-950/35 text-red-50/95",
  info: "border-white/[0.08] bg-white/[0.04] text-white/80",
};

export function StatusBanner({ tone = "info", message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-[13px] leading-snug ${toneClasses[tone] ?? toneClasses.info}`}
      aria-live="polite"
    >
      <p>{message}</p>
    </div>
  );
}
