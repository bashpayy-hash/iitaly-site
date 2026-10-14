# Portal polish with Higgsfield and Impeccable

Baseline: `baed418179e24dc244727c598fd866ae4b7f9d22` (PRs #80–82). This is a narrow refinement of the existing portal, with its agreed three destinations and one current-step road retained.

## What changed

- The scooter now has a fuller red side panel, slim saddle and clear ivory wheel hubs, following the Higgsfield reference. The production illustration is an authored, layered inline SVG; the generated PNG is review evidence only and is never downloaded by the portal. Existing wheel rotation, body movement and progress timing remain unchanged.
- Hover keeps the road’s red edge, deepens its existing action pill and nudges the arrow by 3px. Reduced motion disables the nudge and all road animation.
- Mobile active navigation and plan expanders use real border strokes, so they remain visible in forced-colors mode.
- Every document filter has a minimum 44 × 44px target.
- A server-confirmed completion returns keyboard focus to the next-step road. Completing the last task focuses the static route summary. Initial login does not move focus.

No sections, extra actions, dependencies, API fields, admission facts, prices or deadlines were added. Authentication, payment, document outcomes and MOD. 209 are unchanged.

## Plugin use and provenance

- **Higgsfield:** one image, `gpt_image_2_5`, high quality, 1k, 3:2, transparent background requested. Estimated generation cost: 1.5 credits. Job: `23860f18-8fdf-44d9-80f0-3f1e52a0744c`. [Generated art-direction reference](scooter-higgsfield-reference.png). The model added soft shaded edges; these were not carried into the production SVG.
- **Engineering Suite UIAudit / Impeccable:** scoped code, screenshot and browser audit found the four verified accessibility defects fixed here. Unused legacy CSS and the explicitly requested red road edge were excluded from false-positive findings.
- **Engineering Suite Polish / Impeccable:** bounded incumbent-style refinement, with the user’s marketing palette and navigation brief taking precedence over generic design preferences.

## Before and after

All captures use the same synthetic `partial` fixture. No real user account or document is involved.

| Screen | Before 390 | After 390 | Before 1440 | After 1440 |
| --- | --- | --- | --- | --- |
| Overview | [before](../portal-review-2026-10-14/after/overview-partial-390.png) | [after](overview-390.png) | [before](../portal-review-2026-10-14/after/overview-partial-1440.png) | [after](overview-1440.png) |
| Plan | [before](../portal-review-2026-10-14/after/plan-partial-390.png) | [after](plan-390.png) | [before](../portal-review-2026-10-14/after/plan-partial-1440.png) | [after](plan-1440.png) |
| Documents | [before](../portal-review-2026-10-14/after/documents-partial-390.png) | [after](documents-390.png) | [before](../portal-review-2026-10-14/after/documents-partial-1440.png) | [after](documents-1440.png) |

## Verification

Static export, TypeScript, ESLint and the complete local portal progress/navigation review passed at all six viewports, including axe, reduced motion, document upload and keyboard focus regressions. One batched visual review of the captured desktop/mobile screens found no clipping or hierarchy regressions.

The progress review adds focused regressions for forced-color navigation/expanders, 44px filters, keyboard and file completion focus, final completion, and absence of initial focus movement. Existing assertions are retained. The release capture covers the six portal surfaces and near / parent-file / late-current route states at 390 and 1440px. GitHub Design review remains the full release gate.

```sh
NEXT_PUBLIC_BACKEND_URL=https://example.invalid NEXT_PUBLIC_STRIPE_ENABLED=true npm run build
REVIEW_TOOLS=/tmp/iitaly-browser/node_modules node scripts/design-portal-progress-review.mjs
REVIEW_TOOLS=/tmp/iitaly-browser/node_modules PORTAL_RELEASE_CAPTURE=1 node scripts/design-portal-progress-review.mjs
```
