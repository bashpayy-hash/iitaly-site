"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { PortalData } from "@/lib/portalApi";
import { taskBlockedReason, taskTitle } from "@/lib/portalNavigation";
import styles from "./portal.module.css";
import navigation from "./portal-navigation.module.css";
import settings from "./portal-settings.module.css";

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
        if (data.done[task.id]) continue;
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
    <div className={settings.page}>
      <a href="/portal" data-settings-back className={settings.textAction} onClick={event => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onBack(); }}>Назад к обзору</a>
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="portal-settings-heading" tabIndex={-1} className={navigation.focusTarget}>Настройки</h2>
          <p>Профиль, напоминания и доступ к кабинету.</p>
        </div>
      </div>

        <section className={settings.profile}>
          <div className={settings.profileHeading}>
            <h3 className={styles.profileCardTitle}>Данные для маршрута</h3>
            <a href="/portal?view=settings#profile" className={settings.textAction} onClick={(event) => { event.preventDefault(); onEditProfile(); }}>Изменить профиль</a>
          </div>
          <dl className={`${styles.profileList} ${settings.profileList}`}>
            <div><dt>Поступление</dt><dd>сентябрь {data.client.intakeYear || "—"}</dd></div>
            <div><dt>Образование</dt><dd>{profile.education || "Не заполнено"}</dd></div>
            <div><dt>Цель</dt><dd>{profile.goal || "Не заполнено"}</dd></div>
            <div><dt>Бюджет</dt><dd>{profile.budget || "Не заполнено"}</dd></div>
            <div><dt>Путь 12 лет</dt><dd>{pathLabel}</dd></div>
          </dl>
        </section>

        <details id="checklist" className={settings.disclosure}>
          <summary>Список задач</summary>
          <p>
            Скопируй оставшиеся задачи с ориентирами по срокам, чтобы держать список под рукой.
          </p>
          {remainingTasks.length ? (
            <a href="/portal?view=settings#checklist" className={settings.textAction} onClick={(event) => { event.preventDefault(); void copyChecklist(); }}>
              {copied ? "Скопировано" : "Скопировать список задач"}
            </a>
          ) : <p className={styles.taskNote}>Пока задач нет</p>}
        </details>

      <div id="portal-notification-settings" tabIndex={-1} className={`${navigation.notifications} ${navigation.focusTarget}`}>
        {notifications}
      </div>

      <section className={`${navigation.session} ${settings.session}`}>
        <div>
          <h3 className={styles.profileCardTitle}>Вход в кабинет</h3>
          <p>Выйди, если это чужое устройство. Твой маршрут сохранится.</p>
        </div>
        <a href="/portal" className={settings.textAction} onClick={(event) => { event.preventDefault(); onLogout(); }}>Выйти</a>
      </section>

      <details id="delete" className={settings.disclosure}>
          <summary>Удалить данные кабинета</summary>
          <p>Профиль, прогресс, результаты проверок и Telegram-привязка будут удалены без восстановления.</p>
        <a href="/portal?view=settings#delete" className={settings.dangerAction} onClick={(event) => { event.preventDefault(); onDelete(); }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></svg>Удалить мои данные</a>
      </details>
    </div>
  );
}
