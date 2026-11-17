/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

/* Значки во флорентийской мозаике (pietra dura) — тот же камень, что на
   обложках «Актуального» в Instagram (design/social/instagram/highlights/
   pietra-dura). Owner, 17 Nov 2026: тёмные капсулы с линейной иконкой —
   «показатель ИИ-слопа»; «давай сделаем их в стиле той мозаики». Каждый
   значок — диск тёмно-зелёного мрамора с тонким терракотовым кольцом и
   одним крупным мотивом из полированного камня, без орнамента, чтобы читался
   в 40–56px. Значок декоративный: смысл несёт текст рядом.
   Манифест: design/illustrations/mosaic-icons-2026-11-17.json. */

export type MosaicIconName =
  | "clock" | "day-night" | "unlimited" | "checklist" | "document-check"
  | "coins" | "calendar" | "compass" | "note" | "seal" | "hourglass"
  | "office" | "abacus" | "key" | "graduation" | "envelope" | "swallow"
  | "bell" | "unlocked";

export function MosaicIcon({ name, size = 52, className }: { name: MosaicIconName; size?: number; className?: string }) {
  const base = `/illustrations/mosaic/${name}`;
  return <img className={className} src={`${base}-112.webp`} srcSet={`${base}-112.webp 112w, ${base}-224.webp 224w`} sizes={`${size}px`}
    width={size} height={size} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} data-mosaic-icon={name} />;
}
