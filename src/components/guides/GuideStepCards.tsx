"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { guidePoints } from "./guideCatalogue";
import styles from "./guide-steps.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/* Ряд карточек «Разбор по шагам» по образцу «Learn all about iPhone»:
   метка шага, заголовок в две строки, крупная цифра и плюс. Без текста
   разбора — он живёт на отдельной странице каждого шага. Карточки светлые и
   тёмные поочерёдно, ряд листается стрелками или свайпом. */
export function GuideStepCards({ id }: { id: string }) {
  const row = useRef<HTMLOListElement>(null);
  const router = useRouter();
  const points = guidePoints(id);
  // Old links from the inline switcher (/guides/tests?point=2) open that step's page.
  useEffect(() => {
    const point = Number(new URLSearchParams(window.location.search).get("point"));
    const target = guidePoints(id)[point - 1];
    if (Number.isInteger(point) && target) router.replace(target.href);
  }, [id, router]);
  if (!points.length) return null;
  const scroll = (direction: number) => {
    const element = row.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({ left: direction * element.clientWidth * .8, behavior: reduced ? "auto" : "smooth" });
  };
  return <section className={styles.steps} aria-labelledby="guide-steps-heading" data-guide-steps-row={id}>
    <div className={styles.head}>
      <h2 id="guide-steps-heading">Разбор по шагам</h2>
      <p>{points.length} {points.length === 1 ? "шаг" : points.length < 5 ? "шага" : "шагов"} · каждый на своей странице</p>
    </div>
    <ol className={styles.row} ref={row}>
      {points.map((point, index) => <li key={point.href} data-tone={index % 2 ? "dark" : "light"}>
        <Link className={styles.card} href={point.href} data-guide-step-card={index + 1} data-visa-part={id === "visa" ? point.href.split("/").pop() : undefined}>
          <span className={styles.label}>Шаг {pad(index + 1)}</span>
          <span className={styles.title}>{point.title}</span>
          <span className={styles.numeral} aria-hidden="true">{pad(index + 1)}</span>
          <span className={styles.plus} aria-hidden="true"><Plus size={18} strokeWidth={2.2} /></span>
        </Link>
      </li>)}
    </ol>
    {points.length > 2 && <div className={styles.arrows}>
      <button type="button" aria-label="Предыдущие шаги" onClick={() => scroll(-1)}><ChevronLeft size={18} aria-hidden="true" /></button>
      <button type="button" aria-label="Следующие шаги" onClick={() => scroll(1)}><ChevronRight size={18} aria-hidden="true" /></button>
    </div>}
  </section>;
}
