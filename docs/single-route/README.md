# One route, one current task, fewer faces

The portal now renders one clickable navigator from the user's actual `roadmap`. The separate five-phase tab row and progress ring are removed. In Plan, Documents, Settings and an open task, the pinned rail contains no repeated task title or 3D portrait. Plan rows only open steps; self-report is completed with “Готово” on the eligible step screen. Plan writes the current task once in its list; the current stage heading reads “Текущие шаги” because the selected stage is already named in the navigator. The overview keeps one next-action link and one contextual copilot.

Each stage link opens that stage's first unclosed task using the existing URL and eligibility rules. Future and parent tasks remain readable; unavailable file steps have no uploader. The rail counts actual known tasks, ignores obsolete completion IDs, starts without animation, and animates only after confirmed completion. Reduced motion changes the position immediately. The local workspace uses the same rail and keeps its existing storage and cloud boundary.

## Complete production code

- [VespiIntroSection](../../src/components/mascot/VespiIntroSection.tsx) and [intro CSS](../../src/components/mascot/vespi-intro.module.css): a shared compact introduction on the home page, at the end of Guides, and on first portal entry. The existing home anchor `#vespi-editorial-title` remains valid.
- [Face-free helmet detail](../../src/components/mascot/VespiMark.tsx): a native geometric SVG using existing colors. It replaces repeated portrait circles in guide advice.
- [One route component](../../src/components/portal/PortalRoad.tsx), [route CSS](../../src/components/portal/portal-journey.module.css), [semantic stage icons](../../src/components/portal/PortalStageIcon.tsx).
- [Plan list](../../src/components/portal/PlanSection.tsx), [cloud integration](../../src/components/portal/PortalExplorer.tsx), [local integration](../../src/components/portal/LocalWorkspace.tsx), [overview copilot](../../src/components/portal/WorkspaceCoach.tsx).
- [Guides page](../../src/app/guides/page.tsx): one verification date in the section header, one warning per topic, preserved official links and scope notes, no repeated article teaser. The sticky offer yields to both inline advice and the introduction.
- [Seven English image prompts](HIGGSFIELD-PROMPTS-EN.md): introduction, working profile, inspector angle, face-free detail, and three editorial illustrations.

New rendered 3D angles and illustrated character scenes are supplied as prompts, not represented as already generated assets. The live site uses approved role imagery, the existing high-resolution crop, the native helmet detail and semantic stage icons. The deploy references no missing assets.

## Preserved contracts

Global colors, fonts and the logo are byte-for-byte unchanged from `4ee084f`. Admission data, source URLs, document-verdict interpretation, API, auth, Stripe, the map and MOD. 209 source remain unchanged. Copy reductions remove interface repetition; document requirements, warnings and institutional decision limits remain available.

## Verification

Build, TypeScript and ESLint pass. The warm palette scan covers 240 tracked production source files with zero cold color literals/classes. The route review covers six viewport/height combinations, fourteen fixture modes at 1440px and 390px, two retry/motion cases, keyboard stage navigation, browser Back, one assistant context, first-entry contrast, sticky positioning, and axe. Existing independent reviews cover full saved reports, local questionnaire/draft and selection, university map/comparison, contained assessment/rules/trainer flows, login, Telegram, guide interactions, role artwork, public routes and UX recovery.

The old progress review's whole-card-link, fixed five-phase, front-facing stage portrait and 8–92% scooter assertions intentionally changed with the brief. The review now checks a single actual-stage navigator and its existing actions. Fixture definitions were extracted unchanged into [portal-review-fixtures.mjs](../../scripts/portal-review-fixtures.mjs). Other reviews target the explicit next-action link instead of clicking a non-interactive card background. They continue to exercise the same product actions.

The pricing content comparison permits exactly one approved shorter Vespi sentence. It continues to compare every other original text node, including prices, terms, inclusions and limits, without exclusions.

## Screenshots

| Screen | Before 1440 | After 1440 | Before 390 | After 390 |
|---|---|---|---|---|
| Plan | [before](screenshots/before-portal-plan-1440.webp) | [after](screenshots/after-portal-plan-1440.webp) | [before](screenshots/before-portal-plan-390.webp) | [after](screenshots/after-portal-plan-390.webp) |
| Overview | [before](screenshots/before-portal-overview-1440.webp) | [after](screenshots/after-portal-overview-1440.webp) | [before](screenshots/before-portal-overview-390.webp) | [after](screenshots/after-portal-overview-390.webp) |
| Guides | [before](screenshots/before-guides-1440.webp) | [after](screenshots/after-guides-1440.webp) | [before](screenshots/before-guides-390.webp) | [after](screenshots/after-guides-390.webp) |

Reported long parent task, written once: [1440](screenshots/portal-plan-parent-1440.webp) · [390](screenshots/portal-plan-parent-390.webp).
Introduction: [1440](screenshots/after-vespi-scene-1440.webp) · [390](screenshots/after-vespi-scene-390.webp).
First cloud entry: [1440](screenshots/portal-onboarding-1440.webp) · [390](screenshots/portal-onboarding-390.webp).
All screenshots use isolated synthetic profiles; no attached personal browser screenshot is published.
