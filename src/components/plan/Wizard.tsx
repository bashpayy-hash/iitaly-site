"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WIZ, type WizAnswers } from "@/data/wizard";
import { track } from "@/lib/track";
import { isValidPhone, submitLead } from "@/lib/lead";
import { buildPlan } from "@/lib/planBuilder";
import { AppleButton } from "@/components/apple/Button";
import { VespiAssistant } from "@/components/mascot/VespiAssistant";
import type { PlanDraft } from "@/lib/usePlanDraft";

/** UI explanations only: the questions, answer values and plan builder stay
 * unchanged. Grades describe the profile; they are not an admissions score. */
const QUESTION_CONTEXT: Record<string, string> = {
  intake: "Так я не смешаю правила разных наборов.",
  education: "Допуск всё равно подтвердит выбранный вуз.",
  grades: "Это ориентир для твоего профиля, не прогноз поступления.",
  goal: "У бакалавриата и магистратуры разные требования к диплому. Начнём с нужного уровня.",
  budget: "Стипендию и средства на визу нужно проверять отдельно.",
  field: "От направления зависят тесты и условия конкурса. Точные требования проверим у программы.",
  lang: "От ответа зависит, что делать дальше: подтвердить язык или подготовиться к тесту.",
  age: "Если тебе ещё нет 18, в маршрут нужны отдельные шаги для родителей, жилья и документов.",
  residence: "Используем процедуру для твоего места проживания.",
  dsuRegion: "Требования к справкам проверяем по конкретному конкурсу.",
};

/** Русское склонение счётного существительного по числу (5 → форма "много" и т.п.). */
function ruPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function Wizard({ draft, onDraftChange, onDone }: { draft: PlanDraft; onDraftChange: (draft: PlanDraft) => void; onDone: (answers: WizAnswers) => void }) {
  const { step, answers } = draft;
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);
  const previewTracked = useRef(false);
  const stepChanged = useRef(false);

  const finished = step >= WIZ.length;
  const progress = finished ? 1 : step / WIZ.length;

  useEffect(() => {
    if (!stepChanged.current) return;
    liveRef.current?.focus({ preventScroll: true });
    liveRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    stepChanged.current = false;
  }, [step]);

  // Реальный превью того же движка, что строит финальный план (buildPlan) —
  // не отдельная выдуманная "заглушка ради демо-эффекта". Показываем его
  // ДО запроса номера, чтобы у пользователя уже было что-то ценное на руках,
  // прежде чем решать, оставлять контакт или нет.
  const preview = useMemo(
    () => (finished ? buildPlan(answers) : null),
    [finished, answers],
  );

  useEffect(() => {
    if (finished && !previewTracked.current) {
      previewTracked.current = true;
      track("plan_preview_viewed");
    }
  }, [finished]);

  function choose(id: string, value: string) {
    stepChanged.current = true;
    if (step === 0) track("plan_started");
    onDraftChange({ answers: { ...answers, [id]: value }, step: step + 1, complete: false });
    track("wiz_step", { s: id });
    track("plan_step_completed", { step: step, of: WIZ.length });
  }

  async function finish(withPhone: boolean) {
    if (sending) return;
    if (withPhone) {
      if (!isValidPhone(phone)) {
        setPhoneError("Проверь номер телефона.");
        return;
      }
      setSending(true);
      setPhoneError(null);
      const result = await submitLead({
        phone: phone.trim(),
        education: answers.education || "—",
        goal: answers.goal || "—",
        budget: answers.budget || "—",
      });
      setSending(false);
      if (!result.ok) {
        setPhoneError("Не удалось отправить номер. Попробуй ещё раз или нажми «Открыть мой план» — он уже готов.");
        return;
      }
      track("lead_captured", { from: "wizard" });
      track("lead_submitted", { from: "wizard" });
    }
    track("plan_completed", { withPhone });
    onDone(answers);
  }

  return (
    <div className="rounded-apple-card border border-white/15 bg-white p-5 sm:p-7" data-plan-wizard>
      <div className="flex items-center gap-3">
        <div role="progressbar" aria-label="Готовность плана" aria-valuemin={0} aria-valuemax={WIZ.length} aria-valuenow={Math.min(step, WIZ.length)} aria-valuetext={finished ? "Все вопросы пройдены" : `Вопрос ${step + 1} из ${WIZ.length}`} className="h-1 flex-1 overflow-hidden rounded-apple-pill bg-pebble">
          <div
            className="h-full origin-left rounded-apple-pill bg-crimson transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <span className="shrink-0 text-apple-caption text-cloud-meta">
          {finished ? "Готово" : `${Math.min(step + 1, WIZ.length)} из ${WIZ.length}`}
        </span>
      </div>

      <div ref={liveRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className="mt-6 rounded-apple-card">
        {finished ? (
          <>
            {preview && (
              <div className="mb-6 rounded-apple-card border border-white/15 bg-frost p-4">
                <p className="text-apple-caption font-semibold text-crimson uppercase">
                  Уже готово по твоим ответам
                </p>
                <p className="mt-2 text-apple-body-sm font-semibold text-cloud-white">{preview.steps[0]?.t}</p>
                <p className="mt-1 text-apple-body-sm text-cloud-body">{preview.steps[0]?.p}</p>
                <p className="mt-2 text-apple-caption text-cloud-meta">
                  {(() => {
                    const stepsLeft = Math.max(preview.steps.length - 1, 0);
                    const docsCount = preview.docs.length;
                    return (
                      <>
                        Ещё {stepsLeft} {ruPlural(stepsLeft, "шаг", "шага", "шагов")} и{" "}
                        {docsCount} {ruPlural(docsCount, "документ", "документа", "документов")} в
                        чек-листе — дальше на этой странице.
                      </>
                    );
                  })()}
                </p>
              </div>
            )}
            <AppleButton type="button" variant="filled" onClick={() => finish(false)} disabled={sending} className="w-full">Открыть мой план</AppleButton>
            <p className="mt-2 text-center text-apple-caption text-cloud-meta">Номер телефона не нужен.</p>
            <details className="mt-5 border-t border-white/15 pt-2">
            <summary className="min-h-11 cursor-pointer py-3 text-apple-body-sm text-cloud-body">Оставить номер для связи</summary>
            <label className="mt-4 block">
              <span className="mb-2 block text-apple-body-sm font-medium text-cloud-white">Номер телефона для WhatsApp</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                disabled={sending}
                aria-invalid={(phoneError && !isValidPhone(phone)) ? true : undefined}
                aria-describedby={phoneError ? "plan-phone-error" : undefined}
                placeholder="+7 ___ ___ __ __"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(null);
                }}
                className="w-full rounded-apple-card border border-white/20 bg-frost px-4 py-3 text-base text-cloud-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
              />
            </label>
            {phoneError && (
              <p id="plan-phone-error" role="alert" className="mt-1.5 text-apple-caption text-crimson">
                {phoneError}
              </p>
            )}
            <AppleButton
              type="button"
              variant="outlined"
              onClick={() => finish(true)}
              disabled={sending}
              className="mt-3 w-full"
            >
              {sending ? "Отправляю…" : "Отправить номер"}
            </AppleButton>
            <p className="mt-4 text-apple-caption text-cloud-meta">
              Оставляя номер, ты соглашаешься, что мы напишем по поводу
              поступления. Рассылок и передачи третьим лицам не будет,
              отписаться можно в любой момент.{" "}
              <a href="/privacy" className="font-semibold text-crimson">
                Как мы работаем с данными
              </a>
              . Если тебе меньше 18, заполняй вместе с родителем.
            </p>
            </details>
          </>
        ) : (
          <WizStep
            key={WIZ[step].id}
            question={WIZ[step]}
            value={answers[WIZ[step].id]}
            onChoose={(v) => choose(WIZ[step].id, v)}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
        <button
          type="button"
          onClick={() => { stepChanged.current = true; onDraftChange({ ...draft, step: Math.max(0, step - 1) }); }}
          className={`min-h-11 px-1 text-apple-body-sm text-cloud-body hover:text-cloud-white ${step > 0 ? "visible" : "invisible"}`}
        >
          ← Назад
        </button>
      </div>
    </div>
  );
}

function WizStep({
  question,
  value,
  onChoose,
}: {
  question: (typeof WIZ)[number];
  value: string | undefined;
  onChoose: (v: string) => void;
}) {
  return (
    <>
      <VespiAssistant
        variant="copilot"
        layout="portal-copilot"
        appearance="portrait"
        label="Веспи · соберём твой маршрут"
        as="div"
        data-plan-question={question.id}
        title={<h2 className="font-apple-text text-apple-subheading font-semibold text-cloud-white">{question.q}</h2>}
        message={<span data-vespi-question-reason>{question.hint && <>{question.hint}. </>}{QUESTION_CONTEXT[question.id]}</span>}
      />
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {question.opts.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChoose(o.v)}
            aria-pressed={value === o.v}
            className={`rounded-apple-card border px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
              value === o.v ? "border-crimson bg-crimson text-white" : "border-white/15 bg-frost hover:bg-pebble/40"
            }`}
          >
            <b className="block text-apple-body-sm font-semibold">{o.t}</b>
            {o.s && (
              <span className={`text-apple-caption ${value === o.v ? "text-white/75" : "text-cloud-meta"}`}>{o.s}</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
