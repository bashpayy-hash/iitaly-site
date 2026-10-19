import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { EditorialMotion } from "@/components/marketing/EditorialMotion";
import { Hero } from "@/components/home/Hero";
import { VespiIntroSection } from "@/components/mascot/VespiIntroSection";
import { FeatureBanner } from "@/components/home/FeatureBanner";
import { Split } from "@/components/home/Split";
import { TrustFAQ } from "@/components/home/TrustFAQ";
import { StructuredData } from "@/components/marketing/StructuredData";

export default function Home() {
  return (
    <MarketingLayout home>
      <StructuredData />
      <div data-editorial-home>
        <Hero />
        <Split />
        <VespiIntroSection />
        <FeatureBanner />
        <TrustFAQ />
      </div>
      <EditorialMotion />
    </MarketingLayout>
  );
}
