# Apple-inspired editorial refinement

## Direction
The supplied Apple reference provides the light canvas, generous spacing, sentence-case typography, pill actions and thin separators. IITALY remains itself through the `#fc1c46` signal, the existing night-cloud photograph, the Kazakhstan–Italy journey and the two existing editorial illustrations. Buttons use a deeper crimson (`#d7133f`) and links `#b91134` for readable contrast on white. The homepage diagram is explicitly labelled as an example, not a real applicant result or a screenshot of the portal.

## Isolation
`MarketingLayout` is opt-in on `/`, `/plan`, `/prices`, `/guides`. Its CSS Module scopes all semantic color overrides. The original shared Header, Footer, root layout, globals.css, `/universities`, sketchbook, all product data, the legacy portal/chat and backend contracts are unchanged. The sky gate still returns null on the protected route. The application and lockfile already contain GSAP and Lenis; no dependency update is needed.

## Motion
The homepage uses a small product-stage reveal, a clip reveal on the existing Rome artwork and a native sticky section title. No form heading is pinned. GSAP matchMedia owns and cleans up the homepage animations at the mobile breakpoint and on reduced-motion changes; it never kills other components' triggers. Existing Lenis route exclusion remains unchanged. Without JavaScript or with reduced motion, the content stays readable.

## Verification
Existing CI runs `npm ci`, type generation, TypeScript, `npm run lint`, and `npm run build`. Design review additionally guards protected paths; builds the exact PR base; compares full-page `/universities` screenshots at 1440px and 390px, both direct and after client navigation; tests the six-question quiz without submitting contact information; opens and closes checkout without submitting an order; checks FAQ, mobile menu, horizontal overflow and runtime errors. Browser screenshots and a machine-readable results file are attached to the workflow run. These smoke tests do not verify real backend payments, lead delivery or authenticated portal operations.

No upload included a ready-to-apply ZIP or a seven-file deletion manifest. This is a reviewed refinement of the actual GitHub main, not a claim to have applied that unavailable bundle. Existing unused files are not arbitrarily deleted.
