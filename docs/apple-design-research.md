# Apple-level polish: research notes

Research pass for the "Apple HIG-inspired, not an Apple clone" redesign of the
homepage. Stack is Next.js 16 (App Router, static export), React 19,
Tailwind v4 (`@theme` tokens, no config file), `gsap` and `motion` already
installed but unused on the homepage.

**Environment constraint:** this session's network egress is allow-listed.
`developer.apple.com` responds but is a client-rendered SPA shell (WebFetch
gets only the `<title>`, no body content) and most third-party blogs/GitHub
mirrors are outright blocked at the proxy (403). Actual research here was
done via web search (which returns synthesized snippets + source links, not
blocked) rather than full-page fetches. Every claim below is sourced; nothing
is asserted from memory alone without a citation next to it.

## Primary sources checked

| Source | What it's for | Freshness | Verdict |
|---|---|---|---|
| [HIG — Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | type hierarchy | current (Apple's live doc) | Confirmed via search: text styles combine weight/size/leading into named roles (body, headline, etc.); 17pt is the body-text legibility floor; Dynamic Type scales everything proportionally. [Source](https://developers.apple.com/design/human-interface-guidelines/foundations/typography/) |
| HIG — Buttons / touch targets | button sizing | current | 44×44pt minimum hit target is the hard floor (not an ideal — the *visible* button can be smaller than the tappable area); capsule is the standard shape for primary actions. [Source](https://thisisglance.com/learning-centre/how-do-i-design-buttons-that-everyone-can-actually-press) |
| HIG — Motion | animation timing | current | Apple's own guidance is qualitative ("prefer quick, precise animation," avoid decorative motion that doesn't map to something physical); industry consensus converging on Apple's practice puts most UI transitions at 200–400ms, nothing past ~500ms. [Source](https://developers.apple.com/design/human-interface-guidelines/foundations/motion) |
| HIG — Materials (Liquid Glass) | when to use translucency | **new in 2025**, WWDC25 | Liquid Glass is explicitly scoped to the *navigation/control layer floating above content* — never applied to content itself (lists, cards, media), and never stacked glass-on-glass. [Source](https://developer.apple.com/videos/play/wwdc2025/219/) |
| WWDC25 "Get to know the new design system" (session 356) | concentric geometry | 2025 | Introduces **corner concentricity**: a nested control's radius should share the same corner *center* as its container, computed as `containerRadius - padding`, not an arbitrary fixed value. Three shape kinds: fixed, capsule (`height/2`), concentric (radius = parent radius − padding). [Source](https://developer.apple.com/videos/play/wwdc2025/356/) — video itself not fetchable in this session; corroborated via search snippets citing the session. |
| Accessibility / `prefers-reduced-motion` | motion opt-out | current, WCAG 2.2 | `prefers-reduced-motion` should *reduce*, not necessarily eliminate, motion — swap sweeps/parallax for fades or instant states; it satisfies WCAG 2.3.3 but not 2.2.2 (auto-playing/looping motion still needs a pause control, which doesn't apply here since our motion is scroll-triggered and one-shot). [Source](https://blog.openreplay.com/prefers-reduced-motion-accessible-animation/) |

## GitHub references

| Repo | Stack | License | What's actually useful | Adopted? |
|---|---|---|---|---|
| [adrianhajdin/iphone](https://github.com/adrianhajdin/iphone) | React + GSAP `ScrollTrigger` + Three.js | Not installing it — it's a full Apple marketing-site *clone* (literal iPhone 15 Pro product page), which is exactly what the brief says not to build. **Idea taken, not code**: GSAP `ScrollTrigger`-driven, scroll-position-linked reveals instead of plain `IntersectionObserver` fade-ins — not used here since our reveal is a one-shot canvas animation, not a scroll-scrubbed one. | Referenced, not cloned |
| [crenspire/glass-ui](https://github.com/crenspire/glass-ui) | Next.js 16 + React 19 + shadcn registry | **MIT** | Structural idea only: a `Glass` variant is a distinct component variant, not a global surface treatment — glass/blur is opt-in per-control, applied only where it sits over photographic content. Did **not** install the package (it's a shadcn *registry*, i.e. a source generator, not a runtime dependency — pulling it in would mean adopting its whole component structure for one variant we can hand-write in ~15 lines of Tailwind). | Idea only, no install |
| `github.com/topics/apple-design` (TS/JS) | — | — | Skimmed for convergent patterns (capsule primary CTAs, hairline dividers instead of heavy borders, generous section padding). Nothing specific enough to cite past what's already folded into the token decisions below. | Pattern-level only |

## Commercial sites with similar typographic discipline

- **Linear** — single type family used systemically (no display/decorative font mixing), restrained neutral palette plus one brand color, keyboard-first interaction polish. [Source](https://blog.logrocket.com/ux-design/linear-design/)
- **Stripe** — one typeface (Söhne) across marketing site, dashboard and docs; "restraint rules most design systems skip." [Source](https://www.designsystems.one/design-systems/stripe-design)

Both reinforce the same lesson used below: hierarchy comes from *scale, weight
and spacing discipline within a small type system*, not from adding more
typefaces or more effects.

## Reveal / scroll animation & accessibility

- Scroll-triggered, one-shot reveals (GSAP `ScrollTrigger`, or a plain
  `IntersectionObserver`) are the standard pattern for "appears once, doesn't
  replay" — matches what's already built for the Positano illustration.
- `prefers-reduced-motion` handling: show the end state immediately, no
  sweep — already implemented in `PositanoReveal.tsx` and in the global
  `globals.css` reduced-motion block.

## Decisions: adopted vs. rejected

**Adopted**
- Named type-role system (display/title/heading/body-large/body/caption/button-label) sized with `clamp()`, not fixed breakpoint jumps — HIG's Dynamic-Type spirit translated to fluid CSS.
- 44px+ tappable button height, capsule primary CTA, generous horizontal padding.
- Corner concentricity as a *rule* applied by hand (inner radius = outer radius − padding) wherever a control sits inside a card, rather than picking radii ad hoc.
- Materials/glass restricted to exactly one place: floating elements over photographic/illustrated content (sticky header over content, `Glass` button variant) — never as a page-wide surface treatment.
- Soft, blurred elevation (`shadow-soft-*`) as the *default* card/nav shadow, replacing the hard offset "sticker" shadow as the everywhere-default.

**Rejected**
- SF Pro as a webfont — unclear redistribution terms for non-Apple-platform delivery; kept the project's existing licensed webfonts (Unbounded/Golos/Instrument Serif, already loaded via `next/font`, already Cyrillic-complete) instead of Apple's `-apple-system` stack literally replacing them. The system-font fallback stack is used only as the *fallback chain*, not the primary face — this is an explicit brand-preservation deviation from the brief's literal font-stack suggestion, made because the brief itself says to keep brand identity, and the brand's typefaces are that identity.
- Glassmorphism as a global surface style — rejected per the brief and per Apple's own current guidance (Liquid Glass is explicitly *not* for content surfaces).
- Installing `glass-ui` or any new npm dependency for this pass — the two motion libraries already in `package.json` (`gsap`, `motion`) are unused on the homepage and are sufficient; a hand-written Tailwind variant does the one glass surface needed.
- Recoloring the accent to Apple's blue — the brief and the brand both keep orange (`--color-warn`) as the single expressive accent.
- Hard "sticker" offset shadows removed everywhere — kept as one deliberate signature accent (price panel / primary hero card) rather than the default for every bordered box, per "one expressive accent instead of many effects."
