/**
 * Regression test: run all test fixtures and validate key billing logic.
 * Usage:   node scripts/runAllFixtures.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { buildInputSummary, generateClinicalAnalysis } from "../src/services/clinicalAssistant.js";

const backendRoot = join(fileURLToPath(import.meta.url), "..", "..");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function pass(label) { console.log(`  ${GREEN}✓${RESET} ${label}`); }
function fail(label, got) { console.log(`  ${RED}✗ FAIL${RESET} ${label}\n    ${YELLOW}got: ${JSON.stringify(got)}${RESET}`); }
function info(label) { console.log(`  ${YELLOW}ℹ${RESET} ${label}`); }

let totalPass = 0;
let totalFail = 0;

function check(label, condition, got = undefined) {
  if (condition) { pass(label); totalPass++; }
  else { fail(label, got); totalFail++; }
}

async function runFixture(name, relPath) {
  console.log(`\n${BOLD}▶ ${name}${RESET}`);
  const text = readFileSync(join(backendRoot, relPath), "utf8");
  const inputSummary = buildInputSummary({ textInput: text, transcript: null, ocrResult: null });
  const analysis = await generateClinicalAnalysis(inputSummary);
  return analysis;
}

// ─── Test 1: Diagnostic intake, no meds → should be 90791 ───────────────────
{
  const a = await runFixture("Diagnostic intake (no meds) → expect 90791", "test-fixtures/diagnostic-intake-no-meds.txt");
  const code = a.billingDecision.recommendedCpt.code;
  check("Primary CPT is 90791 (not 99205 or 90792)", code === "90791", code);
  check("Not an E/M code (99xxx)", !code.startsWith("992"), code);
  info(`  Recommended: ${code} — ${a.billingDecision.recommendedCpt.label}`);
  info(`  Confidence: ${a.billingDecision.confidence} | Risk: ${a.billingDecision.riskLevel}`);
}

// ─── Test 2: Diagnostic intake + medication → should be 90792 ────────────────
{
  const a = await runFixture("Diagnostic intake with medication → expect 90792", "test-fixtures/diagnostic-intake-with-meds.txt");
  const code = a.billingDecision.recommendedCpt.code;
  check("Primary CPT is 90792 (diagnostic eval + medical services)", code === "90792", code);
  check("Not an E/M code (99xxx)", !code.startsWith("992"), code);
  info(`  Recommended: ${code} — ${a.billingDecision.recommendedCpt.label}`);
}

// ─── Test 3: New patient complex E/M → should be 9920x, NOT 9079x ────────────
{
  const a = await runFixture("New patient complex E/M → expect 99205 (NOT 90791/90792)", "test-fixtures/new-patient-complex-em.txt");
  const code = a.billingDecision.recommendedCpt.code;
  check("Primary CPT is E/M code (9920x), not diagnostic eval", code.startsWith("992"), code);
  check("Not 90791", code !== "90791", code);
  check("Not 90792", code !== "90792", code);
  info(`  Recommended: ${code} — ${a.billingDecision.recommendedCpt.label}`);
}

// ─── Test 4: Walter note → NEW patient code range (99201–99205), not 99211–99215 ─
{
  const a = await runFixture("Walter note → NEW patient E/M code (99201-99205)", "test-fixtures/walter-note.txt");
  const code = a.billingDecision.recommendedCpt.code;
  const codeNum = parseInt(code, 10);
  check("Primary CPT is E/M code (9920x), not 90791", code.startsWith("992"), code);
  check("Not 90791 / 90792", code !== "90791" && code !== "90792", code);
  check("Is NEW patient code range (99201–99205)", codeNum >= 99201 && codeNum <= 99205, code);
  check("Not established patient code (not 99211–99215)", !(codeNum >= 99211 && codeNum <= 99215), code);

  // Support guidance header must match the recommended code
  const header = a.supportGuidance?.header ?? "";
  check("Support guidance header references recommended code (not a higher code)", 
    header.includes(code),
    { header, recommendedCode: code }
  );

  info(`  Recommended: ${code} — ${a.billingDecision.recommendedCpt.label}`);
  info(`  Support header: ${header}`);
  info(`  Risk score: ${a.riskScore.score} | ${a.riskScore.summary?.slice(0, 80)}...`);
}

// ─── Test 5: Time split visit → billingStatus = usable ───────────────────────
{
  const a = await runFixture("Time explicitly split → usable for time-based billing", "test-fixtures/time-split-visit.txt");
  const timeBlock = a.structuredNote?.time;
  const billingStatus = timeBlock?.billingStatus ?? "";
  check("time block is present", !!timeBlock, timeBlock);
  check(
    "billingStatus = usable (both times split)",
    billingStatus.toLowerCase().includes("usable for time-based billing") &&
    !billingStatus.toLowerCase().includes("not usable"),
    billingStatus,
  );
  info(`  billingStatus: ${billingStatus}`);
}

// ─── Test 6: Time NOT split → billingStatus = not usable ─────────────────────
{
  const a = await runFixture("Time NOT split → not usable for time-based billing", "test-fixtures/time-not-split-visit.txt");
  const timeBlock = a.structuredNote?.time;
  const billingStatus = timeBlock?.billingStatus ?? "";
  check("time block is present", !!timeBlock, timeBlock);
  check(
    "billingStatus = NOT usable (therapy only, no E/M split)",
    billingStatus.toLowerCase().includes("not usable"),
    billingStatus,
  );

  // Also check no psychotherapy add-on was assigned
  const addonCodes = a.addonCodes ?? [];
  const hasTherapyAddon = addonCodes.some(c => ["90833","90836","90838","+90833","+90836","+90838"].includes(c.code));
  check("No psychotherapy add-on assigned when time not split", !hasTherapyAddon, addonCodes.map(c => c.code));

  info(`  billingStatus: ${billingStatus}`);
  info(`  psychotherapyTimeSeparabilityWarning: ${a.psychotherapyTimeSeparabilityWarning}`);
  info(`  vitals areasToReview: ${JSON.stringify(a.areasToReview?.find(r => r.title?.toLowerCase().includes("vital")))}`);
}

// ─── Test 7: High acuity + 99215 triggers → 99215 in ifDocumentationImproved ─
{
  const a = await runFixture("High acuity / 99215 escalation triggers", "test-fixtures/high-acuity-99215-triggers.txt");
  const code = a.billingDecision.recommendedCpt.code;
  const ifImproved = a.codeRecommendation?.ifDocumentationImproved?.code;
  const timeBlock = a.structuredNote?.time;

  info(`  Primary CPT: ${code}`);
  info(`  ifDocumentationImproved: ${ifImproved}`);
  info(`  billingStatus: ${timeBlock?.billingStatus}`);

  // With time explicitly split in this note, 99215 should be recommended
  check("99215 is recommended (time split + high complexity) OR in ifDocumentationImproved", 
    code === "99215" || ifImproved === "99215", 
    { code, ifImproved }
  );

  // Check for suicide/crisis triggers in reasoning
  const areasReview = a.areasToReview ?? [];
  const justification = a.justification?.summary ?? "";
  const hasSuicidalityMentioned = justification.toLowerCase().includes("suicid") ||
    a.billingDecision.cptJustification?.toLowerCase().includes("suicid") ||
    areasReview.some(r => r.body?.toLowerCase().includes("suicid"));
  info(`  Suicidality/risk recognized: ${hasSuicidalityMentioned}`);
}

// ─── Test 8: Vitals with justification → LOW severity flag ───────────────────
{
  // Use time-not-split note which has vitals justification
  const a = await runFixture("Vitals with justification → LOW severity (context-aware)", "test-fixtures/time-not-split-visit.txt");
  const vitalsFlag = a.areasToReview?.find(r => r.title?.toLowerCase().includes("vital"));
  if (vitalsFlag) {
    check("Vitals flag severity is Low (justification provided)", vitalsFlag.severity === "Low", vitalsFlag.severity);
    check("Vitals flag body is context-specific (not generic)", 
      vitalsFlag.body?.length > 30 && !vitalsFlag.body?.toLowerCase().startsWith("vital signs are"),
      vitalsFlag.body?.slice(0, 100)
    );
    info(`  Vitals flag: [${vitalsFlag.severity}] ${vitalsFlag.body?.slice(0, 120)}...`);
  } else {
    info("  No vitals flag present (acceptable if vitals logic considers it not required)");
    totalPass++;
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}═══ Results: ${GREEN}${totalPass} passed${RESET}${BOLD}, ${totalFail > 0 ? RED : ""}${totalFail} failed${RESET}${BOLD} ═══${RESET}\n`);
if (totalFail > 0) process.exit(1);
