const roadmap = [
  { id: 'start', title: 'Старт', tasks: [
    { id: 'profile', t: 'Заполнить профиль', available: true, owner: 'Ты' },
    { id: 'shortlist', ai: true, t: 'Выбрать программы', explain: 'Сравни программы и выбери подходящие.', time: '15 мин', available: true, owner: 'Ты', deadline: '2026-11-15', deadlineKind: 'application', daysLeft: 30 },
    { id: 'family-budget', t: 'Обсудить бюджет', explain: 'Уточни сумму на учёбу и жизнь.', time: '10 мин', available: true, owner: 'Ты + родители' },
  ] },
  { id: 'documents', title: 'Документы', tasks: [
    { id: 'statements', t: 'Подготовить банковскую выписку', available: false, owner: 'Ты', timingLabel: 'Сначала выбрать программы' },
    { id: 'familyDocs', t: 'Собрать справки о доходах', available: false, owner: 'родители', timingLabel: 'Сначала выбрать программы' },
  ] },
  { id: 'visa', title: 'Виза', tasks: [{ id: 'visa-task', t: 'Собрать визовый пакет', available: true, owner: 'Ты', deadline: '2026-10-16', daysLeft: 3 }] },
  { id: 'arrival', title: 'Переезд', tasks: [{ id: 'arrival-task', t: 'Подготовиться к приезду', available: false, owner: 'Ты', timingLabel: 'После получения визы' }] },
];
const ids = roadmap.flatMap(stage => stage.tasks.map(task => task.id));
export function fixture(mode = 'partial') {
  const data = { ok: true, client: { name: 'Тестовый профиль', surname: 'Testov', intakeYear: 2027, tgLinked: false, notify: { telegram: false }, onboardingComplete: true, profile: { education: 'NIS Grade 12', goal: 'Бакалавриат', budget: 'До 3 млн ₸/год', educationPath: 'university_kz', onboardingDone: true } }, roadmap: structuredClone(roadmap), done: { profile: true, 'obsolete-task': true }, docs: {} };
  if (mode === 'zero') data.done = {};
  if (mode === 'onboarding') { data.client.onboardingComplete = false; data.client.profile = {}; data.done = {}; }
  if (mode === 'profile') { data.client.profile.education = 'НИШ / 12 лет'; delete data.client.profile.educationPath; }
  if (mode === 'complete') data.done = Object.fromEntries([...ids, 'obsolete-task'].map(id => [id, true]));
  if (mode === 'empty') { data.roadmap = []; data.done = {}; }
  if (mode === 'blocked') data.roadmap.forEach(stage => stage.tasks.forEach(task => { task.available = false; }));
  if (mode === 'near') data.roadmap[0].tasks[1].daysLeft = 3;
  if (mode === 'dates') {
    data.roadmap[1].tasks[0].deadline = '2026-10-15'; data.roadmap[1].tasks[0].daysLeft = 2;
    data.roadmap[1].tasks[1].daysLeft = -1; // Missing date must not become an invented deadline.
    data.roadmap[3].tasks[0].deadline = '2026-10-19'; data.roadmap[3].tasks[0].daysLeft = 6;
  }
  if (mode === 'help') {
    // Synthetic instructional copy exercises disclosure and deduplication,
    // without introducing a program requirement or a claimed deadline.
    const task = data.roadmap[0].tasks[1];
    task.explain += ' Это пояснение тестового шага.';
    task.note = 'Дополнительная памятка для тестового шага.';
    task.warn = task.note;
  }
  if (mode === 'parents') data.done.shortlist = true;
  if (mode === 'parent-file') { data.roadmap = [{ id: 'documents', title: 'Документы', tasks: [{ id: 'familyDocs', t: 'Попросить родителей собрать семейные справки', explain: 'Попроси родителей собрать справки по требованиям конкурса.', owner: 'родители', available: true }, { id: 'insurance', t: 'Подготовить страховку', owner: 'Ты', available: true }] }]; data.done = {}; }
  if (mode === 'manual') { data.roadmap[0].tasks[1] = { id: 'manual-task', t: 'Подготовить сведения', explain: 'Подготовь сведения для выбранной программы.', available: true, owner: 'Ты' }; }
  if (mode === 'last') { data.roadmap = [{ id: 'arrival', title: 'Переезд', tasks: [{ id: 'manual-task', t: 'Подготовить сведения', available: true, owner: 'Ты' }] }]; data.done = {}; }
  if (mode === 'full-route' || mode === 'screenshot-parent') {
    // Real backend stage names and conditional first-year route distribution.
    // Keep this a local synthetic fixture, never import or call the live backend.
    data.roadmap = [
      ['start', 'Старт', ['profile', 'shortlist', 'chances']],
      ['education12', '12 лет образования', ['path12', 'enroll12']],
      ['docs', 'Документы', ['apostille', 'translate', 'notary', 'cimea', 'checkDocs']],
      ['apply', 'Поступление', ['test', 'uniApply', 'universitaly', 'checkpoint1']],
      ['dsu', 'Стипендия и льготы (DSU)', ['familyDocs', 'iseeu', 'dsuApply', 'checkpoint2']],
      ['visa', 'Виза', ['money', 'statements', 'insurance', 'housing', 'blsSlot', 'visaSubmit', 'checkpoint3']],
      ['arrival', 'После приезда', ['kit', 'codice', 'questura']],
    ].map(([id, title, taskIds]) => ({ id, title, tasks: taskIds.map(taskId => ({ id: taskId, t: taskId === 'shortlist' ? 'Выбрать программы и вузы' : `Подготовить шаг: ${title}`, owner: 'Ты', available: true })) }));
  }
  if (mode === 'screenshot-parent') {
    // Reproduce the user's long parent-owned current title and six-stage route
    // with synthetic data only. Two completed later documents deliberately
    // make overall progress differ from progress inside the current stage.
    data.roadmap = data.roadmap.filter(stage => stage.id !== 'education12');
    Object.assign(data.roadmap[0].tasks.find(task => task.id === 'chances'), {
      t: 'Попросить родителей оценить шансы на стипендию', owner: 'Ты + родители', time: '10 мин',
    });
    data.done = { profile: true, shortlist: true, apostille: true, translate: true, 'obsolete-task': true };
  }
  if (mode === 'late-current') {
    data.roadmap = [{ id: 'documents', title: 'Документы', tasks: [
      { id: 'apostille', t: 'Поставить апостиль на аттестат', available: true, owner: 'Ты' },
      { id: 'translate', t: 'Заказать официальный перевод на итальянский', available: true, owner: 'Ты' },
      { id: 'notary', t: 'Заверить перевод', available: true, owner: 'Ты' },
      { id: 'cimea', t: 'Подтвердить квалификацию', available: true, owner: 'Ты' },
      { id: 'statements', t: 'Подготовить банковскую выписку', available: true, owner: 'Ты', time: '10 мин' },
    ] }, ...structuredClone(roadmap.slice(2))];
    data.done = { apostille: true, translate: true, notary: true, cimea: true, 'obsolete-task': true };
  }
  return data;
}
export function upstreamProgress(data) {
  const tasks = data.roadmap.flatMap(stage => stage.tasks), total = tasks.length;
  const done = tasks.filter(task => data.done[task.id]).length;
  return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
}
