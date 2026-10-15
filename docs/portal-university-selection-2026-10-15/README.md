# Choose universities inside the portal

Requested by the owner on 15 October 2026: keep the map and comparison inside
the personal portal, continue the route after choosing, and make unlimited
document checking the portal's central benefit.

## What changed

- The existing `shortlist` step embeds the real catalogue. City map, filters,
  city matching, university details, three-university comparison, all 12
  comparison parameters, differences-only and 10/12-month budget controls remain.
- `В мой список` is independent of comparison. The only filled commit action is
  `Сохранить`. It is unavailable without a selection; it becomes sticky only
  after a selection, leaving the city selector unobstructed on a short phone.
- Saving uses the existing task endpoint, then returns to the overview and the
  next real task. The completed selection remains editable. The assistant knows
  the chosen university names without treating them as confirmed programmes.
- The overview and Documents screen foreground unlimited checking. An existing
  approved/available report can be checked again. A replacement requiring
  clarification remains recheckable. Future unavailable documents remain gated.
- Five outcome names, full report reasoning, sources, review profiles, document
  completion semantics, Stripe, authentication and MOD. 209 remain unchanged.

## Persistence boundary

The existing backend `/profile` whitelist does not accept university IDs and no
shortlist endpoint exists. The owner's earlier restriction on backend/API
changes is preserved. The list is stored **only in this browser**, clearly stated
beside the save flow and on the overview. The account-scoped key is hashed and
uses the authenticated surname with backend-compatible normalization. It is
isolated between accounts, survives logout/reload, and is removed on successful
account deletion. No new profile field is sent to the API. The task completion
itself is stored on the server. Cross-device shortlist sync is not claimed.

Storage failure prevents completion; server failure retains the local selection
and requires an explicit retry. The catalogue contains universities, not verified
programme records, so selecting a university does not manufacture programme
requirements or deadlines.

## What unlimited means

Read-only backend audit at `9db90b6584d46e695f21312762529f4b2a473a85`:
`server.js` has no total/account/tier check quota, increments attempts without a
cap, and replaces the latest report. Its existing protection of 12 files per
5 minutes per IP and file-size limits remain. The Documents screen states the
throughput limit and latest-report retention. A new non-approved result removes
the prior completion according to the unchanged backend logic.

## Verification

- Production static export and ESLint.
- Portal progress/navigation review: current/future/done states, sticky road,
  motion, contextual assistant, keyboard and mobile behavior.
- New university-selection review: real embedded map/filter/comparison controls,
  separate selection, save/next step, editing, reload, account isolation, storage
  and server failures, axe, and visible city choice on 390×667.
- Document report review: five outcomes, full sources, completed-file rechecks,
  non-approved replacement then successful recheck, no automatic upload on reload.
- Public university and comparison reviews retain their existing behavior.
- All API tests use synthetic profiles; no real user documents are transmitted.

The former tests requiring `/universities` navigation and counting every button
on `shortlist` changed intentionally: embedded map/filter controls are allowed,
but only one Save action commits the choice. The document test now explicitly
requires rechecking an approved file; future-unavailable gating remains tested.
The launch recovery review likewise expects one explicit new-version action on
an approved report. Its check/save retry assertions stay intact; opening a saved
report must not trigger a new check, and the road remains visually secondary.

## Screenshots

Before: [PR #89 screenshots](../portal-compact-help-2026-10-15/README.md).
All after screenshots use synthetic profiles.

| Screen | Desktop | Phone |
|---|---|---|
| Overview | [1440](overview-1440.webp) | [390](overview-390.webp) |
| Choose a university | [1440](selection-initial-1440.webp) | [390](selection-initial-390.webp) |
| Selected university | [1440](selection-chosen-1440.webp) | [390](selection-chosen-390.webp) |
| Continue route | [1440](next-step-1440.webp) | [390](next-step-390.webp) |
| Plan | [1440](plan-1440.webp) | [390](plan-390.webp) |
| Documents | [1440](documents-1440.webp) | [390](documents-390.webp) |
| Settings | [1440](settings-1440.webp) | [390](settings-390.webp) |
| Onboarding | [1440](onboarding-1440.webp) | [390](onboarding-390.webp) |

[Short phone, 390×667](selection-initial-390x667.webp).
