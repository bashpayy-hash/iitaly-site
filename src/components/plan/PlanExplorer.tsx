"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { useEffect } from "react";
import Link from "next/link";
import { useUniversityChoice } from "@/lib/useUniversityChoice";
import { WIZ, type WizAnswers } from "@/data/wizard";
import { buildPlan } from "@/lib/planBuilder";
import { EMPTY_PLAN_DRAFT, usePlanDraft } from "@/lib/usePlanDraft";
import { Wizard } from "./Wizard";
import { PlanResult } from "./PlanResult";
import { AppleCaption, AppleHeading } from "@/components/apple/Typography";
import styles from "@/components/marketing/marketing.module.css";
import { GuidePlanContext } from "@/components/guides/GuidePlanContext";
import workspace from "./plan-workspace.module.css";
import { revealElement } from "@/components/motion/scroll";
import disclosure from "@/components/ui/disclosure.module.css";
import { LivingLandscape } from "@/components/motion/LivingLandscape";

/* The university chosen in the catalogue, above both free tools (the plan and,
   since 20 Nov, the separate document check page /check). */
export function PlanUniversityContext() {
  const { primary } = useUniversityChoice();
  if (!primary) return null;
  return <>
    <div className={workspace.universityChoice} data-plan-university={primary.id}>
      <p><span>Основной вуз</span><strong>{primary.name}</strong></p>
      <Link href="/universities#compare-universities">Изменить выбор</Link>
    </div>
    <details className={workspace.selectedContext} data-plan-university-context>
      <summary className={disclosure.row}>Условия {primary.name}</summary>
      <dl><div><dt>Экзамен / отбор</dt><dd>{primary.test}</dd></div><div><dt>Подача · по базе</dt><dd>{primary.dl}</dd></div><div><dt>Стоимость в год</dt><dd>{primary.tu}</dd></div></dl>
      <p>Это контекст выбранного вуза. Персональные шаги ниже формируются по твоим ответам; условия конкретной программы нужно сверить.</p>
    </details>
  </>;
}

export function PlanExplorer() {
  const [draft, updateDraft] = usePlanDraft();
  const plan = draft.complete ? buildPlan(draft.answers) : null;

  // The document check has its own page since 20 Nov. Old links and
  // bookmarks to /plan#document-check land there.
  useEffect(() => {
    const move = () => { if (window.location.hash === "#document-check") window.location.replace(`/check${window.location.search}`); };
    move();
    window.addEventListener("hashchange", move);
    return () => window.removeEventListener("hashchange", move);
  }, []);

  function focusPlan() {
    requestAnimationFrame(() => {
      const target = document.getElementById("questionnaire");
      target?.focus({ preventScroll: true });
      revealElement(target, "start");
    });
  }

  function handleDone(answers: WizAnswers) {
    updateDraft({ answers, step: WIZ.length, complete: true });
    focusPlan();
  }

  return (
    <>
      <section data-section="plan-header" className={workspace.header}>
        {/* Owner, 7 Nov: «текст должен быть посередине, а на фоне Веспи, чуть
           заблюрено; фон менее кричащий, более исторический, детализированный».
           Одна плитка: спокойная ренессансная лоджия старого университета,
           Веспи пишет план за столом внизу по центру, текст — над ним по
           центру. Размытие за текстом вшито в постер и в петлю (мягкий овал),
           поэтому не стоит ничего на телефоне; светлая вуаль держит контраст.
           Картинка — постер и вся сцена при «меньше движения». */}
        <div className={workspace.hero}>
          <div className={workspace.heroScene} data-plan-hero-scene aria-hidden="true">
            <img className={workspace.heroArt} src="/illustrations/scenes/plan-loggia-1920.webp"
              srcSet="/illustrations/scenes/plan-loggia-960.webp 960w, /illustrations/scenes/plan-loggia-1920.webp 1920w, /illustrations/scenes/plan-loggia-2560.webp 2560w"
              sizes="(max-width: 1240px) calc(100vw - 24px), 1200px" width={1920} height={1080} alt=""
              decoding="async" fetchPriority="high" draggable={false} data-plan-scene="loggia" />
            {/* Starts at frame 104, just before Vespi turns the page: from frame 0 he
                barely moved for 3.7 s (owner, 17 Nov: «какое-то время просто стоят»).
                The poster is that frame. */}
            <LivingLandscape className={workspace.heroArt} base="/illustrations/motion/plan-loggia" label="plan-loggia" widths={[960, 1600, 2560]} webmWidths={[960]} startAt={104.5 / 30} />
            <span className={workspace.heroVeil} />
          </div>
          <div className={workspace.heroCopy} data-role="heading">
            <AppleCaption as="p" className="warm-badge">Персональный маршрут</AppleCaption>
            <AppleHeading as="h1" className="mx-auto mt-3 max-w-xl">
              Опиши свою <span className="warm-highlight">ситуацию</span>
            </AppleHeading>
            <p className="mx-auto mt-5 max-w-lg text-apple-body">
              {WIZ.length} вопросов, затем понятные шаги и список документов.
              Бесплатно, без регистрации.
            </p>
          </div>
        </div>
      </section>

      <section className={workspace.tools} data-public-paper-zone="plan-tools">
        <PlanUniversityContext />
        <div className={styles.planWorkspace}>
          <div id="questionnaire" tabIndex={-1} className={workspace.questionnaire}>
            <GuidePlanContext target="plan" />
            <div className={workspace.heading}>
              <h2>Твой план поступления</h2>
              {!plan && <span className={workspace.badge}>~2 минуты · Персональный трек</span>}
            </div>
            {plan ? (
              <PlanResult plan={plan} onReset={() => { updateDraft({ ...draft, complete: false, step: 0 }); focusPlan(); }} />
            ) : (
              <Wizard draft={draft} onDraftChange={updateDraft} onDone={handleDone} />
            )}
            {/* With a ready plan the result already says where answers live and
               offers «Изменить ответы»; the footer would repeat both. */}
            {!plan && <div className={workspace.footer}>
              <p>Ответы сохраняются на этом устройстве. Телефон и файлы в черновик не записываются.</p>
              {Object.keys(draft.answers).length > 0 && <button type="button" className="min-h-11 underline underline-offset-4" onClick={() => { updateDraft(EMPTY_PLAN_DRAFT); focusPlan(); }}>Начать заново</button>}
            </div>}
          </div>
        </div>
      </section>
    </>
  );
}
