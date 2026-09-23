"use client";

import { useEffect, useRef, useState } from "react";
import { PortalLogin } from "./PortalLogin";
import { TodaySection } from "./TodaySection";
import { PlanSection } from "./PlanSection";
import { DocsSection } from "./DocsSection";
import { HelpSection } from "./HelpSection";
import styles from "./portal.module.css";
import {
  createTelegramLink,
  deletePortalData,
  fetchPortal,
  saveNotify,
  toggleTask,
  uploadPortalDoc,
  type PortalData,
} from "@/lib/portalApi";
import { preparePayload } from "@/lib/docPayload";
import { checkDocument } from "@/lib/checkDocument";
import { DOC_TASKS } from "@/lib/portalMeta";
import { track } from "@/lib/track";

const KEY = "iitaly_portal_code";
const KEY_SN = "iitaly_portal_surname";

type Section = "today" | "plan" | "docs" | "help";

const NAV: { id: Section; label: string }[] = [
  { id: "today", label: "Обзор" },
  { id: "plan", label: "План поступления" },
  { id: "docs", label: "Документы" },
  { id: "help", label: "Напоминания и помощь" },
];

export function PortalExplorer() {
  const [code, setCode] = useState<string | null>(null);
  const [surname, setSurname] = useState<string | null>(null);
  const [data, setData] = useState<PortalData | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("today");
  const [openStage, setOpenStage] = useState<string>("");
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTaskRef = useRef<string | null>(null);
  const triedAutoLogin = useRef(false);

  async function login(sn: string, c: string, silent = false) {
    const res = await fetchPortal(c, sn);
    if (!res.ok) {
      if (!silent) setLoginError(res.error);
      return;
    }
    setLoginError(null);
    setCode(c);
    setSurname(sn);
    setData(res.data);
    if (window.location.hash === "#notifications") setSection("help");
    const first = res.data.roadmap.find((st) => st.tasks.some((t) => !res.data.done[t.id]));
    setOpenStage((first || res.data.roadmap[0])?.id || "");
    try {
      localStorage.setItem(KEY, c);
      localStorage.setItem(KEY_SN, sn);
    } catch {}
    track("portal_open", { tier: res.data.client.tier });
  }

  useEffect(() => {
    if (triedAutoLogin.current) return;
    triedAutoLogin.current = true;
    try {
      const savedCode = localStorage.getItem(KEY);
      const savedSn = localStorage.getItem(KEY_SN);
      if (savedCode && savedSn) login(savedSn, savedCode, true);
    } catch {}
  }, []);

  useEffect(() => {
    function openReminderSettings() {
      if (window.location.hash === "#notifications") setSection("help");
    }
    window.addEventListener("hashchange", openReminderSettings);
    return () => window.removeEventListener("hashchange", openReminderSettings);
  }, []);

  function exit() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(KEY_SN);
    } catch {}
    setCode(null);
    setSurname(null);
    setData(null);
  }

  function changeSection(next: Section) {
    setSection(next);
    track("portal_sec", { s: next });
  }

  async function handleToggle(taskId: string, value: boolean) {
    if (!code || !surname || !data) return;
    setBusyTask(taskId);
    const res = await toggleTask(code, surname, taskId, value);
    if (res && res.ok) {
      setData({ ...data, done: res.done, progress: res.progress });
      track("portal_task", { done: value });
    }
    setBusyTask(null);
  }

  function requestUpload(taskId: string) {
    pendingTaskRef.current = taskId;
    fileInputRef.current?.click();
  }

  async function handleFileChosen(file: File | null) {
    const taskId = pendingTaskRef.current;
    if (!file || !taskId || !code || !surname) return;
    setBusyTask(taskId);
    const res = await preparePayload(file);
    if ("error" in res) {
      setBusyTask(null);
      return;
    }
    try {
      const result = await checkDocument(res.payload, DOC_TASKS[taskId] || "");
      const saved = await uploadPortalDoc(code, surname, taskId, result, file.name);
      if (saved && saved.ok) {
        setData((prev) => (prev ? { ...prev, docs: saved.docs, done: saved.done, progress: saved.progress } : prev));
        track("portal_doc", { verdict: result.verdict });
      }
    } catch {}
    setBusyTask(null);
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
    setData((prev) => (prev ? { ...prev, client: res.data.client } : prev));
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

  function openChat() {
    window.dispatchEvent(new CustomEvent("iitaly:open-chat"));
  }

  if (!code || !surname || !data) {
    return <PortalLogin onSubmit={(sn, c) => login(sn, c)} error={loginError} />;
  }

  return (
    <section className={styles.portal}>
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="Разделы личного кабинета">
          <p className={styles.sidebarLabel}>Личный кабинет</p>
          <div className={styles.nav}>
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={section === item.id ? "page" : undefined}
                onClick={() => changeSection(item.id)}
                className={`${styles.navItem} ${section === item.id ? styles.navItemActive : ""}`}
              >
                <span className={styles.navDot} aria-hidden />
                {item.label}
              </button>
            ))}
          </div>
          <div className={styles.sidebarArt} aria-hidden>
            <p className={styles.sidebarArtText}>Спокойно. По одному шагу за раз — и маршрут складывается.</p>
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.topbar}>
            <div>
              <h1 className={styles.greeting}>Привет, {data.client.name}</h1>
              <p className={styles.subline}>Система показывает только то, что важно сейчас.</p>
            </div>
            <div className={styles.topActions}>
              <span className={styles.intakeChip}>Intake {data.client.intakeYear || "—"}</span>
              <button type="button" onClick={exit} className={styles.ghostButton}>Выйти</button>
            </div>
          </div>

          <div className={styles.mobileNav} role="tablist" aria-label="Разделы кабинета">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={section === item.id}
                onClick={() => changeSection(item.id)}
                className={`${styles.navItem} ${section === item.id ? styles.navItemActive : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            id="portal-panel"
            role="tabpanel"
            tabIndex={0}
            className={styles.panel}
          >
            {section === "today" && (
              <TodaySection
                data={data}
                onGoto={(stageId) => {
                  setOpenStage(stageId);
                  changeSection("plan");
                }}
                onMarkDone={(taskId) => handleToggle(taskId, true)}
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
              />
            )}
            {section === "docs" && <DocsSection data={data} onUploadDoc={requestUpload} busyTask={busyTask} />}
            {section === "help" && (
              <HelpSection
                client={data.client}
                onOpenChat={openChat}
                onCreateTelegramLink={handleCreateTelegramLink}
                onDisableTelegram={handleDisableTelegram}
                onRefreshNotifications={handleRefreshNotifications}
                onDelete={handleDelete}
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
  );
}
