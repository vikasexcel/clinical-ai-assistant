import { z } from "zod";

export const confidenceLevelSchema = z.enum(["High", "Medium", "Low"]);
export const riskLevelSchema = z.enum(["Low", "Medium", "High"]);

export const clinicalAssistantInsightsSchema = z.object({
  billingDecision: z.object({
    recommendedCpt: z.object({
      code: z.string().min(1),
      label: z.string().min(1),
    }),
    cptJustification: z.string().min(1),
    confidence: confidenceLevelSchema,
    riskLevel: riskLevelSchema,
    downcodingRisk: z.number().min(0).max(100),
    denialRisk: z.number().min(0).max(100),
  }),
  lightDefensiveGuidance: z.string().min(1),
  downcodeRiskLine: z.string().min(1),
  justification: z
    .object({
      summary: z.string().min(1),
      complexityFactors: z.array(z.string()).min(1),
    })
    .nullable(),
  mainIssue: z
    .object({
      issue: z.string().min(1),
      whyItMatters: z.string().min(1),
    })
    .nullable(),
  supportGuidance: z.object({
    header: z.string().min(1),
    items: z
      .array(
        z.object({
          action: z.string().min(1),
          example: z.string().nullable(),
        }),
      )
      .min(2)
      .max(4),
  }),
  structuredNote: z.object({
    chiefComplaint: z.string().min(1),
    hpi: z.string().min(1),
    assessment: z.string().min(1),
    plan: z.string().min(1),
  }),
  smartWarning: z
    .object({
      message: z.string().min(1),
    })
    .nullable(),
  icd10: z.object({
    primary: z.object({
      code: z.string().min(1),
      label: z.string().min(1),
    }),
    secondaryCodes: z
      .array(
        z.object({
          code: z.string().min(1),
          label: z.string().min(1),
        }),
      )
      .max(2),
  }),
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
  billingDecision: clinicalAssistantInsightsSchema.shape.billingDecision,
  lightDefensiveGuidance: clinicalAssistantInsightsSchema.shape.lightDefensiveGuidance,
  downcodeRiskLine: clinicalAssistantInsightsSchema.shape.downcodeRiskLine,
  justification: clinicalAssistantInsightsSchema.shape.justification,
  mainIssue: clinicalAssistantInsightsSchema.shape.mainIssue,
  supportGuidance: clinicalAssistantInsightsSchema.shape.supportGuidance,
  structuredNote: clinicalAssistantInsightsSchema.shape.structuredNote,
  smartWarning: clinicalAssistantInsightsSchema.shape.smartWarning,
  icd10: clinicalAssistantInsightsSchema.shape.icd10,
});
