import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDE_STAGES } from "@/components/guides/guideCatalogue";
import { GuideBreadcrumbs, GuideFrame, GuideTopicLinks } from "@/components/guides/GuidePage";
import { GuideReadingContext } from "@/components/guides/GuideReadingContext";
import ui from "@/components/guides/guide-pages.module.css";
import { RisoSpot } from "@/components/marketing/PublicPaper";

export const dynamicParams = false;
export function generateStaticParams(){return GUIDE_STAGES.map(stage=>({stage:stage.id}));}
export async function generateMetadata({params}:{params:Promise<{stage:string}>}):Promise<Metadata> {
  const {stage}=await params;const group=GUIDE_STAGES.find(item=>item.id===stage);
  return {title:group?.title,description:group?.description,alternates:{canonical:`/guides/stages/${stage}`}};
}
export default async function GuideStageRoute({params}:{params:Promise<{stage:string}>}) {
  const {stage}=await params;const group=GUIDE_STAGES.find(item=>item.id===stage);if(!group)notFound();
  return <GuideFrame narrow><GuideReadingContext /><GuideBreadcrumbs items={[{title:group.title}]} />
    <div className={ui.article}>
    <RisoSpot subject={stage === "choose" ? "calendar" : stage === "arrival" ? "key" : "envelope"} placement="article" />
    <header className={ui.articleHeader}><h1>{group.title}</h1><p className={ui.intro}>{group.description}</p></header>
    <GuideTopicLinks ids={group.ids} />
    </div>
  </GuideFrame>;
}
