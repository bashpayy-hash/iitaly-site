# Compact, persistent portal progress

User request, 15 October 2026: the portal is too visually heavy; progress should stay at the top and continuously explain the next action.

The existing scooter road now lives once in the shared sticky header, above Overview, Plan, task details, Documents, reports and Settings. It uses the same real route, completion calculation, current task and completion animation. The oversized Overview card has been removed. The shared guide becomes non-interactive while its current task is already open, leaving the task's existing action as the only primary action.

Greetings and intake information appear only on Overview. Other screens start with their own content. Header height is measured before document-report autofocus so the sidebar, keyboard targets and opened reports remain below the guide even on reload or when text wraps. Opening the current step from Documents or Settings retains that screen as the Back destination. First-run onboarding has no route yet, so it has no invented progress. Profile editing retains a read-only guide.

No API, authentication, payment, document verdict, route URL, task ownership or MOD. 209 geometry changed. The existing illustrations and site branding remain.

## Before and after

Screens use the existing local `partial` fixture. No real user data or live API requests are involved. WebP copies are lossless conversions of browser screenshots.

| Screen | 1440px before | 1440px after | 390px before | 390px after |
| --- | --- | --- | --- | --- |
| Overview | [Before](before-overview-1440.webp) | [After](after-overview-1440.webp) | [Before](before-overview-390.webp) | [After](after-overview-390.webp) |
| Plan | [Before](before-plan-1440.webp) | [After](after-plan-1440.webp) | [Before](before-plan-390.webp) | [After](after-plan-390.webp) |
| Current step | [Before](before-step-1440.webp) | [After](after-step-1440.webp) | [Before](before-step-390.webp) | [After](after-step-390.webp) |
| Documents | [Before](before-documents-1440.webp) | [After](after-documents-1440.webp) | [Before](before-documents-390.webp) | [After](after-documents-390.webp) |
| Settings | [Before](before-settings-1440.webp) | [After](after-settings-1440.webp) | [Before](before-settings-390.webp) | [After](after-settings-390.webp) |
| Onboarding | [Before](before-onboarding-1440.webp) | [After](after-onboarding-1440.webp) | [Before](before-onboarding-390.webp) | [After](after-onboarding-390.webp) |

## After actual scrolling

These captures expand real disclosures/list content, scroll at least 80px and assert that the same guide stays at the top. They do not add test-only spacers.

| Screen | 1440 × 900 | 390 × 667 |
| --- | --- | --- |
| Plan | [Pinned guide](sticky-plan-1440x900.webp) | [Pinned guide](sticky-plan-390x667.webp) |
| Documents | [Pinned guide](sticky-documents-1440x900.webp) | [Pinned guide](sticky-documents-390x667.webp) |
| Settings | [Pinned guide](sticky-settings-1440x900.webp) | [Pinned guide](sticky-settings-390x667.webp) |

## Verification changes

- `design-portal-progress-review` now locates the single road in shared chrome rather than inside Overview. An empty or completed Overview may have no remaining rows; the guide stays visible independently.
- Large hero typography assertions were replaced with compact guide bounds, readable 18px action text / 13px metadata, and touch-target checks. The entire sticky header must occupy less than half the short viewport.
- Added actual scroll/pinned-position checks, seven-stage / 28-step route coverage at 1440, 1024, 768 and 390px, full desktop stage-label bounds, and no duplicate filled action on current task details.
- Existing route progress, completion, immediate next-step text, interrupted travel, reduced motion, parent/future restrictions, file upload, retry, keyboard focus and accessibility checks remain.
- `design-portal-document-report-review` now checks the actual auto-focused report heading against the sticky header without manually scrolling it into view.

Local build and lint pass. The full [progress review](progress-results.json) and [document report review](document-report-results.json) pass, including empty/complete/blocked routes, reduced motion and auto-focused report headings at 1440/390/320px. A targeted final progress pass checks the return destinations after opening the persistent guide from Documents and Settings. Design guard and existing CI / Design review gates also run against the exact PR head before merge.
