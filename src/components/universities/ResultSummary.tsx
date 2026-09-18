import ui from "./university-ui.module.css";

/**
 * Строка результата под фильтрами.
 *
 * До неё фильтры работали молча: человек нажимал «Технические», карта
 * перекрашивала точки, список в панели города менялся — и нигде не было
 * сказано, сколько вузов осталось. Зрячий догадывался по карте, читающий
 * с экрана не получал ничего: aria-live на странице не было вообще.
 *
 * Поэтому регион один и служит обоим — видимый счётчик и есть та самая
 * озвучиваемая область. Отдельный sr-only-дублёр означал бы два
 * источника правды, которые рано или поздно разойдутся.
 *
 * polite, а не assertive: фильтр — не ошибка и не срочность, он не
 * должен перебивать то, что диктор читает сейчас.
 */
function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function ResultSummary({
  unis,
  cities,
  filtered,
}: {
  unis: number;
  cities: number;
  filtered: boolean;
}) {
  return (
    <p
      aria-live="polite"
      className={ui.resultSummary}
    >
      {unis === 0 ? (
        "Под эти фильтры не подходит ни один вуз"
      ) : (
        <>
          {filtered ? "Подходит" : "Всего"} {unis}{" "}
          {plural(unis, "университет", "университета", "университетов")} в {cities}{" "}
          {plural(cities, "городе", "городах", "городах")}
        </>
      )}
    </p>
  );
}
