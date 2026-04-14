import { memo, useCallback } from "react";

function inferReviewCategory(title, body) {
  const t = `${title} ${body}`.toLowerCase();
  if (t.includes("addon") || t.includes("99080") || t.includes("add-on")) return "Add-on Codes";
  if (t.includes("time") || t.includes("minute") || t.includes("psychotherapy")) return "Time";
  if (t.includes("medication") || t.includes("prescri")) return "Medication";
  if (t.includes("document")) return "Documentation";
  return "Clinical review";
}

/** Fallback when API does not send areasToReview.code — pick first 5-digit CPT-like token */
function firstLikelyProcedureCode(text) {
  if (!text || typeof text !== "string") return null;
  const m = text.match(/\b(\d{5})\b/);
  return m ? m[1] : null;
}

function RiskSummaryPanel({ billingDecision, riskScore }) {
  if (!billingDecision && !riskScore) return null;

  const level = billingDecision?.riskLevel ?? "Medium";
  const isMedium = level === "Medium";
  const isHigh = level === "High";
  const borderLeft = isHigh ? "border-l-[#DC2626]" : isMedium ? "border-l-[#D97706]" : "border-l-[#059669]";
  const badgeBg = isHigh ? "bg-red-200 text-red-950" : isMedium ? "bg-[#FDE68A] text-[#92400E]" : "bg-emerald-200 text-emerald-950";

  return (
    <section className={`rounded-lg border border-[#E5E7EB] bg-[#FFFBEB] ${borderLeft} border-l-[5px] p-3 sm:p-4`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${badgeBg}`}>
          {String(level).toUpperCase()} RISK
        </span>
        {riskScore?.score != null ? (
          <span className="text-[13px] text-[#6B7280]">
            Score: <strong className="font-bold text-gray-900">{riskScore.score}/10</strong>
          </span>
        ) : null}
        {billingDecision?.downcodingRisk != null ? (
          <span className="text-[13px] text-[#6B7280]">
            Downcoding: <strong className="font-bold text-gray-900">{billingDecision.downcodingRisk}%</strong>
          </span>
        ) : null}
        {billingDecision?.denialRisk != null ? (
          <span className="text-[13px] text-[#6B7280]">
            Denial: <strong className="font-bold text-gray-900">{billingDecision.denialRisk}%</strong>
          </span>
        ) : null}
      </div>
      {riskScore?.summary ? (
        <p className="mt-2 text-[13px] leading-snug text-[#6B7280]">{riskScore.summary}</p>
      ) : null}
    </section>
  );
}

function CodeRecommendationGrid({ codeRecommendation }) {
  if (!codeRecommendation) return null;

  const columns = [
    {
      key: "ai",
      header: "AI Suggested Codes",
      data: codeRecommendation.aiSuggestedCode,
      wrapClass: "bg-[#F8FAFC]",
      headerClass: "text-[#475569]",
      codeClass: "text-gray-900",
      descClass: "text-[#6B7280]",
    },
    {
      key: "audit",
      header: "Audit-Safe Codes",
      data: codeRecommendation.auditSafeCode,
      wrapClass: "bg-[#FFFBEB]",
      headerClass: "text-[#B45309]",
      codeClass: "text-[#92400E]",
      descClass: "text-[#B45309]/90",
    },
    {
      key: "improved",
      header: "If Documentation Improved",
      data: codeRecommendation.ifDocumentationImproved,
      wrapClass: "bg-[#F0FDFA]",
      headerClass: "text-[#0D9488]",
      codeClass: "text-[#0F766E]",
      descClass: "text-[#0D9488]/90",
    },
  ].filter((c) => c.data);

  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white p-3 sm:p-4">
      <h3 className="mb-2.5 text-[14px] font-bold text-gray-900">Code Recommendation</h3>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:items-stretch">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`flex min-h-0 flex-col rounded-lg border border-[#E5E7EB]/80 p-3 ${col.wrapClass}`}
          >
            <p className={`text-[11px] font-medium ${col.headerClass}`}>{col.header}</p>
            <p className={`mt-2 font-mono text-[1.125rem] font-bold leading-tight sm:text-[1.25rem] ${col.codeClass}`}>
              {col.data.code}
            </p>
            {col.data.label ? (
              <p className={`mt-0.5 text-[12px] font-medium ${col.headerClass}`}>{col.data.label}</p>
            ) : null}
            <p className={`mt-1.5 flex-1 text-[12px] leading-snug ${col.descClass}`}>{col.data.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function severityAreaBadge(severity) {
  if (severity === "Low") return "bg-[#ECFDF5] text-[#047857] ring-1 ring-[#A7F3D0]";
  if (severity === "High") return "bg-red-100 text-red-900 ring-1 ring-red-200";
  return "bg-[#FFEDD5] text-[#C2410C] ring-1 ring-[#FDBA74]";
}

function AreasToReviewPanel({ areasToReview }) {
  if (!areasToReview?.length) return null;

  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white p-3 sm:p-4">
      <h3 className="mb-2 text-[14px] font-bold text-gray-900">Areas to Review</h3>
      <div className="divide-y divide-[#E5E7EB]">
        {areasToReview.map((area, index) => {
          const category = inferReviewCategory(area.title, area.body);
          const rawCode = area.code != null && String(area.code).trim() !== "" ? String(area.code).trim() : null;
          const displayCode = rawCode || firstLikelyProcedureCode(`${area.title} ${area.body}`);
          return (
            <div key={index} className="flex gap-2.5 py-2.5 first:pt-0 last:pb-0">
              <span
                className={`h-fit shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${severityAreaBadge(area.severity)}`}
              >
                {area.severity}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[12px] text-[#6B7280]">{category}</span>
                  {displayCode ? (
                    <span className="rounded-md bg-[#F3F4F6] px-1.5 py-px font-mono text-[11px] font-semibold text-[#111827] ring-1 ring-[#E5E7EB]">
                      {displayCode.replace(/^\+/, "")}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[14px] font-semibold text-[#111827]">{area.title}</p>
                <p className="mt-1 text-[13px] italic leading-snug text-[#6B7280]">{area.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChevronDown({ open, className = "" }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-[#9CA3AF] transition-transform ${open ? "rotate-180" : ""} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SuggestedImprovementsList({ suggestedImprovements }) {
  if (!suggestedImprovements?.length) return null;

  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white p-3 sm:p-4">
      <h3 className="mb-2.5 text-[14px] font-bold text-[#111827]">Suggested Improvements</h3>
      <ul className="m-0 list-none space-y-2 p-0">
        {suggestedImprovements.map((item, index) => (
          <li key={index}>
            <div className="flex w-full items-start gap-2.5 rounded-lg border border-[#F3F4F6] bg-white p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D1FAE5] text-[12px] font-bold text-[#047857]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] text-[#6B7280]">{item.category}</span>
                  <span className="rounded-full bg-[#ECFDF5] px-1.5 py-0.5 text-[10px] font-bold text-[#10B981]">
                    {item.difficulty}
                  </span>
                </div>
                <p className="mt-1 text-[14px] leading-snug text-[#374151]">{item.description}</p>
              </div>
              <ChevronDown open={false} className="mt-0.5 h-4 w-4 shrink-0" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function confidenceBadgeClass(c) {
  if (c === "High") return "bg-[#DCFCE7] text-[#166534] ring-1 ring-[#BBF7D0]";
  if (c === "Low") return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  return "bg-amber-50 text-amber-900 ring-1 ring-amber-200";
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function tagHpi(present) {
  return present
    ? "rounded-md bg-[#CCFBF1] px-2.5 py-0.5 text-[11px] font-medium text-[#115E59] ring-1 ring-[#99F6E4]"
    : "rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200";
}

function tagRos() {
  return "rounded-md bg-[#EDE9FE] px-2.5 py-0.5 text-[11px] font-medium text-[#5B21B6] ring-1 ring-[#DDD6FE]";
}

function mdmLevelPill(level) {
  const tone =
    level === "High"
      ? "bg-red-100 text-red-900 ring-red-200"
      : level === "Moderate"
        ? "bg-[#EDE9FE] text-[#4C1D95] ring-[#DDD6FE]"
        : "bg-sky-100 text-sky-900 ring-sky-200";
  return `inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${tone}`;
}

function StructuredChartCard({ structuredNote, primaryCptCode }) {
  const copyAll = useCallback(() => {
    const lines = [
      structuredNote.chiefComplaint ? `CHIEF COMPLAINT\n${structuredNote.chiefComplaint}` : null,
      structuredNote.hpi ? `\nHISTORY OF PRESENT ILLNESS\n${structuredNote.hpi}` : null,
      structuredNote.ros ? `\nREVIEW OF SYSTEMS\n${structuredNote.ros.note}` : null,
      structuredNote.mentalStatusExam ? `\nMENTAL STATUS EXAM\n${structuredNote.mentalStatusExam}` : null,
      structuredNote.mdm ? `\nMEDICAL DECISION MAKING\nOverall: ${structuredNote.mdm.overall}` : null,
      structuredNote.assessment ? `\nASSESSMENT\n${structuredNote.assessment}` : null,
      structuredNote.plan ? `\nPLAN\n${structuredNote.plan}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard?.writeText(lines);
  }, [structuredNote]);

  const hpiKeys = [
    { key: "location", label: "location" },
    { key: "quality", label: "quality" },
    { key: "severity", label: "severity" },
    { key: "duration", label: "duration" },
    { key: "modifyingFactors", label: "modifying factors" },
    { key: "associatedSignsSymptoms", label: "associated signs/symptoms" },
    { key: "timing", label: "timing" },
    { key: "context", label: "context" },
  ];

  return (
    <section className="rounded-lg border border-[#E5E7EB] border-l-[3px] border-l-[#2DD4BF] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Structured Chart</h3>
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center justify-center gap-1.5 self-start rounded border border-[#D1D5DB] bg-[#F3F4F6] px-2.5 py-1 text-[12px] text-[#6B7280] transition hover:bg-[#E5E7EB]"
        >
          <CopyIcon />
          Copy
        </button>
      </div>

      <div className="space-y-5">
        {structuredNote.chiefComplaint ? (
          <div>
            <h4 className="text-[15px] font-bold text-gray-800">Chief Complaint</h4>
            <p className="mt-1.5 text-[14px] leading-snug text-[#374151]">{structuredNote.chiefComplaint}</p>
          </div>
        ) : null}

        {structuredNote.hpi ? (
          <div>
            <h4 className="text-[15px] font-bold text-gray-800">History of Present Illness</h4>
            <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-snug text-[#374151]">{structuredNote.hpi}</p>
            {structuredNote.hpiElements ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {hpiKeys.map(({ key, label }) => {
                  const val = structuredNote.hpiElements[key];
                  const present = val === true;
                  return (
                    <span key={key} className={tagHpi(present)}>
                      {present ? label : `${label} (not explicitly documented)`}
                    </span>
                  );
                })}
              </div>
            ) : null}
            {structuredNote.hpiLevel ? (
              <p className="mt-1.5 text-[12px] text-[#9CA3AF]">HPI Level: {structuredNote.hpiLevel}</p>
            ) : null}
          </div>
        ) : null}

        {structuredNote.ros ? (
          <div>
            <h4 className="text-[15px] font-bold text-gray-800">Review of Systems</h4>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {structuredNote.ros.systems.map((system) => (
                <span key={system} className={tagRos()}>
                  {system}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[13px] leading-snug text-[#6B7280]">
              ROS Level: {structuredNote.ros.level} — {structuredNote.ros.note}
            </p>
          </div>
        ) : null}

        {structuredNote.mentalStatusExam ? (
          <div>
            <h4 className="text-[15px] font-bold text-gray-800">Mental Status Exam</h4>
            <p className="mt-1.5 text-[14px] leading-snug text-[#374151]">{structuredNote.mentalStatusExam}</p>
          </div>
        ) : null}

        {structuredNote.mdm ? (
          <div>
            <h4 className="text-[15px] font-bold text-gray-800">Medical Decision Making</h4>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[20rem] border-collapse text-[13px]">
                <thead>
                  <tr className="text-left text-[12px] font-semibold text-[#6B7280]">
                    <th className="pb-2 pr-3 font-semibold">Component</th>
                    <th className="pb-2 pr-3 font-semibold">Level</th>
                    <th className="pb-2 font-semibold">Justification</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Problems", data: structuredNote.mdm.problems },
                    { label: "Data", data: structuredNote.mdm.data },
                    { label: "Risk", data: structuredNote.mdm.risk },
                  ].map(({ label, data }) => (
                    <tr key={label}>
                      <td className="py-2 pr-3 align-top font-medium text-gray-900">{label}</td>
                      <td className="py-2 pr-3 align-top">
                        <span className={mdmLevelPill(data.level)}>{data.level}</span>
                      </td>
                      <td className="py-2 align-top leading-snug text-[#374151]">{data.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[14px] font-bold text-gray-900">
              Overall MDM Level: {structuredNote.mdm.overall}
            </p>
          </div>
        ) : null}

        {structuredNote.assessment ? (
          <div>
            <h4 className="text-[15px] font-bold text-gray-800">Assessment</h4>
            <p className="mt-1.5 text-[14px] leading-snug text-[#374151]">{structuredNote.assessment}</p>
          </div>
        ) : null}

        {structuredNote.plan ? (
          <div>
            <h4 className="text-[15px] font-bold text-gray-800">Plan</h4>
            <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-snug text-[#374151]">{structuredNote.plan}</p>
          </div>
        ) : null}

        {structuredNote.time ? (
          <div>
            <h4 className="text-[15px] font-bold text-gray-800">Time</h4>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[14px] text-[#374151]">{structuredNote.time.minutesDocumented} minutes total</span>
              {structuredNote.time.billingStatus ? (
                <span className="rounded-md bg-[#EDE9FE] px-2.5 py-0.5 text-[12px] font-semibold text-[#5B21B6] ring-1 ring-[#DDD6FE]">
                  {structuredNote.time.billingStatus}
                </span>
              ) : null}
              {primaryCptCode ? (
                <span className="rounded-md bg-sky-100 px-2.5 py-0.5 text-[12px] font-semibold text-sky-900 ring-1 ring-sky-200">
                  Supports {primaryCptCode}
                </span>
              ) : null}
            </div>
            {structuredNote.time.note ? (
              <p className="mt-1.5 text-[12px] leading-snug text-[#9CA3AF]">{structuredNote.time.note}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CptIcdTwoColumn({ billingDecision, addonCodes, justification, lightDefensiveGuidance, icd10 }) {
  if (!billingDecision) return null;

  const primary = billingDecision.recommendedCpt;
  const secondaryList = icd10?.secondaryCodes ?? [];
  const totalIcd = (icd10?.primary ? 1 : 0) + secondaryList.length;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start lg:gap-4">
      <div className="min-w-0 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-4">
        <h3 className="text-[14px] font-bold text-gray-900">CPT Codes</h3>

        <div className="mt-2.5 rounded-lg border border-[#99F6E4] bg-[#F2FAF9] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[1.2rem] font-bold text-[#0D6A6B] sm:text-[1.3rem]">{primary.code}</span>
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${confidenceBadgeClass(billingDecision.confidence)}`}>
              {billingDecision.confidence} confidence
            </span>
          </div>
          <p className="mt-1.5 text-[13px] font-medium text-[#0D6A6B]">{primary.label}</p>
          <p className="mt-1.5 text-[12px] leading-snug text-[#0D6A6B]/85">{billingDecision.cptJustification}</p>
        </div>

        {addonCodes?.length > 0 ? (
          <>
            <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              Add-on codes
            </p>
            <ul className="m-0 space-y-2 p-0">
              {addonCodes.map((addon) => {
                const addOnOnly = addon.code.replace(/^\+/, "");
                return (
                  <li
                    key={addon.code}
                    className="rounded-lg border border-[#5EEAD4]/50 bg-white p-2.5 ring-1 ring-[#CCFBF1]/80"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#CCFBF1] px-2 py-0.5 font-mono text-[12px] font-bold text-[#0D6A6B] ring-1 ring-[#99F6E4]">
                        {addOnOnly}
                      </span>
                      <span className="text-[12px] font-medium text-[#6B7280]">with E/M</span>
                      <span className="font-mono text-[12px] font-semibold text-[#374151]">{primary.code}</span>
                    </div>
                    <p className="mt-1.5 text-[12px] font-medium text-[#374151]">{addon.label}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#6B7280]">{addon.rationale}</p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {justification?.summary ? (
          <div className="mt-3 space-y-2 text-[13px] leading-snug text-[#374151]">
            <p>{justification.summary}</p>
            {justification.complexityFactors?.length > 0 ? (
              <ul className="m-0 list-disc space-y-0.5 pl-4 text-[12px] text-[#4B5563]">
                {justification.complexityFactors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {lightDefensiveGuidance ? (
          <div className="mt-3 rounded-lg bg-[#EDF3FF] px-2.5 py-2 text-[12px] leading-snug text-[#3E63B4]">
            {lightDefensiveGuidance}
          </div>
        ) : null}
      </div>

      <div className="h-fit min-w-0 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-4">
        <h3 className="text-[14px] font-bold text-gray-900">
          ICD-10 Codes{" "}
          {totalIcd > 0 ? (
            <span className="text-[12px] font-normal text-[#9CA3AF]">({totalIcd} found)</span>
          ) : null}
        </h3>

        {icd10?.primary ? (
          <ul className="m-0 mt-2 space-y-1.5 p-0">
            <li className="rounded-lg bg-[#F8F9FE] px-2 py-1.5 sm:px-2.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-mono text-[13px] font-bold text-gray-900">{icd10.primary.code}</span>
                <span className="rounded-md bg-[#CCFBF1] px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-[#115E59] ring-1 ring-[#99F6E4]">
                  Primary
                </span>
              </div>
              <p className="mt-0.5 text-[13px] font-semibold leading-snug text-gray-900">{icd10.primary.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#6B7280]">{icd10.primary.rationale}</p>
            </li>
            {secondaryList.map((item) => (
              <li key={item.code} className="rounded-lg bg-[#F8F9FE] px-2 py-1.5 sm:px-2.5">
                <span className="font-mono text-[13px] font-bold text-gray-900">{item.code}</span>
                <p className="mt-0.5 text-[13px] font-semibold leading-snug text-gray-900">{item.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#6B7280]">{item.rationale}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[12px] text-[#9CA3AF]">No ICD-10 codes in response.</p>
        )}
      </div>
    </div>
  );
}

function StructuredResultComponent({ result }) {
  if (!result) return null;

  const {
    billingDecision,
    riskScore,
    codeRecommendation,
    lightDefensiveGuidance,
    downcodeRiskLine,
    justification,
    mainIssue,
    supportGuidance,
    areasToReview,
    suggestedImprovements,
    structuredNote,
    smartWarning,
    icd10,
    addonCodes,
    inputSummary,
  } = result;

  return (
    <article className="break-words space-y-3 text-[14px] leading-snug" aria-labelledby="response-title">
      <h2 id="response-title" className="sr-only">
        Analysis results
      </h2>

      {inputSummary?.warnings?.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="mb-1.5 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-amber-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-[12px] font-medium uppercase tracking-wider text-amber-800">Input Warnings</p>
          </div>
          <ul className="m-0 space-y-1 pl-0">
            {inputSummary.warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2 text-[13px] leading-snug text-amber-950/90">
                <span className="mt-1 text-amber-600/80">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {smartWarning ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3">
          <div className="flex items-start gap-2.5">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-800">Critical Alert</p>
              <p className="text-[14px] font-medium leading-snug text-red-950">{smartWarning.message}</p>
            </div>
          </div>
        </div>
      ) : null}

      <RiskSummaryPanel billingDecision={billingDecision} riskScore={riskScore} />

      <CodeRecommendationGrid codeRecommendation={codeRecommendation} />

      {downcodeRiskLine ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-[#FFFBEB] px-2.5 py-2 text-[12px] leading-snug text-amber-950">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>{downcodeRiskLine}</span>
        </div>
      ) : null}

      <AreasToReviewPanel areasToReview={areasToReview} />

      <SuggestedImprovementsList suggestedImprovements={suggestedImprovements} />

      {(mainIssue || supportGuidance) ? (
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-3 sm:p-4">
          <h3 className="mb-2 text-[13px] font-bold text-gray-900">Clinical guidance</h3>
          {mainIssue ? (
            <div className="mb-3 space-y-1.5 rounded-lg border border-amber-100 bg-[#FFFBEB] p-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">Issue</p>
              <p className="text-[14px] font-medium text-amber-950">{mainIssue.issue}</p>
              <p className="text-[12px] text-[#92400E]">{mainIssue.whyItMatters}</p>
            </div>
          ) : null}
          {supportGuidance ? (
            <div>
              <p className="text-[13px] font-semibold text-[#0D6A6B]">{supportGuidance.header}</p>
              <ul className="m-0 mt-1.5 space-y-1.5 pl-3">
                {supportGuidance.items.map((item, i) => (
                  <li key={i} className="text-[12px] leading-snug text-[#374151]">
                    <span className="font-semibold text-[#00685b]">{i + 1}.</span> {item.action}
                    {item.example ? (
                      <span className="mt-1 block italic text-[#6B7280]">“{item.example}”</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {structuredNote ? (
        <StructuredChartCard primaryCptCode={billingDecision?.recommendedCpt?.code} structuredNote={structuredNote} />
      ) : null}

      <CptIcdTwoColumn
        addonCodes={addonCodes}
        billingDecision={billingDecision}
        icd10={icd10}
        justification={justification}
        lightDefensiveGuidance={lightDefensiveGuidance}
      />
    </article>
  );
}

export const StructuredResult = memo(StructuredResultComponent);
