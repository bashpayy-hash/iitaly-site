"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useUniversityChoice } from "@/lib/useUniversityChoice";
import { WIZ, type WizAnswers } from "@/data/wizard";
import { buildPlan } from "@/lib/planBuilder";
import { EMPTY_PLAN_DRAFT, usePlanDraft } from "@/lib/usePlanDraft";
import { Wizard } from "./Wizard";
import { PlanResult } from "./PlanResult";
import { PlanAnswers } from "./PlanAnswers";
import { AppleCaption, AppleHeading } from "@/components/apple/Typography";
import styles from "@/components/marketing/marketing.module.css";
import { GuidePlanContext } from "@/components/guides/GuidePlanContext";
import workspace from "./plan-workspace.module.css";
import { revealElement } from "@/components/motion/scroll";
import disclosure from "@/components/ui/disclosure.module.css";
import swap from "@/components/motion/swap.module.css";

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

/* «Начать заново» стирало все ответы одним нажатием, без подтверждения и без
   возврата (проход на интуитивность, 21 Nov). Теперь кнопка сначала
   спрашивает; безопасный ответ получает фокус. */
function DraftFooter({ onRestart }: { onRestart: () => void }) {
  const [asking, setAsking] = useState(false);
  const keep = useRef<HTMLButtonElement>(null);
  const restart = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);
  const question = useId();
  useEffect(() => {
    if (asking) keep.current?.focus({ preventScroll: true });
    else if (refocus.current) { refocus.current = false; restart.current?.focus({ preventScroll: true }); }
  }, [asking]);
  return <div className={workspace.footer} data-plan-footer>
    <p>Ответы сохраняются на этом устройстве. Телефон и файлы в черновик не записываются.</p>
    {asking
      ? <div className={`${workspace.confirm} ${swap.fade}`} role="group" aria-labelledby={question} data-plan-restart-confirm>
        <span id={question}>Стереть все ответы?</span>
        <button ref={keep} type="button" onClick={() => { refocus.current = true; setAsking(false); }}>Оставить</button>
        <button type="button" data-danger onClick={() => { setAsking(false); onRestart(); }}>Стереть</button>
      </div>
      : <button ref={restart} type="button" onClick={() => setAsking(true)}>Начать заново</button>}
  </div>;
}

export function PlanExplorer() {
  const [draft, updateDraft] = usePlanDraft();
  const plan = draft.complete ? buildPlan(draft.answers) : null;
  // The list of answers opened from a ready plan (see PlanAnswers).
  // /plan?answers=1 opens it at once: the cabinet's «Изменить ответы анкеты»
  // leads here instead of restarting the questionnaire (22 Nov).
  const [reviewing, setReviewing] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("answers") === "1");
  const review = !!plan && reviewing;
  // The plan and the list of answers arrive (motion/swap.module.css) when the
  // visitor brings them up; a saved plan opened by a page load is just there.
  const [arrived, setArrived] = useState(false);
  // The heading changes its words only between the plan and the list.
  const [retitled, setRetitled] = useState(false);

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

  function showPlan() {
    setArrived(true);
    setRetitled(true);
    setReviewing(false);
    // Leave the address without the list's mark, so a reload shows the plan.
    const url = new URL(window.location.href);
    if (url.searchParams.has("answers")) { url.searchParams.delete("answers"); window.history.replaceState(window.history.state, "", url); }
    focusPlan();
  }

  function handleDone(answers: WizAnswers) {
    setArrived(true);
    setReviewing(false);
    updateDraft({ answers, step: WIZ.length, complete: true });
    focusPlan();
  }

  return (
    <>
      <section data-section="plan-header" className={workspace.header}>
        {/* Owner, 7 Nov: «текст должен быть посередине, а на фоне Веспи, чуть
           заблюрено; фон менее кричащий, более исторический, детализированный».
           22 Nov: «анимацию убери, поставь какую-то другую, но нормальную
           иллюстрацию»; on the first still (Vespi set behind a desk in an
           empty study): «иллюстрация должна быть динамичной, живой,
           итальянской. Пропорции должны сохраняться»; on a brighter rendered
           scene: «в более таком реалисте… Вернись к этому стилю, который был
           раньше… все иллюстрации, которые на сайте».
           So the scene is one still picture in the site's own manner, an
           editorial photograph of a real place with the cotton toy in it (as
           the Bologna arcade and the Florence belvedere): a stone terrace
           over Florence at golden hour, Vespi mid-step launching a paper
           plane, three more gliding toward the Duomo, sheets lifting off an
           iron table under a lemon tree. Prompt, references and retouching:
           design/illustrations/scenes-2026-11-22.json. The heading stands on
           the open sky; the veil keeps it legible. */}
        <div className={workspace.hero}>
          <div className={workspace.heroScene} data-plan-hero-scene aria-hidden="true">
            {/* On a phone the tile is a tall strip of the scene's middle, so it has
                its own square crop around Vespi: at the 1200px ceiling a phone
                is sent (design-image-fit-review) he is 1.8 times sharper than
                in the wide frame, in fewer bytes. */}
            {/* 23 Nov (owner: «оптимизируй сайт, чтобы все быстрее
                прогружалось»): the same frames in AVIF come first, a third
                lighter at the same likeness to the master (the phone's
                1170px: 128 → 86 KB); WebP stays for browsers without AVIF
                (design/illustrations/source/scenes/plan-terrace-avif.py). */}
            <picture>
              <source media="(max-width: 640px)" type="image/avif" sizes="calc(100vw - 24px)"
                srcSet="/illustrations/scenes/plan-terrace-phone-780.avif 780w, /illustrations/scenes/plan-terrace-phone-1170.avif 1170w" />
              <source media="(max-width: 640px)" sizes="calc(100vw - 24px)"
                srcSet="/illustrations/scenes/plan-terrace-phone-780.webp 780w, /illustrations/scenes/plan-terrace-phone-1170.webp 1170w" />
              <source type="image/avif" sizes="(max-width: 1240px) calc(100vw - 24px), 1200px"
                srcSet="/illustrations/scenes/plan-terrace-960.avif 960w, /illustrations/scenes/plan-terrace-1200.avif 1200w, /illustrations/scenes/plan-terrace-1920.avif 1920w, /illustrations/scenes/plan-terrace-2560.avif 2560w" />
              <img className={workspace.heroArt} src="/illustrations/scenes/plan-terrace-1920.webp"
                srcSet="/illustrations/scenes/plan-terrace-960.webp 960w, /illustrations/scenes/plan-terrace-1200.webp 1200w, /illustrations/scenes/plan-terrace-1920.webp 1920w, /illustrations/scenes/plan-terrace-2560.webp 2560w"
                sizes="(max-width: 1240px) calc(100vw - 24px), 1200px" width={1920} height={1043} alt=""
                decoding="async" fetchPriority="high" draggable={false} data-plan-scene="terrace" />
            </picture>
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
              <h2 key={review ? "answers" : "plan"} className={retitled ? swap.fade : undefined}>{review ? "Твои ответы" : "Твой план поступления"}</h2>
              {/* «Персональный трек» was a third name for the route (22 Nov). */}
              {!plan && <span className={workspace.badge}>~2 минуты</span>}
              {/* The same place as «Изменить ответы» beside «Твой маршрут»: the
                  way back is where the way in was. */}
              {review && <button type="button" className={`${workspace.headingAction} ${swap.fade}`} onClick={showPlan} data-plan-answers-back>Вернуться к плану</button>}
            </div>
            {review ? (
              <PlanAnswers answers={draft.answers} onChange={(id, value) => updateDraft({ ...draft, answers: { ...draft.answers, [id]: value } })} onDone={showPlan} />
            ) : plan ? (
              <PlanResult plan={plan} arriving={arrived} onReset={() => { setArrived(true); setRetitled(true); setReviewing(true); focusPlan(); }} />
            ) : (
              <Wizard draft={draft} onDraftChange={updateDraft} onDone={handleDone} />
            )}
            {/* With a ready plan the result already says where answers live and
               offers «Изменить ответы»; the footer would repeat both. */}
            {(review || (!plan && Object.keys(draft.answers).length > 0))
              ? <DraftFooter onRestart={() => { setReviewing(false); updateDraft(EMPTY_PLAN_DRAFT); focusPlan(); }} />
              : !plan && <div className={workspace.footer}><p>Ответы сохраняются на этом устройстве. Телефон и файлы в черновик не записываются.</p></div>}
          </div>
        </div>
      </section>
    </>
  );
}
