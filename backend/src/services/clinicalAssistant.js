import { Agent, run } from "@openai/agents";

import { appConfig, assertAiConfigured } from "../config.js";
import { clinicalAssistantPrompt } from "../prompts/clinicalAssistantPrompt.js";
import {
  clinicalAnalysisResponseSchema,
  clinicalAssistantInsightsSchema,
} from "../schemas/clinicalOutput.js";

const clinicalAssistantAgent = new Agent({
  name: "MedClaim AI MVP",
  model: appConfig.agentModel,
  instructions: clinicalAssistantPrompt,
  outputType: clinicalAssistantInsightsSchema,
});

function joinDraftSections(sections) {
  return sections.filter(Boolean).join("\n\n").trim();
}

function buildAgentInput({ originalText, transcript, ocrText }) {
  const sections = [
    "Analyze the following rough clinical draft inputs and return the requested structured output.",
    originalText ? `Typed draft:\n${originalText}` : "Typed draft:\nNone provided.",
    transcript ? `Audio transcript:\n${transcript}` : "Audio transcript:\nNone provided.",
    ocrText ? `OCR text from image upload:\n${ocrText}` : "OCR text from image upload:\nNone provided.",
  ];

  return joinDraftSections(sections);
}

export function buildInputSummary({ textInput, transcript, ocrResult }) {
  const warnings = [];
  const sources = [];
  const originalText = textInput.trim();
  const ocrText = ocrResult?.text?.trim() || null;

  if (originalText) {
    sources.push("text");
  }

  if (transcript) {
    sources.push("audio");
  }

  if (ocrText) {
    sources.push("image");
  }

  if (ocrResult && !ocrText) {
    warnings.push("The uploaded image did not produce usable OCR text.");
  } else if (ocrResult && ocrResult.confidence < 55) {
    warnings.push("OCR confidence was low, so extracted image text may be incomplete.");
  }

  if (!originalText && !transcript && !ocrText) {
    throw new Error("Provide text, a voice recording, or an image with readable text.");
  }

  return {
    sources,
    originalText,
    transcript: transcript || null,
    ocrText,
    normalizedDraft: joinDraftSections([
      originalText ? `Text draft: ${originalText}` : "",
      transcript ? `Speech transcript: ${transcript}` : "",
      ocrText ? `Image OCR: ${ocrText}` : "",
    ]),
    warnings,
  };
}

export async function generateClinicalAnalysis(inputSummary) {
  assertAiConfigured();

  const result = await run(clinicalAssistantAgent, buildAgentInput(inputSummary), {
    maxTurns: 1,
  });

  if (!result.finalOutput) {
    throw new Error("The assistant did not return a structured response.");
  }

  return clinicalAnalysisResponseSchema.parse({
    inputSummary,
    ...result.finalOutput,
  });
}
