import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Типографика нового (Apple) хрома — параллельно старой Typography.tsx,
 * которую по-прежнему использует /universities. Размеры — фиксированные
 * apple-токены из globals.css (закон DESIGN.md), не clamp().
 */

type Role =
  | "whisper"
  | "eyebrow"
  | "display"
  | "headingLg"
  | "heading"
  | "headingSm"
  | "subheading"
  | "body"
  | "bodySm"
  | "caption";

const roleClass: Record<Role, string> = {
  // Антиква 300 на 44→96px. Единственная роль с clamp() в этом наборе:
  // остальные ступени — фиксированные px по закону, но заголовок первого
  // экрана обязан дышать от 390px до 1990px, а ступенями это даёт три
  // брейкпоинта вместо одной строки. leading-[0.9] — из задания: тонкая
  // антиква на такой высоте строки складывается в плотный блок, а не в
  // лесенку. Курсив одного слова ставится на месте, не здесь.
  whisper:
    "font-whisper font-normal text-carbon [font-size:clamp(2.75rem,1.6rem+4.6vw,6rem)] leading-[0.9] tracking-[-0.01em]",
  // Служебная подпись над заголовком. Капслок с широким трекингом —
  // единственное место на сайте, где капслок разрешён: это метка, а не
  // текст, и читать её построчно никто не будет.
  eyebrow: "font-mono-eyebrow text-[11px] leading-[1.4] tracking-[0.14em] text-ash uppercase sm:text-[12px]",
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
  whisper: "h1",
  eyebrow: "p",
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

/** Антиква 300, 44→96px — заголовок первого экрана и двух полос. Больше нигде. */
export const AppleWhisper = make("whisper");
/** Моно 11–12px капслоком — надзаголовок-метка. */
export const AppleEyebrow = make("eyebrow");
/** 56px sans — заголовок там, где антиква была бы слишком мягкой (внутренние страницы). */
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
