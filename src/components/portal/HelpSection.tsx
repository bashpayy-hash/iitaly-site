"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PortalClient } from "@/lib/portalApi";

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
        setMsg({ text: "Безопасная ссылка готова на 15 минут. Открой её и нажми «Запустить» в Telegram.", bad: false });
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
          ? { text: "Подключение Telegram подтверждено. Напоминания включены.", bad: false }
          : { text: "Подключение пока не подтверждено. Создай новую ссылку, открой бота и нажми «Запустить».", bad: false });
      if (res.linked) setTelegramUrl(null);
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
          понедельникам и отдельные напоминания за 7, 3 и 1 день.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Номер телефона не нужен. Ссылка подключения одноразовая, действует
          15 минут и не содержит код доступа к кабинету.
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

        {!tgEnabled && (
          <div className="mt-4 space-y-3 text-sm text-ink-soft">
            <p>1. Создай безопасную ссылку подключения.</p>
            <p>2. Открой её в Telegram и нажми «Запустить».</p>
            <p>3. Вернись сюда и проверь подключение.</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {!tgEnabled && !telegramUrl && (
            <button type="button" onClick={createTgLink} disabled={telegramBusy}
              className="min-h-11 rounded-pill bg-red px-4 py-2 text-sm font-medium text-cream disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              {telegramBusy ? "Создаю…" : "Подключить Telegram"}
            </button>
          )}
          {!tgEnabled && telegramUrl && (
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-red px-4 py-2 text-sm font-medium text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              Открыть Telegram
            </a>
          )}
          <button type="button" onClick={refreshTelegram} disabled={telegramBusy}
            className="min-h-11 rounded-pill border border-line bg-paper px-4 py-2 text-sm font-medium text-ink disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red">
            {telegramBusy ? "Проверяю…" : "Проверить подключение"}
          </button>
          {!tgEnabled && telegramUrl && (
            <button type="button" onClick={createTgLink} disabled={telegramBusy}
              className="min-h-11 px-2 py-2 text-sm font-medium text-ink-soft underline underline-offset-4 disabled:opacity-50">
              Создать новую ссылку
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-ink-soft">
          Отключить напоминания можно здесь или командой /stop в чате с ботом.
          Старые и уже использованные ссылки повторно не работают.
        </p>

        {msg && (
          <p role="alert" className={`mt-3 text-sm ${msg.bad ? "text-red" : "text-ink-soft"}`}>
            {msg.text}
          </p>
        )}
      </div>

      <div className="rounded-lg border-2 border-red bg-red/5 p-4">
        <b className="text-sm text-red">Удалить мои данные</b>
        <p className="mt-1 text-sm text-ink-soft">
          Сотрём профиль, прогресс, результаты проверок и Telegram-привязку.
          Отменить нельзя, доступ в кабинет пропадёт.
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
