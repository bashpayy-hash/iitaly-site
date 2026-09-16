import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Типографика Apple-хрома — параллельно старой Typography.tsx, которую
 * по-прежнему использует /universities. Размеры — фиксированные
 * apple-токены из globals.css (закон DESIGN.md), не clamp(); исключение
 * одно и оговорено у роли whisper.
 *
 * Гарнитура на весь хром одна: эпловский стек (SF Pro, практический
 * фолбэк Inter Tight). Подключённые было антиква Playfair Display,
 * моноширинная Roboto Mono и рукописная Caveat сняты целиком —
 * иерархия строится кеглем, весом и трекингом внутри одного шрифта.
 * Onest и Space Mono в проекте остаются, но они принадлежат старой
 * системе и живут только на /universities, /portal и в чате.
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
  // Крупный заголовок экрана и полос. Здесь стояла антиква Playfair —
  // убрана вместе с моно и рукописной: в хроме один голос, эпловский
  // sans, и иерархия строится кеглем и весом, а не сменой гарнитуры.
  //
  // Единственная роль с clamp() в наборе: остальные ступени —
  // фиксированные px по закону, но заголовок первого экрана обязан
  // дышать от 390px до 1990px, а ступенями это три брейкпоинта вместо
  // одной строки. Вес 300 и отрицательный трекинг делают то, ради чего
  // бралась тонкая антиква: на 44→96px лёгкий grotesk читается как выдох,
  // а не как плакат. leading-[0.95], а не 0.9 — у sans-заголовка выносные
  // короче, и при 0.9 строки начинали цеплять друг друга.
  whisper:
    "font-apple-display font-light text-carbon [font-size:clamp(2.5rem,1.5rem+4.2vw,5.5rem)] leading-[0.95] tracking-[-0.025em]",
  // Служебная подпись над заголовком. Капслок с широким трекингом —
  // единственное место на сайте, где капслок разрешён: это метка, а не
  // текст, и читать её построчно никто не будет. Раньше набиралась
  // моноширинной Roboto Mono; теперь тот же sans, а «технический» вид
  // даёт трекинг и кегль.
  eyebrow:
    "font-apple-text text-[11px] leading-[1.4] font-medium tracking-[0.14em] text-ash uppercase sm:text-[12px]",
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

/** Лёгкий sans 40→88px — заголовок первого экрана, полос и тёмных секций. */
export const AppleWhisper = make("whisper");
/** 11–12px капслоком с широким трекингом — надзаголовок-метка. */
export const AppleEyebrow = make("eyebrow");
/** 56px, полужирный — заголовок там, где нужен вес, а не лёгкость. */
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
