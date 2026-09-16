import { CITIES, UNIS, type CityId } from "./italy";

/**
 * Подбор города по образу жизни — четыре вопроса и детерминированный счёт.
 *
 * Это НЕ второй квиз поступления. Здесь нет ни CIMEA, ни дохода семьи, ни
 * аттестата: тот разговор идёт на /plan и повторять его здесь незачем.
 * Здесь один вопрос — как человек хочет прожить семестр, — и ответ на него
 * не меняет ни одной цифры в базе.
 *
 * Модели тут тоже нет. Четыре ответа складываются в счёт по таблице весов,
 * и одинаковые ответы всегда дают одинаковый результат: клик по варианту
 * должен отвечать мгновенно и одинаково, а не ходить в сеть.
 *
 * Города берутся ИСКЛЮЧИТЕЛЬНО из CITIES — те же 30, что на карте. Ни
 * Амальфи, ни Позитано, ни Комо здесь нет и быть не может: это не города
 * с университетами, а открытки.
 */

/** Рельеф вокруг города. Море — если город стоит на воде или в получасе от неё. */
export type Terrain = "sea" | "mountains" | "inland";

/**
 * Транспорт.
 * hub — станция на скоростной оси, откуда выходные в другом городе стоят
 *       пары часов. Помечены ровно четыре: Милан, Рим, Болонья, Флоренция.
 *       Турин и Падуя тоже на скоростной линии, но узлами в полном смысле
 *       не являются, и раздувать список значило бы обесценить метку.
 * far  — остров или долгая дорога: паром, самолёт, край страны.
 */
export type Travel = "hub" | "far" | "normal";

/** Как город давит на учёбу: intense — сам требует темпа, calm — не мешает. */
export type Pace = "intense" | "mixed" | "calm";

/**
 * Темп города. Намеренно НЕ «север работает, юг опаздывает» — это
 * стереотип, а не факт. Здесь только про плотность дня: clockwork —
 * расписание держится, lively — жизнь громче расписания.
 */
export type Tempo = "clockwork" | "lively" | "any";

export interface CityTags {
  terrain: Terrain;
  travel: Travel;
  pace: Pace;
  tempo: Tempo;
}

/**
 * Таблица города → теги.
 *
 * Расставлена по географии и по тому, что уже написано в CITIES.region и в
 * карточках вузов, а не по вкусу: Тренто в Доломитах — mountains, Бари
 * порт на Адриатике — sea, Кальяри на Сардинии — far.
 *
 * pace=intense стоит там, где сам вуз задаёт темп (Politecnico, Bocconi,
 * Sapienza, Alma Mater) — это видно по карточкам в UNIS, а не выдумано.
 */
export const CITY_TAGS: Record<CityId, CityTags> = {
  torino:   { terrain: "mountains", travel: "normal", pace: "intense", tempo: "clockwork" },
  pavia:    { terrain: "inland",    travel: "normal", pace: "mixed",   tempo: "clockwork" },
  milano:   { terrain: "inland",    travel: "hub",    pace: "intense", tempo: "clockwork" },
  bergamo:  { terrain: "mountains", travel: "normal", pace: "mixed",   tempo: "clockwork" },
  brescia:  { terrain: "mountains", travel: "normal", pace: "mixed",   tempo: "clockwork" },
  trento:   { terrain: "mountains", travel: "normal", pace: "calm",    tempo: "clockwork" },
  verona:   { terrain: "inland",    travel: "normal", pace: "mixed",   tempo: "clockwork" },
  padova:   { terrain: "inland",    travel: "normal", pace: "mixed",   tempo: "clockwork" },
  venezia:  { terrain: "sea",       travel: "normal", pace: "mixed",   tempo: "lively" },
  udine:    { terrain: "mountains", travel: "normal", pace: "calm",    tempo: "clockwork" },
  trieste:  { terrain: "sea",       travel: "normal", pace: "mixed",   tempo: "clockwork" },
  genova:   { terrain: "sea",       travel: "normal", pace: "mixed",   tempo: "lively" },
  parma:    { terrain: "inland",    travel: "normal", pace: "mixed",   tempo: "clockwork" },
  modena:   { terrain: "inland",    travel: "normal", pace: "mixed",   tempo: "clockwork" },
  ferrara:  { terrain: "inland",    travel: "normal", pace: "calm",    tempo: "clockwork" },
  bologna:  { terrain: "inland",    travel: "hub",    pace: "intense", tempo: "lively" },
  pisa:     { terrain: "sea",       travel: "normal", pace: "mixed",   tempo: "any" },
  firenze:  { terrain: "mountains", travel: "hub",    pace: "intense", tempo: "any" },
  siena:    { terrain: "mountains", travel: "normal", pace: "calm",    tempo: "any" },
  perugia:  { terrain: "mountains", travel: "normal", pace: "calm",    tempo: "any" },
  camerino: { terrain: "mountains", travel: "far",    pace: "calm",    tempo: "any" },
  ancona:   { terrain: "sea",       travel: "normal", pace: "calm",    tempo: "any" },
  roma:     { terrain: "inland",    travel: "hub",    pace: "intense", tempo: "lively" },
  napoli:   { terrain: "sea",       travel: "normal", pace: "mixed",   tempo: "lively" },
  salerno:  { terrain: "sea",       travel: "normal", pace: "calm",    tempo: "lively" },
  bari:     { terrain: "sea",       travel: "normal", pace: "calm",    tempo: "lively" },
  cagliari: { terrain: "sea",       travel: "far",    pace: "calm",    tempo: "lively" },
  palermo:  { terrain: "sea",       travel: "far",    pace: "calm",    tempo: "lively" },
  messina:  { terrain: "sea",       travel: "far",    pace: "calm",    tempo: "lively" },
  catania:  { terrain: "sea",       travel: "far",    pace: "mixed",   tempo: "lively" },
};

export type AnswerId =
  | "pace-intense" | "pace-mixed" | "pace-calm"
  | "travel-stay" | "travel-weekends" | "travel-far"
  | "tempo-clockwork" | "tempo-lively" | "tempo-any"
  | "terrain-sea" | "terrain-mountains" | "terrain-none";

export interface Question {
  id: "pace" | "travel" | "tempo" | "terrain";
  title: string;
  options: { id: AnswerId; label: string; hint?: string }[];
}

/** Четыре вопроса, не шесть. Формулировки сжаты, смысл не тронут. */
export const QUESTIONS: Question[] = [
  {
    id: "pace",
    title: "Как хочешь провести семестр?",
    options: [
      { id: "pace-intense", label: "Жёсткая учёба", hint: "город не мешает и не отвлекает" },
      { id: "pace-mixed", label: "Пополам", hint: "пары и жизнь в равных долях" },
      { id: "pace-calm", label: "Спокойно", hint: "чтобы дышалось" },
    ],
  },
  {
    id: "travel",
    title: "Насколько хочешь мотаться по стране?",
    options: [
      { id: "travel-stay", label: "Почти не выезжать", hint: "один город, и хватит" },
      { id: "travel-weekends", label: "Выходные в других городах", hint: "нужен узел на скоростной линии" },
      { id: "travel-far", label: "Остров, и долго добираться — ок", hint: "паром или самолёт не пугают" },
    ],
  },
  {
    id: "tempo",
    title: "Какой темп города тебе ок?",
    options: [
      { id: "tempo-clockwork", label: "Чёткий", hint: "всё по часам" },
      { id: "tempo-lively", label: "Живой и шумный", hint: "не всё по расписанию" },
      { id: "tempo-any", label: "Без разницы" },
    ],
  },
  {
    id: "terrain",
    title: "Горы или море?",
    options: [
      { id: "terrain-sea", label: "Море", hint: "побережье, порт, вода рядом" },
      { id: "terrain-mountains", label: "Горы и холмы" },
      { id: "terrain-none", label: "Город", hint: "пейзаж не важен" },
    ],
  },
];

export type Answers = Partial<Record<Question["id"], AnswerId>>;

/**
 * Веса. Сознательно грубые и в одном диапазоне: ответ про рельеф не должен
 * весить вдвое больше ответа про темп, иначе три вопроса из четырёх
 * превращаются в украшение.
 *
 * Отрицательные веса важнее положительных: они убирают из выдачи города,
 * которые человек явно не хотел (остров при «почти не выезжать»), и без
 * них верх списка занимают крупные города просто потому, что их много.
 */
function score(city: CityId, a: Answers): number {
  const t = CITY_TAGS[city];
  let s = 0;

  if (a.pace === "pace-intense") s += t.pace === "intense" ? 3 : t.pace === "mixed" ? 1 : -2;
  if (a.pace === "pace-mixed") s += t.pace === "mixed" ? 3 : 1;
  if (a.pace === "pace-calm") s += t.pace === "calm" ? 3 : t.pace === "mixed" ? 1 : -2;

  if (a.travel === "travel-stay") s += t.travel === "far" ? -3 : t.travel === "hub" ? 0 : 2;
  if (a.travel === "travel-weekends") s += t.travel === "hub" ? 3 : t.travel === "far" ? -3 : 1;
  if (a.travel === "travel-far") s += t.travel === "far" ? 3 : 0;

  if (a.tempo === "tempo-clockwork") s += t.tempo === "clockwork" ? 2 : t.tempo === "any" ? 1 : -1;
  if (a.tempo === "tempo-lively") s += t.tempo === "lively" ? 2 : t.tempo === "any" ? 1 : -1;
  if (a.tempo === "tempo-any") s += 1;

  if (a.terrain === "terrain-sea") s += t.terrain === "sea" ? 3 : -1;
  if (a.terrain === "terrain-mountains") s += t.terrain === "mountains" ? 3 : -1;
  if (a.terrain === "terrain-none") s += 1;

  return s;
}

/** Одна строка «почему», собранная из совпавших тегов. Не вода, а перечень. */
function reason(city: CityId, a: Answers): string {
  const t = CITY_TAGS[city];
  const bits: string[] = [];
  if (a.terrain === "terrain-sea" && t.terrain === "sea") bits.push("на море");
  if (a.terrain === "terrain-mountains" && t.terrain === "mountains") bits.push("в холмах");
  if (a.travel === "travel-weekends" && t.travel === "hub") bits.push("узел скоростных поездов");
  if (a.travel === "travel-far" && t.travel === "far") bits.push("остров, добираться долго");
  if (a.travel === "travel-stay" && t.travel !== "far") bits.push("всё в пешей доступности");
  if (a.pace === "pace-intense" && t.pace === "intense") bits.push("темп задаёт сам вуз");
  if (a.pace === "pace-calm" && t.pace === "calm") bits.push("город не подгоняет");
  if (a.pace === "pace-mixed" && t.pace === "mixed") bits.push("пары и жизнь пополам");
  if (a.tempo === "tempo-clockwork" && t.tempo === "clockwork") bits.push("день по расписанию");
  if (a.tempo === "tempo-lively" && t.tempo === "lively") bits.push("громкий и живой");
  // Без совпадений строки не бывает: тогда это wildcard, и он объясняется иначе.
  return bits.length ? bits.join(" · ") : "другой вариант, чтобы было с чем сравнить";
}

export interface CityMatch {
  city: CityId;
  name: string;
  region: string;
  why: string;
  /** До двух вузов из базы — больше карточка не вмещает без превращения в список. */
  unis: { name: string; dsu: string }[];
  wildcard: boolean;
}

function pack(city: CityId, a: Answers, wildcard: boolean): CityMatch {
  const unis = UNIS.filter((u) => u.city === city).slice(0, 2);
  return {
    city,
    name: CITIES[city].name,
    region: CITIES[city].region,
    why: wildcard ? "Не по ответам — для контраста" : reason(city, a),
    unis: unis.map((u) => ({ name: u.name, dsu: u.dsu })),
    wildcard,
  };
}

/**
 * Топ-2 по счёту плюс третий контрастный.
 *
 * Третий берётся из НИЖНЕЙ половины списка и обязательно с другим
 * рельефом, чем лидер: смысл wildcard в том, чтобы показать вариант, до
 * которого человек не додумался, а «третий по счёту» отличается от первого
 * на балл и ничего нового не показывает.
 */
export function matchCities(a: Answers): CityMatch[] {
  const ranked = (Object.keys(CITY_TAGS) as CityId[])
    .map((c) => ({ c, s: score(c, a) }))
    .sort((x, y) => y.s - x.s || CITIES[x.c].name.localeCompare(CITIES[y.c].name, "ru"));

  const top = ranked.slice(0, 2).map((r) => pack(r.c, a, false));
  const leadTerrain = CITY_TAGS[ranked[0].c].terrain;
  const wild = ranked
    .slice(Math.floor(ranked.length / 2))
    .find((r) => CITY_TAGS[r.c].terrain !== leadTerrain && UNIS.some((u) => u.city === r.c));

  return wild ? [...top, pack(wild.c, a, true)] : top;
}

/**
 * Разворот скетчбука под ответ про рельеф.
 *
 * Индексы — по PLATES (data/sketchbook.ts): 2 — «Холмы и кипарисы»
 * (Тоскана), 4/5/6 — три побережья, 3 — «Руины под облаками» (Рим).
 * Восьмого разворота не появляется: выбираем из существующих семи.
 */
export function plateForAnswers(a: Answers, city: CityId): number | null {
  const t = CITY_TAGS[city];
  if (t.terrain === "sea") {
    // Три побережья разные: скалы, волны, склон. Берём тот, где город назван.
    if (city === "salerno") return 4;
    if (city === "bari" || city === "cagliari" || city === "messina") return 5;
    if (city === "palermo" || city === "catania") return 6;
    return 5;
  }
  if (t.terrain === "mountains") return 2;
  if (city === "roma") return 3;
  return null;
}
