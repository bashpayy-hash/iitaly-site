import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDE_TOPICS, guidePoints } from "@/components/guides/guideCatalogue";
import { GuideStepPage } from "@/components/guides/GuideStepPage";

export const dynamicParams = false;
export function generateStaticParams() {
  return GUIDE_TOPICS.filter(guide => guide.id !== "visa").flatMap(guide => guidePoints(guide.id).map((_, index) => ({ topic: guide.id, step: String(index + 1) })));
}
export async function generateMetadata({ params }: { params: Promise<{ topic: string; step: string }> }): Promise<Metadata> {
  const { topic, step } = await params;
  const guide = GUIDE_TOPICS.find(item => item.id === topic);
  const point = guidePoints(topic)[Number(step) - 1];
  return { title: point && guide ? `${point.title} — ${guide.title}` : guide?.title, description: point?.text.slice(0, 160), alternates: { canonical: `/guides/${topic}/${step}` } };
}
export default async function GuideStepRoute({ params }: { params: Promise<{ topic: string; step: string }> }) {
  const { topic, step } = await params;
  const index = Number(step);
  if (!GUIDE_TOPICS.some(guide => guide.id === topic) || topic === "visa" || !Number.isInteger(index) || index < 1 || index > guidePoints(topic).length) notFound();
  return <GuideStepPage id={topic} step={index} />;
}
