# Portal login: approved study-window artwork

Scope: the signed-out `/portal` screen only. The user explicitly requested implementing the selected illustration in the actual site code using their attached Claude style reference, not another mockup. The authenticated dashboard, prices, payments, and backend/authentication contracts are unchanged.

## Source

- User-selected existing image: `тосканское_утро_у_окна.png` (desk, notebook and university outside a window; no UI icons).
- Source image was generated earlier in the conversation by the built-in image generator. This implementation does NOT claim Higgsfield generated it.
- Higgsfield is used here to import, resize, encode, confirm and host the exact selected artwork. No new generation was requested or billed by this implementation.
- Confirmed source import: `374a56ef-2852-402b-a1ac-2ff858d499f0`.
- Desktop WebP: 1280 × 960, 118458 bytes, SHA-256 `a5128666c6136fc4dbdae8212992fc205edf52184634ae218cf1980144f5a4f6`.
- Small WebP: 640 × 480, 38818 bytes, SHA-256 `df968d42507c936fcc2a73125acdd00f94dff01cdee8bddaaacb1b6048c1fb92`.
- Component contains permanent confirmed CDN URLs, never presigned PUT URLs. The artwork sends no referrer. Tests verify both files against these hashes before rendering them.

## Applied reference

The attached `DESIGN (33).md`, `tokens (31).json`, `variables (31).css` and `theme (30).css` define bone parchment `#f8f8f6`, carbon `#121212`, graphite `#373734`, thin warm borders, 24px cards and 8px controls. Those values are scoped in `portal-login.module.css`; no global token or other page changes.

The reference specifies an editorial serif at weight 400, sizes 24/30px and permits Charter/Georgia substitutes. The login uses that fallback rather than claiming to bundle proprietary Anthropic fonts. Existing Onest remains the interface font for Cyrillic consistency. The main button follows the reference's dark ink fill, not the red fill in the generated screen mockup. The warm color belongs to the chosen artwork.

An alpha mask softens the image edge behind text for readability; there are no decorative background gradients, icon paths, blurry wallpaper, or extra generated elements. The form remains separate and fully usable if the illustration fails to load.

## Verification

`scripts/design-portal-login-review.mjs` covers 1440, 1024, 768, 390 and 360px viewports with decoded, hash-verified artwork. It checks overflow, input validation, focus, Enter submission, one in-flight login request, error retention, and a successful login using a synthetic API fixture. All external API requests are blocked; no real customer account or Stripe session is touched.
