"use client";

import { useState } from "react";
import type { PortalData, PortalProfile, PortalResult } from "@/lib/portalApi";
import styles from "./portal.module.css";
import settings from "./portal-settings.module.css";
import { Vespi } from "@/components/mascot/Vespi";

const EDUCATION = [
  { value: "11 классов", title: "11 классов", note: "обычная школа" },
  { value: "НИШ / 12 лет", title: "NIS Grade 12", note: "для IB/A-levels и колледжа сначала уточни маршрут в гайде" },
  { value: "Студент вуза КЗ", title: "Уже учусь в вузе Казахстана", note: "есть закрытый или текущий курс" },
  { value: "Бакалавр", title: "Есть бакалавриат", note: "планирую магистратуру" },
] as const;

const GOAL = [
  { value: "Бакалавриат", title: "Бакалавриат" },
  { value: "Магистратура", title: "Магистратура" },
] as const;

const BUDGET = [
  { value: "Только со стипендией", title: "Без стипендии будет сложно" },
  { value: "До 1 млн ₸/год", title: "До 1 млн ₸ в год" },
  { value: "До 3 млн ₸/год", title: "До 3 млн ₸ в год" },
  { value: "Без ограничений", title: "Бюджет не главное" },
] as const;

const PATHS = [
  {
    value: "university_kz",
    title: "Год в вузе Казахстана",
    note: "Завершить первый курс со всеми нужными экзаменами и согласовать подтверждение с выбранным итальянским вузом.",
  },
  {
    value: "foundation",
    title: "Foundation year",
    note: "До оплаты подтвердить, что выбранный вуз принимает этот Foundation. Курс не гарантирует место и не заменяет аттестат.",
  },
] as const;

export function PortalOnboarding({
  data,
  onSaveProfile,
  onDone,
  onCancel,
  editing = false,
}: {
  data: PortalData;
  onSaveProfile: (payload: {
    education?: string;
    goal?: string;
    budget?: string;
    educationPath?: "university_kz" | "foundation" | null;
    onboardingDone?: boolean;
  }) => Promise<PortalResult>;
  onCreateTelegramLink?: () => Promise<{ ok: boolean; url?: string; error?: string }>;
  onRefreshNotifications?: () => Promise<{ ok: boolean; linked?: boolean; error?: string }>;
  onDone: (next: PortalData) => void;
  onCancel?: () => void;
  editing?: boolean;
}) {
  const [profile, setProfile] = useState<PortalProfile>(data.client.profile || {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needs12 = profile.education === "11 классов" && profile.goal !== "Магистратура";

  async function saveProfile() {
    if (busy) return;
    if (!profile.education || !profile.goal || !profile.budget) {
      setError("Выбери образование, цель и бюджет.");
      return;
    }
    if (needs12 && !profile.educationPath) {
      setError("Выбери путь после 11 классов. Его можно изменить позже.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await onSaveProfile({
        education: profile.education,
        goal: profile.goal,
        budget: profile.budget,
        educationPath: profile.education === "11 классов" ? (profile.educationPath || null) : null,
        onboardingDone: true,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onDone(res.data);
    } catch {
      setError("Не удалось сохранить профиль. Попробуй ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.onboardingPage} data-portal-profile>
      <div className={styles.onboardingShell}>
        {editing && <div className={styles.onboardingTop}>
            <a href="/portal?view=settings" className={settings.textAction} onClick={(event) => { event.preventDefault(); if (busy) return; if (onCancel) onCancel(); else onDone(data); }} aria-disabled={busy}>Вернуться в настройки</a>
        </div>}

        <form className={styles.onboardingCard + " " + settings.profileForm} onSubmit={(event) => { event.preventDefault(); void saveProfile(); }}>
          <div className={styles.onboardingGreeting}>
            <div>
              <h1 className={styles.onboardingTitle}>{editing ? "Измени профиль" : "Расскажи о себе"}</h1>
              {!editing && !needs12 && <p className={settings.formHint}>3 вопроса · 30 секунд</p>}
              <p className={styles.onboardingLead}>Ответы помогут выбрать шаги маршрута. Даты в нём — ориентиры.</p>
            </div>
            {!editing && <Vespi variant="avatar" className={styles.onboardingAvatar} sizes="64px" priority />}
          </div>

          <fieldset className={settings.question} disabled={busy}>
            <legend>Что у тебя с образованием?</legend>
            <div className={styles.optionGrid}>
              {EDUCATION.map((item) => (
                <label key={item.value} className={styles.optionCard + " " + settings.choice} data-selected={profile.education === item.value}>
                  <input type="radio" name="education" value={item.value} checked={profile.education === item.value} onChange={() => setProfile((value) => ({ ...value, education: item.value }))} />
                  <span className={settings.choiceCopy}><strong>{item.title}</strong><span>{item.note}</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={settings.question} disabled={busy}>
            <legend>Куда поступаешь?</legend>
            <div className={styles.optionGridTwo}>
              {GOAL.map((item) => (
                <label key={item.value} className={styles.optionCard + " " + settings.choice} data-selected={profile.goal === item.value}>
                  <input type="radio" name="goal" value={item.value} checked={profile.goal === item.value} onChange={() => setProfile((value) => ({ ...value, goal: item.value }))} />
                  <span className={settings.choiceCopy}><strong>{item.title}</strong></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={settings.question} disabled={busy}>
            <legend>Какой бюджет комфортен семье?</legend>
            <div className={styles.optionGrid}>
              {BUDGET.map((item) => (
                <label key={item.value} className={styles.optionCard + " " + settings.choice} data-selected={profile.budget === item.value}>
                  <input type="radio" name="budget" value={item.value} checked={profile.budget === item.value} onChange={() => setProfile((value) => ({ ...value, budget: item.value }))} />
                  <span className={settings.choiceCopy}><strong>{item.title}</strong></span>
                </label>
              ))}
            </div>
          </fieldset>

          {needs12 && (
            <fieldset className={settings.question} disabled={busy}>
              <legend>Выбери путь после 11 классов</legend>
              <p className={settings.pathNote}>Нужен ещё один академический год. Выбранный путь можно изменить позже.</p>
              <div className={styles.optionGridTwo}>
                {PATHS.map((item) => (
                  <label key={item.value} className={styles.optionCard + " " + settings.choice} data-selected={profile.educationPath === item.value}>
                    <input type="radio" name="educationPath" value={item.value} checked={profile.educationPath === item.value} onChange={() => setProfile((value) => ({ ...value, educationPath: item.value }))} />
                    <span className={settings.choiceCopy}><strong>{item.title}</strong><span>{item.note}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {error && <p role="alert" className={settings.message}>{error}</p>}
          <button type="submit" className={styles.onboardingPrimary} disabled={busy} data-primary-action>{busy ? "Сохраняю…" : editing ? "Сохранить" : "Построить маршрут"}</button>
        </form>
      </div>
    </section>
  );
}
