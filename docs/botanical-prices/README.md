# One Mediterranean canvas for the pricing header

The approved terrace and tomato bowl now share an overarching botanical layer, a faint pergola and leaf-shadow layer, and a quiet route line into the comparison cards. Real transparent watercolor overlays replace the disconnected edge treatment. A cream matte protects live HTML copy; the lower image masks dissolve before the canvas clips. The connecting foliage and route enter only the top 12px of the comparison cards.

## Complete production code

- [PricesHero.tsx](../../src/components/prices/PricesHero.tsx): the full header, original heading/subtitle and three existing anchors.
- [prices-landscape.module.css](../../src/components/prices/prices-landscape.module.css): protected typography and the shorter header-to-card gap.
- [BotanicalCanvas.tsx](../../src/components/marketing/BotanicalCanvas.tsx) and [canvas CSS](../../src/components/marketing/botanical-canvas.module.css): reusable decorative canvas with optional left/right artwork slots and `connectToCards`. Leave it off for headers without cards. Put real copy in a sibling positioned layer, following `PricesHero`; no controls belong inside the decorative canvas.
- [PricesLandscape.tsx](../../src/components/prices/PricesLandscape.tsx): original approved terrace, unchanged image bytes.
- [PricesExplorer.tsx](../../src/components/prices/PricesExplorer.tsx): existing cards, products, conditions and checkout. Only the header component, first section's top gap and launcher-yield marker change.
- [ChatLauncher.tsx](../../src/components/chat/ChatLauncher.tsx) and [placement CSS](../../src/components/chat/chat-placement.module.css): named “Спросить Веспи” capsule only on `/prices`. The fixed measuring anchor has the same width as the capsule, keeps the existing Netlify-badge inset and yields to actions. Other routes keep their existing launcher. Visible copy is included in the accessible name; chat requests still require user submission.
- [Two English generation prompts](PROMPTS-EN.md) and [asset integrity / dimensions](assets.json).

The two overlays were generated with built-in imagegen using the approved terrace and lemon artwork as references. They are not claimed as Higgsfield outputs. Local production files are `public/illustrations/editorial/botanical-canopy-640.webp`, `botanical-canopy-1280.webp`, and `pergola-wash-640.webp`. All three derivatives total 275,342 bytes; a phone uses 111,018 bytes for the two overlay images, including high-DPR devices (the mobile picture source is explicitly capped). The repeated connecting crops reuse the same requested images. The original source PNGs remain in the generation output; no image service or missing placeholder URL is used at runtime.

## Preserved contracts

The global CSS tokens, iItaly logo, fonts, pricing data, admission facts, auth, Stripe, map and MOD. 209 are unchanged. Every original pricing text node is compared against the exact pre-change export. The review compares heading typography/color and package-card styles at twelve widths. No new price, deadline, guarantee or backend capability is introduced.

A live check of the prior portal release exposed unconfigured guest stages marked “Пройдено · 0 из 0”. Plan now filters empty stages just as its navigator does; it does not interpret absent tasks as completed. The fresh-guest test covers this, and all existing completion rules remain unchanged.

## Verification

Production export, TypeScript and ESLint pass. The revised `design-prices-landscape-review.mjs` retains original art hashes, exact copy comparison, twelve responsive widths, checkout/Escape, print and forced-color checks. The requested layered scene intentionally replaces the old 0.66 bowl ratio, shared vertical center and strict illustration-gutter assertions. New checks cover real local layers, masks, the protected typography zone, unchanged type/cards, the reduced gap, exactly 12px of decorative overlap, 44px anchor targets, responsive file selection, accessibility, and a labelled chat opener with no automatic AI request. Full workspace and chat recovery reviews also pass.

No animations were added to the canvas. Reduced transparency strengthens the matte and reduces decoration; forced colors and print remove the decorative layers. All image dimensions are supplied to avoid layout shifts.

## Before / after

All captures use isolated browser profiles and the exact base export, without the user's uploaded browser screenshot.

| Viewport | Before | After |
|---|---|---|
| 1440 | [before](screenshots/before-1440.webp) | [after](screenshots/after-1440.webp) |
| 768 | [before](screenshots/before-768.webp) | [after](screenshots/after-768.webp) |
| 390 | [before](screenshots/before-390.webp) | [after](screenshots/after-390.webp) |
