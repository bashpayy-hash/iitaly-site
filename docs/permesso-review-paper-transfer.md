# Supplied Permesso review: incremental application

The user supplied `Вставленный текст(1).txt`, described as Grok's prompt. It describes the older hand-drawn trainer. Do not treat its observations as a current production audit or regress the two modes added in PR 59 and hover/touch assistance in PR 60.

## Preserved, not reimplemented
- Original PDF mode and exact official page renders/geometry.
- Direct editable overlays, actual multiline capacities, SI/NO, split dates/house numbers/phones.
- Explicit local Save/Restore/Clear and retained in-tab draft.
- Readable hover/focus assistance, touch-first explanation, large-input handoff.
- Existing profile/auth, backend contracts, payments and price.

## Implemented in this pass
- Source block 4.5: a secondary `Переносим на бумагу` view INSIDE editable mode, not a replacement or third top-level mode.
- Large values, explicit row/group labels, spaces as empty cells, original-page mini-map with measured field outlines.
- Small-screen text runs grouped into ten-cell reading chunks with explicit original-row labels. This does not alter the original form; the final blank cells/unused rows are explained.
- Explicit `Перенёс` receipts. Empty required answers cannot be marked copied. Editing the value invalidates the previous receipt. Scenario changes/restored snapshots/clear reset transfer acknowledgements.
- Consecutive inapplicable fields in the same original section become one skip step.
- Optional fields remain reachable. Unverified fields are separate defer-to-clarification steps and remain on the final clarification list.
- Source blocks 4.4/5.4: nonblocking date-expiry warnings for passport/permit, calendar-date boundary handling, and a final self-check list.
- Compact preparation strip ahead of the editor.

## Deliberate departures / not claimed implemented
- Do not rerender the official form as a larger-font HTML imitation: exact paper fidelity and legibility are handled separately.
- Do not navigate ONLY mandatory fields: that would silently omit optional-but-applicable and unresolved items. They are explicit skip/clarification steps.
- No guessed code 16, country codes 35/36, sheet count 25 or signature/date rule 28/29. The review itself says these require verification.
- No automatic profile reads or use of personal information from uploaded filled scans.
- No invented expert link. Expiry warnings direct the user to their Questura/specialist; no unaudited support endpoint is advertised.
- No CSS hiding of third-party Netlify branding, global theme changes, forced mobile removal of the exact paper, or changes to the old trainer's helper arrangement.
- Editable-mode URL/history synchronization is not part of this pass; do not claim it is.
- Transfer receipts are in-tab only. Existing explicit Save persists draft values, NOT transfer receipts. UI states this.
- Final checks do not certify legal accuracy, application readiness, or submission.

## Verification
Run the dedicated transfer script alongside existing original/editor/hover/browser regressions. Isolated test data only; production API writes blocked. Capture page 1/2/3 transfer views at 1440 and 390 px. The source image hashes and PDF-coordinate map are unchanged.
