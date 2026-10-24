import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const base = process.argv[2];
assert(base, 'Pass the reviewed base commit SHA.');
const changed = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], { encoding: 'utf8' }).trim().split('\n');
// The user authorized a visual refresh of this page, not a change to its map/data.
const approvedPresentationPaths = new Set(['src/app/universities/page.tsx',
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
assert.deepEqual(changed.filter(path => protectedPaths.test(path) && !approvedPresentationPaths.has(path) && !approvedReminderUiPaths.has(path) && !approvedAdmissionsPaths.has(path) && !approvedLaunchPaths.has(path)), [], 'Protected source or contract changed.');
const pricing = readFileSync('src/data/pricing.ts', 'utf8');
assert.match(pricing, /PRICE_MAIN = 667;/);
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
assert.equal(withoutColors(readFileSync('src/components/universities/ItalyMap.tsx', 'utf8')), withoutColors(baseMap.replace('role="img"', 'role="group"')), 'Map changes are limited to colors; geometry and interaction stay exact.');
console.log('Approved presentation paths passed; map geometry, comparison model, API and dependencies remain protected.');

// The current request changes presentation only, not stored data or service contracts.
for (const path of [
  'src/data/pricing.ts','src/data/admissions.ts','src/data/wizard.ts','src/data/italy.ts',
  'src/lib/payment.ts','src/lib/paymentMode.ts','src/lib/checkDocument.ts','src/lib/chat.ts',
  'src/lib/lead.ts','src/lib/phone.ts','src/lib/backend.ts',
  'src/lib/usePlanDraft.ts',
  'src/components/universities/comparison-model.ts',
  'src/components/guides/permesso/permessoOriginalGeometry.ts',
  'src/components/guides/permesso/permessoData.ts',
  'src/components/guides/permesso/permessoTransferModel.ts',
  'src/app/globals.css',
  'package.json','package-lock.json','next.config.ts','netlify.toml',
]) assert.equal(readFileSync(path,'utf8'),execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8'}),`${path}: presentation changes must preserve this contract`);
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
