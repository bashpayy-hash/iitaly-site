"use client";

import { motion } from "motion/react";
import { ButtonLink } from "@/components/Button";
import { Display, BodyLarge, Body, Caption } from "@/components/Typography";
import { Vespa } from "@/components/Vespa";
import { RouteRibbon } from "@/components/RouteRibbon";
import { EditorialBackground } from "@/components/EditorialBackground";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { DURATION, EASE } from "@/components/motion/tokens";
import { track } from "@/lib/track";

/**
 * Hero — единственная секция с motion-последовательностью на маунте, а
 * не на скролле (она и так уже во вьюпорте при загрузке). Порядок:
 * kicker → заголовок построчно → подзаголовок → цена → CTA → стат-карта
 * справа — каждый следующий блок стартует чуть позже предыдущего.
 *
 * fadeUp всегда возвращает initial/animate/transition (структура не
 * меняется от reducedMotion) — меняется только duration/delay (0 при
 * reduced). Снимать initial/animate целиком по условию нельзя: контекст
 * reducedMotion становится известен только после маунта (иначе —
 * hydration mismatch), и если к этому моменту элемент уже сидит в
 * initial-состоянии, а мы уберём animate — Motion не откатит стили,
 * элемент просто застынет невидимым навсегда.
 */
function fadeUp(reducedMotion: boolean, delay: number, y = 14) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: reducedMotion ? { duration: 0 } : { duration: DURATION.reveal, delay, ease: EASE.reveal },
  };
}

export function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 pt-14 pb-16 sm:pt-20 sm:pb-24">
      {/* Тот же mesh, что был здесь инлайн-градиентом: вариант "atlas" в
         EditorialBackground — его копия (см. MESH.atlas), так что дубль
         определения убран, а не добавлен новый слой. motion="none" —
         чтобы пятно над первым экраном осталось статичным, как и было.
         grain даёт первому экрану ту же бумагу, что и остальным секциям:
         без неё именно hero выглядел бы единственным «цифровым» экраном. */}
      <EditorialBackground variant="atlas" motion="none" grain />
      <RouteRibbon className="opacity-40" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <motion.div className="flex items-center gap-2" {...fadeUp(reducedMotion, 0, 8)}>
            <Vespa pose="hero" className="h-8 w-auto shrink-0" priority />
            <Caption as="p" className="text-sec">
              Абитуриентам Казахстана 16–18 лет и их родителям
            </Caption>
          </motion.div>

          <Display as="h1" className="mt-4">
            <AnimatedText
              as="span"
              text="Поступать"
              className="block"
              delay={0.12}
              stagger={0.05}
            />
            <motion.span className="relative inline-block text-red" {...fadeUp(reducedMotion, 0.42, 10)}>
              в Италию
              <svg
                aria-hidden
                viewBox="0 0 10 10"
                preserveAspectRatio="none"
                className="absolute right-[-6%] -bottom-2 h-[10px] w-full text-ink sm:-bottom-3"
              >
                <line
                  x1="0"
                  y1="5"
                  x2="10"
                  y2="5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </motion.span>
          </Display>

          <motion.div {...fadeUp(reducedMotion, 0.5)}>
            <BodyLarge as="p" className="mt-6 max-w-lg font-medium text-ink">
              Подбор вузов, документы и виза — ведёт система.
            </BodyLarge>
          </motion.div>
          <motion.div {...fadeUp(reducedMotion, 0.58)}>
            <Body as="p" className="mt-3 max-w-md">
              Один платёж 25&nbsp;000&nbsp;₸ — без агентских наценок и подписок.
            </Body>
          </motion.div>
          <motion.div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4" {...fadeUp(reducedMotion, 0.66)}>
            <ButtonLink
              href="/plan"
              variant="primary"
              onClick={() => track("hero_primary_cta_click", { label: "Составить план бесплатно" })}
            >
              Составить план бесплатно
            </ButtonLink>
            <ButtonLink
              href="/universities"
              variant="tertiary"
              onClick={() => track("hero_secondary_cta_click", { label: "Смотреть университеты" })}
            >
              Смотреть университеты
            </ButtonLink>
          </motion.div>
          <motion.div {...fadeUp(reducedMotion, 0.74)}>
            <p className="mt-4 text-xs text-ink-soft">
              Не понравится — до 7 дней с оплаты вернём деньги полностью, без
              объяснений.
            </p>
          </motion.div>
        </div>

        <motion.div className="hidden lg:block" {...fadeUp(reducedMotion, 0.3, 20)}>
          <div className="overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-soft-lg">
            <div className="p-5">
              <p className="font-mono text-[10px] tracking-[0.08em] text-sec-deep uppercase">
                Стипендия DSU
              </p>
              <p className="mt-1.5 font-display text-4xl font-bold">до €7 557</p>
              <p className="mt-1 text-sm text-ink-soft">
                в год — потолок в Риме (DiSCo), зависит от города и дохода семьи
              </p>
            </div>
            <div
              className="border-t-2 border-ink p-5 text-cream"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--color-red-deep) 0%, var(--color-ink) 55%)",
              }}
            >
              <p className="font-mono text-[10px] tracking-[0.08em] text-cream/55 uppercase">
                Вместо агентства
              </p>
              <p className="mt-1.5 font-display text-3xl font-bold">25 000 ₸</p>
              <p className="mt-1 text-sm text-cream/70">
                агентства в Казахстане обычно берут 650 000 – 1 000 000 ₸
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
