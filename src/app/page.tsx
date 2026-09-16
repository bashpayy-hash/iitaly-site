import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { StickyHeroFrame } from "@/components/home/StickyHeroFrame";
import { Ticker } from "@/components/home/Ticker";
import { PositanoReveal } from "@/components/home/PositanoReveal";
import { Stats } from "@/components/home/Stats";
import { Steps } from "@/components/home/Steps";
import { Split } from "@/components/home/Split";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FirstWeeks } from "@/components/home/FirstWeeks";
import { TrustFAQ } from "@/components/home/TrustFAQ";
import { PriceBand } from "@/components/home/PriceBand";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        {/* Первый экран липкий, всё остальное наезжает на него сверху —
           экран не уезжает, а уходит под лист с разделами.

           Только с lg. На телефоне это лишний закреплённый слой во весь
           экран на всю длину страницы: композитор держит его до самого
           подвала, а аудитория здесь — недорогие Android на медленном
           интернете. Выгода от приёма там же, где и мощность.

           z-0 против z-10 у ленты: без явного слоя порядок отрисовки
           решала бы позиционированность каждой секции по отдельности —
           а Ticker, например, не позиционирован и ушёл бы ПОД липкий
           первый экран. Одна обёртка снимает вопрос для всех разделов
           разом. */}
        <StickyHeroFrame>
          <Hero />
        </StickyHeroFrame>
        {/* Разделы — единый лист, выезжающий снизу куполом: скруглённая
           кромка с чернильной обводкой, в двух верхних углах виден первый
           экран под ней.

           Радиус эллиптический, а не круговой. Круговые 64px на листе
           шириной 1440px трогают только по 64px с каждого края — на экране
           неразличимо, проверял. Здесь горизонтальный радиус равен половине
           ширины, вертикальный 40/88px: две дуги сходятся по центру и дают
           широкий пологий купол во всю ширину окна.

           Купол рисуют два фоновых слоя, а НЕ обрезка всего листа.
           Сначала было overflow-hidden с радиусом прямо на этой обёртке —
           и это стоило половины кадров: браузер клипует по эллипсу слой
           высотой во всю страницу (около 7000px) на каждом кадре прокрутки.
           Замер: 18 fps с обрезкой против 32 без неё.
           Теперь кромка — отдельный короткий элемент высотой ровно в
           глубину дуги. Радиус обрезает собственные фон и рамку элемента,
           overflow для этого не нужен вовсе, а клипуется 88px вместо 7000.

           Оба слоя за содержимым (-z-10) и оба aria-hidden: это фон. */}
        <div className="relative z-10 pt-10 sm:pt-22">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 -z-10 h-10 border-t-2 border-ink bg-paper [border-radius:50%_50%_0_0/2.5rem_2.5rem_0_0] sm:h-22 sm:[border-radius:50%_50%_0_0/5.5rem_5.5rem_0_0]"
          />
          <div aria-hidden className="absolute inset-0 top-10 -z-10 bg-paper sm:top-22" />
          <Ticker />
          <PositanoReveal />
          <Stats />
          <Steps />
          <Split />
          <HowItWorks />
          <FirstWeeks />
          <TrustFAQ />
          <PriceBand />
        </div>
      </main>
      <Footer />
    </>
  );
}
