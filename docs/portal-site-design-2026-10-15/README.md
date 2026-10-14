# One IITALY design before and after login

Baseline: `70f7ac86a843457a1edc6b97f3eef1108769f2f2` (after PR #83). The user's request is visual continuity with the rest of the existing site.

## Cause and change

Matching the colors alone did not make the portal match the site. Its body text still inherited legacy Onest while the public pages use Apple text / Inter Tight. It also had a separately drawn wordmark, a different header, lighter headings and oversized road button text.

- Reuse the actual `MarketingHeader` and wordmark after login and during onboarding. Its portal variant contains only the existing assistant and settings links; the three portal destinations stay in their existing sidebar/bottom navigation. Public-site navigation is unchanged.
- Use the site's body font, heading weights, header dimensions, page gutters, button scale and white 24px panels throughout the existing portal screens.
- Place Plan, Documents, Step and Report content on one coherent surface each. Keep list rows as single links; make document filters quiet native radio pills.
- Keep the scooter and all its completion/reduced-motion behavior. Remove the separate red side stripe and match the next-step pill to the site's 48px action scale.
- Keep settings, onboarding, roles and report outcomes intact. Prevent the parent role from splitting into individual letters on mobile.
- The shared logo now has a 44px hit area across the site, without changing the wordmark's appearance.

No new destinations, widgets, API fields, user-data schema, payment/auth changes, factual copy or deadlines. The document outcomes and MOD. 209 geometry are unchanged.

## Evidence

All portal screens use the existing synthetic fixtures; no real account or file was used. Public reference captures are from the baseline static export.

| Existing site reference | Screenshot |
| --- | --- |
| Main page, desktop | [1440px](site-home-1440.png) |
| Universities, phone | [390px](site-universities-390.png) |
| Login, phone | [390px](site-login-390.png) |

| Screen | Before 390 | After 390 | Before 1440 | After 1440 |
| --- | --- | --- | --- | --- |
| Overview | [before](../portal-polish-2026-10-14/overview-390.png) | [after](overview-390.png) | [before](../portal-polish-2026-10-14/overview-1440.png) | [after](overview-1440.png) |
| Plan | [before](../portal-polish-2026-10-14/plan-390.png) | [after](plan-390.png) | [before](../portal-polish-2026-10-14/plan-1440.png) | [after](plan-1440.png) |
| Documents | [before](../portal-polish-2026-10-14/documents-390.png) | [after](documents-390.png) | [before](../portal-polish-2026-10-14/documents-1440.png) | [after](documents-1440.png) |
| Step | [before](../portal-review-2026-10-14/after/step-partial-390.png) | [after](step-390.png) | [before](../portal-review-2026-10-14/after/step-partial-1440.png) | [after](step-1440.png) |
| Settings | [before](../portal-review-2026-10-14/after/settings-partial-390.png) | [after](settings-390.png) | [before](../portal-review-2026-10-14/after/settings-partial-1440.png) | [after](settings-1440.png) |
| Onboarding | [before](../portal-review-2026-10-14/after/onboarding-onboarding-390.png) | [after](onboarding-390.png) | [before](../portal-review-2026-10-14/after/onboarding-onboarding-1440.png) | [after](onboarding-1440.png) |

## Validation

- Static export, TypeScript and ESLint.
- Progress review now compares computed logo font, weight, tracking, colors, literal red dot, header height and body font with the login screen across the existing viewport and route fixtures. It also rejects a duplicate header or public marketing menu inside the authenticated header. Existing workflow assertions are retained.
- Portal navigation/progress: six viewports, current action above the fold, 28-step route, history, future steps, parent upload, keyboard focus, axe and reduced motion.
- Saved document reports at 1440/390/320px: exact five outcomes, full saved results, source disclosure and no horizontal overflow.
- Login at 1440/1024/768/390/360px: validation, Enter, one request, error recovery and mock success.
- One batched visual inspection, one mobile owner-label correction, one confirmation capture. Full GitHub Design review remains the release gate.

Reproduce captures with `REVIEW_TOOLS=/tmp/iitaly-browser/node_modules PORTAL_RELEASE_CAPTURE=1 node scripts/design-portal-progress-review.mjs` after building the static export.
