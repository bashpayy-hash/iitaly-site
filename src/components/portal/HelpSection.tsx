"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PortalClient } from "@/lib/portalApi";

export function HelpSection({
  client,
  code,
  onOpenChat,
  onSaveEmail,
  onDisableTelegram,
  onRefreshNotifications,
  onDelete,
}: {
  client: PortalClient;
  code: string;
  onOpenChat: () => void;
  onSaveEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  onDisableTelegram: () => Promise<{ ok: boolean; error?: string }>;
  onRefreshNotifications: () => Promise<{ ok: boolean; linked?: boolean; error?: string }>;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(client.email || "");
  const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [telegramBusy, setTelegramBusy] = useState(false);
  const reminderRef = useRef<HTMLDivElement>(null);
  const tgEnabled = Boolean(client.tgLinked) && client.notify?.telegram !== false;
  const botName = (client.botName || "").replace(/^@/, "").trim();
  const telegramUrl = /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(botName) && /^[A-Z0-9-]{4,12}$/i.test(code)
    ? `https://t.me/${botName}?start=${encodeURIComponent(code)}`
    : null;

  useEffect(() => {
    if (window.location.hash === "#notifications") {
      reminderRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, []);

  async function saveEmail() {
    setSaving(true);
    const res = await onSaveEmail(email.trim());
    setSaving(false);
    setMsg(res.ok ? { text: email ? `Будем писать на ${email}` : "Письма отключены", bad: false } : { text: res.error || "Не удалось сохранить", bad: true });
  }

  async function disableTg() {
    if (telegramBusy) return;
    setTelegramBusy(true);
    setMsg(null);
    try {
      const res = await onDisableTelegram();
      setMsg(res.ok ? { text: "Telegram отключён", bad: false } : { text: res.error || "Не удалось сохранить", bad: true });
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
        ? { text: res.error || "Не удалось проверить подключение. Попробуй ещё раз.", bad: true }
        : res.linked
          ? { text: "Подключение Telegram подтверждено. Проверь, что бот ответил в чате, и разреши уведомления на телефоне.", bad: false }
          : { text: "Подключение пока не подтверждено. Открой бота по кнопке ниже, нажми «Запустить» и проверь снова.", bad: false });
    } catch {
      setMsg({ text: "Нет связи с сервером. Подключение не подтверждено.", bad: true });
    } finally {
      setTelegramBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-ink bg-paper p-4">
        <b className="text-sm">Не понимаешь шаг?</b>
        <p className="mt-1 text-sm text-ink-soft">
          Спроси ИИ — он знает твой маршрут и правила. Сложный случай можно
          разобрать с экспертом отдельной опцией.
        </p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onOpenChat}
            className="rounded-pill border-2 border-ink bg-red px-4 py-2 text-xs font-extrabold text-cream uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Спросить ИИ
          </button>
          <button
            type="button"
            onClick={() => router.push("/prices")}
            className="rounded-pill border-2 border-ink bg-paper px-4 py-2 text-xs font-extrabold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
          >
            Помощь эксперта
          </button>
        </div>
      </div>

      <div ref={reminderRef} id="notifications" className="scroll-mt-36 rounded-lg border border-line bg-paper p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Напоминания на телефоне</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Telegram-бот использует дедлайны сохранённого маршрута: сводка по
          понедельникам и напоминания за 7, 3 и 1 день до срока.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Это сообщения в Telegram, не SMS. Номер телефона вводить не нужно.
          Для уведомлений на экране разреши их в настройках Telegram и телефона.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${tgEnabled ? "bg-green" : "bg-line"}`} />
          <div className="min-w-0 flex-1" role="status" aria-live="polite" data-telegram-status={tgEnabled ? "connected" : "disconnected"}>
            <b className="block text-sm">Telegram</b>
            <span className="text-xs text-ink-soft">{tgEnabled ? "подключён к кабинету" : "не подключён"}</span>
          </div>
          {tgEnabled && (
            <button type="button" onClick={disableTg} disabled={telegramBusy}
              className="min-h-11 rounded-pill border border-line bg-paper px-4 py-2 text-sm font-medium text-ink disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red">
              Отключить Telegram
            </button>
          )}
        </div>

        {!tgEnabled && telegramUrl && (
          <div className="mt-4 space-y-3 text-sm text-ink-soft">
            <p>1. Открой бота по кнопке — ссылка уже связана с твоим кабинетом.</p>
            <p>2. В Telegram нажми «Запустить» и дождись ответа бота. Так ты включишь напоминания.</p>
            <p>3. Вернись сюда и нажми «Проверить подключение».</p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {!tgEnabled && telegramUrl && (
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-red px-4 py-2 text-sm font-medium text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              Подключить Telegram
            </a>
          )}
          {(telegramUrl || tgEnabled) && (
            <button type="button" onClick={refreshTelegram} disabled={telegramBusy}
              className="min-h-11 rounded-pill border border-line bg-paper px-4 py-2 text-sm font-medium text-ink disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red">
              {telegramBusy ? "Проверяю…" : "Проверить подключение"}
            </button>
          )}
        </div>
        {!telegramUrl && !tgEnabled && (
          <p className="mt-3 text-sm text-ink-soft" role="status">
            Подключение Telegram пока недоступно: бот не настроен на сервере.
          </p>
        )}
        <p className="mt-4 text-xs text-ink-soft">
          Отключить напоминания можно здесь или командой /stop в чате с ботом.
          Не пересылай персональную ссылку подключения другим людям.
        </p>

        <div className="mt-5 flex items-start gap-3 border-t border-line pt-4">
          <span aria-hidden className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${client.email ? "bg-green" : "bg-line"}`} />
          <div className="min-w-0 flex-1">
            <b className="block text-sm">Почта</b>
            <span className="break-all text-xs text-ink-soft">{client.email || "не указана"}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mail.com"
                aria-label="Почта для уведомлений"
                className="min-w-0 flex-1 rounded-md border-2 border-ink bg-cream px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
              />
              <button
                type="button"
                onClick={saveEmail}
                disabled={saving}
                className="shrink-0 rounded-pill border-2 border-ink bg-paper px-3 py-1.5 text-xs font-extrabold whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>

        {msg && (
          <p role="alert" className={`mt-3 text-sm ${msg.bad ? "text-red" : "text-ink-soft"}`}>
            {msg.text}
          </p>
        )}
      </div>

      <div className="rounded-lg border-2 border-red bg-red/5 p-4">
        <b className="text-sm text-red">Удалить мои данные</b>
        <p className="mt-1 text-sm text-ink-soft">
          Сотрём профиль, прогресс и результаты проверок. Отменить нельзя,
          доступ в кабинет пропадёт.
        </p>
        <button
          type="button"
          onClick={onDelete}
          className="mt-3 rounded-pill border-2 border-red bg-paper px-4 py-2 text-xs font-extrabold text-red uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
        >
          Удалить данные
        </button>
      </div>
    </div>
  );
}
