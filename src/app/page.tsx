import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeatureBanner } from "@/components/home/FeatureBanner";
import { Split } from "@/components/home/Split";
import { Stats } from "@/components/home/Stats";
import { TrustFAQ } from "@/components/home/TrustFAQ";
import { PriceBand } from "@/components/home/PriceBand";
import { ScrollTransitions } from "@/components/motion/ScrollTransitions";

/**
 * Порядок секций главной. Холст даёт SkyBackground (фото неба), сами
 * секции прозрачны — поэтому фонов здесь нет ни у одной.
 *
 * ScrollTransitions стоит последним и вне <main>: он не рисует ничего
 * своего, а навешивает ScrollTrigger на data-section соседних блоков.
 * Внутри main он попал бы под собственные же клипы.
 *
 * Прежний комментарий здесь описывал раскладку с полосами Дуомо, ночной
 * Мадонниной и карточкой DSU — её больше нет, и оставлять описание
 * несуществующего ритма хуже, чем не иметь описания вовсе.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <HowItWorks />
        <FeatureBanner />
        <Split />
        <Stats />
        <TrustFAQ />
        <PriceBand />
      </main>
      <Footer />
      <ScrollTransitions />
    </>
  );
}
