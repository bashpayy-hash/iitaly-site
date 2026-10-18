---
name: iItaly — Renaissance Gallery
description: A Russian-language student journey through a restrained gallery of Italian art.
colors:
  putty: "#c4c3b6"
  ink: "#000000"
  bone: "#e7e5e4"
  chalk: "#ebebeb"
  vellum: "#dfdcd5"
  graphite: "#595855"
  ash: "#808080"
  paper: "#ffffff"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "374px"
    fontWeight: 500
    lineHeight: 0.84
    letterSpacing: "-3.37px"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(52px, 6.55vw, 94px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.85px"
  heading-lg:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "52px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.47px"
  title:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1.1
  heading:
    fontFamily: "Inter, Helvetica Neue, Arial, sans-serif"
    fontSize: "43px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.215px"
  heading-sm:
    fontFamily: "Inter, Helvetica Neue, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "-0.13px"
  subheading:
    fontFamily: "Inter, Helvetica Neue, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "-0.11px"
  body-sm:
    fontFamily: "Inter, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  field:
    fontFamily: "Inter, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontFamily: "Inter, Helvetica Neue, Arial, sans-serif"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1.25
rounded:
  links: "2px"
  cards: "9px"
  buttons: "28.8px"
  vignette: "50%"
spacing:
  unit: "4px"
  "4": "4px"
  "16": "16px"
  "20": "20px"
  "28": "28px"
  "32": "32px"
  "36": "36px"
  "40": "40px"
  "52": "52px"
  "60": "60px"
  "96": "96px"
  "168": "168px"
  section-gap: "80px"
  card-padding: "24px"
  element-gap: "6px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.buttons}"
    padding: "9px 17px"
  button-primary-hover:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper}"
  button-reversed:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.buttons}"
    padding: "9px 17px"
  button-reversed-hover:
    backgroundColor: "{colors.vellum}"
    textColor: "{colors.ink}"
  link-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.links}"
    padding: "0px"
  input:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.cards}"
    padding: "12px 14px"
  card:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.cards}"
    padding: "{spacing.card-padding}"
  filter:
    textColor: "{colors.ink}"
    rounded: "{rounded.links}"
    padding: "9px 12px"
  filter-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.links}"
    padding: "9px 12px"
  navigation:
    backgroundColor: "{colors.putty}"
    textColor: "{colors.ink}"
    padding: "16px 0px"
  art-vignette:
    backgroundColor: "{colors.ash}"
    rounded: "{rounded.vignette}"
    width: "200px"
    height: "200px"
  notched-card:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "40px"
    width: "min(400px, calc(100% - 48px))"
  hero-wordmark:
    textColor: "{colors.ink}"
    typography: "{typography.display}"
  hexagon:
    textColor: "{colors.ink}"
    width: "12px"
    height: "14px"
---

# Design System: iItaly — Renaissance Gallery

## Overview

**Creative North Star: "Renaissance Gallery on Putty Paper"**

iItaly presents the journey to studying in Italy as a sequence of calm gallery rooms. Putty walls, ink-black rooms, classical paintings, and monumental serif type create the atmosphere. Compact, readable utility type gives applicants a practical place to choose, understand, and complete their next step.

The system is restrained and flat. Art and typography carry its character; surfaces use tonal contrast, hairline boundaries, and deliberate space. Russian and Cyrillic support are essential. The previous warm SaaS identity, saturated accents, decorative assistant portraits, shadows, and gradients have been replaced.

**Key Characteristics:**
- A fixed eight-color neutral palette with hard transitions between light and dark rooms.
- Playfair Display for editorial moments; Inter for reading, controls, and data.
- Public-domain Italian paintings in full-bleed panels and circular vignettes.
- Compact pill actions, flat bone cards, notched showcases, and hexagonal indicators.
- Motion that clarifies entrances and state while preserving reduced-motion access.

The frontmatter is the normative token layer. Its palette, inherited type measurements, spacing, and radii preserve the supplied reference values. `src/styles/variables.css`, `src/styles/theme.css`, and `design/tokens.json` retain the imported primitives; `src/app/globals.css` binds their family names and legacy aliases to the implemented world. `src/styles/gallery.css` and the component styles supply responsive and contextual treatments. The reference brand's finance copy, monogram, and font licensing assumptions are not iItaly product requirements. This document records the implemented direction and approved exceptions; it does not claim every legacy component uses every canonical measurement identically.

## Colors

Warm, mineral neutrals provide the entire interface palette. The paintings may retain their original pigments; do not sample them into new UI accents.

### Primary

- **Putty:** The default page canvas and light gallery room.
- **Ink:** Primary text, strong hairlines, dark gallery rooms, selected states, and filled actions on light surfaces. The supplied reference's conflicting warning against ink CTAs is superseded by its actual pill-button pattern and the iItaly implementation.

### Neutral

- **Bone:** Working cards, forms, menus, and secondary light surfaces. It separates tasks without shadows.
- **Chalk:** Footer and section-base surface, used to establish a quiet final zone.
- **Vellum:** Subtle boundaries and secondary text inside ink rooms.
- **Graphite:** Secondary copy on bone, placeholder text on light fields, and the hover fill of ink actions.
- **Ash:** Painting placeholders and neutral image containers; not the default small-text color.
- **Paper:** Reverse text, icon strokes, and reversed actions in ink rooms. Avoid using it as a large page canvas.

**The Contextual Contrast Rule.** Use ink for small secondary text on putty. Graphite is suitable on bone; vellum and paper are the corresponding text roles in ink rooms. The default `--text-secondary` and `--text-muted` aliases therefore resolve to ink on putty; graphite remains an explicit bone-surface choice. Do not assume a muted token is readable on every surface.

**The Eight Colors Rule.** New UI colors must resolve to the eight frontmatter primitives. Legacy names such as cream, crimson, cloud, warm, accent, and apple are compatibility aliases, not permission to restore old colors. Do not generate tonal ramps or introduce derived palette colors, including in documentation previews.

Color is reinforced by text, borders, underlines, icons, and selected-state attributes. A selected item, validation result, or current step must remain understandable without a saturated status color.

## Typography

**Display Font:** Playfair Display, with Georgia and serif fallbacks. The implementation loads Latin and Cyrillic subsets at regular and medium weights.

**Body Font:** Inter, with Helvetica Neue, Arial, and sans-serif fallbacks. The implementation loads Latin, Cyrillic, and Cyrillic Extended subsets at regular and medium weights.

The supplied names Davinci and Helvetica Now remain compatibility token names. In the live application, `--font-davinci` resolves to Playfair Display and `--font-helvetica-now` resolves to Inter. Do not request unavailable fonts or add a second display family.

### Hierarchy

- **Display:** The `display` role is the monumental, intentionally cropped ITALIA wordmark. Its source size, weight, line height, and tracking remain exact; responsive composition crops the shape instead of shrinking it into ordinary body content.
- **Headline:** Fluid gallery titles use `headline`. Desktop and mobile rules tune composition, with larger editorial breathing room than the utility interface.
- **Editorial title:** `heading-lg` and `title` cover the smaller serif moments. Serif use begins at the title size; smaller functional headings remain Inter. Legal pages and the admissions-changes page use a local `clamp(34px, 5vw, 52px)` title with `overflow-wrap: anywhere` so long Russian words remain readable within the viewport.
- **Utility headings:** `subheading` and `heading-sm` carry compact workspace headings. The inherited `heading` measurement is retained for numeric emphasis, not as a new sans-serif display style. The current price line uses the same numeric size with a local line height of 1.2.
- **Body:** `body-sm` is the default reading role. Some introductions and fields use the field size; longer descriptions use locally increased leading. Keep line length comfortable rather than stretching copy across the full gallery wall.
- **Labels:** `label` handles actions, captions, step labels, and small data. Medium weight can establish hierarchy without adding color.
- **Micro:** `micro` is an explicitly approved inscription exception on the notched showcase. It is not the size for instructions, controls, disclosures, or essential status.

**The Two Voices Rule.** Playfair Display handles editorial headings at 34px and above. Inter handles utility text in the 9–26px range, with the inherited 43px numeric exception. Both families use only weights 400 and 500.

**The Legible Detail Rule.** Essential body and control text begins at 12px. The 9px inscription and small artwork credit are deliberate, localized exceptions; do not spread them to task instructions.

The source scale is preserved in the frontmatter; the CSS may use contextual intermediate sizes and leading. Future work should extend the documented roles rather than indiscriminately replacing every existing size.

## Layout

Gallery sections span the viewport. The home page's desktop content uses fluid side gutters of 6vw, two-column editorial arrangements, and generous gaps. Ordinary room padding is based on the larger spacing steps. The wordmark and painting panels may overflow their own clipped frame; task content and controls must remain inside the usable viewport.

Working surfaces use the canonical card padding and compact utility rhythm. The base spacing unit, full imported spacing scale, section gap, and element gap are retained in frontmatter. These are a vocabulary, not a rule that every observed margin is identical to a scale step.

At the gallery's medium breakpoint (900px), columns tighten and side gutters reduce. At the mobile breakpoint (640px), primary editorial grids become one column, side gutters become 24px, and the three-vignette composition stacks vertically. Pricing and helper layouts also use a local 700px breakpoint. Preserve readable text and useful control targets before pursuing exact desktop composition on a phone.

The sticky header follows the light or dark room beneath it. In-page destinations account for the header with an 88px scroll offset. Expanded menus and task panels must not create a second competing navigation bar.

**Clear next action:** Keep one visually dominant next action within a task surface, with supporting actions as text links. Marketing, reading, and working surfaces can share the same tokens without sharing the same density.

## Elevation & Depth

There are no shadows, text shadows, gradients, glass effects, or luminous accents in this world. Depth comes from alternating rooms, bone against putty, a painting behind an ink showcase, hairlines, and scale. Cards remain flat in all interaction states; keyboard focus uses a visible outline rather than a glow.

**The Flat Gallery Rule.** Express hierarchy through tone, type, spacing, and geometry. Do not introduce shadow or gradient tokens, including through legacy utilities.

Motion is a progressive enhancement. Gallery headings reveal upward with the implemented long ease; buttons and links use short transitions; circular art moves only subtly. The painting panel and its notched card use restrained opposing scroll movement. The header switches its color role when crossing an ink room. Reduced-motion preference reveals content immediately and removes travel, parallax, and unnecessary transitions. Motion must never be required to read content or complete a task.

## Shapes

The system uses the canonical card, link, and pill radii from frontmatter. Cards have slightly softened corners; actions are compact capsules; links and filter tabs have barely softened corners. Do not substitute nearby standard radius values just because a utility class is convenient. The compatibility utility `--radius-2xl` resolves to `--radius-cards` (9px); its familiar name does not authorize a larger radius.

Circular art vignettes use the documented diameter. Full-bleed paintings remain rectangular and unframed. Hexagons are a secondary shape for progression and state, not a replacement for every icon.

The signature ink showcase uses a clipped eight-sided silhouette with 24px corner cuts and a nominal 400px width. This is a geometric exception to the ordinary rounded card: its current clip-path has straight cuts rather than a rounded rectangle. Its internal padding is larger than the working-card padding and decreases on mobile.

## Components

### Buttons and text links

Filled actions are compact and quiet. The primary variant uses ink with paper text, and the reversed variant uses paper with ink text in dark rooms. Use the canonical pill shape, label role, and padding. The gallery button's minimum height is 36px; menus, filters, and other touch-oriented controls may retain larger targets.

Hover changes the filled surface to graphite, or to vellum in the reversed variant. A gallery button's label shifts slightly; a text link reveals a thin underline. Disabled controls reduce opacity and do not imply successful completion. Keyboard focus uses a 2px outline with 4px offset in the current contrasting foreground. Ghost actions inherit the room's text color and use no filled background.

Legacy button APIs retain their public variants and some existing dimensions. Their appearance resolves through the new palette and no-shadow rule; their older API names and comments do not define a second design system.

### Cards and task containers

Bone cards use the canonical working-card radius and padding. Vellum gives a subtle boundary; ink is available for a stronger edge, as in the route preview. Reading labels and secondary copy can use graphite on bone. Hover does not lift a card or add a shadow.

The current portal opens the present task with its checklist and next action visible. Related instructions and uploads belong to that task surface. Keep this behavior scoped to task work; it does not require every gallery card to become an expanded checklist.

### Inputs and fields

Fields use bone, ink text, a thin ink outline, the card radius, and a comfortable field font. The shared marketing form field uses the frontmatter padding and a minimum height of 48px. Preserve visible labels, keyboard focus, and readable placeholder contrast. Explain validation and disabled states in text; do not rely on color alone. Specialized document forms retain their existing geometry and workflow contracts.

### Filters and tags

University filters are compact, nearly square-cornered controls. Their selected state uses ink and paper with an explicit pressed state. The unselected state is transparent on the surrounding light surface; hover changes the surface gently. Plain editorial badges are typographic labels, without a colored capsule or decorative glow.

### Navigation

The public header has the iItaly identity and one text menu trigger. Opening it reveals the destination list on a bone panel. The menu closes on destination choice, outside interaction, or Escape, returning keyboard focus to its trigger for Escape. The header reverses its foreground and background over an ink room.

The portal has one local navigation row: current work, the complete route, documents, and settings. A thin divider and an underlined current destination establish state; the row wraps on small screens. Do not add a duplicate sidebar or competing primary tab bar.

### Guide reading

The current guide entry offers four situations that lead sequentially through thirteen topics. The active topic is a readable article, with ordered progression, sources, and previous/next actions. Search is a secondary disclosure. Preserve direct topic links and visible focus when changing steps; the gallery treatment must support reading rather than burying every topic in a grid of decorative cards.

### Hero wordmark, painting, and showcase

The ITALIA wordmark is a compositional mark, not the text label for the service. Preserve an accessible iItaly identity in navigation and meaningful heading text alongside the decorative crop.

Painting panels and circular vignettes use the locally served Canaletto reproductions listed in `public/art/sources.json`. The manifest records The Met collection links and public-domain/Open Access attribution. These are eighteenth-century works within the chosen classical-gallery art direction; do not inaccurately label the individual paintings as Renaissance works. Keep full-bleed art rectangular, circular crops purposeful, and credits available.

The notched card is an editorial showcase over a painting. Its micro inscription is the approved small-type exception. Its geometric silhouette and dark field carry the emphasis without a shadow. Product previews must be labeled as examples and must not present invented admission or scholarship outcomes as personal facts.

### Assistant

The assistant remains a functional, minimal chat entry with text and a simple symbol. It yields when necessary to avoid covering the main action. Do not restore a 3D avatar, decorative portrait, or promotional character scene.

## Do's and Don'ts

### Do:

- **Do** use the exact eight-color palette and choose secondary text by its surface.
- **Do** pair Cyrillic-capable Playfair Display headings with Inter utility text at weights 400 and 500.
- **Do** preserve the monumental wordmark, restrained pills, flat bone cards, and geometric showcase.
- **Do** use locally served classical paintings with the source manifest and credits intact.
- **Do** preserve visible keyboard focus, current-state semantics, readable task details, and reduced-motion behavior.
- **Do** distinguish a labeled product example from an applicant's real plan or result.

### Don't:

- **Don't** reintroduce saturated interface accents, shadows, gradients, glass, or the former warm SaaS styling.
- **Don't** use small serif copy, ornamental display type for controls, or unapproved display weights.
- **Don't** apply the micro inscription size to essential instructions, controls, or legal copy.
- **Don't** turn compatibility names or reference-brand examples into new visual requirements.
- **Don't** use modern stock photography, generated assistant portraits, or 3D character decoration in gallery surfaces.
- **Don't** duplicate navigation or let floating controls cover the primary task action.
