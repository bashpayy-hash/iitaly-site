# Kazakhstan admissions update · 9 October 2026

The site previously mixed admission years and document requirements: the visa calculator multiplied the annual minimum by the entire degree, the quiz treated different school qualifications alike, and DSU guidance presented common amounts and document years without regional scope.

This update implements the reviewed 2026/27 and 2027/28 research:

- `src/data/admissions.ts` owns the review date, official source registry, visa minimum and explicitly scoped DSU examples. Guide chapters, news items and generated plan steps expose sources and applicability.
- The guide covers qualification access, 11-year compensation, NIS Grade 12, IB/A-levels and college, apostille, translation, DoV/CIMEA/ARDI, financial support, DSU, minors, visa D, residence formalities, health/travel and Kazakhstan military deferment.
- The questionnaire adds intake, age, lawful residence and scholarship authority. Structured answers select eligibility advice; a school-name regex can no longer grant direct access. Older DSU financial years are never carried into 2027/28.
- The visa calculator uses the annual €10,179.85 amount and a user-entered exchange rate. Kazakhstan instructions reference VFS and the six-month account history. It does not determine visa approval.
- Scholarship claims and recurring university deadlines have been qualified. The university catalogue's tuition/living estimates retain their earlier snapshot; this is not a full audit of 43 programme catalogues for 2027/28.
- Demo chat answers and public context passed through existing chat/document-check fields use the reviewed facts. This does not replace the separate backend's knowledge base or rewrite existing authenticated roadmap records. Saved-plan UI links users to the updated rules and questionnaire.

No payment, authentication, backend schema, map geometry, package dependency or deployment configuration changes are required. The existing `blsSlot` task identifier remains for compatibility; displayed guidance uses VFS.

## Verification

Run `node scripts/admissions-review.mjs`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Browser regression coverage (`scripts/admissions-browser-review.mjs`) checks 1440, 390 and 320px, the ten-question flow without contact submission, qualification/minor/DSU output, source visibility, guide deep links, the annual calculator and invalid rates. Existing visual tests now assert the deliberately updated copy and questionnaire while preserving map, layout, checkout and portal checks. No production payment, lead or document submission is part of these tests.
