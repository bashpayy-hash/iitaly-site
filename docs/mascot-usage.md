# Веспи Баурысаков

User-approved IITALY mascot, 17 October 2026. The slightly plush **Crema Soft**
character replaces the former scooter character. The accepted image is the
visual authority; do not redraw it as SVG or generate a different face.
The user's later 17 October request authorizes a small distinctive refinement:
one cream route stripe and olive waypoint on the red helmet. Keep this detail
consistent in the full rider and the helper's face crop.

## Identity and files

- Ivory micro-velvet face and body, peach cheeks, black oval eyes and a smile.
- Glossy red helmet and scooter, cream cape with olive edging, suede boots.
- The name is **Веспи Баурысаков**, consistently in the helper title and greeting.
- Original master: `design/mascot/vespi/vespi-master.png` (Higgsfield).
- Refined master: `design/mascot/vespi/vespi-route-master.webp`, edited with
  built-in Imagegen using the approved rider as the identity reference.
  Neither master is served to visitors. Original assets remain available.
- Production: `public/mascot/vespi/`. Transparent WebP, served locally by static export.
- Component: `src/components/mascot/Vespi.tsx`. The old `Vespa`/`VespaReveal`
  exports remain compatibility wrappers for existing functional states.

| Use | Crop | Actual display size |
| --- | --- | --- |
| Portal road | Full rider | 48 × 60px desktop; 40 × 50px mobile |
| Header helper | Face | 28px inside the existing 44px target |
| Floating helper / chat header | Face | 40px / 36px |
| Home campus foreground | Full rider | 192px wide desktop; 96px mobile |
| Login campus foreground | Full rider | 148px wide desktop; 112px mobile |
| First-run profile | Face | 64px desktop; 48px mobile |
| Document processing | Full rider | 68px wide desktop; 58px mobile |
| Confirmed results | Face or full rider | Existing layout, no new CTA |
| 404 | Full rider | 160–192px high, with an explicit recovery action |
| Guides next action | Face | 56px desktop / 40px mobile |

## Placement

Preserve the site's light surfaces, typography and red actions. Use one full
character illustration per section. A small helper avatar is a navigation
control, not a second decorative hero. Keep the accepted campus illustrations;
the character sits in their foreground without overlapping copy.

Do not add the mascot to university rows, comparison tables, document reports,
payment, legal decisions or the MOD. 209 trainer. The portal's road already carries
the character across its screens; another large figure would add noise.
Do not turn the character into an additional button or interrupt the next step.

The latest request supersedes the earlier dense guides placement. No character
in the guides hero, search introduction, stage navigation, educational warnings
or plan-continuation metadata. The terrace and reviewed warning copy stay.
One character accompanies the selected topic's next action; the existing
helper keeps its avatar as a recognizable control. No additional sticky widget.
The character never certifies eligibility or acceptance. No approval stamp,
uniform or invented pose.
One chapter ends with one contextual action; sources stay visible and readable.
The same helper receives the selected topic and prepares an editable question.
Opening it never sends a question or spends the free allowance automatically.
See `vespi-guides-2026-10-17/README.md` for the research and review evidence.

## Motion and accessibility

The bitmap is static. Existing wrappers animate only transform/opacity:
server-confirmed road travel (1080ms), restrained arrival and quiet idle (2.8s).
The next-step text updates immediately; no animation on first load. The old
independent SVG wheel layers were removed to preserve the approved illustration.
Road marks still convey travel. Waiting motion ends when processing ends.

`prefers-reduced-motion` disables travel, bobbing, reveal and arrival. No new
sounds, loops, fake progress or celebration claims. Decorative instances use an
empty alt; the helper retains a text label and the existing keyboard/focus flow.
The guides underline follows the selected topic (420ms, transform); it is
not a reading/completion tracker. Reduced motion makes the change immediate.

## Delivery budget

Ride widths: 160, 320, 640px. Face widths: 96, 192px. Versioned filenames
`vespi-{ride|avatar}-route-{width}.webp` prevent cached original imagery.
All five new WebP variants together are under 100KB; the smallest road image
is under 10KB. Responsive
`srcSet`/`sizes`, intrinsic dimensions and same-origin URLs prevent unnecessary
downloads, layout shifts and reliance on generation services at runtime.

The previous `docs/mascot-bible.md` and vector source files remain historical
references only. They no longer define the shipped character.
