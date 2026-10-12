"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { preparePayload, type DocPayload } from "@/lib/docPayload";
import { checkDocument, getDocumentAvailability, DocCheckError, type DocCheckResult, type DocumentAvailability, type DocumentReviewContext } from "@/lib/checkDocument";
import { track } from "@/lib/track";
import { AppleButton } from "@/components/apple/Button";
import { VespaRide } from "./VespaRide";
import { VespaReveal } from "@/components/VespaReveal";

const MARK: Record<string, string> = { ok: "✓", warn: "!", error: "✕", unknown: "?" };
const LABEL: Record<string, string> = {
  ok: "Видимых ошибок нет",
  warn: "Нужно уточнить",
  error: "Найдены ошибки",
  unreadable: "Плохо видно",
};

/* reading — отдельный шаг, а не мгновение внутри accept(). Чтение файла
   не бесплатное: FileReader плюс перерисовка фото в canvas до 1600px по
   длинной стороне занимают на телефоне заметные секунды, и всё это время
   раньше не происходило ровно ничего — человек нажал «выбрать документ» и
   смотрел в неподвижный экран. Веспа едет и здесь тоже. */
type State =
  | { step: "idle" }
  | { step: "reading" }
  | { step: "ready"; file: File; payload: DocPayload }
  | { step: "checking"; file: File; payload: DocPayload }
  | { step: "done"; file: File; payload: DocPayload; result: DocCheckResult }
  | { step: "retry"; file: File; payload: DocPayload; message: string }
  | { step: "error"; message: string };

export function DocCheck() {
  const router = useRouter();
  const [state, setState] = useState<State>({ step: "idle" });
  const [context, setContext] = useState<DocumentReviewContext>({
    profile: "general", academicYear: "unspecified", applicantScope: "unspecified",
  });
  function updateContext(value: Partial<DocumentReviewContext>) {
    setContext(current => ({ ...current, ...value }));
    setState(current => current.step === "done" || current.step === "retry"
      ? { step: "ready", file: current.file, payload: current.payload } : current);
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [availability, setAvailability] = useState<DocumentAvailability | null>(null);
  const [availabilityPending, setAvailabilityPending] = useState(true);
  const unavailable = availability?.ok === false;

  function unavailableFrom(error: unknown): DocumentAvailability {
    return { ok: false, code: error instanceof DocCheckError ? error.code || "AI_UNAVAILABLE" : "AI_UNAVAILABLE",
      error: error instanceof Error ? error.message : "ИИ-проверка временно недоступна.", retryable: true };
  }

  useEffect(() => {
    const controller = new AbortController();
    getDocumentAvailability(controller.signal)
      .then(value => { if (!controller.signal.aborted) setAvailability(value); })
      .catch(error => { if (!controller.signal.aborted) setAvailability(unavailableFrom(error)); })
      .finally(() => { if (!controller.signal.aborted) setAvailabilityPending(false); });
    return () => controller.abort();
  }, []);

  async function refreshAvailability() {
    setAvailabilityPending(true);
    try { setAvailability(await getDocumentAvailability()); }
    catch (error) { setAvailability(unavailableFrom(error)); }
    finally { setAvailabilityPending(false); }
  }

  async function accept(file: File | null | undefined) {
    if (!file || unavailable || availabilityPending) return;
    setState({ step: "reading" });
    const res = await preparePayload(file);
    if ("error" in res) {
      setState({ step: "error", message: res.error });
      return;
    }
    track("doc_upload", { kind: res.payload.kind });
    setState({ step: "ready", file, payload: res.payload });
  }

  function reset() {
    if (inputRef.current) inputRef.current.value = "";
    setState({ step: "idle" });
  }

  async function run() {
    if (unavailable || availabilityPending) return;
    if (state.step !== "ready" && state.step !== "done" && state.step !== "retry") return;
    const { file, payload } = state;
    setState({ step: "checking", file, payload });
    track("doc_check_start");
    try {
      const result = await checkDocument(payload, undefined, context);
      setState({ step: "done", file, payload, result });
      track("doc_check_done", { verdict: result.verdict });
    } catch (e) {
      /* Текст ошибки готовит checkDocument — там же, где известно, что
         именно случилось. Раньше он собирался здесь по e.message, и
         любой содержательный ответ сервера («PDF слишком большой»,
         «лимит 12 файлов за 5 минут», «проверка временно недоступна»)
         подменялся советом проверить интернет. Человек чинил связь,
         которая работала, а настоящая причина до него не доходила. */
      const err = e instanceof DocCheckError ? e : null;
      if (err?.code?.startsWith("AI_")) setAvailability({ ok: false, code: err.code, error: err.message, retryable: err.retryable });
      /* В аналитику уходит только вид сбоя и код ответа — по ним видно,
         что именно ломается в проде, и для этого не нужны ни имя файла,
         ни его содержимое. */
      track("doc_check_error", { kind: err?.kind ?? "unknown", status: err?.status ?? 0 });
      setState({
        step: "retry", file, payload,
        message: err
          ? err.message
          : "Не удалось проверить документ. Попробуй ещё раз через минуту.",
      });
    }
  }

  const preview = "payload" in state && state.payload.kind === "image" ? state.payload.preview : null;
  const fileIcon =
    "payload" in state && state.payload.kind === "pdf"
      ? "PDF"
      : "payload" in state && state.payload.kind === "text"
        ? state.file.name.toLowerCase().endsWith(".docx")
          ? "DOC"
          : "TXT"
        : null;

  return (
    <div className="rounded-apple-card border border-white/15 bg-white p-5 sm:p-7">
      <p className="text-apple-caption text-cloud-meta uppercase">
        Проверка документов · бесплатно
      </p>
      <h2 className="mt-1 font-apple-display text-apple-heading-sm font-semibold text-cloud-white">
        Проверь документ перед подачей
      </h2>
      <p className="mt-2 text-apple-body-sm text-cloud-body">
        Загрузи справку о доходах, состав семьи, банковскую выписку или перевод.
        Для проверки требований укажи программу и учебный год.
      </p>

      <fieldset disabled={state.step === "checking" || state.step === "reading"} className="mt-5 space-y-3 disabled:opacity-60">
        <legend className="text-apple-body-sm font-semibold text-cloud-white">Для какой заявки?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="min-w-0 text-apple-caption text-cloud-body">
            Программа
            <select value={context.profile}
              onChange={e => updateContext({ profile: e.target.value as DocumentReviewContext["profile"] })}
              className="mt-1 block min-h-11 w-full rounded-apple-input border border-white/20 bg-white px-3 text-apple-body-sm text-cloud-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson">
              <option value="general">Не знаю / другая программа</option>
              <option value="bocconi">Bocconi · ISU / ISEEU</option>
              <option value="piemonte">EDISU Piemonte</option>
              <option value="toscana">DSU Toscana</option>
              <option value="ergo">ER.GO · Emilia-Romagna</option>
            </select>
          </label>
          <label className="min-w-0 text-apple-caption text-cloud-body">
            Учебный год заявки
            <select value={context.academicYear}
              onChange={e => updateContext({ academicYear: e.target.value as DocumentReviewContext["academicYear"] })}
              className="mt-1 block min-h-11 w-full rounded-apple-input border border-white/20 bg-white px-3 text-apple-body-sm text-cloud-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson">
              <option value="unspecified">Ещё не определился</option>
              <option value="2026/27">2026/27</option>
              <option value="2027/28">2027/28</option>
            </select>
          </label>
        </div>
        {context.profile !== "general" && <label className="flex cursor-pointer items-start gap-3 py-1 text-apple-body-sm text-cloud-body">
          <input type="checkbox" checked={context.applicantScope === "kz-family-abroad"}
            onChange={e => updateContext({ applicantScope: e.target.checked ? "kz-family-abroad" : "unspecified" })}
            className="mt-1 h-5 w-5 shrink-0 accent-crimson focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson" />
          <span><b className="text-cloud-white">Моя ситуация: Казахстан, семья за рубежом</b>
            <span className="mt-1 block text-apple-caption">Я гражданин Казахстана, подаю сведения о семейных доходах и имуществе за пределами Италии и не заявляю финансовую независимость.</span>
          </span>
        </label>}
        <p className="text-apple-caption text-cloud-meta">
          {context.academicYear === "2027/28"
            ? "Правила 2027/28 в этой базе пока не подтверждены окончательно. Доступна проверка содержания файла."
            : context.profile === "general" || context.academicYear === "unspecified" || context.applicantScope === "unspecified"
              ? "Без уточнения заявки проверим содержание. Год доходов и обязательное оформление оценим только для подходящего профиля."
              : "Применим правила выбранной программы 2026/27 для указанной ситуации. Источники покажем в результате."}
        </p>
      </fieldset>

      {(availabilityPending || unavailable) && <div role="status" className="mt-5 border border-white/15 p-4 text-apple-body-sm text-cloud-body">
        <b className="block text-cloud-white">{availabilityPending ? "Проверяем доступность ИИ…" : "Проверка документов пока недоступна"}</b>
        {unavailable && <>
          <p className="mt-2">{availability.error}</p>
          {"file" in state && <p className="mt-2">Выбранный файл остаётся в этой вкладке, пока страница открыта.</p>}
          <AppleButton type="button" variant="outlined" size="sm" className="mt-3" onClick={refreshAvailability} disabled={availabilityPending}>Проверить доступность</AppleButton>
        </>}
      </div>}

      {state.step === "idle" || state.step === "error" || state.step === "reading" ? (
        <label
          className={`relative mt-5 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-apple-card border border-dashed px-6 py-8 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-crimson ${
            dragOver ? "border-crimson bg-crimson/5" : "border-white/20 hover:bg-white/5"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            accept(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf,.pdf,.doc,.docx,.txt,.rtf"
            className="sr-only"
            aria-label="Выбрать документ для проверки"
            disabled={state.step === "reading" || unavailable || availabilityPending}
            onChange={(e) => accept(e.target.files?.[0])}
          />
          <svg aria-hidden="true" width="28" height="32" viewBox="0 0 28 32" fill="none" className="mb-1 text-crimson">
            <path d="M16 2H5a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V11L16 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M16 2v9h9M8 17h12M8 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <b className="text-cloud-white">Выбрать документ</b>
          <span className="text-apple-body-sm text-cloud-body">или перетащи сюда · фото, PDF, Word до 5 МБ</span>
        </label>
      ) : (
        <div className="mt-5 flex items-start gap-3 rounded-apple-input border border-white/15 p-4 sm:items-center sm:gap-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="документ"
              className="h-14 w-14 shrink-0 rounded-md border border-white/15 object-cover sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-white/15 text-apple-caption font-semibold text-cloud-meta sm:h-20 sm:w-20">
              {fileIcon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="break-words text-apple-body-sm font-semibold text-cloud-white [overflow-wrap:anywhere]">{state.file.name}</p>
            <div className="mt-3 flex flex-wrap gap-2 [&>button]:w-full sm:[&>button]:w-auto">
              <AppleButton
                type="button"
                variant="filled"
                size="sm"
                onClick={run}
                disabled={state.step === "checking" || unavailable || availabilityPending}
                className={state.step === "checking" ? "vespa-wait-pulse" : undefined}
              >
                {state.step === "checking"
                  ? "Проверяю…"
                  : state.step === "retry" ? "Повторить проверку"
                  : state.step === "done"
                    ? "Проверить ещё раз"
                    : "Проверить документ"}
              </AppleButton>
              <AppleButton type="button" variant="outlined" size="sm" onClick={reset} disabled={state.step === "checking"}>
                Выбрать другой
              </AppleButton>
            </div>
          </div>
        </div>
      )}

      <p className="mt-3 text-apple-caption text-cloud-meta">
        После нажатия «Проверить документ» файл передаётся в Anthropic для ИИ-анализа.{" "}
        <a href="/privacy" className="font-semibold text-crimson underline underline-offset-2">Как обрабатываются данные</a>
      </p>

      <div aria-live="polite" className="mt-5">
        {(state.step === "error" || state.step === "retry") && !unavailable && (
          <div role="alert" className="border border-red bg-red/5 px-4 py-3 text-apple-body-sm font-semibold text-red">
            {state.message}
            {state.step === "retry" && <p className="mt-2 font-normal">Файл остался выбран. Попробуй проверить его ещё раз.</p>}
          </div>
        )}
        {(state.step === "checking" || state.step === "reading") && (
          <VespaRide
            text={
              state.step === "reading"
                ? "Читаю файл — сжимаю фото, чтобы оно доехало"
                : "Проверяю содержание и применимые требования — это может занять около минуты"
            }
          />
        )}
        {state.step === "done" && (
          <DocResult result={state.result} onCta={() => router.push("/prices")} />
        )}
      </div>

      <p className="mt-5 text-apple-caption text-cloud-meta">
        Это предварительная проверка одного файла. Она не подтверждает
        подлинность документа и не гарантирует его принятие: решение принимает
        университет, CAF или стипендиальный орган.
      </p>
    </div>
  );
}

function DocResult({ result, onCta }: { result: DocCheckResult; onCta: () => void }) {
  const v = result.verdict || "warn";
  const headingId = useId();
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => { resultRef.current?.focus({ preventScroll: true }); }, []);
  return (
    <div ref={resultRef} tabIndex={-1} role="region" aria-labelledby={headingId} className="rounded-apple-input border border-white/15 p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson">
      <div className="flex flex-wrap items-center gap-2.5">
        {v === "ok" && <VespaReveal pose="success" className="h-9 w-auto shrink-0" />}
        <span
          className={`rounded-apple-pill px-3 py-1 text-apple-caption font-semibold text-white uppercase ${
            v === "ok"
              ? "bg-green"
              : v === "error"
                ? "bg-red"
                : v === "unreadable"
                  ? "bg-cloud-meta"
                  : "bg-warn"
          }`}
        >
          {LABEL[v] || "Результат"}
        </span>
        <h3 id={headingId} className="break-words font-apple-display text-apple-subheading font-semibold text-cloud-white [overflow-wrap:anywhere]">{result.docTitle || "Документ"}</h3>
      </div>

      {result.summary && <p className="mt-3 text-apple-body-sm text-cloud-body">{result.summary}</p>}

      {result.review && <div className="mt-4 border-b border-white/15 pb-4 text-apple-body-sm text-cloud-body">
        <p className="font-semibold text-cloud-white">
          {result.review.profileLabel}{result.review.academicYear !== "unspecified" ? ` · ${result.review.academicYear}` : ""}
        </p>
        <p className="mt-1">{result.review.notice}</p>
        {result.review.referenceYear !== null && <p className="mt-1">Год доходов: {result.review.referenceYear}. Имущество — на 31 декабря {result.review.referenceYear}; допустимые альтернативы зависят от программы.</p>}
        <details className="mt-3 text-apple-caption">
          <summary className="min-h-11 cursor-pointer py-3 font-semibold text-crimson focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson">
            Официальные источники · сверены {result.review.verifiedOn.split("-").reverse().join(".")}
          </summary>
          <p className="mt-2 text-cloud-meta">Это дата сверки базы. Сайты учреждений не просматриваются заново при каждой проверке.</p>
          <ul className="mt-2 space-y-2">
            {result.review.sources.map(source => <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-crimson underline underline-offset-2">{source.label}</a>
            </li>)}
          </ul>
        </details>
      </div>}

      {result.checks && result.checks.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.checks.map((c, i) => (
            <div key={i} className="flex gap-2.5 text-apple-body-sm">
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  c.status === "ok"
                    ? "bg-green/15 text-green"
                    : c.status === "error"
                      ? "bg-red/15 text-red"
                      : c.status === "warn"
                        ? "bg-warn/15 text-warn"
                        : "bg-white/10 text-cloud-meta"
                }`}
              >
                {MARK[c.status || "unknown"] || "?"}
              </span>
              <span className="text-cloud-white">
                <b>{c.label}.</b> {c.note}
              </span>
            </div>
          ))}
        </div>
      )}

      {result.problems && result.problems.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.problems.map((p, i) => (
            <div
              key={i}
              className={`border px-3 py-2.5 text-apple-body-sm text-cloud-white ${
                p.severity === "critical" ? "border-red bg-red/5" : "border-warn bg-warn/5"
              }`}
            >
              <b>{p.severity === "critical" ? "Критично: " : "Замечание: "}</b>
              {p.text}
              {p.fix && <span className="mt-1 block text-cloud-body">Что делать: {p.fix}</span>}
            </div>
          ))}
        </div>
      )}

      {result.nextSteps && result.nextSteps.length > 0 && (
        <div className="mt-4 text-apple-body-sm text-cloud-white">
          <b>Что дальше</b>
          {result.nextSteps.map((n, i) => (
            <div key={i} className="mt-1 text-cloud-body">
              → {n}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/15 pt-4">
        <AppleButton type="button" variant="filled" size="sm" onClick={onCta}>
          Собрать весь пакет с IItaly
        </AppleButton>
        <span className="text-apple-caption text-cloud-meta">
          Проверка одного документа бесплатна. Полный комплект ведёт система в тарифе.
        </span>
      </div>
    </div>
  );
}
