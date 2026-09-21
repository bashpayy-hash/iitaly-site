# IITALY UX polish · September 2026

Base: `0391265b09c73a575ddf87c367139a1f0350b8e4` (main after Stripe PR #40).

The free-plan action previously opened a page dominated by document upload,
with the six-question plan further down. This pass makes the quiz the first
tool, keeps document checking independently accessible, and connects the
homepage journey to the actual tools and guide chapters.

## Presentation

- Keep the deployed crimson actions, existing wordmarks, Onest/Inter Tight
  typography and watercolor illustrations. The older blue/centered direction
  in DESIGN.md predates the scoped marketing implementation.
- Use a two-column desktop hero and a compact mobile stack. Put the primary
  action before the new campus artwork in both reading and keyboard order.
- Increase small-copy legibility and touch targets. Clarify the pricing offer,
  surface the refund disclosure by default, and provide section shortcuts.
- Keep mobile navigation dismissible by Escape, link activation and outside
  taps. Open guide deep links on both desktop and mobile.
- Make checkout labels persistent, errors associated with their fields, and
  the close button visible. Keep typing focus stable; restore focus to the
  purchase action when the dialog closes.

## Artwork

Higgsfield generated one imagined campus scene, styled after the site's study
desk watercolor. It does not represent a named institution or a real applicant.
See `campus-arrival-assets.json` for provenance, dimensions, byte budgets and
hashes. The application serves responsive WebP files from its own static build.
No new runtime dependency or remote image request is required.

## Preservation and validation

No change to backend/API/payment contracts, source university data, map SVG,
comparison model, pricing constants, legal text or the six quiz questions.
Existing important marketing and guide text is retained.

The existing GitHub design workflow covers 320–1920px layouts, map parity,
comparisons, reminders and illustration clearance. Its old pixel-lock checks
for the hero and pricing header now retain screenshots/geometry evidence and
verify every original text node despite reordered tools and added navigation.
New checks exercise checkout typing focus, local invalid-form validation,
focus restoration, document-picker keyboard access, quiz order, outside menu
dismissal and guide deep links. Browser fixtures block external traffic and
never submit a real order or lead.
