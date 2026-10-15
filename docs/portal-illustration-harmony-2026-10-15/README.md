# Portal illustration harmony

The user requested more illustrations and a more harmonious composition after the compact, persistent progress release (#87). The previous campus image hung under the sidebar while Overview text stretched across the main area. This pass keeps the pinned guide and existing functions intact and brings the artwork into the content composition.

- Overview now pairs its greeting and existing rows with a new watercolor study terrace: a fictional Italian courtyard, notebook, books and folder. Desktop artwork is 320px wide; the text column has a readable measure. On phones the same scene is an 88px accent alongside the greeting, without enlarging the pinned header.
- Plan has one matching watercolor notebook/map vignette beside its heading. Documents keeps its existing folder illustration at a consistent visual scale. Sidebar decoration is removed; task detail and settings screens remain focused on their controls.
- Existing Overview rows share consistent spacing and a fine divider. Greeting typography stays at or below the current action's size at every breakpoint. No new copy, action, card, destination, deadline or document status was added.

Both new illustrations were generated with Higgsfield from the existing portal artwork as style references. They have transparent backgrounds, intrinsic dimensions, local responsive WebP sources, empty alt text and no interaction or animation. The source prompts, job IDs, source hashes and derivative hashes are in the [asset manifest](../portal-harmony-assets-2026-10-15.json).

The 256px variants are 23,344 bytes (study) and 17,780 bytes (route); larger variants are selected only when needed. Runtime rendering requires no external image service.

## Screenshots

PR87 is the baseline. All screenshots use synthetic profiles from the existing review script and are lossless WebP conversions of browser captures. No private user screenshot is published.

| Screen | 1440px before | 1440px after | 390px before | 390px after |
| --- | --- | --- | --- | --- |
| Overview | [Before](before-overview-1440.webp) | [After](after-overview-1440.webp) | [Before](before-overview-390.webp) | [After](after-overview-390.webp) |
| Plan | [Before](before-plan-1440.webp) | [After](after-plan-1440.webp) | [Before](before-plan-390.webp) | [After](after-plan-390.webp) |
| Current step | [Before](before-step-1440.webp) | [After](after-step-1440.webp) | [Before](before-step-390.webp) | [After](after-step-390.webp) |
| Documents | [Before](before-documents-1440.webp) | [After](after-documents-1440.webp) | [Before](before-documents-390.webp) | [After](after-documents-390.webp) |
| Settings | [Before](before-settings-1440.webp) | [After](after-settings-1440.webp) | [Before](before-settings-390.webp) | [After](after-settings-390.webp) |
| Onboarding | [Before](before-onboarding-1440.webp) | [After](after-onboarding-1440.webp) | [Before](before-onboarding-390.webp) | [After](after-onboarding-390.webp) |

## Verification scope

The existing progress review now expects the contextual study/route/documents scenes in the main content, one at a time. It checks intrinsic and decoded aspect ratios, local responsive sources, reserved space, decorative semantics and noninterference. These deliberately replace the old sidebar-campus placement and square-only image assertions. No behavior, primary-action hierarchy, sticky-progress, reduced-motion, future/parent restriction or document-verdict checks were relaxed.

Production build, lint, design guard, progress review, document-report review and the existing CI / Design review gates are required before release. Protected APIs, authentication, Stripe, route URLs, user data and MOD. 209 geometry are unchanged. All edited portal source files already have explicit approval in design-guard.
