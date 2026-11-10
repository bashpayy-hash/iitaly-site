"use client";

import { StoryPath } from "@/components/story/StoryPath";
import { usePaidDevice } from "@/components/access/usePaidDevice";

/* Шаги темы на пути-прогрессе (owner, 10 Nov) — вместо ряда точек. Остановки
   ведут на страницы шагов; закрытые до оплаты несут замок. Устройство с
   кабинетом видит путь без замков и подпись, почему всё открыто. */
export function GuideStepPath({ stops, index }: { stops: { title: string; href: string; locked: boolean }[]; index: number }) {
  const paid = usePaidDevice();
  const open = stops.filter(stop => !stop.locked).length;
  const caption = paid ? "Всё открыто: на этом устройстве выполнен вход в кабинет"
    : open < stops.length ? `Открыто ${open} из ${stops.length} · остальные — с маршрутом` : undefined;
  return <StoryPath label="Шаги темы" noun="Шаг" index={index} caption={caption} href={position => stops[position].href}
    stops={stops.map(stop => ({ id: stop.href, title: stop.title, locked: stop.locked && !paid }))} />;
}
