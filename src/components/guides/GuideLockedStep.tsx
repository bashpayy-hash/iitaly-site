"use client";

import { useEffect, useState } from "react";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { GuideSentences } from "./GuideSentences";
import { GuideWall } from "./GuideWall";
import styles from "./guide-wall.module.css";

/* Закрытый шаг темы. До оплаты — столько же пустых пунктов, сколько в
   разборе, и стена. На устройстве с кабинетом текст подгружается отдельным
   модулем и встаёт на место пунктов той же разметкой, что у открытого шага. */
export function GuideLockedStep({ id, step, count }: { id: string; step: number; count: number }) {
  const paid = usePaidDevice();
  const [body, setBody] = useState<{ sentences: string[]; text: string } | null>(null);
  useEffect(() => {
    if (!paid) return;
    let live = true;
    void import("./guideStepText").then(module => { if (live) setBody(module.guideStepText(id, step)); });
    return () => { live = false; };
  }, [paid, id, step]);
  if (paid && body) return <GuideSentences sentences={body.sentences} text={body.text} />;
  return <div className={styles.lockedStep} data-guide-step-locked>
    <ol className={styles.ghost} aria-hidden="true">
      {Array.from({ length: Math.max(1, count) }, (_, index) => <li key={index}><span>{index + 1}</span><div><i /><i /></div></li>)}
    </ol>
    {!paid && <GuideWall place="guide-step" />}
  </div>;
}
