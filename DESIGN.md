# iItaly — warm editorial product interface

The current direction is a light, readable EdTech product. Editorial typography,
framed Italian artwork and restrained motion are accents within that product.
The rejected gallery landing-page system is not a template for the application:
do not restore full-screen black rooms, a putty page background, giant clipped
wordmarks, hexagonal navigation or miniature utility text.

## Canonical styles

`src/app/globals.css` owns the shared CSS variables and Tailwind theme.
`design/warm-tokens.json` is the portable color manifest. Use these tokens rather
than introducing page-specific palettes. The warm base is #FAF8F5, cards are
#FFFFFF, primary text is #141413, secondary text is #57534E and the delicate
editorial border is #DFDCD5. Existing coral brand accents remain restrained.

Inter Tight remains the interface face. Buttons, labels, filters, task lists,
body text and numeric indicators use the sans serif. Playfair Display is an
accent for major H1/H2 headings only: 36–56px on desktop and 32–40px on small
screens, line height around 1.08 and tracking around -0.02em. Never put the
serif face on small labels, prices, navigation or checklist content.

Use 9–12px card corners, clear thin borders and generous section spacing.
Primary actions are comfortable capsules. Working surfaces remain white and
quiet, without decorative shadows or atmosphere behind the content. Keep the
established logo, obvious focus states and accessible contrast.

## Artwork and motion

Classical Italian architecture appears in contained frames, small vignettes and
rectangular miniatures. All image boundaries are deliberate; there are no torn
white edges, blurred cutouts or repeated 3D portraits. The home hero pairs a
framed view with the interactive route example. The example is explicitly
labelled and must never appear to be the visitor's saved progress.

Artwork provenance belongs in `public/art/sources.json`. Keep original artist,
work title, museum source and public-domain/Open Access status. Use a consistent
subtle warm image treatment; do not recolor interface data or documentary scans.

Motion is progressive enhancement. Content is readable before hydration and
with JavaScript disabled. Reveals use a short, restrained upward movement;
framed images zoom slightly inside their masks. State transitions must retain
focus, URL history, working controls and readable content. Honor
`prefers-reduced-motion` by removing reveal movement and transition delays.

## Product structure and copy

Home has one focused action block, a three-stage admissions timeline and one
compact price feature list. Payment is not an admissions stage. The text-only
Vespi introduction opens the existing chat without sending a message. Guides,
filters and task cards remain free of mascot portraits and promotional banners.
The assistant is a quiet text-and-icon entry; colorful emoji are excluded.

Guides start with four situations, preserve all thirteen source-backed topics,
and show one article and one next-step action at a time. Keep deep links,
browser history, keyboard focus and contextual help. Portal uses one navigation:
Now / Full route / Documents / Settings. Task instructions, needed files and
existing deadlines are visible without opening a help accordion.

Address the student directly. Do not reintroduce delegated owner tags or the
removed family-role wording. Stable task IDs such as `familyDocs` remain part
of stored and backend contracts; their display labels use the student's action.
The legacy server-copy normalization remains in place.

## Protected behavior

Product facts, prices, API requests, payments, authentication, saved plans and
Permesso geometry are outside visual changes. Do not invent requirements,
deadlines or outcomes. Completion is the user's task progress, not an admission
probability, AI verdict or entitlement to paid features. Keep the shared local
questionnaire, guest workspace and isolated cloud sign-in intact.

The university map keeps its geometry, labels, keyboard controls, selection
and comparison behavior. Official form scans and their editable overlays are
functional documents, not decorative artwork.

## Verification

Run `npm run check:palette`, `node scripts/design-guard.mjs <reviewed-base>`,
`npm run lint` and the production build. The contract guard preserves admissions,
prices, payments, API contracts, dependencies, map data and Permesso geometry.

Run the responsive route and interaction checks against the static export.
Verify no horizontal overflow, broken art, utility serif text, mascot images,
critical/serious accessibility errors or hidden reduced-motion content. Test
home route tabs, chat open/close focus, all guide scenarios and history, map
keyboard selection, and the existing portal/payment/document workflows.
