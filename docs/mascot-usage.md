# Веспи Баурысаков

User-approved IITALY mascot, 17 October 2026. The slightly plush **Crema Soft**
character replaces the former scooter character. The accepted image is the
visual authority; do not redraw it as SVG or generate a different face.
The approved small identity refinement is one cream route stripe and an olive
waypoint on the red helmet. Keep it consistent in the rider and face crop.

## Current direction: shared behavior, unchanged palette

The latest user request extends Vespi across `/`, `/guides`, `/universities`,
`/plan`, `/prices` and `/portal`. It replaces the earlier guides-only placement
restriction but **does not authorize a palette, token, font or background change**.
Keep each route's published surfaces and actions, including the existing blue
language of `/guides`, the site's red actions and the editorial illustrations.
A common assistant means consistent roles, hierarchy and presence, not recoloring
all routes or adding the same small circle to every block.

Current architecture and evidence status: `vespi-assistant-system/README.md`.
The earlier `vespi-meta-guides/`, `vespi-refinement-2026-10-17/` and
`vespi-guides-2026-10-17/` documents remain historical evidence.

## Identity and files

- Ivory micro-velvet face and body, peach cheeks, black oval eyes and a smile.
- Glossy red helmet and scooter, cream cape with olive edging, suede boots.
- The name is **Веспи Баурысаков**, consistently in the helper title and greeting.
- Original master: `design/mascot/vespi/vespi-master.png` (Higgsfield).
- Refined master: `design/mascot/vespi/vespi-route-master.webp`, edited with
  built-in Imagegen using the approved rider as the identity reference.
  Neither master is served to visitors. Original assets remain available.
- Production: `public/mascot/vespi/`. Transparent WebP served locally by static export.
- Image component: `src/components/mascot/Vespi.tsx`. The old `Vespa` /
  `VespaReveal` exports remain compatibility wrappers for existing states.
- Assistant component: `src/components/mascot/VespiAssistant.tsx`, supported by
  `vespi-assistant.module.css` and `useVespiPresence.ts` in the same directory.

## Roles, layouts and fallback

`variant` defines the content's role; `layout` defines composition. Neither is
an admission verdict, an AI request, a paid feature or an automatic action.

| Role | Intended use | Current image |
| --- | --- | --- |
| `route` | Education choices, catalog and map navigation | Approved face / full rider |
| `inspector` | Document preparation, upload and actual review | Higgsfield glasses portrait / document figure, v1 |
| `copilot` | Questions, current / future step explanation, next action | Higgsfield chest-up portrait, v1; rider fallback for figure |
| `celebrate` | A received result or completed step | Approved original fallback |

The 18 October implementation registers real `inspector` portrait / figure and
`copilot` portrait assets. Both were generated with Higgsfield from the approved
rider reference, inspected against that identity, then cropped and encoded as
transparent WebP. The document has neutral lines, no official seal or verdict.
Provenance, exact prompts, lossless masters and crop coordinates are stored in
`design/mascot/vespi/roles/`; delivery evidence is in `vespi-role-art/README.md`.

`celebrate` and an unavailable special figure still resolve to the original
artwork, marked `data-vespi-fallback="approved-original"`. The road explicitly
requests `route + figure`, so changing an assistant pose cannot remove its rider.
The legacy `Vespa` adapter now forwards roles, including copilot for chat.

| Layout | Visual behavior |
| --- | --- |
| `inline-pill` | Short explanation; indicator by default, or text only |
| `editorial-callout` | 96px portrait on desktop / 72px on mobile, subtly outside the edge |
| `portal-copilot` | 96px / 72px portrait next to a question or real task state |
| `floating-bar` | 64px portrait in a route-owned floating composition |

`appearance` can be `portrait`, `figure`, `indicator` or `none`. The content
owns its heading, copy and action through props / children. New layouts inherit
the route's current palette and font. They do not add decorative rings around
every face, automatic messaging, an extra CTA or another navigation destination.

## Placement and presence

Use one meaningful character composition at a time. The existing campus hero,
login foreground and onboarding remain recognizably the same character. Keep
accepted `terrace.webp`, `campus-arrival.webp` and `balcony-scene.webp`.

| Surface | Placement |
| --- | --- |
| Home hero | Full rider beside the existing starting action |
| Home process / price | Copilot at the first workflow step; text-only price explanation |
| Prices | One inspector callout within the existing paid offer |
| University catalog | Route portrait before filtering; omitted in the portal's embedded picker |
| Guides search | Compact «ИИ» indicator, no repeated face crop |
| Guides article | One larger portrait with role-aware advice and the existing contextual action |
| Guides sticky plan | Shown only after Hero and outside the entire visible article insight |
| Plan questionnaire | Copilot explaining why each of the existing 10 questions is asked |
| Plan document check | Inspector reflects actual reading / checking / result state |
| Portal overview | Existing road and current action; no duplicate welcome CTA |
| Portal task / document detail | Contextual portrait; road uses a location marker instead of another character |
| Portal empty states | Helpful explanation with an indicator when the road owns the character |
| Shared helper launcher | Face when no content mascot is visible, otherwise the same action with an «ИИ» indicator |

`useVespiPresence` observes content images outside `#chat-launcher` and
`#iitaly-chat`. Its event-driven visibility state changes the launcher's visual,
not its behavior or accessible name. Images loaded after navigation are included
through a mutation observer. There is no scroll polling.

The guides sticky capsule observes the complete Hero and complete inline insight,
including its protruding portrait. A 140px early-clearance area prevents the
floating and inline characters from meeting. It also keeps its existing hide
rules for open chat, focused form fields, open mobile navigation and short
viewports, its dismiss action, and its clearance above the site badge.

Do not add Vespi to university rows, comparison tables, payment decisions or
the MOD. 209 trainer. Do not place a portrait next to every document finding.
The inspector belongs to the report's overall result; original findings and
source details remain legible, factual content.

## Meaning and actions

The character never certifies eligibility, a visa or acceptance. No official
approval seal is shipped; the expert image is an assistant, not an institution. Deadline text comes from the
existing task / source; absence of requirements is not a defective file.
The five document statuses and their meanings are unchanged.

The portal road remains the single next-action entry. A future or parent-owned
step still explains who acts and what must happen first; the mascot does not
unlock upload or self-report. Existing task completion, document recheck,
authentication, Stripe and API contracts are outside this visual refactor.

A guide keeps one contextual next action and readable official sources. The
same helper receives the selected guide / task; opening it never sends a question
or consumes an allowance automatically. The free plan's questionnaire keeps its
questions, answer values and saved draft. Its new short explanations describe
why the answer matters without predicting admissions results.

## Motion and accessibility

The bitmap remains static. Existing wrappers animate only transform / opacity:
server-confirmed road travel (1080ms), restrained arrival and quiet idle (2.8s).
The next-step text updates immediately; no travel animation on first load.
Waiting feedback ends when the underlying processing state ends.

`prefers-reduced-motion` disables travel, bobbing, reveal and arrival. No new
sounds, loops, fake percentages, streaks or celebration claims. `celebrate` is a
semantic role for completed work, not permission for visual noise.
Decorative portraits have empty alt text and no focus target. The helper keeps
its text label and existing keyboard flow. Controls remain outside the decorative
image; the larger figure cannot cover the action or compress mobile text.
Guides reading stages identify an open topic, not completion progress.

## Delivery budget

Ride widths: 160, 320, 640px. Face widths: 96, 192px. Versioned filenames
`vespi-{ride|avatar}-route-{width}.webp` prevent cached original imagery.
The five refined WebP variants together are under 100KB; the smallest road image
is under 10KB. Responsive `srcSet` / `sizes`, intrinsic dimensions and same-origin
URLs avoid layout shifts, unnecessary downloads and runtime generation services.

The six new role derivatives total 57,524 bytes. A visitor loads only the
appropriate responsive image, never the lossless masters. New files use `v1`
URLs; existing rider assets stay unchanged. No video or new animation is added. The old `docs/mascot-bible.md` and vector
sources remain historical references; they no longer define the shipped face.
