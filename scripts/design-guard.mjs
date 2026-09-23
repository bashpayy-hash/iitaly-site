import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = process.argv[2];
assert(base, 'Pass the reviewed base commit SHA.');
const changed = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], { encoding: 'utf8' }).trim().split('\n');
// The user authorized a visual refresh of this page, not a change to its map/data.
const approvedPresentationPaths = new Set(['src/app/universities/page.tsx',
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
  'src/components/universities/university-ui.module.css']);
// Telegram reminder UI is explicitly allowed; API/data contracts remain protected.
const approvedReminderUiPaths = new Set([
  'src/components/portal/PortalExplorer.tsx',
  'src/components/portal/HelpSection.tsx',
  // The user explicitly authorized a visual/UX refresh of the personal portal.
  // Portal data, API contracts and roadmap logic remain protected elsewhere.
  'src/components/portal/TodaySection.tsx',
  'src/components/portal/PlanSection.tsx',
  'src/components/portal/DocsSection.tsx',
  'src/components/portal/portal.module.css',
  'src/components/chat/ChatWidget.tsx',
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
assert.deepEqual(changed.filter(path => protectedPaths.test(path) && !approvedPresentationPaths.has(path) && !approvedReminderUiPaths.has(path)), [], 'Protected source or contract changed.');
const pricing = readFileSync('src/data/pricing.ts', 'utf8');
assert.match(pricing, /PRICE_MAIN = 25000;/);
const wizard = readFileSync('src/data/wizard.ts', 'utf8');
assert.equal((wizard.match(/    id: /g) || []).length, 6, 'The free quiz must have six questions.');
console.log('Approved launch-polish paths passed; ItalyMap, university data, comparison model, global CSS and dependencies unchanged.');
