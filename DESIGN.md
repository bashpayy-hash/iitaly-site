# iItaly — Warm Modern Italian Editorial SaaS

The user explicitly authorized a global design-system unification on 18 October 2026.
This replaces all earlier page-specific palettes and the earlier prohibition on
changing colors outside /guides. The supplied /guides screenshot is the composition
reference: airy spacing, rounded pills, confident headings and Italian artwork.

## Canonical source

`src/app/globals.css` owns the complete palette in :root and the Tailwind v4 theme.
`design/warm-tokens.json` is its portable color manifest. Do not add another palette.
Main colors: base #FAF8F5, surface #FFFFFF, subtle #F3EFEA, primary text #141413,
secondary text #57534E, muted #8C857B, accent #E63946. Supporting colors are the
user-specified cream, peach, lemon and coral-gradient stops in the manifest.

Use the same fonts, spacing rhythm, pills, soft warm shadows and 24–32px content
cards on home, universities, plan, prices, guides, portal and utility routes.
Inter Tight is the shared UI face from the accepted guides page. Main headings
use weight 800, tracking -0.03em and line height 1.08. One meaningful phrase or
word receives the shared editorial accent. Small captions remain readable.

The fixed ambient layer and the guides hero use cream, peach and lemon washes
blurred by 90px. Content cards are white. Active tabs are white or pale coral,
with graphite/coral type, warm borders and soft shadows. Controls have a visible
coral focus ring, 44px targets where applicable and reduced-motion support.

The university map uses the same light palette. Its geometry, selection,
keyboard controls and labels are unchanged. Status text and icons retain their
meaning without relying on a separate color palette. Existing approved Italian
illustrations remain artwork; repeated mascot portraits are removed. Interface color rules
apply to CSS, Tailwind, inline styles, SVG and generated social cards.

## Validation

`npm run check:palette` scans all application source, styles, vector assets and
the token manifest. It rejects out-of-palette color literals and obsolete color
utilities. Build the static export with `npm run build`; inspect every route and
interactive state at desktop and mobile sizes. Check actual computed colors as
well as source literals so inherited browser defaults cannot escape inspection.

Product facts, API contracts, payments, authentication and saved plans are outside
the visual change. Do not invent admissions requirements, prices or outcomes.

## Current product structure

Preserve the shared local questionnaire and guest workspace, isolated cloud sign-in, one consolidated portal navigation, face-free utility icons and the established logo. The pricing botanical scene, terrace, tomato artwork and responsive geometry remain intact. Route progress is task completion, not admission probability; local completion does not create AI review verdicts or paid privileges. These surfaces use the canonical tokens above.

## Current product-flow changes

The user cancelled the Renaissance gallery direction. The warm palette, fonts, logo, header and component scale above remain the baseline (1d9b9dc). Do not restore the rejected serif typography, ink rooms, giant wordmark or classical painting system.

Home uses a functional, explicitly labelled route example, one focused action block, a three-stage admissions timeline and one compact price feature list. Guides start with four scenarios and preserve all thirteen source-backed topics, URL history and contextual help. Portal navigation is consolidated into Now / Full route / Documents / Settings; task checklists, files and existing deadlines are visible. Do not reintroduce portrait repetition, payment as an admissions stage, or delegated owner tags. The assistant remains a quiet functional chat entry.

## Selective refinement — 19 October 2026

The user requested emoji removal, the return of Vespi's introduction and selective rigor from earlier versions. Keep one illustrated introduction on the home page, after the admissions timeline. Its button opens the existing assistant without automatically sending a message. Reuse the approved responsive WebP artwork; keep task cards, guides and filters free of repeated portraits.

University filters, pricing decisions and portal working cards use the shared `ledger` surface: white, a clear graphite border, 16px corners and no decorative shadow. Portal navigation uses a simple active underline. These scoped changes retain the warm palette and illustrated marketing sections; they do not restore the cancelled gallery system. Colorful emoji are excluded from application source; functional icons use the existing Lucide set.
