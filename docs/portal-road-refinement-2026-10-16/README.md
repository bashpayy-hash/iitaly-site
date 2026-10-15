# A more coherent persistent route guide

The user supplied a screenshot of the six-stage route, with four of 26 tasks
completed and a long parent-owned current step. The previous guide spread its
stage, next action and scooter across the full page width. This refinement keeps
the existing site typography, white surfaces and red action, but groups the road
and next step into one outlined surface.

- At 1280 px and wider, the six-stage road and next-step copy sit side by side.
- Narrower desktop layouts and routes with an additional education stage keep
  enough width for every stage label. At 900 px and below, labels collapse and
  the current stage, real completed count and full next step remain visible.
- The scooter is slightly larger; the rail and future milestones are quieter.
  Labels are centred on their milestones instead of uneven interval midpoints.
- The action remains one compact visual target inside the existing whole-guide
  link. There is no new navigation, button, completion action or API call.

The real route denominator, global completion position formula, current-step
selection, 1080 ms interruptible transform motion, first-load behaviour and
reduced-motion handling are unchanged. Completed tasks from later stages still
count towards global progress; the current-stage text and ring continue to
identify the first active stage.

## Before and after

These are local synthetic fixtures, not screenshots of a real applicant's data.
The same six stages, 26 task IDs, four completed tasks and parent-owned current
step are used on both sides.

| Viewport | Before | After |
| --- | --- | --- |
| 1440 × 900 | [Before](before-1440.webp) | [After](after-1440.webp) |
| 1024 × 768 | [Before](before-1024.webp) | [After](after-1024.webp) |
| 768 × 1024 | [Before](before-768.webp) | [After](after-768.webp) |
| 390 × 667 | [Before](before-390.webp) | [After](after-390.webp) |

## Verification

The progress review now includes this exact long-title fixture and an additional
1200 px responsive boundary case. It checks the real 4/26 count, all six stages,
full title and action visibility, label collisions, fixed progress after actual
scrolling, read-only future steps, a static guide on the opened current step,
reduced motion and absence of unexpected API calls.

The normal review still runs every existing state, keyboard, completion,
accessibility and motion assertion. No existing invariant has been weakened.
`ROAD_DESIGN_REVIEW_ONLY=1` is an explicit local capture mode; CI runs the full
suite. The guide still must fit within 210 px and leave at least half of the
short phone viewport available for its content.

```bash
NEXT_PUBLIC_BACKEND_URL=https://web-production-9faf3.up.railway.app NEXT_PUBLIC_STRIPE_ENABLED=true npm run build
npm run lint
REVIEW_TOOLS=/tmp/iitaly-browser/node_modules node scripts/design-portal-progress-review.mjs
```
