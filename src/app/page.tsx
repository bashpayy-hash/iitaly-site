import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { EditorialMotion } from "@/components/marketing/EditorialMotion";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeatureBanner } from "@/components/home/FeatureBanner";
import { Split } from "@/components/home/Split";
import { Stats } from "@/components/home/Stats";
import { TrustFAQ } from "@/components/home/TrustFAQ";
import { PriceBand } from "@/components/home/PriceBand";

export default function Home() {
  return (
    <MarketingLayout home>
      <div data-editorial-home>
        <Hero />
        <Stats />
        <HowItWorks />
        <Split />
        <FeatureBanner />
        <PriceBand />
        <TrustFAQ />
      </div>
      <EditorialMotion />
    </MarketingLayout>
  );
}
