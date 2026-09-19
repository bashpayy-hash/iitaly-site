"use client";

import { useEffect, useRef, useState } from "react";
import { PortalLogin } from "./PortalLogin";
import { TodaySection } from "./TodaySection";
import { PlanSection } from "./PlanSection";
import { DocsSection } from "./DocsSection";
import { HelpSection } from "./HelpSection";
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
    // The public plan links to settings, never sends credentials in the URL.
    if (window.location.hash === "#notifications") setSection("help");
    const first = res.data.roadmap.find((st) => st.tasks.some((t) => !res.data.done[t.id]));
    setOpenStage((first || res.data.roadmap[0])?.id || "");
    try {
      localStorage.setItem(KEY, c);
      localStorage.setItem(KEY_SN, sn);
    } catch {
      // localStorage unavailable — auto-login on return just won't work
    }
    track("portal_open", { tier: res.data.client.tier });
  }

  useEffect(() => {
    if (triedAutoLogin.current) return;
    triedAutoLogin.current = true;
    // Restoring a saved session on mount inherently means an effect kicking off
    // an async fetch whose resolution calls setState — that's the standard
    // "fetch on mount" shape, not a synchronous cascading-render loop.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const savedCode = localStorage.getItem(KEY);
      const savedSn = localStorage.getItem(KEY_SN);
      if (savedCode && savedSn) login(savedSn, savedCode, true);
    } catch {
      // localStorage unavailable — user just logs in manually
    }
    /* eslint-enable react-hooks/set-state-in-effect */
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
    } catch {
      // best-effort
    }
    setCode(null);
    setSurname(null);
    setData(null);
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
    } catch {
      // upload failed — busyTask reset below leaves the button actionable again
    }
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
    <section className="px-5 pt-8 pb-16">
      <div className="mx-auto max-w-[900px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
              {data.client.tier} · набор {data.client.intakeYear || ""}/
              {String((data.client.intakeYear || 0) + 1).slice(2)}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{data.client.name}</h1>
          </div>
          <button
            type="button"
            onClick={exit}
            className="shrink-0 rounded-pill border-2 border-ink bg-paper px-3.5 py-1.5 text-xs font-extrabold whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
          >
            Выйти
          </button>
        </div>

        {/* Переключатель разделов кабинета — это вкладки, а не навигация:
           он не ведёт на другие адреса, а подменяет панель под собой.
           Раньше это был <nav> с кнопками aria-pressed: диктор читал их
           как четыре независимые кнопки-переключателя и никак не связывал
           с панелью, которая от них меняется. Роли tablist/tab/tabpanel
           эту связь называют явно: «вкладка 2 из 4, выбрана», а
           aria-controls ведёт к самой панели. */}
        <div
          role="tablist"
          aria-label="Разделы кабинета"
          className="sticky top-16 z-20 mt-5 flex gap-1 overflow-x-auto border-y-2 border-ink bg-cream py-2"
        >
          {(
            [
              ["today", "Сегодня"],
              ["plan", "План"],
              ["docs", "Документы"],
              ["help", "Помощь"],
            ] as [Section, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`portal-tab-${id}`}
              aria-selected={section === id}
              aria-controls="portal-panel"
              // Из четырёх вкладок в Tab-обход попадает только выбранная —
              // так положено в этом паттерне: внутри группы переключают
              // стрелками, а Tab уводит сразу в содержимое панели.
              tabIndex={section === id ? 0 : -1}
              onKeyDown={(e) => {
                const order: Section[] = ["today", "plan", "docs", "help"];
                const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                const next = order[(order.indexOf(section) + step + order.length) % order.length];
                setSection(next);
                document.getElementById(`portal-tab-${next}`)?.focus();
              }}
              onClick={() => {
                setSection(id);
                track("portal_sec", { s: id });
              }}
              className={`shrink-0 rounded-pill px-4 py-2 text-sm font-bold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
                section === id ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          id="portal-panel"
          role="tabpanel"
          aria-labelledby={`portal-tab-${section}`}
          // Панель фокусируема, иначе после Tab с вкладки фокус
          // перепрыгивал бы сразу на первую кнопку внутри неё, а
          // содержимое панели осталось бы непрочитанным.
          tabIndex={0}
          className="mt-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red"
        >
          {section === "today" && (
            <TodaySection
              data={data}
              onGoto={(stageId) => {
                setOpenStage(stageId);
                setSection("plan");
              }}
              onMarkDone={(taskId) => handleToggle(taskId, true)}
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
