"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalLogin } from "./PortalLogin";
import { PortalOnboarding } from "./PortalOnboarding";
import { TodaySection } from "./TodaySection";
import { PortalProgress } from "./PortalProgress";
import { PlanSection } from "./PlanSection";
import { DocsSection } from "./DocsSection";
import { HelpSection } from "./HelpSection";
import { ProfileSection } from "./ProfileSection";
import styles from "./portal.module.css";
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
import { checkDocument, DocCheckError, type DocCheckResult } from "@/lib/checkDocument";
import { ACT_PAGE, DOC_TASKS, TASK_META, dlText } from "@/lib/portalMeta";
import { track } from "@/lib/track";

const KEY = "iitaly_portal_code";
const KEY_SN = "iitaly_portal_surname";

type Section = "today" | "plan" | "docs" | "help" | "profile";
type ActionError = { message: string; retryLabel?: string; retry?: () => void };

const NAV: { id: Section; label: string }[] = [
  { id: "today", label: "Обзор" },
  { id: "plan", label: "План" },
  { id: "docs", label: "Документы" },
  { id: "help", label: "Напоминания" },
  { id: "profile", label: "Профиль" },
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

function primaryTask(data: PortalData): TaskWithStage | null {
  const rows = tasksWithStages(data).filter(({ task }) => !data.done[task.id] && task.available !== false);
  rows.sort((a, b) => {
    const aParent = a.task.owner?.includes("Родители") ? 1 : 0;
    const bParent = b.task.owner?.includes("Родители") ? 1 : 0;
    const ad = a.task.daysLeft;
    const bd = b.task.daysLeft;
    const aUrgent = ad != null && ad <= 14 ? -1000 + ad : 0;
    const bUrgent = bd != null && bd <= 14 ? -1000 + bd : 0;
    return (aUrgent - bUrgent) || (aParent - bParent) || (a.order - b.order);
  });
  return rows[0] || null;
}

function sectionFromLocation(): Section {
  if (typeof window === "undefined") return "today";
  const view = new URLSearchParams(window.location.search).get("view");
  return NAV.some((item) => item.id === view) ? view as Section : "today";
}

export function PortalExplorer() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [surname, setSurname] = useState<string | null>(null);
  const [data, setData] = useState<PortalData | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("today");
  const [openStage, setOpenStage] = useState<string>("");
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const actionErrorRef = useRef<HTMLDivElement>(null);
  const sessionVersion = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTaskRef = useRef<string | null>(null);
  const triedAutoLogin = useRef(false);
  const focusPlanStage = useRef(false);

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
    setCode(c);
    setSurname(sn);
    setData(res.data);
    setSection(sectionFromLocation());
    const first = res.data.roadmap.find((st) => st.tasks.some((t) => !res.data.done[t.id] && t.available !== false));
    setOpenStage((first || res.data.roadmap[0])?.id || "");
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
    function syncSection() { setSection(sectionFromLocation()); }
    window.addEventListener("popstate", syncSection);
    return () => window.removeEventListener("popstate", syncSection);
  }, []);

  useEffect(() => {
    if (!actionError) return;
    actionErrorRef.current?.focus({ preventScroll: true });
    actionErrorRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [actionError]);

  useEffect(() => {
    if (section !== "plan" || !focusPlanStage.current) return;
    focusPlanStage.current = false;
    const stage = document.getElementById("portal-stage-" + openStage);
    stage?.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus();
  }, [section, openStage]);

  function exit() {
    sessionVersion.current += 1;
    setActionError(null);
    setBusyTask(null);
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
    setSection(next);
    if (push) {
      const url = next === "today" ? "/portal" : "/portal?view=" + next;
      window.history.pushState({}, "", url);
    }
    track("portal_sec", { s: next });
  }

  async function handleToggle(taskId: string, value: boolean) {
    if (!code || !surname || !data) return;
    const version = sessionVersion.current;
    const taskTitle = tasksWithStages(data).find(({ task }) => task.id === taskId)?.task.t || "Шаг маршрута";
    setBusyTask(taskId);
    setActionError(null);
    try {
      const res = await toggleTask(code, surname, taskId, value);
      if (version !== sessionVersion.current) return;
      if (!res?.ok) throw new Error(typeof res?.error === "string" ? res.error : "Отметка не сохранена. Попробуй ещё раз.");
      setData((prev) => prev ? { ...prev, done: res.done, progress: res.progress } : prev);
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
    if (res.ok) setData(res.data);
    return res;
  }

  function requestUpload(taskId: string) {
    pendingTaskRef.current = taskId;
    fileInputRef.current?.click();
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

  async function handleFileChosen(file: File | null, taskId = pendingTaskRef.current) {
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
      const result = await checkDocument(res.payload, DOC_TASKS[taskId] || "");
      if (version !== sessionVersion.current) return;
      await saveDocumentResult(taskId, result, file.name);
    } catch (error) {
      if (version === sessionVersion.current) setActionError({
        message: `${DOC_TASKS[taskId] || "Документ"}: ${error instanceof Error ? error.message : "Не удалось проверить файл. Попробуй ещё раз."}`,
        ...(error instanceof DocCheckError && !error.retryable ? {} : {
          retryLabel: "Проверить файл ещё раз",
          retry: () => { void handleFileChosen(file, taskId); },
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

  function openChat(prefill?: string) {
    window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: prefill ? { prefill } : undefined }));
  }

  const focus = useMemo(() => data ? primaryTask(data) : null, [data]);

  function openTask(row: TaskWithStage) {
    const task = row.task;
    const page = ACT_PAGE[task.id];
    if (page && task.id !== "profile") {
      router.push(page);
      return;
    }
    if (DOC_TASKS[task.id]) {
      changeSection("docs");
      return;
    }
    if (task.ai || task.expert) {
      openChat("Помоги с шагом: " + task.t);
      return;
    }
    setOpenStage(row.stageId);
    changeSection("plan");
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
        onSaveProfile={handleSaveProfile}
        onCreateTelegramLink={handleCreateTelegramLink}
        onRefreshNotifications={handleRefreshNotifications}
        onDone={(next) => {
          setData(next);
          setEditingProfile(false);
          changeSection(editingProfile ? "profile" : "today");
        }}
      />
      </main>
    );
  }

  return (
    <main id="main">
    <section className={styles.portal}>
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="Разделы личного кабинета">
          <Link href="/" className={styles.portalBrand}>IITALY</Link>
          <p className={styles.sidebarLabel}>Личный кабинет</p>
          <nav className={styles.nav} aria-label="Разделы личного кабинета">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={section === item.id ? "page" : undefined}
                onClick={() => changeSection(item.id)}
                className={styles.navItem + " " + (section === item.id ? styles.navItemActive : "")}
              >
                <span className={styles.navDot} aria-hidden />
                {item.label}
              </button>
            ))}
          </nav>
          <div className={styles.sidebarArt} aria-hidden>
            <p className={styles.sidebarArtText}>Маршрут меняется вместе с твоей ситуацией. Не нужно делать всё сразу.</p>
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.topbar}>
            <div>
              <span className={styles.mobileBrand}>IITALY</span>
              <h1 className={styles.greeting}>Привет, {data.client.name}</h1>
              <p className={styles.subline}>Поступление: сентябрь {data.client.intakeYear || "—"}</p>
            </div>
            <button type="button" onClick={exit} className={styles.ghostButton}>Выйти</button>
          </div>

          <div className={styles.mobileNav} aria-label="Разделы кабинета">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={section === item.id ? "page" : undefined}
                onClick={() => changeSection(item.id)}
                className={styles.navItem + " " + (section === item.id ? styles.navItemActive : "")}
              >
                {item.label}
              </button>
            ))}
          </div>

          {(section === "today" || section === "plan") && (
            <PortalProgress
              progress={data.progress}
              stageTitle={focus?.stageTitle}
              onOpenPlan={section === "today" ? () => {
                focusPlanStage.current = true;
                setOpenStage(focus?.stageId || data.roadmap[0]?.id || "");
                changeSection("plan");
              } : undefined}
            />
          )}

          {focus && (
            <section className={styles.globalFocus} aria-label="Главное действие">
              <div className={styles.globalFocusCopy}>
                <div className={styles.globalFocusEyebrow}>
                  <span>Сделай сегодня</span>
                  {focus.task.time && <span>· {focus.task.time}</span>}
                </div>
                <h2>{focus.task.t}</h2>
                <p>{focus.task.explain || TASK_META[focus.task.id]?.why || "Следующий шаг твоего маршрута."}</p>
                <div className={styles.globalFocusMeta}>
                  <span>{focus.task.owner || "Ты"}</span>
                  {focus.task.deadline && <span>{focus.task.deadlineKind || "Ориентир"}: {dlText(focus.task, false)}</span>}
                </div>
              </div>
              <div className={styles.globalFocusActions}>
                <button type="button" className={styles.primaryButton} onClick={() => openTask(focus)}>
                  {TASK_META[focus.task.id]?.act || (DOC_TASKS[focus.task.id] ? "Открыть документы" : "Открыть шаг")}
                </button>
                <button type="button" className={styles.textLink} onClick={() => openChat("Объясни мне этот шаг простыми словами: " + focus.task.t)}>
                  Спросить про этот шаг
                </button>
              </div>
            </section>
          )}

          <div id="portal-panel" className={styles.panel}>
            {actionError && (
              <div ref={actionErrorRef} tabIndex={-1} className={styles.actionError}>
                <p role="alert">{actionError.message}</p>
                {actionError.retry && <button type="button" onClick={actionError.retry} disabled={busyTask !== null} className={styles.secondaryButton}>{actionError.retryLabel}</button>}
              </div>
            )}
            {section === "today" && (
              <TodaySection
                data={data}
                onGoto={(stageId) => {
                  setOpenStage(stageId);
                  changeSection("plan");
                }}
                onOpenDocs={() => changeSection("docs")}
                onOpenHelp={() => changeSection("help")}
              />
            )}
            {section === "plan" && (
              <PlanSection
                data={data}
                openStage={openStage}
                onToggleTask={handleToggle}
                onUploadDoc={requestUpload}
                busyTask={busyTask}
                onAsk={(task) => openChat("Объясни мне этот шаг простыми словами: " + task.t)}
              />
            )}
            {section === "docs" && <DocsSection data={data} onUploadDoc={requestUpload} busyTask={busyTask} />}
            {section === "help" && (
              <HelpSection
                client={data.client}
                onCreateTelegramLink={handleCreateTelegramLink}
                onDisableTelegram={handleDisableTelegram}
                onRefreshNotifications={handleRefreshNotifications}
              />
            )}
            {section === "profile" && (
              <ProfileSection data={data} onEditProfile={() => setEditingProfile(true)} onDelete={handleDelete} />
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
