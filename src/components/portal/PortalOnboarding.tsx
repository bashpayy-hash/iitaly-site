"use client";

import { useState } from "react";
import type { PortalData, PortalProfile, PortalResult } from "@/lib/portalApi";
import styles from "./portal.module.css";
import settings from "./portal-settings.module.css";
import { VespiPose } from "@/components/mascot/VespiPose";
import { usePlanDraft } from "@/lib/usePlanDraft";

/* Owner, 23 Nov 2026: «если когда человек в вопросе первоначально нажимает
   на магистратуру, ты должен понять, что это уже магистратура… не должны
   быть такие детского формата вопросы, это уже серьезный человек, который
   закончил или заканчивает бакалавр». The form asked about school first
   («11 классов», «NIS Grade 12»), then the level, then «Какой бюджет
   комфортен семье?». The level is now the first question and the other two
   are worded for it: a master's applicant is asked about her diploma and her
   own budget, and never about a path after 11 classes. The values sent are
   the same ones the server keeps. */
const GOAL = [
  { value: "Бакалавриат", title: "Бакалавриат", note: "после школы или колледжа" },
  { value: "Магистратура", title: "Магистратура", note: "диплом бакалавра есть или скоро будет" },
] as const;

type Choice = { value: string; title: string; note?: string };
const TRACKS: Record<"bachelor" | "master", { education: { legend: string; options: Choice[] }; budget: { legend: string; options: Choice[] } }> = {
  bachelor: {
    education: { legend: "Что у тебя с образованием?", options: [
      { value: "11 классов", title: "11 классов", note: "обычная школа" },
      { value: "НИШ / 12 лет", title: "NIS Grade 12", note: "для IB/A-levels и колледжа сначала уточни маршрут в гайде" },
      { value: "Студент вуза КЗ", title: "Уже учусь в вузе Казахстана", note: "есть закрытый или текущий курс" },
      { value: "Бакалавр", title: "Уже есть диплом вуза", note: "иду на второй бакалавриат" },
    ] },
    budget: { legend: "Какой бюджет комфортен семье?", options: [
      { value: "Только со стипендией", title: "Без стипендии будет сложно" },
      { value: "До 1 млн ₸/год", title: "До 1 млн ₸ в год" },
      { value: "До 3 млн ₸/год", title: "До 3 млн ₸ в год" },
      { value: "Без ограничений", title: "Бюджет не главное" },
    ] },
  },
  master: {
    education: { legend: "Диплом бакалавра уже получен?", options: [
      { value: "Бакалавр", title: "Да, диплом на руках", note: "бакалавр или специалист" },
      { value: "Студент вуза КЗ", title: "Пока нет, заканчиваю учёбу", note: "диплом будет до начала магистратуры" },
    ] },
    budget: { legend: "Какой бюджет на год учёбы и жизни?", options: [
      { value: "Только со стипендией", title: "Рассчитываю на стипендию" },
      { value: "До 1 млн ₸/год", title: "До 1 млн ₸ в год" },
      { value: "До 3 млн ₸/год", title: "До 3 млн ₸ в год" },
      { value: "Без ограничений", title: "Бюджет не ограничивает выбор" },
    ] },
  },
};

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

/* The same request: «…перенаправлять его автоматически на магистрский трек. И
   все данные потом через код ты и пополни». Someone who answered the
   questionnaire on the site before buying is not asked from zero: an empty
   profile opens with the answers this device already holds, in the server's
   values, under a line that says where they came from. Nothing is saved
   until «Построить маршрут». The questionnaire's «IB / A-levels» and
   «Колледж» have no profile value, so that question stays open. */
const ANSWER_EDUCATION: Record<string, string> = { "11 классов": "11 классов", "NIS Grade 12": "НИШ / 12 лет", "Студент вуза КЗ": "Студент вуза КЗ", "Бакалавр": "Бакалавр" };
function profileFromAnswers(answers: Record<string, string>): PortalProfile {
  const goal = GOAL.find(item => item.value === answers.goal)?.value;
  if (!goal) return {};
  const track = TRACKS[goal === "Магистратура" ? "master" : "bachelor"];
  const education = ANSWER_EDUCATION[answers.education];
  return {
    goal,
    education: track.education.options.some(item => item.value === education) ? education : undefined,
    budget: track.budget.options.find(item => item.value === answers.budget)?.value,
  };
}

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
  const [draft] = usePlanDraft();
  // Read once, when the form opens: later taps are the applicant's own.
  const [fromAnswers] = useState<PortalProfile>(() => {
    const saved = data.client.profile || {};
    return editing || saved.goal || saved.education || saved.budget ? {} : profileFromAnswers(draft.answers);
  });
  const [profile, setProfile] = useState<PortalProfile>(() => ({ ...fromAnswers, ...(data.client.profile || {}) }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const master = profile.goal === "Магистратура";
  const track = profile.goal ? TRACKS[master ? "master" : "bachelor"] : null;
  // An answer given for the other level (a school in a master's profile) does
  // not count: its question is asked again in this level's words.
  const education = track?.education.options.some(item => item.value === profile.education) ? profile.education : undefined;
  const needs12 = education === "11 классов" && !master;

  async function saveProfile() {
    if (busy) return;
    if (!profile.goal) {
      setError("Выбери уровень: бакалавриат или магистратура.");
      return;
    }
    if (!education || !profile.budget) {
      setError(master ? "Ответь про диплом и бюджет." : "Выбери образование и бюджет.");
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
        education,
        goal: profile.goal,
        budget: profile.budget,
        educationPath: needs12 ? (profile.educationPath || null) : null,
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
              {fromAnswers.goal && <p className={settings.formHint} data-profile-prefilled>Отметили ответы из твоей анкеты на сайте. Проверь их и поправь, если что-то изменилось.</p>}
            </div>
            {!editing && <span className={styles.onboardingVespi} data-vespi-scene="thinking" aria-hidden="true"><VespiPose pose="thinking" priority sizes="(max-width: 480px) 88px, 132px" /></span>}
          </div>

          <fieldset className={settings.question} disabled={busy} data-profile-question="goal">
            <legend>Куда поступаешь?</legend>
            <div className={styles.optionGridTwo}>
              {GOAL.map((item) => (
                <label key={item.value} className={styles.optionCard + " " + settings.choice} data-selected={profile.goal === item.value}>
                  <input type="radio" name="goal" value={item.value} checked={profile.goal === item.value} onChange={() => setProfile((value) => ({ ...value, goal: item.value }))} />
                  <span className={settings.choiceCopy}><strong>{item.title}</strong><span>{item.note}</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* The two questions of the chosen level; before the first tap the
              form does not guess whom it is talking to. */}
          {track && <>
          <fieldset className={settings.question} disabled={busy} data-profile-question="education" data-profile-track={master ? "master" : "bachelor"}>
            <legend>{track.education.legend}</legend>
            <div className={master ? styles.optionGridTwo : styles.optionGrid}>
              {track.education.options.map((item) => (
                <label key={item.value} className={styles.optionCard + " " + settings.choice} data-selected={education === item.value}>
                  <input type="radio" name="education" value={item.value} checked={education === item.value} onChange={() => setProfile((value) => ({ ...value, education: item.value }))} />
                  <span className={settings.choiceCopy}><strong>{item.title}</strong><span>{item.note}</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={settings.question} disabled={busy} data-profile-question="budget">
            <legend>{track.budget.legend}</legend>
            <div className={styles.optionGrid}>
              {track.budget.options.map((item) => (
                <label key={item.value} className={styles.optionCard + " " + settings.choice} data-selected={profile.budget === item.value}>
                  <input type="radio" name="budget" value={item.value} checked={profile.budget === item.value} onChange={() => setProfile((value) => ({ ...value, budget: item.value }))} />
                  <span className={settings.choiceCopy}><strong>{item.title}</strong></span>
                </label>
              ))}
            </div>
          </fieldset>
          </>}

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
