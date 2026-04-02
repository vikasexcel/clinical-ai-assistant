/**
 * Demo drafts for testing billing-assistant behavior (risk levels, CPT fit).
 */
export const CLINICAL_SAMPLE_SCENARIOS = [
  {
    id: "follow-up-25",
    label: "25-min Follow-Up Visit",
    text: `Pt is a 34yo female, established patient, presenting for follow-up of MDD and GAD. She was started on sertraline 50mg 4 weeks ago.

She reports mood is "a little better" but still has low energy and difficulty concentrating at work. Sleep improved from 4 hrs/night to 6 hrs/night. Appetite is still poor, lost 5 lbs since last visit. Denies SI/HI. No panic attacks this month (had 2 last month).

She is doing weekly CBT with her therapist and reports finding it helpful. Still having some anticipatory anxiety about work presentations but manageable.

PHQ-9: 12 (was 18 last visit). GAD-7: 10 (was 14 last visit).

MSE: Alert and oriented x4. Dressed casually, appropriate grooming. Speech normal rate and rhythm. Mood "okay I guess." Affect mildly constricted but reactive. Thought process linear and goal-directed. No delusions or hallucinations. Denies SI/HI. Insight fair, judgment intact.

Plan: Increase sertraline to 100mg. Continue CBT weekly. Recheck PHQ-9 and GAD-7 in 4 weeks. Follow up in 4 weeks. Discussed potential side effects of dose increase. Patient agrees with plan.

Time spent: 25 minutes total.`,
  },
  {
    id: "new-patient-45",
    label: "45-min New Patient Intake",
    text: `New patient, 28yo male, self-referred for evaluation. Reports worsening anxiety and depression over past 6 months since losing his job. Has never seen a psychiatrist before. Was briefly on Lexapro 10mg prescribed by PCP 2 years ago but stopped after 3 months because "it wasn't helping."

Current symptoms: persistent worry about finances and future, difficulty falling asleep (takes 1-2 hrs), racing thoughts at night, poor concentration, irritability with family, loss of interest in hobbies (used to play guitar daily, hasn't touched it in months), appetite decreased, lost 10 lbs in 2 months.

Denies manic episodes, psychotic symptoms, or trauma history. Social drinker, 2-3 beers on weekends. Denies illicit drug use. No family psychiatric history reported.

PHQ-9: 16 (moderately severe). GAD-7: 15 (severe).

MSE: Appears stated age, casually dressed, mild psychomotor retardation noted. Speech is slow, low volume. Mood "terrible, I can't do anything right." Affect flat, constricted range, congruent with mood. Thought process linear but slow. Thought content notable for feelings of worthlessness, no SI but says "I wouldn't care if I didn't wake up" — passive death wish explored, no plan or intent. No HI. No hallucinations or delusions. Oriented x4. Attention and concentration impaired (had to repeat questions). Insight limited — attributes everything to laziness. Judgment fair.

Safety: Passive SI without plan or intent. No access to firearms. Lives with girlfriend who is supportive. Given crisis line number. Safety plan discussed.

Diagnosis: Major Depressive Disorder, single episode, moderate-severe. Generalized Anxiety Disorder. Rule out adjustment disorder.

Plan: Start escitalopram 10mg daily. Discussed risks, benefits, and alternatives. Patient consented. Referral to CBT therapist. Lab work ordered: TSH, CBC, CMP (baseline before starting SSRI). Follow up in 2 weeks to assess medication tolerance and safety. Patient instructed to call or go to ER if SI worsens.

Time spent: 45 minutes including evaluation, safety planning, and care coordination.`,
  },
  {
    id: "brief-10",
    label: "10-min Brief Check-In",
    text: `Established patient, 52yo male, stable on current regimen. Taking venlafaxine 150mg and trazodone 50mg hs for sleep.

Reports doing well. Mood is good, sleeping 7 hours, no anxiety symptoms. Working full time, no issues. Denies SI/HI.

BP 128/82 (checked for venlafaxine monitoring).

Plan: Continue current medications. Follow up in 3 months. Renew prescriptions x 90 days.

Time: 10 minutes.`,
  },
  {
    id: "weak-note-high-code",
    label: "Weak Notes, High Code (Should Flag)",
    text: `Follow-up visit. Patient reports anxiety. Reviewed meds. Doing okay. Continue Xanax 1mg TID and Adderall 20mg BID. Follow up 1 month.

Time: 35 minutes.`,
  },
  {
    id: "autism-strong-99215",
    label: "Strong 99215 — full MDM (justification + defensive)",
    text: `8-year-old autism patient follow-up visit.

History obtained from parent due to patient's limited verbal ability and developmental delay.

Patient has autism spectrum disorder, ADHD, and generalized anxiety disorder. Parent reports increased anxiety and meltdowns at school over past 2 weeks. Difficulty with transitions and sensory sensitivities worsening. Currently on risperidone 0.5mg BID and melatonin 3mg qHS.

Symptoms significantly impair daily functioning including school attendance and social interactions. Patient unable to complete full school days this week.

Reviewed multiple treatment options with parent including medication adjustment versus behavioral therapy intensification. Discussed risks and benefits of increasing risperidone given weight gain concerns and potential metabolic effects. Coordinated care with school psychologist and occupational therapist.

Plan: Increase risperidone to 0.75mg BID. Scheduled intensive behavioral therapy evaluation. Provided parent with crisis management strategies.

Total time: 45 minutes including parent counseling, review of school records, and care coordination with therapist.`,
  },
  {
    id: "autism-weak-99215",
    label: "Weak 99215 — sparse note (expect warnings)",
    text: `8-year-old autism patient. Parent says more anxiety lately. Increased risperidone. Follow up in 2 weeks.`,
  },
  {
    id: "autism-moderate-99214",
    label: "Moderate 99214 — partial complexity",
    text: `Autism patient follow-up. Parent reports increased anxiety at school over past week. Patient has autism spectrum disorder and ADHD. Discussed medication options and risks. Will increase risperidone to 0.75mg BID. Follow up in 2 weeks.`,
  },
];
