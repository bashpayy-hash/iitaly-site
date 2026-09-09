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
      <main>
        <Hero />
        <Ticker />
        <PositanoReveal />
        <Stats />
        <Steps />
        <Split />
        <HowItWorks />
        <FirstWeeks />
        <TrustFAQ />
        <PriceBand />
      </main>
      <Footer />
    </>
  );
}
