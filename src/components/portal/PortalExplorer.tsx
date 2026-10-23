"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { PortalLogin } from "./PortalLogin";
import { PortalOnboarding } from "./PortalOnboarding";
import { PortalTaskDetail } from "./PortalTaskDetail";
import { PortalUniversityStep } from "./PortalUniversityStep";
import { TodaySection } from "./TodaySection";
import { PlanSection } from "./PlanSection";
import { DocsSection } from "./DocsSection";
import { PortalDocumentReport } from "./PortalDocumentReport";
import { HelpSection } from "./HelpSection";
import { ProfileSection } from "./ProfileSection";
import { VESPI_NAME, VespiAvatar } from "@/components/mascot/Vespi";
import { PortalWelcome } from "./PortalWelcome";
import { PortalRoad } from "./PortalRoad";
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
import { portalPosition, taskActionHint, taskDate, taskExplanation, taskHelpDetails, taskReadOnlyReason, taskTitle } from "@/lib/portalNavigation";
import { track } from "@/lib/track";
import { portalShortlistKey, readShortlist, shortlistNames, writeShortlist, validShortlist, shortlistPending, markShortlistPending, nearestUniversityDeadline } from "@/lib/portalShortlist";
import { portalProgress, portalTaskDone } from "@/lib/portalProgress";
import { taskQuestions } from "@/lib/portalStepCopy";
import { PortalUniversitySummary } from "./PortalUniversitySummary";
import { WIZ } from "@/data/wizard";
import { EMPTY_PLAN_DRAFT, type PlanDraft } from "@/lib/usePlanDraft";
import { LocalWorkspace } from "./LocalWorkspace";

const PortalAssessment = dynamic(() => import("./PortalAssessment").then(module => module.PortalAssessment), {
  loading: () => <p role="status">Загружаю вопросы…</p>,
});
const PortalPermessoStep = dynamic(() => import("./PortalPermessoStep").then(module => module.PortalPermessoStep), {
  loading: () => <p role="status">Загружаю тренировочный бланк…</p>,
});

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
  const [restoringSession, setRestoringSession] = useState(true);
  const [loginRequested, setLoginRequested] = useState(false);
  const [section, setSection] = useState<Section>("today");
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [openDocument, setOpenDocument] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [roadTravel, setRoadTravel] = useState<{ fromDone: number; id: number }>();
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [shortlistNotice, setShortlistNotice] = useState("");
  // Kept only in this authenticated session, never shared with the public quiz
  // or another account. Switching portal views must not discard these answers.
  const [assessmentDraft, setAssessmentDraft] = useState<PlanDraft>(EMPTY_PLAN_DRAFT);
  const shortlistKey = useRef<string | null>(null);
  const [reviewContext, setReviewContext] = useState<DocumentReviewContext>({ profile: "general", academicYear: "unspecified", applicantScope: "unspecified" });
  const documentReturnFocus = useRef<string | null>(null);
  const actionErrorRef = useRef<HTMLDivElement>(null);
  const sessionVersion = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTaskRef = useRef<string | null>(null);
  const triedAutoLogin = useRef(false);
  const focusSettingsTarget = useRef<SettingsTarget | null>(null);
  const stepReturnSection = useRef<Section>("plan");
  const stepReturnHref = useRef("/portal?view=plan");
  const documentReturnTask = useRef<string | null>(null);
  const travelSequence = useRef(0);
  const completionFocusPending = useRef(false);
  const profileFromTask = useRef(false);
  const chromeRef = useRef<HTMLDivElement>(null);
  const hasPortalData = Boolean(code && surname && data);

  // The persistent guide can wrap with real task names or zoomed text. Measure
  // its actual height so sidebar and keyboard/anchor targets remain below it.
  useLayoutEffect(() => {
    const chrome = chromeRef.current;
    const portal = chrome?.parentElement;
    if (!chrome || !portal) return;
    const measure = () => portal.style.setProperty("--portal-chrome-height", `${chrome.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(chrome);
    return () => observer.disconnect();
  }, [hasPortalData, data?.client.onboardingComplete, editingProfile]);

  async function login(sn: string, c: string, silent = false) {
    const res = await fetchPortal(c, sn);
    if (!res.ok) {
      if (!silent) setLoginError(res.error);
      return;
    }
    setLoginError(null);
    sessionVersion.current += 1;
    const version = sessionVersion.current;
    let key: string | null = null;
    try { key = await portalShortlistKey(c, res.data.client.surname || sn); } catch {}
    if (version !== sessionVersion.current) return;
    shortlistKey.current = key;
    const remoteIds = validShortlist(res.data.client.profile?.universityIds);
    const localIds = key ? readShortlist(key) : [];
    const pending = key && shortlistPending(key);
    const selected = pending || (!res.data.client.profile?.universityIds && localIds.length) ? localIds : remoteIds;
    setShortlist(selected);
    setShortlistNotice("");
    if (key && selected.length && (pending || !res.data.client.profile?.universityIds)) {
      markShortlistPending(key, true);
      void savePortalProfile(c, sn, { universityIds: selected }).then(saved => {
        if (version !== sessionVersion.current) return;
        if (saved.ok && JSON.stringify(validShortlist(saved.data.client.profile?.universityIds)) === JSON.stringify(selected)) {
          markShortlistPending(key!, false);
        } else setShortlistNotice("Выбор сохранён на этом устройстве. Синхронизация с профилем пока недоступна.");
      });
    } else if (key && remoteIds.length) {
      try { writeShortlist(key, remoteIds); } catch { /* The server remains the source of truth. */ }
    }
    const profileAnswers = { ...res.data.client.profile, intake: res.data.client.intakeYear === 2027 ? "2027/28" : res.data.client.intakeYear === 2026 ? "2026/27" : undefined };
    const answers = Object.fromEntries(WIZ.flatMap(question => {
      const value = profileAnswers[question.id as keyof typeof profileAnswers];
      return typeof value === "string" && question.opts.some(option => option.v === value) ? [[question.id, value]] : [];
    }));
    setAssessmentDraft({ answers, step: Math.max(0, WIZ.findIndex(question => !answers[question.id])), complete: false });
    setActionError(null);
    setBusyTask(null);
    setRoadTravel(undefined);
    completionFocusPending.current = false;
    setCode(c);
    setSurname(sn);
    setData(res.data);
    const loginUrl = new URL(window.location.href);
    if (loginUrl.searchParams.has("auth") || loginUrl.searchParams.get("view") === "login") {
      loginUrl.searchParams.delete("auth");
      if (loginUrl.searchParams.get("view") === "login") loginUrl.searchParams.delete("view");
      window.history.replaceState(window.history.state, "", loginUrl.pathname + loginUrl.search + loginUrl.hash);
    }
    const nextSection = sectionFromLocation();
    stepReturnSection.current = nextSection === "docs" ? "docs" : "plan";
    if (nextSection === "settings") focusSettingsTarget.current = settingsTargetFromLocation();
    canonicalizeSettingsLocation();
    setSection(nextSection);
    setOpenDocument(documentFromLocation());
    documentReturnTask.current = typeof window.history.state?.portalDocumentReturnTask === "string" ? window.history.state.portalDocumentReturnTask : null;
    setOpenTaskId(taskFromLocation());
    stepReturnHref.current = typeof window.history.state?.portalBackHref === "string" ? window.history.state.portalBackHref : "/portal?view=plan";
    try {
      localStorage.setItem(KEY, c);
      localStorage.setItem(KEY_SN, sn);
    } catch {}
    // A short phone scrolls the login form to its submit control. Do not carry
    // that position into the route; settings deep links apply their own focus.
    window.scrollTo({ top: 0, behavior: "instant" });
    track("portal_open");
  }

  useEffect(() => {
    if (triedAutoLogin.current) return;
    triedAutoLogin.current = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoginRequested(new URLSearchParams(window.location.search).get("view") === "login" || new URLSearchParams(window.location.search).get("auth") === "login");
    try {
      const savedCode = localStorage.getItem(KEY);
      const savedSn = localStorage.getItem(KEY_SN);
      if (savedCode && savedSn) {
        void login(savedSn, savedCode, true).finally(() => setRestoringSession(false));
      } else setRestoringSession(false);
    } catch { setRestoringSession(false); }
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
      documentReturnTask.current = typeof window.history.state?.portalDocumentReturnTask === "string" ? window.history.state.portalDocumentReturnTask : null;
      setOpenTaskId(taskFromLocation());
      stepReturnHref.current = typeof window.history.state?.portalBackHref === "string" ? window.history.state.portalBackHref : "/portal?view=plan";
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
    shortlistKey.current = null;
    setShortlist([]);
    setAssessmentDraft(EMPTY_PLAN_DRAFT);
    documentReturnTask.current = null;
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
    documentReturnTask.current = null;
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
    if (!code || !surname || !data || busyTask) return false;
    const version = sessionVersion.current;
    const actionTask = tasksWithStages(data).find(({ task }) => task.id === taskId)?.task;
    const actionTitle = actionTask ? taskTitle(actionTask) : "Шаг маршрута";
    setBusyTask(taskId);
    setActionError(null);
    try {
      const res = await toggleTask(code, surname, taskId, value);
      if (version !== sessionVersion.current) return false;
      if (!res?.ok) throw new Error(typeof res?.error === "string" ? res.error : "Отметка не сохранена. Попробуй ещё раз.");
      setData((prev) => prev ? { ...prev, done: res.done, progress: res.progress } : prev);
      if (value && !data.done[taskId] && res.done[taskId]) {
        completionFocusPending.current = true;
        setRoadTravel({ fromDone: portalProgress(data).done, id: ++travelSequence.current });
      } else setRoadTravel(undefined);
      changeSection("today");
      track("portal_task", { done: value });
      return true;
    } catch (error) {
      if (version === sessionVersion.current) setActionError({
        message: `${actionTitle}: ${error instanceof Error ? error.message : "Не удалось сохранить отметку."}`,
        retryLabel: "Сохранить отметку ещё раз",
        retry: () => { void handleToggle(taskId, value); },
      });
      return false;
    } finally {
      if (version === sessionVersion.current) setBusyTask(null);
    }
  }

  async function syncUniversities(ids: string[]) {
    if (!code || !surname) return false;
    const version = sessionVersion.current;
    const res = await savePortalProfile(code, surname, { universityIds: ids });
    if (version !== sessionVersion.current) return false;
    if (!res.ok || JSON.stringify(validShortlist(res.data.client.profile?.universityIds)) !== JSON.stringify(ids)) {
      setShortlistNotice("Выбор сохранён на этом устройстве. Синхронизация с профилем пока недоступна.");
      return false;
    }
    if (shortlistKey.current) markShortlistPending(shortlistKey.current, false);
    setShortlistNotice("");
    setData(previous => previous ? { ...previous, client: { ...previous.client, profile: res.data.client.profile } } : previous);
    return true;
  }

  async function handleSaveUniversities(ids: string[]): Promise<boolean> {
    if (!data || busyTask) return false;
    const task = data.roadmap.flatMap(stage => stage.tasks).find(task => task.id === "shortlist");
    if (!task || (!data.done.shortlist && taskReadOnlyReason(data, task))) return false;
    const version = sessionVersion.current;
    const selected = validShortlist(ids);
    if (!selected.length) return false;
    let cached = false;
    try {
      if (shortlistKey.current) {
        writeShortlist(shortlistKey.current, selected);
        markShortlistPending(shortlistKey.current, true);
        cached = true;
      }
    } catch { /* Still try the authenticated server if browser storage is blocked. */ }
    setBusyTask("shortlist");
    const synced = await syncUniversities(selected);
    if (version !== sessionVersion.current) return false;
    setBusyTask(null);
    if (!synced && !cached) {
      setShortlistNotice("");
      setActionError({ message: "Выбор не сохранён. Проверь интернет и разрешение на хранение данных, затем попробуй ещё раз." });
      return false;
    }
    setShortlist(selected);
    if (data.done.shortlist || !synced) { setActionError(null); changeSection("today"); return true; }
    return handleToggle("shortlist", true);
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
            setRoadTravel({ fromDone: portalProgress(data).done, id: ++travelSequence.current });
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
    if (openDocument !== taskId) {
      stepReturnSection.current = returnTo || (section === "today" ? "today" : section === "plan" ? "plan" : "docs");
      documentReturnTask.current = section === "plan" && openTaskId === "checkDocs" ? openTaskId : null;
    }
    const review = data?.docs?.[taskId]?.result?.review;
    if (review && restoreContext) setReviewContext({ profile: review.profile, academicYear: review.academicYear, applicantScope: review.applicantScope });
    setSection("docs");
    setOpenDocument(taskId);
    setOpenTaskId(null);
    const url = `/portal?view=docs&doc=${encodeURIComponent(taskId)}`;
    if (window.location.pathname + window.location.search !== url) window.history.pushState({ portalDocumentReturnTask: documentReturnTask.current }, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function closeDocument() {
    const parent = data?.roadmap.flatMap(stage => stage.tasks).find(task => task.id === documentReturnTask.current);
    if (parent) {
      documentReturnTask.current = null;
      openTask(parent);
      stepReturnSection.current = "plan";
      return;
    }
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
          setRoadTravel({ fromDone: portalProgress(data).done, id: ++travelSequence.current });
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
      try { if (shortlistKey.current) localStorage.removeItem(shortlistKey.current); } catch {}
      exit();
      alert("Данные удалены.");
    }
  }

  const position = useMemo(() => data ? portalPosition(data) : null, [data]);
  const currentTask = position?.task || position?.stage?.tasks.find(task => data && !portalTaskDone(data, task)) || null;
  const activeTask = data?.roadmap.flatMap(stage => stage.tasks).find(task => task.id === (openDocument || openTaskId)) || null;
  const readOnlyReason = data && activeTask ? taskReadOnlyReason(data, activeTask) : "";
  const documentBackHref = documentReturnTask.current ? `/portal?view=plan&task=${encodeURIComponent(documentReturnTask.current)}` : sectionUrl(stepReturnSection.current);
  const shortlistEditable = Boolean(activeTask?.id === "shortlist" && (data?.done.shortlist || !readOnlyReason));
  const canRecheckDocument = Boolean(activeTask && DOC_TASKS[activeTask.id] && data?.docs?.[activeTask.id]
    && (data.done[activeTask.id] || activeTask.available !== false));
  const universityContext = shortlist.length ? `Выбранные университеты: ${shortlistNames(shortlist).join(", ")}. Конкретные программы и их сроки пока не подтверждены.` : "";
  const assistantContext = activeTask ? [taskExplanation(activeTask), ...taskHelpDetails(activeTask), universityContext, canRecheckDocument ? "Можно проверить новую версию. Новый разбор заменит предыдущий; результат проверки может изменить отметку шага." : shortlistEditable ? taskActionHint(activeTask) : readOnlyReason || taskActionHint(activeTask)].filter(Boolean).join(" ") : undefined;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: {
      portal: true, taskId: activeTask?.id, taskTitle: activeTask ? taskTitle(activeTask) : undefined,
      taskContext: assistantContext, taskDone: activeTask && data ? portalTaskDone(data, activeTask) : false,
      questions: activeTask && data ? taskQuestions(activeTask, portalTaskDone(data, activeTask)) : undefined,
    } }));
    return () => { window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: {} })); };
  }, [activeTask, assistantContext, data]);

  function openAssistant() {
    window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: {
      source: "portal-header",
      taskId: activeTask?.id,
      taskTitle: activeTask ? taskTitle(activeTask) : undefined,
      taskContext: assistantContext, taskDone: activeTask && data ? portalTaskDone(data, activeTask) : false,
      questions: activeTask && data ? taskQuestions(activeTask, portalTaskDone(data, activeTask)) : undefined,
    } }));
  }

  function backFromTask() {
    if (window.history.state?.portalBackHref) window.history.back();
    else changeSection("plan");
  }

  function openTask(task: PortalTask, intent?: "instruction" | "upload") {
    if (!activeTask) stepReturnSection.current = section;
    if (DOC_TASKS[task.id] && intent !== "instruction") {
      showDocument(task.id, true, stepReturnSection.current);
      if (intent === "upload") requestUpload(task.id);
      return;
    }
    setOpenDocument(null);
    setOpenTaskId(task.id);
    setSection("plan");
    const url = `/portal?view=plan&task=${encodeURIComponent(task.id)}`;
    if (window.location.pathname + window.location.search !== url) {
      stepReturnHref.current = window.location.pathname + window.location.search;
      window.history.pushState({ portalBackHref: stepReturnHref.current }, "", url);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (!code || !surname || !data) {
    if (restoringSession) return <div className={styles.portal}><MarketingHeader variant="portal"/><main id="main" className={styles.shell}><p role="status">Открываю твой маршрут…</p></main></div>;
    if (loginRequested) return <><PortalLogin onSubmit={(sn, c) => login(sn, c)} error={loginError} /><a className={styles.guestReturn} href="/portal">Продолжить в локальном профиле</a></>;
    return <LocalWorkspace />;
  }

  if (!data.client.onboardingComplete || editingProfile) {
    return (
      <div className={styles.portal}>
      <div ref={chromeRef} className={navigation.chrome} data-portal-chrome>
      <MarketingHeader variant="portal" onHome={() => {
        if (!editingProfile) return;
        profileFromTask.current = false; setEditingProfile(false); changeSection("today");
      }} />
      {editingProfile && data.client.onboardingComplete && <section className={navigation.progressShell} data-portal-progress-shell aria-label="Прогресс поступления">
        <PortalRoad data={data} current={currentTask} stage={position?.stage || null} onOpenTask={openTask} currentOpen navigationOnly />
      </section>}
      </div>
      <main id="main">
      <PortalOnboarding
        key={editingProfile ? "editing" : "first-run"}
        data={data}
        editing={editingProfile}
        onCancel={() => {
          const fromTask = profileFromTask.current;
          profileFromTask.current = false; setEditingProfile(false);
          if (!fromTask) openSettings();
        }}
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
      </div>
    );
  }

  return (
    <div className={styles.portal} data-portal-navigation data-portal-design="shared-site">
    <div ref={chromeRef} className={navigation.chrome} data-portal-chrome>
    <MarketingHeader variant="portal" onHome={() => changeSection("today")} actions={
      <div className={navigation.headerLinks}>
        <a href="#iitaly-chat" title={VESPI_NAME} data-portal-assistant data-step-id={activeTask?.id || ""} onClick={event => { event.preventDefault(); openAssistant(); }} className={navigation.settingsButton}><VespiAvatar /><span>Помощник</span></a>
        <a href="/portal?view=settings" aria-label="Настройки" onClick={event => {
          if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); openSettings();
        }} aria-current={section === "settings" ? "page" : undefined} className={navigation.settingsButton + " " + navigation.settingsLink}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z" /><circle cx="12" cy="12" r="3" /></svg><span>Настройки</span></a>
      </div>
    } />
    {section !== "today" && <section className={navigation.progressShell} data-portal-progress-shell aria-label="Прогресс поступления">
      <PortalRoad data={data} current={currentTask} stage={position?.stage || null}
        activeStageId={activeTask ? data.roadmap.find(row => row.tasks.some(task => task.id === activeTask.id))?.id : undefined}
        deadline={nearestUniversityDeadline(shortlist)} navigationOnly
        currentOpen={Boolean(currentTask && activeTask?.id === currentTask.id)}
        secondaryAction={section === "settings" || Boolean(activeTask && currentTask && activeTask.id !== currentTask.id && (shortlistEditable || canRecheckDocument))}
        onOpenTask={openTask} travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} />
    </section>}
    </div>
    <main id="main">
      {section === "today" && <div className={navigation.arrival} data-portal-arrival>
        <PortalWelcome name={data.client.name} intakeYear={data.client.intakeYear}><PortalUniversitySummary ids={shortlist} onEdit={() => { const task = data.roadmap.flatMap(row => row.tasks).find(task => task.id === "shortlist"); if (task) openTask(task); }} /></PortalWelcome>
        <section data-portal-progress-shell aria-label="Прогресс поступления">
          <PortalRoad data={data} current={currentTask} stage={position?.stage || null}
            deadline={nearestUniversityDeadline(shortlist)} progressFirst onOpenTask={openTask} travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} />
        </section>
      </div>}
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="Разделы личного кабинета">
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
          {section !== "today" && <h1 className="sr-only">Личный кабинет — {activeTask ? taskTitle(activeTask) : section === "plan" ? "план поступления" : section === "docs" ? "документы" : "настройки"}</h1>}

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
            {shortlistNotice && <p role="status" className={styles.muted}>{shortlistNotice} <button type="button" className={styles.textLink} disabled={Boolean(busyTask)} onClick={() => { void handleSaveUniversities(shortlist); }}>Повторить синхронизацию</button></p>}
            {actionError && (
              <div ref={actionErrorRef} tabIndex={-1} className={styles.actionError}>
                <p role="alert">{actionError.message}</p>
                {actionError.retry && <a href="#portal-panel" onClick={event => { event.preventDefault(); if (!busyTask) actionError.retry?.(); }} aria-disabled={busyTask !== null} className={styles.textLink}>{actionError.retryLabel}</a>}
              </div>
            )}
            {section === "today" && <TodaySection data={data} onOpenDoc={showDocument} onOpenDocuments={() => changeSection("docs")} shortlist={shortlist} onOpenTask={openTask} />}
            {section === "plan" && (activeTask && openTaskId ? shortlistEditable ? <PortalUniversityStep
              key={activeTask.id} data={data} task={activeTask} selectedIds={shortlist} busy={busyTask !== null}
              onBack={backFromTask} backHref={stepReturnHref.current} onSave={handleSaveUniversities}
              onReopen={() => { void handleToggle("shortlist", false); }}
            /> : <PortalTaskDetail
              key={activeTask.id + ":" + Boolean(data.done[activeTask.id])}
              data={data} task={activeTask} busy={busyTask !== null} hasRetry={Boolean(actionError?.retry)}
              context={reviewContext} onContextChange={setReviewContext}
              onBack={backFromTask} backHref={stepReturnHref.current} onUpload={() => requestUpload(activeTask.id)} onFileDrop={file => { if (!busyTask) void handleFileChosen(file, activeTask.id); }}
              onToggle={value => { void handleToggle(activeTask.id, value); }}
              onEditProfile={() => { profileFromTask.current = true; setEditingProfile(true); }}
              managesCompletion={activeTask.id === "chances"}
            >
              {activeTask.id === "chances" && <PortalAssessment draft={assessmentDraft} onDraftChange={setAssessmentDraft}
                busy={busyTask !== null} hasRetry={Boolean(actionError?.retry)} onComplete={() => { void handleToggle(activeTask.id, true); }} />}
              {activeTask.id === "checkDocs" && <DocsSection data={data} currentTaskId={position?.task?.id} onOpenDoc={showDocument} embedded />}
              {activeTask.id === "kit" && <PortalPermessoStep />}
            </PortalTaskDetail> : <PlanSection data={data} onOpenTask={openTask} />)}
            {section === "docs" && (openDocument && activeTask ? data.docs?.[openDocument] ? (
              <PortalDocumentReport title={openDocument === "familyDocs" ? taskTitle(activeTask) : DOC_TASKS[openDocument]} doc={data.docs[openDocument]}
                stepMeta={[data.roadmap.find(stage => stage.tasks.some(task => task.id === activeTask.id))?.title, activeTask.time || TASK_META[activeTask.id]?.min].filter(Boolean).join(" · ")}
                orientir={taskDate(activeTask)}
                onBack={closeDocument} backHref={documentBackHref} onUpload={() => requestUpload(openDocument)} onFileDrop={file => { if (!busyTask) void handleFileChosen(file, openDocument); }} busy={busyTask !== null}
                canUpload={(!readOnlyReason || canRecheckDocument) && !actionError?.retry} readOnlyReason={readOnlyReason}
                context={reviewContext} onContextChange={setReviewContext} />
            ) : <PortalTaskDetail
              key={activeTask.id + ":file"} data={data} task={activeTask} busy={busyTask !== null}
              hasRetry={Boolean(actionError?.retry)} context={reviewContext} onContextChange={setReviewContext}
              onBack={closeDocument} backHref={documentBackHref} onUpload={() => requestUpload(activeTask.id)} onFileDrop={file => { if (!busyTask) void handleFileChosen(file, activeTask.id); }}
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
    </main>
    </div>
  );
}
