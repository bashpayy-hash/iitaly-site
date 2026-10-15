# A calmer portal with one clear next action

Owner request, 15 October 2026: make progress movement smoother, fix the bulky
action and present the existing cabinet with fewer competing compartments.

## Changes

- The road keeps the complete next-step title as ordinary readable text, beside
  one short 44px action. A long parent/document task no longer enlarges the red
  pill. The entire road remains one link; an already-open current step has no
  repeated action.
- Fill, scooter and wheels share a 1080ms transform transition with gradual
  acceleration and deceleration. The browser's transition end settles the ride;
  a fallback timer handles missing events. The body pauses and resumes its idle
  motion instead of resetting. New-step text is present immediately.
- First display and reload do not replay travel. Reduced motion removes travel,
  wheel rotation, bobbing and text entrance. No new animation dependency.
- Overview is one content flow: document checking and the latest report stay
  together; saved universities, actual nearby orientirs and the next task share
  quiet rows. The large promotional card and separate artwork column are gone.
  Existing artwork remains a small part of the greeting.
- Plan and Documents use single lists instead of outer cards and nested status
  pills. Current-stage disclosure, future gating, document filters and all five
  exact outcomes remain. Empty filters remain hidden.
- Settings uses a compact profile table. Parent instructions and deletion
  details are native disclosures; their actions and deletion confirmation are
  preserved. Telegram retains its existing disclosure and explicit opt-in. The
  road becomes secondary here so connecting Telegram does not compete with a
  second filled action.

## Preserved boundaries

Routes, Stripe, authentication, backend/API contracts, user data, document
assessment wording, all five outcomes and MOD. 209 geometry are unchanged.
University selection still includes the full embedded map and comparison and
remains browser-local, as clearly disclosed. Unlimited explicit document
rechecks and existing 12 files / 5 minutes protection remain available. Dates
come from the existing route and retain their orientir wording.

## Verification

The progress review now checks the compact action separately from the full
title, including long parent/document titles on a short 390px phone. It samples
several animation frames to verify that the fill and scooter remain aligned,
move forward and settle at the actual route position. Both wheels share the
same easing/duration. Initial/reload and reduced-motion coverage remains.

Existing navigation, keyboard, assistant, document, selection, Telegram and axe
checks remain. All browser checks use synthetic profiles and intercepted API
responses; no real user account or document is changed.

## Before and after

Before: [PR #90 screens](../portal-university-selection-2026-10-15/README.md).
After screenshots below use the same partial/near/parent-file/late-current
profile fixtures and are saved as lossless WebP.

| Screen | 1440px | 390px |
|---|---|---|
| Overview | [Desktop](overview-partial-1440.webp) | [Phone](overview-partial-390.webp) |
| Plan | [Desktop](plan-partial-1440.webp) | [Phone](plan-partial-390.webp) |
| University step | [Desktop](step-partial-1440.webp) | [Phone](step-partial-390.webp) |
| Documents | [Desktop](documents-partial-1440.webp) | [Phone](documents-partial-390.webp) |
| Settings | [Desktop](settings-partial-1440.webp) | [Phone](settings-partial-390.webp) |
| Onboarding | [Desktop](onboarding-onboarding-1440.webp) | [Phone](onboarding-onboarding-390.webp) |
| Near orientir | [Desktop](overview-near-1440.webp) | [Phone](overview-near-390.webp) |
| Parent file | [Desktop](overview-parent-file-1440.webp) | [Phone](overview-parent-file-390.webp) |
| Later current step | [Desktop](overview-late-current-1440.webp) | [Phone](overview-late-current-390.webp) |
