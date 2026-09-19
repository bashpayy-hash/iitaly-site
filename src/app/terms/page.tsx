import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { PAY_PHONE, PAY_WA } from "@/lib/payment";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Условия сервиса",
  description: "Оплата, активация кабинета, объём услуги, возврат и ограничения IITALY.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="px-5 py-10 sm:py-14">
          <div className="mx-auto max-w-[720px]">
            <h1 className="font-display text-3xl font-semibold tracking-tight uppercase sm:text-4xl">
              Условия сервиса
            </h1>
            <p className="mt-1.5 text-xs text-ink-soft">IITALY · обновлено 19 сентября 2026</p>

            <div className="mt-8 space-y-7 text-sm text-ink-soft [&_b]:text-ink">
              <section>
                <h2 className="font-display text-lg font-bold text-ink">Что такое IITALY</h2>
                <p className="mt-1.5">
                  IITALY — цифровой сервис сопровождения поступления в Италию: подбор программ,
                  персональный маршрут, дедлайны, чек-листы, проверка документов, материалы по DSU,
                  Universitaly и визе D. Сервис помогает организовать процесс, но не принимает
                  решения вместо университета, консульства или региона.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-ink">Цена и оплата</h2>
                <p className="mt-1.5">
                  Основной пакет стоит <b>{priceLabel(PRICE_MAIN)}</b> разово. Оплата проводится
                  способом, доступным на странице оформления. При оплате через Stripe Checkout
                  реквизиты карты вводятся на стороне Stripe и не проходят через сервер IITALY.
                  После подтверждения платежа начинается выполнение заказа.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-ink">Когда открывается кабинет</h2>
                <p className="mt-1.5">
                  Для основного пакета личный кабинет и персональный маршрут активируются после
                  подтверждения оплаты. При автоматической оплате через Stripe код доступа
                  показывается на странице подтверждения; затем можно подключить Telegram для
                  напоминаний о дедлайнах.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-ink">Что не гарантируется</h2>
                <p className="mt-1.5">
                  IITALY не гарантирует поступление, выдачу визы, стипендию DSU, решение CIMEA или
                  иной результат третьей стороны. ИИ может ошибаться. Ответственность сервиса —
                  дать маршрут, инструменты и актуальные материалы, а финальные требования нужно
                  сверять с официальными источниками.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-ink">Возврат</h2>
                <p className="mt-1.5">
                  В течение <b>7 календарных дней с оплаты</b> можно запросить полный возврат,
                  если платные функции кабинета ещё не использовались: не загружались документы
                  на проверку и не отмечались шаги маршрута выполненными. Чтобы запросить возврат,
                  напиши в WhatsApp IITALY по номеру{" "}
                  <a className="font-bold text-red underline underline-offset-4" href={`https://wa.me/${PAY_WA}`} target="_blank" rel="noopener noreferrer">
                    {PAY_PHONE}
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-ink">Дополнительная помощь человека</h2>
                <p className="mt-1.5">
                  Отдельные проверки и консультации живого эксперта, если они указаны на странице
                  цен, не входят в основной пакет и оплачиваются отдельно.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-ink">Пользователи младше 18 лет</h2>
                <p className="mt-1.5">
                  Если пользователю нет 18 лет, оплату и существенные решения по документам
                  следует согласовывать с родителем или законным представителем.
                </p>
              </section>
            </div>

            <div className="mt-10 flex flex-wrap gap-5 text-sm font-bold">
              <Link href="/privacy" className="text-ink underline underline-offset-4">Политика конфиденциальности</Link>
              <Link href="/" className="text-ink underline underline-offset-4">← Вернуться на сайт</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
