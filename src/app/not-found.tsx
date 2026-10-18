import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ButtonLink } from "@/components/Button";
import { Display, Body, Caption } from "@/components/Typography";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Такой страницы нет — возможно, ссылка устарела или адрес введён с ошибкой.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="bg-transparent px-5 py-20 sm:py-28">
          <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
            <span aria-hidden="true" className="text-6xl">↗</span>
            <Caption as="p" className="mt-8">
              Ошибка 404
            </Caption>
            <Display as="h1" className="mt-3 text-title!">
              Такой страницы нет
            </Display>
            <Body as="p" className="mt-4 max-w-md">
              Ссылка устарела или адрес введён с ошибкой. Сама система
              поступления на месте — вот куда можно вернуться.
            </Body>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <ButtonLink href="/">На главную</ButtonLink>
              <ButtonLink href="/plan" variant="tertiary">
                Составить план
              </ButtonLink>
              <ButtonLink href="/universities" variant="tertiary">
                Смотреть университеты
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
