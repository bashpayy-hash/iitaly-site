# Small Italian accents, not another redesign

The existing Apple-inspired IITALY page stays in place. This change adds three small decorative images generated through the Higgsfield plugin, using the user's supplied painted moka reference for material and brushwork. No generated website mockup is used.

## Placement

- Moka and espresso: below the existing how-it-works introduction, in the unused column space. 224px image box, with substantial transparent breathing room; a soft local blue/peach gradient only under the image.
- Balcony: a 112px detail in the arrival section's outer margin, with a local sage/ivory gradient. Shown only at 1280px and above where it cannot touch the copy.
- Lemon twig: 160px in the pricing section's existing upper padding, 104px on mobile. No background wash here.

No new headings, claims, buttons, typefaces, full-width illustrations, section backgrounds, motion or persistent animation. The hero, original illustrations, shared marketing stylesheet, navigation and layout are retained. Artwork uses empty alt text, aria-hidden and pointer-events:none. On small screens only the lemon remains; all decorative art is removed in forced colours and print.

## Sources and delivery

`src/components/marketing/italian-accents.json` records the three exact Higgsfield generation job IDs and WebP delivery URLs. All three were generated with transparent background enabled. The supplied reference is not copied onto the site. Model: GPT Image 2.5, invoked through Higgsfield, high quality, 1k.

The provider's WebP derivatives retain alpha. Current file sizes are 62,352, 43,050 and 66,726 bytes (172,128 total). Images are lazily loaded, unoptimized for static export, and send no referrer. They currently load from Higgsfield's CDN, not the Netlify repository; the images therefore depend on that CDN remaining available. There are no Higgsfield credentials or API calls in the site, and no third-party generation SDK is installed. A CDN failure affects decoration only, not page content or controls.

## Isolation and verification

Only three home components receive decorative additions. `/universities`, sketchbook, all `src/data`, backend contracts, root layout, global CSS, existing marketing CSS, pricing/refund terms, portal, package dependencies and Netlify configuration are untouched.

The existing design-review suite still compares the protected map to the exact base and checks the quiz, checkout, responsive layout and native scrolling. An additional read-only browser test downloads only the three approved image URLs, verifies transparent alpha, checks real image loading and absence of text/control overlap at 320, 390, 768, 1024, 1280 and 1440px, and compares the hero pixels and homepage text with the base. It exports actual browser screenshots and source WebPs as review artifacts. External backend requests remain blocked during these tests.
