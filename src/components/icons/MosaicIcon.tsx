/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

/* Значки-мозаика для гайдов и визы. Owner, 17 Nov 2026: тёмные капсулы
   с линейной иконкой — «показатель ИИ-слопа»; «давай сделаем их в стиле
   той мозаики»; «только на гайдах и визе»; «без кружков»; «сделай их
   реально похожими на мозаику»; «в иконках ставим на аутентичность, всё
   ещё слишком мультяшные». Поэтому каждый значок — фрагмент настоящей
   римской мозаики: мелкие неровные тессеры натурального камня и немного
   золотой смальты, предмет вылеплен тонами, поверхность чуть затёрта, без
   мультяшного контура; пара рядов фона по контуру с рваным краем, как
   кусок, вынутый из пола. Без диска и кольца. Значок декоративный: смысл
   несёт текст рядом. Манифест: design/illustrations/mosaic-icons-2026-11-17.json. */

export type MosaicIconName =
  | "clock" | "coins" | "calendar" | "checklist" | "compass" | "note"
  | "unlocked" | "seal" | "hourglass" | "office" | "abacus";

export function MosaicIcon({ name, size = 60, className }: { name: MosaicIconName; size?: number; className?: string }) {
  const base = `/illustrations/mosaic/${name}`;
  return <img className={className} src={`${base}-112.webp`} srcSet={`${base}-112.webp 112w, ${base}-224.webp 224w`} sizes={`${size}px`}
    width={size} height={size} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} data-mosaic-icon={name} />;
}
