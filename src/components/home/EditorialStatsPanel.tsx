"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { animate } from "motion";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { DURATION, EASE } from "@/components/motion/tokens";
import { EditorialBackground } from "@/components/EditorialBackground";
import { track } from "@/lib/track";

/**
 * Editorial data-poster (композиционный приём, не клон конкретного
 * сайта): огромная табличная цифра как главный показатель (одна гарнитура
 * продукта, без курсива/serif), hairline-сетка вторичных метрик, нижняя
 * строка metadata, атмосферный фон и watermark.
 * Все числа — настоящие данные сайта (см. вызов в Stats.tsx), ничего не
 * выдумано ради красивой анимации.
 *
 * Структурные motion-пропы (initial/whileInView/variants) всегда одни и
 * те же вне зависимости от reducedMotion: контекст reducedMotion приходит
 * только после маунта (см. MotionProvider.tsx), и подмена пропов на
 * false/undefined в этот момент может заморозить уже отрендеренный
 * hidden-элемент навсегда. Здесь reducedMotion влияет только на
 * transition.duration/delay (0 — сразу).
 */

export interface Metric {
  value: string;
  /** Числовая часть для count-up. Если задана — value используется только как reduced-motion/no-JS фолбэк. */
  numeric?: number;
  /**
   * Строка после локализованного числа во время count-up (напр. " ₸").
   * Не функция: Stats.tsx — server component, EditorialStatsPanel —
   * client, а функции нельзя передавать через границу RSC.
   */
  suffix?: string;
  label: string;
}

export function EditorialStatsPanel({
  hero,
  metrics,
  metaLine,
  watermark = "€",
  className = "",
  viewEvent,
}: {
  hero: Metric;
  metrics: Metric[];
  metaLine?: string;
  watermark?: string;
  className?: string;
  /** Имя события track(), отправляется один раз при первом входе панели в вьюпорт. */
  viewEvent?: string;
}) {
  const reducedMotion = useReducedMotion();
  const t = (real: object) => (reducedMotion ? { duration: 0 } : real);

  const bgVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: t({ duration: DURATION.narrative, ease: EASE.standard }) } };
  const frameVariants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: t({ duration: DURATION.slow, ease: EASE.reveal, delay: 0.1 }) },
  };
  const dividerVariants = {
    hidden: { scaleY: 0 },
    visible: { scaleY: 1, transition: t({ duration: DURATION.slow, ease: EASE.reveal, delay: 0.2 }) },
  };
  const heroVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: t({ duration: DURATION.reveal, ease: EASE.reveal, delay: 0.3 }) },
  };
  const metricVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: t({ duration: DURATION.normal, ease: EASE.reveal, delay: 0.45 + i * 0.08 }),
    }),
  };
  const metaVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: t({ duration: DURATION.slow, ease: EASE.standard, delay: 0.45 + metrics.length * 0.08 + 0.15 }) },
  };
  const watermarkVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: t({ duration: DURATION.narrative, ease: EASE.standard, delay: 0.45 + metrics.length * 0.08 + 0.3 }) },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      onViewportEnter={() => viewEvent && track(viewEvent)}
      className={`relative overflow-hidden rounded-xl border-2 border-ink bg-paper ${className}`}
    >
      {/* Атмосферный фон — пыльно-голубое/персиковое mesh-пятно + тончайшая
         модульная сетка + зерно, обёрнутые в motion.div ради fade-in по
         bgVariants при входе в вьюпорт. Фирменный watermark ниже рисуется
         отдельно (свой, более поздний, reveal — см. watermarkVariants). */}
      <motion.div aria-hidden variants={bgVariants} className="absolute inset-0">
        <EditorialBackground variant="data" paperBase grain grid />
      </motion.div>

      {/* Watermark внутри кадра, не обрезается рамкой: сидит за колонкой
         метрик, где нет плотного текста. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[6%] -translate-y-1/2 font-display text-[14rem] leading-none font-bold text-ink/[0.055] select-none sm:text-[19rem]"
      >
        <motion.span variants={watermarkVariants} className="block">
          {watermark}
        </motion.span>
      </span>

      <motion.div aria-hidden variants={frameVariants} className="absolute inset-0 rounded-xl border-2 border-ink" />

      <div className="relative grid grid-cols-1 sm:grid-cols-[1.35fr_1px_1fr]">
        <div className="relative flex flex-col justify-between gap-10 p-6 sm:p-10">
          <motion.p
            variants={metaVariants}
            className="font-mono text-[10px] tracking-[0.14em] text-sec-deep uppercase"
          >
            Главный показатель
          </motion.p>
          <motion.div variants={heroVariants}>
            {/* whitespace-nowrap обязателен: без него «до €7 557» ломается
               посреди суммы и читается как два разных числа. Верхняя
               граница clamp подобрана так, чтобы строка влезала в колонку. */}
            <p className="font-display text-[clamp(2.75rem,1.4rem+4.6vw,5.25rem)] leading-[0.95] font-bold tracking-tight whitespace-nowrap text-ink tabular-nums">
              {hero.value}
            </p>
            <p className="mt-4 max-w-[34ch] font-mono text-[11px] leading-relaxed tracking-[0.06em] text-sec-deep uppercase">
              {hero.label}
            </p>
          </motion.div>
        </div>

        <motion.div aria-hidden variants={dividerVariants} className="relative hidden bg-line sm:block" />
        <div className="border-t-2 border-ink sm:hidden" />

        <div className="grid grid-cols-1">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              custom={i}
              variants={metricVariants}
              className={`px-6 py-5 sm:px-8 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <p className="font-display text-[1.75rem] leading-none font-bold tracking-tight text-ink tabular-nums sm:text-[2.125rem]">
                <AnimatedMetric metric={m} reducedMotion={reducedMotion} />
              </p>
              <p className="mt-1.5 max-w-[26ch] font-mono text-[10px] leading-relaxed tracking-[0.05em] text-sec-deep uppercase">
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {metaLine && (
        <motion.div variants={metaVariants} className="relative border-t-2 border-ink px-6 py-3.5 sm:px-8">
          <p className="max-w-[60ch] font-mono text-[10px] leading-relaxed tracking-[0.03em] text-sec-deep uppercase">
            {metaLine}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Count-up только для реальных числовых метрик — не выдуманная анимация ради эффекта. */
function AnimatedMetric({ metric, reducedMotion }: { metric: Metric; reducedMotion: boolean }) {
  const [display, setDisplay] = useState(metric.value);
  const startedRef = useRef(false);
  const spanRef = useRef<HTMLSpanElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (reducedMotion || metric.numeric == null || startedRef.current) return;
    const el = spanRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || startedRef.current) return;
        startedRef.current = true;
        const target = metric.numeric!;
        const suffix = metric.suffix ?? "";
        setDisplay(`0${suffix}`);
        // IntersectionObserver-callback'и не поддерживают возврат
        // cleanup-функции (это только для React-эффектов) — controls
        // храним в ref, чтобы их реально останавливал cleanup эффекта.
        controlsRef.current = animate(0, target, {
          duration: DURATION.narrative,
          ease: EASE.reveal,
          onUpdate: (v) => setDisplay(`${Math.round(v).toLocaleString("ru-RU")}${suffix}`),
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      controlsRef.current?.stop();
    };
  }, [metric, reducedMotion]);

  return <span ref={spanRef}>{display}</span>;
}
