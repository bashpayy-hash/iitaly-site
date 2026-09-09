"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { animate } from "motion";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { DURATION, EASE } from "@/components/motion/tokens";
import { track } from "@/lib/track";

/**
 * Editorial data-poster (композиционный приём, не клон конкретного
 * сайта): огромная serif-цифра как главный показатель, hairline-сетка
 * вторичных метрик, нижняя строка metadata, атмосферный фон и watermark.
 * Все числа — настоящие данные сайта (см. вызов в Stats.tsx), ничего не
 * выдумано ради красивой анимации.
 *
 * Структурные motion-пропы (initial/whileInView/variants) всегда одни и
 * те же вне зависимости от reducedMotion — см. подробное объяснение в
 * LifestyleStoryCard.tsx: контекст reducedMotion приходит только после
 * маунта, и подмена пропов на false/undefined в этот момент может
 * заморозить уже отрендеренный hidden-элемент навсегда. Здесь
 * reducedMotion влияет только на transition.duration/delay (0 — сразу).
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
      {/* Атмосферный фон: два мягких пятна фирменных цветов + очень тонкое зерно. */}
      <motion.div
        aria-hidden
        variants={bgVariants}
        className="stats-mesh pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(55% 60% at 8% 12%, color-mix(in oklch, var(--color-warn) 14%, transparent) 0%, transparent 65%), " +
            "radial-gradient(50% 55% at 96% 92%, color-mix(in oklch, var(--color-red) 12%, transparent) 0%, transparent 60%)",
        }}
      />
      <div aria-hidden className="stats-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply" />

      <span
        aria-hidden
        className="pointer-events-none absolute -top-6 -right-4 font-display text-[10rem] leading-none font-black text-ink/[0.06] select-none sm:text-[13rem]"
      >
        <motion.span variants={watermarkVariants} className="block">
          {watermark}
        </motion.span>
      </span>

      <motion.div aria-hidden variants={frameVariants} className="absolute inset-0 rounded-xl border-2 border-ink" />

      <div className="relative grid grid-cols-1 sm:grid-cols-[1.2fr_1px_1fr]">
        <div className="relative flex flex-col justify-end p-6 sm:p-10">
          <motion.div variants={heroVariants}>
            <p className="font-editorial text-[clamp(3.5rem,2.2rem+6vw,7.5rem)] leading-[0.9] font-normal tracking-tight text-ink italic">
              {hero.value}
            </p>
            <p className="mt-3 max-w-[30ch] font-mono text-[11px] tracking-[0.08em] text-sec-deep uppercase">
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
              className={`flex items-baseline justify-between gap-4 px-6 py-5 sm:px-8 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <p className="font-editorial text-3xl font-normal tracking-tight text-ink italic sm:text-4xl">
                <AnimatedMetric metric={m} reducedMotion={reducedMotion} />
              </p>
              <p className="max-w-[18ch] text-right font-mono text-[10px] tracking-[0.05em] text-sec-deep uppercase">
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
