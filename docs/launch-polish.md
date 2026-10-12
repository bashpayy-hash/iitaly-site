# Launch polish

The final pass preserves the shipped crimson actions, light surfaces, editorial watercolours, university map and official Permesso geometry. It addresses observed friction in the student journey and unreliable success/error states.

## Changes

- Document checking: a shorter introduction, one accurate disclosure linked to the existing privacy policy, a proper document icon, compact selected-file preview, readable long filenames, clearer result hierarchy and focus on the completed result. Programme/year/applicant scope remain explicit; official source metadata is preserved.
- Modal focus survives comparison updates; Escape restores the initiating control and the previous page scroll state.
- Chat: keyboard entry/exit and mobile-menu focus return, usable phone inputs, disabled empty/busy send, and recovery without spending a free question or duplicating model history. Network and response-body stalls have a 90-second deadline.
- Contact forms verify server acknowledgement before displaying success or recording a successful lead. Invalid phone strings are rejected. Failure preserves the number and does not block the free plan.
- Checkout: bounded 20-second requests preserve entered fields on failure. Payment return distinguishes pending from confirmed and offers support for a lost session instead of encouraging another payment.
- Portal: visible, actionable errors for file reading, checking, saving and task updates. Retrying a failed save reuses the existing analysis result.
- The chat launcher yields when it would cover a document row; changing page height refreshes its collision check.

## Verification

- Production build, TypeScript, ESLint and admissions integrity checks.
- Existing student-journey/axe checks at 320, 390, 768 and 1440 pixels.
- A before/after visual inspection of the main public routes at desktop and mobile sizes; no horizontal overflow, browser runtime errors or detected axe violations on the inspected routes.
- New isolated browser regressions: `launch-document-review.mjs`, `launch-chat-review.mjs`, `launch-flow-review.mjs`. They cover stalled requests, retained file/contact/form inputs, duplicate-check prevention, truthful payment states, keyboard focus and free-plan access after a failed contact request.
- The design workflow uses the same public Stripe-enabled flag as Netlify. Browser fixtures intercept all backend traffic; they do not send real documents, contacts, messages or payments.

Automated accessibility checks are not a complete accessibility certification. Payment fixtures verify UI recovery and API handling, not a real card charge or live fulfillment. Existing design, geometry, comparison, admissions and portal workflow gates remain enabled for this change.
