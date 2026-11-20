import type { Metadata } from "next";
import { GuideFrame } from "@/components/guides/GuidePage";
import { PlanStepPage } from "@/components/plan/PlanStepPage";
import { PLAN_STEP_PAGES } from "@/components/plan/planRoute";

/* Шаг плана на своей странице (owner, 20 Nov). Страницы одинаковые для
   всех: план собирается в браузере из ответов анкеты, поэтому в поиск они
   не идут, канонический адрес — /plan. */
export const dynamicParams = false;
export function generateStaticParams() {
  return Array.from({ length: PLAN_STEP_PAGES }, (_, index) => ({ n: String(index + 1) }));
}
export const metadata: Metadata = {
  title: "Шаг маршрута — Мой план",
  description: "Шаг персонального маршрута поступления: что это, что сделать сейчас и официальные источники.",
  alternates: { canonical: "/plan" },
  robots: { index: false, follow: true },
};

export default async function PlanStepRoute({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  return <GuideFrame narrow><PlanStepPage position={Number(n) - 1} /></GuideFrame>;
}
