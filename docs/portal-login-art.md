# Portal login: site style and shared watercolor

Scope: the signed-out `/portal` screen only. The authenticated dashboard, prices, payments, and backend/authentication contracts are unchanged.

## Why it changed

The login screen used a separate "Claude-style" reference: parchment background, serif headings, a black button, a photorealistic study-window picture served from a third-party CDN, and no site header. Visitors who clicked «Личный кабинет» landed on what looked like another site with no navigation back. The user asked why the portal is not in the common site style.

## Now

- The shared site header (`MarketingHeader`) sits above the login; `<main>` is rendered by `PortalExplorer` per state so the header stays outside it.
- Typography and colors follow `marketing.module.css` and `/universities`: display grotesque headings, white cards with a grey border and 24px radius, inputs like the comparison selects, a crimson pill button.
- The artwork is the project's own watercolor `campus-arrival` (see `docs/campus-arrival-assets.json`) — the same one the homepage and the signed-in portal sidebar use. Phones get the 480px file, larger screens 960/1168px.
- An alpha mask softens the image edge behind text for readability; the form remains separate and fully usable if the illustration fails to load.

## Verification

`scripts/design-portal-login-review.mjs` covers 1440, 1024, 768, 390 and 360px. It verifies the local artwork against the manifest hashes, the shared header, one `<main>`, overflow, input validation, focus, Enter submission, one in-flight login request, error retention, and a successful login using a synthetic API fixture. All external API requests are blocked; no real customer account or Stripe session is touched.
