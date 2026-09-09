"use client";

import { Caption, Title, Body } from "@/components/Typography";
import { Reveal } from "@/components/motion/Reveal";
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(70% 55% at 50% 0%, color-mix(in oklch, var(--color-ink) 5%, transparent) 0%, transparent 70%)",
        }}
      />
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
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-black marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="shrink-0 font-display text-xl leading-none text-red transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
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
