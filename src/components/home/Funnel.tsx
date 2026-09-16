import { AppleButtonLink } from "@/components/apple/Button";
import { AppleEyebrow } from "@/components/apple/Typography";
import { Applicant } from "@/components/character/Applicant";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";

/**
 * Воронка: пять шагов одним треком во всю ширину.
 *
 * Почему трек, а не сетка. Раньше это были две узкие колонки по два шага —
 * читается как четыре независимые карточки, а не как путь. Путь обязан
 * идти в одну сторону, поэтому здесь горизонтальная лента с линией,
 * прошивающей все номера: на десктопе в строку, на телефоне в столбец, но
 * линия остаётся и там.
 *
 * Почему на обсидиане. Небо первого экрана заканчивается ровно этим
 * цветом (#0f1011, последний стоп градиента) — полоса подхватывает его
 * без шва, и переход от экрана к воронке читается как продолжение одной
 * сцены, а не как начало второй страницы.
 *
 * Текст на тёмном набран ash-dark, а не белым: чистый #fff на обсидиане
 * даёт контраст около 19:1 и на длинной строке начинает слепить.
 * Заголовки шагов остаются светлыми — им нужен вес, они короткие.
 *
 * Обещаний в шагах нет: ни «хит», ни повторённой суммы стипендии. Цифра
 * DSU на главной звучит ровно один раз и не здесь — см. DsuCard.
 */
const STEPS = [
  { n: "01", title: "Бесплатно · 10 минут", body: "Шесть вопросов о себе — и план с шансами на стипендию на руках." },
  { n: "02", title: "План и вузы", body: "Подходящие программы, сроки подачи и что считать по деньгам." },
  { n: "03", title: `Оплата ${priceLabel(PRICE_MAIN)}`, body: "Один платёж, без подписки. Кабинет открывается сразу." },
  { n: "04", title: "Документы и виза", body: "Аттестат, CIMEA, Universitaly, досье на визу D — по очереди." },
  { n: "05", title: "Посадка", body: "Вылет и первые недели: codice fiscale, kit giallo, Questura." },
];

export function Funnel() {
  return (
    <section className="relative overflow-hidden bg-obsidian px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-[40rem]">
          <AppleEyebrow as="p" className="text-ash-dark">
            Как это устроено
          </AppleEyebrow>
          <h2 className="mt-4 font-whisper text-[34px] leading-[1.05] font-normal text-white sm:text-[52px]">
            От вопроса до посадки в самолёт
          </h2>
        </div>

        {/* Линия трека. На десктопе она горизонтальная и проходит по центру
           номеров; ниже lg — вертикальная вдоль левого края. Рисуется
           фоном отдельного слоя, а не рамками карточек: рамки дали бы пять
           отрезков с зазорами, а нужен один непрерывный путь. */}
        <ol className="relative mt-12 grid gap-y-8 lg:grid-cols-5 lg:gap-x-6">
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-[13px] w-px bg-white/15 lg:top-[13px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto"
          />
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative pl-10 lg:pt-10 lg:pl-0">
              {/* Точка на линии. Первая — rosso: это шаг, который человек
                 делает прямо сейчас, и он единственный активный. */}
              <span
                aria-hidden
                className={`absolute top-1 left-[7px] h-3.5 w-3.5 rounded-full lg:top-[7px] lg:left-0 ${
                  i === 0 ? "bg-rosso" : "bg-white/25"
                }`}
              />
              <span
                className={`font-mono-eyebrow text-[12px] tracking-[0.14em] ${
                  i === 0 ? "text-rosso" : "text-ash-dark"
                }`}
              >
                {s.n}
              </span>
              <p className="mt-2 font-apple-text text-apple-subheading font-normal text-white">
                {s.title}
              </p>
              <p className="mt-2 max-w-[22rem] font-apple-text text-apple-body-sm text-ash-dark">
                {s.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          {/* На тёмном максимальный контраст даёт белая заливка, а не
             rosso: то же правило «одно действие — одно пятно», просто
             инвертированное вместе с фоном. */}
          <AppleButtonLink
            href="/plan"
            variant="inverted"
            className="px-8"
          >
            Составить план
          </AppleButtonLink>
          <p className="font-apple-text text-apple-body-sm text-ash-dark">
            Бесплатно, без регистрации и без звонка менеджера.
          </p>
        </div>
      </div>

      {/* Персонаж идёт по золотому полю у правого края.
         Поле нарисовано ПОВЕРХ фигуры (z-10 против z-0) и срезает ей ноги —
         это и есть приём из референса; положи поле под фигуру, и получится
         просто картинка на цветном прямоугольнике.

         Поле не во всю ширину обёртки, а узкой полосой с отступом справа:
         прямоугольник от края до края читался как заливка секции, а не
         как пятно, на котором стоит человек. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[5%] bottom-0 hidden w-[212px] xl:block"
      >
        <Applicant pose="walk" className="relative z-0 mx-auto w-[152px]" />
        <div className="relative z-10 -mt-[26px] h-[58px] w-full rounded-t-[3px] bg-yolk" />
      </div>
    </section>
  );
}
