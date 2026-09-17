import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = process.argv[2];
assert(base, 'Pass the reviewed base commit SHA.');
const changed = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], { encoding: 'utf8' }).trim().split('\n');
// User explicitly requested removal of the sketchbook section and a richer comparison.
// These are the only newly authorized edits under the otherwise protected route.
const approvedComparisonPaths = new Set([
  'src/components/universities/UniversitiesExplorer.tsx',
  'src/components/universities/CompareModal.tsx',
  'src/components/universities/ComparisonSection.tsx',
  'src/components/universities/ComparisonTable.tsx',
  'src/components/universities/comparison-model.ts',
  'src/components/universities/comparison.module.css',
]);
const protectedPaths = /^(src\/(app\/(universities\/|globals\.css$|layout\.tsx$)|components\/(universities\/|sketchbook\/|chat\/|portal\/|Header\.tsx$|Footer\.tsx$)|data\/|lib\/)|next\.config\.ts$|netlify\.toml$|package(?:-lock)?\.json$)/;
assert.deepEqual(changed.filter(path => protectedPaths.test(path) && !approvedComparisonPaths.has(path)), [], 'Protected source or contract changed.');
const pricing = readFileSync('src/data/pricing.ts', 'utf8');
assert.match(pricing, /PRICE_MAIN = 25000;/);
const wizard = readFileSync('src/data/wizard.ts', 'utf8');
assert.equal((wizard.match(/    id: /g) || []).length, 6, 'The free quiz must have six questions.');
console.log('Protected map/filter sources, sketchbook implementation, global chrome, data, backend contracts and lockfile unchanged; only the authorized comparison and sketchbook mount changed.');
