import { toFile } from "openai";

import { appConfig } from "../config.js";
import { getOpenAiClient } from "./openaiClient.js";

export async function transcribeAudioFile(audioFile) {
  if (!audioFile) {
    return null;
  }

  const openAiClient = getOpenAiClient();
  const file = await toFile(
    audioFile.buffer,
    audioFile.originalname || "recording.webm",
    {
      type: audioFile.mimetype || "audio/webm",
    },
  );

  const transcription = await openAiClient.audio.transcriptions.create({
    file,
    model: appConfig.transcriptionModel,
  });

  return transcription.text?.trim() || "";
}
