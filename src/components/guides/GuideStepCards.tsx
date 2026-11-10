"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Plus } from "lucide-react";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { GuideCarousel } from "./GuideCarousel";
import styles from "./guide-steps.module.css";

export type GuideStepCard = { title: string; href: string;
  /** First sentence of an open step; a closed step (guideAccess.ts) has none. */
  teaser?: string };

/* Ряд карточек «Разбор по шагам» по образцу «Learn all about iPhone»:
   карточки светлые и тёмные поочерёдно, ряд листается стрелками или свайпом.
   Owner, 4 Nov (скрин с телефона): без «Шаг 01» и крупных цифр — место шага
   показывают точки, карточка несёт название и первое предложение разбора;
   сам разбор живёт на отдельной странице каждого шага. Ряд — та же
   карусель, что у тем: уходит до краёв окна, первая карточка по колонке.
   Owner, 9 Nov: карточки приходят с сервера уже раскроенными. У закрытого
   шага вместо первого предложения — «Откроется с маршрутом»; устройство с
   оплаченным кабинетом подгружает первые предложения отдельно.
   Owner, 10 Nov («в формате пути, который как прогресс-бар»): над карточками
   идёт дорога — номер шага на линии, у закрытого шага замок и пунктир к нему.
   Она заменила точки внутри карточек. */
export function GuideStepCards({ id, points }: { id: string; points: GuideStepCard[] }) {
  const router = useRouter();
  const paid = usePaidDevice();
  const closed = points.filter(point => point.teaser === undefined).length;
  const [teasers, setTeasers] = useState<string[] | null>(null);
  // Old links from the inline switcher (/guides/tests?point=2) open that step's page.
  useEffect(() => {
    const point = Number(new URLSearchParams(window.location.search).get("point"));
    const target = points[point - 1];
    if (Number.isInteger(point) && target) router.replace(target.href);
  }, [points, router]);
  useEffect(() => {
    if (!paid || !closed) return;
    let live = true;
    void import("./guideStepText").then(module => { if (live) setTeasers(module.guideStepTeasers(id)); });
    return () => { live = false; };
  }, [paid, closed, id]);
  if (!points.length) return null;
  const opened = points.length - closed;
  return <section className={styles.steps} aria-labelledby="guide-steps-heading" data-guide-steps-row={id}>
    <div className={styles.head}>
      <h2 id="guide-steps-heading">Разбор по шагам</h2>
      <p>{points.length} {points.length === 1 ? "шаг" : points.length < 5 ? "шага" : "шагов"} · {closed && !paid ? `${opened} ${opened === 1 ? "открыт" : "открыты"}, остальные — с маршрутом` : "каждый на своей странице"}</p>
    </div>
    <GuideCarousel label="Шаги разбора" titles={points.map(point => point.title)} tone="light" fit="column" arrowLabels={["Предыдущие шаги", "Следующие шаги"]}>
      {points.map((point, index) => {
        const teaser = point.teaser ?? (paid ? teasers?.[index] : undefined);
        const locked = point.teaser === undefined && !paid;
        return <li key={point.href} className={styles.item} data-tone={index % 2 ? "dark" : "light"} data-locked={locked || undefined}>
          <div className={styles.stopCard}>
          <span className={styles.stopRow} aria-hidden="true" data-guide-road-stop={index + 1}><span className={styles.stopNode}>{locked ? <Lock size={14} strokeWidth={2.4} /> : index + 1}</span></span>
          <Link className={styles.card} href={point.href} data-guide-step-card={index + 1} data-guide-step-locked={locked || undefined} data-visa-part={id === "visa" ? point.href.split("/").pop() : undefined}
            aria-label={`Шаг ${index + 1} из ${points.length}: ${point.title}${locked ? " — откроется с маршрутом" : ""}`}>
            <span className={styles.title}>{point.title}</span>
            {locked ? <span className={styles.locked}>Откроется с маршрутом</span> : teaser && <span className={styles.teaser}>{teaser}</span>}
            <span className={styles.plus} aria-hidden="true"><Plus size={18} strokeWidth={2.2} /></span>
          </Link>
          </div>
        </li>;
      })}
    </GuideCarousel>
  </section>;
}
