# `/guides`: Meta-inspired reading interface

17 October 2026. The user's explicit direction is scoped to `/guides`:
light `#F8FAFC`, a blue/cyan/violet/amber mesh at 20% opacity, translucent
28px bento cards, capsule controls, contemporary headings, and the approved
Vespi face in search, insight, and the sticky plan prompt. It supersedes the
earlier rare-mascot/red-action direction on this page only.

Mode: **Read**. `DESIGN_VARIANCE=5`, `MOTION_INTENSITY=3`, `VISUAL_DENSITY=4`.
This is a visual interpretation of the supplied Meta AI reference, not an
official Meta component library, affiliation, or claim that its tokens were
extracted from Meta's site.

## Implementation and usage

| File | Responsibility |
| --- | --- |
| `src/app/guides/page.tsx` | Search, three stages, selectable topics, article facts, contextual insight, sources, and sticky plan prompt |
| `src/app/guides/guides.module.css` | Scoped materials, color, typography, responsive layout, focus states, motion and transparency preferences |
| `src/app/guides/layout.tsx` | Server SEO metadata and `/guides` canonical, kept separate from the client page |
| `src/components/guides/guideJourney.ts` | Existing topic context, plan/trainer destinations, editable helper question |
| `src/components/guides/VisaSection.tsx` | Existing visa content and checklist |
| `src/components/mascot/Vespi.tsx` | Approved responsive face crop |
| `public/mascot/vespi/vespi-avatar-route-{96,192}.webp` | Existing local face assets used by the interface |
| `DESIGN.md`, `docs/mascot-usage.md` | Scoped design decision and mascot placement rules |
| `docs/vespi-meta-guides/higgsfield-prompts.md` | Three ready-to-use briefs; no generated replacement assets |

The existing terrace illustration remains. Desktop topic cards use two
columns; narrow screens use one. Facts are read in an expanded article,
with the original source links and review date beside the content.
The mesh and gradient avatar ring are CSS, separate from the approved face.
Named Lucide React imports provide the interface icons.

## Content and interaction invariants

Shared `src/data/guides.ts`, `src/data/admissions.ts`, pricing data, and
product/backend contracts remain the factual authority. Presentation changes
must not rewrite their facts, prices, source URLs, or review dates.

| Stage | Preserved topic IDs |
| --- | --- |
| Выбрать маршрут | `education`, `tests` |
| Подготовиться к отъезду | `apostille`, `translation`, `cimea`, `con`, `iseeu`, `visa`, `minors`, `military` |
| После приезда | `permesso`, `codice`, `health-travel` |

The three stages contain all **13 topics**. A stage indicates reading
context, never completion, eligibility, a quiz answer, or a personal route.
The visa checklist and Modulo 1 trainer remain accessible. Source links,
scope notes, warnings and the review label stay visible in each opened topic.

Search covers all stages and has a clear empty state. Prompt chips and cards
select the matching topic and keep its hash link shareable. Topic focus and
scrolling respect reduced motion. Helper entry prepares an editable question;
opening the helper does not send it or spend an allowance. Analytics receive
topic/action identifiers rather than the user's search text.

Vespi offers guidance, not expert certification, acceptance guarantees or
official document approval. The current face crop is static. The sticky
plan prompt is dismissible, appears after the search area has passed, and
yields when a contextual action is visible. It must never overlap the
helper or site badge, and it hides for an open helper, focused input,
expanded mobile navigation, or short viewport.

## Review status and changed test invariants

Static export, TypeScript, ESLint, admissions rules, and the guide/UX browser
reviews passed. Guide and UX checks cover 1440, 768, 390, and 320px, including
axe, no horizontal overflow, preserved quiz drafts, explicit-only chat requests,
source visibility, contextual links and keyboard focus. The admissions browser
review passed at 1440, 390, and 320px, including the visa calculator. The broader
design and illustration reviews passed against the exact base `6d177c1`.

The guide suite also tests that quick prompts are not covered by the existing
chat launcher, and that the sticky pill is dismissible, yields to chat and inline
CTAs, clears the provider badge, and exposes reachable 44px controls.
Results: [guides](guides-results.json), [UX](ux-results.json).
The unchanged review date is not a claim of a fresh admissions-law audit.

| View | Before 1440 / 390 | After 1440 / 390 |
| --- | --- | --- |
| First screen | [desktop](before-guides-top-1440.webp) · [mobile](before-guides-top-390.webp) | [desktop](after-guides-top-1440.webp) · [mobile](after-guides-top-390.webp) |
| Apostille | [desktop](before-guides-apostille-1440.webp) · [mobile](before-guides-apostille-390.webp) | [desktop](after-guides-apostille-1440.webp) · [mobile](after-guides-apostille-390.webp) |
| Contextual action | — | [desktop](after-guides-next-action-1440.webp) · [mobile](after-guides-next-action-390.webp) |
| Sticky + provider badge fixture | — | [desktop](after-guides-sticky-with-provider-1440.webp) · [mobile](after-guides-sticky-with-provider-390.webp) |

Checks should now expect blue scoped controls, 28px cards, three face
placements, and a dismissible sticky prompt. Earlier checks for no mascot in
search/insight/sticky or for exclusively red actions on `/guides` are obsolete.

The required checks cover all 13 topics across the three stages, cross-stage
search and empty state, hash entry, keyboard focus, source links, helper
context, plan/trainer destinations, SEO metadata, reduced motion, and no
horizontal overflow. Check sticky/helper/badge collision at desktop and
mobile widths, including open chat and the on-screen keyboard. Preserve the
existing shared-data and backend contract checks. CI repeats the full repository gate before merge.

## Assets and references

No new image or video was generated for this implementation. The three
Higgsfield briefs cover an avatar, a document-guidance pose, and a restrained
motion variant. Each requires the approved master as a visual reference and
a likeness review before use; prompts are not delivered image assets.

- [Meta AI Assistant](https://ai.meta.com/meta-ai/assistant/) — supplied visual direction; reviewed as a reference on 17 October 2026.
- [Lucide for React](https://lucide.dev/guide/react) — official documentation for named SVG icon components.

### Reproduction

```sh
NEXT_PUBLIC_BACKEND_URL=https://example.invalid NEXT_PUBLIC_STRIPE_ENABLED=true npm run build
npx tsc --noEmit
npm run lint
node scripts/admissions-review.mjs
PLAYWRIGHT_BROWSERS_PATH=/tmp/iitaly-browsers REVIEW_TOOLS=/tmp/iitaly-browser/node_modules node scripts/design-guides-vespi-review.mjs
PLAYWRIGHT_BROWSERS_PATH=/tmp/iitaly-browsers REVIEW_TOOLS=/tmp/iitaly-browser/node_modules node scripts/design-ux-review.mjs
```

The illustration and broad design scripts additionally need `BASELINE_OUT`
pointing to an export of the exact base, and `NEXT_PUBLIC_STRIPE_ENABLED=true`
to match the tested build. No payment is submitted by these fixtures.

Independent finish review: **ship** after correcting the mobile action capture.
It reviewed the supplied desktop/mobile screenshots, source and saved results;
it did not rerun the browser suite or revalidate admissions law. The stronger
capture assertion scrolls to the actual CTA, waits for the sticky offer to hide,
and verifies the control's visible bounds and hit target.

The user-supplied absolute promise that a typo always causes a rejection, the
one-minute review promise, and automatic admission/calendar claims were not
introduced. Existing scope notes and the free-one-document qualification stay
visible. Conversion uplift is a goal, not a measured result of this change.
