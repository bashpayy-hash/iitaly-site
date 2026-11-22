"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import { Settings, FileText, ArrowRight } from "lucide-react";
import { Bento, BentoCell, bento } from "@/components/ui/Bento";
import { planSpans } from "@/components/ui/bentoPack";
import { StageScene } from "@/components/illustration/StageScene";
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
import { Wizard } from "@/components/plan/Wizard";
import { DocCheck } from "@/components/plan/DocCheck";
import { PortalUniversityStep } from "./PortalUniversityStep";
import type { RoadTravel } from "./PortalRoad";
import { PortalDocumentReport } from "./PortalDocumentReport";
import { PortalTaskPages } from "./PortalTaskPages";
import { SavedProfileAnswers } from "./SavedProfileAnswers";
import { portalProgress, portalTaskDone, portalTaskStageOpen } from "@/lib/portalProgress";
import { taskQuestions } from "@/lib/portalStepCopy";
import { PortalFocus } from "./PortalFocus";
import { PortalCompletion, PortalSoundSetting } from "./PortalCompletion";
import { usePortalFeedback } from "./usePortalFeedback";
import { localTaskLocked } from "@/lib/access";
import { LockedTaskPage } from "@/components/access/LockedTaskPage";
import { useViewEntrance } from "@/components/motion/useViewEntrance";
import focusStyles from "./portal-focus.module.css";
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
/* Для чего документ — словами, без фильтров (owner, 5 Nov: «минимализм,
   поменьше кнопок»): пять карточек читаются без переключателей. */
const PURPOSE_LABEL = { uni: "Нужен для вуза", dsu: "Нужен для стипендии DSU", visa: "Нужен для визы" } as const;
const DOCUMENT_INFO: Record<string, { purpose: "uni" | "dsu" | "visa"; where: string }> = {
  apostille: { purpose: "uni", where: "eGov / ЦОН · орган образования" },
  translate: { purpose: "uni", where: "Переводчик · способ заверения по инструкции получателя" },
  familyDocs: { purpose: "dsu", where: "eGov / ЦОН · органы по виду справки" },
  statements: { purpose: "visa", where: "Банк · документы спонсора, если применимо" },
  housing: { purpose: "visa", where: "Арендодатель / общежитие" },
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
  const feedback = usePortalFeedback();
  const [storageError, setStorageError] = useState("");
  const data = useMemo(() => buildLocalWorkspace(draft, local, reports), [draft, local, reports]);
  /* Стена доступа (owner, 5 Nov): анкета, выбор вузов и первый шаг маршрута
     открыты; остальные шаги видны по названию и дате, но инструкция,
     проверка и отметка «Готово» — за оплатой. Это только показ: в
     локальном профиле ничего платного не хранится и не включается. */
  const locked = (task: PortalTask) => localTaskLocked(data, task);
  const position = portalPosition(data);
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  const active = tasks.find(task => task.id === (location.doc || location.task));
  const focusStage = data.roadmap.find(stage => stage.id === location.stage) || position.stage;
  const assistantTask = active || ((location.view === "today" || location.view === "plan") ? focusStage?.tasks.find(task => !portalTaskDone(data, task) && task.available !== false) || position.task : null);
  const documents = tasks.filter(task => DOC_TASKS[task.id]);
  const plan = draft.complete ? buildPlan(draft.answers) : null;
  const wizardOpen = active?.id === "profile" && !draft.complete;
  const chrome = useRef<HTMLDivElement>(null);
  // Every section, task and document page swaps in place: the content arrives
  // with one short rise instead of a hard cut (motion pass, 5 Nov).
  const content = useRef<HTMLDivElement>(null);
  useViewEntrance(content, `${location.view}|${location.task ?? ""}|${location.doc ?? ""}|${location.stage ?? ""}`);
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
    // A locked step hands the assistant only its title: the detailed context stays behind the wall.
    window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: assistantTask ? { taskId: assistantTask.id, taskTitle: taskTitle(assistantTask), taskContext: localTaskLocked(data, assistantTask) ? undefined : assistantTask.explain, taskDone: portalTaskDone(data, assistantTask), questions: taskQuestions(assistantTask, portalTaskDone(data, assistantTask)) } : {} }));
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
    if (!data.roadmap.some(stage => stage.tasks.some(row => row.id === task.id)) || locked(task)) return;
    feedback.prime();
    if (!saveLocal({ ...local, done: { ...local.done, [task.id]: true } })) return;
    if (!data.done[task.id]) {
      setRoadTravel({ fromDone:portalProgress(data).done, id:++travelSequence.current });
      feedback.confirm(task.id, taskTitle(task));
    }
    navigate({ view: "today", task: null, doc: null, stage: location.stage });
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
  const documentInspectorOpen = Boolean(active && DOC_TASKS[active.id] && !locked(active) && portalTaskStageOpen(data, active.id) && (!readOnly || Boolean(existing && portalTaskDone(data, active))));
  const intake = draft.answers.intake === "2027/28" ? "сентябрь 2027" : draft.answers.intake === "2026/27" ? "2026/27" : "год ещё не выбран";
  const showFocus = location.view === "today" || (location.view === "plan" && !showDetail);
  const selectStage = (stage: string) => navigate({ view: "today", task: null, doc: null, stage });
  const collectingControl = active && documentInspectorOpen && <button type="button" className={styles.textLink} aria-pressed={Boolean(local.collecting[active.id])} onClick={() => updateLocal({ ...local, collecting: { ...local.collecting, [active.id]: !local.collecting[active.id] } })}>{local.collecting[active.id] ? "Собираю документ · снять отметку" : "Отметить: собираю документ"}</button>;

  return <div className={`${portal.portal} ${styles.workspace} ${focusStyles.portalRoot}`} data-local-workspace data-portal-design="shared-site">
    <div ref={chrome} className={styles.header}><MarketingHeader variant="portal" actions={<div className={styles.headerActions}>
      <a href="#iitaly-chat" data-portal-assistant data-step-id={assistantTask?.id || ""} onClick={event => { event.preventDefault(); window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "portal-header", taskId: assistantTask?.id, taskTitle: assistantTask ? taskTitle(assistantTask) : undefined, taskContext: assistantTask && !locked(assistantTask) ? assistantTask.explain : undefined, taskDone: assistantTask ? portalTaskDone(data, assistantTask) : false, questions: assistantTask ? taskQuestions(assistantTask, portalTaskDone(data, assistantTask)) : undefined } })); }}><VespiOutline /><span>Помощник</span></a>
      <a href="/portal?view=docs" aria-label="Документы" title="Документы" aria-current={location.view === "docs" && !location.doc ? "page" : undefined} data-portal-documents onClick={event => link(event, { view: "docs", task: null, doc: null })}><FileText size={18} strokeWidth={1.5} aria-hidden="true" /><span className={styles.settingsText}>Документы</span></a>
      <a href="/portal?view=settings" aria-label="Настройки" title="Настройки" aria-current={location.view === "settings" ? "page" : undefined} onClick={event => link(event, { view: "settings", task: null, doc: null })}><Settings size={18} aria-hidden="true"/><span className={styles.settingsText}>Настройки</span></a>
    </div>} /></div>
    <main id="main" className={`${styles.frame} ${focusStyles.localFrame}`} onClickCapture={event => { if ((event.target as Element).closest("button")) feedback.prime(); }}>
      {/* Funnel analysis (owner, 22 Nov: «где пользователю будет сложно
          ориентироваться»). A guest opened «Личный кабинет» and nothing said
          it is the free one kept on this device, nor led back to the plan it
          is built from. The line names it; with a plan it links to that plan.
          Owner, 22 Nov, with an iPad screenshot: «Кнопка войти справа сверху
          чуть кривая». The question and the way in were one underlined run of
          words beside another underlined link. It is one link with the same
          words; the question is plain and «Войти» has the header's own pill. */}
      <div className={styles.localStatus} data-local-status><span>{draft.complete ? "Бесплатный кабинет: план сохранён на этом устройстве" : "Бесплатный кабинет: прогресс сохраняется на этом устройстве"}</span><span className={styles.localLinks}>{draft.complete && <Link href="/plan#route" prefetch={false} data-local-plan>Открыть план</Link>}<a className={styles.localSignIn} href={cloudLoginHref} data-local-signin><span>Есть код доступа?</span>{" "}<b>Войти</b></a></span></div>
      {storageError && <p role="alert" className={styles.readOnly}>{storageError}</p>}
      <div className={`${styles.layout} ${focusStyles.localLayout}`} data-focus-layout={showFocus ? "stage" : "detail"}>
        <div ref={content} className={styles.content}>
          {showFocus && <PortalFocus data={data} selectedStageId={location.stage} shortlist={local.selectedIds} busy={false}
            travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} onSelectStage={selectStage}
            onOpenTask={openTask} onComplete={complete} onDocuments={() => navigate({ view: "docs", task: null, doc: null })} onSettings={() => navigate({ view: "settings", task: null, doc: null })} locked={locked} />}
          {showDetail && <>
            {active.id === "profile" && <a className={styles.textLink} href={location.doc ? "/portal?view=docs" : "/portal?view=plan"} onClick={event => { event.preventDefault(); if (window.history.state?.portalBackHref) window.history.back(); else navigate({ view: location.doc ? "docs" : "plan", task: null, doc: null }); }}>Назад</a>}
            {locked(active) ? <LockedTaskPage task={active} stage={data.roadmap.find(stage => stage.tasks.some(task => task.id === active.id))} teaser={plan?.steps.find(step => step.t === active.t)?.summary} />
              : active.id === "profile" ? <><h1 className={styles.heading}>Твой план поступления</h1>{draft.complete ? <SavedProfileAnswers profile={data.client.profile || {}} answers={draft.answers} onEdit={() => updateDraft({ ...draft, step: 0, complete: false })} /> : <Wizard draft={draft} onDraftChange={updateDraft} onDone={answers => { feedback.prime(); updateDraft({ answers, step: 10, complete: true }); try { if (JSON.parse(localStorage.getItem("iitaly_plan_draft_v1") || "{}").complete) feedback.confirm("profile", "Анкета заполнена"); } catch {} navigate({ view: "today", task: null, doc: null }); }}/>}</>
              : active.id === "shortlist" && (!readOnly || data.done.shortlist) ? <PortalUniversityStep localOnly data={data} task={active} selectedIds={local.selectedIds} busy={false} onBack={() => navigate({ view: "plan", task: null, doc: null })} backHref="/portal?view=plan" onReopen={() => updateLocal({ ...local, done: { ...local.done, shortlist: false } })} onSave={async selectedIds => { feedback.prime(); const saved = saveLocal({ ...local, scope: localWorkspaceScope(draft, selectedIds), selectedIds, reviews: JSON.stringify(selectedIds) === JSON.stringify(local.selectedIds) ? local.reviews : {}, done: JSON.stringify(selectedIds) === JSON.stringify(local.selectedIds) ? { ...local.done, shortlist: true } : { shortlist: true } }); if (!saved) return false; if (!data.done.shortlist) feedback.confirm("shortlist", taskTitle(active)); navigate({ view: "today", task: null, doc: null }); return true; }}/>
              : DOC_TASKS[active.id] && existing ? <PortalDocumentReport taskId={active.id} key={active.id} title={DOC_TASKS[active.id]} doc={existing} storage="local"
                busy={false} context={existing.result?.review || { profile: "general", academicYear: applicationYear, applicantScope: "unspecified" }} onContextChange={() => {}}
                onBack={() => { if (window.history.state?.portalBackHref) window.history.back(); else navigate({ view: "docs", task: null, doc: null }); }}
                onDocuments={() => navigate({ view: "docs", task: null, doc: null })} onUpload={() => {}}
                canUpload={documentInspectorOpen} readOnlyReason={readOnly} preparationTime={active.time || undefined}
                stepMeta={data.roadmap.find(stage => stage.tasks.some(task => task.id === active.id))?.title}
                reviewExtra={collectingControl}
                uploadSlot={<>
                  <DocCheck portalInspector initialContext={existing.result?.review} academicYear={applicationYear} onComplete={(result, fileName) => onReview(active, result, fileName)} />
                </>} />
              : <PortalTaskPages task={active} stage={data.roadmap.find(stage => stage.tasks.some(task => task.id === active.id))} done={portalTaskDone(data, active)} readOnly={readOnly} guideExtra={collectingControl} defaultPart={location.doc ? "action" : "overview"} action={<>
                {readOnly && <p className={styles.readOnly}>{readOnly}</p>}
                {existing && !existing.result && <p className={styles.readOnly}>{existing.summary}</p>}
                {existing?.result?.review && existing.result.review.academicYear !== applicationYear && <p className={styles.readOnly}>Нужно уточнить: разбор относится к {existing.result.review.academicYear}, а в маршруте выбран {applicationYear}. Это не ошибка файла. Сверь заявку перед подачей.</p>}
                {documentInspectorOpen && <>
                  <DocCheck portalInspector key={active.id} academicYear={draft.answers.intake === "2027/28" || draft.answers.intake === "2026/27" ? draft.answers.intake : "unspecified"} onComplete={(result, fileName) => onReview(active, result, fileName)}/>
                </>}
                {!DOC_TASKS[active.id] && (!readOnly || Boolean(existing && data.done[active.id])) && <>{active.id === "kit" && <PortalPermessoStep/>}<button className={styles.primary} type="button" onClick={() => complete(active)}>Готово</button></>}
                {data.done[active.id] && !DOC_TASKS[active.id] && <button className={styles.textLink} type="button" onClick={() => updateLocal({ ...local, done: { ...local.done, [active.id]: false } })}>Снять отметку</button>}
              </>} />}
          </>}
          {location.view === "docs" && !showDetail && <>
            {/* Owner, 20 Nov, вечер (скрин с iPad): «эта страница выглядит на
                такой подвальный вайб… сделай как принцип на лендинге». The landing's
                pattern: a two-tone heading, then one bento tray of even paper
                cells (packSpans: every row full, two to a row on a tablet and wider). */}
            {/* The free check is its own section of the site now (owner, 21 Nov:
                «сделай так, чтобы проверка документов была отдельным разделом»):
                the vault names it in one line instead of a big action cell, and
                Vespi at the stamp stands beside the heading. */}
            <header className={`${styles.docsHead} ${styles.docsHeadScene}`} data-documents-head>
              <div className={styles.docsHeadCopy}>
                <h1 className={styles.docsTitle}>Документы твоего маршрута. <span>Где взять и как проверить.</span></h1>
                <p className={styles.docsLead}>Здесь все бумаги для поступления, стипендии и визы. Нажми на документ — узнаешь, где его взять и как проверить.</p>
                <p className={styles.docsFree} data-documents-free-note>Первая проверка файла — бесплатно, без регистрации, в разделе <Link href="/check">«Проверка документов»</Link>.</p>
              </div>
              <StageScene name="stamp" className={styles.docsScene} priority />
            </header>
            {!documents.length && <div className={styles.paper}><h2>Сначала уточним твой маршрут</h2><p>После анкеты здесь появятся документы по твоей ситуации. Поздние этапы откроются по мере выполнения текущих шагов.</p><a className={styles.textLink} href="/portal?view=plan&task=profile" onClick={event => { event.preventDefault(); const task = tasks.find(item => item.id === "profile"); if (task) openTask(task); }}>Заполнить анкету</a></div>}
            {documents.length > 0 && <Bento as="div" className={styles.docsTray} data-documents-tray>
              {(() => {
                const lg = planSpans(documents.length, -1, 12, [6, 4], [6]), md = planSpans(documents.length, -1, 6, [3, 2], [3]);
                return documents.map((task, index) => {
                  const info = DOCUMENT_INFO[task.id]; const outcome = documentOutcome(data.docs[task.id], applicationYear);
                  return <a className={`${bento.cell} ${bento.plain} ${styles.docCell}`} style={{ "--s-md": md[index], "--s-lg": lg[index] } as CSSProperties} key={task.id} href={`/portal?view=docs&doc=${task.id}`} onClick={event => { event.preventDefault(); openTask(task); }} data-document={task.id} data-document-outcome={outcome.kind}>
                    {info && <span className={styles.docPurpose} data-purpose={info.purpose}>{PURPOSE_LABEL[info.purpose]}</span>}
                    <h3 className={styles.docName}>{DOC_TASKS[task.id]}</h3>
                    {info && <p className={styles.docWhere}><strong>Где взять:</strong> {info.where}</p>}
                    {data.docs[task.id] && outcome.action && <p className={styles.docWhere}>Что сделать: {outcome.action}</p>}
                    <span className={styles.docFoot}><span className={styles.status} data-kind={outcome.kind}>{outcome.label}</span><span className={styles.docOpen}>Открыть <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" /></span></span>
                  </a>;
                });
              })()}
            </Bento>}
          </>}
          {location.view === "settings" && <>
            {/* Settings in the same bento as the documents (owner, 20 Nov, вечер:
                «все эти отступы должны быть нормальными»): two equal cells side by
                side from a tablet up, the sound switch as one quiet row under them. */}
            <header className={styles.docsHead}><h1 className={styles.docsTitle}>Настройки. <span>Профиль, напоминания и звук.</span></h1></header>
            <Bento as="div" className={styles.docsTray} data-settings-tray>
              <BentoCell span={{ md: 3, lg: 6 }} className={styles.setCell}><h2 className={styles.setTitle}>Локальный профиль</h2><p>Набор: {intake}. Ответы анкеты, выбранные вузы и отметки хранятся на этом устройстве. Сканов, номера телефона и полного разбора в этом хранилище нет. При изменении анкеты или списка вузов отметки маршрута и итоги проверок нужно пройти заново.</p>{/* 22 Nov: this link un-finished the questionnaire and restarted it at
                  question 1, so the plan and its step pages vanished until all ten
                  answers were given again. It opens the same list of answers as
                  «Изменить ответы» on /plan; without a finished questionnaire the
                  cabinet's own first step is the way in, as before. */}
              {draft.complete
                // A full load: /plan reads «answers=1» once, when it opens.
                // eslint-disable-next-line @next/next/no-html-link-for-pages
                ? <a className={styles.textLink} href="/plan?answers=1#questionnaire" data-local-answers>Изменить ответы анкеты</a>
                : <a className={styles.textLink} href="/portal?view=plan&task=profile" onClick={event => { event.preventDefault(); navigate({ view: "plan", task: "profile", doc: null }); }}>Изменить ответы анкеты</a>}</BentoCell>
              <BentoCell span={{ md: 3, lg: 6 }} className={styles.setCell}><h2 className={styles.setTitle}>Напоминания выключены</h2><p>Telegram и почта подключаются в активированном облачном кабинете. Для входа нужны код доступа и фамилия. Локальный профиль не переносится туда автоматически.</p><a className={styles.primary} href={cloudLoginHref}>Подключить кабинет</a></BentoCell>
              <BentoCell span={{ md: 6, lg: 12 }} tone="quiet" className={styles.setSound}><PortalSoundSetting enabled={feedback.sound} onToggle={feedback.toggleSound} /></BentoCell>
            </Bento>
            {plan && <p className={styles.next}>Правила сверены {plan.reviewed}. Отметки маршрута не означают одобрение вуза или консульства.</p>}
          </>}
        </div>
      </div>
    </main>
    <PortalCompletion feedback={feedback.feedback} data={data} />
  </div>;
}
