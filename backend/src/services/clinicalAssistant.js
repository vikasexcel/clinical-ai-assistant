import { Agent, run } from "@openai/agents";

import { appConfig, assertAiConfigured } from "../config.js";
import {
  normalizeAddonCodes,
  normalizeCptEligibility,
  normalizeProcedureCodeRow,
  normalizeRecommendedCpt,
  sanitizeCptEligibilityAgainstPrimary,
} from "../data/psychiatryCptLibrary.js";
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

/** Remove stray "Supports 99xxx" lines the model sometimes adds to time.note (contradicts billingStatus). */
function stripSupportsCptLinesFromTimeNote(note) {
  if (!note || typeof note !== "string") return note;
  return note
    .split("\n")
    .filter(line => !/^\s*Supports\s+99\d{3}\b/i.test(line.trim()))
    .join("\n")
    .trim();
}

function sanitizeStructuredNoteTime(time) {
  if (!time) return time;
  return { ...time, note: stripSupportsCptLinesFromTimeNote(time.note) };
}

/** Clinical guidance header must reference the recommended CPT actually billed, not a hypothetical higher code. */
function alignSupportGuidanceHeader(header, recommendedCode) {
  if (!header || typeof header !== "string" || !recommendedCode) return header;
  const t = header.trim();
  if (!/^How to support \d{5}\s*:/i.test(t)) return header;
  return header.replace(/^How to support \d{5}(\s*:)/i, `How to support ${recommendedCode}$1`);
}

// Deterministic pre-analysis of controlled substance documentation.
// Removes LLM ambiguity by scanning the note with regex before sending to the model.
function analyzeControlledSubstance(text) {
  const lower = text.toLowerCase();

  const csPatterns = [
    /valium|diazepam|xanax|alprazolam|klonopin|clonazepam|ativan|lorazepam|benzodiazepine/,
    /adderall|ritalin|vyvanse|methylphenidate|amphetamine/,
    /oxycodone|hydrocodone|oxycontin|percocet|vicodin|morphine|fentanyl|tramadol/,
    /schedule\s*(ii|iii|iv|2|3|4)/,
  ];

  const hasControlledSubstance = csPatterns.some(p => p.test(lower));
  if (!hasControlledSubstance) return null;

  // Check for alternatives documented
  const alternativesPatterns = [
    /klonopin.{0,50}(too long|not appropriate|not suitable|not ideal|rejected|not used)/i,
    /xanax.{0,50}(too short|not appropriate|not suitable|not ideal|rejected|not used)/i,
    /(tried|attempted|considered|evaluated).{0,80}(medication|drug|treatment|therapy)/i,
    /(medication|drug|alternative).{0,80}(tried|attempted|considered|evaluated|rejected|not appropriate)/i,
    /non.?pharmacolog/i,
    /behavioral.{0,30}(intervention|approach|treatment)/i,
    // Pattern: naming two drugs as alternatives e.g. "klonopin is too long acting xanax is too short"
    /(klonopin|xanax|ativan|valium|ritalin|adderall).{0,100}(klonopin|xanax|ativan|valium|ritalin|adderall)/i,
  ];
  const hasAlternatives = alternativesPatterns.some(p => p.test(text));

  // Check for risk-benefit discussion
  const riskBenefitPatterns = [
    /risk.{0,20}benefit/i,
    /benefit.{0,20}risk/i,
    /side effect/i,
    /risks.{0,30}benefits.{0,30}option/i,
    /medication.{0,50}(explained|discussed|reviewed|counseled)/i,
    /changes in medication were explained/i,
    /purpose.{0,30}dosage.{0,30}direction/i,
  ];
  const hasRiskBenefit = riskBenefitPatterns.some(p => p.test(text));

  // Check for agreement
  const agreementPatterns = [
    /agreed to (try|proceed|start|initiate)/i,
    /we (agreed|discussed and agreed)/i,
    /patient.{0,30}(agreed|consent|accept)/i,
    /caregiver.{0,30}(agreed|consent|accept)/i,
    /mother.{0,30}(agreed|consent|accept)/i,
  ];
  const hasAgreement = agreementPatterns.some(p => p.test(text));

  const allDocumented = hasAlternatives && hasRiskBenefit && hasAgreement;
  const missing = [];
  if (!hasAlternatives) missing.push("alternatives considered or tried");
  if (!hasRiskBenefit) missing.push("risk-benefit discussion");
  if (!hasAgreement) missing.push("patient/caregiver agreement");

  return { hasControlledSubstance, allDocumented, missing, hasAlternatives, hasRiskBenefit, hasAgreement };
}

function buildAgentInput({ originalText, transcript, ocrText }) {
  const fullText = [originalText, transcript, ocrText].filter(Boolean).join("\n\n");
  const csAnalysis = analyzeControlledSubstance(fullText);

  let csContext = "";
  if (csAnalysis) {
    if (csAnalysis.allDocumented) {
      csContext = `\n\nPRE-ANALYSIS FINDING (controlled substance): A controlled substance is prescribed in this note. All three required documentation elements have been detected: alternatives considered ✓, risk-benefit discussion ✓, patient/caregiver agreement ✓. Do NOT flag this as a controlled substance gap. Do NOT raise risk score for this. The controlled substance is WELL DOCUMENTED.`;
    } else {
      csContext = `\n\nPRE-ANALYSIS FINDING (controlled substance): A controlled substance is prescribed in this note. The following required documentation elements are MISSING: ${csAnalysis.missing.join(", ")}. This MUST be flagged as HIGH severity "Controlled Substance — Medical Necessity Gap" in areasToReview. riskScore.score MUST be 6 or higher. riskScore.summary MUST begin with "RISK:".`;
    }
  }

  const sections = [
    `Analyze the following rough clinical draft inputs and return the requested structured output.${csContext}`,
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

  const parsed = clinicalAnalysisResponseSchema.parse({
    inputSummary,
    ...result.finalOutput,
  });

  const recommendedCode = parsed.billingDecision.recommendedCpt.code;

  return {
    ...parsed,
    billingDecision: {
      ...parsed.billingDecision,
      recommendedCpt: normalizeRecommendedCpt(parsed.billingDecision.recommendedCpt),
    },
    codeRecommendation: {
      aiSuggestedCode: normalizeProcedureCodeRow(parsed.codeRecommendation.aiSuggestedCode),
      auditSafeCode: normalizeProcedureCodeRow(parsed.codeRecommendation.auditSafeCode),
      ifDocumentationImproved: normalizeProcedureCodeRow(parsed.codeRecommendation.ifDocumentationImproved),
    },
    supportGuidance: {
      ...parsed.supportGuidance,
      header: alignSupportGuidanceHeader(parsed.supportGuidance.header, recommendedCode),
    },
    structuredNote: parsed.structuredNote?.time
      ? { ...parsed.structuredNote, time: sanitizeStructuredNoteTime(parsed.structuredNote.time) }
      : parsed.structuredNote,
    addonCodes: normalizeAddonCodes(parsed.addonCodes),
    cptEligibility: sanitizeCptEligibilityAgainstPrimary(
      recommendedCode,
      normalizeCptEligibility(parsed.cptEligibility),
    ),
  };
}
