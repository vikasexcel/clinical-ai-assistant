const toneClasses = {
  success: "border-emerald-200 bg-emerald-50/90 text-emerald-950",
  error: "border-red-200 bg-red-50/90 text-red-950",
  info: "border-[#d1d5db] bg-white text-gray-800",
};

export function StatusBanner({ tone = "info", message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-[12px] leading-snug ${toneClasses[tone] ?? toneClasses.info}`}
      aria-live="polite"
    >
      <p className="break-words">{message}</p>
    </div>
  );
}
