"use client";

import { useEffect, useRef, useState } from "react";
import { PortalLogin } from "./PortalLogin";
import { TodaySection } from "./TodaySection";
import { PlanSection } from "./PlanSection";
import { DocsSection } from "./DocsSection";
import { HelpSection } from "./HelpSection";
import {
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
      if (savedCode && savedSn) login(savedCode, savedSn, true);
    } catch {
      // localStorage unavailable — user just logs in manually
    }
    /* eslint-enable react-hooks/set-state-in-effect */
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

  async function handleSaveEmail(email: string) {
    if (!code || !surname) return { ok: false, error: "Нет связи" };
    const res = await saveNotify(code, surname, { email, notifyEmail: !!email });
    if (res && res.ok) {
      setData((prev) => (prev ? { ...prev, client: { ...prev.client, email } } : prev));
      track("notify_email");
      return { ok: true };
    }
    return { ok: false, error: res?.error };
  }

  async function handleDisableTelegram() {
    if (!code || !surname) return { ok: false, error: "Нет связи" };
    const res = await saveNotify(code, surname, { notifyTelegram: false });
    if (res && res.ok) {
      await login(code, surname, true);
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
            <h1 className="mt-1 font-display text-2xl font-black sm:text-3xl">{data.client.name}</h1>
          </div>
          <button
            type="button"
            onClick={exit}
            className="shrink-0 rounded-pill border-2 border-ink bg-paper px-3.5 py-1.5 text-xs font-extrabold whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
          >
            Выйти
          </button>
        </div>

        <nav className="sticky top-16 z-20 mt-5 flex gap-1 overflow-x-auto border-y-2 border-ink bg-cream py-2">
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
              onClick={() => {
                setSection(id);
                track("portal_sec", { s: id });
              }}
              aria-pressed={section === id}
              className={`shrink-0 rounded-pill px-4 py-2 text-sm font-bold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
                section === id ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
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
              code={code}
              onOpenChat={openChat}
              onSaveEmail={handleSaveEmail}
              onDisableTelegram={handleDisableTelegram}
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
