# Italian artwork: an addition to the existing design

## Placement

The Apple-inspired typography, homepage hero, navigation, copy, section order and interaction logic are retained. The user explicitly approved integrating the latest paintings and merging the result.

- `/guides`: the approved coastal terrace replaces the Tuscany image in the existing right-hand hero slot. The left column and chapter navigation are unchanged.
- Home, arrival section: the approved green-shutter balcony replaces the old Rome image in the existing slot, feathered into white at the edge. The redundant tiny balcony decoration is removed.
- `/plan`: the approved stationery/espresso painting is an expendable right-edge background wash, with a 3px blur, low opacity and local paper grain. The form and text are never blurred. This layer is disabled below 1280px and with reduced transparency or increased contrast.
- `/prices`: the approved tomato illustration is a 128–160px accent in the spare right margin, visible only from 1280px.
- Home: retain the small Higgsfield moka under the how-it-works introduction and the lemon twig in the price section. Only the lemon remains on phones.

All decoration is non-interactive and hidden from assistive technology. Foreground illustrations have separate image slots; no painting covers controls. Print and forced-colour modes remove expendable illustrations.

## Provenance and local delivery

The original lemon, moka and small balcony were generated through Higgsfield (job IDs remain in `italian-accents.json`). The four newer paintings were generated in the conversation with image_gen, approved by the user, and transferred using Higgsfield; they are not described as Higgsfield generations. No reference artwork or generated website screenshot is used as a page background.

Every image is stored in `public/illustrations/editorial/` and shipped by Netlify with the static export. There are no runtime CDN dependencies, generation APIs, credentials or added packages. `docs/editorial-art-assets.json` records source and derivative SHA256 hashes, dimensions and byte sizes. Three scenes have smaller 480px versions for responsive delivery; all outputs are WebP. Only the guides hero is eager/high priority. Other illustrations load lazily. The temporary import workflow is removed before merge.

## Guardrails and validation

`/universities`, sketchbook, all `src/data`, shared Header/Footer, root layout, globals.css, backend contracts, portal, dependency lockfile and Netlify configuration remain untouched. Product claims and original refund terms are unchanged.

The existing CI checks TypeScript, lint and static build. The existing design review compares the map to the exact base and exercises quiz, checkout and native scrolling. The illustration review checks local asset hashes and budgets, actual image decoding, transparent alpha of the original accents, homepage-hero pixel equality, original copy on all four marketing routes, non-overlap and horizontal overflow at six widths, mobile image selection, guides navigation, background-only blur, forced colours and print. Screenshots are exported for visual inspection. Real payments and contact submissions are not performed.
