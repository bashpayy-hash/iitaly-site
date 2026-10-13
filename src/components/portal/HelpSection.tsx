"use client";

import { useState } from "react";
import type { PortalClient } from "@/lib/portalApi";
import styles from "./portal.module.css";
import settings from "./portal-settings.module.css";

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

  return (
    <div>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Напоминания</p>
          <h2>Получай напоминания в Telegram</h2>
          <p>Telegram получает только напоминания по твоему маршруту.</p>
        </div>
      </div>

      <section id="notifications" className={styles.reminderCard} data-telegram-status={tgEnabled ? "connected" : "disconnected"}>
        <div className={styles.reminderState}>
          <span className={styles.reminderDot} data-on={tgEnabled ? "true" : "false"} aria-hidden />
          <div>
            <h3>{tgEnabled ? "Telegram подключён" : "Telegram не подключён"}</h3>
            <p>{tgEnabled ? "Напомним за 7, 3 и 1 день до важных дат." : "Подключение занимает около минуты."}</p>
          </div>
        </div>

        <div className={styles.reminderActions}>
          {!tgEnabled && !telegramUrl && (
            <a href="/portal?view=settings#notifications" onClick={(event) => { event.preventDefault(); void createTgLink(); }} aria-disabled={telegramBusy} className={settings.textAction}>
              {telegramBusy ? "Создаю…" : "Подключить Telegram"}
            </a>
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
      </section>

      <section className={styles.reminderExplainer}>
        <div><strong>7 дней</strong><span>пора начать, если задача ещё не готова</span></div>
        <div><strong>3 дня</strong><span>проверить документы и бронь</span></div>
        <div><strong>1 день</strong><span>последнее напоминание</span></div>
      </section>
    </div>
  );
}
