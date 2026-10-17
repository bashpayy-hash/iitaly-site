import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = process.argv[2];
assert(base, 'Pass the reviewed base commit SHA.');
const changed = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], { encoding: 'utf8' }).trim().split('\n');
// The user authorized a visual refresh of this page, not a change to its map/data.
const approvedPresentationPaths = new Set(['src/app/universities/page.tsx',
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
const protectedPaths = /^(src\/(app\/(universities\/|globals\.css$|layout\.tsx$)|components\/(universities\/|sketchbook\/|chat\/|portal\/|Header\.tsx$|Footer\.tsx$)|data\/|lib\/)|next\.config\.ts$|netlify\.toml$|package(?:-lock)?\.json$)/;
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
const cityGeometry = source => source.match(/export const CITIES:[\s\S]*?\n};/)?.[0].replace(/region: "[^"]*", /g, '');
assert.equal(cityGeometry(headItaly), cityGeometry(baseItaly), 'City identities, coordinates and styles are unchanged.');
const baseMap = execFileSync('git', ['show', `${base}:src/components/universities/ItalyMap.tsx`], {encoding:'utf8'});
assert.equal(readFileSync('src/components/universities/ItalyMap.tsx', 'utf8'), baseMap.replace('role="img"', 'role="group"'), 'Only the accessible map role may change in this UX pass.');
console.log('Approved admissions paths passed; map component, comparison model, global CSS and dependencies remain protected.');
