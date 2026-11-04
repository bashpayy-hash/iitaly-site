import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Vespa } from "@/components/Vespa";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Такой страницы нет — возможно, ссылка устарела или адрес введён с ошибкой.",
  robots: { index: false, follow: true },
};

/* The same shell and type as every other page (owner, 4 Nov: «общий стиль
   везде»): the site header and footer, a mono caption, a sentence-case
   headline and the site's pills. */
export default function NotFound() {
  return (
    <MarketingLayout>
      <section className="px-5 py-20 sm:py-28" data-not-found>
        <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
          <Vespa pose="404" className="h-40 w-auto sm:h-48" />
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.08em] text-[#A33421]">Ошибка 404</p>
          <h1 className="mt-3 font-display text-[36px]! font-semibold leading-[1.1]! tracking-[-0.03em] sm:text-[48px]!">Такой страницы нет</h1>
          <p className="mt-4 max-w-md text-[17px] leading-[1.5] text-ink-soft">
            Ссылка устарела или адрес введён с ошибкой. Сама система
            поступления на месте — вот куда можно вернуться.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Link href="/" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#B83A27] px-6 text-[15px] font-medium text-[#FAF6EE] transition-colors hover:bg-[#A33421]">На главную</Link>
            <Link href="/plan" className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-ink underline underline-offset-4">Составить план</Link>
            <Link href="/universities" className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-ink underline underline-offset-4">Смотреть университеты</Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
