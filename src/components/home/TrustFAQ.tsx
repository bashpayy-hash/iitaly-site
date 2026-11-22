"use client";
/* eslint-disable @next/next/no-img-element -- Local landscape renditions with explicit dimensions. */

import { track } from "@/lib/track";
import { STRIPE_ENABLED } from "@/lib/paymentMode";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { LivingLandscape } from "@/components/motion/LivingLandscape";
import styles from "./trust-faq.module.css";
import disclosure from "@/components/ui/disclosure.module.css";

/** Existing FAQ copy and analytics. Owner, 4 Nov: «на фон добавь один из
 *  пейзажей Италии с Веспи, где он воодушевлённо смотрит вдаль, на смотровой
 *  площадке с видом на город» — the Florence belvedere scene
 *  (design/illustrations/landscapes-2026-11-03.json, «belvedere») fills a
 *  28px tile; the questions sit on a cream panel on its right so Vespi and
 *  the city stay in view. */
const FAQ = [
  {
    q: "Как проходит работа с iItaly?",
    a: `Начни бесплатно: за 2 минуты пройди опрос о своей ситуации или загрузи документ на проверку. До оплаты ты увидишь маршрут и условия проверки стипендии. Затем\u00A0— один платёж ${priceLabel(PRICE_MAIN)}, без подписки. ${STRIPE_ENABLED
      ? "После подтверждения Stripe кабинет создаётся автоматически, а код доступа появляется сразу на сайте."
      : "После подтверждения оплаты мы активируем кабинет и присылаем код доступа в WhatsApp."} В кабинете\u00A0— персональный чек-лист: аттестат, DoV/CIMEA, Universitaly и стипендия DSU. Документы проверяет ИИ до подачи. CIMEA Verification занимает 60 рабочих дней; сроки вуза и DSU нужно проверять отдельно. Досье на визу D готовим заранее: рассмотрение может занять до 90 дней. После прилёта кабинет ведёт по первым шагам в Италии\u00A0— codice fiscale, kit giallo и Questura.`,
  },
  {
    q: "Гарантируете поступление, визу или стипендию?",
    a: "Нет\u00A0— это решают университет, консульство и регион Италии, а не мы и не ИИ. Мы отвечаем за другое: правильный маршрут, проверенные документы и ничего не упущенное по срокам.",
  },
  {
    q: "Что если университет откажет?",
    a: "Это не конец доступа\u00A0— кабинет остаётся открытым, и система пересобирает план: другие университеты, следующий интейк, донабор. Отдельно за это не платишь.",
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

/* After the 320ms reveal: if the opened answer ends below the panel's visible
   part, scroll the panel (not the page) just enough to show it. */
function revealInPanel(details: HTMLDetailsElement) {
  const panel = details.closest<HTMLElement>("[data-faq-panel]");
  if (!panel) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => {
    if (!details.open || panel.scrollHeight <= panel.clientHeight) return;
    const overflow = details.getBoundingClientRect().bottom - panel.getBoundingClientRect().bottom + 16;
    if (overflow > 0) panel.scrollBy({ top: overflow, behavior: reduce ? "auto" : "smooth" });
  }, reduce ? 0 : 340);
}

export function TrustFAQ() {
  return (
    <section data-public-paper-zone="home-faq" className={styles.section} aria-labelledby="home-faq-title">
      <div className={styles.tile} data-faq-tile>
        {/* Живой пейзаж (owner, 4 Nov): поверх кадра — видеопетля той же
            сцены, плащ Веспи и облака над Флоренцией в движении. */}
        <div className={styles.sceneBox} data-faq-scene>
          <img className={styles.scene} src="/illustrations/landscapes/belvedere-1024.webp" srcSet="/illustrations/landscapes/belvedere-640.webp 640w, /illustrations/landscapes/belvedere-1024.webp 1024w, /illustrations/landscapes/belvedere-1200.webp 1200w, /illustrations/landscapes/belvedere-1600.webp 1600w, /illustrations/landscapes/belvedere-2400.webp 2400w" sizes="(max-width: 1344px) 100vw, 1216px" width={1024} height={688} alt="" aria-hidden="true" loading="lazy" decoding="async" data-faq-landscape="belvedere" />
          {/* Starts at frame 18, where the cloak begins to move; the poster is that
              frame (owner, 17 Nov: «какое-то время просто стоят»). */}
          <LivingLandscape className={styles.scene} base="/illustrations/motion/belvedere" label="belvedere" widths={[960, 1600, 2400]} webmWidths={[960]} startAt={18.5 / 30} />
        </div>
        <div className={styles.panel} data-faq-panel>
          <p className={styles.eyebrow}>Прежде чем платить</p>
          <h2 id="home-faq-title" className={styles.title}>Можно ли нам доверять</h2>
          {/* Плавное раскрытие (owner, 8 Nov: «очень топорно… иллюстрация
              увеличивается по мере того, как нажимаешь»): плитка держит высоту,
              кадр со смотровой не растёт. Owner, 20 Nov: «менюшка лагучая».
              The question under the cursor ran away by 55–100px while it
              opened: the panel re-centred itself in the tile, and the answer
              open above it (one at a time) folded at the same moment. Now the
              panel stands at the top of the tile and questions open
              independently, so a click only moves what is below it. If an
              answer opens past the panel's bottom, the panel itself scrolls to
              show it — never the page. */}
          <div className={styles.list}>
            {FAQ.map((item) => (
              <details
                key={item.q}
                className={styles.item}
                onToggle={(e) => {
                  const details = e.currentTarget;
                  if (!details.open) return;
                  track("faq_opened", { q: item.q });
                  revealInPanel(details);
                }}
              >
                <summary className={`${styles.question} ${disclosure.row}`}>
                  {item.q}
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
