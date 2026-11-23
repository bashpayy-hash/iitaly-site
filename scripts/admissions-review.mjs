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
    'src/lib/planBuilder.ts', 'src/data/wizardTracks.ts', '--outDir', temporary, '--module', 'commonjs',
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
  // The master's track. Owner, 23 Nov: «когда она нажала на магистратуру,
  // дальше идут все равно вопросы, будто она школьница… сделать для
  // магистратуры отдельный трек со всеми особенностями».
  const {wizardFor, wizardAnswers} = require(join(temporary, 'data/wizardTracks.js'));
  const masterQuestions = wizardFor({goal:'Магистратура'});
  const master = overrides => buildPlan({...Object.fromEntries(masterQuestions.map(q => [q.id, q.opts[0].v])), goal:'Магистратура', ...overrides});
  assert.equal(WIZ[1].id, 'goal', 'The level is asked before the school');
  assert.equal(wizardFor({goal:'Бакалавриат'}), WIZ);
  assert.equal(wizardFor({}), WIZ);
  assert.deepEqual(masterQuestions.map(q => q.id), ['intake','goal','education','major','grades','budget','field','lang','residence','dsuRegion'], 'A graduate is asked about the diploma and its profile, not about school or being 18');
  assert.equal(masterQuestions.length, WIZ.length, 'Both tracks have ten questions');
  // The cabinet's server keeps education, goal and budget and accepts only its own values.
  const serverValues = {education:['11 классов','НИШ / 12 лет','Студент вуза КЗ','Бакалавр'], goal:['Бакалавриат','Магистратура'], budget:['Только со стипендией','До 1 млн ₸/год','До 3 млн ₸/год','Без ограничений']};
  for (const [id, values] of Object.entries(serverValues)) for (const option of masterQuestions.find(q => q.id === id).opts) assert(values.includes(option.v), `The master's ${id} answer «${option.v}» is one the server accepts`);
  assert.deepEqual(wizardAnswers({goal:'Магистратура', education:'11 классов', age:'minor', grades:'отличник'}), {goal:'Магистратура', grades:'отличник'}, 'A school answer does not stay in a master\'s draft');
  assert.deepEqual(wizardAnswers({goal:'Бакалавриат', education:'11 классов', major:'same'}), {goal:'Бакалавриат', education:'11 классов'});
  assert.match(master({}).steps[0].p, /120 кредитов/);
  assert.match(master({education:'Студент вуза КЗ'}).steps[0].summary, /до выпуска/);
  assert.match(master({education:'Студент вуза КЗ'}).steps[0].p, /школьный аттестат его не заменяет/);
  assert(master({major:'change'}).steps.some(s => s.t === 'Сверь предметы диплома с программой'));
  assert(!master({major:'same'}).steps.some(s => s.t === 'Сверь предметы диплома с программой'));
  assert(master({}).steps.some(s => s.t === 'Выбери программу и узнай, как она отбирает'));
  assert(!master({}).steps.some(s => s.t === 'Выбери программу, тест и язык'));
  assert.match(text(master({})), /Master universitario/);
  assert.match(text(master({field:'Медицина'})), /шестилетний цикл/);
  assert.doesNotMatch(text(master({})) + text(master({field:'Медицина'})), /CEnT-S стоит|11-летн|Foundation|semestre aperto|IMAT/, 'No school route in a master\'s plan');
  assert(!master({age:'minor'}).steps.some(s => /18 лет/.test(s.t)) && !master({age:'minor'}).docs.some(d => d.n === 'Документы несовершеннолетнего'), 'A graduate gets no minor\'s step');
  assert.equal(master({}).docs[0].n, 'Диплом бакалавра и приложение с оценками');
  assert(master({}).docs.some(d => d.n === 'Семья, доходы и имущество'), 'The scholarship documents keep their name (the guest cabinet finds them by it)');
  for (const q of masterQuestions) for (const option of q.opts) {
    const result = master({[q.id]:option.v});
    for (const step of result.steps) for (const source of step.sources || []) assert(ADMISSION_SOURCES[source], `Missing source for ${step.t}`);
    assert.doesNotMatch(text(result), /7[ \u00a0]?557|6[ \u00a0]?947|BLS/);
  }
  console.log('Admissions checks passed: qualifications, study years, DSU regions, minors, residence, language, budget, the master\'s track and source references.');
} finally {
  rmSync(temporary, {recursive:true, force:true});
}
