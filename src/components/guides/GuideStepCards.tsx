"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { guidePoints } from "./guideCatalogue";
import { guideTeaser } from "./guideText";
import { GuideCarousel } from "./GuideCarousel";
import styles from "./guide-steps.module.css";

/* Ряд карточек «Разбор по шагам» по образцу «Learn all about iPhone»:
   карточки светлые и тёмные поочерёдно, ряд листается стрелками или свайпом.
   Owner, 4 Nov (скрин с телефона): без «Шаг 01» и крупных цифр — место шага
   показывают точки, карточка несёт название и первое предложение разбора;
   сам разбор живёт на отдельной странице каждого шага. Ряд — та же
   карусель, что у тем: уходит до краёв окна, первая карточка по колонке. */
export function GuideStepCards({ id }: { id: string }) {
  const router = useRouter();
  const points = guidePoints(id);
  // Old links from the inline switcher (/guides/tests?point=2) open that step's page.
  useEffect(() => {
    const point = Number(new URLSearchParams(window.location.search).get("point"));
    const target = guidePoints(id)[point - 1];
    if (Number.isInteger(point) && target) router.replace(target.href);
  }, [id, router]);
  if (!points.length) return null;
  return <section className={styles.steps} aria-labelledby="guide-steps-heading" data-guide-steps-row={id}>
    <div className={styles.head}>
      <h2 id="guide-steps-heading">Разбор по шагам</h2>
      <p>{points.length} {points.length === 1 ? "шаг" : points.length < 5 ? "шага" : "шагов"} · каждый на своей странице</p>
    </div>
    <GuideCarousel label="Шаги разбора" titles={points.map(point => point.title)} tone="light" fit="column" arrowLabels={["Предыдущие шаги", "Следующие шаги"]}>
      {points.map((point, index) => <li key={point.href} className={styles.item} data-tone={index % 2 ? "dark" : "light"}>
        <Link className={styles.card} href={point.href} data-guide-step-card={index + 1} data-visa-part={id === "visa" ? point.href.split("/").pop() : undefined}
          aria-label={`Шаг ${index + 1} из ${points.length}: ${point.title}`}>
          <span className={styles.pips} aria-hidden="true" data-step-pips>{points.map((_, pip) => <i key={pip} data-on={pip === index || undefined} />)}</span>
          <span className={styles.title}>{point.title}</span>
          <span className={styles.teaser}>{guideTeaser(point.text)}</span>
          <span className={styles.plus} aria-hidden="true"><Plus size={18} strokeWidth={2.2} /></span>
        </Link>
      </li>)}
    </GuideCarousel>
  </section>;
}
