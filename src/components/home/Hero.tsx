"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AppleButton } from "@/components/apple/Button";
import { AppleWhisper, AppleEyebrow } from "@/components/apple/Typography";
import { Applicant } from "@/components/character/Applicant";
import { track } from "@/lib/track";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";

/**
 * Первый экран: небо во всю ширину, текст в колонке 720px по центру.
 *
 * Композиция. Фон край в край, содержимое — узкой колонкой: это и есть
 * разница между «широкой секцией» и «широким текстом». Строка в 1990px
 * не читается, а небо в 1990px работает.
 *
 * Воронка одна, а не две равноправные кнопки. Раньше здесь стояли filled и
 * outlined рядом — человек выбирал между двумя действиями вместо того,
 * чтобы сделать одно. Теперь: одна мысль, одно закрашенное действие, поле
 * ввода под ним и «Смотреть университеты» текстовой ссылкой ниже.
 *
 * Поле ввода — не чат с моделью. Оно переносит первую фразу человека в
 * квиз как есть, через query-параметр; дальше работает тот же мастер из
 * шести вопросов, что и всегда. Смысл поля в том, что писать своими
 * словами проще, чем начинать с чужого вопроса.
 */
export function Hero() {
  const router = useRouter();
  const [seed, setSeed] = useState("");

  function go(from: "cta" | "seed") {
    const text = seed.trim();
    track("hero_to_plan", { from, withText: text.length > 0 });
    router.push(text ? `/plan?q=${encodeURIComponent(text.slice(0, 200))}` : "/plan");
  }

  return (
    <section className="relative isolate overflow-hidden">
      {/* Три слоя неба: градиент, облачная дымка, зерно. Все три —
         absolute-подложки под содержимым, ни один не участвует в потоке. */}
      <div aria-hidden className="sky-dawn absolute inset-0 -z-30" />
      <div aria-hidden className="sky-haze absolute inset-0 -z-20" />
      <div aria-hidden className="sky-grain absolute inset-0 -z-10" />

      <div className="mx-auto max-w-[720px] px-5 pt-16 pb-40 text-center sm:pt-24 sm:pb-52">
        <AppleEyebrow as="p" className="text-rosso">
          Абитуриентам Казахстана 16–18 лет
        </AppleEyebrow>

        {/* Курсив на одном слове — приём Origin: не выделение смысла, а
           смена дыхания внутри строки. */}
        <AppleWhisper as="h1" className="mt-5">
          Поступать <span className="italic">в Италию</span>
        </AppleWhisper>

        <p className="mx-auto mt-6 max-w-[34rem] font-apple-text text-apple-body text-[#3a3a3a] sm:text-apple-subheading">
          Подбор вузов, документы и виза — ведёт система. Ты поступаешь, она
          держит сроки и проверяет каждую бумагу до подачи.
        </p>

        <div className="mt-9">
          <AppleButton variant="filled" onClick={() => go("cta")} className="px-8">
            Составить план бесплатно
          </AppleButton>
        </div>

        {/* Поле под кнопкой, а не вместо неё: кнопка отвечает «просто
           начать», поле — «у меня уже есть, что сказать». */}
        <form
          className="mx-auto mt-5 flex max-w-[30rem] items-center gap-2 rounded-apple-pill border border-carbon/15 bg-white/70 py-1.5 pr-1.5 pl-5 backdrop-blur-sm transition-colors duration-200 focus-within:border-carbon/35"
          onSubmit={(e) => {
            e.preventDefault();
            go("seed");
          }}
        >
          <label htmlFor="hero-seed" className="sr-only">
            Коротко о своей ситуации
          </label>
          <input
            id="hero-seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Город, класс, бюджет семьи — или просто «хочу в Милан»"
            className="min-w-0 flex-1 bg-transparent font-apple-text text-apple-body-sm text-carbon placeholder:text-ash focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Перейти к плану"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-carbon text-white transition-colors duration-200 hover:bg-rosso"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <p className="mt-6">
          <Link
            href="/universities"
            className="font-apple-text text-apple-body-sm text-carbon underline underline-offset-4 transition-colors duration-200 hover:text-rosso"
          >
            Смотреть университеты
          </Link>
        </p>

        {/* Цена и возврат — один раз, мелко, как сноска. Не плакат. */}
        <p className="mt-10 font-mono-eyebrow text-[11px] tracking-[0.12em] text-[#4a3f3b] uppercase">
          {priceLabel(PRICE_MAIN)} · возврат 7 дней
        </p>

        {/* Единственный рукописный акцент на сайте — и он действительно
           один: сначала здесь стояла целая строка «твоё досье начинается
           здесь», но рукопись длиной в предложение перестаёт быть
           акцентом и превращается во второй подзаголовок. Осталось то,
           что несёт мысль само по себе. */}
        <p className="mt-7 font-hand text-[32px] leading-none text-[#5a4038] sm:text-[38px]">
          не агентство
        </p>
      </div>

      {/* Персонаж выглядывает из золотого пятна у левого края неба.

         Сначала он стоял по центру справа, ровно на нижней кромке неба:
         красные плечи на тёмно-терракотовом градиенте сливались с фоном,
         а голова оказывалась единственным светлым пятном — читалось как
         гриб, а не как человек. Золотое поле решает обе беды сразу: даёт
         фигуре опору и контраст, и оно же её обрезает — тот самый приём,
         где герой сидит НА пятне, а не стоит рядом с ним.

         Поле нарисовано ПОВЕРХ фигуры (z-10 против z-0). Ниже lg пятна
         нет: на узком экране этот угол занят текстом. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[4%] hidden w-[214px] lg:block xl:left-[8%]"
      >
        <Applicant pose="peek" className="relative z-0 mx-auto w-[168px]" />
        <div className="relative z-10 -mt-[18px] h-[58px] w-full rounded-t-[3px] bg-yolk" />
      </div>
    </section>
  );
}
