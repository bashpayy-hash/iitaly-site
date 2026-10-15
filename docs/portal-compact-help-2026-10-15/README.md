# Compact action and contextual help

User request, 15 October 2026: the persistent road's red action is still too large; make guidance intuitive and research established patterns before implementation.

## Changes

- Size the road action to its text, retaining the complete label and a 44–48px minimum target. Keep the actual route, scooter animation and persistent header.
- Explain the existing completion mechanism beside the current step's action. Program selection still requires returning and confirming; uploading a file still requires the existing server-confirmed completion. No admission or visa outcome is promised.
- Put the existing longer explanation and notes in one optional disclosure after the action. Preserve the short explanation, date and read-only reason in view. Do not add tours or another help entry.
- Show the open step in the existing assistant. Suggested questions fill the input, preserve an existing draft and never send a request automatically. Moving to a list clears the old step context.
- Use the same guidance in the assistant context and the step page. Keep the public-site chat, request contract, limits and user data unchanged.

## Research and scope

Reviewed on 15 October 2026:

- [GOV.UK: Details](https://design-system.service.gov.uk/components/details/): keep essential instructions visible; reveal supplementary content on request.
- [GOV.UK: Question pages](https://design-system.service.gov.uk/patterns/question-pages/): keep hints brief and tied to the action or information requested.
- [NN/g: Onboarding Tutorials vs. Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/): make help available at the moment of the task without requiring memorisation or interrupting the workflow.
- [Apple: TipKit](https://developer.apple.com/documentation/tipkit/): use context and restraint; do not repeat unnecessary tips. This is design guidance, not a native SDK integration.
- [W3C: Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html): avoid hover-only help; use a native keyboard- and touch-accessible disclosure.

These sources justify the interaction choices. They do not establish an improvement in IITALY retention; that requires observing real task completion and return visits after launch. This change adds no tracking or behavioural targeting.

Selected plugin guidance: Taste's frontend UI engineering for the existing product surface; Polish for a bounded pass preserving the brand; AI Graphic Design reviewed for scope (no new standalone graphics are needed).

## Validation

The existing progress review retains the full navigation, completion, upload, status, role, reduced-motion, sticky-header and accessibility checks. New assertions cover intrinsic action width, contextual hints, keyboard disclosure, assistant context clearing and draft-only suggestions. Local build, lint, design guard, document-report review and public-chat recovery review pass. All 27 progress-review groups were exercised against the same export: 16 before an opening-animation measurement race, then the remaining 11 after waiting for the dialog to settle. The 44px minimum was not relaxed. CI runs the complete final script. No JavaScript errors or unexpected API calls were observed.

Measured on the representative profile: desktop road 126px, red action 262 × 48px; phone road 137px, action 235 × 44px. The route count and labels come from the profile, not these test fixture values.

## Before and after

All profiles are synthetic. Before captures are the committed PR #88 baseline.

| Screen | Desktop before / after | Phone before / after |
|---|---|---|
| overview | [Before](../portal-illustration-harmony-2026-10-15/after-overview-1440.webp) · [After](after-overview-1440.webp) | [Before](../portal-illustration-harmony-2026-10-15/after-overview-390.webp) · [After](after-overview-390.webp) |
| plan | [Before](../portal-illustration-harmony-2026-10-15/after-plan-1440.webp) · [After](after-plan-1440.webp) | [Before](../portal-illustration-harmony-2026-10-15/after-plan-390.webp) · [After](after-plan-390.webp) |
| step | [Before](../portal-illustration-harmony-2026-10-15/after-step-1440.webp) · [After](after-step-1440.webp) | [Before](../portal-illustration-harmony-2026-10-15/after-step-390.webp) · [After](after-step-390.webp) |
| documents | [Before](../portal-illustration-harmony-2026-10-15/after-documents-1440.webp) · [After](after-documents-1440.webp) | [Before](../portal-illustration-harmony-2026-10-15/after-documents-390.webp) · [After](after-documents-390.webp) |
| settings | [Before](../portal-illustration-harmony-2026-10-15/after-settings-1440.webp) · [After](after-settings-1440.webp) | [Before](../portal-illustration-harmony-2026-10-15/after-settings-390.webp) · [After](after-settings-390.webp) |
| onboarding | [Before](../portal-illustration-harmony-2026-10-15/after-onboarding-1440.webp) · [After](after-onboarding-1440.webp) | [Before](../portal-illustration-harmony-2026-10-15/after-onboarding-390.webp) · [After](after-onboarding-390.webp) |

Contextual assistant: [desktop](helper-1440.webp) · [phone](helper-390.webp).
