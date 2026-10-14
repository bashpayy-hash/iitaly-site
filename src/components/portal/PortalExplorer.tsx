"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalLogin } from "./PortalLogin";
import { PortalOnboarding } from "./PortalOnboarding";
import { PortalTaskDetail } from "./PortalTaskDetail";
import { TodaySection } from "./TodaySection";
import { PlanSection } from "./PlanSection";
import { DocsSection } from "./DocsSection";
import { PortalDocumentReport } from "./PortalDocumentReport";
import { HelpSection } from "./HelpSection";
import { ProfileSection } from "./ProfileSection";
import styles from "./portal.module.css";
import navigation from "./portal-navigation.module.css";
import {
  createTelegramLink,
  deletePortalData,
  fetchPortal,
  saveNotify,
  savePortalProfile,
  toggleTask,
  uploadPortalDoc,
  type PortalData,
  type PortalTask,
} from "@/lib/portalApi";
import { preparePayload } from "@/lib/docPayload";
import { checkDocument, DocCheckError, type DocCheckResult, type DocumentReviewContext } from "@/lib/checkDocument";
import { DOC_TASKS, TASK_META } from "@/lib/portalMeta";
import { portalPosition, taskDate, taskReadOnlyReason, taskTitle } from "@/lib/portalNavigation";
import { track } from "@/lib/track";

const KEY = "iitaly_portal_code";
const KEY_SN = "iitaly_portal_surname";

type Section = "today" | "plan" | "docs" | "settings";
type SettingsTarget = "profile" | "notifications";
type ActionError = { message: string; retryLabel?: string; retry?: () => void };

const NAV: { id: Section; label: string }[] = [
  { id: "today", label: "Обзор" },
  { id: "plan", label: "План" },
  { id: "docs", label: "Документы" },
];

type TaskWithStage = { task: PortalTask; stageId: string; stageTitle: string; order: number };

function tasksWithStages(data: PortalData): TaskWithStage[] {
  const out: TaskWithStage[] = [];
  let order = 0;
  for (const stage of data.roadmap) {
    for (const task of stage.tasks) out.push({ task, stageId: stage.id, stageTitle: stage.title, order: order++ });
  }
  return out;
}

function sectionFromLocation(): Section {
  if (typeof window === "undefined") return "today";
  const view = new URLSearchParams(window.location.search).get("view");
  if (view === "settings" || view === "help" || view === "profile") return "settings";
  return NAV.some((item) => item.id === view) ? view as Section : "today";
}

function taskFromLocation(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "plan" ? params.get("task") : null;
}

function sectionUrl(section: Section): string {
  return section === "today" ? "/portal" : `/portal?view=${section}`;
}

function documentFromLocation(): string | null {
  const params = new URLSearchParams(window.location.search);
  const task = params.get("doc");
  return params.get("view") === "docs" && task && Object.hasOwn(DOC_TASKS, task) ? task : null;
}

function settingsTargetFromLocation(): SettingsTarget {
  const view = new URLSearchParams(window.location.search).get("view");
  return view === "help" || window.location.hash === "#notifications" ? "notifications" : "profile";
}

function canonicalizeSettingsLocation() {
  const url = new URL(window.location.href);
  const view = url.searchParams.get("view");
  if (view !== "help" && view !== "profile") return;
  url.searchParams.set("view", "settings");
  if (view === "help") url.hash = "notifications";
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}

export function PortalExplorer() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [surname, setSurname] = useState<string | null>(null);
  const [data, setData] = useState<PortalData | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("today");
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [openDocument, setOpenDocument] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [roadTravel, setRoadTravel] = useState<{ fromDone: number; id: number }>();
  const [reviewContext, setReviewContext] = useState<DocumentReviewContext>({ profile: "general", academicYear: "unspecified", applicantScope: "unspecified" });
  const documentReturnFocus = useRef<string | null>(null);
  const actionErrorRef = useRef<HTMLDivElement>(null);
  const sessionVersion = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTaskRef = useRef<string | null>(null);
  const triedAutoLogin = useRef(false);
  const focusSettingsTarget = useRef<SettingsTarget | null>(null);
  const stepReturnSection = useRef<Section>("plan");
  const travelSequence = useRef(0);
  const completionFocusPending = useRef(false);
  const profileFromTask = useRef(false);

  async function login(sn: string, c: string, silent = false) {
    const res = await fetchPortal(c, sn);
    if (!res.ok) {
      if (!silent) setLoginError(res.error);
      return;
    }
    setLoginError(null);
    sessionVersion.current += 1;
    setActionError(null);
    setBusyTask(null);
    setRoadTravel(undefined);
    completionFocusPending.current = false;
    setCode(c);
    setSurname(sn);
    setData(res.data);
    const nextSection = sectionFromLocation();
    stepReturnSection.current = nextSection === "docs" ? "docs" : "plan";
    if (nextSection === "settings") focusSettingsTarget.current = settingsTargetFromLocation();
    canonicalizeSettingsLocation();
    setSection(nextSection);
    setOpenDocument(documentFromLocation());
    setOpenTaskId(taskFromLocation());
    try {
      localStorage.setItem(KEY, c);
      localStorage.setItem(KEY_SN, sn);
    } catch {}
    track("portal_open");
  }

  useEffect(() => {
    if (triedAutoLogin.current) return;
    triedAutoLogin.current = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const savedCode = localStorage.getItem(KEY);
      const savedSn = localStorage.getItem(KEY_SN);
      if (savedCode && savedSn) login(savedSn, savedCode, true);
    } catch {}
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    function syncSection() {
      const next = sectionFromLocation();
      focusSettingsTarget.current = next === "settings" ? settingsTargetFromLocation() : null;
      canonicalizeSettingsLocation();
      setEditingProfile(false);
      setSection(next);
      setOpenDocument(documentFromLocation());
      setOpenTaskId(taskFromLocation());
      stepReturnSection.current = next === "docs" ? "docs" : "plan";
      // A hash-only history entry may retain the same React section.
      if (next === "settings") focusSettings();
    }
    window.addEventListener("popstate", syncSection);
    window.addEventListener("hashchange", syncSection);
    return () => {
      window.removeEventListener("popstate", syncSection);
      window.removeEventListener("hashchange", syncSection);
    };
  }, []);

  function focusSettings() {
    const target = focusSettingsTarget.current;
    if (!target) return;
    const element = document.getElementById(target === "notifications" ? "portal-notification-settings" : "portal-settings-heading");
    if (!element) return;
    element.focus({ preventScroll: true });
    if (target === "notifications") {
      const scrollTarget = document.getElementById("notifications") || element;
      scrollTarget.scrollIntoView({ block: "start", behavior: "instant" });
    } else window.scrollTo({ top: 0, behavior: "instant" });
    focusSettingsTarget.current = null;
  }

  // Wait for login or profile editing to finish before focusing a deep-linked section.
  useEffect(() => {
    if (section === "settings" && !editingProfile && data?.client.onboardingComplete) focusSettings();
  });

  useEffect(() => {
    if (!actionError) return;
    actionErrorRef.current?.focus({ preventScroll: true });
    actionErrorRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [actionError]);

  useEffect(() => {
    if (section !== "plan" || !openTaskId) return;
    document.getElementById("portal-step-heading")?.focus({ preventScroll: true });
  }, [section, openTaskId]);

  useEffect(() => {
    if (!completionFocusPending.current || section !== "today" || editingProfile || !data?.client.onboardingComplete) return;
    const road = document.querySelector<HTMLElement>("[data-portal-road]");
    if (!road) return;
    road.focus({ preventScroll: true });
    completionFocusPending.current = false;
  }, [section, editingProfile, data]);

  useEffect(() => {
    if (section !== "docs" || openDocument || !documentReturnFocus.current) return;
    const action = document.getElementById(`portal-doc-action-${documentReturnFocus.current}`);
    const group = action?.closest("details");
    if (group) group.open = true;
    action?.focus();
    documentReturnFocus.current = null;
  }, [section, openDocument]);

  function exit() {
    sessionVersion.current += 1;
    setActionError(null);
    setBusyTask(null);
    setOpenDocument(null);
    setOpenTaskId(null);
    setRoadTravel(undefined);
    completionFocusPending.current = false;
    setReviewContext({ profile: "general", academicYear: "unspecified", applicantScope: "unspecified" });
    focusSettingsTarget.current = null;
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(KEY_SN);
    } catch {}
    setCode(null);
    setSurname(null);
    setData(null);
    router.replace("/portal");
  }

  function changeSection(next: Section, push = true) {
    if (next !== "settings") focusSettingsTarget.current = null;
    setSection(next);
    setOpenDocument(null);
    setOpenTaskId(null);
    if (push) {
      const url = next === "today" ? "/portal" : "/portal?view=" + next;
      if (window.location.pathname + window.location.search + window.location.hash !== url) window.history.pushState({}, "", url);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    track("portal_sec", { s: next });
  }

  function openSettings(target: SettingsTarget = "profile") {
    focusSettingsTarget.current = target;
    setSection("settings");
    setOpenDocument(null);
    setOpenTaskId(null);
    const url = "/portal?view=settings" + (target === "notifications" ? "#notifications" : "");
    if (window.location.pathname + window.location.search + window.location.hash !== url) window.history.pushState({}, "", url);
    if (section === "settings") focusSettings();
    track("portal_sec", { s: "settings" });
  }

  async function handleToggle(taskId: string, value: boolean) {
    if (!code || !surname || !data || busyTask) return;
    const version = sessionVersion.current;
    const taskTitle = tasksWithStages(data).find(({ task }) => task.id === taskId)?.task.t || "Шаг маршрута";
    setBusyTask(taskId);
    setActionError(null);
    try {
      const res = await toggleTask(code, surname, taskId, value);
      if (version !== sessionVersion.current) return;
      if (!res?.ok) throw new Error(typeof res?.error === "string" ? res.error : "Отметка не сохранена. Попробуй ещё раз.");
      setData((prev) => prev ? { ...prev, done: res.done, progress: res.progress } : prev);
      if (value && !data.done[taskId] && res.done[taskId]) {
        completionFocusPending.current = true;
        setRoadTravel({ fromDone: data.roadmap.flatMap(stage => stage.tasks).filter(task => data.done[task.id]).length, id: ++travelSequence.current });
      } else setRoadTravel(undefined);
      changeSection("today");
      track("portal_task", { done: value });
    } catch (error) {
      if (version === sessionVersion.current) setActionError({
        message: `${taskTitle}: ${error instanceof Error ? error.message : "Не удалось сохранить отметку."}`,
        retryLabel: "Сохранить отметку ещё раз",
        retry: () => { void handleToggle(taskId, value); },
      });
    } finally {
      if (version === sessionVersion.current) setBusyTask(null);
    }
  }

  async function handleSaveProfile(payload: {
    education?: string;
    goal?: string;
    budget?: string;
    educationPath?: "university_kz" | "foundation" | null;
    onboardingDone?: boolean;
  }) {
    if (!code || !surname) return { ok: false as const, error: "Сначала войди в кабинет." };
    const res = await savePortalProfile(code, surname, payload);
    if (res.ok) {
      if (profileFromTask.current && data) {
        const previousTasks = data.roadmap.flatMap(stage => stage.tasks);
        const nextTasks = res.data.roadmap.flatMap(stage => stage.tasks);
        const current = portalPosition(data).task;
        if (current && !data.done[current.id] && res.data.done[current.id]) {
          completionFocusPending.current = true;
          if (previousTasks.map(task => task.id).join("|") === nextTasks.map(task => task.id).join("|")) {
            setRoadTravel({ fromDone: previousTasks.filter(task => data.done[task.id]).length, id: ++travelSequence.current });
          }
        }
      }
      setData(res.data);
    }
    return res;
  }

  function requestUpload(taskId: string) {
    if (busyTask) return;
    pendingTaskRef.current = taskId;
    fileInputRef.current?.click();
  }

  function showDocument(taskId: string, restoreContext = true, returnTo?: Section) {
    if (openDocument !== taskId) stepReturnSection.current = returnTo || (section === "today" ? "today" : section === "plan" ? "plan" : "docs");
    const review = data?.docs?.[taskId]?.result?.review;
    if (review && restoreContext) setReviewContext({ profile: review.profile, academicYear: review.academicYear, applicantScope: review.applicantScope });
    setSection("docs");
    setOpenDocument(taskId);
    setOpenTaskId(null);
    const url = `/portal?view=docs&doc=${encodeURIComponent(taskId)}`;
    if (window.location.pathname + window.location.search !== url) window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function closeDocument() {
    if (stepReturnSection.current === "docs") documentReturnFocus.current = openDocument;
    changeSection(stepReturnSection.current);
  }

  async function saveDocumentResult(taskId: string, result: DocCheckResult, fileName: string) {
    if (!code || !surname) return;
    const version = sessionVersion.current;
    setBusyTask(taskId);
    setActionError(null);
    try {
      const saved = await uploadPortalDoc(code, surname, taskId, result, fileName);
      if (version !== sessionVersion.current) return;
      if (!saved?.ok) throw new Error(typeof saved?.error === "string" ? saved.error : "Не удалось сохранить результат.");
      setData((prev) => (prev ? { ...prev, docs: saved.docs, done: saved.done, progress: saved.progress } : prev));
      if (data && saved.done[taskId]) {
        if (!data.done[taskId]) {
          completionFocusPending.current = true;
          setRoadTravel({ fromDone: data.roadmap.flatMap(stage => stage.tasks).filter(task => data.done[task.id]).length, id: ++travelSequence.current });
        }
        changeSection("today");
      } else showDocument(taskId, false);
      track("portal_doc", { verdict: result.verdict });
    } catch (error) {
      if (version === sessionVersion.current) setActionError({
        message: `${DOC_TASKS[taskId] || "Документ"}: проверка завершена, но результат не сохранён. ${error instanceof Error ? error.message : "Попробуй ещё раз."}`,
        retryLabel: "Сохранить результат",
        // Retain the result only in this tab. Retrying storage must not run or bill the AI check again.
        retry: () => { void saveDocumentResult(taskId, result, fileName); },
      });
    } finally {
      if (version === sessionVersion.current) setBusyTask(null);
    }
  }

  async function handleFileChosen(file: File | null, taskId = pendingTaskRef.current, context = reviewContext) {
    if (!file || !taskId || !code || !surname) return;
    const version = sessionVersion.current;
    setBusyTask(taskId);
    setActionError(null);
    try {
      const res = await preparePayload(file);
      if (version !== sessionVersion.current) return;
      if ("error" in res) {
        setActionError({ message: `${DOC_TASKS[taskId] || "Документ"}: ${res.error}`, retryLabel: "Выбрать другой файл", retry: () => requestUpload(taskId) });
        return;
      }
      const result = await checkDocument(res.payload, DOC_TASKS[taskId] || "", context);
      if (version !== sessionVersion.current) return;
      await saveDocumentResult(taskId, result, file.name);
    } catch (error) {
      if (version === sessionVersion.current) setActionError({
        message: `${DOC_TASKS[taskId] || "Документ"}: ${error instanceof Error ? error.message : "Не удалось проверить файл. Попробуй ещё раз."}`,
        ...(error instanceof DocCheckError && !error.retryable ? {} : {
          retryLabel: "Проверить файл ещё раз",
          retry: () => { void handleFileChosen(file, taskId, context); },
        }),
      });
    } finally {
      if (version === sessionVersion.current) setBusyTask(null);
    }
  }

  async function handleCreateTelegramLink() {
    if (!code || !surname) return { ok: false, error: "Сначала войди в кабинет." };
    const res = await createTelegramLink(code, surname);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, url: res.url };
  }

  async function handleRefreshNotifications() {
    if (!code || !surname) return { ok: false, error: "Сначала войди в кабинет." };
    const res = await fetchPortal(code, surname);
    if (!res.ok) return { ok: false, error: res.error };
    setData(res.data);
    return {
      ok: true,
      linked: Boolean(res.data.client.tgLinked) && res.data.client.notify?.telegram !== false,
    };
  }

  async function handleDisableTelegram() {
    if (!code || !surname) return { ok: false, error: "Нет связи" };
    const res = await saveNotify(code, surname, { notifyTelegram: false });
    if (res && res.ok) {
      setData((prev) => (prev ? {
        ...prev,
        client: { ...prev.client, tgLinked: false, notify: { ...prev.client.notify, telegram: false } },
      } : prev));
      return { ok: true };
    }
    return { ok: false, error: res?.error };
  }

  async function handleDelete() {
    if (!code || !surname) return;
    if (!confirm("Удалить все данные без возможности восстановления?")) return;
    if (prompt("Для подтверждения введи слово УДАЛИТЬ") !== "УДАЛИТЬ") return;
    const res = await deletePortalData(code, surname);
    if (res && res.ok) {
      exit();
      alert("Данные удалены.");
    }
  }

  const position = useMemo(() => data ? portalPosition(data) : null, [data]);
  const activeTask = data?.roadmap.flatMap(stage => stage.tasks).find(task => task.id === (openDocument || openTaskId)) || null;
  const readOnlyReason = data && activeTask ? taskReadOnlyReason(data, activeTask) : "";

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: {
      portal: true, taskId: activeTask?.id, taskTitle: activeTask?.t, taskOwner: activeTask?.owner,
      taskContext: activeTask ? [activeTask.explain, readOnlyReason].filter(Boolean).join(" ") : undefined,
    } }));
    return () => { window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: {} })); };
  }, [activeTask, readOnlyReason]);

  function openAssistant() {
    window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: {
      source: "portal-header",
      taskId: activeTask?.id,
      taskTitle: activeTask?.t,
      taskOwner: activeTask?.owner,
      taskContext: activeTask ? [activeTask.explain, readOnlyReason].filter(Boolean).join(" ") : undefined,
    } }));
  }

  function openTask(task: PortalTask) {
    stepReturnSection.current = section === "today" ? "today" : "plan";
    if (DOC_TASKS[task.id]) {
      showDocument(task.id, true, stepReturnSection.current);
      return;
    }
    setOpenDocument(null);
    setOpenTaskId(task.id);
    setSection("plan");
    const url = `/portal?view=plan&task=${encodeURIComponent(task.id)}`;
    if (window.location.pathname + window.location.search !== url) window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (!code || !surname || !data) {
    return <PortalLogin onSubmit={(sn, c) => login(sn, c)} error={loginError} />;
  }

  if (!data.client.onboardingComplete || editingProfile) {
    return (
      <main id="main">
      <PortalOnboarding
        key={editingProfile ? "editing" : "first-run"}
        data={data}
        editing={editingProfile}
        onCancel={() => { profileFromTask.current = false; setEditingProfile(false); openSettings(); }}
        onSaveProfile={handleSaveProfile}
        onCreateTelegramLink={handleCreateTelegramLink}
        onRefreshNotifications={handleRefreshNotifications}
        onDone={(next) => {
          setData(next);
          setEditingProfile(false);
          if (profileFromTask.current) { profileFromTask.current = false; changeSection("today"); }
          else if (editingProfile) openSettings();
          else changeSection("today");
        }}
      />
      </main>
    );
  }

  return (
    <main id="main">
    <section className={styles.portal} data-portal-navigation>
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="Разделы личного кабинета">
          <Link href="/" className={styles.portalBrand}>IITALY</Link>
          <p className={styles.sidebarLabel}>Личный кабинет</p>
          <nav className={styles.nav} aria-label="Разделы личного кабинета">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={sectionUrl(item.id)}
                aria-current={section === item.id ? "page" : undefined}
                onClick={event => {
                  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault(); changeSection(item.id);
                }}
                className={styles.navItem + " " + (section === item.id ? styles.navItemActive : "")}
              >
                <span className={styles.navDot} aria-hidden />
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className={styles.main}>
          <div className={styles.topbar}>
            <div className={navigation.topCopy}>
              <span className={styles.mobileBrand}>IITALY</span>
              <h1 className={styles.greeting}>Привет, {data.client.name}</h1>
              <p className={styles.subline}>Поступление: сентябрь {data.client.intakeYear || "—"}</p>
            </div>
            <div className={navigation.headerLinks}>
              <a href="#iitaly-chat" data-portal-assistant data-step-id={activeTask?.id || ""} onClick={event => { event.preventDefault(); openAssistant(); }} className={navigation.settingsButton}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-4 3v-11a9 9 0 0 1 19 0Z" /><path d="M7 10h8M7 14h5" /></svg><span>Помощник</span></a>
              <a href="/portal?view=settings" aria-label="Настройки" onClick={event => {
                if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); openSettings();
              }} aria-current={section === "settings" ? "page" : undefined} className={navigation.settingsButton + " " + navigation.settingsLink}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z" /><circle cx="12" cy="12" r="3" /></svg><span>Настройки</span></a>
            </div>
          </div>

          <nav className={navigation.mobileNav} aria-label="Разделы кабинета">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={sectionUrl(item.id)}
                aria-current={section === item.id ? "page" : undefined}
                onClick={event => {
                  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault(); changeSection(item.id);
                }}
                className={styles.navItem + " " + (section === item.id ? styles.navItemActive : "")}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div id="portal-panel" className={styles.panel}>
            {actionError && (
              <div ref={actionErrorRef} tabIndex={-1} className={styles.actionError}>
                <p role="alert">{actionError.message}</p>
                {actionError.retry && <a href="#portal-panel" onClick={event => { event.preventDefault(); if (!busyTask) actionError.retry?.(); }} aria-disabled={busyTask !== null} className={styles.textLink}>{actionError.retryLabel}</a>}
              </div>
            )}
            {section === "today" && <TodaySection data={data} onOpenTask={openTask} onOpenDoc={showDocument} travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} />}
            {section === "plan" && (activeTask && openTaskId ? <PortalTaskDetail
              key={activeTask.id + ":" + Boolean(data.done[activeTask.id])}
              data={data} task={activeTask} busy={busyTask !== null} hasRetry={Boolean(actionError?.retry)}
              context={reviewContext} onContextChange={setReviewContext}
              onBack={() => changeSection(stepReturnSection.current)} backHref={sectionUrl(stepReturnSection.current)} onUpload={() => requestUpload(activeTask.id)}
              onToggle={value => { void handleToggle(activeTask.id, value); }}
              onEditProfile={() => { profileFromTask.current = true; setEditingProfile(true); }}
            /> : <PlanSection data={data} onOpenTask={openTask} />)}
            {section === "docs" && (openDocument && activeTask ? data.docs?.[openDocument] ? (
              <PortalDocumentReport title={/родител/i.test(activeTask.owner || "") ? taskTitle(activeTask) : DOC_TASKS[openDocument]} doc={data.docs[openDocument]}
                stepMeta={[data.roadmap.find(stage => stage.tasks.some(task => task.id === activeTask.id))?.title, activeTask.time || TASK_META[activeTask.id]?.min, activeTask.owner || "Ты"].filter(Boolean).join(" · ")}
                orientir={taskDate(activeTask)}
                onBack={closeDocument} backHref={sectionUrl(stepReturnSection.current)} onUpload={() => requestUpload(openDocument)} busy={busyTask !== null}
                canUpload={!readOnlyReason && !actionError?.retry} readOnlyReason={readOnlyReason}
                context={reviewContext} onContextChange={setReviewContext} />
            ) : <PortalTaskDetail
              key={activeTask.id + ":file"} data={data} task={activeTask} busy={busyTask !== null}
              hasRetry={Boolean(actionError?.retry)} context={reviewContext} onContextChange={setReviewContext}
              onBack={closeDocument} backHref={sectionUrl(stepReturnSection.current)} onUpload={() => requestUpload(activeTask.id)}
              onToggle={value => { void handleToggle(activeTask.id, value); }}
              onEditProfile={() => { profileFromTask.current = true; setEditingProfile(true); }}
            /> : <DocsSection currentTaskId={position?.task?.id} data={data} onOpenDoc={showDocument} />)}
            {section === "settings" && (
              <ProfileSection
                data={data}
                onEditProfile={() => setEditingProfile(true)}
                onBack={() => changeSection("today")}
                onDelete={handleDelete}
                onLogout={exit}
                notifications={<HelpSection
                  client={data.client}
                  onCreateTelegramLink={handleCreateTelegramLink}
                  onDisableTelegram={handleDisableTelegram}
                  onRefreshNotifications={handleRefreshNotifications}
                />}
              />
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.pdf,.docx,.txt,.rtf"
        hidden
        onChange={(e) => {
          handleFileChosen(e.target.files?.[0] || null);
          e.target.value = "";
        }}
      />
    </section>
    </main>
  );
}
