"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { guideAction, openGuideHelper, type GuideId } from "./guideJourney";
import { track } from "@/lib/track";
import ui from "./guide-pages.module.css";

export function GuideReadingContext({ id }: { id?: GuideId }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("iitaly:guide-context", { detail: { guideId: id } }));
    if (id) track("guide_topic_opened", { topic: id, source: "page" });
    return () => { window.dispatchEvent(new CustomEvent("iitaly:guide-context", { detail: {} })); };
  }, [id]);
  return null;
}

export function GuideHelperLink({ id }: { id?: GuideId }) {
  return <button type="button" className={ui.textLink} onClick={() => {
    track("guide_helper_opened", { topic: id || "overview" }); openGuideHelper(id);
  }}>Есть вопрос? Спроси Веспи<ArrowUpRight size={16} aria-hidden="true" /></button>;
}

export function GuideActionLink({ id }: { id: GuideId }) {
  const action = guideAction(id);
  return <Link href={action.href} className={ui.primary} data-guide-inline-action onClick={() => track("guide_next_action", { topic: id, source: "page" })}>{action.label}<ArrowUpRight size={17} aria-hidden="true" /></Link>;
}
