# Keep IITALY tools inside the cabinet

The portal still sent applicants to public `/plan` from assessment and document-check tasks, to `/changes-2026-27` from the plan and university modal, and to `/` from its wordmark. Those exits interrupted the saved route and could discard an unsaved university selection.

This release keeps those interactions in `/portal`:

- Assessment uses the existing ten questions and `buildPlan` facts inside the current task. No lead/contact form, new API, numeric chance estimate, or hidden completion. Exact matching account answers prefill the form; remaining answers stay in this login session while switching views. Reloading starts from saved-profile prefill again.
- Check-documents shows the actual route documents and saved reports using the existing five outcomes and upload/recheck pipeline. The report Back link returns to the originating check-documents task. The public checker, which had different labels and did not save reports to the account, is not embedded.
- Rules and all existing scope notes/sources open as disclosures in the plan and university modal. The source data and public pages are unchanged. Heavy content loads on demand.
- The existing MOD. 209 trainer is available inside the current kit task. The trainer source, field geometry, data and calculations are unchanged. Its scenario/page/field query parameters coexist with the portal task.
- The portal wordmark returns to Overview without reloading the app. Cancelling a profile edit opened from a task returns to that task.
- A modal focus trap now includes native disclosure summaries, so keyboard users can reach the inline university rules.

Official source/PDF links and explicit Telegram connection still open their external destination. This release does not embed third-party submission services, change Stripe, authentication, or backend contracts.

## Verification

`design-portal-contained-flow-review.mjs` exercises 1440 px and 390 px with synthetic profiles and intercepted APIs. It asserts only the initial top-level `/portal` document request, no extra tab, no public tool links, current/future task gating, explicit assessment completion, unchanged saved reports, exact document return task, browser Back/Forward, trainer query preservation and modal keyboard focus. It also records axe and overflow results. The workflow now runs this regression.

Existing progress, university selection, saved-document and reminder checks are retained. The progress brand check now accepts the accurate authenticated logo name “IITALY — личный кабинет”; the public/login label stays “IITALY — главная”. Its sticky-scroll fixture now expands exactly the seven route stages, rather than also expanding asynchronously loaded source disclosures; the new contained-flow check covers those sources separately. No layout or completion invariant was removed.

Screenshots use synthetic data. Baseline layout: [previous cabinet release](../portal-calm-hierarchy-2026-10-15/README.md).

| Screen | Desktop | Phone |
|---|---|---|
| University rules | [1440](university-rules-1440.webp) | [390](university-rules-390.webp) |
| Plan rules | [1440](plan-rules-1440.webp) | [390](plan-rules-390.webp) |
| Assessment | [1440](assessment-initial-1440.webp) | [390](assessment-initial-390.webp) |
| Assessment result | [1440](assessment-result-1440.webp) | [390](assessment-result-390.webp) |
| Check documents | [1440](check-documents-1440.webp) | [390](check-documents-390.webp) |
| Saved report | [1440](saved-report-1440.webp) | [390](saved-report-390.webp) |
| MOD. 209 | [1440](permesso-inline-1440.webp) | [390](permesso-inline-390.webp) |
