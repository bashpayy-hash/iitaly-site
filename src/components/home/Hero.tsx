import { AppleButtonLink } from "@/components/apple/Button";
import { AppleDisplay, AppleSubheading, AppleCaption } from "@/components/apple/Typography";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";

/**
 * Герой — холст даёт SkyBackground (небо, не заливка), эта секция сама
 * прозрачна. `data-section="hero"` — точка входа CLIP WIPE в
 * ScrollTransitions (Hero → «Как это работает»).
 */
export function Hero() {
  return (
    <section data-section="hero" className="px-5 pt-28 pb-24 text-center sm:pt-36 sm:pb-32">
      <AppleCaption as="p" className="mx-auto">
        Абитуриентам Казахстана 16–18 лет и их родителям
      </AppleCaption>
      <AppleDisplay as="h1" className="mx-auto mt-4 max-w-5xl">
        Поступать
        <br />в Италию
      </AppleDisplay>
      <AppleSubheading as="p" className="mx-auto mt-6 max-w-xl">
        Подбор вузов, документы и виза — ведёт система. Один платёж{" "}
        {priceLabel(PRICE_MAIN)}, без агентских наценок.
      </AppleSubheading>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <AppleButtonLink href="/plan" variant="filled">
          Составить план бесплатно
        </AppleButtonLink>
        <AppleButtonLink href="/universities" variant="outlined">
          Смотреть университеты
        </AppleButtonLink>
      </div>
      <p className="mx-auto mt-5 max-w-sm text-apple-caption text-cloud-meta">
        Не понравится — до 7 дней с оплаты вернём деньги полностью, без объяснений.
      </p>
    </section>
  );
}
