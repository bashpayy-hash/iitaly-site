import { cartoucheFrame } from "@/components/guides/guideArt";

/* Ярлык и картинка шага плана — по названию шага. Это только представление:
   данные плана (src/lib/planBuilder.ts) не меняются и остаются под защитой.
   С 19 ноября у шагов не студийные предметы, а картуши с пола Галереи — тот
   же набор, что в справочнике, визе и на главной (owner, на скриншоте плана:
   «вот они сильно выбиваются из общей картины, нужны изменения»). Соседние
   шаги не повторяют рамку (design/illustrations/cartouche-2026-11-19.json). */
type Cartouche = "diploma" | "folder" | "tests" | "doc-check" | "alarm" | "coins" | "permesso-card" | "stamp-pad" | "passport" | "suitcase" | "minors" | "military" | "keys" | "route-map";

const RULES: { test: RegExp; label: string; art: Cartouche }[] = [
  { test: /магистратур|11-летн|NIS|IB \/ A-levels|колледж|год университета|квалификац/i, label: "Образование", art: "diploma" },
  { test: /DoV|CIMEA/, label: "Подтверждение документов", art: "folder" },
  { test: /программу, тест и язык/i, label: "Программа", art: "tests" },
  { test: /язык и академические/i, label: "Требования вуза", art: "doc-check" },
  { test: /календарь/i, label: "Сроки", art: "alarm" },
  { test: /DSU/, label: "Стипендия", art: "coins" },
  { test: /статус в Италии/i, label: "Статус в Италии", art: "permesso-card" },
  { test: /консульство/i, label: "Консульство", art: "stamp-pad" },
  { test: /визу D/i, label: "Виза D", art: "passport" },
  { test: /финансирование/i, label: "Финансы", art: "coins" },
  { test: /запас/i, label: "Бюджет", art: "suitcase" },
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
  const rule = RULES.find(item => item.test.test(title)) || { label: "Шаг маршрута", art: "route-map" as const };
  return { label: rule.label, art: rule.art, frame: cartoucheFrame(rule.art) };
}
