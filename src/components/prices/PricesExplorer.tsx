"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { BuyModal, type BuyProduct } from "./BuyModal";
import { track } from "@/lib/track";

const FEATURES = [
  "Персональный shortlist программ под твои баллы и бюджет",
  "Расчёт шансов на стипендию DSU по доходу семьи",
  "Календарь дедлайнов с напоминаниями в Telegram и на почту",
  "Точные чек-листы документов под твой случай",
  "AI-проверка каждого документа до подачи",
  "Черновики мотивационных писем и анкет",
  "Пошаговое ведение через Universitaly, DSU и визу D",
  "Отслеживание прогресса и предупреждения об ошибках",
];

const MICRO = [
  { name: "Проверка пакета DSU · до 45 мин", desc: "Эксперт вычитывает весь комплект перед подачей, до 45 минут", price: 39900 },
  { name: "Созвон с экспертом · 20 мин", desc: "Разобрать сложный случай голосом, с письменным резюме", price: 20900 },
  { name: "Срочная проверка · 1 документ", desc: "Вердикт человека в течение 24 часов", price: 16900 },
];

export function PricesExplorer() {
  const router = useRouter();
  const [buy, setBuy] = useState<BuyProduct | null>(null);

  function openBuy(name: string, price: number) {
    setBuy({ name, price });
    track("buy_open", { product: name });
  }

  return (
    <>
      <section className="overflow-hidden border-b-2 border-ink px-5 pt-10 pb-8 sm:pt-14">
        <div className="mx-auto max-w-[900px]">
          <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">Цена</p>
          <h1 className="mt-2 font-display text-[8vw] leading-[0.95] font-black tracking-tight uppercase sm:text-[5vw] lg:text-[3.2vw]">
            25 000 ₸ — и система ведёт тебя до конца
          </h1>
          <p className="mt-5 max-w-2xl text-base text-ink-soft sm:text-lg">
            Один платёж за всё поступление. Не подписка, не тарифы, без доплат
            за этапы. Работу выполняет система — поэтому это стоит столько, а
            не как в агентстве.
          </p>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-[900px]">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 rounded-lg border-2 border-ink bg-paper p-5">
              <b className="block font-display text-lg font-black">Бесплатно</b>
              <span className="text-sm text-ink-soft">
                ИИ оценит шансы, покажет риски и назовёт следующий шаг
              </span>
            </div>
            <span aria-hidden className="hidden text-2xl text-ink-soft sm:block">
              →
            </span>
            <div className="flex-1 rounded-lg border-2 border-ink bg-ink p-5 text-cream shadow-red">
              <b className="block font-display text-lg font-black">25 000 ₸</b>
              <span className="text-sm text-cream/70">
                система ведёт поступление от выбора вуза до permesso
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border-2 border-ink bg-paper p-5 sm:flex-row sm:items-center">
            <div>
              <b className="block text-sm">Сначала проверь шансы — это бесплатно</b>
              <span className="text-sm text-ink-soft">
                Расскажи о себе, и ИИ скажет, реально ли поступить и на что
                рассчитывать. Платить, чтобы это узнать, не нужно.
              </span>
            </div>
            <Button type="button" variant="ghost" onClick={() => router.push("/plan")} className="shrink-0">
              Проверить шансы
            </Button>
          </div>

          <div className="mt-8 rounded-xl border-2 border-ink bg-paper p-6 shadow-red sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <b className="font-display text-xl font-black">Поступление под ключ</b>
              <span className="rounded-pill bg-red px-3 py-1 text-xs font-extrabold text-cream uppercase">
                Один платёж
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-soft">Всё, что делает система, входит в цену</p>
            <p className="mt-3 font-display text-5xl font-black sm:text-6xl">25 000 ₸</p>
            <p className="mt-1 text-sm text-ink-soft">разово · без подписки и доплат</p>
            <p className="mt-4 rounded-md bg-cream px-4 py-3 text-sm">
              Личный кабинет с маршрутом открывается сразу после оплаты и ведёт
              весь путь — от выбора программ до первых дней в Италии.
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs font-bold text-ink-soft uppercase">
              Доступ на весь цикл поступления, без ограничения по времени
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => openBuy("Поступление под ключ", 25000)}
              className="mt-4 w-full sm:w-auto"
            >
              Оплатить и начать
            </Button>
          </div>

          <div className="mt-8 rounded-lg border-2 border-ink bg-paper p-5">
            <b className="block text-sm">Что система делает сама, а где решаешь ты</b>
            <p className="mt-2 text-sm text-ink-soft">
              Подбор программ, сроки, чек-листы, черновики и проверку
              документов система делает целиком. Но есть места, где случай
              бывает нестандартным: спорная ситуация с двенадцатью годами
              образования, необычный состав семьи при расчёте ISEEU, отказ
              CIMEA, сложный визовый случай. Там ИИ подскажет, что делать, но
              подаёшь и решаешь ты. Если хочешь, чтобы на такой момент
              посмотрел живой человек — это отдельная услуга ниже.
            </p>
          </div>

          <p className="mt-10 text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
            Если нужен живой человек
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Не входит в цену и не обязательно. Берут те, у кого нестандартный
            случай или просто хочется, чтобы проверил человек.
          </p>
          <div className="mt-4 space-y-3">
            {MICRO.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => openBuy(m.name, m.price)}
                className="flex w-full items-center justify-between gap-4 rounded-lg border-2 border-ink bg-paper p-4 text-left transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
              >
                <div>
                  <b className="block text-sm">{m.name}</b>
                  <span className="text-sm text-ink-soft">{m.desc}</span>
                </div>
                <span className="shrink-0 font-display text-lg font-black whitespace-nowrap">
                  {m.price.toLocaleString("ru-RU")} ₸
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <BuyModal product={buy} onClose={() => setBuy(null)} />
    </>
  );
}
