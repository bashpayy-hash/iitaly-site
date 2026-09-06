"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PortalClient } from "@/lib/portalApi";

export function HelpSection({
  client,
  code,
  onOpenChat,
  onSaveEmail,
  onDisableTelegram,
  onDelete,
}: {
  client: PortalClient;
  code: string;
  onOpenChat: () => void;
  onSaveEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  onDisableTelegram: () => Promise<{ ok: boolean; error?: string }>;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(client.email || "");
  const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveEmail() {
    setSaving(true);
    const res = await onSaveEmail(email.trim());
    setSaving(false);
    setMsg(res.ok ? { text: email ? `Будем писать на ${email}` : "Письма отключены", bad: false } : { text: res.error || "Не удалось сохранить", bad: true });
  }

  async function disableTg() {
    const res = await onDisableTelegram();
    setMsg(res.ok ? { text: "Telegram отключён", bad: false } : { text: res.error || "Не удалось сохранить", bad: true });
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

      <div className="rounded-lg border-2 border-ink bg-paper p-4">
        <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">Напоминания о дедлайнах</p>
        <p className="mt-1 text-sm text-ink-soft">
          Еженедельная сводка плюс срочные предупреждения, когда до срока
          меньше недели.
        </p>

        <div className="mt-3 flex items-center gap-3 border-t-2 border-line pt-3">
          <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${client.tgLinked ? "bg-green" : "bg-line"}`} />
          <div className="flex-1">
            <b className="block text-sm">Telegram</b>
            <span className="text-xs text-ink-soft">{client.tgLinked ? "подключён" : "не подключён"}</span>
          </div>
          {client.tgLinked ? (
            <button
              type="button"
              onClick={disableTg}
              className="shrink-0 rounded-pill border-2 border-ink bg-paper px-3 py-1.5 text-xs font-extrabold whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
            >
              Отключить
            </button>
          ) : client.botName ? (
            <a
              href={`https://t.me/${client.botName}?start=${code}`}
              target="_blank"
              rel="noopener"
              className="shrink-0 rounded-pill border-2 border-ink bg-red px-3 py-1.5 text-xs font-extrabold whitespace-nowrap text-cream uppercase"
            >
              Подключить
            </a>
          ) : (
            <span className="shrink-0 text-xs text-ink-soft">бот не настроен</span>
          )}
        </div>

        <div className="mt-3 flex items-start gap-3 border-t-2 border-line pt-3">
          <span aria-hidden className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${client.email ? "bg-green" : "bg-line"}`} />
          <div className="flex-1">
            <b className="block text-sm">Почта</b>
            <span className="text-xs text-ink-soft">{client.email || "не указана"}</span>
            <div className="mt-2 flex gap-2">
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
          <p role="alert" className={`mt-3 text-xs font-bold ${msg.bad ? "text-red" : "text-green"}`}>
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
