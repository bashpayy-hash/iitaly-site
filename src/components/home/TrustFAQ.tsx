"use client";

import { Caption, Title, Body } from "@/components/Typography";
import { Reveal } from "@/components/motion/Reveal";
import { EditorialBackground } from "@/components/EditorialBackground";
import { track } from "@/lib/track";

/**
 * Честные ответы на вопросы доверия перед ценой — те же формулировки,
 * что и в GUARANTEES на /prices (PricesExplorer.tsx), просто в формате
 * вопрос/ответ для главной. Ничего не выдумано специально для этой
 * секции: возврат, отсутствие гарантий поступления/визы/стипендии и
 * что происходит при отказе вуза — реальные условия сервиса.
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
    <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 py-16 sm:py-24">
      <EditorialBackground variant="quiet" motion="none" />
      <div className="relative mx-auto max-w-[760px]">
        <Reveal variant="fade">
          <Caption as="p">Прежде чем платить</Caption>
          <Title as="h2" className="mt-3">
            Можно ли нам доверять
          </Title>
        </Reveal>

        <div className="mt-10 divide-y-2 divide-line">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={Math.min(i * 0.05, 0.2)} variant="fade" className="py-5">
              <details
                className="group"
                onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) track("faq_opened", { q: item.q });
                }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg
                    aria-hidden
                    viewBox="0 0 16 10"
                    className="h-2.5 w-4 shrink-0 text-red transition-transform duration-200 group-open:-rotate-180"
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
                <Body as="p" className="mt-3 max-w-[65ch]">
                  {item.a}
                </Body>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
