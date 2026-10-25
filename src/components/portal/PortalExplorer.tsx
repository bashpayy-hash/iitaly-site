"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import dynamic from "next/dynamic";
import { PortalLogin } from "./PortalLogin";
import { PortalOnboarding } from "./PortalOnboarding";
import { PortalTaskDetail } from "./PortalTaskDetail";
import { PortalUniversityStep } from "./PortalUniversityStep";
import { PortalFocus } from "./PortalFocus";
import { PortalCompletion, PortalSoundSetting } from "./PortalCompletion";
import { usePortalFeedback } from "./usePortalFeedback";
import { VespiPose } from "@/components/mascot/VespiPose";
import focusStyles from "./portal-focus.module.css";
import { DocsSection } from "./DocsSection";
import { PortalDocumentReport } from "./PortalDocumentReport";
import type { DocumentOperation } from "./PortalDocumentUpload";
import { HelpSection } from "./HelpSection";
import { ProfileSection } from "./ProfileSection";
import { VESPI_NAME } from "@/components/mascot/Vespi";
import { VespiOutline } from "@/components/mascot/VespiOutline";
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
import { portalProgress, portalTaskDone, portalTaskStageOpen } from "@/lib/portalProgress";
import { taskQuestions } from "@/lib/portalStepCopy";
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
type ActionError = { retryKind?: "check" | "save"; taskId?: string; message: string; retryLabel?: string; retry?: () => void };

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
  return view === "plan" || view === "docs" ? view : "today";
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
  const [selectedStageId, setSelectedStageId] = useState<string>();
  const feedback = usePortalFeedback();
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const [documentOperation, setDocumentOperation] = useState<DocumentOperation>();
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
  const documentContexts = useRef<Record<string, DocumentReviewContext>>({});
  const actionErrorRef = useRef<HTMLDivElement>(null);
  const sessionVersion = useRef(0);
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
  }, [hasPortalData, data?.client.onboardingComplete, editingProfile, section, openTaskId, openDocument]);

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
    documentContexts.current = {};
    setDocumentOperation(undefined);
    const savedReview = res.data.docs?.[documentFromLocation() || taskFromLocation() || ""]?.result?.review;
    setReviewContext(savedReview ? { profile: savedReview.profile, academicYear: savedReview.academicYear, applicantScope: savedReview.applicantScope } : { profile: "general", academicYear: "unspecified", applicantScope: "unspecified" });
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
    setSelectedStageId(new URLSearchParams(window.location.search).get("stage") || undefined);
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
      setSelectedStageId(new URLSearchParams(window.location.search).get("stage") || undefined);
      setOpenDocument(documentFromLocation());
      documentReturnTask.current = typeof window.history.state?.portalDocumentReturnTask === "string" ? window.history.state.portalDocumentReturnTask : null;
      setOpenTaskId(taskFromLocation());
      const taskId = documentFromLocation() || taskFromLocation();
      const savedReview = data?.docs?.[taskId || ""]?.result?.review;
      if (taskId) setReviewContext(documentContexts.current[taskId] || (savedReview ? { profile: savedReview.profile, academicYear: savedReview.academicYear, applicantScope: savedReview.applicantScope } : { profile: "general", academicYear: "unspecified", applicantScope: "unspecified" }));
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
  }, [data?.docs]);

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
    const target = actionErrorRef.current || document.querySelector<HTMLElement>("[data-document-operation-error]");
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "nearest", behavior: "instant" });
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
    feedback.reset();
    setActionError(null);
    setBusyTask(null);
    setOpenDocument(null);
    setOpenTaskId(null);
    setRoadTravel(undefined);
    completionFocusPending.current = false;
    setReviewContext({ profile: "general", academicYear: "unspecified", applicantScope: "unspecified" });
    setDocumentOperation(undefined);
    documentContexts.current = {};
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
    setSelectedStageId(undefined);
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

  function selectStage(id: string) {
    changeSection("today", false);
    setSelectedStageId(id);
    const url = `/portal?stage=${encodeURIComponent(id)}`;
    if (window.location.pathname + window.location.search !== url) window.history.pushState({}, "", url);
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
    feedback.reset();
    if (value) feedback.prime();
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
        feedback.confirm(taskId, actionTitle);
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
    feedback.prime();
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
    feedback.prime();
    const version = sessionVersion.current;
    const res = await savePortalProfile(code, surname, payload);
    if (version !== sessionVersion.current) return { ok: false as const, error: "Сессия кабинета изменилась. Открой профиль снова." };
    if (res.ok) {
      if (data) {
        const previousTasks = data.roadmap.flatMap(stage => stage.tasks);
        const nextTasks = res.data.roadmap.flatMap(stage => stage.tasks);
        const current = portalPosition(data).task;
        if (current && !data.done[current.id] && res.data.done[current.id]) {
          feedback.confirm(current.id, taskTitle(current));
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
    void taskId;
    requestAnimationFrame(() => {
      const prepare = document.querySelector<HTMLButtonElement>("[data-document-prepare]");
      prepare?.click();
      requestAnimationFrame(() => {
        const zone = document.querySelector<HTMLButtonElement>("[data-portal-upload-zone]");
        zone?.scrollIntoView({ block: "center", behavior: "instant" });
        zone?.focus();
      });
    });
  }

  function showDocument(taskId: string, restoreContext = true, returnTo?: Section) {
    if (openDocument !== taskId) {
      stepReturnSection.current = returnTo || (section === "today" ? "today" : section === "plan" ? "plan" : "docs");
      documentReturnTask.current = section === "plan" && openTaskId === "checkDocs" ? openTaskId : null;
    }
    const review = data?.docs?.[taskId]?.result?.review;
    if (openDocument !== taskId && restoreContext) setReviewContext(documentContexts.current[taskId] || (review ? { profile: review.profile, academicYear: review.academicYear, applicantScope: review.applicantScope } : { profile: "general", academicYear: "unspecified", applicantScope: "unspecified" }));
    setSection("docs");
    setOpenDocument(taskId);
    setOpenTaskId(null);
    const url = `/portal?view=docs&doc=${encodeURIComponent(taskId)}`;
    if (window.location.pathname + window.location.search !== url) window.history.pushState({
      portalDocumentReturnTask: documentReturnTask.current,
      portalBackHref: window.location.pathname + window.location.search,
    }, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function closeDocument() {
    if (typeof window.history.state?.portalBackHref === "string" && window.history.state.portalBackHref.startsWith("/portal")) {
      if (stepReturnSection.current === "docs") documentReturnFocus.current = openDocument;
      window.history.back();
      return;
    }
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
    setDocumentOperation({ taskId, fileName, phase: "saving" });
    try {
      const saved = await uploadPortalDoc(code, surname, taskId, result, fileName);
      if (version !== sessionVersion.current) return;
      if (!saved?.ok) throw new Error(typeof saved?.error === "string" ? saved.error : "Не удалось сохранить результат.");
      setData((prev) => (prev ? { ...prev, docs: saved.docs, done: saved.done, progress: saved.progress } : prev));
      const task = data?.roadmap.flatMap(stage => stage.tasks).find(row => row.id === taskId);
      const updated = data ? { ...data, docs: saved.docs, done: saved.done } : null;
      if (data && updated && task && portalTaskDone(updated, task)) {
        if (!portalTaskDone(data, task)) {
          feedback.confirm(task.id, taskTitle(task));
        }
        if (portalProgress(updated).done > portalProgress(data).done) {
          completionFocusPending.current = true;
          setRoadTravel({ fromDone: portalProgress(data).done, id: ++travelSequence.current });
        }
        changeSection("today");
      } else showDocument(taskId, false);
      setDocumentOperation({ taskId, fileName, phase: "saved" });
      track("portal_doc", { verdict: result.verdict });
    } catch (error) {
      if (version === sessionVersion.current) {
        setDocumentOperation({ taskId, fileName, phase: "error" });
        setActionError({
        taskId, retryKind: "save", message: `${DOC_TASKS[taskId] || "Документ"}: проверка завершена, но результат не сохранён. ${error instanceof Error ? error.message : "Попробуй ещё раз."}`,
        retryLabel: "Сохранить результат",
        // Retain the result only in this tab. Retrying storage must not run or bill the AI check again.
        retry: () => { void saveDocumentResult(taskId, result, fileName); },
      });
      }
    } finally {
      if (version === sessionVersion.current) setBusyTask(null);
    }
  }

  async function handleFileChosen(file: File | null, taskId: string, context = reviewContext) {
    if (!file || !taskId || !code || !surname) return;
    feedback.prime();
    const version = sessionVersion.current;
    setBusyTask(taskId);
    setActionError(null);
    setDocumentOperation({ taskId, fileName: file.name, phase: "preparing" });
    try {
      const res = await preparePayload(file);
      if (version !== sessionVersion.current) return;
      if ("error" in res) {
        setDocumentOperation({ taskId, fileName: file.name, phase: "error" });
        setActionError({ taskId, message: `${DOC_TASKS[taskId] || "Документ"}: ${res.error}`, retryLabel: undefined });
        return;
      }
      setDocumentOperation({ taskId, fileName: file.name, phase: "checking" });
      const result = await checkDocument(res.payload, DOC_TASKS[taskId] || "", context);
      if (version !== sessionVersion.current) return;
      await saveDocumentResult(taskId, result, file.name);
    } catch (error) {
      if (version === sessionVersion.current) {
        setDocumentOperation({ taskId, fileName: file.name, phase: "error" });
        setActionError({
        taskId, message: `${DOC_TASKS[taskId] || "Документ"}: ${error instanceof Error ? error.message : "Не удалось проверить файл. Попробуй ещё раз."}`,
        ...(error instanceof DocCheckError && !error.retryable ? {} : {
          retryKind: "check", retryLabel: "Проверить файл ещё раз",
          retry: () => { void handleFileChosen(file, taskId, context); },
        }),
      });
      }
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
  function updateReviewContext(value: DocumentReviewContext) {
    if (activeTask) documentContexts.current[activeTask.id] = value;
    setReviewContext(value);
  }
  const documentError = activeTask && actionError?.taskId === activeTask.id ? actionError : null;
  const activeOperation = activeTask?.id === documentOperation?.taskId ? documentOperation : undefined;
  const readOnlyReason = data && activeTask ? taskReadOnlyReason(data, activeTask) : "";
  const documentHistoryHref = typeof window !== "undefined" && typeof window.history.state?.portalBackHref === "string" ? window.history.state.portalBackHref : null;
  const documentBackHref = documentHistoryHref || (documentReturnTask.current ? `/portal?view=plan&task=${encodeURIComponent(documentReturnTask.current)}` : sectionUrl(stepReturnSection.current));
  const shortlistEditable = Boolean(activeTask?.id === "shortlist" && (data?.done.shortlist || !readOnlyReason));
  const canRecheckDocument = Boolean(activeTask && DOC_TASKS[activeTask.id] && data?.docs?.[activeTask.id]
    && portalTaskStageOpen(data, activeTask.id) && (portalTaskDone(data, activeTask) || activeTask.available !== false));
  const universityContext = shortlist.length ? `Выбранные университеты: ${shortlistNames(shortlist).join(", ")}. Конкретные программы и их сроки пока не подтверждены.` : "";
  const focusStage = data?.roadmap.find(stage => stage.id === selectedStageId) || position?.stage;
  const assistantTask = activeTask || (section === "today" || section === "plan" ? focusStage?.tasks.find(task => data && !portalTaskDone(data, task) && task.available !== false) || currentTask : null);
  const assistantReadOnly = data && assistantTask ? taskReadOnlyReason(data, assistantTask) : "";
  const assistantContext = assistantTask ? [taskExplanation(assistantTask), ...taskHelpDetails(assistantTask), universityContext, canRecheckDocument ? "Можно проверить новую версию. Новый разбор заменит предыдущий; результат проверки может изменить отметку шага." : shortlistEditable ? taskActionHint(assistantTask) : assistantReadOnly || taskActionHint(assistantTask)].filter(Boolean).join(" ") : undefined;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: {
      portal: true, taskId: assistantTask?.id, taskTitle: assistantTask ? taskTitle(assistantTask) : undefined,
      taskContext: assistantContext, taskDone: assistantTask && data ? portalTaskDone(data, assistantTask) : false,
      questions: assistantTask && data ? taskQuestions(assistantTask, portalTaskDone(data, assistantTask)) : undefined,
    } }));
    return () => { window.dispatchEvent(new CustomEvent("iitaly:portal-context", { detail: {} })); };
  }, [assistantTask, assistantContext, data]);

  function openAssistant() {
    window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: {
      source: "portal-header",
      taskId: assistantTask?.id,
      taskTitle: assistantTask ? taskTitle(assistantTask) : undefined,
      taskContext: assistantContext, taskDone: assistantTask && data ? portalTaskDone(data, assistantTask) : false,
      questions: assistantTask && data ? taskQuestions(assistantTask, portalTaskDone(data, assistantTask)) : undefined,
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
    if (DOC_TASKS[task.id]) {
      const review = data?.docs[task.id]?.result?.review;
      setReviewContext(documentContexts.current[task.id] || (review ? { profile: review.profile, academicYear: review.academicYear, applicantScope: review.applicantScope } : { profile: "general", academicYear: "unspecified", applicantScope: "unspecified" }));
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
      <MarketingHeader variant="portal" />
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

  const showFocus = section === "today" || (section === "plan" && !activeTask);

  return (
    <div className={`${styles.portal} ${focusStyles.portalRoot}`} data-portal-navigation data-portal-design="shared-site">
    <div ref={chromeRef} className={navigation.chrome} data-portal-chrome>
    <MarketingHeader variant="portal" actions={
      <div className={navigation.headerLinks}>
        <a href="#iitaly-chat" title={VESPI_NAME} data-portal-assistant data-step-id={assistantTask?.id || ""} onClick={event => { event.preventDefault(); openAssistant(); }} className={navigation.settingsButton}><VespiOutline /><span>Помощник</span></a>
        <a href="/portal?view=docs" aria-label="Документы" title="Документы" data-portal-documents className={navigation.settingsButton} onClick={event => { if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();changeSection("docs"); }}><FileText size={18} strokeWidth={1.5} aria-hidden="true" /></a>
        <a href="/portal?view=settings" aria-label="Настройки" onClick={event => {
          if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); openSettings();
        }} aria-current={section === "settings" ? "page" : undefined} className={navigation.settingsButton + " " + navigation.settingsLink}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z" /><circle cx="12" cy="12" r="3" /></svg><span>Настройки</span></a>
      </div>
    } />
    {!showFocus && <section className={navigation.progressShell} data-portal-progress-shell aria-label="Прогресс поступления">
      <PortalRoad data={data} current={currentTask} stage={position?.stage || null}
        activeStageId={activeTask ? data.roadmap.find(row => row.tasks.some(task => task.id === activeTask.id))?.id : undefined}
        deadline={nearestUniversityDeadline(shortlist)} navigationOnly onSelectStage={selectStage}
        currentOpen={Boolean(currentTask && activeTask?.id === currentTask.id)}
        secondaryAction={section === "settings" || Boolean(activeTask && currentTask && activeTask.id !== currentTask.id && (shortlistEditable || canRecheckDocument))}
        onOpenTask={openTask} travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} />
    </section>}
    </div>
    <main id="main">
      <div className={`${styles.shell} ${focusStyles.shell}`} data-focus-layout={showFocus ? "stage" : "detail"}>
        <div className={styles.main}>
          {!showFocus && <h1 className="sr-only">Личный кабинет: {activeTask ? taskTitle(activeTask) : section === "docs" ? "документы" : "настройки"}</h1>}
          <div id="portal-panel" className={styles.panel}>
            {shortlistNotice && <p role="status" className={styles.muted}>{shortlistNotice} <button type="button" className={styles.textLink} disabled={Boolean(busyTask)} onClick={() => { void handleSaveUniversities(shortlist); }}>Повторить синхронизацию</button></p>}
            {actionError && !documentError && (
              <div ref={actionErrorRef} tabIndex={-1} className={styles.actionError} data-portal-action-error>
                {/* В обзоре Веспи уже стоит в колонке «Сейчас»: одна фигура на экран. */}
                {!showFocus && <span className={styles.errorVespi} data-vespi-scene="oops" aria-hidden="true"><VespiPose pose="oops" sizes="72px" /></span>}
                <p role="alert">{actionError.message}</p>
                {actionError.retry && <a href="#portal-panel" onClick={event => { event.preventDefault(); if (!busyTask) actionError.retry?.(); }} aria-disabled={busyTask !== null} className={styles.textLink}>{actionError.retryLabel}</a>}
              </div>
            )}
            {showFocus && <PortalFocus data={data} selectedStageId={selectedStageId} shortlist={shortlist} busy={busyTask !== null}
              travel={roadTravel} onTravelStart={() => setRoadTravel(undefined)} onSelectStage={selectStage}
              onOpenTask={openTask} onComplete={task => { void handleToggle(task.id, true); }} onDocuments={() => changeSection("docs")} onSettings={() => openSettings()} />}
            {section === "plan" && (activeTask && openTaskId ? shortlistEditable ? <PortalUniversityStep
              key={activeTask.id} data={data} task={activeTask} selectedIds={shortlist} busy={busyTask !== null}
              onBack={backFromTask} backHref={stepReturnHref.current} onSave={handleSaveUniversities}
              onReopen={() => { void handleToggle("shortlist", false); }}
            /> : <PortalTaskDetail
              key={activeTask.id + ":" + Boolean(data.done[activeTask.id])}
              data={data} task={activeTask} busy={busyTask !== null} hasRetry={Boolean(actionError?.retry)}
              context={reviewContext} onContextChange={updateReviewContext}
              operation={activeOperation} error={documentError} onResetError={() => { setActionError(null); setDocumentOperation(undefined); }}
              onBack={backFromTask} backHref={stepReturnHref.current} onUpload={() => requestUpload(activeTask.id)} onFileDrop={file => { if (!busyTask) void handleFileChosen(file, activeTask.id); }}
              onToggle={value => { void handleToggle(activeTask.id, value); }}
              onEditProfile={() => { profileFromTask.current = true; setEditingProfile(true); }}
              managesCompletion={activeTask.id === "chances"}
            >
              {activeTask.id === "chances" && <PortalAssessment draft={assessmentDraft} onDraftChange={setAssessmentDraft}
                busy={busyTask !== null} hasRetry={Boolean(actionError?.retry)} onComplete={() => { void handleToggle(activeTask.id, true); }} />}
              {activeTask.id === "checkDocs" && <DocsSection data={data} currentTaskId={position?.task?.id} onOpenDoc={showDocument} embedded />}
              {activeTask.id === "kit" && <PortalPermessoStep />}
            </PortalTaskDetail> : null)}
            {section === "docs" && (openDocument && activeTask ? data.docs?.[openDocument] ? (
              <PortalDocumentReport key={openDocument} title={openDocument === "familyDocs" ? taskTitle(activeTask) : DOC_TASKS[openDocument]} doc={data.docs[openDocument]}
                stepMeta={data.roadmap.find(stage => stage.tasks.some(task => task.id === activeTask.id))?.title}
                preparationTime={activeTask.time || TASK_META[activeTask.id]?.min}
                onDocuments={() => changeSection("docs")} operation={activeOperation} error={documentError}
                onResetError={() => { setActionError(null); setDocumentOperation(undefined); }}
                orientir={taskDate(activeTask)}
                onBack={closeDocument} backHref={documentBackHref} onUpload={() => requestUpload(openDocument)} onFileDrop={file => { if (!busyTask) void handleFileChosen(file, openDocument); }} busy={busyTask !== null}
                canUpload={!readOnlyReason || canRecheckDocument} readOnlyReason={readOnlyReason}
                context={reviewContext} onContextChange={updateReviewContext} />
            ) : <PortalTaskDetail
              key={activeTask.id + ":file"} data={data} task={activeTask} busy={busyTask !== null}
              hasRetry={Boolean(actionError?.retry)} context={reviewContext} onContextChange={updateReviewContext}
              operation={activeOperation} error={documentError} onResetError={() => { setActionError(null); setDocumentOperation(undefined); }}
              onBack={closeDocument} backHref={documentBackHref} onUpload={() => requestUpload(activeTask.id)} onFileDrop={file => { if (!busyTask) void handleFileChosen(file, activeTask.id); }}
              onToggle={value => { void handleToggle(activeTask.id, value); }}
              onEditProfile={() => { profileFromTask.current = true; setEditingProfile(true); }}
            /> : <DocsSection currentTaskId={position?.task?.id} data={data} onOpenDoc={showDocument} />)}
            {section === "settings" && (
              <><ProfileSection
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
              /><PortalSoundSetting enabled={feedback.sound} onToggle={feedback.toggleSound} /></>
            )}
          </div>
        </div>
      </div>

    </main>
    <PortalCompletion feedback={feedback.feedback} data={data} />
    </div>
  );
}
