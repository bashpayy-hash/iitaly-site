"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WizAnswers, WizQuestion } from "@/data/wizard";
import { wizardAnswers, wizardFor } from "@/data/wizardTracks";
import { track } from "@/lib/track";
import { isValidPhone, submitLead } from "@/lib/lead";
import { buildPlan } from "@/lib/planBuilder";
import { AppleButton } from "@/components/apple/Button";
import type { PlanDraft } from "@/lib/usePlanDraft";
import { Check } from "lucide-react";
import styles from "./plan-workspace.module.css";
import { questionArt } from "./questionArt";
import { QUESTION_CONTEXT, STEP_TITLES } from "./questionCopy";
import { DSU_CHECKED, DSU_CHECKED_NOTE, DSU_LABELS, DSU_QUESTION } from "./dsuChoice";
import { revealElement } from "@/components/motion/scroll";
import disclosure from "@/components/ui/disclosure.module.css";
import { PlainTermNotes } from "@/components/ui/PlainTerms";
import { stepTitleText } from "./planRoute";

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
  /* CRO audit (owner, 20 Nov: «делай тогда те самые 5 правок»): after the last
     answer the 1.2 s «Ответы собраны. Переходим к плану» hand-off stood
     between the student and the result. The preview opens at once; the cabinet
     assessment keeps its own transition. */
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);
  const previewTracked = useRef(false);
  const stepChanged = useRef(false);

  // The track's own questions: a bachelor's or a master's (wizardTracks.ts).
  const questions = wizardFor(answers);
  const finished = step >= questions.length;

  useEffect(() => {
    if (!stepChanged.current) return;
    const live = liveRef.current;
    live?.focus({ preventScroll: true });
    // A question tile can be taller than a phone screen: if its title went
    // above the sticky header, bring the top of the next question back —
    // gliding (motion pass, 5 Nov), not thrown.
    if (live) revealElement(live, live.getBoundingClientRect().top < 96 ? "start" : "nearest");
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
    /* Owner, 23 Nov, a phone screenshot of question 9 with «Уже в Италии»
       marked: «Почему здесь по дефолту будто уже нажали». It was his own
       earlier answer: after a changed level (or a «Назад») the questionnaire
       led through every later question, and those already answered arrived
       marked, as if chosen for him. An answer now leads to the next question
       that has none, in the track this answer leaves the applicant on, or to
       the end. A marked answer is seen only where he goes back himself. */
    const next = wizardAnswers({ ...answers, [id]: value });
    const left = wizardFor(next);
    const unanswered = left.findIndex(question => !next[question.id]);
    onDraftChange({ answers: next, step: unanswered < 0 ? left.length : unanswered, complete: false });
    track("wiz_step", { s: id });
    track("plan_step_completed", { step: step, of: questions.length });
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
        setPhoneError("Не удалось отправить номер. Попробуй ещё раз или нажми «Открыть мой план»\u00A0— он уже готов.");
        return;
      }
      track("lead_captured", { from: "wizard" });
      track("lead_submitted", { from: "wizard" });
    }
    track("plan_completed", { withPhone });
    onDone(answers);
  }

  return (
    <div className={styles.wizard} data-plan-wizard>
      {/* Owner, 4 Nov: «прогресс-бар вообще убери» — над плиткой вопроса ничего
          нет; номер вопроса стоит ярлыком внутри самой плитки, а для
          скринридера остаётся невидимый progressbar. */}
      <div role="progressbar" aria-label="Готовность плана" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={Math.min(step, questions.length)} aria-valuetext={finished ? "Все вопросы пройдены" : `Вопрос ${step + 1} из ${questions.length}`} className="sr-only" />

      <div ref={liveRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className={finished ? styles.panel : styles.stage} data-plan-finished={finished ? "" : undefined} data-fab-yield>
        {finished ? (
          <>
            {/* Owner, 23 Nov: «после опроса оно сразу выдает, куда тебя
                бросает. А я хочу… кружочек зеленый, и то, что вот эта вот
                галочка появляется, все это было, ну, с анимацией чуть-чуть».
                The last answer is met by a mark: a green circle settles, the
                check draws itself, one ring goes out; the line that stood as
                a small label in the box below is its caption, and the box,
                the button and the rest follow 60ms apart. Nothing waits for
                it: the button works from the first frame (CRO audit, 20 Nov:
                no hand-off screen between the answers and the plan). */}
            <div className={styles.done} data-plan-done>
              <span className={styles.doneMark} aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false"><path d="M6.6 12.6l3.5 3.5 7.3-8.1" pathLength={1} /></svg>
              </span>
              <p className={styles.doneLabel}>Уже готово по твоим ответам</p>
            </div>
            {preview && (
              <div className="mb-6 rounded-apple-card border border-white/15 bg-frost p-4">
                <p className="text-apple-body-sm font-semibold text-cloud-white" data-plan-preview-title>{preview.steps[0] && stepTitleText(preview.steps[0].t)}</p>
                <p className="mt-1 text-apple-body-sm text-cloud-body">{preview.steps[0]?.summary || preview.steps[0]?.p}</p>
                {/* Funnel analysis (owner, 22 Nov: «что ещё по воронке продаж
                    повторяется, или есть неконсистенции»). This screen printed
                    the first step's whole action, which the result and the
                    step's own page then repeated, and promised that «ещё 10
                    шагов… откроются по кнопке ниже», while the button opens a
                    plan where those ten are locked. It now names the step and
                    says what the plan holds. */}
                <p className="mt-2 text-apple-caption text-cloud-meta">
                  {(() => {
                    const stepsLeft = Math.max(preview.steps.length - 1, 0);
                    const docsCount = preview.docs.length;
                    return (
                      <>
                        Первый шаг открыт целиком. В плане ещё {stepsLeft} {ruPlural(stepsLeft, "шаг", "шага", "шагов")} и
                        список из {docsCount} {ruPlural(docsCount, "документа", "документов", "документов")}.
                      </>
                    );
                  })()}
                </p>
              </div>
            )}
            <AppleButton type="button" variant="filled" onClick={() => finish(false)} disabled={sending} className="w-full">Открыть мой план</AppleButton>
            <p className="mt-2 text-center text-apple-caption text-cloud-meta">Номер телефона не нужен.</p>
            <details className="mt-5 border-t border-white/15 pt-2">
            <summary className={`${disclosure.inline} min-h-11 py-3 text-apple-body-sm text-cloud-body`}>Оставить номер для связи</summary>
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
              . Если тебе меньше 18, заполняй вместе с законным представителем.
            </p>
            </details>
          </>
        ) : (
          <WizStep
            key={questions[step].id}
            question={questions[step]}
            index={step}
            total={questions.length}
            tone={step % 2 ? "dark" : "light"}
            value={answers[questions[step].id]}
            onChoose={(v) => choose(questions[step].id, v)}
          />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => { stepChanged.current = true; onDraftChange({ ...draft, step: Math.max(0, step - 1) }); }}
          className={`min-h-11 px-1 text-apple-body-sm text-cloud-body hover:text-cloud-white ${step > 0 ? "visible" : "invisible"}`}
        >
          Назад
        </button>
        {/* Intuitiveness pass (21 Nov): after «Назад» the only way forward was
            to tap the same answer again. An answered question can be passed. */}
        {!finished && answers[questions[step].id] && <button
          type="button"
          data-plan-next
          onClick={() => { stepChanged.current = true; onDraftChange({ ...draft, step: step + 1 }); }}
          className="min-h-11 px-1 text-apple-body-sm text-cloud-body hover:text-cloud-white"
        >
          Дальше
        </button>}
      </div>
    </div>
  );
}

/* Вопрос — плитка, как тема в справочнике: крупный вопрос и пояснение по
   центру, ответы — кнопки-капсулы, внизу своя риzo-вещь. Светлые и тёмные
   плитки чередуются от вопроса к вопросу. */

export function WizStep({
  question,
  index,
  total,
  tone,
  value,
  onChoose,
}: {
  question: WizQuestion;
  index: number;
  total: number;
  tone: "light" | "dark";
  value: string | undefined;
  onChoose: (v: string) => void;
}) {
  const art = questionArt(question.id);
  // A track's own reason (the master's direction) comes before the shared one.
  const why = question.why ?? QUESTION_CONTEXT[question.id];
  const dsu = question.id === DSU_QUESTION;
  // Scholarship: general answers first; the checked competitions only once the
  // student says they know their region (see dsuChoice.ts).
  const [known, setKnown] = useState(() => dsu && DSU_CHECKED.includes(value ?? ""));
  const optionsRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    optionsRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [known]);
  const toggleKnown = (next: boolean) => { moveFocus.current = true; setKnown(next); };
  const option = (o: (typeof question.opts)[number], label?: { t: string; s: string }) => <button
      key={o.v}
      type="button"
      onClick={() => onChoose(o.v)}
      aria-pressed={value === o.v}
      className={styles.option}
    >
      <b>{label?.t ?? o.t}</b>{(label?.s ?? o.s) && <small>{label?.s ?? o.s}</small>}
      {value === o.v && <span className={styles.mark} aria-hidden="true"><Check size={14} strokeWidth={2.4} /></span>}
    </button>;
  const byValue = (v: string) => question.opts.find(o => o.v === v)!;
  return (
    <div className={styles.question} data-tone={tone} data-plan-tile={question.id}>
      <div className={styles.questionHead} data-plan-question={question.id}>
        <p className={styles.questionStep} data-plan-step>Вопрос {index + 1} из {total} · {STEP_TITLES[question.id] || question.q}</p>
        <h2>{question.q}</h2>
        {/* CRO audit (20 Nov): about 520 words across ten questions took the
            whole two minutes a cold visitor gives the site. One short line
            stays; why the question matters is one tap away. */}
        <p className={styles.questionReason} data-vespi-question-reason>
          {question.hint ? <>{question.hint}.</> : why}
        </p>
        {question.hint && why && <details className={styles.questionWhy} data-question-why>
          <summary data-smooth>Зачем спрашиваю</summary>
          <p>{why}</p>
        </details>}
      </div>
      <div className={styles.options} ref={optionsRef} data-dsu-checked={dsu && known ? "" : undefined}>
        {!dsu ? question.opts.map(o => option(o))
          : known ? <>
            {DSU_CHECKED.map(v => option(byValue(v)))}
            {option(byValue("other"), DSU_LABELS.otherKnown)}
            <p className={styles.optionsNote}>{DSU_CHECKED_NOTE}</p>
            <button type="button" className={styles.optionsBack} onClick={() => toggleKnown(false)}>Другие варианты</button>
          </> : <>
            {option(byValue("other"), DSU_LABELS.unknown)}
            <button type="button" className={styles.option} aria-expanded={false} data-dsu-known onClick={() => toggleKnown(true)}>
              <b>{DSU_LABELS.known.t}</b><small>{DSU_LABELS.known.s}</small>
            </button>
            {option(byValue("none"))}
          </>}
        {/* Owner, 14 Nov 2026 (UX audit, item 5): «Осенью 2027» and «В 2026/27»
           read as the same thing to a school student. One line says which
           intake each one is: the academic year starts in autumn. */}
        {question.id === "intake" && <p className={styles.optionsNote} data-intake-note>Учебный год в Италии начинается осенью. «Осенью 2027»&nbsp;— набор 2027/28, к нему готовятся сейчас. «В 2026/27»&nbsp;— учебный год, который уже идёт: проверим, куда ещё можно успеть.</p>}
      </div>
      {/* Owner, 14 Nov 2026 («дай тогда расшифровку терминам»): the words a school
         student meets here for the first time (DSU, ISEE, CIMEA…) get one plain
         line under the answers, from the cabinet's glossary. */}
      <PlainTermNotes tone={tone === "dark" ? "dark" : "light"} text={[question.q, question.hint, why, ...question.opts.map(o => `${o.t} ${o.s ?? ""}`)].join(" ")} />
      {/* eslint-disable-next-line @next/next/no-img-element -- local riso art with explicit dimensions */}
      {art && <img className={styles.questionArt} src={art.src} srcSet={art.srcSet} sizes="(max-width: 600px) 60vw, 300px" width={art.width} height={art.height} alt="" loading="lazy" decoding="async" data-plan-question-art />}
    </div>
  );
}
