/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

/* Значки-мозаика для гайдов и визы. Owner, 17 Nov 2026: тёмные капсулы
   с линейной иконкой — «показатель ИИ-слопа»; «давай сделаем их в стиле
   той мозаики»; «только на гайдах и визе»; «без кружков»; «сделай их
   реально похожими на мозаику». 17–18 Nov: римские фрагменты «слишком
   косят под старинность», отдельный предмет «напоминает эмодзи» — нужен
   пол Галереи Виктора Эммануила и другая структура. После пяти раундов
   вариантов владелец выбрал: «Вставь седьмой вариант в сайт». Поэтому
   каждый значок — барочный картуш из полированной мраморной смальты:
   кремовое поле, края загибаются синими лентами-завитками, сверху
   раковина терракоты и охры, в центре плоская симметричная эмблема.
   Значок декоративный: смысл несёт текст рядом.
   Манифест: design/illustrations/mosaic-icons-2026-11-18.json. */

export type MosaicIconName =
  | "clock" | "coins" | "calendar" | "checklist" | "compass" | "note"
  | "unlocked" | "seal" | "hourglass" | "office" | "abacus";

export function MosaicIcon({ name, size = 60, className }: { name: MosaicIconName; size?: number; className?: string }) {
  const base = `/illustrations/mosaic/${name}`;
  return <img className={className} src={`${base}-112.webp`} srcSet={`${base}-112.webp 112w, ${base}-224.webp 224w`} sizes={`${size}px`}
    width={size} height={size} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} data-mosaic-icon={name} />;
}
