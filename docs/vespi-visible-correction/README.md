# Visible Vespi correction after PR #100

PR #100 centralized the assistant, but left the homepage composition almost
unchanged. This correction responds to the user's production review directly.

- Home: one approved figure accompanies the real starting action. The duplicate
  rider on the campus illustration is removed. The first workflow step now
  includes Vespi and its actual questionnaire link; repeat document checking is
  visible beside the existing price.
- Universities: the navigator belongs to the working filters. Its guidance uses
  the selected city, available results or comparison. The embedded portal
  picker relies on its existing pinned guide: city choice comes first, without
  a duplicate navigator or a link out to the public plan.
- Portal: the existing pinned surface leads with the current action and real
  task explanation/date, followed by the road. Six or more stages receive the
  full rail width so their labels fit. No second welcome banner or action.
- Shared portraits: the expert composition sits on the right; the mobile body
  uses the full card width. A soft alpha edge blends the existing portrait into
  its surface. These are compositions, not newly generated poses.

Colors, fonts, backgrounds, editorial assets, prices, API contracts, payment,
authentication, five document statuses, route logic and MOD. 209 are unchanged.

## Evidence

Before is the released `dc2d9e1` export, after is the local production export.
Portal data is synthetic. No production login, upload, payment or AI request.

| Surface | Before | After |
| --- | --- | --- |
| Home · desktop | [Before](before-home-1440.webp) | [After](after-home-1440.webp) |
| Home · phone | [Before](before-home-390.webp) | [After](after-home-390.webp) |
| How it works · phone | [Before](before-home-how-390.webp) | [After](after-home-how-390.webp) |
| Prices · phone | [Before](before-prices-insight-390.webp) | [After](after-prices-insight-390.webp) |
| Filters · phone | [Before](before-universities-navigator-390.webp) | [After](after-universities-navigator-390.webp) |
| Portal · desktop | [Before](before-portal-overview-1440.webp) | [After](after-portal-overview-1440.webp) |
| Portal · phone | [Before](before-portal-overview-390.webp) | [After](after-portal-overview-390.webp) |
| Questionnaire · phone | [Before](before-plan-question-390.webp) | [After](after-plan-question-390.webp) |
| Guide insight · phone | [Before](before-guides-insight-390.webp) | [After](after-guides-insight-390.webp) |

The shared review covers 1440, 768, 390 and 320px, axe accessibility, palette
preservation, draft continuity, read-only future steps, one upload action and
no automatic AI requests. New assertions require the home action in the first
viewport, no mascot/action overlap, and full-width mobile explanation text.
Existing portal checks retain sticky-height, milestone-fit, completion-motion,
keyboard and reduced-motion constraints. No existing invariant was removed.
The helper keyboard check now waits for the existing reopen focus/animation
before focusing a suggestion. This removes a CI frame race; draft preservation,
editable text, keyboard activation and zero automatic requests remain asserted.

Results: [shared checks](results.json), [final captures](final-assets-results.json).
