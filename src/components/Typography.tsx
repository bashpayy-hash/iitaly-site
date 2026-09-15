import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Единая типографическая система: именованные роли вместо разрозненных
 * text-* размеров по компонентам. Размеры — fluid clamp()-токены из
 * globals.css (--text-display/title/heading/body-large/body/caption),
 * поэтому здесь только family/weight/case/wrap-поведение для каждой роли.
 */

type Role = "display" | "title" | "heading" | "bodyLarge" | "body" | "caption";

/**
 * Вес убывает по мере роста кегля — это правило, а не вкусовщина.
 *
 * Раньше display (48–112px) и title (36–72px) набирались одинаковым 700-м.
 * На 112px семисотый не добавляет иерархии: заголовок и так в семь раз
 * крупнее основного текста, и вес уходит в крик. Хуже того, когда крупным
 * весом набрано всё, различить display и title можно только линейкой.
 *
 * Теперь разницу между ступенями держат сразу два параметра, размер и вес:
 * display 500, title 600, heading 600, мелкие подписи — как были. Ниже 22px
 * вес по-прежнему работает и остаётся нетронутым: там размер уже не даёт
 * контраста, и снимать ещё и вес было бы нечем компенсировать.
 */
const roleClass: Record<Role, string> = {
  display: "font-display text-display font-medium uppercase text-balance",
  title: "font-display text-title font-semibold uppercase text-balance",
  heading: "font-display text-heading font-semibold tracking-tight uppercase",
  bodyLarge: "font-sans text-body-lg text-ink-soft text-pretty",
  body: "font-sans text-body text-ink-soft text-pretty",
  caption: "font-sans text-caption font-semibold tracking-[0.1em] text-sec uppercase",
};

const roleDefaultTag: Record<Role, ElementType> = {
  display: "h1",
  title: "h2",
  heading: "h3",
  bodyLarge: "p",
  body: "p",
  caption: "p",
};

function make<R extends Role>(role: R) {
  return function TypographyRole<T extends ElementType = (typeof roleDefaultTag)[R]>({
    as,
    className = "",
    children,
    ...rest
  }: {
    as?: T;
    className?: string;
    children: ReactNode;
  } & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">) {
    const Tag = (as ?? roleDefaultTag[role]) as ElementType;
    return (
      <Tag className={`${roleClass[role]} ${className}`} {...rest}>
        {children}
      </Tag>
    );
  };
}

/** Главный выразительный заголовок страницы/hero. Одна мысль, ~48–112px. */
export const Display = make("display");
/** Заголовок секции. ~36–72px. */
export const Title = make("title");
/** Заголовок внутреннего блока (карточка, шаг, панель). */
export const Heading = make("heading");
/** Вводный текст под заголовком — крупнее основного, спокойный цвет. */
export const BodyLarge = make("bodyLarge");
/** Основной текст. */
export const Body = make("body");
/** Метаданные, лейблы, подписи — капс + трекинг вместо уменьшения веса. */
export const Caption = make("caption");
