"use client";
/* eslint-disable @next/next/no-img-element -- Local scene renditions with explicit dimensions. */

import { useMemo, useState, type ReactNode } from "react";
import type { PortalData } from "@/lib/portalApi";
import { taskBlockedReason, taskTitle } from "@/lib/portalNavigation";
import { portalTaskDone } from "@/lib/portalProgress";
import navigation from "./portal-navigation.module.css";
import settings from "./portal-settings.module.css";
import disclosure from "@/components/ui/disclosure.module.css";

const taskWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? "задача" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "задачи" : "задач";

/* Настройки блоками (owner, 4 Nov: «страницы вроде таких пустых всё ещё
   страшны — добавить тематические генерации с Веспи и преподносить
   информацию блоками, наглядно»): заголовок со сценой, в которой Веспи пишет
   список у будильника (design/illustrations/scenes-2026-11-04.json), ниже
   плитки — данные маршрута, напоминания, список задач, вход, удаление. Все
   действия, id и тексты — прежние. */
export function ProfileSection({
  data,
  onEditProfile,
  onBack,
  onDelete,
  onLogout,
  notifications,
}: {
  data: PortalData;
  onEditProfile: () => void;
  onBack: () => void;
  onDelete: () => void;
  onLogout: () => void;
  notifications: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const profile = data.client.profile || {};
  const remainingTasks = useMemo(() => {
    const rows: string[] = [];
    for (const stage of data.roadmap) {
      for (const task of stage.tasks) {
        if (portalTaskDone(data, task)) continue;
        rows.push("• " + taskTitle(task) + (task.timingLabel ? " — " + taskBlockedReason(task) : task.deadline ? " — Ориентир: " + task.deadline : ""));
      }
    }
    return rows;
  }, [data]);

  async function copyChecklist() {
    const text = [
      "IITALY — мой список задач",
      "",
      ...remainingTasks,
      "",
      "Подробные инструкции к каждому шагу — в личном кабинете.",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const pathLabel = profile.educationPath === "foundation"
    ? "Foundation year"
    : profile.educationPath === "university_kz"
      ? "Год в вузе Казахстана"
      : "Не требуется / не выбран";

  return (
    <div className={settings.page} data-settings-page>
      <a href="/portal" data-settings-back className={settings.textAction} onClick={event => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onBack(); }}>Назад к обзору</a>
      <header className={settings.hero} data-settings-hero>
        <div className={settings.heroCopy}>
          <p className={settings.eyebrow}>Кабинет</p>
          <h2 id="portal-settings-heading" tabIndex={-1} className={`${settings.title} ${navigation.focusTarget}`}>Настройки</h2>
          <p className={settings.lead}>Профиль, напоминания и доступ к кабинету.</p>
        </div>
        <img className={settings.scene} src="/illustrations/scenes/notebook-1024.webp" srcSet="/illustrations/scenes/notebook-640.webp 640w, /illustrations/scenes/notebook-1024.webp 1024w, /illustrations/scenes/notebook-1600.webp 1600w" sizes="(max-width: 900px) 100vw, 520px" width={1024} height={688} alt="" aria-hidden="true" decoding="async" data-settings-scene="notebook" />
      </header>

      <div className={settings.grid}>
        <section className={settings.tile} data-settings-tile="profile" aria-labelledby="settings-profile-title">
          <p className={settings.tileLabel}>Профиль</p>
          <h3 id="settings-profile-title" className={settings.tileTitle}>Данные для маршрута</h3>
          <dl className={settings.profileList}>
            <div><dt>Поступление</dt><dd>сентябрь {data.client.intakeYear || "—"}</dd></div>
            <div><dt>Образование</dt><dd>{profile.education || "Не заполнено"}</dd></div>
            <div><dt>Цель</dt><dd>{profile.goal || "Не заполнено"}</dd></div>
            <div><dt>Бюджет</dt><dd>{profile.budget || "Не заполнено"}</dd></div>
            <div><dt>Путь 12 лет</dt><dd>{pathLabel}</dd></div>
          </dl>
          <a href="/portal?view=settings#profile" className={settings.pill} onClick={(event) => { event.preventDefault(); onEditProfile(); }}>Изменить профиль</a>
        </section>

        <section className={`${settings.tile} ${settings.dark}`} data-settings-tile="reminders">
          <p className={settings.tileLabel}>Напоминания</p>
          <div id="portal-notification-settings" tabIndex={-1} className={`${navigation.notifications} ${navigation.focusTarget}`}>
            {notifications}
          </div>
          <p className={settings.quietOnDark}>Напомню за 7, 3 и 1 день до важных дат маршрута.</p>
        </section>

        <section className={settings.tile} data-settings-tile="checklist" aria-labelledby="settings-checklist-title">
          <p className={settings.tileLabel}>Список задач</p>
          <h3 id="settings-checklist-title" className={settings.tileTitle}><strong className={settings.figure}>{remainingTasks.length}</strong> {taskWord(remainingTasks.length)} впереди</h3>
          <details id="checklist" className={settings.disclosure}>
            <summary className={disclosure.row}>Скопировать с ориентирами</summary>
            <p>Скопируй оставшиеся задачи с ориентирами по срокам, чтобы держать список под рукой.</p>
            {remainingTasks.length ? (
              <a href="/portal?view=settings#checklist" className={settings.textAction} onClick={(event) => { event.preventDefault(); void copyChecklist(); }}>
                {copied ? "Скопировано" : "Скопировать список задач"}
              </a>
            ) : <p className={settings.quiet}>Пока задач нет</p>}
          </details>
        </section>

        <section className={`${settings.tile} ${navigation.session} ${settings.session}`} data-settings-tile="session" aria-labelledby="settings-session-title">
          <div>
            <p className={settings.tileLabel}>Доступ</p>
            <h3 id="settings-session-title" className={settings.tileTitle}>Вход в кабинет</h3>
            <p className={settings.quiet}>Выйди, если это чужое устройство. Твой маршрут сохранится.</p>
          </div>
          <a href="/portal" className={settings.pillOutline} onClick={(event) => { event.preventDefault(); onLogout(); }}>Выйти</a>
        </section>

        <section className={`${settings.tile} ${settings.wide}`} data-settings-tile="delete">
          <details id="delete" className={settings.disclosure}>
            <summary className={disclosure.row}>Удалить данные кабинета</summary>
            <p>Профиль, прогресс, результаты проверок и Telegram-привязка будут удалены без восстановления.</p>
            <a href="/portal?view=settings#delete" className={settings.dangerAction} onClick={(event) => { event.preventDefault(); onDelete(); }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></svg>Удалить мои данные</a>
          </details>
        </section>
      </div>
    </div>
  );
}
