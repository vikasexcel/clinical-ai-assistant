import "dotenv/config";
import { setDefaultOpenAIKey } from "@openai/agents";

const bytesInMegabyte = 1024 * 1024;

export const appConfig = Object.freeze({
  openAiApiKey: process.env.OPENAI_API_KEY?.trim() || "",
  agentModel: process.env.OPENAI_AGENT_MODEL?.trim() || "gpt-4.1-mini",
  transcriptionModel:
    process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || "gpt-4o-mini-transcribe",
  maxAudioBytes: Number(process.env.MAX_AUDIO_UPLOAD_MB || 15) * bytesInMegabyte,
  maxImageBytes: Number(process.env.MAX_IMAGE_UPLOAD_MB || 10) * bytesInMegabyte,
});

export const startupValidation = Object.freeze({
  ok: Boolean(appConfig.openAiApiKey),
  errors: appConfig.openAiApiKey ? [] : ["OPENAI_API_KEY is required for AI features."],
});

if (startupValidation.ok) {
  setDefaultOpenAIKey(appConfig.openAiApiKey);
}

export function assertAiConfigured() {
  if (!startupValidation.ok) {
    const error = new Error(startupValidation.errors.join(" "));
    error.statusCode = 503;
    throw error;
  }
}
