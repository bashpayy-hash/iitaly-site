"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PortalClient } from "@/lib/portalApi";
import styles from "./portal.module.css";

export function HelpSection({
  client,
  onOpenChat,
  onCreateTelegramLink,
  onDisableTelegram,
  onRefreshNotifications,
  onDelete,
}: {
  client: PortalClient;
  onOpenChat: () => void;
  onCreateTelegramLink: () => Promise<{ ok: boolean; url?: string; error?: string }>;
  onDisableTelegram: () => Promise<{ ok: boolean; error?: string }>;
  onRefreshNotifications: () => Promise<{ ok: boolean; linked?: boolean; error?: string }>;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
  const [telegramBusy, setTelegramBusy] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const reminderRef = useRef<HTMLDivElement>(null);
  const tgEnabled = Boolean(client.tgLinked) && client.notify?.telegram !== false;

  useEffect(() => {
    if (window.location.hash === "#notifications") {
      reminderRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, []);

  async function createTgLink() {
    if (telegramBusy) return;
    setTelegramBusy(true);
    setMsg(null);
    setTelegramUrl(null);
    try {
      const res = await onCreateTelegramLink();
      if (!res.ok || !res.url) {
        setMsg({ text: res.error || "Не удалось создать ссылку Telegram.", bad: true });
      } else {
        setTelegramUrl(res.url);
        setMsg({ text: "Ссылка готова на 15 минут. Открой её и нажми «Запустить» в Telegram.", bad: false });
      }
    } catch {
      setMsg({ text: "Нет связи с сервером. Попробуй ещё раз.", bad: true });
    } finally {
      setTelegramBusy(false);
    }
  }

  async function disableTg() {
    if (telegramBusy) return;
    setTelegramBusy(true);
    setMsg(null);
    setTelegramUrl(null);
    try {
      const res = await onDisableTelegram();
      setMsg(res.ok ? { text: "Telegram отключён.", bad: false } : { text: res.error || "Не удалось сохранить.", bad: true });
    } catch {
      setMsg({ text: "Не удалось отключить Telegram. Попробуй ещё раз или отправь боту /stop.", bad: true });
    } finally {
      setTelegramBusy(false);
    }
  }

  async function refreshTelegram() {
    if (telegramBusy) return;
    setTelegramBusy(true);
    setMsg(null);
    try {
      const res = await onRefreshNotifications();
      setMsg(!res.ok
        ? { text: res.error || "Не удалось проверить подключение.", bad: true }
        : res.linked
          ? { text: "Telegram подключён. Напоминания включены.", bad: false }
          : { text: "Подключение пока не подтверждено. Создай новую ссылку и запусти бота.", bad: false });
      if (res.linked) setTelegramUrl(null);
    } catch {
      setMsg({ text: "Нет связи с сервером.", bad: true });
    } finally {
      setTelegramBusy(false);
    }
  }

  return (
    <div>
      <div className={styles.sectionHeading}>
        <div>
          <h2>Напоминания и помощь</h2>
          <p>Настройки, которые уменьшают ручную работу и помогают не терять дедлайны.</p>
        </div>
      </div>

      <div className={styles.helpGrid}>
        <section ref={reminderRef} id="notifications" className={styles.card}>
          <div className={styles.sectionHeading}>
            <div>
              <h3>Telegram</h3>
              <p>{tgEnabled ? "Подключён к кабинету." : "Пока не подключён."}</p>
            </div>
            <span className={styles.statusChip} data-state={tgEnabled ? "ok" : "missing"}>
              {tgEnabled ? "Активен" : "Выключен"}
            </span>
          </div>

          <p className={styles.actionBody}>
            Бот использует дедлайны твоего маршрута: недельная сводка и напоминания за 7, 3 и 1 день.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {!tgEnabled && !telegramUrl && (
              <button type="button" onClick={createTgLink} disabled={telegramBusy} className={styles.primaryButton}>
                {telegramBusy ? "Создаю…" : "Подключить Telegram"}
              </button>
            )}
            {!tgEnabled && telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className={styles.primaryButton}
                style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                Открыть Telegram
              </a>
            )}
            <button type="button" onClick={refreshTelegram} disabled={telegramBusy} className={styles.secondaryButton}>
              {telegramBusy ? "Проверяю…" : "Проверить подключение"}
            </button>
            {tgEnabled && (
              <button type="button" onClick={disableTg} disabled={telegramBusy} className={styles.textLink}>
                Отключить
              </button>
            )}
          </div>

          {msg && (
            <p role="status" className={msg.bad ? styles.taskWarn : styles.taskNote} style={{ marginTop: 12 }}>
              {msg.text}
            </p>
          )}
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeading}>
            <div>
              <h3>Если застрял</h3>
              <p>Не ищи нужную кнопку по всему сайту — спроси прямо из кабинета.</p>
            </div>
          </div>
          <p className={styles.actionBody}>
            ИИ может объяснить текущий шаг и требования. Если нужен человек, можно перейти к отдельной экспертной услуге.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <button type="button" onClick={onOpenChat} className={styles.primaryButton}>Спросить ИИ</button>
            <button type="button" onClick={() => router.push("/prices")} className={styles.secondaryButton}>Помощь эксперта</button>
          </div>
        </section>
      </div>

      <div className={styles.dangerCard}>
        <div className={styles.sectionHeading}>
          <div>
            <h3>Данные кабинета</h3>
            <p>Удаление стирает профиль, прогресс, результаты проверок и Telegram-привязку без восстановления.</p>
          </div>
        </div>
        <button type="button" onClick={onDelete} className={styles.dangerButton}>Удалить мои данные</button>
      </div>
    </div>
  );
}
