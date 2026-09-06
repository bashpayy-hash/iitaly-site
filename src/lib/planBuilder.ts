// Портировано из старого сайта (index.html, buildPlanFrom / buildPlan).
// В проде план строит ИИ по полному своду правил ISEEU/DSU/вузов; здесь —
// та же правило-базированная демонстрационная логика, что была на старом
// сайте (ключевые слова из ответов визарда → шаги и чек-лист документов).

import type { WizAnswers } from "@/data/wizard";

export interface PlanStep {
  t: string;
  p: string;
}

export interface PlanDoc {
  n: string;
  d: string;
  err: boolean;
}

export interface Plan {
  steps: PlanStep[];
  docs: PlanDoc[];
}

export function situationFromAnswers(a: WizAnswers): string {
  const parts: string[] = [];
  if (a.education) parts.push(a.education);
  if (a.grades) parts.push(`средний балл ${a.grades}`);
  if (a.goal) parts.push(a.goal.toLowerCase());
  if (a.field) parts.push(`направление: ${a.field.toLowerCase()}`);
  if (a.budget) parts.push(`бюджет: ${a.budget.toLowerCase()}`);
  if (a.lang) parts.push(`английский: ${a.lang}`);
  return parts.join(", ");
}

export function buildPlan(situation: string): Plan {
  const low = situation.toLowerCase();
  const is11 = /11 ?класс|одиннадц/.test(low);
  const isNIS = /ниш|12 ?лет|12 ?класс/.test(low);
  const isMaster = /магистр|master|бакалавра/.test(low);
  const needSch = /стипенд|грант|не потянем|дорого|дешев/.test(low);
  const milan = /милан|bocconi|бокони|боккони/.test(low);

  const steps: PlanStep[] = [];

  if (isMaster) {
    steps.push({
      t: "Диплом бакалавра — твой пропуск",
      p: "Проблемы 12 лет нет. Нужен диплом + транскрипт с апостилем и CIMEA Statement of Comparability.",
    });
  } else if (is11 && !isNIS) {
    steps.push({
      t: "Реши проблему 12 лет образования",
      p: "11 классов недостаточно. Варианты: год вуза в КЗ со сданной сессией или foundation year в Италии (€3 500–5 000).",
    });
  } else if (isNIS) {
    steps.push({
      t: "Диплом НИШ/12 лет открывает прямой путь",
      p: "Требование 12 лет закрыто. Сразу к выбору вуза и признанию документов.",
    });
  } else {
    steps.push({
      t: "Проверяем базу: 12 лет образования",
      p: "Италия требует 12 лет школы. Уточним твой случай по документам.",
    });
  }

  steps.push({
    t: "Признание аттестата: CIMEA",
    p: "Строгий порядок: сначала апостиль в РК, потом присяжный перевод. ~€65–150, 30–60 дней.",
  });

  steps.push(
    milan
      ? {
          t: "Милан: выбери трек",
          p: "Bocconi (€17 000+/год, Bocconi test или SAT 1450+) или Statale (€0–4 000 по ISEE, TOLC, Universitaly до конца июля).",
        }
      : {
          t: "Выбор вуза и теста",
          p: "Госвузы €0–4 000/год по ISEE. TOLC/CEnT-S ~€35, есть @home. Universitaly обязателен, дедлайны с мая по июль.",
        },
  );

  if (needSch) {
    steps.push({
      t: "Стипендия DSU — твой главный рычаг",
      p: "До €7 557/год + жильё + питание. ISEEU parificato: справки семьи за референсный год, апостиль + перевод. Подача ДО приезда.",
    });
  }

  steps.push({
    t: "Виза D через BLS",
    p: "Гарантия €6 947,33/год, выписки 3 мес с QR, страховка, жильё. Не позднее 15 дней до выезда.",
  });
  steps.push({
    t: "Первые 8 дней в Италии",
    p: "Kit giallo на почте, codice fiscale сразу, Questura по записи.",
  });

  let docs: PlanDoc[] = [
    { n: "Аттестат / диплом", d: "апостиль → присяжный перевод", err: false },
    { n: "Справка о составе семьи", d: "для ISEEU · апостиль + перевод", err: false },
    { n: "Справка о доходах за референсный год", d: "для ISEEU · частая ошибка: не тот год", err: true },
    { n: "Банковские выписки с QR (3 мес)", d: "для визы D · Kaspi недостаточно", err: false },
  ];
  if (!needSch) docs = docs.filter((d) => !d.d.includes("ISEEU"));

  return { steps, docs };
}
