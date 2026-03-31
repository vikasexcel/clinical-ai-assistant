import { z } from "zod";

export const riskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

const codingSuggestionSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  rationale: z.string().min(1),
});

export const clinicalAssistantInsightsSchema = z.object({
  clinicalNote: z.object({
    summary: z.string().min(1),
    subjective: z.string().min(1),
    objective: z.string().min(1),
    assessment: z.string().min(1),
    plan: z.string().min(1),
    missingInformation: z.array(z.string()).max(8),
  }),
  codingSuggestions: z.object({
    cpt: z.array(codingSuggestionSchema).max(5),
    icd10: z.array(codingSuggestionSchema).max(5),
  }),
  riskAnalysis: z.object({
    level: riskLevelSchema,
    summary: z.string().min(1),
    supportingFactors: z.array(z.string()).max(6),
    watchItems: z.array(z.string()).max(6),
  }),
  improvementSuggestions: z.array(z.string()).max(8),
  disclaimer: z.string().min(1),
});

export const clinicalAnalysisResponseSchema = z.object({
  inputSummary: z.object({
    sources: z.array(z.enum(["text", "audio", "image"])).min(1),
    originalText: z.string(),
    transcript: z.string().nullable(),
    ocrText: z.string().nullable(),
    normalizedDraft: z.string().min(1),
    warnings: z.array(z.string()),
  }),
  clinicalNote: clinicalAssistantInsightsSchema.shape.clinicalNote,
  codingSuggestions: clinicalAssistantInsightsSchema.shape.codingSuggestions,
  riskAnalysis: clinicalAssistantInsightsSchema.shape.riskAnalysis,
  improvementSuggestions: clinicalAssistantInsightsSchema.shape.improvementSuggestions,
  disclaimer: clinicalAssistantInsightsSchema.shape.disclaimer,
});
