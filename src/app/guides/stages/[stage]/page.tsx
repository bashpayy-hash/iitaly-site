import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDE_STAGES } from "@/components/guides/guideCatalogue";
import { GuideBreadcrumbs, GuideFrame } from "@/components/guides/GuidePage";
import { GuideTiles } from "@/components/guides/GuideTiles";
import { GUIDE_TOPICS } from "@/components/guides/guideCatalogue";
import { GuideReadingContext } from "@/components/guides/GuideReadingContext";
import ui from "@/components/guides/guide-pages.module.css";

export const dynamicParams = false;
export function generateStaticParams(){return GUIDE_STAGES.map(stage=>({stage:stage.id}));}
export async function generateMetadata({params}:{params:Promise<{stage:string}>}):Promise<Metadata> {
  const {stage}=await params;const group=GUIDE_STAGES.find(item=>item.id===stage);
  return {title:group?.title,description:group?.description,alternates:{canonical:`/guides/stages/${stage}`}};
}
export default async function GuideStageRoute({params}:{params:Promise<{stage:string}>}) {
  const {stage}=await params;const group=GUIDE_STAGES.find(item=>item.id===stage);if(!group)notFound();
  return <GuideFrame><GuideReadingContext /><GuideBreadcrumbs items={[{title:group.title}]} />
    <div className={ui.article}>
    <header className={ui.articleHeader}><h1>{group.title}</h1><p className={ui.intro}>{group.description}</p></header>
    <GuideTiles guides={group.ids.map(id => GUIDE_TOPICS.find(topic => topic.id === id)!)} />
    </div>
  </GuideFrame>;
}
