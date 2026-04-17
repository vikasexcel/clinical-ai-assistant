/**
 * One-off: run clinical analysis on a text fixture. Usage:
 *   node scripts/runFixtureAnalysis.mjs test-fixtures/walter-note.txt
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { buildInputSummary, generateClinicalAnalysis } from "../src/services/clinicalAssistant.js";

const backendRoot = dirname(join(fileURLToPath(import.meta.url), ".."));
const rel = process.argv[2] || "test-fixtures/walter-note.txt";
const text = readFileSync(join(backendRoot, rel), "utf8");

const inputSummary = buildInputSummary({ textInput: text, transcript: null, ocrResult: null });
const analysis = await generateClinicalAnalysis(inputSummary);

const pick = {
  recommendedCpt: analysis.billingDecision?.recommendedCpt,
  confidence: analysis.billingDecision?.confidence,
  riskLevel: analysis.billingDecision?.riskLevel,
  denialRisk: analysis.billingDecision?.denialRisk,
  downcodingRisk: analysis.billingDecision?.downcodingRisk,
  addonCodes: analysis.addonCodes,
  psychotherapyTimeSeparabilityWarning: analysis.psychotherapyTimeSeparabilityWarning,
  cptEligibility: analysis.cptEligibility,
  riskScore: analysis.riskScore,
  areasToReview: analysis.areasToReview?.map((a) => ({
    severity: a.severity,
    title: a.title,
    code: a.code ?? null,
  })),
  addonCodeReasoningPsychotherapy: analysis.addonCodeReasoning?.psychotherapy?.slice(0, 500),
};

console.log(JSON.stringify(pick, null, 2));
