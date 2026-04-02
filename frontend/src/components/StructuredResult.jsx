import { memo } from "react";

const riskLevelColors = {
  Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  Medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  High: "border-red-500/30 bg-red-500/10 text-red-300",
};

const confidenceColors = {
  High: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  Medium: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  Low: "bg-slate-500/20 text-slate-200 border-slate-500/30",
};

function Section({ children, title }) {
  return (
    <section className="py-5 first:pt-0">
      <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-chat-muted">{title}</h3>
      {children}
    </section>
  );
}

function StructuredResultComponent({ result }) {
  if (!result) {
    return null;
  }

  const {
    billingDecision,
    lightDefensiveGuidance,
    downcodeRiskLine,
    justification,
    mainIssue,
    supportGuidance,
    structuredNote,
    smartWarning,
    icd10,
    inputSummary,
  } = result;

  const primaryIcd = icd10?.primary ?? null;
  const secondaryCodes = icd10?.secondaryCodes ?? [];

  return (
    <article className="text-[15px] leading-relaxed" aria-labelledby="response-title">
      {inputSummary?.warnings?.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-950/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[14px] text-amber-400">⚠</span>
            <p className="text-[12px] font-medium uppercase tracking-wider text-amber-400/90">Input Warnings</p>
          </div>
          <ul className="m-0 space-y-1.5 pl-0">
            {inputSummary.warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2 text-[14px] leading-relaxed text-amber-100/80">
                <span className="mt-1 text-amber-400/60">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="divide-y divide-white/[0.08]">
        {/* ── a. Billing Decision ── */}
        <Section title="a. Billing Decision">
          <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-5">
            {/* CPT + justification */}
            <div className="border-l-4 border-sky-500 bg-sky-950/20 pl-4 pr-4 py-3">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-sky-400/80">Recommended CPT</p>
              <p className="text-[22px] font-bold tracking-tight text-white">
                {billingDecision.recommendedCpt.code}
              </p>
              <p className="mt-0.5 text-[14px] text-white/70">{billingDecision.recommendedCpt.label}</p>
              {billingDecision.cptJustification && (
                <p className="mt-2 text-[13px] leading-relaxed text-sky-100/75 italic">
                  {billingDecision.cptJustification}
                </p>
              )}
            </div>

            {/* Confidence + Risk Level */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">Confidence</p>
                <span
                  className={`inline-block rounded px-3 py-1.5 text-[13px] font-semibold ${confidenceColors[billingDecision.confidence]}`}
                >
                  {billingDecision.confidence}
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">Risk Level</p>
                <span
                  className={`inline-block rounded px-3 py-1.5 text-[13px] font-semibold ${riskLevelColors[billingDecision.riskLevel]}`}
                >
                  {billingDecision.riskLevel}
                </span>
              </div>
            </div>

            {/* Risk percentages */}
            <div className="grid gap-3 border-t border-white/5 pt-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-amber-400/70">Downcoding Risk</p>
                <p className="text-[28px] font-bold leading-none text-amber-300/90">{billingDecision.downcodingRisk}%</p>
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-red-400/70">Denial Risk</p>
                <p className="text-[28px] font-bold leading-none text-red-300/90">{billingDecision.denialRisk}%</p>
              </div>
            </div>

            {/* Light defensive guidance */}
            {lightDefensiveGuidance && (
              <div className="border-t border-white/5 pt-4">
                <div className="flex items-start gap-2 rounded bg-slate-800/50 px-3 py-2.5">
                  <span className="mt-0.5 text-[13px] text-slate-400">📋</span>
                  <p className="text-[13px] leading-relaxed text-slate-200/80">{lightDefensiveGuidance}</p>
                </div>
              </div>
            )}

            {/* Downcode risk line — always shown */}
            {downcodeRiskLine && (
              <div className="flex items-start gap-2 rounded border border-amber-500/20 bg-amber-950/20 px-3 py-2.5">
                <span className="mt-0.5 text-[13px] text-amber-400">⚠</span>
                <p className="text-[13px] leading-relaxed text-amber-100/80">{downcodeRiskLine}</p>
              </div>
            )}
          </div>
        </Section>

        {/* Justification — unlabeled, appears when present */}
        {justification && (
          <section className="py-5">
            <div className="space-y-4 rounded-lg border border-sky-500/40 bg-sky-950/20 p-4">
              <div className="border-l-2 border-sky-500 pl-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-sky-400/80">Why this level is appropriate</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/90">{justification.summary}</p>
              </div>
              <div className="border-t border-sky-500/20 pt-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-sky-400/80">Complexity Factors Detected</p>
                <ul className="m-0 space-y-1.5 pl-0">
                  {justification.complexityFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2 text-[14px] leading-relaxed text-sky-100/80">
                      <span className="mt-1.5 text-sky-400">✓</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Smart Warning — unlabeled, high risk only */}
        {smartWarning && (
          <section className="py-5">
            <div className="rounded-lg border border-red-500/50 bg-red-950/30 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-[18px] text-red-400">⚠</span>
                <div className="flex-1">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-400/80">Critical Alert</p>
                  <p className="text-[15px] font-medium leading-relaxed text-red-100/90">{smartWarning.message}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── b. Main Issue + How to Support (merged) ── */}
        <Section title={mainIssue ? "b. Main Issue & How to Support This Level" : "b. How to Support This Level"}>
          <div className="space-y-4">
            {mainIssue && (
              <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-950/20 p-4">
                <div className="border-l-2 border-amber-500 pl-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400/80">Issue</p>
                  <p className="mt-1 text-[15px] font-medium leading-relaxed text-amber-100/90">{mainIssue.issue}</p>
                </div>
                <div className="border-l-2 border-amber-500/40 pl-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400/60">Why it matters</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-white/80">{mainIssue.whyItMatters}</p>
                </div>
              </div>
            )}

            {supportGuidance && (
              <div className="space-y-4 rounded-lg border border-emerald-600/30 bg-emerald-950/20 p-4">
                <p className="text-[13px] font-semibold text-emerald-300/90">{supportGuidance.header}</p>
                <ul className="m-0 space-y-3 pl-0">
                  {supportGuidance.items.map((item, index) => (
                    <li key={index} className="flex gap-3 border-l-2 border-emerald-600/40 pl-3">
                      <span className="mt-1 text-[11px] font-bold text-emerald-500/60">{index + 1}.</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] leading-relaxed text-white/90">{item.action}</p>
                        {item.example && (
                          <div className="mt-2 rounded bg-emerald-950/40 px-3 py-2 text-[13px] italic text-emerald-100/60">
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

        {/* ── c. Structured Chart ── */}
        <Section title="c. Structured Chart">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">

            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <h4 className="text-[14px] font-semibold text-white/90">Structured Chart</h4>
              <button
                onClick={() => {
                  const lines = [
                    `CHIEF COMPLAINT\n${structuredNote.chiefComplaint}`,
                    `\nHISTORY OF PRESENT ILLNESS\n${structuredNote.hpi}`,
                    structuredNote.ros ? `\nREVIEW OF SYSTEMS\n${structuredNote.ros.note}` : null,
                    structuredNote.mentalStatusExam ? `\nMENTAL STATUS EXAM\n${structuredNote.mentalStatusExam}` : null,
                    structuredNote.mdm ? `\nMEDICAL DECISION MAKING\nOverall: ${structuredNote.mdm.overall}` : null,
                    `\nASSESSMENT\n${structuredNote.assessment}`,
                    `\nPLAN\n${structuredNote.plan}`,
                  ].filter(Boolean).join("\n");
                  navigator.clipboard?.writeText(lines);
                }}
                className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-white/60 transition hover:bg-white/10 hover:text-white/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
                Copy
              </button>
            </div>

            <div className="divide-y divide-white/[0.06] px-5">

              {/* Chief Complaint */}
              <div className="py-4">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-400">Chief Complaint</p>
                <p className="text-[14px] leading-relaxed text-white/90">{structuredNote.chiefComplaint}</p>
              </div>

              {/* HPI */}
              <div className="py-4">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-white/50">History of Present Illness</p>
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white/85">{structuredNote.hpi}</p>
                {/* HPI element tags */}
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
                              ? "bg-indigo-500/15 text-indigo-300/90 ring-1 ring-indigo-500/25"
                              : "bg-amber-500/10 text-amber-400/80 ring-1 ring-amber-500/20"
                          }`}
                        >
                          {present ? label : `${label} (missing)`}
                        </span>
                      );
                    })}
                  </div>
                )}
                {structuredNote.hpiLevel && (
                  <p className="mt-2 text-[12px] text-white/40">HPI Level: {structuredNote.hpiLevel}</p>
                )}
              </div>

              {/* Review of Systems */}
              {structuredNote.ros && (
                <div className="py-4">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-white/50">Review of Systems</p>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {structuredNote.ros.systems.map((system) => (
                      <span
                        key={system}
                        className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-white/70 ring-1 ring-white/10"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                  <p className="text-[12px] leading-relaxed text-white/50">
                    ROS Level: {structuredNote.ros.level} — {structuredNote.ros.note}
                  </p>
                </div>
              )}

              {/* Mental Status Exam */}
              {structuredNote.mentalStatusExam && (
                <div className="py-4">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-white/50">Mental Status Exam</p>
                  <p className="text-[14px] leading-relaxed text-white/85">{structuredNote.mentalStatusExam}</p>
                </div>
              )}

              {/* MDM Table */}
              {structuredNote.mdm && (
                <div className="py-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/50">Medical Decision Making</p>
                  <div className="overflow-hidden rounded-lg border border-white/10">
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.04]">
                          <th className="py-2 pl-3 pr-2 text-left font-semibold text-white/60">Component</th>
                          <th className="py-2 px-2 text-left font-semibold text-white/60">Level</th>
                          <th className="py-2 pl-2 pr-3 text-left font-semibold text-white/60">Justification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {[
                          { label: "Problems", data: structuredNote.mdm.problems },
                          { label: "Data", data: structuredNote.mdm.data },
                          { label: "Risk", data: structuredNote.mdm.risk },
                        ].map(({ label, data }) => (
                          <tr key={label}>
                            <td className="py-2.5 pl-3 pr-2 font-medium text-white/85">{label}</td>
                            <td className="py-2.5 px-2">
                              <span className={`inline-block rounded px-2 py-0.5 text-[12px] font-semibold ${
                                data.level === "High" ? "bg-red-500/15 text-red-300" :
                                data.level === "Moderate" ? "bg-amber-500/15 text-amber-300" :
                                data.level === "Low" ? "bg-sky-500/15 text-sky-300" :
                                "bg-white/[0.08] text-white/60"
                              }`}>
                                {data.level}
                              </span>
                            </td>
                            <td className="py-2.5 pl-2 pr-3 text-white/70">{data.justification}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-[12px] text-white/50">
                    Overall MDM Level: <span className="font-semibold text-white/75">{structuredNote.mdm.overall}</span>
                  </p>
                </div>
              )}

              {/* Plan */}
              <div className="py-4">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-white/50">Plan</p>
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white/85">{structuredNote.plan}</p>
              </div>

              {/* Time */}
              {structuredNote.time && (
                <div className="py-4">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-white/50">Time</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] text-white/85">
                      {structuredNote.time.minutesDocumented} minutes documented
                    </span>
                    <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[12px] font-semibold text-sky-300 ring-1 ring-sky-500/25">
                      Supports {structuredNote.time.supportsCode}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-white/45">{structuredNote.time.note}</p>
                </div>
              )}

            </div>
          </div>
        </Section>

        {/* ── d. ICD-10 ── */}
        {primaryIcd && (
          <Section title="d. ICD-10">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-4">
              {/* Primary */}
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">Primary Diagnosis</p>
                <div className="flex items-start gap-3 border-l-2 border-sky-500/60 pl-3">
                  <div className="flex-1">
                    <span className="inline-block rounded bg-sky-900/60 px-2 py-0.5 font-mono text-[12px] font-semibold text-sky-300">
                      {primaryIcd.code}
                    </span>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-white/85">{primaryIcd.label}</p>
                  </div>
                </div>
              </div>

              {/* Secondary codes */}
              {secondaryCodes.length > 0 && (
                <div className="border-t border-white/5 pt-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/40">Secondary (Active Comorbidities)</p>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {secondaryCodes.map((item) => (
                      <li key={item.code} className="flex items-start gap-3 border-l-2 border-slate-600/50 pl-3">
                        <div className="flex-1">
                          <span className="inline-block rounded bg-slate-800/60 px-2 py-0.5 font-mono text-[12px] font-semibold text-slate-300">
                            {item.code}
                          </span>
                          <p className="mt-1.5 text-[14px] leading-relaxed text-white/70">{item.label}</p>
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
