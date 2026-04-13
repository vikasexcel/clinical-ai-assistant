import { memo } from "react";

const riskLevelColors = {
  Low: "border-emerald-300 bg-emerald-50 text-emerald-800",
  Medium: "border-amber-300 bg-amber-50 text-amber-900",
  High: "border-red-300 bg-red-50 text-red-800",
};

const riskLevelBadgeColors = {
  Low: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
  Medium: "bg-amber-100 text-amber-900 ring-1 ring-amber-300",
  High: "bg-red-100 text-red-800 ring-1 ring-red-300",
};

const severityColors = {
  High: "bg-red-100 text-red-800 ring-1 ring-red-200",
  Medium: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  Low: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
};

const severityBorderColors = {
  High: "border-red-200 bg-red-50/40",
  Medium: "border-amber-200 bg-amber-50/40",
  Low: "border-emerald-200 bg-emerald-50/40",
};

const difficultyColors = {
  Easy: "bg-emerald-100 text-emerald-800",
  Medium: "bg-amber-100 text-amber-900",
  Hard: "bg-red-100 text-red-800",
};

function Section({ children, title }) {
  return (
    <section className="py-5 first:pt-0">
      <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-clinical-muted">{title}</h3>
      {children}
    </section>
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
    inputSummary,
  } = result;

  const primaryIcd = icd10?.primary ?? null;
  const secondaryCodes = icd10?.secondaryCodes ?? [];

  return (
    <article className="text-[15px] leading-relaxed text-clinical-ink" aria-labelledby="response-title">

      {/* Input Warnings */}
      {inputSummary?.warnings?.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[14px] text-amber-600">⚠</span>
            <p className="text-[12px] font-medium uppercase tracking-wider text-amber-800">Input Warnings</p>
          </div>
          <ul className="m-0 space-y-1.5 pl-0">
            {inputSummary.warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2 text-[14px] leading-relaxed text-amber-950/90">
                <span className="mt-1 text-amber-600/80">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="divide-y divide-clinical-border-soft">

        {/* ── Risk Header Panel ── */}
        {(riskScore || billingDecision) && (
          <section className="py-5 first:pt-0">
            <div className={`rounded-xl border p-5 ${riskLevelColors[billingDecision?.riskLevel] || "border-slate-200 bg-slate-50"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className={`inline-block rounded-lg px-3 py-1.5 text-[13px] font-bold uppercase tracking-wide ${riskLevelBadgeColors[billingDecision?.riskLevel] || ""}`}>
                    {billingDecision?.riskLevel} RISK
                  </span>
                  {riskScore?.score && (
                    <p className="mt-2 text-[18px] font-bold text-current">Score: {riskScore.score}/10</p>
                  )}
                </div>
                <div className="flex gap-6">
                  {billingDecision?.downcodingRisk != null && (
                    <div className="text-right">
                      <p className="text-[11px] font-medium uppercase tracking-wider opacity-70">Downcoding</p>
                      <p className="text-[22px] font-bold leading-none">{billingDecision.downcodingRisk}%</p>
                    </div>
                  )}
                  {billingDecision?.denialRisk != null && (
                    <div className="text-right">
                      <p className="text-[11px] font-medium uppercase tracking-wider opacity-70">Denial</p>
                      <p className="text-[22px] font-bold leading-none">{billingDecision.denialRisk}%</p>
                    </div>
                  )}
                </div>
              </div>
              {riskScore?.summary && (
                <p className="mt-3 text-[14px] leading-relaxed opacity-90">{riskScore.summary}</p>
              )}
            </div>
          </section>
        )}

        {/* ── Code Recommendation Table ── */}
        {codeRecommendation && (
          <Section title="Code Recommendation">
            <div className="overflow-hidden rounded-xl border border-clinical-border shadow-sm">
              {[
                { rowLabel: "AI Suggested Code", data: codeRecommendation.aiSuggestedCode, bg: "bg-sky-50", border: "border-sky-200", textColor: "text-sky-900", codeColor: "bg-sky-100 text-sky-900" },
                { rowLabel: "Audit-Safe Code", data: codeRecommendation.auditSafeCode, bg: "bg-emerald-50", border: "border-emerald-200", textColor: "text-emerald-900", codeColor: "bg-emerald-100 text-emerald-900" },
                { rowLabel: "If Documentation Improved", data: codeRecommendation.ifDocumentationImproved, bg: "bg-slate-50", border: "border-slate-200", textColor: "text-slate-700", codeColor: "bg-slate-200 text-slate-800" },
              ].filter(row => row.data).map((row, i) => (
                <div key={i} className={`flex items-start gap-4 border-b last:border-b-0 ${row.border} ${row.bg} px-5 py-4`}>
                  <div className="min-w-[180px]">
                    <p className={`text-[11px] font-medium uppercase tracking-wider ${row.textColor} opacity-70`}>{row.rowLabel}</p>
                    <p className={`mt-1.5 inline-block rounded px-2 py-0.5 font-mono text-[18px] font-bold ${row.codeColor}`}>{row.data.code}</p>
                    <p className={`mt-0.5 text-[12px] font-medium ${row.textColor}`}>{row.data.label}</p>
                  </div>
                  <p className={`flex-1 pt-5 text-[13px] leading-relaxed ${row.textColor} opacity-80`}>{row.data.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Add-on Codes ── */}
        {billingDecision?.addonCodes?.length > 0 && (
          <Section title="Add-on Codes">
            <ul className="m-0 space-y-2 pl-0">
              {billingDecision.addonCodes.map((addon) => (
                <li key={addon.code} className="flex items-start gap-3 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-2.5">
                  <span className="mt-0.5 inline-block rounded bg-indigo-100 px-2 py-0.5 font-mono text-[12px] font-semibold text-indigo-900 ring-1 ring-indigo-200 whitespace-nowrap">
                    +{addon.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-indigo-900">{addon.label}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">{addon.rationale}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── Defensive Guidance + Downcode Risk Line ── */}
        {(lightDefensiveGuidance || downcodeRiskLine) && (
          <section className="py-5 space-y-2">
            {lightDefensiveGuidance && (
              <div className="flex items-start gap-2 rounded-lg bg-slate-100 px-3 py-2.5">
                <span className="mt-0.5 text-[13px] text-slate-500">📋</span>
                <p className="text-[13px] leading-relaxed text-slate-800">{lightDefensiveGuidance}</p>
              </div>
            )}
            {downcodeRiskLine && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2.5">
                <span className="mt-0.5 text-[13px] text-amber-600">⚠</span>
                <p className="text-[13px] leading-relaxed text-amber-950/90">{downcodeRiskLine}</p>
              </div>
            )}
          </section>
        )}

        {/* ── Justification ── */}
        {justification && (
          <section className="py-5">
            <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/80 p-4">
              <div className="border-l-2 border-sky-600 pl-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-sky-800">Why this level is appropriate</p>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-900">{justification.summary}</p>
              </div>
              {justification.complexityFactors?.length > 0 && (
                <div className="border-t border-sky-200 pt-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-sky-800">Complexity Factors Detected</p>
                  <ul className="m-0 space-y-1.5 pl-0">
                    {justification.complexityFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2 text-[14px] leading-relaxed text-sky-950/85">
                        <span className="mt-1.5 text-sky-600">✓</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Smart Warning ── */}
        {smartWarning && (
          <section className="py-5">
            <div className="rounded-xl border border-red-300 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-[18px] text-red-600">⚠</span>
                <div className="flex-1">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-800">Critical Alert</p>
                  <p className="text-[15px] font-medium leading-relaxed text-red-950">{smartWarning.message}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Areas to Review ── */}
        {areasToReview?.length > 0 && (
          <Section title="Areas to Review">
            <div className="space-y-3">
              {areasToReview.map((area, index) => (
                <div key={index} className={`rounded-xl border p-4 ${severityBorderColors[area.severity]}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${severityColors[area.severity]}`}>
                      {area.severity}
                    </span>
                    <p className="text-[14px] font-semibold text-slate-900">{area.title}</p>
                  </div>
                  <p className="text-[13px] leading-relaxed text-slate-700">{area.body}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Suggested Improvements ── */}
        {suggestedImprovements?.length > 0 && (
          <Section title="Suggested Improvements">
            <div className="space-y-2">
              {suggestedImprovements.map((item, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg border border-clinical-border bg-clinical-surface px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[12px] font-bold text-slate-700">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-slate-900">{item.category}</span>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${difficultyColors[item.difficulty]}`}>
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-slate-700">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Main Issue + Support Guidance ── */}
        {(mainIssue || supportGuidance) && (
          <Section title={mainIssue ? "Main Issue & How to Support This Level" : "How to Support This Level"}>
            <div className="space-y-4">
              {mainIssue && (
                <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                  <div className="border-l-2 border-amber-600 pl-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-amber-800">Issue</p>
                    <p className="mt-1 text-[15px] font-medium leading-relaxed text-amber-950">{mainIssue.issue}</p>
                  </div>
                  <div className="border-l-2 border-amber-400 pl-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-amber-800/90">Why it matters</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-slate-800">{mainIssue.whyItMatters}</p>
                  </div>
                </div>
              )}
              {supportGuidance && (
                <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <p className="text-[13px] font-semibold text-emerald-900">{supportGuidance.header}</p>
                  <ul className="m-0 space-y-3 pl-0">
                    {supportGuidance.items.map((item, index) => (
                      <li key={index} className="flex gap-3 border-l-2 border-emerald-400 pl-3">
                        <span className="mt-1 text-[11px] font-bold text-emerald-700">{index + 1}.</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] leading-relaxed text-slate-900">{item.action}</p>
                          {item.example && (
                            <div className="mt-2 rounded-lg bg-emerald-100/80 px-3 py-2 text-[13px] italic text-emerald-900/80">
                              "{item.example}"
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── Structured Chart ── */}
        {structuredNote && (
          <Section title="Structured Chart">
            <div className="overflow-hidden rounded-xl border border-clinical-border bg-clinical-surface shadow-sm">
              <div className="flex items-center justify-between border-b border-clinical-border-soft bg-clinical-elevated/60 px-5 py-3.5">
                <h4 className="font-display text-[15px] font-semibold text-clinical-ink">Structured Chart</h4>
                <button
                  onClick={() => {
                    const lines = [
                      structuredNote.chiefComplaint ? `CHIEF COMPLAINT\n${structuredNote.chiefComplaint}` : null,
                      structuredNote.hpi ? `\nHISTORY OF PRESENT ILLNESS\n${structuredNote.hpi}` : null,
                      structuredNote.ros ? `\nREVIEW OF SYSTEMS\n${structuredNote.ros.note}` : null,
                      structuredNote.mentalStatusExam ? `\nMENTAL STATUS EXAM\n${structuredNote.mentalStatusExam}` : null,
                      structuredNote.mdm ? `\nMEDICAL DECISION MAKING\nOverall: ${structuredNote.mdm.overall}` : null,
                      structuredNote.assessment ? `\nASSESSMENT\n${structuredNote.assessment}` : null,
                      structuredNote.plan ? `\nPLAN\n${structuredNote.plan}` : null,
                    ].filter(Boolean).join("\n");
                    navigator.clipboard?.writeText(lines);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-clinical-border bg-clinical-surface px-3 py-1.5 text-[12px] text-clinical-muted transition hover:border-clinical-line/40 hover:bg-clinical-elevated hover:text-clinical-ink"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
                  Copy
                </button>
              </div>

              <div className="divide-y divide-clinical-border-soft px-5">
                {structuredNote.chiefComplaint && (
                  <div className="py-4">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-clinical-accent">Chief Complaint</p>
                    <p className="text-[14px] leading-relaxed text-slate-900">{structuredNote.chiefComplaint}</p>
                  </div>
                )}

                {structuredNote.hpi && (
                  <div className="py-4">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-clinical-muted">History of Present Illness</p>
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-800">{structuredNote.hpi}</p>
                    {structuredNote.hpiElements && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {[
                          { key: "location", label: "location" },
                          { key: "quality", label: "quality" },
                          { key: "severity", label: "severity" },
                          { key: "duration", label: "duration" },
                          { key: "modifyingFactors", label: "modifying factors" },
                          { key: "associatedSignsSymptoms", label: "associated signs/symptoms" },
                          { key: "timing", label: "timing" },
                          { key: "context", label: "context" },
                        ].map(({ key, label }) => {
                          const present = structuredNote.hpiElements[key];
                          return (
                            <span
                              key={key}
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                                present
                                  ? "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200"
                                  : "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                              }`}
                            >
                              {present ? label : `${label} (missing)`}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {structuredNote.hpiLevel && (
                      <p className="mt-2 text-[12px] text-slate-500">HPI Level: {structuredNote.hpiLevel}</p>
                    )}
                  </div>
                )}

                {structuredNote.ros && (
                  <div className="py-4">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-clinical-muted">Review of Systems</p>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {structuredNote.ros.systems.map((system) => (
                        <span key={system} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
                          {system}
                        </span>
                      ))}
                    </div>
                    <p className="text-[12px] leading-relaxed text-slate-600">
                      ROS Level: {structuredNote.ros.level} — {structuredNote.ros.note}
                    </p>
                  </div>
                )}

                {structuredNote.mentalStatusExam && (
                  <div className="py-4">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-clinical-muted">Mental Status Exam</p>
                    <p className="text-[14px] leading-relaxed text-slate-800">{structuredNote.mentalStatusExam}</p>
                  </div>
                )}

                {structuredNote.mdm && (
                  <div className="py-4">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-clinical-muted">Medical Decision Making</p>
                    <div className="overflow-hidden rounded-lg border border-clinical-border">
                      <table className="w-full border-collapse text-[13px]">
                        <thead>
                          <tr className="border-b border-clinical-border-soft bg-slate-50">
                            <th className="py-2 pl-3 pr-2 text-left font-semibold text-slate-600">Component</th>
                            <th className="py-2 px-2 text-left font-semibold text-slate-600">Level</th>
                            <th className="py-2 pl-2 pr-3 text-left font-semibold text-slate-600">Justification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-clinical-border-soft">
                          {[
                            { label: "Problems", data: structuredNote.mdm.problems },
                            { label: "Data", data: structuredNote.mdm.data },
                            { label: "Risk", data: structuredNote.mdm.risk },
                          ].map(({ label, data }) => (
                            <tr key={label}>
                              <td className="py-2.5 pl-3 pr-2 font-medium text-slate-900">{label}</td>
                              <td className="py-2.5 px-2">
                                <span className={`inline-block rounded px-2 py-0.5 text-[12px] font-semibold ${
                                  data.level === "High" ? "bg-red-100 text-red-800" :
                                  data.level === "Moderate" ? "bg-amber-100 text-amber-900" :
                                  data.level === "Low" ? "bg-sky-100 text-sky-900" :
                                  "bg-slate-100 text-slate-600"
                                }`}>
                                  {data.level}
                                </span>
                              </td>
                              <td className="py-2.5 pl-2 pr-3 text-slate-700">{data.justification}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 text-[12px] text-slate-600">
                      Overall MDM Level: <span className="font-semibold text-slate-900">{structuredNote.mdm.overall}</span>
                    </p>
                  </div>
                )}

                {structuredNote.assessment && (
                  <div className="py-4">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-clinical-muted">Assessment</p>
                    <p className="text-[14px] leading-relaxed text-slate-800">{structuredNote.assessment}</p>
                  </div>
                )}

                {structuredNote.plan && (
                  <div className="py-4">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-clinical-muted">Plan</p>
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-800">{structuredNote.plan}</p>
                  </div>
                )}

                {structuredNote.time && (
                  <div className="py-4">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-clinical-muted">Time</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] text-slate-900">
                        {structuredNote.time.minutesDocumented} minutes documented
                      </span>
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[12px] font-semibold text-sky-900 ring-1 ring-sky-200">
                        Supports {structuredNote.time.supportsCode}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-slate-500">{structuredNote.time.note}</p>
                  </div>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* ── ICD-10 ── */}
        {primaryIcd && (
          <Section title="ICD-10 Codes">
            <div className="space-y-4 rounded-xl border border-clinical-border bg-clinical-elevated/50 p-4">
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-clinical-muted">Primary Diagnosis</p>
                <div className="flex items-start gap-3 border-l-2 border-sky-600 pl-3">
                  <div className="flex-1">
                    <span className="inline-block rounded bg-sky-100 px-2 py-0.5 font-mono text-[12px] font-semibold text-sky-900">
                      {primaryIcd.code}
                    </span>
                    <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-slate-900">{primaryIcd.label}</p>
                    {primaryIcd.rationale && (
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{primaryIcd.rationale}</p>
                    )}
                  </div>
                </div>
              </div>

              {secondaryCodes.length > 0 && (
                <div className="border-t border-clinical-border-soft pt-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">Secondary (Active Comorbidities)</p>
                  <ul className="m-0 flex list-none flex-col gap-3 p-0">
                    {secondaryCodes.map((item) => (
                      <li key={item.code} className="flex items-start gap-3 border-l-2 border-slate-300 pl-3">
                        <div className="flex-1">
                          <span className="inline-block rounded bg-slate-200 px-2 py-0.5 font-mono text-[12px] font-semibold text-slate-800">
                            {item.code}
                          </span>
                          <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-slate-700">{item.label}</p>
                          {item.rationale && (
                            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{item.rationale}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

      </div>
    </article>
  );
}

export const StructuredResult = memo(StructuredResultComponent);
