import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { PAY_PHONE, PAY_WA } from "@/lib/payment";
import { STRIPE_ENABLED } from "@/lib/paymentMode";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Условия сервиса",
  description: "Оплата, активация кабинета, объём услуги, возврат и ограничения IITALY.",
};

export default function TermsPage() {
  return (
    <MarketingLayout>
        <section className="px-5 py-10 sm:py-14" data-legal-page>
          <div className="mx-auto max-w-[760px]">
            <h1 className="font-display text-[36px]! font-semibold leading-[1.1]! tracking-[-0.03em] sm:text-[48px]!">
              Условия сервиса
            </h1>
            <p className="mt-3 text-[13px] text-ink-soft">IITALY · обновлено 19 сентября 2026</p>

            <div className="mt-10 space-y-8 text-[16px] leading-[1.6] text-ink-soft [&_b]:text-ink">
              <section>
                <h2 className="font-display text-[22px]! font-semibold leading-[1.3]! tracking-[-0.02em]! text-ink">Что такое IITALY</h2>
                <p className="mt-2">
                  IITALY — цифровой сервис сопровождения поступления в Италию: подбор программ,
                  персональный маршрут, дедлайны, чек-листы, проверка документов, материалы по DSU,
                  Universitaly и визе D. Сервис помогает организовать процесс, но не принимает
                  решения вместо университета, консульства или региона.
                </p>
              </section>

              <section>
                <h2 className="font-display text-[22px]! font-semibold leading-[1.3]! tracking-[-0.02em]! text-ink">Цена и оплата</h2>
                <p className="mt-2">
                  Основной пакет стоит <b>{priceLabel(PRICE_MAIN)}</b> разово.{" "}
                  {STRIPE_ENABLED
                    ? "Оплата проходит через Stripe Checkout. Реквизиты карты вводятся на стороне Stripe и не проходят через сервер IITALY. После подтверждённого платежа выполнение заказа запускается автоматически."
                    : "После оформления заявки сайт показывает реквизиты. Платёж подтверждается по чеку, который пользователь отправляет в WhatsApp IITALY. Сам факт перевода не создаёт кабинет автоматически."}
                </p>
              </section>

              <section>
                <h2 className="font-display text-[22px]! font-semibold leading-[1.3]! tracking-[-0.02em]! text-ink">Когда открывается кабинет</h2>
                <p className="mt-2">
                  {STRIPE_ENABLED
                    ? "Для основного пакета личный кабинет и персональный маршрут создаются автоматически после подтверждённого webhook Stripe. Код доступа показывается на странице подтверждения оплаты."
                    : "Личный кабинет и персональный маршрут активируются после подтверждения оплаты. После активации пользователь получает код доступа."}
                  {" "}После входа можно подключить Telegram для напоминаний о дедлайнах.
                </p>
              </section>

              <section>
                <h2 className="font-display text-[22px]! font-semibold leading-[1.3]! tracking-[-0.02em]! text-ink">Что не гарантируется</h2>
                <p className="mt-2">
                  IITALY не гарантирует поступление, выдачу визы, стипендию DSU, решение CIMEA или
                  иной результат третьей стороны. ИИ может ошибаться. Ответственность сервиса —
                  дать маршрут, инструменты и актуальные материалы, а финальные требования нужно
                  сверять с официальными источниками.
                </p>
              </section>

              <section>
                <h2 className="font-display text-[22px]! font-semibold leading-[1.3]! tracking-[-0.02em]! text-ink">Возврат</h2>
                <p className="mt-2">
                  В течение <b>7 календарных дней с оплаты</b> можно запросить полный возврат,{" "}
                  {STRIPE_ENABLED
                    ? "если платные функции кабинета ещё не использовались: не загружались документы на проверку и не отмечались шаги маршрута выполненными."
                    : "если личный кабинет ещё не активирован и персональный маршрут не выдан."}
                  {" "}Чтобы запросить возврат, напиши в WhatsApp IITALY по номеру{" "}
                  <a className="font-bold text-red underline underline-offset-4" href={`https://wa.me/${PAY_WA}`} target="_blank" rel="noopener noreferrer">
                    {PAY_PHONE}
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="font-display text-[22px]! font-semibold leading-[1.3]! tracking-[-0.02em]! text-ink">Дополнительная помощь человека</h2>
                <p className="mt-2">
                  Отдельные проверки и консультации живого эксперта, если они указаны на странице
                  цен, не входят в основной пакет и оплачиваются отдельно.
                </p>
              </section>

              <section>
                <h2 className="font-display text-[22px]! font-semibold leading-[1.3]! tracking-[-0.02em]! text-ink">Пользователи младше 18 лет</h2>
                <p className="mt-2">
                  Если пользователю нет 18 лет, оплату и существенные решения по документам
                  следует согласовывать с законным представителем.
                </p>
              </section>
            </div>

            <div className="mt-12 flex flex-wrap gap-6 text-[15px] font-medium">
              <Link href="/privacy" className="text-ink underline underline-offset-4">Политика конфиденциальности</Link>
              <Link href="/" className="text-ink underline underline-offset-4">Вернуться на сайт</Link>
            </div>
          </div>
        </section>
    </MarketingLayout>
  );
}
