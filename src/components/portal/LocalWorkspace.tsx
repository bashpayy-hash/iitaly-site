"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import { LayoutDashboard, ListChecks, Files, Settings, ShieldCheck, FileText } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { VespiAvatar } from "@/components/mascot/Vespi";
import { usePlanDraft } from "@/lib/usePlanDraft";
import { buildLocalWorkspace, localWorkspaceScope, useLocalWorkspace } from "@/lib/localWorkspace";
import { buildPlan } from "@/lib/planBuilder";
import { documentOutcome } from "@/lib/portalDocument";
import { portalPosition, taskReadOnlyReason, taskTitle } from "@/lib/portalNavigation";
import { DOC_TASKS } from "@/lib/portalMeta";
import type { PortalDoc, PortalTask } from "@/lib/portalApi";
import type { DocCheckResult } from "@/lib/checkDocument";
import { nearestUniversityDeadline } from "@/lib/portalShortlist";
import { Wizard } from "@/components/plan/Wizard";
import { DocCheck } from "@/components/plan/DocCheck";
import { PortalUniversityStep } from "./PortalUniversityStep";
import { PlanSection } from "./PlanSection";
import { PortalRoad, type RoadTravel } from "./PortalRoad";
import { PortalDocumentReport } from "./PortalDocumentReport";
import { PortalDocumentCoach } from "./PortalDocumentCoach";
import { WorkspaceCoach } from "./WorkspaceCoach";
import { PortalUniversitySummary } from "./PortalUniversitySummary";
import { PortalStepInstructions } from "./PortalStepInstructions";
import { SavedProfileAnswers } from "./SavedProfileAnswers";
import { portalProgress, portalTaskDone, portalTaskStageOpen } from "@/lib/portalProgress";
import { taskQuestions } from "@/lib/portalStepCopy";
import { PortalWelcome } from "./PortalWelcome";
import portal from "./portal.module.css";
import styles from "./workspace.module.css";

const PortalPermessoStep = dynamic(() => import("./PortalPermessoStep").then(module => module.PortalPermessoStep), { loading: () => <p role="status">Загружаю бланк…</p> });
type View = "today" | "plan" | "docs" | "settings";
type Location = { view: View; task: string | null; doc: string | null };
const NAV = [{ view: "today" as const, title: "Обзор", Icon: LayoutDashboard }, { view: "plan" as const, title: "План", Icon: ListChecks }, { view: "docs" as const, title: "Документы", Icon: Files }];
function readLocation(): Location {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("view");
  const view = raw === "settings" || raw === "help" || raw === "profile" ? "settings" : raw === "docs" || raw === "plan" ? raw : "today";
  return { view, task: view === "plan" ? params.get("task") : null, doc: view === "docs" ? params.get("doc") : null };
}
const DOCUMENT_INFO: Record<string, { purpose: "uni" | "dsu" | "visa"; where: string; validity: string }> = {
  apostille: { purpose: "uni", where: "eGov / ЦОН · орган образования", validity: "Комплект и формат — по требованиям получателя." },
  translate: { purpose: "uni", where: "Переводчик · способ заверения по инструкции получателя", validity: "Проверь имя, приложение и текст апостиля." },
  familyDocs: { purpose: "dsu", where: "eGov / ЦОН · органы по виду справки", validity: "Год и актуальность — только из bando своего конкурса." },
  statements: { purpose: "visa", where: "Банк · документы спонсора, если применимо", validity: "Период и срок выдачи — по чек-листу своего консульства." },
  housing: { purpose: "visa", where: "Арендодатель / общежитие", validity: "Условия подтверждения — по консульскому чек-листу." },
};

/** No synthetic login and no portal API calls: guest state is a separate local
 * workspace. Authenticated profiles keep their existing controller and data. */
export function LocalWorkspace() {
  const [draft, updateDraft] = usePlanDraft();
  const [storedLocal, updateLocal] = useLocalWorkspace();
  const applicationYear = draft.answers.intake === "2026/27" || draft.answers.intake === "2027/28" ? draft.answers.intake : "unspecified";
  const scope = localWorkspaceScope(draft, storedLocal.selectedIds);
  const local = useMemo(() => storedLocal.scope === scope ? storedLocal : { ...storedLocal, scope, done: {}, reviews: {} }, [storedLocal, scope]);
  const [reportCache, setReportCache] = useState<Record<string, Record<string, PortalDoc>>>({});
  const reports = useMemo(() => reportCache[scope] || {}, [reportCache, scope]);
  const [location, setLocation] = useState<Location>({ view: "today", task: null, doc: null });
  const [roadTravel, setRoadTravel] = useState<RoadTravel>();
  const travelSequence = useRef(0);
  const [purpose, setPurpose] = useState("all");
  const data = useMemo(() => buildLocalWorkspace(draft, local, reports), [draft, local, reports]);
  const position = portalPosition(data);
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  const active = tasks.find(task => task.id === (location.doc || location.task));
  const documents = tasks.filter(task => DOC_TASKS[task.id]);
  const plan = draft.complete ? buildPlan(draft.answers) : null;
  const wizardOpen = active?.id === "profile" && !draft.complete;
  const chrome = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = chrome.current;
    if (!element) return;
    const measure = () => element.parentElement?.style.setProperty("--portal-chrome-height", `${element.getBoundingClientRect().height}px`);
    measure(); const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, [wizardOpen]);

  useEffect(() => {
    const sync = () => setLocation(readLocation());
    sync(); window.addEventListener("popstate", sync);
    return () => { window.removeEventListener("popstate", sync); };
  }, []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: active ? { taskId: active.id, taskTitle: taskTitle(active), taskContext: active.explain, taskDone: portalTaskDone(data, active), questions: taskQuestions(active, portalTaskDone(data, active)) } : {} }));
    return () => { window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: {} })); };
  }, [active, data]);

  function navigate(next: Location) {
    const url = next.doc ? `/portal?view=docs&doc=${encodeURIComponent(next.doc)}` : next.task ? `/portal?view=plan&task=${encodeURIComponent(next.task)}` : next.view === "today" ? "/portal" : `/portal?view=${next.view}`;
    window.history.pushState({ portalBackHref: window.location.pathname + window.location.search }, "", url);
    setLocation(next); window.scrollTo({ top: 0, behavior: "instant" });
  }
  function link(event: MouseEvent<HTMLAnchorElement>, next: Location) {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(next);
  }
  function openTask(task: PortalTask, intent?: "instruction" | "upload") {
    const document = DOC_TASKS[task.id] && intent !== "instruction";
    navigate({ view: document ? "docs" : "plan", task: document ? null : task.id, doc: document ? task.id : null });
  }
  function complete(task: PortalTask) {
    if (task.id !== position.task?.id || task.available === false || DOC_TASKS[task.id]) return;
    if (!data.done[task.id]) setRoadTravel({ fromDone:portalProgress(data).done, id:++travelSequence.current });
    updateLocal({ ...local, done: { ...local.done, [task.id]: true } });
    navigate({ view: "today", task: null, doc: null });
  }
  function onReview(task: PortalTask, result: DocCheckResult, fileName?: string) {
    const report: PortalDoc = { fileName, verdict: result.verdict || "warn", summary: result.summary, result, checkedAt: new Date().toISOString(), routeAcademicYear: applicationYear };
    const kind = documentOutcome(report, applicationYear).kind;
    const approved = kind === "approved";
    if (approved && !data.done[task.id]) setRoadTravel({ fromDone:portalProgress(data).done, id:++travelSequence.current });
    setReportCache(current => ({ ...current, [scope]: { ...current[scope], [task.id]: report } }));
    // A missing programme/context is an uncertainty, never a file defect or an
    // approval. Only a real passed review closes a file step.
    updateLocal({ ...local, reviews: { ...local.reviews, [task.id]: kind }, done: { ...local.done, [task.id]: approved } });
    navigate({ view: "today", task: null, doc: null });
  }
  const cloudLoginHref = location.view === "today" ? "/portal?view=login" : `/portal?view=${location.view}&auth=login${location.doc ? `&doc=${encodeURIComponent(location.doc)}` : location.task ? `&task=${encodeURIComponent(location.task)}` : ""}`;
  const showDetail = active && (location.task || location.doc);
  const readOnly = active ? taskReadOnlyReason(data, active) : "";
  const existing = active ? data.docs[active.id] : undefined;
  const documentInspectorOpen = Boolean(active && DOC_TASKS[active.id] && portalTaskStageOpen(data, active.id) && (!readOnly || Boolean(existing && portalTaskDone(data, active))));
  const intake = draft.answers.intake === "2027/28" ? "сентябрь 2027" : draft.answers.intake === "2026/27" ? "2026/27" : "год ещё не выбран";
  const clarify = documents.find(task => data.docs[task.id] && documentOutcome(data.docs[task.id], applicationYear).kind !== "missing");

  return <div className={`${portal.portal} ${styles.workspace}`} data-local-workspace data-portal-design="shared-site">
    <div ref={chrome} className={styles.header}><MarketingHeader variant="portal" onHome={() => navigate({ view: "today", task: null, doc: null })} actions={<div className={styles.headerActions}>
      <a href="#iitaly-chat" data-portal-assistant data-step-id={active?.id || ""} onClick={event => { event.preventDefault(); window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "portal-header", taskId: active?.id, taskTitle: active ? taskTitle(active) : undefined, taskContext: active?.explain, taskDone: active ? portalTaskDone(data, active) : false, questions: active ? taskQuestions(active, portalTaskDone(data, active)) : undefined } })); }}><VespiAvatar /><span>Помощник</span></a>
      <a href="/portal?view=settings" aria-label="Настройки" aria-current={location.view === "settings" ? "page" : undefined} onClick={event => link(event, { view: "settings", task: null, doc: null })}><Settings size={18} aria-hidden="true"/><span className={styles.settingsText}>Настройки</span></a>
    </div>} />{!wizardOpen && location.view !== "today" && <div className={styles.routeShell}><PortalRoad data={data} current={position.task} stage={position.stage} activeStageId={active ? data.roadmap.find(row => row.tasks.some(task => task.id === active.id))?.id : undefined} deadline={nearestUniversityDeadline(local.selectedIds)} onOpenTask={openTask} navigationOnly travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} /></div>}</div>
    <main id="main" className={styles.frame}>
      {location.view === "today" && !wizardOpen && <div className={styles.arrival} data-portal-arrival>
        <PortalWelcome intakeYear={data.client.intakeYear}><PortalUniversitySummary ids={local.selectedIds} onEdit={() => { const task = tasks.find(item => item.id === "shortlist"); if (task) openTask(task); }}/></PortalWelcome>
        <section data-portal-progress-shell aria-label="Прогресс поступления">
          <PortalRoad data={data} current={position.task} stage={position.stage} activeStageId={active ? data.roadmap.find(row => row.tasks.some(task => task.id === active.id))?.id : undefined} deadline={nearestUniversityDeadline(local.selectedIds)} onOpenTask={openTask} navigationOnly travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} />
        </section>
      </div>}
      <div className={styles.localStatus}><span>Локальный профиль активен · только на этом устройстве</span><a href={cloudLoginHref}>Подключить облачный кабинет ↗</a></div>
      {location.view === "today" && !wizardOpen && <WorkspaceCoach data={data} onOpenTask={openTask} />}
      <div className={styles.layout}>
        <aside><nav className={styles.nav} aria-label="Разделы личного кабинета">{NAV.map(({ view, title, Icon }) => <a key={view} href={view === "today" ? "/portal" : `/portal?view=${view}`} aria-current={location.view === view ? "page" : undefined} onClick={event => link(event, { view, task: null, doc: null })}><Icon size={18} aria-hidden="true"/>{title}</a>)}</nav></aside>
        <div className={styles.content}>
          {location.view === "today" && <>
            <p className={styles.intro}>Поступление: {intake}. {draft.complete ? "Маршрут построен по твоим ответам." : "Начни с анкеты — ответы из «Моего плана» уже здесь."}</p>
            {position.next && <p className={styles.next}>Потом · {taskTitle(position.next)}. К этому шагу перейдём позже.</p>}
            {clarify && <a className={styles.textLink} href={`/portal?view=docs&doc=${clarify.id}`} onClick={event => { event.preventDefault(); openTask(clarify); }}>{DOC_TASKS[clarify.id]} · {documentOutcome(data.docs[clarify.id], applicationYear).label}</a>}
            <section className={styles.docFeature}><ShieldCheck size={26} aria-hidden="true"/><div><h2>Твои документы</h2><a href="/portal?view=docs" onClick={event => link(event, { view: "docs", task: null, doc: null })}>Открыть документы →</a></div></section>

          </>}
          {location.view === "plan" && !showDetail && <><PlanSection data={data} onOpenTask={openTask}/></>}
          {showDetail && <>
            {!(active.id === "shortlist" && (!readOnly || data.done.shortlist)) && !(DOC_TASKS[active.id] && existing) && <a className={styles.textLink} href={location.doc ? "/portal?view=docs" : "/portal?view=plan"} onClick={event => { event.preventDefault(); if (window.history.state?.portalBackHref) window.history.back(); else navigate({ view: location.doc ? "docs" : "plan", task: null, doc: null }); }}>← Назад</a>}
            {active.id === "profile" ? <><h1 className={styles.heading}>Твой план поступления</h1>{draft.complete ? <SavedProfileAnswers profile={data.client.profile || {}} answers={draft.answers} onEdit={() => updateDraft({ ...draft, step: 0, complete: false })} /> : <Wizard draft={draft} onDraftChange={updateDraft} onDone={answers => { updateDraft({ answers, step: 10, complete: true }); navigate({ view: "today", task: null, doc: null }); }}/>}</>
              : active.id === "shortlist" && (!readOnly || data.done.shortlist) ? <PortalUniversityStep localOnly data={data} task={active} selectedIds={local.selectedIds} busy={false} onBack={() => navigate({ view: "plan", task: null, doc: null })} backHref="/portal?view=plan" onReopen={() => updateLocal({ ...local, done: { ...local.done, shortlist: false } })} onSave={async selectedIds => { updateLocal({ ...local, scope: localWorkspaceScope(draft, selectedIds), selectedIds, reviews: JSON.stringify(selectedIds) === JSON.stringify(local.selectedIds) ? local.reviews : {}, done: JSON.stringify(selectedIds) === JSON.stringify(local.selectedIds) ? { ...local.done, shortlist: true } : { shortlist: true } }); navigate({ view: "today", task: null, doc: null }); return true; }}/>
              : DOC_TASKS[active.id] && existing ? <PortalDocumentReport key={active.id} title={DOC_TASKS[active.id]} doc={existing} storage="local"
                busy={false} context={existing.result?.review || { profile: "general", academicYear: applicationYear, applicantScope: "unspecified" }} onContextChange={() => {}}
                onBack={() => { if (window.history.state?.portalBackHref) window.history.back(); else navigate({ view: "docs", task: null, doc: null }); }}
                onDocuments={() => navigate({ view: "docs", task: null, doc: null })} onUpload={() => {}}
                canUpload={documentInspectorOpen} readOnlyReason={readOnly} preparationTime={active.time || undefined}
                stepMeta={data.roadmap.find(stage => stage.tasks.some(task => task.id === active.id))?.title}
                uploadSlot={<><button type="button" className={styles.textLink} aria-pressed={Boolean(local.collecting[active.id])} onClick={() => updateLocal({ ...local, collecting: { ...local.collecting, [active.id]: !local.collecting[active.id] } })}>{local.collecting[active.id] ? "Собираю документ · снять отметку" : "Отметить: собираю документ"}</button>
                  <DocCheck portalInspector initialContext={existing.result?.review} academicYear={applicationYear} onComplete={(result, fileName) => onReview(active, result, fileName)} />
                </>} />
              : <><h1 className={styles.heading}>{taskTitle(active)}</h1><p className={styles.intro}>{active.time || "По ситуации"}</p><p className={styles.intro}>{active.explain}</p>
                <PortalStepInstructions taskId={active.id} />
                {readOnly && <p className={styles.readOnly}>{readOnly}</p>}
                {existing && !existing.result && <p className={styles.readOnly}>{existing.summary}</p>}
                {existing?.result?.review && existing.result.review.academicYear !== applicationYear && <p className={styles.readOnly}>Нужно уточнить: разбор относится к {existing.result.review.academicYear}, а в маршруте выбран {applicationYear}. Это не ошибка файла. Сверь заявку перед подачей.</p>}
                {documentInspectorOpen && <>
                  <PortalDocumentCoach />
                  <button type="button" className={styles.textLink} aria-pressed={Boolean(local.collecting[active.id])} onClick={() => updateLocal({ ...local, collecting: { ...local.collecting, [active.id]: !local.collecting[active.id] } })}>{local.collecting[active.id] ? "Собираю документ · снять отметку" : "Отметить: собираю документ"}</button>
                  <DocCheck portalInspector key={active.id} academicYear={draft.answers.intake === "2027/28" || draft.answers.intake === "2026/27" ? draft.answers.intake : "unspecified"} onComplete={(result, fileName) => onReview(active, result, fileName)}/>
                </>}
                {!DOC_TASKS[active.id] && (!readOnly || Boolean(existing && data.done[active.id])) && <>{active.id === "kit" && <PortalPermessoStep/>}<button className={styles.primary} type="button" onClick={() => complete(active)}>Готово</button></>}
                {data.done[active.id] && !DOC_TASKS[active.id] && <button className={styles.textLink} type="button" onClick={() => updateLocal({ ...local, done: { ...local.done, [active.id]: false } })}>Снять отметку</button>}
              </>}
          </>}
          {location.view === "docs" && !showDetail && <>
            <h1 className={styles.heading}>Документы твоего маршрута</h1><p className={styles.intro}>Отметка о сборе — твоя. Итог проверки появляется только после реального разбора файла.</p>
            <fieldset className={styles.filters}><legend className="sr-only">Назначение документа</legend>{[{ id: "all", label: "Все" }, { id: "uni", label: "Для вуза" }, { id: "dsu", label: "Для DSU" }, { id: "visa", label: "Для визы D" }].map(item => <label key={item.id}><input type="radio" name="local-document-purpose" value={item.id} checked={purpose === item.id} onChange={() => setPurpose(item.id)}/>{item.label}</label>)}</fieldset>
            {!documents.length && <div className={styles.paper}><h2>Сначала уточним твой маршрут</h2><p>После анкеты здесь появятся документы по твоей ситуации. Поздние этапы откроются по мере выполнения текущих шагов.</p><a className={styles.textLink} href="/portal?view=plan&task=profile" onClick={event => { event.preventDefault(); const task = tasks.find(item => item.id === "profile"); if (task) openTask(task); }}>Заполнить анкету</a></div>}
            <div className={styles.vault}>{documents.filter(task => purpose === "all" || DOCUMENT_INFO[task.id]?.purpose === purpose).map(task => {
              const info = DOCUMENT_INFO[task.id]; const outcome = documentOutcome(data.docs[task.id], applicationYear);
              return <a className={styles.docCard} key={task.id} href={`/portal?view=docs&doc=${task.id}`} onClick={event => { event.preventDefault(); openTask(task); }} data-document={task.id} data-document-outcome={outcome.kind}>
                <FileText size={25} aria-hidden="true"/><h3>{DOC_TASKS[task.id]}</h3><p>{info?.where}</p><p>{info?.validity}</p>
                <span className={styles.status} data-kind={outcome.kind}>{outcome.label}</span>{outcome.action && <p>Что сделать: {outcome.action}</p>}

              </a>;
            })}</div>
          </>}
          {location.view === "settings" && <>
            <h1 className={styles.heading}>Настройки</h1><section className={styles.paper}><h2>Локальный профиль</h2><p>Набор: {intake}. Ответы анкеты, выбранные вузы и отметки хранятся на этом устройстве. Сканов, номера телефона и полного разбора в этом хранилище нет. При изменении анкеты или списка вузов отметки маршрута и итоги проверок нужно пройти заново.</p><a className={styles.textLink} href="/portal?view=plan&task=profile" onClick={event => { event.preventDefault(); updateDraft({ ...draft, step: 0, complete: false }); navigate({ view: "plan", task: "profile", doc: null }); }}>Изменить ответы анкеты</a></section>
            <section className={styles.paper}><h2>Напоминания выключены</h2><p>Telegram и почта подключаются в активированном облачном кабинете. Для входа нужны код доступа и фамилия. Локальный профиль не переносится туда автоматически.</p><a className={styles.primary} href={cloudLoginHref}>Подключить кабинет</a></section>
            {plan && <p className={styles.next}>Правила сверены {plan.reviewed}. Отметки маршрута не означают одобрение вуза или консульства.</p>}
          </>}
        </div>
      </div>
    </main>
  </div>;
}
