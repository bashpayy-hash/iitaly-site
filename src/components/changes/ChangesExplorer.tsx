import Link from "next/link";
import { SourceRefs } from "@/components/SourceRefs";
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
import disclosure from "@/components/ui/disclosure.module.css";

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

/* Разгрузка (owner, 5 Nov: «перепроверь перегрузы информации»): страница
   читается как оглавление. Одиннадцать правил, вопросы и список источников —
   раскрывающиеся строки (GOV.UK details): заголовок правила уже говорит
   главное, подробности и источник — по нажатию. Тексты и факты прежние;
   ушли номера «01–11», капс и моно-подписи по 11px. Поиск по странице
   браузер раскрывает сам. Знак раскрытия — общий плюс (ui/disclosure). */
const SUMMARY = `${disclosure.row} rounded-[14px] py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red`;
const STATUS_TONE: Record<StatusKind, string> = {
  closed: "bg-[#F1ECE3] text-sec-deep",
  ahead: "bg-[#F6E7D2] text-warn-deep",
  deadline: "bg-[#F4DED8] text-red-deep",
};

export function ChangesExplorer() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#DCD5CA] bg-cream px-5 md:px-6 pt-10 pb-8 sm:pt-14">
        <EditorialBackground variant="guides" grain />
        <IllustrationBackdrop
          asset={TUSCANY_HILLS}
          side="left"
          className="-bottom-6 left-0 w-[72%] opacity-[0.18] sm:w-[min(520px,42%)] sm:opacity-[0.2]"
        />
        <RouteRibbon className="opacity-40" />
        <div className="relative mx-auto max-w-[900px]">
          <p className="text-sm font-medium text-sec-deep">
            Казахстан — Италия · 2026/27 и 2027/28
          </p>
          <h1 className="mt-2 font-apple-display text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">
            Поступление в Италию: актуальные правила
          </h1>

          {/* Дата проверки — не декор: по ней читатель решает, можно ли
             доверять числам. Машиночитаемая в datetime, человеческая в
             тексте. */}
          <p className="mt-4 text-sm text-sec-deep">
            Обновлено{" "}
            <time dateTime={VERIFIED_AT} className="text-ink">
              {VERIFIED_AT_HUMAN}
            </time>
          </p>

          <p className="mt-4 max-w-2xl text-base text-ink-soft sm:text-lg">
            Аттестат, документы, DSU, виза и первые недели в Италии.
            Здесь собраны проверенные изменения для Казахстана и уже
            опубликованные условия 2027/28. У каждого правила — источник
            и область применения.
          </p>

          <p
            role="note"
            className="mt-6 max-w-2xl rounded-[20px] bg-[#FFFDF9] px-5 py-4 text-sm text-ink"
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
      <section className="px-5 md:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="font-apple-display text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[34px]">
            Главные статусы на {VERIFIED_AT_HUMAN}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STATUSES.map((s) => (
              <Reveal as="li" key={s.title} variant="fade">
                <div className={`h-full rounded-[20px] px-5 py-4 ${STATUS_TONE[s.kind]}`}>
                  <p className="text-[13px] font-semibold">{s.status}</p>
                  <b className="mt-1 block text-sm text-ink">{s.title}</b>
                  <p className="mt-1.5 text-sm text-ink-soft">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-soft">{STATUSES_NOTE}</p>
        </div>
      </section>

      {/* --- одиннадцать правил: оглавление из раскрывающихся строк --- */}
      <section className="border-t border-[#DCD5CA] bg-paper px-5 md:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-apple-display text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[34px]">
            Что учитывать при подаче
          </h2>
          <p className="mt-3 text-base text-ink-soft">
            Открой правило — внутри подробности и ссылка на источник.
          </p>
          <ol className="mt-6 divide-y divide-line border-y border-line" data-change-rules>
            {CHANGES.map((c) => (
              <li key={c.n}>
                <details className="group" data-change-rule>
                  <summary className={SUMMARY}>
                    <h3 className="font-apple-display text-[17px] font-semibold leading-snug sm:text-lg">{c.title}</h3>
                  </summary>
                  <div className="pb-6">
                    {c.body.map((p, i) => (
                      <p key={i} className={`${i ? "mt-3" : ""} text-[15px] leading-relaxed text-ink-soft`}>
                        {p}
                      </p>
                    ))}
                    {c.note && (
                      <p className="mt-3 border-l-2 border-red pl-3 text-[15px] font-medium text-ink">
                        {c.note}
                      </p>
                    )}

                    {/* Расхождение с локальными чек-листами стоит рядом с суммой,
                       а не в общем подвале: читать его имеет смысл ровно здесь. */}
                    {c.n === 1 && (
                      <p className="mt-3 rounded-[14px] bg-[#F1ECE3] px-3 py-2 text-sm text-ink-soft">
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
                              className="rounded-[20px] bg-[#F1ECE3] px-5 py-4"
                            >
                              <p className="text-[13px] font-semibold text-sec-deep">{m.lang}</p>
                              <b className="mt-1 block font-apple-display text-base">{m.title}</b>
                              {m.body.map((p, i) => (
                                <p key={i} className="mt-2.5 text-sm text-ink-soft">
                                  {p}
                                </p>
                              ))}
                              {m.note && (
                                <p className="mt-3 border-l-2 border-line pl-3 text-sm text-ink-soft">
                                  {m.note}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 text-sm font-medium text-ink">{MED_PRIVATE_NOTE}</p>
                        <p className="mt-3 rounded-[14px] bg-[#F1ECE3] px-3 py-2 text-sm text-ink-soft">
                          {MED_EDITORIAL_NOTE}
                        </p>
                      </>
                    )}
                    <SourceRefs ids={c.sources} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --- маршруты --- */}
      <section className="border-t border-[#DCD5CA] px-5 md:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="font-apple-display text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[34px]">
            Маршруты поступления
          </h2>

          {/* На узком экране таблица превращается в карточки: читать
             четыре колонки мелким шрифтом с горизонтальной прокруткой
             невозможно, а аудитория здесь как раз на телефоне. */}
          <div className="mt-6 grid gap-3 lg:hidden">
            {ADMISSION_ROUTES.map((r) => (
              <div key={r.route} className="rounded-[20px] bg-[#FFFDF9] px-5 py-4">
                <b className="block text-base">{r.route}</b>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-[13px] font-semibold text-sec-deep">Отбор</dt>
                    <dd className="text-ink-soft">{r.selection}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] font-semibold text-sec-deep">
                      Universitaly и виза для non-EU abroad
                    </dt>
                    <dd className="text-ink-soft">{r.visa}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] font-semibold text-sec-deep">
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
                <tr className="border-b border-[#CFC6BA]">
                  {["Маршрут", "Отбор", "Universitaly и виза для non-EU abroad", "Главное предостережение"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="py-3 pr-4 text-[13px] font-semibold text-sec-deep"
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
      <section className="border-t border-[#DCD5CA] bg-paper px-5 md:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-apple-display text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[34px]">
            Частые вопросы
          </h2>
          <div className="mt-6 divide-y divide-line border-y border-line" data-change-faq>
            {FAQ.map((f) => (
              <details key={f.q} className="group">
                <summary className={SUMMARY}>
                  <span className="text-base font-semibold">{f.q}</span>
                </summary>
                <p className="pb-5 text-[15px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* --- источники и дисклеймер --- */}
      <section className="border-t border-[#DCD5CA] px-5 md:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-apple-display text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[34px]">
            Первичные источники
          </h2>
          <details className="group mt-4 border-y border-line" data-change-sources>
            <summary className={SUMMARY}>
              <span className="text-base font-semibold">Все ссылки на официальные страницы · {SOURCES.length}</span>
            </summary>
            <ul className="space-y-2.5 pb-5 text-[15px]">
              {SOURCES.map((s) => (
                <li key={s.url}>
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
            </ul>
          </details>

          <p className="mt-8 rounded-[20px] bg-[#F1ECE3] px-5 py-4 text-sm text-ink-soft">
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
