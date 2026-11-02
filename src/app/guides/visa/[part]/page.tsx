import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideTopicPage } from "@/components/guides/GuidePage";
import { VISA_PARTS } from "@/components/guides/guideCatalogue";

export const dynamicParams=false;
export function generateStaticParams(){return VISA_PARTS.map(part=>({part:part.id}));}
export async function generateMetadata({params}:{params:Promise<{part:string}>}):Promise<Metadata> {
  const {part}=await params;const detail=VISA_PARTS.find(item=>item.id===part);
  return {title:`${detail?.title} — виза D`,description:detail?.description,alternates:{canonical:`/guides/visa/${part}`}};
}
export default async function VisaPartRoute({params}:{params:Promise<{part:string}>}){
  const {part}=await params;const detail=VISA_PARTS.find(item=>item.id===part);if(!detail)notFound();
  return <GuideTopicPage id="visa" visaPart={detail.id} />;
}
