"use client";

import { useEffect, useState } from "react";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { GuideSentences } from "./GuideSentences";
import { GuideWall } from "./GuideWall";
import styles from "./guide-wall.module.css";

const pointsWord = (n: number) => n % 10 === 1 && n % 100 !== 11 ? "пункт" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "пункта" : "пунктов";

/* Закрытый шаг темы. До оплаты — первая фраза разбора (что это и зачем,
   owner 12 Nov: «слишком много информации бесплатно»), серые строки на месте
   остальных пунктов и стена, которая говорит, сколько ещё за ней. На
   устройстве с кабинетом текст подгружается отдельным модулем и встаёт на
   место пунктов той же разметкой, что у открытого шага. */
export function GuideLockedStep({ id, step, count, lead = null }: { id: string; step: number; count: number; lead?: string | null }) {
  const paid = usePaidDevice();
  const [body, setBody] = useState<{ sentences: string[]; text: string } | null>(null);
  useEffect(() => {
    if (!paid) return;
    let live = true;
    void import("./guideStepText").then(module => { if (live) setBody(module.guideStepText(id, step)); });
    return () => { live = false; };
  }, [paid, id, step]);
  if (paid && body) return <GuideSentences sentences={body.sentences} text={body.text} />;
  const hidden = Math.max(1, lead ? count - 1 : count);
  return <div className={styles.lockedStep} data-guide-step-locked>
    {lead && <div className={styles.lead} data-guide-step-lead><span aria-hidden="true">1</span><p>{lead}</p></div>}
    <ol className={styles.ghost} aria-hidden="true" start={lead ? 2 : 1}>
      {Array.from({ length: hidden }, (_, index) => <li key={index}><span>{index + (lead ? 2 : 1)}</span><div><i /><i /></div></li>)}
    </ol>
    {!paid && <GuideWall place="guide-step" note={`${lead ? "Дальше ещё" : "В разборе"} ${hidden} ${pointsWord(hidden)}: что именно сделать, суммы, сроки и ссылки. Откроются с маршрутом вместе с остальными гайдами, визой и проверкой документов — один платёж, не подписка.`} />}
  </div>;
}
