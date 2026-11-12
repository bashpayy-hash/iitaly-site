import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';

const base = process.argv[2];
assert(base, 'Pass the reviewed base commit SHA.');
const changed = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], { encoding: 'utf8' }).trim().split('\n');
// The user authorized a visual refresh of this page, not a change to its map/data.
const approvedPresentationPaths = new Set([
  // 2026-11-04: owner asked for one object style everywhere (realistic with
  // illustrated touches), Vespi scenes on the stage board and settings, a
  // peeking Vespi beside a larger map, and Apple-like information blocks.
  // Presentation only: roadmap, profile, reminder and map data stay as they are.
  // Same day: the second typeface goes away («убери вот этот второй шрифт»:
  // the mono token in globals.css points at Onest and layout.tsx loads no
  // monospace face), and the cabinet board stacks without duplicated
  // counters on narrow screens.
  'src/components/portal/PortalArtwork.tsx', 'src/components/portal/RisoArtImage.tsx',
  'src/components/portal/portalStageArt.ts', 'src/components/portal/PortalRoad.tsx',
  'src/components/portal/ProfileSection.tsx', 'src/components/portal/HelpSection.tsx',
  'src/components/portal/portal-settings.module.css', 'src/components/portal/portal-journey.module.css',
  'src/components/portal/PortalFocus.tsx', 'src/components/portal/portal-focus.module.css',
  'src/components/portal/PortalStageLineup.tsx', 'src/components/portal/portal-lineup.module.css',
  'src/components/portal/PortalExplorer.tsx', 'src/components/portal/portal.module.css',
  'src/components/universities/UniversitiesExplorer.tsx', 'src/components/universities/university-ui.module.css',
  // 2026-11-03: owner asked for Apple-like evenness (one 1216px column on the
  // home page); the Vespi introduction only takes the shared column width.
  'src/components/mascot/vespi-intro.module.css',
  // 2026-10-27: user-requested side-by-side deck; factual comparison model stays fixed.
  'src/components/universities/ComparisonDeck.tsx', 'src/components/universities/comparison-deck.module.css',
  // 2026-10-26: continuous root paper and persisted public comparison winner.
  'src/app/layout.tsx', 'src/lib/useUniversityChoice.ts',
  'src/components/universities/UniversityDecision.tsx',
'src/app/universities/page.tsx',
  // 2026-10-26: paginate existing guidance, without changing task or review data.
  'src/components/portal/portalInstructionPages.ts',
  // User request 2026-10-18: one watercolor pricing scene and a labelled
  // Vespi launcher on /prices. Existing tokens, logo, type and cards stay fixed.
  'src/components/marketing/BotanicalCanvas.tsx',
  'src/components/marketing/botanical-canvas.module.css',
  'src/components/prices/PricesHero.tsx',
  // User request 2026-10-18: replace cold UI colors across all routes.
  // This permits presentation tokens only; map geometry and API stay protected.
  'src/app/globals.css', 'src/data/illustrations.ts',
  // User correction 2026-10-17: make Vespi visible in the existing home entry,
  // actual catalogue filters and persistent portal priority, without new tokens.
  'src/components/home/home-assistant.module.css',
  // User follow-up 2026-10-17: shared iItaly wordmark and matching app icons.
  // Existing palette/fonts stay unchanged outside the logo's requested weight.
  'src/components/brand/BrandLogo.tsx',
  'src/components/brand/brand-logo.module.css',
  // 2026-10-24: user-supplied Low Arc identity; UI tokens and product logic stay fixed.
  'src/components/brand/BrandMark.tsx', 'src/components/brand/mark.json',
  'src/app/icon.svg', 'src/app/apple-icon.png',
  // User request 2026-10-17: Lucide icons for the Meta-inspired /guides redesign.
  // Only the lucide-react dependency is added; existing runtime versions stay fixed.
  'package.json', 'package-lock.json',
  // User request 2026-10-15: embed the existing map/comparison in the portal.
  'src/components/universities/ComparisonSection.tsx',
  'src/components/universities/ItalyMap.tsx',
  'src/components/PaperOverlayGate.tsx',
  'src/components/universities/UniversitiesExplorer.tsx',
  'src/components/universities/UniversityArtwork.tsx',
  'src/components/universities/Filters.tsx',
  'src/components/universities/ResultSummary.tsx',
  'src/components/universities/CityPanel.tsx',
  'src/components/universities/UniCard.tsx',
  'src/components/universities/CompareBar.tsx',
  'src/components/universities/UniModal.tsx',
  'src/components/universities/CompareModal.tsx',
  'src/components/universities/CityMatch.tsx',
  'src/components/universities/comparison.module.css',
  // Explicit user request: small city icons in the comparison table and bar.
  // Presentation only — comparison-model.ts and the data stay protected.
  'src/components/universities/ComparisonTable.tsx',
  'src/components/universities/CityGlyph.tsx',
  'src/components/universities/university-ui.module.css']);
// Telegram reminder UI is explicitly allowed; API/data contracts remain protected.
const approvedReminderUiPaths = new Set([
  // 2026-10-26: user-requested progressive portal pages and URL navigation.
  'src/components/portal/PortalPageNavigation.tsx', 'src/components/portal/PortalTaskPages.tsx',
  'src/components/portal/portal-pages.module.css',
  // 2026-10-25: shared type, editorial task layout and optional Higgsfield media.
  'src/data/higgsfieldVisuals.ts',
  'src/components/portal/HiggsfieldVisual.tsx', 'src/components/portal/higgsfield-visual.module.css',
  'src/components/portal/PortalMicroSteps.tsx', 'src/components/portal/portal-micro-steps.module.css',
  'src/components/portal/PortalTaskIntro.tsx',
  // 2026-10-24: single chat mascot and saved-only microfeedback.
  'src/components/mascot/VespiVideoAvatar.tsx', 'src/components/mascot/vespi-video-avatar.module.css',
  // 2026-10-24: stage-only portal canvas and feedback after confirmed completion.
  'src/components/portal/PortalFocus.tsx', 'src/components/portal/PortalCompletion.tsx',
  'src/components/portal/usePortalFeedback.ts', 'src/components/portal/portal-focus.module.css',
  'src/components/mascot/VespiOutline.tsx',
  // 2026-10-24: explicit file selection, review operation feedback and saved-report hierarchy.
  'src/components/portal/PortalDocumentUpload.tsx',
  // User request 2026-10-23: honest progress, step explanations, profile
  // persistence and contextual assistant. Existing unrelated contracts stay fixed.
  'src/lib/portalProgress.ts', 'src/lib/portalStepCopy.ts', 'src/data/portal-step-copy.json',
  'src/components/portal/PortalUniversitySummary.tsx', 'src/components/portal/SavedProfileAnswers.tsx',
  'src/components/portal/PortalStepInstructions.tsx',
  'src/lib/useDraggableHeader.ts',
  // User request 2026-10-20: a personal greeting before the existing route.
  // This is presentation only; profile and task data contracts stay protected.
  'src/components/portal/PortalWelcome.tsx',
  'src/components/portal/portal-welcome.module.css',
  // User refinement: one contextual document illustration beside the real upload.
  'src/components/portal/PortalDocumentCoach.tsx',
  'src/components/portal/portal-document-coach.module.css',
  // User request 2026-10-18: one actual-stage navigator, face-free section icons,
  // shared introduction and a helmet detail; palette, data and API stay frozen.
  "src/components/portal/PortalStageIcon.tsx",
  "src/components/portal/portal-journey.module.css",
  "src/components/mascot/VespiIntroSection.tsx",
  "src/components/mascot/vespi-intro.module.css",
  "src/components/mascot/VespiMark.tsx",
  // User request 2026-10-18: tactile shared chrome and one accessible upload/drop
  // action using the existing review pipeline; no API, status or palette changes.
  "src/components/portal/PortalUploadZone.tsx",
  "src/components/portal/portal-upload.module.css",
  // User request 2026-10-18: shared local profile, honest guest workspace,
  // five display phases and completion ring; no authentication/API changes.
  "src/lib/localWorkspace.ts",
  "src/components/portal/LocalWorkspace.tsx",
  "src/components/portal/WorkspaceCoach.tsx",
  "src/components/portal/workspace.module.css",
  // User request 2026-10-18: ship reference-based Higgsfield role artwork in
  // existing assistant placements. The portal road retains route + figure.
  // User request 2026-10-17: shared contextual Vespi across public pages and
  // portal, preserving each surface's existing palette and product contracts.
  'src/components/mascot/Vespi.tsx',
  // User request 2026-10-24: handmade spatial scenes and decorative idle pose.
  // These two presentation files cannot change route, document or API contracts.
  'src/components/mascot/VespiScene.tsx',
  'src/components/mascot/vespi-scene.module.css',
  'src/components/mascot/VespiAssistant.tsx',
  'src/components/mascot/vespi-assistant.module.css',
  'src/components/mascot/useVespiPresence.ts',
  // User request 2026-10-17: replace the scooter with Веспи Баурысаков.
  // Existing helper/onboarding/progress presentation only; no API/data change.
  // User request 2026-10-16: keep assessment, rules and the unchanged trainer
  // inside the personal cabinet, with existing data and completion endpoints.
  'src/components/portal/PortalAssessment.tsx',
  'src/components/portal/portal-assessment.module.css',
  'src/components/portal/PortalRules.tsx',
  'src/components/portal/portal-rules.module.css',
  'src/components/portal/PortalPermessoStep.tsx',
  'src/components/portal/portal-permesso.module.css',
  // User request 2026-10-15: choose universities inside the portal, keep the API.
  'src/components/portal/PortalUniversityStep.tsx',
  'src/components/portal/portal-universities.module.css',
  'src/lib/portalShortlist.ts',
  'src/components/portal/PortalExplorer.tsx',
  'src/components/portal/HelpSection.tsx',
  // Explicit user request: selected illustration and Claude reference on login only.
  'src/components/portal/PortalLogin.tsx',
  'src/components/portal/portal-login.module.css',
  // The user explicitly authorized a visual/UX refresh of the personal portal.
  // Portal data, API contracts and roadmap logic remain protected elsewhere.
  'src/components/portal/TodaySection.tsx',
  // Explicit user request (2026-10-15): two decorative Higgsfield illustrations.
  'src/components/portal/PortalArtwork.tsx',
  'src/components/portal/portal-artwork.module.css',
  // Explicit user request: the existing route becomes one animated scooter road.
  'src/components/portal/PortalRoad.tsx',
  // Explicit user request: simpler navigation over the unchanged roadmap.
  'src/lib/portalNavigation.ts',
  'src/components/portal/PortalTaskDetail.tsx',
  'src/components/portal/portal-step.module.css',
  'src/components/portal/portal-settings.module.css',
  'src/components/portal/portal-overview.module.css',
  'src/components/portal/portal-plan.module.css',
  'src/components/portal/portal-documents.module.css',
  // Explicit user request: visible progress for the existing personal plan.
  'src/components/portal/PortalProgress.tsx',
  // Explicit user request: three primary destinations and unified settings.
  'src/components/portal/portal-navigation.module.css',
  'src/components/portal/PlanSection.tsx',
  'src/components/portal/DocsSection.tsx',
  // User-authorized full saved document reports and truthful outcome states.
  'src/components/portal/PortalDocumentReport.tsx',
  'src/components/portal/PortalDocumentContext.tsx',
  'src/components/portal/portal-document.module.css',
  'src/lib/portalDocument.ts',
  // Explicitly authorized critique pass: first-run onboarding and profile settings.
  'src/components/portal/PortalOnboarding.tsx',
  'src/components/portal/ProfileSection.tsx',
  'src/components/portal/portal.module.css',
  'src/lib/portalMeta.ts',
  // User request 2026-10-17: guide-aware Vespi in the existing helper.
  // Only topic context in the existing message field; no API/quota change.
  'src/components/chat/ChatWidget.tsx',
  // User request 2026-10-17: make Vespi usable; production provider badge
  // must not cover the existing helper's launcher or send control.
  'src/components/chat/chat-placement.module.css',
  'src/components/Footer.tsx',
  'src/data/pricing.ts',
  'src/lib/portalApi.ts',
  'src/app/layout.tsx',
  'src/components/Header.tsx',
  'src/data/sources.ts',
  'src/lib/payment.ts',
  'src/lib/paymentMode.ts',
  'src/lib/socialImage.tsx',
]);
const protectedPaths = /^(src\/(app\/(universities\/|globals\.css$|layout\.tsx$|icon\.svg$|apple-icon\.png$)|components\/(universities\/|sketchbook\/|chat\/|portal\/|mascot\/|brand\/|Header\.tsx$|Footer\.tsx$)|data\/|lib\/)|next\.config\.ts$|netlify\.toml$|package(?:-lock)?\.json$)/;
// Explicit user request: implement the researched Kazakhstan admissions update.
// These paths carry copy, eligibility rules and context in existing API fields.
const approvedAdmissionsPaths = new Set([
  'src/data/admissions.ts', 'src/data/admissionsContext.ts',
  'src/data/guides.ts', 'src/data/wizard.ts', 'src/data/changes2026.ts',
  'src/data/chatDemo.ts', 'src/data/italy.ts', 'src/data/sketchbook.ts',
  'src/lib/planBuilder.ts', 'src/lib/chat.ts', 'src/lib/checkDocument.ts',
  // User-authorized UX pass: a local questionnaire draft, with no API change.
  'src/lib/usePlanDraft.ts',
]);
// User-authorized launch polish: shared phone validation and truthful contact/focus states.
// This does not permit new API fields, prices, catalogue data or dependency changes.
const approvedLaunchPaths = new Set([
  'src/lib/phone.ts', 'src/lib/lead.ts', 'src/components/chat/ChatLauncher.tsx',
]);
// User request 2026-10-25: gamify the personal cabinet one small step at a
// time, situational Vespi poses that never repeat, one font and motion system,
// and the supplied zhol paper/risograph style inside the cabinet only.
// Presentation and reward feedback only: roadmap, progress formula, document
// verdicts, API and data contracts stay as they are.
const approvedGamifiedPortalPaths = new Set([
  'src/components/mascot/VespiPose.tsx',
  'src/components/portal/portalStageArt.ts',
  'src/components/portal/RisoArtImage.tsx',
  'src/components/portal/PortalFocus.tsx',
  'src/components/portal/PortalCompletion.tsx',
  'src/components/portal/PortalWelcome.tsx',
  'src/components/portal/LocalWorkspace.tsx',
  'src/components/portal/portal-focus.module.css',
  'src/components/portal/portal-journey.module.css',
  'src/components/portal/higgsfield-visual.module.css',
  'src/components/portal/portal-upload.module.css',
  'src/data/higgsfieldVisuals.ts',
  // User request 2026-11-02 (apple.com iPhone lineup): the stages ahead as a
  // row of cards. Presentation only; it reads the same roadmap and progress.
  'src/components/portal/PortalStageLineup.tsx',
  'src/components/portal/portal-lineup.module.css',
  // 2026-11-03: owner removed the mascot figure from the overview hero
  // («смотрится топорно»); the route Vespi component is deleted.
  'src/components/portal/PortalRouteVespi.tsx',
  // Owner 2026-11-03: the scholarship options read as if only three programs
  // exist. Order and a caption only; answers and their values are unchanged.
  'src/components/portal/PortalAssessment.tsx',
  'src/components/portal/portal-assessment.module.css',
  // Owner 2026-11-05 («имплементи эти изменения в структуру», after the
  // funnel research): the access wall. One module decides what the public
  // result and the guest workspace show for free (first step, one document
  // check) and what waits for payment. It never calls the backend, grants no
  // paid access and stores only a hashed file fingerprint on the device.
  'src/lib/access.ts',
  // Owner 2026-11-05 («минимализм Apple… нормальный поток информации… думай
  // как 11-классник, который ничего не знает об Италии»): the cabinet
  // overview becomes three calm blocks. Plain one-line stage descriptions,
  // short explanations of unfamiliar words and clearer button labels are a
  // presentation layer over the same roadmap, progress, completion and wall.
  'src/components/portal/plainWords.ts',
  'src/components/portal/PlainTerms.tsx',
  'src/components/portal/portal-path.module.css',
]);
// 2026-11-11 (owner: «максимально оптимизируй сайт и make sure что он
// безопасный»). Three contracts get one approved revision each, named by the
// SHA-256 of the committed file; anything else must still match the base.
// - netlify.toml: response headers only — Content-Security-Policy,
//   Permissions-Policy, a year of browser cache for hashed build files and
//   /fonts. Build command, publish directory and environment are unchanged.
// - package.json, package-lock.json: next and eslint-config-next 16.3.4 →
//   16.4.6 (npm audit: a critical advisory covers 16.0.0–16.4.0) and
//   `npm audit fix` inside the existing ranges (sharp, source-map-js, zod,
//   brace-expansion). No dependency was added or removed.
// Once this revision is the base, the files are byte-exact again: a later
// change needs its own approval here, with the request that asked for it.
const approvedRevisions = {
  'netlify.toml': '070d9aeeb9dd98b24c2b19ddf184ff4f7bbcd7176da7af9d42f1e8696b598452',
  'package.json': 'd74d6adecb14d27226f9cd938b5dbaeda9c6febdfa6c3bef273e40a640a02728',
  'package-lock.json': '9c0180c872d7a336ad95c28dd0f272fb9f770c0f71b535a25e38e9b99d5942e0',
  // 2026-11-12 (owner: «некоторые иконки слишком близко стоят местами друг
  // другу, нужно тоже это пофиксить»). Pin sizes only: tier pins 11/7 → 9.5/4.5,
  // the selected pin 14 → 11 with its close neighbours shrinking to a dot while
  // it is selected, a larger invisible tap circle, and the label width model
  // 6.1 → 7.6 per letter (measured). City coordinates, the outline of Italy,
  // roles and handlers are unchanged; italy.ts stays byte-exact.
  'src/components/universities/ItalyMap.tsx': '0295f8f82986d35dabe2d9ca2ee0c042b28ba92536821a799bed04316752c6d8',
  'src/lib/mapLabels.ts': '7a8158c51e84aadc041908df1affc5e1d29a70468280419325a2e430e9db5765',
  // 2026-11-12 (owner: «мы даём слишком много информации бесплатно… надо
  // продумать, где именно сколько дать, чтобы уже брали и покупали»; «Да,
  // делай»). The free chat questions only: FREE_LIMIT 10 → 3, the counter in
  // localStorage per device instead of sessionStorage per tab. The request,
  // the context, the lead form and every API call are unchanged.
  'src/lib/chat.ts': '1e013028ad2a6b7cbbf176e1be0a646d9244e9f95be38dee4371a96083061cca',
  // 2026-11-12, evening (owner: «Сделай обход» — to routing the site around
  // the backend's CORS, which answers only iitaly.netlify.app). netlify.toml:
  // the 11 Nov headers unchanged, plus two redirects — iitaly.netlify.app → iitaly.net
  // (301) and /backend/* → the same Railway backend (200 proxy). backend.ts:
  // on iitaly.net the base is /backend, elsewhere NEXT_PUBLIC_BACKEND_URL.
  // Endpoints, payloads and every API contract are unchanged.
  'src/lib/backend.ts': 'f2fa2b19f6969995d10a300eacdc65a79fb3d7849ba078bbdabc6974c0530b81',
  // Same request: checkDocument.ts only names the proxy's own failures —
  // 504 (Netlify waits 26 s) and 413 (body too large) — instead of «сервер
  // ответил не по формату». The request, payload and parsing are unchanged.
  'src/lib/checkDocument.ts': '99b17276eea034a8fe19bba89b0ab46f3093f1b78077589d5951f36052c11d25',
};
const approvedRevision = path => path in approvedRevisions && existsSync(path) && approvedRevisions[path] === createHash('sha256').update(readFileSync(path)).digest('hex');
// 2026-11-12 (owner: «Да, сделай» to deferring the chat and the scroll
// animation library, after «максимально оптимизируй сайт»). The chat code
// now arrives after the page: ChatMount keeps the launcher in the HTML and
// loads ChatWidget when the browser is free or the chat is asked for.
// Loading only — ChatWidget.tsx, its messages, limits, context events and
// API calls are untouched; launcherFace.ts holds the launcher classes that
// ChatLauncher and ChatMount now share.
const approvedChatLoadingPaths = new Set([
  'src/components/chat/ChatMount.tsx',
  'src/components/chat/launcherFace.ts',
]);
assert.deepEqual(changed.filter(path => protectedPaths.test(path) && !approvedRevision(path) && !approvedChatLoadingPaths.has(path) && !approvedPresentationPaths.has(path) && !approvedReminderUiPaths.has(path) && !approvedAdmissionsPaths.has(path) && !approvedLaunchPaths.has(path) && !approvedGamifiedPortalPaths.has(path)), [], 'Protected source or contract changed.');
const pricing = readFileSync('src/data/pricing.ts', 'utf8');
assert.match(pricing, /PRICE_MAIN = 10990;/);
// User-approved launch price: only the main amount may change; the optional
// review price, package contents and formatting contract remain protected.
const withoutLaunchPrice = source => source.replace(/PRICE_MAIN = (?:667|10990);/, 'PRICE_MAIN = APPROVED;');
assert.equal(withoutLaunchPrice(pricing), withoutLaunchPrice(execFileSync('git', ['show', `${base}:src/data/pricing.ts`], {encoding:'utf8'})), 'Only the approved launch price may change in pricing.ts');
const wizard = readFileSync('src/data/wizard.ts', 'utf8');
assert.equal((wizard.match(/    id: /g) || []).length, 10, 'The quiz includes intake, age, residence and DSU scope.');
const baseItaly = execFileSync('git', ['show', `${base}:src/data/italy.ts`], {encoding:'utf8'});
const headItaly = readFileSync('src/data/italy.ts', 'utf8');
assert.equal(headItaly.match(/export const ITALY_PATH = .*;/)?.[0], baseItaly.match(/export const ITALY_PATH = .*;/)?.[0], 'Map geometry is unchanged.');
const cityGeometry = source => source.match(/export const CITIES:[\s\S]*?\n};/)?.[0].replace(/region: "[^"]*", /g, '').replace(/sky: "[^"]*"/g, 'sky: "presentation"');
assert.equal(cityGeometry(headItaly), cityGeometry(baseItaly), 'City identities, coordinates and styles are unchanged.');
const baseMap = execFileSync('git', ['show', `${base}:src/components/universities/ItalyMap.tsx`], {encoding:'utf8'});
// The new brief explicitly recolors inline SVG gradients. Erase only color
// literals for comparison: all paths, coordinates, roles and handlers stay exact.
const withoutColors = source => source.replace(/#[\da-f]{3,8}\b|rgba?\([^)]*\)/gi, 'COLOR');
if (!approvedRevision('src/components/universities/ItalyMap.tsx')) assert.equal(withoutColors(readFileSync('src/components/universities/ItalyMap.tsx', 'utf8')), withoutColors(baseMap.replace('role="img"', 'role="group"')), 'Map changes are limited to colors; geometry and interaction stay exact.');
console.log('Approved presentation paths passed; map geometry, comparison model, API and dependencies remain protected.');

// The current request changes presentation only, not stored data or service contracts.
for (const path of [
  'src/data/admissions.ts','src/data/wizard.ts','src/data/italy.ts',
  'src/lib/payment.ts','src/lib/paymentMode.ts','src/lib/checkDocument.ts','src/lib/chat.ts',
  'src/lib/lead.ts','src/lib/phone.ts','src/lib/backend.ts',
  'src/lib/usePlanDraft.ts',
  'src/components/universities/comparison-model.ts',
  'src/components/guides/permesso/permessoOriginalGeometry.ts',
  'src/components/guides/permesso/permessoTransferModel.ts',
  'package.json','package-lock.json','next.config.ts','netlify.toml',
]) if (!approvedRevision(path)) assert.equal(readFileSync(path,'utf8'),execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8'}),`${path}: presentation changes must preserve this contract`);
// 2026-11-07 (owner: Modulo 1 «слишком много информации… разбить… на другие
// сайты»): the code widget and the sheet calculator moved from under the form
// to the «Коды и расчёты» page, so two pointers say where they are now.
// Every rule, code, mode and example in permessoData.ts stays byte-exact.
const permessoPointers = source => source
  .replace('Выбери код в разделе «Коды и расчёты».', 'Выбери код в виджете ниже.')
  .replace('Калькулятор в разделе «Коды и расчёты» — только ориентир.', 'Калькулятор ниже — только ориентир.');
assert.equal(permessoPointers(readFileSync('src/components/guides/permesso/permessoData.ts','utf8')), permessoPointers(execFileSync('git',['show',`${base}:src/components/guides/permesso/permessoData.ts`],{encoding:'utf8'})), 'permessoData.ts: only the two moved-reference pointers may change');
// The shared Modulo 1 serif stack may be extracted into exactly one token;
// every existing global rule and palette token remains byte-for-byte unchanged.
// The mono token is exempt as well (2026-11-04: it now points at Onest — the
// owner asked for no second typeface; design-vespi-system-review checks it).
const withoutEditorialToken = source => source.replace('  --font-editorial: Charter, Georgia, serif;\n', '').replace(/  --font-mono: [^\n]+\n/, '')
  // 2026-11-05 (owner: «используй эти плагины для дизайна», emilkowalski mobile-native): app-like controls only.
  .replace(/\n\/\* mobile-native \(emilkowalski\/skills[\s\S]*?user-select: none;\n\}\n/, '');
assert.equal(withoutEditorialToken(readFileSync('src/app/globals.css','utf8')), withoutEditorialToken(execFileSync('git',['show',`${base}:src/app/globals.css`],{encoding:'utf8'})), 'Only the shared editorial and mono font tokens may change in globals');
assert(!existsSync('src/components/home/HowItWorks.tsx'),'How-it-works facts now live in the FAQ');
assert(!/HowItWorks/.test(readFileSync('src/app/page.tsx','utf8')),'Do not restore the removed home section');
for (const path of ['src/components/home/Hero.tsx','src/components/home/PriceBand.tsx']) {
  assert(!/VespiAssistant|<Vespi\b/.test(readFileSync(path,'utf8')),`${path}: removed mascot callout`);
}
assert(!/VespiIntroSection/.test(readFileSync('src/app/guides/page.tsx','utf8')),'Guides do not repeat the home introduction');
assert(!/useVespiPresence|<Vespi\b/.test(readFileSync('src/components/chat/ChatLauncher.tsx','utf8')),'Floating help is a quiet icon entry');

// User request 2026-10-20: direct task copy and no owner-role division.
// Allow only those exact template edits; IDs, persistence and completion logic stay fixed.
const localTaskPresentation = source => source
  .replace('import { taskShortExplainer } from "./portalStepCopy";\n', '')
  .replace('if (!draft.complete) tasks.push', 'tasks.push')
  .replace('.map(task => ({ ...task, short_explainer: taskShortExplainer(task) }))', '')
  .replace(/, owner: \/финанс\|запас до выплаты\/\.test\(step\.t\) \? "Родители" : "Ты"/g, '')
  .replace(/, owner: "(?:Ты|Родители)"/g, '')
  .replace('Попросить родителей собрать семейные справки', 'Собрать справки о составе и доходах семьи для DSU')
  .replace('Попросить родителей подготовить банковские выписки', 'Подготовить банковские выписки');
assert.equal(localTaskPresentation(readFileSync('src/lib/localWorkspace.ts', 'utf8')), localTaskPresentation(execFileSync('git', ['show', `${base}:src/lib/localWorkspace.ts`], { encoding: 'utf8' })), 'Local task IDs and workspace logic unchanged');

// Only the explicitly requested optional profile/copy fields extend this contract.
const withoutPortalFields = source => source.split('\n').filter(line => !/^\s*(universityIds|short_explainer|instruction_title|assistant_question|routeAcademicYear)\?:/.test(line)).join('\n');
assert.equal(withoutPortalFields(readFileSync('src/lib/portalApi.ts','utf8')), withoutPortalFields(execFileSync('git',['show',`${base}:src/lib/portalApi.ts`],{encoding:'utf8'})), 'Portal endpoint/authentication implementations unchanged');
