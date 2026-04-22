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

/**
 * Remove stray extra lines the model sometimes appends to time.note.
 * The only valid content is: "X minutes documented. [billingStatus]."
 * Strip anything that looks like CPT references, E/M rationale, or extra commentary.
 */
function stripSupportsCptLinesFromTimeNote(note) {
  if (!note || typeof note !== "string") return note;
  return note
    .split("\n")
    .filter(line => {
      const t = line.trim();
      if (!t) return false;
      // Remove "Supports 99xxx" lines
      if (/^\s*Supports\s+99\d{3}\b/i.test(t)) return false;
      // Remove "E/M level from MDM..." stray annotation lines
      if (/^E\/M level from MDM/i.test(t)) return false;
      // Remove any line that is purely a CPT-code rationale comment (e.g. "visit time not used alone to select CPT")
      if (/visit time not used alone to select/i.test(t)) return false;
      return true;
    })
    .join("\n")
    .trim();
}

function sanitizeStructuredNoteTime(time) {
  if (!time) return time;
  return { ...time, note: stripSupportsCptLinesFromTimeNote(time.note) };
}

/**
 * When controlled substance is fully documented, remove any support guidance item
 * that advises the provider to document CS alternatives/risk-benefit (already done).
 */
function sanitizeSupportGuidanceItems(items, csAnalysis) {
  if (!Array.isArray(items)) return items;
  if (!csAnalysis || !csAnalysis.allDocumented) return items;
  // Remove items that tell the provider to document CS elements that are already present
  return items.filter(item => {
    const text = ((item.action || "") + " " + (item.example || "")).toLowerCase();
    const isRedundantCsAdvice =
      /alternatives?.{0,40}(valium|xanax|klonopin|benzodiazepin|controlled|prescri)/i.test(text) ||
      /risk.{0,20}benefit.{0,40}(valium|xanax|klonopin|benzodiazepin|controlled|prescri)/i.test(text) ||
      /(confirm|document|add|note|record).{0,60}(alternatives|risk.{0,10}benefit).{0,40}(valium|xanax|klonopin|benzodiazepin|controlled|prescri)/i.test(text);
    return !isRedundantCsAdvice;
  });
}

/** Clinical guidance header must reference the recommended CPT actually billed, not a hypothetical higher code. */
function alignSupportGuidanceHeader(header, recommendedCode) {
  if (!header || typeof header !== "string" || !recommendedCode) return header;
  const t = header.trim();
  if (!/^How to support \d{5}\s*:/i.test(t)) return header;
  return header.replace(/^How to support \d{5}(\s*:)/i, `How to support ${recommendedCode}$1`);
}

/**
 * Deterministic new-vs-established patient detection.
 * Returns "new", "established", or null (ambiguous — let LLM decide).
 * Injected as a hard context hint to prevent the LLM from misclassifying.
 */
function analyzeNewVsEstablished(text) {
  const lower = text.toLowerCase();

  // Strong new-patient signals
  const newPatientPatterns = [
    /\bnew patient\b/i,
    /\binitial (visit|evaluation|assessment|intake|session|appointment|consult)\b/i,
    /\bfirst (visit|time|appointment|session|evaluation|meeting|time (meeting|seeing))\b/i,
    /\b(just|only) meeting (me|him|her|them) for the first time\b/i,
    /first time (meeting|seeing|meeting with|visit)\b/i,
    /never (been seen|seen (me|here)|had (a visit|an appointment))\b/i,
    /\bnew (referral|consult|consultation)\b/i,
    /\binitial psych(iatric)?\b/i,
    // Full biopsychosocial intake sections in a single note strongly suggest new patient
    /developmental history.{0,200}educational.*vocational history/is,
  ];

  // Strong established-patient signals
  const establishedPatterns = [
    /\bfollow[- ]?up\b/i,
    /\breturn (visit|patient|appointment)\b/i,
    /\blast (visit|session|appointment|time (we|I|he|she))\b/i,
    /\bprevious(ly)? (prescribed|discussed|seen|treated)\b/i,
    /\bcontinue (medication|treatment|therapy)\b/i,
    /\bsince (last|our last|the last)\b/i,
    /established patient/i,
  ];

  const isNew = newPatientPatterns.some(p => p.test(text));
  const isEstablished = establishedPatterns.some(p => p.test(lower));

  // If both fire, the stronger signal wins. Multiple new-patient hits are highly reliable.
  const newHits = newPatientPatterns.filter(p => p.test(text)).length;
  const estHits = establishedPatterns.filter(p => p.test(lower)).length;

  if (isNew && !isEstablished) return "new";
  if (isEstablished && !isNew) return "established";
  if (isNew && isEstablished) {
    // More new signals → new patient (e.g., first visit with a return follow-up mentioned)
    return newHits >= estHits ? "new" : "established";
  }
  return null; // ambiguous — let LLM decide
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
  const patientType = analyzeNewVsEstablished(fullText);

  let csContext = "";
  if (csAnalysis) {
    if (csAnalysis.allDocumented) {
      csContext = `\n\nPRE-ANALYSIS FINDING (controlled substance): A controlled substance is prescribed in this note. All three required documentation elements have been detected: alternatives considered ✓, risk-benefit discussion ✓, patient/caregiver agreement ✓. Do NOT flag this as a controlled substance gap. Do NOT raise risk score for this. The controlled substance is WELL DOCUMENTED.`;
    } else {
      csContext = `\n\nPRE-ANALYSIS FINDING (controlled substance): A controlled substance is prescribed in this note. The following required documentation elements are MISSING: ${csAnalysis.missing.join(", ")}. This MUST be flagged as HIGH severity "Controlled Substance — Medical Necessity Gap" in areasToReview. riskScore.score MUST be 6 or higher. riskScore.summary MUST begin with "RISK:".`;
    }
  }

  let patientTypeContext = "";
  if (patientType === "new") {
    patientTypeContext = `\n\nPRE-ANALYSIS FINDING (patient type): Deterministic scan of the note detected NEW PATIENT signals (first-time meeting, initial evaluation language, full biopsychosocial intake, no prior medications with this provider). This is a NEW PATIENT encounter. IMPORTANT — this affects E/M code range selection ONLY: if PRE-CHECK 0 determines the visit qualifies as an E/M visit (9920x), you MUST use the NEW patient range: 99201–99205 (NOT established codes 99211–99215). Moderate MDM → 99204. High MDM → 99205. NOTE: If PRE-CHECK 0 determines this is a pure diagnostic intake (90791 or 90792), new patient status does not change that — 90791/90792 apply to both new and established patients.`;
  } else if (patientType === "established") {
    patientTypeContext = `\n\nPRE-ANALYSIS FINDING (patient type): Deterministic scan detected ESTABLISHED PATIENT signals (follow-up, return visit, continuing medications). This is an ESTABLISHED PATIENT visit. If this qualifies as E/M, use established patient codes: 99211–99215.`;
  }

  const sections = [
    `Analyze the following rough clinical draft inputs and return the requested structured output.${csContext}${patientTypeContext}`,
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

  const fullText = [inputSummary.originalText, inputSummary.transcript, inputSummary.ocrText]
    .filter(Boolean)
    .join("\n\n");
  const csAnalysis = analyzeControlledSubstance(fullText);

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
      items: sanitizeSupportGuidanceItems(parsed.supportGuidance.items, csAnalysis),
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
