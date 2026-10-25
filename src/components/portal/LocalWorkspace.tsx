"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import { Settings, FileText } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { VespiOutline } from "@/components/mascot/VespiOutline";
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
import { PortalRoad, type RoadTravel } from "./PortalRoad";
import { PortalDocumentReport } from "./PortalDocumentReport";
import { PortalDocumentCoach } from "./PortalDocumentCoach";
import { PortalStepInstructions } from "./PortalStepInstructions";
import { PortalTaskIntro } from "./PortalTaskIntro";
import { SavedProfileAnswers } from "./SavedProfileAnswers";
import { portalProgress, portalTaskDone, portalTaskStageOpen } from "@/lib/portalProgress";
import { taskQuestions } from "@/lib/portalStepCopy";
import { PortalFocus } from "./PortalFocus";
import { PortalCompletion, PortalSoundSetting } from "./PortalCompletion";
import { usePortalFeedback } from "./usePortalFeedback";
import focusStyles from "./portal-focus.module.css";
import { PortalArtwork } from "./PortalArtwork";
import portal from "./portal.module.css";
import styles from "./workspace.module.css";

const PortalPermessoStep = dynamic(() => import("./PortalPermessoStep").then(module => module.PortalPermessoStep), { loading: () => <p role="status">Загружаю бланк…</p> });
type View = "today" | "plan" | "docs" | "settings";
type Location = { view: View; task: string | null; doc: string | null; stage?: string };
function readLocation(): Location {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("view");
  const view = raw === "settings" || raw === "help" || raw === "profile" ? "settings" : raw === "docs" || raw === "plan" ? raw : "today";
  return { view, stage: params.get("stage") || undefined, task: view === "plan" ? params.get("task") : null, doc: view === "docs" ? params.get("doc") : null };
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
  const feedback = usePortalFeedback();
  const [storageError, setStorageError] = useState("");
  const data = useMemo(() => buildLocalWorkspace(draft, local, reports), [draft, local, reports]);
  const position = portalPosition(data);
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  const active = tasks.find(task => task.id === (location.doc || location.task));
  const focusStage = data.roadmap.find(stage => stage.id === location.stage) || position.stage;
  const assistantTask = active || ((location.view === "today" || location.view === "plan") ? focusStage?.tasks.find(task => !portalTaskDone(data, task) && task.available !== false) || position.task : null);
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
    window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: assistantTask ? { taskId: assistantTask.id, taskTitle: taskTitle(assistantTask), taskContext: assistantTask.explain, taskDone: portalTaskDone(data, assistantTask), questions: taskQuestions(assistantTask, portalTaskDone(data, assistantTask)) } : {} }));
    return () => { window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: {} })); };
  }, [assistantTask, data]);

  function navigate(next: Location) {
    const url = next.doc ? `/portal?view=docs&doc=${encodeURIComponent(next.doc)}` : next.task ? `/portal?view=plan&task=${encodeURIComponent(next.task)}` : next.view === "today" ? next.stage ? `/portal?stage=${encodeURIComponent(next.stage)}` : "/portal" : `/portal?view=${next.view}`;
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
  function saveLocal(next: typeof local) {
    updateLocal(next);
    let saved = false;
    try { saved = localStorage.getItem("iitaly_local_workspace_v1") === JSON.stringify(next); } catch {}
    setStorageError(saved ? "" : "Не удалось сохранить изменения на устройстве. Разреши хранение данных в браузере и повтори действие.");
    return saved;
  }
  function complete(task: PortalTask) {
    if (!data.roadmap.some(stage => stage.tasks.some(row => row.id === task.id))) return;
    feedback.prime();
    if (!saveLocal({ ...local, done: { ...local.done, [task.id]: true } })) return;
    if (!data.done[task.id]) {
      setRoadTravel({ fromDone:portalProgress(data).done, id:++travelSequence.current });
      feedback.confirm(task.id, taskTitle(task));
    }
    navigate({ view: "today", task: null, doc: null });
  }
  function onReview(task: PortalTask, result: DocCheckResult, fileName?: string) {
    const report: PortalDoc = { fileName, verdict: result.verdict || "warn", summary: result.summary, result, checkedAt: new Date().toISOString(), routeAcademicYear: applicationYear };
    const kind = documentOutcome(report, applicationYear).kind;
    const approved = kind === "approved";
    setReportCache(current => ({ ...current, [scope]: { ...current[scope], [task.id]: report } }));
    // A missing programme/context is an uncertainty, never a file defect or an
    // approval. Only a real passed review closes a file step.
    const saved = saveLocal({ ...local, reviews: { ...local.reviews, [task.id]: kind }, done: { ...local.done, [task.id]: approved } });
    if (saved && approved && !portalTaskDone(data, task)) {
      setRoadTravel({ fromDone:portalProgress(data).done, id:++travelSequence.current });
      feedback.confirm(task.id, taskTitle(task));
    }
    navigate({ view: "today", task: null, doc: null });
  }
  const cloudLoginHref = location.view === "today" ? "/portal?view=login" : `/portal?view=${location.view}&auth=login${location.doc ? `&doc=${encodeURIComponent(location.doc)}` : location.task ? `&task=${encodeURIComponent(location.task)}` : ""}`;
  const showDetail = active && (location.task || location.doc);
  const readOnly = active ? taskReadOnlyReason(data, active) : "";
  const existing = active ? data.docs[active.id] : undefined;
  const documentInspectorOpen = Boolean(active && DOC_TASKS[active.id] && portalTaskStageOpen(data, active.id) && (!readOnly || Boolean(existing && portalTaskDone(data, active))));
  const intake = draft.answers.intake === "2027/28" ? "сентябрь 2027" : draft.answers.intake === "2026/27" ? "2026/27" : "год ещё не выбран";
  const showFocus = location.view === "today" || (location.view === "plan" && !showDetail);
  const selectStage = (stage: string) => navigate({ view: "today", task: null, doc: null, stage });

  return <div className={`${portal.portal} ${styles.workspace} ${focusStyles.portalRoot}`} data-local-workspace data-portal-design="shared-site">
    <div ref={chrome} className={styles.header}><MarketingHeader variant="portal" actions={<div className={styles.headerActions}>
      <a href="#iitaly-chat" data-portal-assistant data-step-id={assistantTask?.id || ""} onClick={event => { event.preventDefault(); window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "portal-header", taskId: assistantTask?.id, taskTitle: assistantTask ? taskTitle(assistantTask) : undefined, taskContext: assistantTask?.explain, taskDone: assistantTask ? portalTaskDone(data, assistantTask) : false, questions: assistantTask ? taskQuestions(assistantTask, portalTaskDone(data, assistantTask)) : undefined } })); }}><VespiOutline /><span>Помощник</span></a>
      <a href="/portal?view=docs" aria-label="Документы" title="Документы" data-portal-documents onClick={event => link(event, { view: "docs", task: null, doc: null })}><FileText size={18} strokeWidth={1.5} aria-hidden="true" /></a>
      <a href="/portal?view=settings" aria-label="Настройки" aria-current={location.view === "settings" ? "page" : undefined} onClick={event => link(event, { view: "settings", task: null, doc: null })}><Settings size={18} aria-hidden="true"/><span className={styles.settingsText}>Настройки</span></a>
    </div>} />{!wizardOpen && !showFocus && <div className={styles.routeShell}><PortalRoad data={data} current={position.task} stage={position.stage} activeStageId={active ? data.roadmap.find(row => row.tasks.some(task => task.id === active.id))?.id : undefined} deadline={nearestUniversityDeadline(local.selectedIds)} onSelectStage={selectStage} onOpenTask={openTask} navigationOnly travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} /></div>}</div>
    <main id="main" className={`${styles.frame} ${focusStyles.localFrame}`} onClickCapture={event => { if ((event.target as Element).closest("button")) feedback.prime(); }}>
      <div className={styles.localStatus}><span>Локальный профиль активен · только на этом устройстве</span><a href={cloudLoginHref}>Подключить облачный кабинет ↗</a></div>
      {storageError && <p role="alert" className={styles.readOnly}>{storageError}</p>}
      <div className={`${styles.layout} ${focusStyles.localLayout}`} data-focus-layout={showFocus ? "stage" : "detail"}>
        <div className={styles.content}>
          {showFocus && <PortalFocus data={data} selectedStageId={location.stage} shortlist={local.selectedIds} busy={false}
            travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} onSelectStage={selectStage}
            onOpenTask={openTask} onComplete={complete} onDocuments={() => navigate({ view: "docs", task: null, doc: null })} onSettings={() => navigate({ view: "settings", task: null, doc: null })} />}
          {showDetail && <>
            {!(active.id === "shortlist" && (!readOnly || data.done.shortlist)) && !(DOC_TASKS[active.id] && existing) && <a className={styles.textLink} href={location.doc ? "/portal?view=docs" : "/portal?view=plan"} onClick={event => { event.preventDefault(); if (window.history.state?.portalBackHref) window.history.back(); else navigate({ view: location.doc ? "docs" : "plan", task: null, doc: null }); }}>← Назад</a>}
            {active.id === "profile" ? <><h1 className={styles.heading}>Твой план поступления</h1>{draft.complete ? <SavedProfileAnswers profile={data.client.profile || {}} answers={draft.answers} onEdit={() => updateDraft({ ...draft, step: 0, complete: false })} /> : <Wizard draft={draft} onDraftChange={updateDraft} onDone={answers => { feedback.prime(); updateDraft({ answers, step: 10, complete: true }); try { if (JSON.parse(localStorage.getItem("iitaly_plan_draft_v1") || "{}").complete) feedback.confirm("profile", "Анкета заполнена"); } catch {} navigate({ view: "today", task: null, doc: null }); }}/>}</>
              : active.id === "shortlist" && (!readOnly || data.done.shortlist) ? <PortalUniversityStep localOnly data={data} task={active} selectedIds={local.selectedIds} busy={false} onBack={() => navigate({ view: "plan", task: null, doc: null })} backHref="/portal?view=plan" onReopen={() => updateLocal({ ...local, done: { ...local.done, shortlist: false } })} onSave={async selectedIds => { feedback.prime(); const saved = saveLocal({ ...local, scope: localWorkspaceScope(draft, selectedIds), selectedIds, reviews: JSON.stringify(selectedIds) === JSON.stringify(local.selectedIds) ? local.reviews : {}, done: JSON.stringify(selectedIds) === JSON.stringify(local.selectedIds) ? { ...local.done, shortlist: true } : { shortlist: true } }); if (!saved) return false; if (!data.done.shortlist) feedback.confirm("shortlist", taskTitle(active)); navigate({ view: "today", task: null, doc: null }); return true; }}/>
              : DOC_TASKS[active.id] && existing ? <PortalDocumentReport key={active.id} title={DOC_TASKS[active.id]} doc={existing} storage="local"
                busy={false} context={existing.result?.review || { profile: "general", academicYear: applicationYear, applicantScope: "unspecified" }} onContextChange={() => {}}
                onBack={() => { if (window.history.state?.portalBackHref) window.history.back(); else navigate({ view: "docs", task: null, doc: null }); }}
                onDocuments={() => navigate({ view: "docs", task: null, doc: null })} onUpload={() => {}}
                canUpload={documentInspectorOpen} readOnlyReason={readOnly} preparationTime={active.time || undefined}
                stepMeta={data.roadmap.find(stage => stage.tasks.some(task => task.id === active.id))?.title}
                uploadSlot={<><button type="button" className={styles.textLink} aria-pressed={Boolean(local.collecting[active.id])} onClick={() => updateLocal({ ...local, collecting: { ...local.collecting, [active.id]: !local.collecting[active.id] } })}>{local.collecting[active.id] ? "Собираю документ · снять отметку" : "Отметить: собираю документ"}</button>
                  <DocCheck portalInspector initialContext={existing.result?.review} academicYear={applicationYear} onComplete={(result, fileName) => onReview(active, result, fileName)} />
                </>} />
              : <><PortalTaskIntro task={active} stage={data.roadmap.find(stage => stage.tasks.some(task => task.id === active.id))} done={portalTaskDone(data, active)} pageHeading /><p className={styles.intro}>{active.explain}</p>
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
            <div className={styles.illustratedHeading}><div><h1 className={styles.heading}>Документы твоего маршрута</h1><p className={styles.intro}>Отметка о сборе принадлежит тебе. Итог проверки появляется только после реального разбора файла.</p></div><PortalArtwork placement="documents" /></div>
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
            <h1 className={styles.heading}>Настройки</h1><PortalSoundSetting enabled={feedback.sound} onToggle={feedback.toggleSound} /><section className={styles.paper}><h2>Локальный профиль</h2><p>Набор: {intake}. Ответы анкеты, выбранные вузы и отметки хранятся на этом устройстве. Сканов, номера телефона и полного разбора в этом хранилище нет. При изменении анкеты или списка вузов отметки маршрута и итоги проверок нужно пройти заново.</p><a className={styles.textLink} href="/portal?view=plan&task=profile" onClick={event => { event.preventDefault(); updateDraft({ ...draft, step: 0, complete: false }); navigate({ view: "plan", task: "profile", doc: null }); }}>Изменить ответы анкеты</a></section>
            <section className={styles.paper}><h2>Напоминания выключены</h2><p>Telegram и почта подключаются в активированном облачном кабинете. Для входа нужны код доступа и фамилия. Локальный профиль не переносится туда автоматически.</p><a className={styles.primary} href={cloudLoginHref}>Подключить кабинет</a></section>
            {plan && <p className={styles.next}>Правила сверены {plan.reviewed}. Отметки маршрута не означают одобрение вуза или консульства.</p>}
          </>}
        </div>
      </div>
    </main>
    <PortalCompletion feedback={feedback.feedback} />
  </div>;
}
