"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { AppleCaption, AppleHeading } from "@/components/apple/Typography";
import styles from "@/components/marketing/marketing.module.css";
import { GuidePlanContext } from "@/components/guides/GuidePlanContext";
import { DocCheck } from "./DocCheck";
import { PlanToolNav, PlanUniversityContext } from "./PlanExplorer";
import workspace from "./plan-workspace.module.css";
import check from "./check-page.module.css";

/* The document check on its own page (owner, 20 Nov, on /plan#document-check
   under the plan's cover: «почему здесь сверху всё ещё стоит вот эта
   иллюстрация, для проверки документов должна быть отдельная страница»). Its
   cover is its own scene: Vespi checking a certificate through a magnifying
   glass in a loggia with Florence behind (design/illustrations/scenes-2026-11-20.json).
   The heading says only what the home section already says. */
export function DocumentCheckPage() {
  return (
    <>
      <section data-section="check-header" className={workspace.header}>
        <div className={`${workspace.hero} ${check.hero}`}>
          <div className={`${workspace.heroScene} ${check.scene}`} data-check-hero-scene aria-hidden="true">
            <img className={`${workspace.heroArt} ${check.art}`} src="/illustrations/scenes/check-loggia-1600.webp"
              srcSet="/illustrations/scenes/check-loggia-960.webp 960w, /illustrations/scenes/check-loggia-1600.webp 1600w, /illustrations/scenes/check-loggia-2400.webp 2400w"
              sizes="(max-width: 1240px) calc(100vw - 24px), 1200px" width={2400} height={1357} alt=""
              decoding="async" fetchPriority="high" draggable={false} data-check-scene="loggia" />
            <span className={`${workspace.heroVeil} ${check.veil}`} />
          </div>
          <div className={`${workspace.heroCopy} ${check.copy}`} data-role="heading">
            <AppleCaption as="p" className="warm-badge">Проверка документов · 24/7</AppleCaption>
            <AppleHeading as="h1" className="mt-3 max-w-xl">
              Проверь <span className="warm-highlight">документ</span> перед подачей
            </AppleHeading>
            <p className="mt-5 max-w-lg text-apple-body">
              Справка, перевод, выписка или аттестат: ИИ сверит их с требованиями твоего вуза, DSU и визы
              на твой учебный год, обычно за 10–30 секунд. Первая проверка бесплатно, без регистрации.
            </p>
          </div>
        </div>
      </section>

      <section className={workspace.tools} data-public-paper-zone="check-tools">
        <PlanUniversityContext />
        <PlanToolNav current="check" />
        <div className={styles.planWorkspace}>
          <div id="document-check" className={workspace.document}>
            <GuidePlanContext target="document" />
            <DocCheck />
          </div>
        </div>
      </section>
    </>
  );
}
