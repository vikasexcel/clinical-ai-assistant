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
    justification,
    defensiveDocumentation,
    mainIssue,
    actionableFixes,
    structuredNote,
    smartWarning,
    icd10Suggestions,
    inputSummary,
  } = result;

  return (
    <article className="text-[15px] leading-relaxed" aria-labelledby="response-title">
      {inputSummary?.warnings?.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-950/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[14px] text-amber-400">⚠</span>
            <p className="text-[12px] font-medium uppercase tracking-wider text-amber-400/90">Input Warnings</p>
          </div>
          <ul className="m-0 space-y-1.5 pl-0">
            {inputSummary.warnings.map((warning, index) => (
              <li key={warning} className="flex items-start gap-2 text-[14px] leading-relaxed text-amber-100/80">
                <span className="mt-1 text-amber-400/60">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="divide-y divide-white/[0.08]">
        <Section title="1. Billing Decision">
          <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-5">
            <div className="border-l-4 border-sky-500 bg-sky-950/20 pl-4 pr-4 py-3">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-sky-400/80">Recommended CPT</p>
              <p className="text-[22px] font-bold tracking-tight text-white">
                {billingDecision.recommendedCpt.code}
              </p>
              <p className="mt-0.5 text-[14px] text-white/70">{billingDecision.recommendedCpt.label}</p>
            </div>

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
          </div>
        </Section>

        {justification && (
          <Section title="2. Justification">
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
          </Section>
        )}

        {defensiveDocumentation && (
          <Section title="3. What to Include to Defend This Level">
            <div className="space-y-4 rounded-lg border border-purple-500/40 bg-purple-950/20 p-4">
              <p className="text-[13px] font-semibold text-purple-300/90">{defensiveDocumentation.header}</p>
              <ul className="m-0 space-y-3 pl-0">
                {defensiveDocumentation.requiredElements.map((item, index) => (
                  <li key={index} className="flex gap-3 border-l-2 border-purple-600/40 pl-3">
                    <span className="mt-1 text-[11px] font-bold text-purple-500/60">{index + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] leading-relaxed text-white/90">{item.element}</p>
                      {item.example && (
                        <div className="mt-2 rounded bg-purple-950/40 px-3 py-2 text-[13px] italic text-purple-100/60">
                          "{item.example}"
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {smartWarning && (
          <Section title="⚠️ High Risk Warning">
            <div className="rounded-lg border border-red-500/50 bg-red-950/30 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-[18px] text-red-400">⚠</span>
                <div className="flex-1">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-400/80">Critical Alert</p>
                  <p className="text-[15px] font-medium leading-relaxed text-red-100/90">{smartWarning.message}</p>
                </div>
              </div>
            </div>
          </Section>
        )}

        {mainIssue && (
          <Section title={justification || defensiveDocumentation ? "4. Main Issue" : "2. Main Issue"}>
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
          </Section>
        )}

        <Section
          title={
            justification || defensiveDocumentation
              ? mainIssue
                ? "5. Actionable Fixes"
                : "4. Actionable Fixes"
              : "3. Actionable Fixes"
          }
        >
          <div className="space-y-4 rounded-lg border border-emerald-600/30 bg-emerald-950/20 p-4">
            <p className="text-[13px] font-semibold text-emerald-300/90">{actionableFixes.header}</p>
            <ul className="m-0 space-y-3 pl-0">
              {actionableFixes.fixes.map((fix, index) => (
                <li key={index} className="flex gap-3 border-l-2 border-emerald-600/40 pl-3">
                  <span className="mt-1 text-[11px] font-bold text-emerald-500/60">
                    {index + 1}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] leading-relaxed text-white/90">{fix.action}</p>
                    {fix.example && (
                      <div className="mt-2 rounded bg-emerald-950/40 px-3 py-2 text-[13px] italic text-emerald-100/60">
                        "{fix.example}"
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          title={
            justification || defensiveDocumentation
              ? mainIssue
                ? "6. Structured Note"
                : "5. Structured Note"
              : "4. Structured Note"
          }
        >
          <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-400/80">Chief Complaint</p>
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white/95">
                {structuredNote.chiefComplaint}
              </p>
            </div>
            <div className="border-t border-white/5 pt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">HPI</p>
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white/85">{structuredNote.hpi}</p>
            </div>
            <div className="border-t border-white/5 pt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">Assessment</p>
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white/85">
                {structuredNote.assessment}
              </p>
            </div>
            <div className="border-t border-white/5 pt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">Plan</p>
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white/85">{structuredNote.plan}</p>
            </div>
          </div>
        </Section>

        {icd10Suggestions && icd10Suggestions.length > 0 && (
          <Section
            title={
              justification || defensiveDocumentation
                ? mainIssue
                  ? "7. ICD-10 Suggestions"
                  : "6. ICD-10 Suggestions"
                : "5. ICD-10 Suggestions"
            }
          >
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {icd10Suggestions.map((item) => (
                  <li key={item.code} className="flex items-start gap-3 border-l-2 border-slate-600/50 pl-3">
                    <div className="flex-1">
                      <span className="inline-block rounded bg-slate-800/60 px-2 py-0.5 font-mono text-[12px] font-semibold text-slate-300">
                        {item.code}
                      </span>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-white/85">{item.label}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}
      </div>
    </article>
  );
}

export const StructuredResult = memo(StructuredResultComponent);
