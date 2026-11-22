import type { Metadata } from "next";
import { pageMeta } from "@/app/pageMeta";
import { notFound } from "next/navigation";
import { GUIDE_STAGES } from "@/components/guides/guideCatalogue";
import { GuideBreadcrumbs, GuideFrame } from "@/components/guides/GuidePage";
import { GuideTiles } from "@/components/guides/GuideTiles";
import { GUIDE_TOPICS } from "@/components/guides/guideCatalogue";
import { GuideReadingContext } from "@/components/guides/GuideReadingContext";
import { GuideRoad } from "@/components/guides/GuideRoad";
import { stageRoad } from "@/components/guides/guideRoads";
import ui from "@/components/guides/guide-pages.module.css";

export const dynamicParams = false;
export function generateStaticParams(){return GUIDE_STAGES.map(stage=>({stage:stage.id}));}
export async function generateMetadata({params}:{params:Promise<{stage:string}>}):Promise<Metadata> {
  const {stage}=await params;const group=GUIDE_STAGES.find(item=>item.id===stage);
  return pageMeta({path:`/guides/stages/${stage}`,title:group?.title ?? "Гайды",description:group?.description});
}
export default async function GuideStageRoute({params}:{params:Promise<{stage:string}>}) {
  const {stage}=await params;const group=GUIDE_STAGES.find(item=>item.id===stage);if(!group)notFound();
  return <GuideFrame><GuideReadingContext /><GuideBreadcrumbs items={[{title:group.title}]} />
    <div className={ui.article}>
    <header className={ui.articleHeader}><h1>{group.title}</h1><p className={ui.intro}>{group.description}</p></header>
    {/* 19 Nov (phone pass): the chat button covered the row's «Следующая тема»
        arrow — all of it on a 360px phone, 32–40px of it at 768–1280px. The
        row is a yield target, so the button steps aside while it is under it
        (ChatLauncher). */}
    <div data-fab-yield><GuideTiles guides={group.ids.map(id => GUIDE_TOPICS.find(topic => topic.id === id)!)} /></div>
    {/* The station of /guides, opened: the same road, this section only. */}
    <div className={ui.indexRoad}><GuideRoad id={`stage-${group.id}`} heading="Путь по разделу" stations={stageRoad(group.id)} scenery={GUIDE_STAGES.findIndex(item => item.id === group.id) * 2} /></div>
    </div>
  </GuideFrame>;
}
