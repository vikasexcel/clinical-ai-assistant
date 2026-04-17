/**
 * Structured psychiatry CPT reference (client PDF + Vikas.docx).
 * Keep codes and categories here so billing rules and prompts stay maintainable.
 */

export const PSYCHIATRY_CPT_CATEGORIES = [
  {
    id: "em",
    title: "E/M Codes",
    description: "Office visits: 99201–99205 (new patients), 99211–99215 (established patients).",
    codes: [
      { code: "99201", label: "Office visit, new patient, level 1" },
      { code: "99202", label: "Office visit, new patient, level 2" },
      { code: "99203", label: "Office visit, new patient, level 3" },
      { code: "99204", label: "Office visit, new patient, level 4" },
      { code: "99205", label: "Office visit, new patient, level 5" },
      { code: "99211", label: "Office visit, established patient, level 1" },
      { code: "99212", label: "Office visit, established patient, level 2" },
      { code: "99213", label: "Office visit, established patient, level 3" },
      { code: "99214", label: "Office visit, established patient, level 4" },
      { code: "99215", label: "Office visit, established patient, level 5" },
    ],
  },
  {
    id: "diagnostic_eval",
    title: "Psychiatric diagnostic examination",
    description: "90791 without medical services; 90792 with medical services. Per AMA: +90785 may also apply with 90791/90792 when interactive mechanisms are documented.",
    codes: [
      { code: "90791", label: "Psychiatric diagnostic examination without medical services" },
      { code: "90792", label: "Psychiatric diagnostic examination with medical services" },
    ],
  },
  {
    id: "psychotherapy_standalone",
    title: "Individual psychotherapy (standalone)",
    description:
      "Insight oriented, behavior modifying and/or supportive. Use only when no E/M (992xx) is billed for the encounter; explicit therapy minutes required. Per AMA: +90785 may apply with these when interactive mechanisms are documented.",
    codes: [
      {
        code: "90832",
        label:
          "Individual psychotherapy, insight oriented, behavior modifying and/or supportive, 30 minutes with patient and/or family (16–37 min documented)",
      },
      {
        code: "90834",
        label:
          "Individual psychotherapy, insight oriented, behavior modifying and/or supportive, 45 minutes with patient and/or family (38–52 min documented)",
      },
      {
        code: "90837",
        label:
          "Individual psychotherapy, insight oriented, behavior modifying and/or supportive, 60 minutes with patient and/or family (53+ min documented)",
      },
    ],
  },
  {
    id: "psychotherapy_addon",
    title: "Psychotherapy add-ons (with E/M same day)",
    description:
      "When performed with evaluation and management (99201–99215). Psychotherapy and E/M must be documented as separate services with separate times. Per AMA: +90785 may apply with these codes when interactive mechanisms are documented.",
    codes: [
      {
        code: "+90833",
        label:
          "Add-on psychotherapy, insight oriented, behavior modifying and/or supportive, 30 min with patient and/or family (16–37 min), with E/M",
      },
      {
        code: "+90836",
        label:
          "Add-on psychotherapy, insight oriented, behavior modifying and/or supportive, 45 min with patient and/or family (38–52 min), with E/M",
      },
      {
        code: "+90838",
        label:
          "Add-on psychotherapy, insight oriented, behavior modifying and/or supportive, 60 min with patient and/or family (53+ min), with E/M",
      },
    ],
  },
  {
    id: "interactive_complexity",
    title: "Interactive complexity (+90785)",
    description:
      "Add-on when play equipment, physical devices, language interpreter, or other communication mechanisms are documented — with 90791/90792, psychotherapy (90832–90838), or group 90853 per payer rules. Do not assign from diagnosis alone.",
    codes: [
      {
        code: "+90785",
        label:
          "Interactive complexity (e.g. play equipment, interpreter, other communication mechanisms) with qualifying psychiatric/psychotherapy services",
      },
    ],
  },
  {
    id: "psychoanalysis",
    title: "Psychoanalysis",
    description: "Standalone procedure — assign only when the note explicitly documents formal psychoanalysis (e.g. analytic technique, free association), not general psychodynamic therapy.",
    codes: [
      {
        code: "90845",
        label: "Psychoanalysis",
      },
    ],
  },
  {
    id: "family_group",
    title: "Family / group psychotherapy",
    description: "Per AMA: +90785 may apply to 90853 when interactive group mechanisms are documented.",
    codes: [
      { code: "90846", label: "Family psychotherapy (without the patient present)" },
      { code: "90847", label: "Family psychotherapy (conjoint psychotherapy) (with patient present)" },
      { code: "90849", label: "Multiple-family group psychotherapy" },
      { code: "90853", label: "Group psychotherapy (other than multiple-family group)" },
    ],
  },
  {
    id: "crisis",
    title: "Psychotherapy for crisis",
    description:
      "Urgent crisis assessment, MSE, disposition, mobilization of resources, and crisis psychotherapy per documentation. 90839: first 60 minutes (30–74 min documented). +90840: each additional 30 minutes beyond the first 74 minutes.",
    codes: [
      { code: "90839", label: "Psychotherapy for crisis; 60 minutes (30–74 min documented)" },
      { code: "+90840", label: "Add-on psychotherapy for crisis — each additional 30 minutes beyond the first 74 minutes" },
    ],
  },
  {
    id: "prolonged_em",
    title: "Prolonged E/M services",
    description:
      "Add-on with qualifying office/outpatient E/M when total time thresholds are explicitly met (e.g. ≥75 min with 99214, ≥89 min with 99215 — verify current AMA/CMS thresholds for the E/M level billed).",
    codes: [
      {
        code: "+99354",
        label: "Prolonged evaluation and management service(s) — first hour beyond usual E/M service (add-on)",
      },
    ],
  },
  {
    id: "other",
    title: "Other psychiatry / behavioral health procedures",
    codes: [
      {
        code: "M0064",
        label:
          "Brief visit for the sole purpose of monitoring or changing drug prescriptions used in the treatment of mental, psychoneurotic, and personality disorders (HCPCS)",
      },
      { code: "90870", label: "Electroconvulsive therapy (includes necessary monitoring)" },
      {
        code: "90887",
        label:
          "Interpretation or explanation of results of psychiatric or other medical examinations and procedures, or other accumulated data, to family or other responsible persons, or advising them how to assist the patient",
      },
      { code: "90899", label: "Unlisted psychiatric service or procedure" },
      {
        code: "96101",
        label:
          "Psychological testing (includes psychodiagnostic assessment of emotionality, intellectual abilities, personality and psychopathology), per hour of psychologist or physician time (face-to-face testing + interpretation/report)",
      },
      {
        code: "96102",
        label:
          "Psychological testing with qualified health care professional interpretation and report, administered by technician, per hour of technician time, face-to-face",
      },
      {
        code: "96103",
        label:
          "Psychological testing administered by a computer with qualified health care professional interpretation and report",
      },
      {
        code: "+96127",
        label:
          "Brief emotional/behavioral assessment (e.g. standardized instrument scoring and documentation) — typically with E/M when requirements met",
      },
    ],
  },
];

function normalizeCode(c) {
  return c.replace(/^\++/, "").trim();
}

/** All procedure codes in the library (add-ons without leading + for lookup) */
export const PSYCHIATRY_CPT_CODE_SET = new Set(
  PSYCHIATRY_CPT_CATEGORIES.flatMap(cat => cat.codes.map(entry => normalizeCode(entry.code))),
);

export function labelForPsychiatryCpt(code) {
  const key = normalizeCode(code);
  for (const cat of PSYCHIATRY_CPT_CATEGORIES) {
    const hit = cat.codes.find(c => normalizeCode(c.code) === key);
    if (hit) return hit.label;
  }
  return null;
}

/**
 * Canonical code string, category section title, and label for a library code (any + prefix variant).
 * Returns null if the code is not in the psychiatry library (e.g. 90899 narrative, or typo).
 */
export function lookUpPsychiatryCpt(code) {
  if (code == null || String(code).trim() === "") return null;
  const key = normalizeCode(String(code));
  for (const cat of PSYCHIATRY_CPT_CATEGORIES) {
    const hit = cat.codes.find(c => normalizeCode(c.code) === key);
    if (hit) {
      return {
        code: hit.code,
        category: cat.title,
        label: hit.label,
      };
    }
  }
  return null;
}

/**
 * Deterministic: replace LLM `category` / `label` / `code` formatting with library values when the code matches.
 */
const STANDALONE_PSYCHOTHERAPY_CODES = new Set(["90832", "90834", "90837"]);

function isOfficeEmCode(code) {
  const n = normalizeCode(String(code || ""));
  if (!/^\d{5}$/.test(n)) return false;
  const num = Number.parseInt(n, 10);
  return (num >= 99201 && num <= 99205) || (num >= 99211 && num <= 99215);
}

/**
 * Standalone psychotherapy (90832/90834/90837) cannot appear in the same encounter as a billed E/M office visit (992xx).
 * Strip LLM mistakes: e.g. 99214 primary + 90832 in recommendedCodes.
 */
export function sanitizeCptEligibilityAgainstPrimary(recommendedPrimaryCode, cptEligibility) {
  if (!cptEligibility || typeof cptEligibility !== "object") return cptEligibility;
  const primary = normalizeCode(String(recommendedPrimaryCode || ""));
  let recommendedCodes = [...(cptEligibility.recommendedCodes ?? [])];
  let eligibleIfDocumentationImproved = [...(cptEligibility.eligibleIfDocumentationImproved ?? [])];

  if (isOfficeEmCode(primary)) {
    recommendedCodes = recommendedCodes.filter(row => !STANDALONE_PSYCHOTHERAPY_CODES.has(normalizeCode(row.code)));
    eligibleIfDocumentationImproved = eligibleIfDocumentationImproved.filter(
      row => !STANDALONE_PSYCHOTHERAPY_CODES.has(normalizeCode(row.code)),
    );
  }

  if (STANDALONE_PSYCHOTHERAPY_CODES.has(primary)) {
    recommendedCodes = recommendedCodes.filter(row => !isOfficeEmCode(row.code));
    eligibleIfDocumentationImproved = eligibleIfDocumentationImproved.filter(row => !isOfficeEmCode(row.code));
  }

  return { ...cptEligibility, recommendedCodes, eligibleIfDocumentationImproved };
}

export function normalizeCptEligibility(cptEligibility) {
  if (!cptEligibility || typeof cptEligibility !== "object") return cptEligibility;
  const mapRow = row => {
    if (!row || typeof row.code !== "string") return row;
    const canon = lookUpPsychiatryCpt(row.code);
    if (!canon) return row;
    return {
      ...row,
      code: canon.code,
      category: canon.category,
      label: canon.label,
    };
  };
  return {
    recommendedCodes: (cptEligibility.recommendedCodes ?? []).map(mapRow),
    eligibleIfDocumentationImproved: (cptEligibility.eligibleIfDocumentationImproved ?? []).map(mapRow),
  };
}

/** Canonical labels for addon codes when present in the library (rationale unchanged). */
export function normalizeAddonCodes(addonCodes) {
  if (!Array.isArray(addonCodes)) return addonCodes;
  return addonCodes.map(row => {
    if (!row || typeof row.code !== "string") return row;
    const canon = lookUpPsychiatryCpt(row.code);
    if (!canon) return row;
    return { ...row, code: canon.code, label: canon.label };
  });
}

/** Canonical label for primary recommended CPT when in library. */
export function normalizeRecommendedCpt(recommendedCpt) {
  if (!recommendedCpt || typeof recommendedCpt.code !== "string") return recommendedCpt;
  const canon = lookUpPsychiatryCpt(recommendedCpt.code);
  if (!canon) return recommendedCpt;
  return { ...recommendedCpt, code: canon.code, label: canon.label };
}

/** Any { code, label, ... } row (e.g. codeRecommendation) — fix code/label when code is in library. */
export function normalizeProcedureCodeRow(row) {
  if (!row || typeof row.code !== "string") return row;
  const canon = lookUpPsychiatryCpt(row.code);
  if (!canon) return row;
  return { ...row, code: canon.code, label: canon.label };
}

/**
 * Appended to the clinical assistant system prompt so the model uses canonical categories/labels.
 */
export function psychiatryCptLibraryPromptAppendix() {
  const lines = [
    "===",
    "",
    "PSYCHIATRY CPT CODE LIBRARY (STRUCTURED — canonical categories and labels)",
    "Use these categories in cptEligibility[].category. Use labels below when populating code objects.",
    "The API overwrites category, label, and code formatting to match this library for any code that matches an entry (deterministic).",
    "Do not invent psychiatry procedure codes outside this library unless the note explicitly describes an unlisted service (90899).",
    "",
  ];
  for (const cat of PSYCHIATRY_CPT_CATEGORIES) {
    lines.push(`### ${cat.title}`);
    if (cat.description) lines.push(cat.description);
    for (const { code, label } of cat.codes) {
      lines.push(`- ${code}: ${label}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
