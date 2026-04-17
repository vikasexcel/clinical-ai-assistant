/**
 * Verifies deterministic CPT canonicalization (no network).
 * Run: npm test  (from backend/) or node scripts/verifyCanonicalCpt.mjs
 */
import assert from "node:assert/strict";

import {
  lookUpPsychiatryCpt,
  normalizeAddonCodes,
  normalizeCptEligibility,
  normalizeProcedureCodeRow,
  normalizeRecommendedCpt,
  sanitizeCptEligibilityAgainstPrimary,
} from "../src/data/psychiatryCptLibrary.js";

function test(name, fn) {
  try {
    fn();
    console.log(`ok  ${name}`);
  } catch (e) {
    console.error(`FAIL ${name}`);
    throw e;
  }
}

// +90785 / 90785 → library category + label
test("lookUpPsychiatryCpt normalizes 90785 to +90785 and interactive category", () => {
  const a = lookUpPsychiatryCpt("90785");
  const b = lookUpPsychiatryCpt("+90785");
  assert.equal(a.code, "+90785");
  assert.equal(b.code, "+90785");
  assert.equal(a.category, "Interactive complexity (+90785)");
  assert.ok(a.label.includes("Interactive complexity"));
});

test("normalizeCptEligibility replaces wrong category/label for +90785", () => {
  const out = normalizeCptEligibility({
    recommendedCodes: [
      {
        code: "90785",
        label: "Wrong label",
        category: "Other",
        rationale: "Model rationale preserved",
      },
    ],
    eligibleIfDocumentationImproved: [
      {
        code: "+90838",
        label: "x",
        category: "x",
        documentationNeeded: "Need E/M minutes",
      },
    ],
  });
  assert.equal(out.recommendedCodes[0].code, "+90785");
  assert.equal(out.recommendedCodes[0].category, "Interactive complexity (+90785)");
  assert.equal(out.recommendedCodes[0].rationale, "Model rationale preserved");
  assert.equal(out.eligibleIfDocumentationImproved[0].code, "+90838");
  assert.equal(out.eligibleIfDocumentationImproved[0].category, "Psychotherapy add-ons (with E/M same day)");
  assert.equal(out.eligibleIfDocumentationImproved[0].documentationNeeded, "Need E/M minutes");
});

test("normalizeCptEligibility leaves unknown codes untouched", () => {
  const out = normalizeCptEligibility({
    recommendedCodes: [{ code: "99999", label: "L", category: "C", rationale: "r" }],
    eligibleIfDocumentationImproved: [],
  });
  assert.equal(out.recommendedCodes[0].code, "99999");
  assert.equal(out.recommendedCodes[0].category, "C");
});

test("normalizeAddonCodes canonicalizes labels", () => {
  const out = normalizeAddonCodes([
    { code: "90785", label: "short", rationale: "interactive complexity documented" },
  ]);
  assert.equal(out[0].code, "+90785");
  assert.ok(out[0].label.length > 20);
  assert.equal(out[0].rationale, "interactive complexity documented");
});

test("normalizeRecommendedCpt for 99214", () => {
  const out = normalizeRecommendedCpt({
    code: "99214",
    label: "wrong",
  });
  assert.equal(out.label, "Office visit, established patient, level 4");
});

test("normalizeProcedureCodeRow preserves description", () => {
  const out = normalizeProcedureCodeRow({
    code: "99213",
    label: "x",
    description: "Auditor text stays",
  });
  assert.equal(out.code, "99213");
  assert.equal(out.description, "Auditor text stays");
  assert.equal(out.label, "Office visit, established patient, level 3");
});

test("sanitizeCptEligibilityAgainstPrimary removes 90832 when primary is 99214", () => {
  const out = sanitizeCptEligibilityAgainstPrimary("99214", {
    recommendedCodes: [
      { code: "99214", label: "x", category: "E/M Codes", rationale: "r1" },
      { code: "90832", label: "bad", category: "Standalone", rationale: "should drop" },
      { code: "+90785", label: "x", category: "y", rationale: "r2" },
    ],
    eligibleIfDocumentationImproved: [{ code: "90834", label: "x", category: "c", documentationNeeded: "d" }],
  });
  assert.equal(out.recommendedCodes.length, 2);
  assert.ok(!out.recommendedCodes.some(r => r.code.includes("90832")));
  assert.equal(out.eligibleIfDocumentationImproved.length, 0);
});

test("sanitizeCptEligibilityAgainstPrimary keeps standalone when primary is 90837", () => {
  const out = sanitizeCptEligibilityAgainstPrimary("90837", {
    recommendedCodes: [
      { code: "90837", label: "x", category: "Standalone", rationale: "r" },
      { code: "99214", label: "bad", category: "E/M", rationale: "drop" },
    ],
    eligibleIfDocumentationImproved: [],
  });
  assert.equal(out.recommendedCodes.length, 1);
  assert.equal(out.recommendedCodes[0].code, "90837");
});

console.log("\nAll canonical CPT verification tests passed.\n");
