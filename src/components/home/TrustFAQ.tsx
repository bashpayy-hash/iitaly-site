"use client";
/* eslint-disable @next/next/no-img-element -- Local landscape renditions with explicit dimensions. */

import { track } from "@/lib/track";
import { STRIPE_ENABLED } from "@/lib/paymentMode";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import styles from "./trust-faq.module.css";

/** Existing FAQ copy and analytics. Owner, 4 Nov: «на фон добавь один из
 *  пейзажей Италии с Веспи, где он воодушевлённо смотрит вдаль, на смотровой
 *  площадке с видом на город» — the Florence belvedere scene
 *  (design/illustrations/landscapes-2026-11-03.json, «belvedere») fills a
 *  28px tile; the questions sit on a cream panel on its right so Vespi and
 *  the city stay in view. */
const FAQ = [
  {
    q: "Как проходит работа с iItaly?",
    a: `Начни бесплатно: за 10 минут пройди опрос о своей ситуации или загрузи документ на проверку. До оплаты ты увидишь маршрут и условия проверки стипендии. Затем — один платёж ${priceLabel(PRICE_MAIN)}, без подписки. ${STRIPE_ENABLED
      ? "После подтверждения Stripe кабинет создаётся автоматически, а код доступа появляется сразу на сайте."
      : "После подтверждения оплаты мы активируем кабинет и присылаем код доступа в WhatsApp."} В кабинете — персональный чек-лист: аттестат, DoV/CIMEA, Universitaly и стипендия DSU. Документы проверяет ИИ до подачи. CIMEA Verification занимает 60 рабочих дней; сроки вуза и DSU нужно проверять отдельно. Досье на визу D готовим заранее: рассмотрение может занять до 90 дней. После прилёта кабинет ведёт по первым шагам в Италии — codice fiscale, kit giallo и Questura.`,
  },
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
    a: STRIPE_ENABLED
      ? "Да. В течение 7 календарных дней с оплаты вернём деньги полностью, если ты ещё не использовал платные функции кабинета: не загружал документы на проверку и не отмечал шаги маршрута выполненными."
      : "Да. В течение 7 календарных дней с оплаты вернём деньги полностью, если личный кабинет ещё не активирован и персональный маршрут не выдан.",
  },
  {
    q: "ИИ может ошибиться?",
    a: "Может. Обновлённые гайды ссылаются на правила 2026/27–2027/28 и региональные bando. Критичные условия по документам, визе и стипендии нужно подтверждать у принимающего органа.",
  },
];

export function TrustFAQ() {
  return (
    <section data-public-paper-zone="home-faq" className={styles.section} aria-labelledby="home-faq-title">
      <div className={styles.tile} data-faq-tile>
        <img className={styles.scene} src="/illustrations/landscapes/belvedere-1024.webp" srcSet="/illustrations/landscapes/belvedere-640.webp 640w, /illustrations/landscapes/belvedere-1024.webp 1024w, /illustrations/landscapes/belvedere-1600.webp 1600w" sizes="(max-width: 1344px) 100vw, 1216px" width={1024} height={688} alt="" aria-hidden="true" loading="lazy" decoding="async" data-faq-landscape="belvedere" />
        <div className={styles.panel}>
          <p className={styles.eyebrow}>Прежде чем платить</p>
          <h2 id="home-faq-title" className={styles.title}>Можно ли нам доверять</h2>
          <div className={styles.list}>
            {FAQ.map((item) => (
              <details
                key={item.q}
                className={styles.item}
                onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) track("faq_opened", { q: item.q });
                }}
              >
                <summary className={styles.question}>
                  {item.q}
                  <svg aria-hidden viewBox="0 0 16 10" className={styles.chevron}>
                    <path d="M1 1.5 8 8.5 15 1.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className={styles.answer}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
