import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2];
assert(base, 'Pass the reviewed base commit SHA.');
const read = path => readFileSync(path, 'utf8');
const before = path => execFileSync('git', ['show', `${base}:${path}`], {encoding:'utf8'});
// Editorial refinements may not change product contracts or admissions facts.
for (const path of [
  'src/data/pricing.ts','src/data/admissions.ts','src/data/wizard.ts',
  'src/lib/payment.ts','src/lib/paymentMode.ts','src/lib/checkDocument.ts',
  'src/lib/chat.ts','src/lib/lead.ts','src/lib/phone.ts','src/lib/backend.ts',
  'src/lib/mapLabels.ts','src/components/universities/comparison-model.ts',
  'src/components/guides/permesso/permessoOriginalGeometry.ts',
  'src/components/guides/permesso/permessoData.ts',
  'src/components/guides/permesso/permessoTransferModel.ts',
  'next.config.ts','netlify.toml','package-lock.json',
]) assert.equal(read(path), before(path), `${path}: contract or data changed`);
const normalizeWash = source => source.replace(/wash: "[^"]*"/g, 'wash: "presentation"');
assert.equal(normalizeWash(read('src/data/italy.ts')), normalizeWash(before('src/data/italy.ts')), 'Catalogue facts and map geometry stay exact');
const normalizeApi = source => source
  .replace('import { studentRoadmap } from "./studentCopy";\n','')
  .replaceAll('studentRoadmap(d as PortalData)', 'd as PortalData');
assert.equal(normalizeApi(read('src/lib/portalApi.ts')), normalizeApi(before('src/lib/portalApi.ts')), 'Portal changes are limited to display normalization; request contracts stay exact');
const previousPackage = JSON.parse(before('package.json')), nextPackage = JSON.parse(read('package.json'));
assert.deepEqual(nextPackage.dependencies, previousPackage.dependencies);
assert.deepEqual(nextPackage.devDependencies, previousPackage.devDependencies);
const forbiddenCopy = new RegExp('\\u0440\\u043e\\u0434\\u0438\\u0442\\u0435\\u043b', 'iu');
function inspect(directory) {
  for (const entry of readdirSync(directory, {withFileTypes:true})) {
    const path = join(directory,entry.name);
    if(entry.isDirectory()) {inspect(path);continue;}
    if(!/\.(tsx?|jsx?|css|html|json|svg)$/.test(path))continue;
    const source = read(path);
    assert(!forbiddenCopy.test(source), `${path}: obsolete role wording`);
    assert(!/["'`(]\/mascot\//.test(source), `${path}: discarded 3D mascot artwork`);
    assert(!/[\p{Emoji_Presentation}\p{Regional_Indicator}\uFE0F\u20E3]/u.test(source), `${path}: emoji in interface copy`);
    assert(!/gallery-(?:room|wordmark|parallax)|font-davinci|color-putty|surface-ink-room|374px|#c4c3b6/i.test(source), `${path}: discarded gallery layout`);
  }
}
inspect('src');inspect('tools');
console.log('Editorial UX contracts passed: exact admissions/prices/payment/API/dependencies/map/Permesso geometry, no 3D mascots or emoji, minimal assistant and student-directed copy.');
