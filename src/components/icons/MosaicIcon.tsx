/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

/* Значки во флорентийской мозаике (pietra dura) — тот же камень, что на
   обложках «Актуального» в Instagram (design/social/instagram/highlights/
   pietra-dura). Owner, 17 Nov 2026: тёмные капсулы с линейной иконкой —
   «показатель ИИ-слопа»; «давай сделаем их в стиле той мозаики»; затем
   «оставь только мозаичную структуру и сами элементы без кружков». Каждый
   значок — сам предмет из полированного камня со швами между кусочками и
   тонким тёмным контуром, без диска и кольца; читается в 40–56px. Значок
   декоративный: смысл несёт текст рядом.
   Только в гайдах и визе (owner, тот же день: «только на гайдах и визе»):
   на главной и в кабинете ячейки держат цифра и слова.
   Манифест: design/illustrations/mosaic-icons-2026-11-17.json. */

export type MosaicIconName =
  | "clock" | "coins" | "calendar" | "checklist" | "compass" | "note"
  | "unlocked" | "seal" | "hourglass" | "office" | "abacus";

export function MosaicIcon({ name, size = 52, className }: { name: MosaicIconName; size?: number; className?: string }) {
  const base = `/illustrations/mosaic/${name}`;
  return <img className={className} src={`${base}-112.webp`} srcSet={`${base}-112.webp 112w, ${base}-224.webp 224w`} sizes={`${size}px`}
    width={size} height={size} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} data-mosaic-icon={name} />;
}
