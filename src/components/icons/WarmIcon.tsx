/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

/* Маленькие иконки-вещи (owner, 6 Nov: «иконки выглядят топорно… найди
   золотую середину, один дизайн-код, с упором на реализм, но не до конца»;
   плоская векторная версия была отклонена — «ушёл в слишком минимализм»).
   Тот же рецепт, что у вещей этапов и гайдов (design/illustrations/
   icons-2026-11-06.json): студийный реализм с иллюстративными бликами,
   бумага, латунь, сургуч и терракота, мягкая тень снизу. С 7 ноября —
   чуть концептуальнее, крупный читаемый силуэт (objects-2026-11-07.json). Кадр 128px,
   показываются от 18 до 44px (рядом с текстом 22–26px, чтобы детали читались). Иконка всегда декоративная: смысл несёт текст
   рядом. Значки управления (поиск, закрыть, пауза, настройки) остаются
   тонкими линиями — это кнопки, а не вещи. */

export type WarmIconName = "calendar" | "clock" | "info" | "pin" | "check" | "lock" | "folder" | "doc";

const FILE: Record<WarmIconName, string> = {
  calendar: "calendar", // отрывной календарик с латунными кольцами
  clock: "clock", // кремовый будильник
  info: "explain", // латунная лупа: «что значит слово»
  pin: "pin", // булавка в сложенной карте: «где взять»
  check: "done", // зелёная сургучная печать: «готово»
  lock: "lock", // латунный замок
  folder: "folder", // крафтовая папка с резинкой
  doc: "sheet", // лист со скрепкой
};

export function WarmIcon({ name, size = 18, className }: { name: WarmIconName; size?: number; className?: string }) {
  return <img className={className} src={`/illustrations/icons/${FILE[name]}.webp`} width={size} height={size} alt="" aria-hidden="true" decoding="async" draggable={false} data-warm-icon={name} style={{ display: "inline-block", flexShrink: 0, objectFit: "contain" }} />;
}
