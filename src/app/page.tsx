import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
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
        <div className="lg:sticky lg:top-0 lg:z-0">
          <Hero />
        </div>
        <div className="relative z-10">
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
