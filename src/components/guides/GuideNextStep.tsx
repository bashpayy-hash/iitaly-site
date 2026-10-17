"use client";

import Link from "next/link";
import { Vespi } from "@/components/mascot/Vespi";
import { track } from "@/lib/track";
import { GUIDE_HELP, guideAction, type GuideId } from "./guideJourney";
import styles from "@/components/marketing/marketing.module.css";
import ui from "./guide-browser.module.css";

export function GuideNextStep({ id }: { id: GuideId }) {
  const help = GUIDE_HELP[id], action = guideAction(id);
  return <section className={ui.nextStep} data-guide-next={id} aria-label="Следующее действие по теме">
    <Vespi variant="avatar" className={ui.nextAvatar} sizes="(max-width: 600px) 40px, 56px" />
    <div>
      <h3>Применить к моей ситуации</h3>
      <p>{help.next}</p>
      <Link href={action.href} data-fab-yield className={`${styles.button} ${styles.filled}`}
        onClick={() => track("guide_next_action", { topic: id, action: help.action })}>{action.label}</Link>
      <small>{action.note}</small>
    </div>
  </section>;
}
