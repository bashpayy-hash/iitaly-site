"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { AppleCaption, AppleHeading } from "@/components/apple/Typography";
import { AppleButton } from "@/components/apple/Button";
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
/* CRO audit (owner, 20 Nov: «делай тогда те самые 5 правок»). Whoever tapped
   «Проверить документ» landed on a heading and a picture: the upload began
   1.9 screens down on a phone and below the fold on a laptop. The first screen
   now carries the action. It opens the same file picker as the form below (one
   input, one state) and then brings the chosen file and «Проверить документ»
   into view; while the service is still being checked it just scrolls there. */
function UploadNow() {
  function choose() {
    const zone = document.getElementById("document-check");
    const input = zone?.querySelector<HTMLInputElement>('input[type="file"]');
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!zone || !input || input.disabled) {
      zone?.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
      return;
    }
    input.addEventListener("change", () => {
      window.setTimeout(() => {
        const run = [...zone.querySelectorAll("button")].find(button => /Проверить документ/.test(button.textContent || ""));
        (run ?? zone).scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" });
      }, 200);
    }, { once: true });
    input.click();
  }
  return <div className="mt-6" data-check-upload-now>
    <AppleButton type="button" variant="filled" onClick={choose} className="max-sm:w-full">Загрузить документ</AppleButton>
    <p className="mt-2 text-[13px] leading-relaxed text-cloud-meta">Фото, PDF или Word · первая проверка бесплатно</p>
  </div>;
}

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
            <UploadNow />
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
