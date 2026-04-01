import { z } from "zod";

export const confidenceLevelSchema = z.enum(["High", "Medium", "Low"]);
export const riskLevelSchema = z.enum(["Low", "Medium", "High"]);

export const clinicalAssistantInsightsSchema = z.object({
  billingDecision: z.object({
    recommendedCpt: z.object({
      code: z.string().min(1),
      label: z.string().min(1),
    }),
    confidence: confidenceLevelSchema,
    riskLevel: riskLevelSchema,
    downcodingRisk: z.number().min(0).max(100),
    denialRisk: z.number().min(0).max(100),
  }),
  justification: z
    .object({
      summary: z.string().min(1),
      complexityFactors: z.array(z.string()).min(1),
    })
    .nullable(),
  defensiveDocumentation: z
    .object({
      header: z.string().min(1),
      requiredElements: z
        .array(
          z.object({
            element: z.string().min(1),
            example: z.string().nullable(),
          }),
        )
        .min(1)
        .max(5),
    })
    .nullable(),
  mainIssue: z
    .object({
      issue: z.string().min(1),
      whyItMatters: z.string().min(1),
    })
    .nullable(),
  actionableFixes: z.object({
    header: z.string().min(1),
    fixes: z
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
  icd10Suggestions: z
    .array(
      z.object({
        code: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .max(3),
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
  justification: clinicalAssistantInsightsSchema.shape.justification,
  defensiveDocumentation: clinicalAssistantInsightsSchema.shape.defensiveDocumentation,
  mainIssue: clinicalAssistantInsightsSchema.shape.mainIssue,
  actionableFixes: clinicalAssistantInsightsSchema.shape.actionableFixes,
  structuredNote: clinicalAssistantInsightsSchema.shape.structuredNote,
  smartWarning: clinicalAssistantInsightsSchema.shape.smartWarning,
  icd10Suggestions: clinicalAssistantInsightsSchema.shape.icd10Suggestions,
});
