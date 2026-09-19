"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppleButton } from "@/components/apple/Button";
import { BuyModal, type BuyProduct } from "./BuyModal";
import { track } from "@/lib/track";
import { FEATURES, PRICE_EXPRESS_CHECK, PRICE_MAIN, priceLabel } from "@/data/pricing";
import { HeadingPin } from "@/components/motion/HeadingPin";
import { TomatoAccent } from "@/components/marketing/EditorialArtwork";
import art from "@/components/marketing/editorial-art.module.css";
import { PricesLandscape } from "./PricesLandscape";

const MICRO = [
  { name: "Срочная проверка · 1 документ", desc: "Вердикт человека в течение 24 часов", price: PRICE_EXPRESS_CHECK },
];

const GUARANTEES = [
  {
    title: "Возврат",
    body: "До 7 календарных дней с оплаты вернём деньги полностью, если личный кабинет ещё не активирован и персональный маршрут не выдан. После активации начинается оказание услуги.",
  },
  {
    title: "Мы не обещаем поступление, визу или стипендию",
    body: "Это решают университет, консульство и регион Италии — не мы и не ИИ. Мы обещаем другое: правильный маршрут, проверенные документы и ничего не упущенное по срокам.",
  },
  {
    title: "Если вуз отказал",
    body: "Это не конец доступа — кабинет остаётся открытым, и система пересобирает план: другие университеты, следующий интейк, донабор. Отдельно за это не платишь.",
  },
  {
    title: "Без доплат",
    body: "Цена одна и разовая на весь цикл поступления — от выбора вуза до permesso di soggiorno. Платные консультации ниже — по желанию, не часть обязательного пути.",
  },
];

export function PricesExplorer() {
  const router = useRouter();
  const [buy, setBuy] = useState<BuyProduct | null>(null);

  useEffect(() => {
    track("pricing_viewed");
  }, []);

  function openBuy(name: string, price: number) {
    setBuy({ name, price });
    track("buy_open", { product: name });
    track("checkout_started", { product: name });
  }

  return (
    <>
      <section data-section="prices-header" className={`${art.headerHost} px-5 pt-16 pb-10 text-center sm:pt-24`}>
        <TomatoAccent />
        <div data-role="heading">
          <PricesLandscape />
          <p className="text-apple-caption text-cloud-meta">Цена</p>
          <h1 className="mx-auto mt-2 max-w-2xl font-apple-display text-[32px] leading-[1.05] font-semibold uppercase text-cloud-white sm:text-[44px]">
            {priceLabel(PRICE_MAIN)} — и система ведёт тебя до конца
          </h1>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-apple-body text-cloud-body">
          Один платёж за всё поступление. Не подписка, не тарифы, без доплат
          за этапы. Работу выполняет система — поэтому это стоит столько, а
          не как в агентстве.
        </p>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-[900px]">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 border border-white/15 p-5">
              <b className="block font-apple-text text-apple-subheading font-semibold text-cloud-white">Бесплатно</b>
              <span className="text-apple-body-sm text-cloud-body">
                ИИ оценит шансы, покажет риски и назовёт следующий шаг
              </span>
            </div>
            <span aria-hidden className="hidden text-2xl text-cloud-meta sm:block">
              →
            </span>
            <div className="flex-1 bg-carbon p-5 text-white">
              <b className="block font-apple-text text-apple-subheading font-semibold">{priceLabel(PRICE_MAIN)}</b>
              <span className="text-apple-body-sm text-cloud-meta">
                система ведёт поступление от выбора вуза до permesso
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 border border-white/15 p-5 sm:flex-row sm:items-center">
            <div>
              <b className="block text-apple-body-sm font-semibold text-cloud-white">Сначала проверь шансы — это бесплатно</b>
              <span className="text-apple-body-sm text-cloud-body">
                Расскажи о себе, и ИИ скажет, реально ли поступить и на что
                рассчитывать. Платить, чтобы это узнать, не нужно.
              </span>
            </div>
            <AppleButton type="button" variant="outlined" size="sm" onClick={() => router.push("/plan")} className="shrink-0">
              Проверить шансы
            </AppleButton>
          </div>

          <div className="mt-8 border border-white/15 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <b className="font-apple-display text-apple-subheading font-semibold text-cloud-white">Поступление под ключ</b>
              <span className="rounded-apple-pill bg-crimson px-3 py-1 text-apple-caption font-semibold text-white uppercase">
                Один платёж
              </span>
            </div>
            <p className="mt-2 text-apple-body-sm text-cloud-body">Всё, что делает система, входит в цену</p>
            <p className="mt-3 font-apple-display text-apple-display font-semibold text-cloud-white">{priceLabel(PRICE_MAIN)}</p>
            <p className="mt-1 text-apple-caption text-cloud-meta">разово · без подписки и доплат</p>
            <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 overflow-hidden border border-white/10">
              {[
                { v: "28", l: "шагов в маршруте" },
                { v: "43", l: "университета" },
                { v: "30", l: "городов" },
              ].map((s) => (
                <div key={s.l} className="px-3 py-2.5 text-center sm:px-4">
                  <p className="font-apple-display text-lg font-semibold text-cloud-white">{s.v}</p>
                  <p className="mt-0.5 text-apple-caption text-cloud-meta">{s.l}</p>
                </div>
              ))}
            </div>
            <p className="mt-4  px-4 py-3 text-apple-body-sm text-cloud-white">
              Личный кабинет с маршрутом открывается сразу после оплаты и ведёт
              весь путь — от выбора программ до первых дней в Италии.
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-apple-body-sm text-cloud-white">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-apple-caption text-cloud-meta uppercase">
              Доступ на весь цикл поступления, без ограничения по времени
            </p>
            <AppleButton
              type="button"
              variant="filled"
              onClick={() => openBuy("Поступление под ключ", PRICE_MAIN)}
              className="mt-4 w-full sm:w-auto"
            >
              Оплатить и начать
            </AppleButton>
          </div>

          <div className="mt-8 border border-green/40 bg-green/5 p-5 sm:p-6">
            <b className="block text-apple-caption font-semibold text-green uppercase">
              Гарантии и как мы снимаем риск
            </b>
            <div className="mt-3 divide-y divide-green/15">
              {GUARANTEES.map((g) => (
                <details key={g.title} className="group py-3 first:pt-0 last:pb-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-apple-body-sm font-semibold text-cloud-white marker:content-none [&::-webkit-details-marker]:hidden">
                    {g.title}
                    <svg
                      aria-hidden
                      viewBox="0 0 16 10"
                      className="h-2.5 w-4 shrink-0 text-green transition-transform duration-200 group-open:-rotate-180"
                    >
                      <path
                        d="M1 1.5 8 8.5 15 1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <p className="mt-2 text-apple-body-sm text-cloud-body">{g.body}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-6 border border-white/15 p-5">
            <b className="block text-apple-body-sm font-semibold text-cloud-white">Что система делает сама, а где решаешь ты</b>
            <p className="mt-2 text-apple-body-sm text-cloud-body">
              Подбор программ, сроки, чек-листы, черновики и проверку
              документов система делает целиком. Но есть места, где случай
              бывает нестандартным: спорная ситуация с двенадцатью годами
              образования, необычный состав семьи при расчёте ISEEU, отказ
              CIMEA, сложный визовый случай. Там ИИ подскажет, что делать, но
              подаёшь и решаешь ты. Если хочешь, чтобы на такой момент
              посмотрел живой человек — это отдельная услуга ниже.
            </p>
          </div>

          <p className="mt-10 text-apple-caption text-cloud-meta uppercase">
            Если нужен живой человек
          </p>
          <p className="mt-2 text-apple-body-sm text-cloud-body">
            Не входит в цену и не обязательно. Берут те, у кого нестандартный
            случай или просто хочется, чтобы проверил человек.
          </p>
          <div className="mt-4 space-y-3">
            {MICRO.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => openBuy(m.name, m.price)}
                className="flex w-full items-center justify-between gap-4 border border-white/15 p-4 text-left transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
              >
                <div>
                  <b className="block text-apple-body-sm font-semibold text-cloud-white">{m.name}</b>
                  <span className="text-apple-body-sm text-cloud-body">{m.desc}</span>
                </div>
                <span className="shrink-0 font-apple-display text-apple-subheading font-semibold whitespace-nowrap text-cloud-white">
                  {m.price.toLocaleString("ru-RU")} ₸
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <BuyModal product={buy} onClose={() => setBuy(null)} />
      <HeadingPin section="prices-header" />
    </>
  );
}
