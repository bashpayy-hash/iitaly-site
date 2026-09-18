# University visual consistency

## Scope and reference
The user explicitly requested replacement of the old Venice/coast images on
`/universities` with recently approved watercolor assets, consistent controls
around the map, and improved clarity inspired by the supplied **Visitors — Style
Reference** (`DESIGN (14).md`, `tokens (12).json`, `variables (12).css`, `theme (11).css`).

Borrowed: white/linen surfaces, 1px hairlines, compact readable data cards,
rounded controls and clear typographic hierarchy. Not copied: Visitors branding,
lavender action color, analytics content or its restriction on lifestyle imagery.
IITALY retains crimson, Inter Tight/system font stack and the approved watercolors.

## Changes
- The university page reuses the existing MarketingHeader (including mobile menu).
- The old Venice/coastal backdrop, registration mark and whole-page paper overlay
  are no longer mounted on the page. Text is not blurred or covered with noise.
- Lemon/postcard is a restrained hero cutout; paperwork/moka is in the empty city
  panel. Both are existing local 320/640 WebP variants. No new assets, paid
  generations or CDN requests; the rejected large/blank-center scenes stay excluded.
- Artwork has separate static pastel radial washes. Only these washes are blurred.
- Filters, city picker, university cards, details modal and comparison bar share
  light pill controls, 1px borders, 44px action targets and visible keyboard focus.
- City information is white/linen, cards use two columns on wide panels instead
  of three cramped columns. Narrow phones have one column.
- Existing comparison content/model is unchanged; only its surface CSS and modal
  wrapper are brought into the same visual language.

## Preserved
`ItalyMap.tsx`, `src/data/**`, `src/lib/**`, comparison-model.ts, ComparisonTable.tsx,
ComparisonSection.tsx, root layout/global styles, actual header/footer components,
backend, payments, quiz, package manifest/lockfile, Netlify config and all other
page content remain unchanged. Native scrolling and city-match state are retained.

## Verification
The old whole-map-section pixel assertion is no longer valid: the user explicitly
requested new controls and removal of the overlay. Its replacement compares the
SVG DOM and computed presentation exactly (not a pixel-equivalence claim) and
retains before/after screenshots. A separate suite compares all 30 city selections
and every filter combination against the previous build, checks new controls,
image locality, overflow and navigation at six widths. Existing quiz, checkout,
comparison-budget and marketing regression checks continue to run.
