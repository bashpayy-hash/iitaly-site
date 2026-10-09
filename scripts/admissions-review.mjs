import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';

// Compile the actual rule engine with the project's TypeScript, without adding dependencies.
const temporary = mkdtempSync(join(tmpdir(), 'iitaly-admissions-'));
const require = createRequire(import.meta.url);
try {
  execFileSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'),
    'src/lib/planBuilder.ts', '--outDir', temporary, '--module', 'commonjs',
    '--target', 'ES2020', '--skipLibCheck'], {stdio:'pipe'});
  const {buildPlan} = require(join(temporary, 'lib/planBuilder.js'));
  const {WIZ} = require(join(temporary, 'data/wizard.js'));
  const {ADMISSION_SOURCES} = require(join(temporary, 'data/admissions.js'));
  const initial = Object.fromEntries(WIZ.map(q => [q.id, q.opts[0].v]));
  const plan = overrides => buildPlan({...initial, ...overrides});
  const text = result => result.steps.map(s => `${s.t}: ${s.p}`).join('\n');
  const dsu = result => result.steps.find(s => s.t.startsWith('Готовь DSU'))?.p || '';

  assert.match(plan({education:'11 классов'}).steps[0].p, /всеми требуемыми экзаменами/);
  assert.match(plan({education:'NIS Grade 12'}).steps[0].p, /Ca’ Foscari/);
  assert.match(plan({education:'БИЛ'}).steps[0].t, /Уточни/);
  assert.match(plan({education:'Колледж'}).steps[0].p, /Простого сложения лет недостаточно/);
  assert.match(plan({education:'Студент вуза КЗ'}).steps[0].p, /незакрытый курс не равнозначен/);
  assert.match(plan({goal:'Магистратура', education:'11 классов'}).steps[0].p, /школьный аттестат его не заменяет/);
  assert.doesNotMatch(dsu(plan({intake:'2027/28', dsuRegion:'iulm'})), /2024|2025/);
  assert.match(dsu(plan({intake:'2026/27', dsuRegion:'iulm'})), /2024/);
  assert.doesNotMatch(dsu(plan({intake:'2026/27', dsuRegion:'iulm'})), /2025/);
  assert.match(dsu(plan({intake:'2026/27', dsuRegion:'piemonte'})), /2025/);
  assert.equal(dsu(plan({dsuRegion:'none'})), '');
  assert(plan({age:'minor'}).docs.some(d => d.n === 'Документы несовершеннолетнего'));
  assert(!plan({age:'adult'}).docs.some(d => d.n === 'Документы несовершеннолетнего'));
  assert(!plan({residence:'other'}).steps.some(s => s.t === 'Подготовь визу D через VFS'));
  assert(plan({residence:'italy'}).steps.some(s => s.t === 'Проверь действующий статус в Италии'));
  assert.doesNotMatch(text(plan({intake:'later'})), /Национальный предел/);
  assert.match(text(plan({field:'Медицина'})), /отдельный bando/);
  assert.match(text(plan({lang:'хочу на итальянском'})), /подтверждения итальянского/);
  assert.match(text(plan({budget:'Только со стипендией', dsuRegion:'none'})), /стипендия не выбрана/);
  for (const q of WIZ) for (const option of q.opts) {
    const result = plan({[q.id]:option.v});
    for (const step of result.steps) for (const source of step.sources || []) {
      assert(ADMISSION_SOURCES[source], `Missing source for ${step.t}`);
    }
    assert.doesNotMatch(text(result), /7[ \u00a0]?557|6[ \u00a0]?947|BLS/);
  }
  console.log('Admissions checks passed: qualifications, study years, DSU regions, minors, residence, language, budget and source references.');
} finally {
  rmSync(temporary, {recursive:true, force:true});
}
