import OpenAI from "openai";

import { appConfig, assertAiConfigured } from "../config.js";

let openAiClient;

export function getOpenAiClient() {
  assertAiConfigured();

  if (!openAiClient) {
    openAiClient = new OpenAI({
      apiKey: appConfig.openAiApiKey,
    });
  }

  return openAiClient;
}
