"use client";

import { AppleCaption, AppleHeading, AppleBody } from "@/components/apple/Typography";
import { track } from "@/lib/track";

/**
 * Те же вопросы/ответы, что и раньше (реальные условия сервиса, ничего не
 * переписано) — сменилась только оболочка: без бумаги и mesh-фона.
 */
const FAQ = [
  {
    q: "Гарантируете поступление, визу или стипендию?",
    a: "Нет — это решают университет, консульство и регион Италии, а не мы и не ИИ. Мы отвечаем за другое: правильный маршрут, проверенные документы и ничего не упущенное по срокам.",
  },
  {
    q: "Что если университет откажет?",
    a: "Это не конец доступа — кабинет остаётся открытым, и система пересобирает план: другие университеты, следующий интейк, донабор. Отдельно за это не платишь.",
  },
  {
    q: "Можно вернуть деньги?",
    a: "Да. Если ещё не начал работать с планом или чек-листом — до 7 дней с оплаты вернём деньги полностью, без объяснений.",
  },
  {
    q: "ИИ может ошибиться?",
    a: "Может. База строится на официальных правилах приёма 2026/27 (MUR, CIMEA, bando регионов), но критичные решения по документам проверяет эксперт, а не только модель.",
  },
];

export function TrustFAQ() {
  return (
    <section className="bg-frost px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-[760px]">
        <AppleCaption as="p" className="text-center">Прежде чем платить</AppleCaption>
        <AppleHeading as="h2" className="mt-3 text-center text-[32px] sm:text-apple-heading">
          Можно ли нам доверять
        </AppleHeading>

        <div className="mt-10 divide-y divide-mist/30">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group py-5"
              onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open) track("faq_opened", { q: item.q });
              }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-apple-text text-apple-subheading font-normal text-carbon marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg
                  aria-hidden
                  viewBox="0 0 16 10"
                  className="h-2.5 w-4 shrink-0 text-rosso transition-transform duration-200 group-open:-rotate-180"
                >
                  <path
                    d="M1 1.5 8 8.5 15 1.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <AppleBody as="p" className="mt-3 max-w-[65ch] text-apple-body-sm text-graphite">
                {item.a}
              </AppleBody>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
