import { AppleButtonLink } from "@/components/apple/Button";
import { AppleDisplay, AppleSubheading, AppleCaption } from "@/components/apple/Typography";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";

/**
 * Apple-hero: не картинка, а продукт. Один тезис, один экран, один синий
 * CTA. Никакой Веспы, никакого mesh-фона — холст и воздух.
 */
export function Hero() {
  return (
    <section className="bg-frost px-5 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
      <AppleCaption as="p" className="mx-auto">
        Абитуриентам Казахстана 16–18 лет и их родителям
      </AppleCaption>
      <AppleDisplay as="h1" className="mx-auto mt-3 max-w-3xl text-[40px] leading-[1.05] sm:text-apple-display">
        Поступать в Италию
      </AppleDisplay>
      <AppleSubheading as="p" className="mx-auto mt-4 max-w-xl">
        Подбор вузов, документы и виза — ведёт система. Один платёж{" "}
        {priceLabel(PRICE_MAIN)}, без агентских наценок.
      </AppleSubheading>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <AppleButtonLink href="/plan" variant="filled">
          Составить план бесплатно
        </AppleButtonLink>
        <AppleButtonLink href="/universities" variant="outlined">
          Смотреть университеты
        </AppleButtonLink>
      </div>
      <p className="mx-auto mt-5 max-w-sm text-apple-caption text-ash">
        Не понравится — до 7 дней с оплаты вернём деньги полностью, без объяснений.
      </p>
    </section>
  );
}
