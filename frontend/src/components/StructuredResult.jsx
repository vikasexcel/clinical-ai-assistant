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

  const { billingDecision, mainIssue, actionableFixes, structuredNote, smartWarning, icd10Suggestions, inputSummary } =
    result;

  return (
    <article className="text-[15px] leading-relaxed" aria-labelledby="response-title">
      {inputSummary?.warnings?.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <ul className="m-0 list-disc space-y-1 pl-5 text-[14px] text-amber-100/90">
            {inputSummary.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="divide-y divide-white/[0.08]">
        <Section title="1. Billing Decision">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-[12px] font-medium text-chat-muted">Recommended CPT</p>
                <p className="text-[20px] font-semibold text-white">
                  {billingDecision.recommendedCpt.code}
                </p>
                <p className="text-[14px] text-white/70">{billingDecision.recommendedCpt.label}</p>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="mb-1 text-[12px] font-medium text-chat-muted">Confidence</p>
                  <span
                    className={`inline-block rounded-md border px-3 py-1 text-[13px] font-medium ${confidenceColors[billingDecision.confidence]}`}
                  >
                    {billingDecision.confidence}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="mb-1 text-[12px] font-medium text-chat-muted">Risk Level</p>
                  <span
                    className={`inline-block rounded-md border px-3 py-1 text-[13px] font-medium ${riskLevelColors[billingDecision.riskLevel]}`}
                  >
                    {billingDecision.riskLevel}
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-[12px] font-medium text-chat-muted">Downcoding Risk</p>
                  <p className="text-[18px] font-semibold text-white">{billingDecision.downcodingRisk}%</p>
                </div>
                <div>
                  <p className="mb-1 text-[12px] font-medium text-chat-muted">Denial Risk</p>
                  <p className="text-[18px] font-semibold text-white">{billingDecision.denialRisk}%</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {smartWarning && (
          <Section title="⚠️ High Risk Warning">
            <div className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-3">
              <p className="text-[15px] font-medium leading-relaxed text-red-200">{smartWarning.message}</p>
            </div>
          </Section>
        )}

        {mainIssue && (
          <Section title="2. Main Issue">
            <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <div>
                <p className="text-[14px] font-semibold text-amber-100">Main Issue:</p>
                <p className="mt-1 text-[15px] leading-relaxed text-white/90">{mainIssue.issue}</p>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-amber-100">Why it matters:</p>
                <p className="mt-1 text-[15px] leading-relaxed text-white/90">{mainIssue.whyItMatters}</p>
              </div>
            </div>
          </Section>
        )}

        <Section title="3. Actionable Fixes">
          <div className="space-y-3">
            <p className="text-[15px] font-semibold text-white">{actionableFixes.header}</p>
            <ul className="m-0 space-y-3 pl-0">
              {actionableFixes.fixes.map((fix, index) => (
                <li key={index} className="flex gap-3">
                  <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-relaxed text-white/90">{fix.action}</p>
                    {fix.example && (
                      <p className="mt-1 text-[14px] italic leading-relaxed text-white/60">
                        Example: "{fix.example}"
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section title="4. Structured Note">
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-[13px] font-semibold text-chat-muted">Chief Complaint:</p>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">
                {structuredNote.chiefComplaint}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[13px] font-semibold text-chat-muted">HPI:</p>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">{structuredNote.hpi}</p>
            </div>
            <div>
              <p className="mb-1 text-[13px] font-semibold text-chat-muted">Assessment:</p>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">
                {structuredNote.assessment}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[13px] font-semibold text-chat-muted">Plan:</p>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">{structuredNote.plan}</p>
            </div>
          </div>
        </Section>

        {icd10Suggestions && icd10Suggestions.length > 0 && (
          <Section title="5. ICD-10 Suggestions">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {icd10Suggestions.map((item) => (
                <li key={item.code} className="text-[15px] leading-relaxed">
                  <span className="font-mono text-[13px] text-white">{item.code}</span>
                  <span className="text-chat-muted"> — {item.label}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </article>
  );
}

export const StructuredResult = memo(StructuredResultComponent);
