# Put the current task first

Baseline: PR #84, `1e561bbfac63db4a4add9c39c0e45ea7ce66dd40`.

The user confirmed that the new header was visible but the design still felt unchanged. Production CSS matched the reviewed export byte for byte; this was an insufficient hierarchy change, not an established cache problem.

## What changes visibly

- The greeting becomes an 18px identity line. The current task becomes the dominant 36px desktop / 26px phone title inside the single red action area. The complete road remains one anchor; no extra control or repeated action title.
- The scooter track is more compact, with the same real step counts, stage markers, animation and reduced-motion behavior.
- Main guidance is 15–16px; Plan, Documents, Step and Report have consistent 32px desktop / 28px mobile titles. Shared site header, Inter Tight, colors and 24px white panels remain.
- Successful login resets the form's scroll position. On a short phone the browser had scrolled to the submit button and carried that position into the portal. Settings deep links still apply their own focus.

No API, authorization, data schema, route, pricing, document outcome or MOD. 209 changes. No new sections, claims, actions or illustration assets.

## Screenshots

Synthetic existing fixtures only. The previous deployed build was also downloaded and rendered with mocked API responses; no real account was opened.

| Screen | Before 390px | After 390px | Before 1440px | After 1440px |
| --- | --- | --- | --- | --- |
| Overview | [before](../portal-site-design-2026-10-15/overview-390.png) | [after](overview-390.png) | [before](../portal-site-design-2026-10-15/overview-1440.png) | [after](overview-1440.png) |
| Plan | [before](../portal-site-design-2026-10-15/plan-390.png) | [after](plan-390.png) | [before](../portal-site-design-2026-10-15/plan-1440.png) | [after](plan-1440.png) |
| Step | [before](../portal-site-design-2026-10-15/step-390.png) | [after](step-390.png) | [before](../portal-site-design-2026-10-15/step-1440.png) | [after](step-1440.png) |
| Documents | [before](../portal-site-design-2026-10-15/documents-390.png) | [after](documents-390.png) | [before](../portal-site-design-2026-10-15/documents-1440.png) | [after](documents-1440.png) |
| Settings | [before](../portal-site-design-2026-10-15/settings-390.png) | [after](settings-390.png) | [before](../portal-site-design-2026-10-15/settings-1440.png) | [after](settings-1440.png) |
| Onboarding (unchanged) | [before](../portal-site-design-2026-10-15/onboarding-390.png) | [after](onboarding-390.png) | [before](../portal-site-design-2026-10-15/onboarding-1440.png) | [after](onboarding-1440.png) |

## Validation

The existing progress review additionally checks that the current action is larger than the greeting, its guidance is at least 15px and entry does not retain the login form's scroll offset. Existing current/future task, one-action, dates, document outcomes, assistant context and motion checks are retained. This makes the user's hierarchy requirement testable; it does not relax a previous invariant.

Static export, TypeScript, lint, design guard, six-viewport progress/navigation review and saved-document review are the local checks. Full GitHub Design review remains the release gate. Screenshots cover 1440px and 390px, including near, parent-file and late-current fixtures in the review output.
