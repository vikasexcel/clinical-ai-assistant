import { memo } from "react";

const riskToneClasses = {
  LOW: "text-emerald-300/95",
  MEDIUM: "text-amber-200/95",
  HIGH: "text-red-200/95",
};

function Section({ children, title }) {
  return (
    <section className="py-5 first:pt-0">
      <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-chat-muted">{title}</h3>
      {children}
    </section>
  );
}

function CodeList({ title, items }) {
  return (
    <Section title={title}>
      {items.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((item) => (
            <li key={`${title}-${item.code}`} className="text-[15px] leading-relaxed">
              <span className="font-mono text-[13px] text-white">{item.code}</span>
              <span className="text-chat-muted"> — {item.label}</span>
              <p className="mt-1 text-[15px] text-white/80">{item.rationale}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[15px] text-chat-muted">No confident suggestions from this draft.</p>
      )}
    </Section>
  );
}

function TextBlock({ title, text: blockText }) {
  return (
    <Section title={title}>
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/85">{blockText}</p>
    </Section>
  );
}

function StructuredResultComponent({ result }) {
  if (!result) {
    return null;
  }

  const { clinicalNote, codingSuggestions, disclaimer, improvementSuggestions, inputSummary, riskAnalysis } =
    result;

  return (
    <article className="text-[15px] leading-relaxed" aria-labelledby="response-title">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-5">
        <div className="min-w-0 space-y-1">
          <h2 id="response-title" className="text-lg font-semibold text-white">
            Note draft
          </h2>
          <p className="text-[15px] text-white/75">{clinicalNote.summary}</p>
        </div>
        <span
          className={`shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] font-medium ${riskToneClasses[riskAnalysis.level] ?? riskToneClasses.MEDIUM}`}
        >
          {riskAnalysis.level} risk
        </span>
      </div>

      <div className="divide-y divide-white/[0.08]">
      {inputSummary.warnings.length > 0 ? (
        <Section title="Input notes">
          <ul className="m-0 list-disc space-y-1 pl-5 text-[15px] text-amber-100/90">
            {inputSummary.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <TextBlock title="Subjective" text={clinicalNote.subjective} />
      <TextBlock title="Objective" text={clinicalNote.objective} />
      <TextBlock title="Assessment" text={clinicalNote.assessment} />
      <TextBlock title="Plan" text={clinicalNote.plan} />

      <Section title="Missing information">
        {clinicalNote.missingInformation.length > 0 ? (
          <ul className="m-0 list-disc space-y-1 pl-5 text-[15px] text-white/80">
            {clinicalNote.missingInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[15px] text-chat-muted">No major gaps highlighted.</p>
        )}
      </Section>

      <CodeList title="CPT ideas" items={codingSuggestions.cpt} />
      <CodeList title="ICD-10 ideas" items={codingSuggestions.icd10} />

      <Section title="Risk analysis">
        <p className="text-[15px] text-white/80">{riskAnalysis.summary}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-chat-muted">Supporting</p>
            {riskAnalysis.supportingFactors.length > 0 ? (
              <ul className="m-0 list-disc space-y-1 pl-5 text-[15px] text-white/75">
                {riskAnalysis.supportingFactors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-chat-muted">—</p>
            )}
          </div>
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-chat-muted">Watch</p>
            {riskAnalysis.watchItems.length > 0 ? (
              <ul className="m-0 list-disc space-y-1 pl-5 text-[15px] text-white/75">
                {riskAnalysis.watchItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-chat-muted">—</p>
            )}
          </div>
        </div>
      </Section>

      <Section title="Improvements">
        {improvementSuggestions.length > 0 ? (
          <ul className="m-0 list-disc space-y-1 pl-5 text-[15px] text-white/80">
            {improvementSuggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[15px] text-chat-muted">None suggested.</p>
        )}
      </Section>

      <Section title="Disclaimer">
        <p className="text-[14px] text-chat-muted">{disclaimer}</p>
      </Section>
      </div>
    </article>
  );
}

export const StructuredResult = memo(StructuredResultComponent);
