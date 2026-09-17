import { CITIES, type University } from "@/data/italy";

export type ComparisonRow = {
  id: string;
  label: string;
  value: (university: University, months: number) => string;
};

/** Convert only explicitly formatted monthly estimates; never turn a floor into a fixed price. */
export function livingEstimate(value: string, months: number): string {
  if (months !== 10 && months !== 12) return "Не рассчитано";
  const text = value.replace(/[\s\u00a0\u202f]/g, "");
  const range = /^(от)?€(\d+)(?:[–—-](\d+))?\/мес$/.exec(text);
  if (!range) return "Уточнить бюджет";
  const format = (n: string) => new Intl.NumberFormat("ru-RU").format(Number(n) * months);
  if (range[1]) return `от €${format(range[2])}`;
  return range[3] ? `€${format(range[2])}–${format(range[3])}` : `около €${format(range[2])}`;
}

export const COMPARISON_GROUPS: { title: string; rows: ComparisonRow[] }[] = [
  { title: "Город и обучение", rows: [
    { id: "city", label: "Город", value: u => CITIES[u.city].name },
    { id: "region", label: "Регион", value: u => CITIES[u.city].region.split(" · ")[0] },
    { id: "profile", label: "Тип и профиль", value: u => u.tp },
    { id: "strengths", label: "Сильные направления", value: u => u.strong },
    { id: "english", label: "Программы на английском", value: u => u.eng ? "Есть отметка в базе; язык конкретной программы нужно проверить" : "Не отмечено в базе — уточнить у вуза" },
    { id: "medicine", label: "Медицина", value: u => u.med ? "Есть отметка в базе; уточнить программу и язык" : "Не отмечено в базе — это не означает, что программы нет" },
  ]},
  { title: "Поступление", rows: [
    { id: "exam", label: "Экзамен или отбор", value: u => u.test },
    { id: "deadline", label: "Сроки подачи · по базе", value: u => u.dl },
  ]},
  { title: "Бюджет и поддержка", rows: [
    { id: "tuition", label: "Стоимость обучения · по базе", value: u => u.tu },
    { id: "living", label: "Жизнь в месяц", value: u => u.life },
    { id: "period", label: "Жизнь за выбранный период", value: (u, months) => livingEstimate(u.life, months) },
    { id: "support", label: "Стипендии и льготы · по базе", value: u => u.dsu },
  ]},
];
