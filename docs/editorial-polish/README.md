# IITALY: shared editorial materials and Vespi composition

The guide illustration is 27.1% larger at 1440px and 35% larger at 390px. The public header and both portal shells share a warm translucent material; the persistent road retains its compact layout and existing completion behavior. A wide home scene uses a responsive close crop of the approved Vespi identity. The approved terrace and balcony illustrations remain in place.

`src/app/globals.css` is byte-for-byte identical to the reviewed base `aa9520a`: no palette or font token changed. New material rules add depth, static paper grain at 0.035 opacity and a one-pixel transparent edge using existing colors. The grain is a 304-byte cached SVG; there is no canvas or animated filter. Reduced transparency and forced colors remove the decorative overlays.

## Complete implementation

- [Shared depth and chrome](../../src/components/marketing/surface-depth.module.css), [paper grain](../../public/textures/paper-grain.svg).
- [Guide composition](../../src/app/guides/guides.module.css).
- [Large Vespi scene](../../src/components/mascot/VespiIntroSection.tsx), [scene CSS](../../src/components/mascot/vespi-intro.module.css).
- [Cloud portal shell](../../src/components/portal/portal-navigation.module.css), [local portal shell](../../src/components/portal/workspace.module.css).
- [Contextual stage portrait](../../src/components/portal/PlanSection.tsx), [portal task](../../src/components/portal/PortalTaskDetail.tsx), [saved report](../../src/components/portal/PortalDocumentReport.tsx).
- [One accessible upload/drop action](../../src/components/portal/PortalUploadZone.tsx), [upload CSS](../../src/components/portal/portal-upload.module.css), [existing pipeline integration](../../src/components/portal/PortalExplorer.tsx).
- [Local document inspector](../../src/components/plan/DocCheck.tsx), [local portrait ownership](../../src/components/portal/LocalWorkspace.tsx).
- [Higgsfield prompts: two stills and three UI loops](HIGGSFIELD-VESPI-PROMPTS.md). New poses and videos are prompt deliverables, not generated or deployed clips. [Shipped crop provenance](asset-provenance.json).

The current stage owns the copilot in the plan; the open document owns the inspector in its report/upload surface. The pinned road yields its portrait to a quiet location point in those views. That point switches geometry immediately, avoiding interpolation from the previous portrait box. No extra action, status, API field, route, authentication or payment behavior is introduced.

## Verification

Production static export and ESLint pass. Local fixtures cover 1440px and 390px before/after captures, real illustration-area measurement, token identity, one visible content character, a single file action, drag/drop → check once → save once → return to overview, and a blocked parent file with no uploader. Fixture traffic never reaches a live account or external API.

Existing reviews passed: portal progress (including 320px, iPad, reduced motion and late-current), full saved reports, login, Telegram, local workspace, guide interactions, shared Vespi roles, public design, university comparison, warm palette and UX/axe. The warm source scan includes newly added files and returns zero cold color literals/classes. Map geometry, the document-status interpreter, admission data, global palette, API and payment source files are unchanged.

Two existing assertions now inspect the intended semantic target: the report action's accessible name instead of its full decorative contents, and the disclosure's direct chevron instead of its newly nested decorative portrait. Their one-action and forced-colors requirements remain intact.

Run the targeted capture and integration review with:

```bash
REVIEW_TOOLS=/path/to/browser-tools/node_modules \
PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers \
TACTILE_BASELINE_OUT=/path/to/reviewed/static-export \
node scripts/design-tactile-review.mjs
```

## Fixture screenshots

| Screen | Before · desktop | After · desktop | Before · mobile | After · mobile |
|---|---|---|---|---|
| Guides | [1440](screenshots/before-guides-1440.webp) | [1440](screenshots/after-guides-1440.webp) | [390](screenshots/before-guides-390.webp) | [390](screenshots/after-guides-390.webp) |
| Portal | [1440](screenshots/before-portal-overview-1440.webp) | [1440](screenshots/after-portal-overview-1440.webp) | [390](screenshots/before-portal-overview-390.webp) | [390](screenshots/after-portal-overview-390.webp) |

New scene: [desktop](screenshots/after-vespi-scene-1440.webp) · [mobile](screenshots/after-vespi-scene-390.webp).
Current stage: [desktop](screenshots/after-portal-plan-1440.webp) · [mobile](screenshots/after-portal-plan-390.webp).
Upload: [desktop](screenshots/after-portal-upload-1440.webp) · [mobile](screenshots/after-portal-upload-390.webp).
