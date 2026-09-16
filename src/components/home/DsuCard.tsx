import { AppleEyebrow } from "@/components/apple/Typography";

/**
 * Единственное место на главной, где звучит сумма стипендии DSU.
 *
 * Раньше здесь стоял блок «Цифры, а не обещания» — четыре метрики в ряд,
 * и €7 557 повторялись ещё и в шагах воронки. Так цифра перестаёт быть
 * аргументом: плакат из четырёх чисел читается как оформление, а не как
 * факт, а повтор той же суммы в двух местах на одном экране выглядит
 * попыткой додавить.
 *
 * Теперь одна инвертированная карточка Origin: светлое серебро на белом
 * холсте, одна цифра, одна оговорка. Таких карточек на страницу
 * разрешено максимум одна-две; на главной она ровно одна.
 *
 * Оговорка про «потолок в Риме» стоит не мелким шрифтом в сноске, а в
 * самой карточке тем же кеглем, что и пояснение: это не дисклеймер ради
 * юристов, это часть факта — сумма зависит от города и дохода семьи, и
 * человек должен прочитать её вместе с числом, а не после.
 */
export function DsuCard() {
  return (
    <section className="bg-white px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-[980px]">
        <div className="rounded-apple-card bg-silver/45 px-6 py-12 text-center sm:px-16 sm:py-16">
          <AppleEyebrow as="p" className="text-graphite">
            Стипендия DSU
          </AppleEyebrow>
          <p className="mt-5 font-apple-display font-light text-[56px] leading-none text-carbon tabular-nums sm:text-[84px]">
            до €7 557
          </p>
          <p className="mx-auto mt-6 max-w-[34rem] font-apple-text text-apple-body text-graphite">
            В год — это потолок в Риме. Сумма зависит от города, состава и
            дохода семьи: её считают по ISEE parificato, и в каждом регионе
            своя шкала. Сколько выходит именно у тебя — покажет план.
          </p>
        </div>
      </div>
    </section>
  );
}
