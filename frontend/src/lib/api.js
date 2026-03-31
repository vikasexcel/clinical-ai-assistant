// Empty base uses Vite `/api` proxy; otherwise set origin (e.g. http://localhost:3022).
function assistantAnalyzeUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
  if (!raw) {
    return "/api/assistant/analyze";
  }
  const base = raw.replace(/\/$/, "");
  if (base.endsWith("/api")) {
    return `${base}/assistant/analyze`;
  }
  return `${base}/api/assistant/analyze`;
}

export async function submitClinicalDraft({ text, audioBlob, imageFile }) {
  const formData = new FormData();

  if (text.trim()) {
    formData.append("text", text.trim());
  }

  if (audioBlob) {
    formData.append("audio", audioBlob, `recording-${Date.now()}.webm`);
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(assistantAnalyzeUrl(), {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Unable to process the clinical draft right now.");
  }

  return payload;
}
