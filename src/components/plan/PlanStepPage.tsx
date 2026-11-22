"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP cartouches for the static export. */

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { buildPlan, type PlanStep } from "@/lib/planBuilder";
import { usePlanDraft } from "@/lib/usePlanDraft";
import { WIZ } from "@/data/wizard";
import { planStepOpen } from "@/lib/access";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { RISK_LINE } from "@/components/access/offerCopy";
import { SourceRefs } from "@/components/SourceRefs";
import { PlainTermNotes } from "@/components/ui/PlainTerms";
import { StoryPath } from "@/components/story/StoryPath";
import { GuideSentences } from "@/components/guides/GuideSentences";
import { GuideReadMark } from "@/components/guides/GuideReadMark";
import { GuideWall } from "@/components/guides/GuideWall";
import { useGuideRead } from "@/components/guides/guideReading";
import { guideSentences } from "@/components/guides/guideText";
import { planStepArt, planStepPhase } from "./planStepArt";
import { PLAN_ROUTE_HREF, planStepHref, planStepKey, stepTitleText, stepsWord } from "./planRoute";
import ui from "@/components/guides/guide-pages.module.css";
import page from "@/components/guides/guide-step-page.module.css";
import wall from "@/components/guides/guide-wall.module.css";
import disclosure from "@/components/ui/disclosure.module.css";
import styles from "./plan-step-page.module.css";

const noop = () => () => {};
/** False in the static HTML and during hydration, true after: the plan lives
 *  on this device, so until then the page cannot know it. */
function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

function teaser(step: PlanStep) {
  return guideSentences(step.summary || step.p)[0] || step.summary || step.p;
}

function Crumbs({ title }: { title?: string }) {
  return <nav className={ui.breadcrumbs} aria-label="Путь по плану"><ol>
    <li><Link href={PLAN_ROUTE_HREF}>Мой план</Link></li>
    {title && <li><span aria-current="page">{title}</span></li>}
  </ol></nav>;
}

/* Страница одного шага плана (owner, 20 Nov: «он нажимал на кнопку „Далее“,
   его переносило на другую страницу, где всё это нормально описывается в
   стиле всего сайта»). Та же раскладка, что у шага гайда: этап над
   заголовком, картуш шага справа, путь по всем шагам маршрута, разбор
   короткими пунктами, затем действие и источники, внизу — «Назад» и
   «Дальше» карточками. Открытая страница отмечает шаг разобранным на этом
   устройстве — на пути в плане он становится зелёным. Закрытый до оплаты шаг
   показывает первое предложение, пустые строки на месте остального и стену
   с ценой, как закрытый шаг гайда. */
export function PlanStepPage({ position }: { position: number }) {
  const hydrated = useHydrated();
  const [draft] = usePlanDraft();
  const plan = useMemo(() => draft.complete ? buildPlan(draft.answers) : null, [draft]);
  const paid = usePaidDevice();
  const read = useGuideRead();

  if (!hydrated) return <div className={styles.waiting} aria-busy="true" data-plan-step-waiting><Crumbs /></div>;
  if (!plan) return <div className={styles.empty} data-plan-step-empty>
    <Crumbs />
    <h1>Маршрут ещё не собран</h1>
    <p>План собирается на этом устройстве по ответам анкеты: {WIZ.length} вопросов, бесплатно и без регистрации.</p>
    <Link className={styles.primary} href="/plan#questionnaire">Ответить на вопросы</Link>
  </div>;
  const steps = plan.steps, total = steps.length;
  if (!(position >= 0 && position < total)) return <div className={styles.empty} data-plan-step-empty>
    <Crumbs />
    <h1>В твоём маршруте {total} {stepsWord(total)}</h1>
    <p>Такого шага в нём нет&nbsp;— возможно, ответы изменились.</p>
    <Link className={styles.primary} href={PLAN_ROUTE_HREF}>Весь маршрут</Link>
  </div>;

  const step = steps[position];
  const title = stepTitleText(step.t);
  const open = (index: number) => paid || planStepOpen(index);
  const isOpen = open(position);
  const art = planStepArt(step.t).frame;
  const previous = position > 0 ? position - 1 : null, next = position < total - 1 ? position + 1 : null;
  const key = planStepKey(step);
  // The visit marks this step read; count it already, so the encouragement
  // under the step agrees with the path at once.
  const readCount = steps.filter((item, index) => open(index) && (read.has(planStepKey(item)) || (index === position && isOpen))).length;
  const openCount = steps.filter((_, index) => open(index)).length;
  const caption = paid ? "Всё открыто: на этом устройстве выполнен вход в кабинет"
    : openCount < total ? `Открыто ${openCount} из ${total} · остальные\u00A0— с маршрутом` : undefined;
  const sentences = guideSentences(step.summary || step.p);
  const hidden = 2;

  return <article className={ui.article} data-plan-step={position + 1} data-instruction-point={position + 1} data-step-locked={!isOpen || undefined} aria-labelledby="plan-step-title">
    <Crumbs title={title} />
    <header className={page.header}>
      <div>
        <p className={page.position}>{planStepPhase(step.t)}</p>
        <h1 id="plan-step-title" tabIndex={-1}>{title}</h1>
        <p className={ui.reviewed}>Правила проверены <span className={ui.date}>{plan.reviewed}</span></p>
      </div>
      <img className={`${page.art} ${styles.art}`} src={art.src} srcSet={art.srcSet} sizes="(max-width: 700px) 30vw, 200px" width={art.width} height={art.height} alt="" decoding="async" fetchPriority="high" />
    </header>
    <div className={page.path}>
      <StoryPath label="Шаги маршрута" noun="Шаг" index={position} caption={caption} href={planStepHref} prefetch={false}
        stops={steps.map((item, index) => ({ id: String(index), title: stepTitleText(item.t), locked: !open(index), checked: index !== position && open(index) && read.has(planStepKey(item)) }))} />
    </div>
    <GuideReadMark readKey={key} open={isOpen} />

    {isOpen ? <>
      <GuideSentences sentences={sentences} text={step.summary || step.p} />
      <section className={styles.action} data-assessment-next-action aria-labelledby="plan-step-action">
        {step.action && <>
          <h2 id="plan-step-action">Что сделать сейчас</h2>
          <p>{step.action}</p>
        </>}
        <details className={styles.references}>
          <summary className={disclosure.row}>Условия и официальные источники</summary>
          <p>{step.p}</p>
          {step.sources?.length ? <SourceRefs ids={step.sources} /> : null}
        </details>
      </section>
      <PlainTermNotes text={[title, step.summary, step.p, step.action].filter(Boolean).join(" ")} />
      <p className={styles.progress} data-plan-step-progress role="status">
        <Check size={16} strokeWidth={2.6} aria-hidden="true" />
        <span>Шаг отмечен на маршруте · разобрано {readCount} из {total}</span>
      </p>
    </> : <div className={wall.lockedStep} data-guide-step-locked>
      <div className={wall.lead} data-guide-step-lead><span aria-hidden="true">1</span><p>{teaser(step)}</p></div>
      <ol className={wall.ghost} aria-hidden="true" start={2}>
        {Array.from({ length: hidden }, (_, index) => <li key={index}><span>{index + 2}</span><div><i /><i /></div></li>)}
      </ol>
      <GuideWall place="plan-step" note="Дальше в шаге: что именно сделать, требования, сроки и официальные источники. Откроются с маршрутом вместе с остальными шагами, проверкой документов без лимита и напоминаниями." />
      <p className={styles.risk} data-wall-risk>{RISK_LINE}</p>
    </div>}

    {/* A guest on the locked last step has not passed the route: the closing
        note and its cabinet button are for a step that was read (22 Nov). */}
    {next === null && isOpen && <section className={page.finish} aria-label="Маршрут пройден">
      <p>Это последний шаг маршрута. Сроки, документы и напоминания по всем шагам&nbsp;— в личном кабинете.</p>
      <Link className={styles.primary} href="/portal">Продолжить в личном кабинете</Link>
    </section>}

    <nav className={page.pager} aria-label="Соседние шаги" data-fab-yield>
      {previous !== null
        ? <Link className={page.pagerCard} href={planStepHref(previous)} data-plan-step-prev><span><small>Назад</small>{stepTitleText(steps[previous].t)}</span></Link>
        : <Link className={page.pagerCard} href={PLAN_ROUTE_HREF}><span><small>К плану</small>Весь маршрут</span></Link>}
      {next !== null
        ? <Link className={`${page.pagerCard} ${page.forward}`} href={planStepHref(next)} data-instruction-next data-plan-step-next><span><small>Дальше{!open(next) && "\u00A0· с маршрутом"}</small>{stepTitleText(steps[next].t)}</span></Link>
        : <Link className={`${page.pagerCard} ${page.forward}`} href={PLAN_ROUTE_HREF}><span><small>{isOpen ? "Готово" : "К плану"}</small>{isOpen ? "Вернуться к маршруту" : "Весь маршрут"}</span></Link>}
    </nav>
    {/* On the first and the last step the pager itself leads back to the route. */}
    {previous !== null && next !== null && <footer className={ui.articleFooter}>
      <Link href={PLAN_ROUTE_HREF} className={ui.textLink}>Весь маршрут</Link>
    </footer>}
  </article>;
}
