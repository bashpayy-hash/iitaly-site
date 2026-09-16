import { AppleHeading, AppleBody, AppleCaption } from "@/components/apple/Typography";
import { AppleButtonLink } from "@/components/apple/Button";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";

const STAGES = [
  {
    n: "1",
    title: "Бесплатно · 10 минут",
    body: "Отвечаешь на 6 вопросов о своей ситуации или загружаешь документ на проверку. Видишь план и шансы на стипендию сразу, без оплаты.",
    time: "сегодня",
  },
  {
    n: "2",
    title: `Оплата ${priceLabel(PRICE_MAIN)}`,
    body: "Один платёж, без подписки. Личный кабинет открывается сразу — код доступа приходит в WhatsApp в течение часа.",
    time: "сразу после оплаты",
  },
  {
    n: "3",
    title: "Маршрут и документы",
    body: "Персональный чек-лист по стадиям — аттестат и CIMEA, Universitaly, стипендия DSU. Каждый документ проверяет ИИ до подачи.",
    time: "CIMEA 30–60 дней · Universitaly май–июль · DSU до приезда",
  },
  {
    n: "4",
    title: "Виза, вылет и первые недели",
    body: "Досье на визу D собираем заранее. После прилёта кабинет ведёт первые шаги в Италии: codice fiscale, kit giallo, Questura.",
    time: "рассмотрение визы до 90 дней",
  },
];

/**
 * data-section="how" — вторая глава главной. Заголовок закреплён на часть
 * высоты секции (PINNED DISPLAY), карточки этапов едут чуть быстрее скролла
 * — см. ScrollTransitions.tsx. На мобилке/reduced-motion pin не включается,
 * секция просто стоит статично — вёрстка ничего не теряет без него.
 */
export function HowItWorks() {
  return (
    <section data-section="how" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-[980px]">
        <div data-role="heading" className="pb-6 text-center">
          <AppleCaption as="p" className="text-center">Как проходит работа с нами</AppleCaption>
          <AppleHeading as="h2" className="mt-3 text-center">
            От вопроса до посадки в самолёт
          </AppleHeading>
        </div>

        <div data-role="content" className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {STAGES.map((s) => (
            <div key={s.n} className="border-t border-white/15 pt-5">
              <span className="font-apple-display text-apple-heading-sm font-semibold text-crimson">
                {s.n}
              </span>
              <p className="mt-2 font-apple-text text-apple-subheading font-semibold text-cloud-white">
                {s.title}
              </p>
              <AppleBody as="p" className="mt-1.5 text-apple-body-sm text-cloud-body">
                {s.body}
              </AppleBody>
              <p className="mt-2 text-apple-caption text-cloud-meta">{s.time}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <AppleButtonLink href="/guides" variant="ghost">
            Смотреть гайды по визе
          </AppleButtonLink>
        </div>
      </div>
    </section>
  );
}
