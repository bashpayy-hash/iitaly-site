import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { EditorialMotion } from "@/components/marketing/EditorialMotion";
import { Hero } from "@/components/home/Hero";
import { DocumentCheckFeature } from "@/components/home/DocumentCheckFeature";
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
        {/* Owner, 13 Nov: проверка документов — киллер-фича, сразу после первого экрана. */}
        <DocumentCheckFeature />
        <Split />
        {/* 22 Nov: «Начать с Веспи» led to the cabinet, where a first-time visitor
            met «Заполнить анкету» and no Vespi. The button names the free way in
            and leads to it. */}
        <VespiIntroSection href="/plan#questionnaire" action="Составить план с Веспи" />
        <FeatureBanner />
        <TrustFAQ />
      </div>
      <EditorialMotion />
    </MarketingLayout>
  );
}
