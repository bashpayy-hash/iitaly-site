import type { ReactNode } from "react";

/**
 * Редакционные метки — технический слой поверх бумаги: приводочные
 * (регистрационные) крестики, волосяные линии, моно-подписи «ключ → значение»
 * и спец-теги пунктиром. Язык печатного листа: так на типографском оттиске
 * выглядят служебные метки приводки и спецификация тиража.
 *
 * ЖЁСТКОЕ ПРАВИЛО СОДЕРЖАНИЯ. Ни одна метка не содержит псевдотекста.
 * Значение каждой подписи — настоящий факт IITALY и берётся из данных или
 * копирайта той же секции: этап маршрута (ЭТАП 03 / 05), учебный год
 * (2026/27), названия реальных процедур и документов (DSU, CIMEA,
 * UNIVERSITALY, ВИЗА D, PERMESSO), город или регион, статус документа,
 * ориентировочный срок (30–60 ДНЕЙ), количество из данных (30 ГОРОДОВ).
 * Декоративных «D1 / TYPE / VECTOR» здесь быть не может: подпись, которую
 * нельзя проверить по содержанию страницы, — это шум, который подрывает
 * доверие ровно там, где мы его строим.
 *
 * И обратное правило: метки НЕ несут критической информации. Цена, дедлайн,
 * условия возврата и всё, без чего нельзя принять решение, остаются обычным
 * текстом нормального размера. Метка только уточняет контекст того, что уже
 * сказано рядом.
 *
 * Всё, что визуально служебное, идёт с aria-hidden: скринридер не должен
 * читать приводочные крестики и дубли уже озвученных фактов.
 */

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const CORNER_POS: Record<Corner, string> = {
  "top-left": "top-4 left-4 sm:top-6 sm:left-6",
  "top-right": "top-4 right-4 sm:top-6 sm:right-6",
  "bottom-left": "bottom-4 left-4 sm:bottom-6 sm:left-6",
  "bottom-right": "bottom-4 right-4 sm:bottom-6 sm:right-6",
};

/**
 * Приводочный крестик в круге. Волосяная линия (vectorEffect
 * non-scaling-stroke, поэтому толщина не зависит от размера), 14% чернил —
 * читается при близком рассмотрении и не конкурирует с контентом.
 * Ставится в углах секции, в стороне от текста и кнопок.
 */
export function RegistrationMark({
  corner = "top-right",
  size = 26,
  className = "",
}: {
  corner?: Corner;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`pointer-events-none absolute text-ink/[0.16] ${CORNER_POS[corner]} ${className}`}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <circle cx="12" cy="12" r="7" />
        <line x1="12" y1="0" x2="12" y2="24" />
        <line x1="0" y1="12" x2="24" y2="12" />
      </g>
    </svg>
  );
}

/**
 * Волосяная техническая линия с засечками на концах — та же линия, которой
 * на макете обозначают габарит. Горизонтальная тянется во всю ширину
 * секции (full-bleed), поэтому ставится вне контентной колонки.
 */
export function HairlineGuide({
  orientation = "horizontal",
  className = "",
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const horizontal = orientation === "horizontal";
  return (
    <svg
      aria-hidden
      viewBox={horizontal ? "0 0 100 6" : "0 0 6 100"}
      preserveAspectRatio="none"
      className={`pointer-events-none absolute text-ink/[0.14] ${className}`}
    >
      <g stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {horizontal ? (
          <>
            <line x1="0" y1="3" x2="100" y2="3" />
            <line x1="0.5" y1="0" x2="0.5" y2="6" />
            <line x1="99.5" y1="0" x2="99.5" y2="6" />
          </>
        ) : (
          <>
            <line x1="3" y1="0" x2="3" y2="100" />
            <line x1="0" y1="0.5" x2="6" y2="0.5" />
            <line x1="0" y1="99.5" x2="6" y2="99.5" />
          </>
        )}
      </g>
    </svg>
  );
}

/**
 * Моно-подпись «ключ → значение»: слева приглушённый ключ, справа значение
 * чуть плотнее.
 *
 * Два режима выравнивания, и это не стилистический выбор. В столбце
 * (layout="table") ключ занимает фиксированную колонку — тогда строки
 * группы выстраиваются в таблицу, а не расползаются лестницей. В строке
 * (layout="inline") та же фиксированная колонка ломает чтение: между ключом
 * и его значением появляется провал шире, чем расстояние до следующей пары,
 * и «РЕГИОН · КАМПАНИЯ · НА КАРТЕ · 30» перестаёт группироваться по смыслу.
 */
export function MicroLabel({
  label,
  value,
  layout = "table",
  decorative = true,
}: {
  label: string;
  value: string;
  layout?: "table" | "inline";
  /** false — факт озвучен только здесь и должен попасть в скринридер */
  decorative?: boolean;
}) {
  return (
    <div
      aria-hidden={decorative || undefined}
      className={`flex items-baseline font-mono text-[10px] leading-[1.6] tracking-[0.12em] uppercase ${
        layout === "table" ? "gap-2.5" : "gap-1.5"
      }`}
    >
      <span className={`text-sec-deep ${layout === "table" ? "w-[5.5rem] shrink-0" : ""}`}>
        {label}
      </span>
      <span className="text-ink-soft tabular-nums">{value}</span>
    </div>
  );
}

export function MicroLabelGroup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col ${className}`}>{children}</div>;
}

/**
 * Спец-тег пунктиром — на оттиске так помечают параметры печати. Здесь
 * несёт параметр этапа: срок, формат подачи, учебный год.
 */
export function SpecTag({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center rounded-sm border border-dashed border-ink/25 px-2 py-1 font-mono text-[10px] leading-none tracking-[0.12em] text-sec-deep uppercase ${className}`}
    >
      {children}
    </span>
  );
}
