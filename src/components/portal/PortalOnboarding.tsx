"use client";

import { useMemo, useState } from "react";
import type { PortalData, PortalProfile, PortalResult } from "@/lib/portalApi";
import styles from "./portal.module.css";

const EDUCATION = [
  { value: "11 классов", title: "11 классов", note: "обычная школа" },
  { value: "НИШ / 12 лет", title: "12 лет обучения", note: "НИШ, БИЛ или международная программа" },
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

function needsTwelveYears(profile: PortalProfile) {
  return !(profile.education === "НИШ / 12 лет" || profile.education === "Бакалавр" || profile.goal === "Магистратура");
}

export function PortalOnboarding({
  data,
  onSaveProfile,
  onCreateTelegramLink,
  onRefreshNotifications,
  onDone,
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
  onCreateTelegramLink: () => Promise<{ ok: boolean; url?: string; error?: string }>;
  onRefreshNotifications: () => Promise<{ ok: boolean; linked?: boolean; error?: string }>;
  onDone: (next: PortalData) => void;
  editing?: boolean;
}) {
  const current = data.client.profile || {};
  const [profile, setProfile] = useState<PortalProfile>(current);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [telegramLinked, setTelegramLinked] = useState(Boolean(data.client.tgLinked));

  const needs12 = useMemo(() => needsTwelveYears(profile), [profile]);
  const totalSteps = needs12 ? 3 : 2;
  const visualStep = step === 0 ? 1 : needs12 && step === 1 ? 2 : totalSteps;

  async function saveBase() {
    if (!profile.education || !profile.goal || !profile.budget) {
      setError("Ответь на три вопроса — они нужны, чтобы убрать лишние шаги.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await onSaveProfile({
      education: profile.education,
      goal: profile.goal,
      budget: profile.budget,
      educationPath: profile.education === "11 классов" ? (profile.educationPath || null) : null,
      onboardingDone: false,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setProfile(res.data.client.profile || profile);
    setStep(needsTwelveYears(res.data.client.profile || profile) ? 1 : 2);
  }

  async function savePath(path: "university_kz" | "foundation") {
    setBusy(true);
    setError(null);
    const res = await onSaveProfile({ educationPath: path, onboardingDone: false });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setProfile(res.data.client.profile || { ...profile, educationPath: path });
    setStep(2);
  }

  async function connectTelegram() {
    setBusy(true);
    setError(null);
    const res = await onCreateTelegramLink();
    setBusy(false);
    if (!res.ok || !res.url) {
      setError(res.error || "Не удалось создать ссылку Telegram.");
      return;
    }
    setTelegramUrl(res.url);
    window.open(res.url, "_blank", "noopener,noreferrer");
  }

  async function checkTelegram() {
    setBusy(true);
    setError(null);
    const res = await onRefreshNotifications();
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "Не удалось проверить Telegram.");
      return;
    }
    setTelegramLinked(Boolean(res.linked));
    if (!res.linked) setError("Бот пока не подключён. Открой ссылку и нажми «Запустить», затем проверь ещё раз.");
  }

  async function finish() {
    setBusy(true);
    setError(null);
    const res = await onSaveProfile({ onboardingDone: true });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onDone(res.data);
  }

  return (
    <section className={styles.onboardingPage}>
      <div className={styles.onboardingShell}>
        <div className={styles.onboardingTop}>
          <a href="/" className={styles.portalBrand}>IITALY</a>
          <span>Настройка маршрута · шаг {visualStep} из {totalSteps}</span>
        </div>
        <div className={styles.onboardingProgress} aria-hidden>
          <span style={{ width: `${(visualStep / totalSteps) * 100}%` }} />
        </div>

        {step === 0 && (
          <div className={styles.onboardingCard}>
            <p className={styles.kicker}>{editing ? "Профиль" : "Начнём с трёх вещей"}</p>
            <h1 className={styles.onboardingTitle}>Чтобы маршрут был твоим, а не общим чек-листом.</h1>
            <p className={styles.onboardingLead}>
              Эти ответы меняют этапы и порядок задач. Конкретные даты появятся только после настройки.
            </p>

            <div className={styles.questionBlock}>
              <h2>Что у тебя с образованием?</h2>
              <div className={styles.optionGrid}>
                {EDUCATION.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={styles.optionCard}
                    data-selected={profile.education === item.value}
                    onClick={() => setProfile((p) => ({ ...p, education: item.value }))}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.note}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.questionBlock}>
              <h2>Куда поступаешь?</h2>
              <div className={styles.optionGridTwo}>
                {GOAL.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={styles.optionCard}
                    data-selected={profile.goal === item.value}
                    onClick={() => setProfile((p) => ({ ...p, goal: item.value }))}
                  >
                    <strong>{item.title}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.questionBlock}>
              <h2>Какой бюджет комфортен семье?</h2>
              <div className={styles.optionGrid}>
                {BUDGET.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={styles.optionCard}
                    data-selected={profile.budget === item.value}
                    onClick={() => setProfile((p) => ({ ...p, budget: item.value }))}
                  >
                    <strong>{item.title}</strong>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className={styles.onboardingError}>{error}</p>}
            <button type="button" className={styles.onboardingPrimary} onClick={saveBase} disabled={busy}>
              {busy ? "Сохраняю…" : editing ? "Сохранить профиль" : "Продолжить"}
            </button>
          </div>
        )}

        {step === 1 && needs12 && (
          <div className={styles.onboardingCard}>
            <p className={styles.kicker}>Важная развилка</p>
            <h1 className={styles.onboardingTitle}>После 11 классов нужен ещё один академический год.</h1>
            <p className={styles.onboardingLead}>
              Выбери путь сейчас — от него зависит твой маршрут. Это не окончательное решение: позже его можно изменить в профиле.
            </p>

            <div className={styles.pathChoices}>
              <button type="button" className={styles.pathChoice} onClick={() => savePath("university_kz")} disabled={busy}>
                <span className={styles.pathChoiceEyebrow}>Вариант 1</span>
                <strong>Год в вузе Казахстана</strong>
                <p>Поступить в местный вуз, закрыть первый курс и использовать его как 12-й год образования.</p>
                <small>Обычно дешевле · примерно 1 учебный год</small>
              </button>
              <button type="button" className={styles.pathChoice} onClick={() => savePath("foundation")} disabled={busy}>
                <span className={styles.pathChoiceEyebrow}>Вариант 2</span>
                <strong>Foundation year</strong>
                <p>Пройти подготовительный год, который признаётся как дополнительный академический год.</p>
                <small>Нужно выбирать программу заранее · примерно 1 учебный год</small>
              </button>
            </div>
            {error && <p className={styles.onboardingError}>{error}</p>}
            <button type="button" className={styles.onboardingBack} onClick={() => setStep(0)}>← Назад</button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.onboardingCard}>
            <p className={styles.kicker}>Последнее</p>
            <h1 className={styles.onboardingTitle}>Пусть дедлайны приходят туда, где ты их увидишь.</h1>
            <p className={styles.onboardingLead}>
              Telegram напомнит за 7, 3 и 1 день. Его можно подключить сейчас или позже в кабинете.
            </p>

            <div className={styles.telegramOnboarding} data-linked={telegramLinked}>
              <div>
                <strong>{telegramLinked ? "Telegram подключён" : "Подключить Telegram"}</strong>
                <p>{telegramLinked ? "Готово — напоминания включены." : "Ссылка действует 15 минут и не содержит код кабинета."}</p>
              </div>
              {!telegramLinked && (
                <div className={styles.telegramOnboardingActions}>
                  <button type="button" className={styles.onboardingPrimarySmall} onClick={connectTelegram} disabled={busy}>
                    {telegramUrl ? "Открыть новую ссылку" : "Подключить"}
                  </button>
                  {telegramUrl && (
                    <button type="button" className={styles.onboardingSecondarySmall} onClick={checkTelegram} disabled={busy}>
                      Я запустил бота
                    </button>
                  )}
                </div>
              )}
            </div>

            {error && <p className={styles.onboardingError}>{error}</p>}
            <button type="button" className={styles.onboardingPrimary} onClick={finish} disabled={busy}>
              {busy ? "Сохраняю…" : telegramLinked ? "Открыть мой маршрут" : "Продолжить без Telegram"}
            </button>
            <button type="button" className={styles.onboardingBack} onClick={() => setStep(needs12 ? 1 : 0)}>← Назад</button>
          </div>
        )}
      </div>
    </section>
  );
}
