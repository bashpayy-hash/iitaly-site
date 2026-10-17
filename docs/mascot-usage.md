# Веспи Баурысаков

User-approved IITALY mascot, 17 October 2026. The slightly plush **Crema Soft**
character replaces the former scooter character. The accepted image is the
visual authority; do not redraw it as SVG or generate a different face.

## Identity and files

- Ivory micro-velvet face and body, peach cheeks, black oval eyes and a smile.
- Glossy red helmet and scooter, cream cape with olive edging, suede boots.
- The name is **Веспи Баурысаков**, consistently in the helper title and greeting.
- Master: `design/mascot/vespi/vespi-master.png`. Generated in Higgsfield, with
  a transparent background prepared from the approved image. Not served to visitors.
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
| Guides terrace foreground | Full rider | 172px wide desktop; 100px mobile |
| Guides topic navigation | Face | 32px; marks the selected stage, not completion |
| Guides educational note | Face | 36px desktop; 28px mobile |
| Guides next action / plan continuation | Face | 48px desktop / 36px mobile |

## Placement

Preserve the site's light surfaces, typography and red actions. Use one full
character illustration per section. A small helper avatar is a navigation
control, not a second decorative hero. Keep the accepted campus illustrations;
the character sits in their foreground without overlapping copy.

Do not add the mascot to university rows, comparison tables, document reports,
payment, legal decisions or the MOD. 209 trainer. The portal's road already carries
the character across its screens; another large figure would add noise.
Do not turn the character into an additional button or interrupt the next step.

The user's 17 October guides request explicitly permits small avatars beside
educational warnings in `/guides`. Preserve each reviewed warning verbatim:
the character draws attention, never certifies eligibility or acceptance.
Use the existing face crop, not an approval stamp, uniform or invented pose.
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
The guides stage marker follows the selected topic (420ms, transform); it is
not a reading/completion tracker. Reduced motion makes the change immediate.

## Delivery budget

Ride widths: 160, 320, 640px. Face widths: 96, 192px. All five WebP variants
together are under 100KB; the smallest road image is under 10KB. Responsive
`srcSet`/`sizes`, intrinsic dimensions and same-origin URLs prevent unnecessary
downloads, layout shifts and reliance on generation services at runtime.

The previous `docs/mascot-bible.md` and vector source files remain historical
references only. They no longer define the shipped character.
