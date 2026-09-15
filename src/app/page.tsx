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
        {/* Разделы — единый лист, выезжающий снизу куполом: скруглённая
           кромка с чернильной обводкой, в двух верхних углах виден
           первый экран под ней. Радиус большой намеренно — при 12–16px
           это читается как случайно скруглённый блок, а не как край
           листа.

           Радиус эллиптический, а не круговой, и это принципиально.
           Круговые 64px на листе шириной 1440px трогают только по 64px с
           каждого края — на экране это неразличимо, проверял. Здесь
           горизонтальный радиус — половина ширины, вертикальный — 40/88px:
           две дуги сходятся по центру и дают широкий пологий купол во всю
           ширину окна, который и читается как край выезжающего листа.

           Обводка только сверху: лист во всю ширину окна, боковые рамки
           стали бы двумя вертикальными линиями по краям экрана.

           overflow-hidden обязателен — без него тёмная заливка ленты
           внутри легла бы поверх скруглённых углов и срезала бы всю
           дугу. Липких потомков в разделах нет, так что обрезка ничего
           не ломает (проверено грепом по sticky).

           Верхний отступ равен глубине купола, и это не «воздух для
           красоты»: без него дуга проходила прямо по ленте терминов
           (высота 48px против 88px дуги) и срезала слова по краям —
           читалось как дефект, а не как приём. Кромка набрана на paper,
           а не на cream: смена поверхности сама по себе отделяет раздел
           от первого экрана, без ещё одной линейки. */}
        <div className="relative z-10 overflow-hidden border-t-2 border-ink bg-paper pt-10 [border-radius:50%_50%_0_0/2.5rem_2.5rem_0_0] sm:pt-22 sm:[border-radius:50%_50%_0_0/5.5rem_5.5rem_0_0]">
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
