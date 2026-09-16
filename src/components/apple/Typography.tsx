import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Типографика нового хрома. Со времён Apple-прохода поменялись цвета
 * (холст теперь фото неба, не frost — текст светлый, не carbon) и размер
 * заголовков (архитектурная шкала ThoughtLab: 198px только герой,
 * 72–91px — секции, uppercase, line-height 0.92–0.96). Тело и подписи
 * остались на apple-шкале (17/14/12px) — закон её не менял.
 */

type Role = "display" | "headingLg" | "heading" | "headingSm" | "subheading" | "body" | "bodySm" | "caption";

const roleClass: Record<Role, string> = {
  display: "font-apple-display text-arch-h1 font-semibold uppercase text-cloud-white",
  headingLg: "font-apple-display text-arch-h2 font-semibold uppercase text-cloud-white",
  heading: "font-apple-display text-[44px] font-semibold uppercase text-cloud-white sm:text-[56px]",
  headingSm: "font-apple-display text-apple-heading-sm font-semibold uppercase text-cloud-white",
  subheading: "font-apple-text text-apple-subheading font-light text-cloud-body",
  body: "font-apple-text text-apple-body font-normal text-cloud-body",
  bodySm: "font-apple-text text-apple-body-sm font-normal text-cloud-body/80",
  caption: "font-apple-text text-apple-caption font-semibold uppercase tracking-[0.08em] text-cloud-meta",
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

/** 198px-потолок (clamp 12–15vw) — только герой главной. */
export const AppleDisplay = make("display");
/** 72–91px (clamp) — заголовок первого уровня секции. */
export const AppleHeadingLg = make("headingLg");
/** 44–56px — заголовок секции. */
export const AppleHeading = make("heading");
/** 28px — заголовок карточки/блока. */
export const AppleHeadingSm = make("headingSm");
/** 21px, вес 300 — «шёпот» под заголовком. */
export const AppleSubheading = make("subheading");
/** 17px — основной текст, светло-серый на тёмном холсте. */
export const AppleBody = make("body");
/** 14px — второстепенный текст. */
export const AppleBodySm = make("bodySm");
/** 12px — подписи, метаданные, приглушённый серый. */
export const AppleCaption = make("caption");
