"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { DURATION, EASE } from "@/components/motion/tokens";

/**
 * Кинетическая lifestyle-карточка (композиционный приём — не клон
 * какого-то конкретного сайта): почти квадратная карточка, крупный
 * заголовок сверху на светлом поле, кинематографичное фото в нижних
 * 60-70%, технические подписи в нижних углах. Вход: 1) карточка
 * раскрывается через clip-path, 2) заголовок построчно, 3) медиа —
 * от blur+scale к резкому, 4) подписи последними. Один общий триггер
 * (viewport карточки), дети синхронизированы через variants/delay, а не
 * собственные независимые whileInView — иначе на мобильном при высокой
 * карточке медиа и заголовок могли бы стартовать в разные моменты.
 *
 * ВАЖНО #1: наблюдаемый (whileInView) элемент и элемент с clip-path —
 * это ДВА разных узла. В hidden-состоянии clip-path обрезает элемент до
 * нулевой видимой области, и Chromium's IntersectionObserver считает
 * его невидимым — whileInView никогда не срабатывает (проверено
 * эмпирически). Поэтому внешний div только наблюдает, а клип — на
 * внутреннем, который лишь наследует variants от родителя.
 *
 * ВАЖНО #2: initial/whileInView/variants на наблюдающем узле и variants
 * на детях — ВСЕГДА одни и те же объекты, вне зависимости от
 * reducedMotion. Значение reducedMotion приходит из контекста только
 * ПОСЛЕ маунта (см. MotionProvider — иначе hydration mismatch), и если
 * в момент его прихода подменить initial/whileInView на false/undefined
 * (а не просто укоротить transition), элемент, уже сидящий в hidden,
 * застынет там навсегда — Motion не откатывает стили при смене пропов,
 * только при полном размонтировании. Поэтому reducedMotion здесь влияет
 * только на transition.duration/delay внутри вариантов (0 = мгновенно),
 * а не на то, применяются ли variants вообще.
 */
export function LifestyleStoryCard({
  titleLines,
  metaLeft,
  metaRight,
  mediaSrc,
  mediaAlt,
  href,
  className = "",
}: {
  titleLines: string[];
  metaLeft?: string;
  metaRight?: string;
  mediaSrc: string;
  mediaAlt: string;
  href?: string;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const t = (real: object) => (reducedMotion ? { duration: 0 } : real);

  const clipVariants = {
    hidden: { clipPath: "inset(0% 0% 100% 0%)" },
    visible: {
      clipPath: "inset(0% 0% 0% 0%)",
      transition: t({ duration: DURATION.reveal + 0.05, ease: EASE.reveal }),
    },
  };
  const lineVariants = {
    hidden: { opacity: 0, y: "0.4em" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: t({ duration: DURATION.normal, ease: EASE.reveal, delay: 0.25 + i * 0.07 }),
    }),
  };
  const mediaVariants = {
    hidden: { opacity: 0, scale: 1.08, filter: "blur(14px)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: t({ duration: DURATION.narrative, ease: EASE.reveal, delay: 0.12 }),
    },
  };
  const metaVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: t({ duration: DURATION.slow, ease: EASE.standard, delay: 0.6 + custom * 0.08 }),
    }),
  };

  const content = (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`group relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border-2 border-ink bg-paper shadow-soft-lg sm:aspect-square sm:rounded-[36px] ${className}`}
    >
      {/* Только этот вложенный слой несёт clip-path — сам не наблюдает
         вьюпорт, только принимает "hidden"/"visible" от родителя. */}
      <motion.div variants={clipVariants} className="absolute inset-0">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-[1] h-[38%] bg-gradient-to-b from-paper via-paper/95 to-transparent"
        />
        <div className="absolute inset-x-0 top-0 z-[2] px-6 pt-7 sm:px-8 sm:pt-9">
          <h3 className="font-sans text-[clamp(1.75rem,1.2rem+3vw,3rem)] font-black leading-[0.98] tracking-tight text-ink uppercase text-balance">
            {titleLines.map((line, i) => (
              <motion.span key={i} custom={i} variants={lineVariants} className="block">
                {line}
              </motion.span>
            ))}
          </h3>
        </div>

        <motion.div variants={mediaVariants} className="absolute inset-x-0 bottom-0 h-[68%] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaSrc}
            alt={mediaAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full origin-bottom scale-[1.03] object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)] group-hover:scale-[1.05]"
            style={{ objectPosition: "50% 30%" }}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
        </motion.div>

        {(metaLeft || metaRight) && (
          <div className="absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-3 p-4 sm:p-5">
            {metaLeft && (
              <motion.span
                custom={0}
                variants={metaVariants}
                className="rounded-pill bg-ink/70 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-cream uppercase backdrop-blur-sm"
              >
                {metaLeft}
              </motion.span>
            )}
            {metaRight && (
              <motion.span
                custom={1}
                variants={metaVariants}
                className="rounded-pill bg-ink/70 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-cream uppercase backdrop-blur-sm"
              >
                {metaRight}
              </motion.span>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red">
      {content}
    </Link>
  );
}
