import Link from "next/link";
import {
  ADMISSION_ROUTES,
  CHANGES,
  CONSULATE_DISCREPANCY,
  DISCLAIMER,
  FAQ,
  MED_EDITORIAL_NOTE,
  MED_PRIVATE_NOTE,
  MED_ROUTES,
  SOURCES,
  STATUSES,
  STATUSES_NOTE,
  VERIFIED_AT,
  VERIFIED_AT_HUMAN,
  type StatusKind,
} from "@/data/changes2026";
import { EditorialBackground } from "@/components/EditorialBackground";
import { IllustrationBackdrop } from "@/components/illustration/IllustrationBackdrop";
import { TUSCANY_HILLS } from "@/data/illustrations";
import { RouteRibbon } from "@/components/RouteRibbon";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Страница «что изменилось в 2026/27».
 *
 * Серверный компонент: ни одного состояния здесь нет, а страница целиком
 * состоит из текста и таблиц — тащить её в клиентский бандл незачем.
 *
 * Статус дедлайна нигде не передаётся одним цветом: у каждой карточки
 * есть слово («завершена», «закрыт», «крайний срок»), и оно читается
 * без цвета — в оттенках серого, дальтоником и диктором одинаково.
 */

/* Цвет — усиление, а не носитель смысла: слово статуса стоит рядом. */
const STATUS_TONE: Record<StatusKind, string> = {
  closed: "border-line bg-cream text-sec-deep",
  ahead: "border-warn/40 bg-warn/5 text-warn-deep",
  deadline: "border-red/30 bg-red/5 text-red-deep",
};

export function ChangesExplorer() {
  return (
    <>
      <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 pt-10 pb-8 sm:pt-14">
        <EditorialBackground variant="guides" grain />
        <IllustrationBackdrop
          asset={TUSCANY_HILLS}
          side="left"
          className="-bottom-6 left-0 w-[72%] opacity-[0.18] sm:w-[min(520px,42%)] sm:opacity-[0.2]"
        />
        <RouteRibbon className="opacity-40" />
        <div className="relative mx-auto max-w-[900px]">
          <p className="text-xs font-semibold tracking-[0.14em] text-sec uppercase">
            Правила приёма · 2026/27
          </p>
          <h1 className="mt-2 font-display text-[8.5vw] leading-[0.95] font-medium tracking-tight uppercase sm:text-[5.5vw] lg:text-[3.4vw]">
            Поступление в Италию в 2026/27: что изменилось
          </h1>

          {/* Дата проверки — не декор: по ней читатель решает, можно ли
             доверять числам. Машиночитаемая в datetime, человеческая в
             тексте. */}
          <p className="mt-5 font-mono text-[11px] tracking-[0.08em] text-sec-deep uppercase">
            Обновлено{" "}
            <time dateTime={VERIFIED_AT} className="text-ink">
              {VERIFIED_AT_HUMAN}
            </time>
          </p>

          <p className="mt-4 max-w-2xl text-base text-ink-soft sm:text-lg">
            В 2026/27 поступление в Италию заметно изменилось: выросла сумма
            финансового обеспечения для студенческой визы, Universitaly
            ограничил число подтверждаемых заявок сверх квоты, для ряда
            англоязычных программ появился CEnT-S, а государственная медицина
            теперь идёт по двум разным маршрутам — через semestre aperto на
            итальянском или IMAT на английском. Ниже — только подтверждённые
            правила и даты.
          </p>

          <p
            role="note"
            className="mt-6 max-w-2xl rounded-md border-2 border-ink bg-paper px-4 py-3 text-sm text-ink"
          >
            <b>Важно:</b> зачисление в университет и выдача визы — разные
            процедуры. Принятие заявки вузом или её валидация в Universitaly не
            гарантирует ни запись в консульство, ни выдачу визы. У университета,
            конкретной программы и консульства могут быть более ранние
            внутренние сроки и дополнительные требования.
          </p>
        </div>
      </section>

      {/* --- статусы --- */}
      <section className="px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="font-display text-heading font-semibold tracking-tight uppercase">
            Главные статусы на {VERIFIED_AT_HUMAN}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STATUSES.map((s) => (
              <Reveal as="li" key={s.title} variant="fade">
                <div className={`h-full rounded-lg border-2 px-4 py-3.5 ${STATUS_TONE[s.kind]}`}>
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase">{s.status}</p>
                  <b className="mt-1 block text-sm text-ink">{s.title}</b>
                  <p className="mt-1.5 text-sm text-ink-soft">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-soft">{STATUSES_NOTE}</p>
        </div>
      </section>

      {/* --- восемь изменений --- */}
      <section className="border-t-2 border-ink bg-paper px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading font-semibold tracking-tight uppercase">
            Восемь изменений
          </h2>
          <ol className="mt-8 flex flex-col gap-10">
            {CHANGES.map((c) => (
              <Reveal as="li" key={c.n} variant="fade">
                <h3 className="flex items-baseline gap-3 font-display text-lg font-semibold">
                  <span className="font-mono text-xs text-red tabular-nums">
                    {String(c.n).padStart(2, "0")}
                  </span>
                  {c.title}
                </h3>
                {c.body.map((p, i) => (
                  <p key={i} className="mt-3 text-sm text-ink-soft">
                    {p}
                  </p>
                ))}
                {c.note && (
                  <p className="mt-3 border-l-2 border-red pl-3 text-sm font-medium text-ink">
                    {c.note}
                  </p>
                )}

                {/* Расхождение с локальными чек-листами стоит рядом с суммой,
                   а не в общем подвале: читать его имеет смысл ровно здесь. */}
                {c.n === 1 && (
                  <p className="mt-3 rounded-md border border-line bg-cream px-3 py-2 text-xs text-ink-soft">
                    {CONSULATE_DISCREPANCY}
                  </p>
                )}

                {/* Седьмое изменение — два маршрута медицины, и их надо
                   видеть рядом, чтобы не перепутать. */}
                {c.n === 7 && (
                  <>
                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      {MED_ROUTES.map((m) => (
                        <div
                          key={m.title}
                          className="rounded-lg border-2 border-ink bg-cream px-4 py-4 shadow-soft-sm"
                        >
                          <p className="font-mono text-[10px] tracking-[0.1em] text-sec-deep uppercase">
                            {m.lang}
                          </p>
                          <b className="mt-1 block font-display text-base">{m.title}</b>
                          {m.body.map((p, i) => (
                            <p key={i} className="mt-2.5 text-sm text-ink-soft">
                              {p}
                            </p>
                          ))}
                          {m.note && (
                            <p className="mt-3 border-l-2 border-line pl-3 text-xs text-ink-soft">
                              {m.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm font-medium text-ink">{MED_PRIVATE_NOTE}</p>
                    <p className="mt-3 rounded-md border border-line bg-cream px-3 py-2 text-xs text-ink-soft">
                      {MED_EDITORIAL_NOTE}
                    </p>
                  </>
                )}
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* --- маршруты --- */}
      <section className="border-t-2 border-ink px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="font-display text-heading font-semibold tracking-tight uppercase">
            Маршруты поступления
          </h2>

          {/* На узком экране таблица превращается в карточки: читать
             четыре колонки мелким шрифтом с горизонтальной прокруткой
             невозможно, а аудитория здесь как раз на телефоне. */}
          <div className="mt-6 grid gap-3 lg:hidden">
            {ADMISSION_ROUTES.map((r) => (
              <div key={r.route} className="rounded-lg border-2 border-ink bg-paper px-4 py-4">
                <b className="block text-sm">{r.route}</b>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.08em] text-sec-deep uppercase">Отбор</dt>
                    <dd className="text-ink-soft">{r.selection}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.08em] text-sec-deep uppercase">
                      Universitaly и виза для non-EU abroad
                    </dt>
                    <dd className="text-ink-soft">{r.visa}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.08em] text-sec-deep uppercase">
                      Предостережение
                    </dt>
                    <dd className="text-ink-soft">{r.warning}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="mt-6 hidden lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Маршруты поступления: отбор, требования Universitaly и визы, предостережения
              </caption>
              <thead>
                <tr className="border-b-2 border-ink">
                  {["Маршрут", "Отбор", "Universitaly и виза для non-EU abroad", "Главное предостережение"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="py-3 pr-4 font-mono text-[10px] font-normal tracking-[0.08em] text-sec-deep uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ADMISSION_ROUTES.map((r) => (
                  <tr key={r.route} className="border-b border-line align-top">
                    <th scope="row" className="py-4 pr-4 font-semibold">
                      {r.route}
                    </th>
                    <td className="py-4 pr-4 text-ink-soft">{r.selection}</td>
                    <td className="py-4 pr-4 text-ink-soft">{r.visa}</td>
                    <td className="py-4 text-ink-soft">{r.warning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="border-t-2 border-ink bg-paper px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading font-semibold tracking-tight uppercase">
            Частые вопросы
          </h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="text-sm font-bold">{f.q}</dt>
                <dd className="mt-1.5 text-sm text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --- источники и дисклеймер --- */}
      <section className="border-t-2 border-ink px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading font-semibold tracking-tight uppercase">
            Первичные источники
          </h2>
          <ol className="mt-6 space-y-2 text-sm">
            {SOURCES.map((s, i) => (
              <li key={s.url} className="flex gap-3">
                <span className="font-mono text-[11px] text-sec-deep tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ol>

          <p className="mt-8 rounded-md border-2 border-ink bg-cream px-4 py-3.5 text-sm text-ink-soft">
            {DISCLAIMER}
          </p>

          <p className="mt-6 text-sm text-ink-soft">
            Что делать дальше:{" "}
            <Link href="/guides" className="font-semibold text-ink underline underline-offset-4">
              справочник по документам и визе
            </Link>
            ,{" "}
            <Link href="/universities" className="font-semibold text-ink underline underline-offset-4">
              карта университетов
            </Link>{" "}
            или{" "}
            <Link href="/plan" className="font-semibold text-ink underline underline-offset-4">
              бесплатный разбор ситуации
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
