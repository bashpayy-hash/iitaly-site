import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeatureBanner } from "@/components/home/FeatureBanner";
import { Split } from "@/components/home/Split";
import { Stats } from "@/components/home/Stats";
import { TrustFAQ } from "@/components/home/TrustFAQ";
import { PriceBand } from "@/components/home/PriceBand";

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
    </>
  );
}
