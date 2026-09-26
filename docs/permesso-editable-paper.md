# Modulo 1: original and editable paper

## Requested change

Keep the existing original PDF viewer. Add a separate, editable electronic version whose printed geometry is identical to the original, with in-place entry, field instructions and next-step annotations. No generated replacement document.

## Visual source

- Source: https://www.portaleimmigrazione.it/media/documentazione/Modulo_1.pdf
- Downloaded source SHA-256: `adb5ac7d05f49513856214e1c3d7ee904c1a65bf69643eb0ffd3cd5a3a511f7e`
- Original page dimensions: 595 x 842 PDF points.
- Pages 1–3 rendered directly using PyMuPDF at 3x, 1785 x 2526 pixels, lossless WebP via Pillow. No crop, recoloring, illustration generation, OCR or reconstruction.
- Coordinates measured from the source vector drawing bounds, with duplicate paths deduplicated. Standard character cells are approximately 13.174 x 18.844 points on a 17.004-point pitch. Header province cells differ.
- Lossless backgrounds and verified hashes are listed in `permessoOriginalGeometry.ts`. They are hosted through the user's Higgsfield media storage. This is media processing, not AI generation.

## Architecture

`PermessoModes` preserves the existing `PermessoTrainer` as the Original mode. It lazy-mounts `EditablePermesso` on first selection and retains its in-memory draft while the user switches back to the original.

The editable page is one proportional image plus native HTML inputs registered in PDF coordinates, not a responsive grid that reflows the printed form. Typed glyphs are centered in the actual printed cells. Labels, help, document controls, zoom and review are outside the original print layer. Placeholders are removable screen annotations.

The field model separately represents the source's unequal rows, date groups, house-number/letter groups, phone prefix/number groups and SI/NO options. It does not rely on the older trainer's illustrative cell counts. An input cannot be shown without its successfully loaded page background.

## Scope and boundaries

- Editable scope: first three pages of the existing first/renewal student scenario. The original full eight-page PDF remains available.
- Signature area is an annotation, not a fake e-signature or typed-name substitute.
- No automatic permit-code selection, refugee status or legal eligibility assessment.
- Existing field instructions are reused, with printed OVE IN POSSESSO / FACOLTATIVO qualifiers respected. Uncertain rules remain flagged. Input-format validation is not verification of the underlying documents.
- Draft values never enter URL parameters, analytics payloads, backend requests or image URLs.
- No automatic persistent saving or automatic restoration of personal data. Save/Restore are explicit actions and describe their device-local scope. Clear removes only this feature's draft key.
- Existing authenticated portal, login artwork, Stripe, 667 KZT price, backend/API contracts and global styles are unchanged.

## Review

`scripts/design-permesso-editor-review.mjs` checks the exact source-image hashes, image-loading failure behavior, overlay registration, aspect ratio, input and multiword spacing, asymmetric multi-row lengths, dates, exclusive selections, cross-mode draft retention, local Save/Restore, zoom/overflow, runtime errors, and absence of external write requests. It runs at 1440, 1024, 768, 390 and 360 pixels and exports screenshots. No production auth or payment requests are made.
