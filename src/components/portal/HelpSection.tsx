"use client";

import { useEffect, useRef, useState } from "react";
import type { PortalClient } from "@/lib/portalApi";
import settings from "./portal-settings.module.css";
import disclosure from "@/components/ui/disclosure.module.css";

export function HelpSection({
  client,
  onCreateTelegramLink,
  onDisableTelegram,
  onRefreshNotifications,
}: {
  client: PortalClient;
  onCreateTelegramLink: () => Promise<{ ok: boolean; url?: string; error?: string }>;
  onDisableTelegram: () => Promise<{ ok: boolean; error?: string }>;
  onRefreshNotifications: () => Promise<{ ok: boolean; linked?: boolean; error?: string }>;
}) {
  const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
  const [telegramBusy, setTelegramBusy] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const tgEnabled = Boolean(client.tgLinked) && client.notify?.telegram !== false;

  async function createTgLink() {
    if (telegramBusy) return;
    setTelegramBusy(true);
    setMsg(null);
    const res = await onCreateTelegramLink();
    setTelegramBusy(false);
    if (!res.ok || !res.url) {
      setMsg({ text: res.error || "Не удалось создать ссылку Telegram.", bad: true });
      return;
    }
    setTelegramUrl(res.url);
    setMsg({ text: "Открой Telegram и нажми «Запустить». После этого вернись сюда.", bad: false });
  }

  async function disableTg() {
    if (telegramBusy) return;
    setTelegramBusy(true);
    setMsg(null);
    const res = await onDisableTelegram();
    setTelegramBusy(false);
    setTelegramUrl(null);
    setMsg(res.ok
      ? { text: "Telegram отключён.", bad: false }
      : { text: res.error || "Не удалось сохранить.", bad: true });
  }

  /* Back from Telegram (owner, 23 Nov: «проверь в целом телеграм»): the
     connection used to wait for a tap on «Проверить подключение». When the
     page comes back into view with a link handed out, it checks by itself;
     the button stays for anyone who wants to check again. */
  const refreshRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    if (!telegramUrl) return;
    const onVisible = () => { if (document.visibilityState === "visible") void refreshRef.current(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [telegramUrl]);

  async function refreshTelegram() {
    if (telegramBusy) return;
    setTelegramBusy(true);
    setMsg(null);
    const res = await onRefreshNotifications();
    setTelegramBusy(false);
    setMsg(!res.ok
      ? { text: res.error || "Не удалось проверить подключение.", bad: true }
      : res.linked
        ? { text: "Telegram подключён. Напоминания включены.", bad: false }
        : { text: "Подключение пока не подтверждено. В Telegram нажми «Запустить».", bad: false });
    if (res.linked) setTelegramUrl(null);
  }
  useEffect(() => { refreshRef.current = refreshTelegram; });

  return (
    <details id="notifications" className={settings.reminders} data-telegram-status={tgEnabled ? "connected" : "disconnected"}>
      <summary className={disclosure.row}>{tgEnabled ? "Напоминания включены" : "Напоминания выключены"}</summary>
      {/* The bot sends the Monday summary too, and the access code on request
          («Не помню код»); the line said only 7, 3 and 1 day (23 Nov). */}
      <p>Telegram получает только то, что касается твоего маршрута: сводку по понедельникам, напоминания за 7, 3 и 1 день до важных дат и код доступа, если ты его забудешь.</p>
      <div>
        {!tgEnabled && !telegramUrl && (
          <button type="button" onClick={() => { void createTgLink(); }} disabled={telegramBusy} className={settings.primaryAction}>
            {telegramBusy ? "Создаю…" : "Подключить Telegram"}
          </button>
        )}
        {!tgEnabled && telegramUrl && (
          <>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className={settings.textAction}
            >
              Открыть Telegram
            </a>
            <a href="/portal?view=settings#notifications" onClick={(event) => { event.preventDefault(); void refreshTelegram(); }} aria-disabled={telegramBusy} className={settings.textAction}>
              {telegramBusy ? "Проверяю…" : "Проверить подключение"}
            </a>
          </>
        )}
        {tgEnabled && (
          <a href="/portal?view=settings#notifications" onClick={(event) => { event.preventDefault(); void disableTg(); }} aria-disabled={telegramBusy} className={settings.textAction}>
            {telegramBusy ? "Сохраняю…" : "Отключить"}
          </a>
        )}
      </div>
      {msg && <p role={msg.bad ? "alert" : "status"} className={settings.message}>{msg.text}</p>}
    </details>
  );
}
