import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Типографика нового (Apple) хрома — параллельно старой Typography.tsx,
 * которую по-прежнему использует /universities. Размеры — фиксированные
 * apple-токены из globals.css (закон DESIGN.md), не clamp().
 */

type Role = "display" | "headingLg" | "heading" | "headingSm" | "subheading" | "body" | "bodySm" | "caption";

const roleClass: Record<Role, string> = {
  display: "font-apple-display text-apple-display font-semibold text-carbon",
  headingLg: "font-apple-display text-apple-heading-lg font-semibold text-carbon",
  heading: "font-apple-display text-apple-heading font-semibold text-carbon",
  headingSm: "font-apple-display text-apple-heading-sm font-semibold text-carbon",
  subheading: "font-apple-text text-apple-subheading font-light text-carbon",
  body: "font-apple-text text-apple-body font-normal text-carbon",
  bodySm: "font-apple-text text-apple-body-sm font-normal text-graphite",
  caption: "font-apple-text text-apple-caption font-normal text-ash",
};

const roleDefaultTag: Record<Role, ElementType> = {
  display: "h1",
  headingLg: "h2",
  heading: "h2",
  headingSm: "h3",
  subheading: "p",
  body: "p",
  bodySm: "p",
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

/** 56px — заголовок первого экрана. Используется скупо: закон против CTA-плакатов. */
export const AppleDisplay = make("display");
/** 44px — заголовок секции первого уровня. */
export const AppleHeadingLg = make("headingLg");
/** 40px — заголовок секции. */
export const AppleHeading = make("heading");
/** 28px — заголовок карточки/блока. */
export const AppleHeadingSm = make("headingSm");
/** 21px, вес 300 — «шёпот» под заголовком: тон system, не выразительность. */
export const AppleSubheading = make("subheading");
/** 17px — основной текст. */
export const AppleBody = make("body");
/** 14px — второстепенный текст. */
export const AppleBodySm = make("bodySm");
/** 12px — подписи, метаданные. Без капслока: у Apple это не редакционный приём. */
export const AppleCaption = make("caption");
