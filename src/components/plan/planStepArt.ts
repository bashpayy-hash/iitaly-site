import { objectFrame } from "@/components/guides/guideArt";

/* Ярлык и вещь шага плана — по названию шага. Это только представление:
   данные плана (src/lib/planBuilder.ts) не меняются и остаются под защитой.
   Вещи — тот же студийный набор, что в кабинете и справочнике
   (design/illustrations/objects-2026-11-04.json). */
const HEIGHTS: Record<string, number> = {
  alarm: 357, books: 369, cap: 348, coins: 367, diploma: 357, envelope: 362, folder: 338,
  insurance: 362, keys: 365, map: 358, military: 358, minors: 371, passport: 359,
  "permesso-kit": 387, "stamp-pad": 371, "tax-card": 361, tests: 352, translation: 351,
};

const RULES: { test: RegExp; label: string; art: keyof typeof HEIGHTS }[] = [
  { test: /магистратур|11-летн|NIS|IB \/ A-levels|колледж|год университета|квалификац/i, label: "Образование", art: "diploma" },
  { test: /DoV|CIMEA/, label: "Подтверждение документов", art: "folder" },
  { test: /программу, тест и язык/i, label: "Программа", art: "books" },
  { test: /язык и академические/i, label: "Требования вуза", art: "tests" },
  { test: /календарь/i, label: "Сроки", art: "alarm" },
  { test: /DSU/, label: "Стипендия", art: "cap" },
  { test: /статус в Италии/i, label: "Статус в Италии", art: "permesso-kit" },
  { test: /консульство/i, label: "Консульство", art: "envelope" },
  { test: /визу D/i, label: "Виза D", art: "passport" },
  { test: /финансирование/i, label: "Финансы", art: "coins" },
  { test: /запас/i, label: "Бюджет", art: "coins" },
  { test: /18 лет/, label: "До 18 лет", art: "minors" },
  { test: /призыв/i, label: "Призыв", art: "military" },
  { test: /зачисление/i, label: "Зачисление", art: "keys" },
];

/* Этап пути для хронологии плана (owner, 6 Nov, ночь: «нагляднее, в
   хронологическом порядке»). Названия — те же, что у этапов «Весь путь» в
   кабинете; порядок шагов задаёт planBuilder, этап лишь группирует подряд
   идущие шаги. */
const PHASES: Record<string, string> = {
  "Образование": "Документы", "Подтверждение документов": "Документы",
  "Программа": "Поступление", "Требования вуза": "Поступление", "Сроки": "Поступление",
  "Стипендия": "Стипендия DSU",
  "Статус в Италии": "Виза", "Консульство": "Виза", "Виза D": "Виза", "Финансы": "Виза", "Бюджет": "Виза", "До 18 лет": "Виза", "Призыв": "Виза",
  "Зачисление": "После приезда",
};

export function planStepPhase(title: string) {
  return PHASES[planStepArt(title).label] || "Маршрут";
}

export function planStepArt(title: string) {
  const rule = RULES.find(item => item.test.test(title)) || { label: "Шаг маршрута", art: "map" as const };
  return { label: rule.label, art: rule.art, frame: objectFrame(rule.art, HEIGHTS[rule.art]) };
}
