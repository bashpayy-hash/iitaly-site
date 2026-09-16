"use client";

import { useState } from "react";
import type { CityId } from "@/data/italy";
import {
  QUESTIONS,
  matchCities,
  plateForAnswers,
  type Answers,
  type CityMatch as Match,
} from "@/data/cityMatch";
import { track } from "@/lib/track";

/**
 * Подбор города — слой поверх страницы, а не её передел.
 *
 * Панель, а не модалка во весь экран: карта и разворот скетчбука обязаны
 * оставаться видимыми. Человек пришёл выбирать вуз, и закрывать ему рабочий
 * инструмент ради опросника — значит поменять задачи местами. На десктопе
 * это док справа шириной 380px, на телефоне — лист снизу на три четверти
 * высоты; в обоих случаях карта видна.
 *
 * Один вопрос на экран. Четыре варианта в столбик читаются за секунду, а
 * четыре вопроса подряд на одном экране выглядят анкетой и закрываются не
 * глядя.
 *
 * Выбор города отсюда НЕ фильтрует карту навсегда: он подсвечивает
 * рекомендованные точки и приглушает остальные, а «показать все города»
 * возвращает карту в исходное состояние одним нажатием (см.
 * UniversitiesExplorer → resetMatch).
 */
export function CityMatch({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  /** Город выбран: подсветить на карте, открыть панель города, перелистнуть скетчбук. */
  onPick: (city: CityId, plate: number | null) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Match[] | null>(null);

  if (!open) return null;

  const q = QUESTIONS[step];

  function choose(id: string) {
    const next: Answers = { ...answers, [QUESTIONS[step].id]: id as Answers[keyof Answers] };
    setAnswers(next);
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
      return;
    }
    const got = matchCities(next);
    setResult(got);
    track("city_match_done", { top: got[0]?.city ?? "—" });
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  return (
    <div
      role="dialog"
      aria-label="Подбор города под ритм"
      className="fixed inset-x-0 bottom-0 z-[80] max-h-[78vh] overflow-y-auto border-t-2 border-ink bg-paper shadow-[0_-16px_48px_rgba(13,17,24,.28)] sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[380px] sm:border-t-0 sm:border-l-2 sm:shadow-[-16px_0_48px_rgba(13,17,24,.22)]"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <p className="font-mono text-[11px] tracking-[0.12em] text-sec-deep uppercase">
          {result ? "Тебе сюда" : `Вопрос ${step + 1} из ${QUESTIONS.length}`}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть подбор"
          className="-mr-1 grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-cream hover:text-ink"
        >
          <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {result ? (
        <div className="px-5 py-5">
          <p className="text-sm text-ink-soft">
            Из тех же 30 городов на карте. Первые два — по ответам, третий для
            контраста.
          </p>
          <ul className="mt-4 space-y-3">
            {result.map((m) => (
              <li key={m.city}>
                <div className="rounded-lg border-2 border-ink bg-cream p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <b className="font-display text-lg font-semibold">{m.name}</b>
                    {m.wildcard && (
                      <span className="shrink-0 font-mono text-[10px] tracking-[0.1em] text-sec-deep uppercase">
                        контраст
                      </span>
                    )}
                  </div>
                  {/* Регион прямо из CITIES — он же и различает карточки.
                     Строка «почему» собрана из совпавших тегов, и у двух
                     городов с одинаковым набором она выходит дословно
                     одинаковой: у Бари и Салерно совпали все четыре, и обе
                     карточки читались под копирку. Регион разный всегда —
                     «Апулия · порт на Адриатике» против «Кампания ·
                     Амальфи», — и это факт из базы, а не дописанный текст. */}
                  <p className="mt-0.5 font-mono text-[10px] tracking-[0.06em] text-sec-deep uppercase">
                    {m.region}
                  </p>
                  <p className="mt-2 text-sm text-ink-soft">{m.why}</p>
                  {m.unis.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-line pt-3">
                      {m.unis.map((u) => (
                        <li key={u.name} className="text-sm">
                          <b className="font-semibold">{u.name}</b>
                          <span className="block text-xs text-ink-soft">{u.dsu}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    onClick={() => onPick(m.city, plateForAnswers(answers, m.city))}
                    className="mt-3 w-full rounded-pill border-2 border-ink bg-ink py-2 text-sm font-semibold text-cream transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
                  >
                    Открыть на карте
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={restart}
            className="mt-4 w-full py-2 text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Пройти заново
          </button>
        </div>
      ) : (
        <div className="px-5 py-5">
          <p className="font-display text-lg font-semibold">{q.title}</p>
          <ul className="mt-4 space-y-2.5">
            {q.options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => choose(o.id)}
                  className="w-full rounded-lg border-2 border-line bg-cream px-4 py-3 text-left transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
                >
                  <b className="block text-sm font-semibold">{o.label}</b>
                  {o.hint && <span className="mt-0.5 block text-xs text-ink-soft">{o.hint}</span>}
                </button>
              </li>
            ))}
          </ul>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="mt-4 text-sm text-ink-soft hover:text-ink"
            >
              ← Назад
            </button>
          )}
        </div>
      )}
    </div>
  );
}
