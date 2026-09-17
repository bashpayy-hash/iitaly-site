# Selected accents and a useful university comparison

## Approved scope

The user explicitly authorized removing the **entire City Sketchbook section** from `/universities` and making comparisons more detailed. This supersedes the earlier pixel-identical constraint only for that section and the comparison UI. The actual map, filters, city cards, city matching, data files and shared chrome stay unchanged. The sketchbook implementation and its artwork are retained in the repository but no longer mounted on this route.

## The three selected images

- Lemon branch with postcard: a 156px accent in the new comparison introduction, on a soft local wash, hidden below 768px.
- Traveler paperwork: replaces the existing peripheral, blurred `/plan` wash; the foreground heading/forms are not filtered. Still hidden below 1280px and in high-contrast/reduced-transparency modes.
- Tomato bowl: replaces the prior tomato sprig in the existing `/prices` margin. Still hidden below 1280px and in print/forced colors.

Neither of the full scenic candidates is added. These are the already-approved conversation images, not newly generated replacements. The source PNG checksums and two local WebP derivatives per image are recorded in `selected-accents-assets.json`. No remote image dependencies, API keys, new npm dependencies, or backend changes.

## Comparison

The page now has three selectors sharing the existing map selection state, plus the existing comparison modal. Both use `ComparisonTable`: 12 parameters grouped into location/study, admissions, budget/support; a differences-only mode; and a 10/12-month living-cost estimate.

All university facts are read from the existing `src/data/italy.ts`, which is unchanged. Missing English/medicine flags are explicitly marked unrecorded, not converted into negative claims. Estimates only multiply explicitly formatted monthly living costs; `от` remains a lower bound. Tuition is not guessed from `tuN`, scholarships are not subtracted, and no new requirements or precise dates are invented. The UI notes that existing catalog content is not verification of the current admissions call.

## Validation design

The source guard allows only the two existing university files intentionally edited and four new comparison files. Other protected paths remain forbidden. Visual regression still compares the exact map/filter/city region at desktop/mobile on direct load and client navigation; it no longer compares full page height because removing the sketchbook intentionally changes that height. The map source and markup are unchanged, no screenshot masks are used. Existing hero, typography, quiz, checkout and illustration tests remain.

`design-comparison-review.mjs` additionally checks six widths, actual local image alpha/hashes, selection/reset/duplicate prevention, all 12 rows, differences, the lower-bound monthly calculation, modal Escape, keyboard table scrolling on narrow screens, and map/filter operation. External backend traffic is blocked; tests make no payments or contact submissions.
