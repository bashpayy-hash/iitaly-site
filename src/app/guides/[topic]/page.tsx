import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDE_TOPICS } from "@/components/guides/guideCatalogue";
import { GuideTopicPage } from "@/components/guides/GuidePage";

export const dynamicParams = false;
export function generateStaticParams() { return GUIDE_TOPICS.filter(guide=>guide.id!=="visa").map(guide=>({topic:guide.id})); }
export async function generateMetadata({params}:{params:Promise<{topic:string}>}):Promise<Metadata> {
  const {topic}=await params; const guide=GUIDE_TOPICS.find(guide=>guide.id===topic);
  return {title:guide?.title,description:guide?.teaser,alternates:{canonical:`/guides/${topic}`}};
}
export default async function GuideTopicRoute({params}:{params:Promise<{topic:string}>}) {
  const {topic}=await params;
  if(!GUIDE_TOPICS.some(guide=>guide.id===topic))notFound();
  return <GuideTopicPage id={topic} />;
}
