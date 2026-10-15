# Larger route, clearer completion feedback

The user asked for a larger progress road and a more satisfying response after
closing a task. This pass preserves the current portal, its compact action and
its existing server-confirmed completion flow.

## What changes

- The rail grows from 4 to 8 px on desktop and from 3 to 6 px on mobile.
  The existing scooter grows from 52 to 64 px and from 48 to 56 px respectively.
- On mobile, reclaimed padding keeps the shared panel at its previous height.
  The open university step still leaves its first city choice visible at 390×667.
- A confirmed completion briefly replaces the count with a check and “Шаг
  сделан”. It uses the same space, adds no action, is announced politely, and
  returns to the real count after 2.2 seconds.
- The existing synchronized 1080 ms ride remains interruptible. The next step
  appears immediately, and a small 360 ms settling motion finishes the ride.
  The compact action also responds to a press. Motion uses transform/opacity.
- Reduced motion preserves the completion message without animation. Changing
  that preference mid-ride stops travel immediately without another API request.

No animation starts on login, reload, a pending save, a failed save, or undo.
“Шаг сделан” acknowledges the saved route task; document verdicts and their
meaning are unchanged. There are no points, streaks, confetti, sound, new
sections, dependencies, or changes to routes, authentication, Stripe or APIs.

## Screenshots

These show isolated synthetic fixtures, never real applicant data.

| Viewport | Before | After |
| --- | --- | --- |
| 1440×900 | [Before](../portal-road-refinement-2026-10-16/after-1440.webp) | [After](after-1440.webp) |
| 390×667 | [Before](../portal-road-refinement-2026-10-16/after-390.webp) | [After](after-390.webp) |

[Intermediate desktop layout](after-1200.webp).
[Confirmed completion on mobile](completion-390.webp).

## Verification

The existing progress review now checks confirmation feedback for self-report,
parent-owned tasks, file completion and the final task. It also checks delayed
and rejected saves, message expiry, undo, reload and mid-ride reduced motion.
The 210 px panel budget, half-screen budget, compact-action dimensions, route
labels, sticky behavior, first-city visibility and all previous checks remain.
The Impeccable detector reports no findings on the changed source files.

```sh
NEXT_PUBLIC_BACKEND_URL=https://web-production-9faf3.up.railway.app NEXT_PUBLIC_STRIPE_ENABLED=true npm run build
npm run lint
REVIEW_TOOLS=/tmp/iitaly-browser/node_modules node scripts/design-portal-progress-review.mjs
REVIEW_TOOLS=/tmp/iitaly-browser/node_modules node scripts/design-portal-university-selection-review.mjs
```
