/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

/* Вещь сайта как крупная иконка (owner, 6 Nov: «иконки… с упором на
   реализм, но не до конца»): тот же набор предметов, что у этапов, гайдов и
   плана (design/illustrations/objects-2026-11-04.json), в кадре 240px.
   Для строк меню и маршрутов от 32px; мельче — WarmIcon. */
export type ObjectIconName = "alarm" | "books" | "cap" | "coins" | "diploma" | "envelope" | "folder" | "insurance" | "keys" | "map" | "passport" | "stamp-pad" | "tax-card" | "tests" | "translation";

export function ObjectIcon({ name, size = 40, className }: { name: ObjectIconName; size?: number; className?: string }) {
  return <img className={className} src={`/illustrations/objects/${name}-240.webp`} width={size} height={size} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} data-object-icon={name} style={{ objectFit: "contain" }} />;
}
