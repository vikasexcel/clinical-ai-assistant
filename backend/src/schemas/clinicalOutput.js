import { z } from "zod";

export const confidenceLevelSchema = z.enum(["High", "Medium", "Low"]);
export const riskLevelSchema = z.enum(["Low", "Medium", "High"]);

export const clinicalAssistantInsightsSchema = z.object({
  billingDecision: z.object({
    recommendedCpt: z.object({
      code: z.string().min(1),
      label: z.string().min(1),
    }),
    addonCodes: z
      .array(
        z.object({
          code: z.string().min(1),
          label: z.string().min(1),
          rationale: z.string().min(1),
        }),
      )
      .default([]),
    cptJustification: z.string().min(1),
    confidence: confidenceLevelSchema,
    riskLevel: riskLevelSchema,
    downcodingRisk: z.number().min(0).max(100),
    denialRisk: z.number().min(0).max(100),
  }),
  riskScore: z.object({
    score: z.number().min(1).max(10),
    summary: z.string().min(1),
  }),
  codeRecommendation: z.object({
    aiSuggestedCode: z.object({
      code: z.string().min(1),
      label: z.string().min(1),
      description: z.string().min(1),
    }),
    auditSafeCode: z.object({
      code: z.string().min(1),
      label: z.string().min(1),
      description: z.string().min(1),
    }),
    ifDocumentationImproved: z.object({
      code: z.string().min(1),
      label: z.string().min(1),
      description: z.string().min(1),
    }),
  }),
  areasToReview: z
    .array(
      z.object({
        severity: z.enum(["High", "Medium", "Low"]),
        title: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .min(1)
    .max(4),
  suggestedImprovements: z
    .array(
      z.object({
        category: z.string().min(1),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        description: z.string().min(1),
      }),
    )
    .min(1)
    .max(4),
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
    hpiElements: z.object({
      location: z.boolean(),
      quality: z.boolean(),
      severity: z.boolean(),
      duration: z.boolean(),
      modifyingFactors: z.boolean(),
      associatedSignsSymptoms: z.boolean(),
      timing: z.boolean(),
      context: z.boolean(),
    }),
    hpiLevel: z.enum(["Brief", "Extended"]),
    ros: z.object({
      systems: z.array(z.string()).min(1),
      level: z.enum(["Problem Pertinent", "Extended", "Complete"]),
      note: z.string().min(1),
    }),
    mentalStatusExam: z.string().nullable(),
    mdm: z.object({
      problems: z.object({ level: z.enum(["Minimal", "Low", "Moderate", "High"]), justification: z.string().min(1) }),
      data: z.object({ level: z.enum(["Minimal", "Low", "Moderate", "High"]), justification: z.string().min(1) }),
      risk: z.object({ level: z.enum(["Minimal", "Low", "Moderate", "High"]), justification: z.string().min(1) }),
      overall: z.enum(["Straightforward", "Low", "Moderate", "High"]),
    }),
    assessment: z.string().min(1),
    plan: z.string().min(1),
    time: z.object({
      minutesDocumented: z.number().min(1),
      supportsCode: z.string().min(1),
      note: z.string().min(1),
    }).nullable(),
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
      rationale: z.string().min(1),
    }),
    secondaryCodes: z
      .array(
        z.object({
          code: z.string().min(1),
          label: z.string().min(1),
          rationale: z.string().min(1),
        }),
      ),
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
  riskScore: clinicalAssistantInsightsSchema.shape.riskScore,
  codeRecommendation: clinicalAssistantInsightsSchema.shape.codeRecommendation,
  areasToReview: clinicalAssistantInsightsSchema.shape.areasToReview,
  suggestedImprovements: clinicalAssistantInsightsSchema.shape.suggestedImprovements,
  lightDefensiveGuidance: clinicalAssistantInsightsSchema.shape.lightDefensiveGuidance,
  downcodeRiskLine: clinicalAssistantInsightsSchema.shape.downcodeRiskLine,
  justification: clinicalAssistantInsightsSchema.shape.justification,
  mainIssue: clinicalAssistantInsightsSchema.shape.mainIssue,
  supportGuidance: clinicalAssistantInsightsSchema.shape.supportGuidance,
  structuredNote: clinicalAssistantInsightsSchema.shape.structuredNote,
  smartWarning: clinicalAssistantInsightsSchema.shape.smartWarning,
  icd10: clinicalAssistantInsightsSchema.shape.icd10,
});
