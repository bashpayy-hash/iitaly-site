"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { preparePayload, type DocPayload } from "@/lib/docPayload";
import { checkDocument, getDocumentAvailability, DocCheckError, type DocCheckResult, type DocumentAvailability, type DocumentReviewContext } from "@/lib/checkDocument";
import { track } from "@/lib/track";
import { AppleButton } from "@/components/apple/Button";
import { ScanLine, ShieldCheck, Files, Check } from "lucide-react";
import styles from "./plan-workspace.module.css";

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
   смотрел в неподвижный экран. Статус Веспи отражает этот реальный этап. */
type State =
  | { step: "idle" }
  | { step: "reading" }
  | { step: "ready"; file: File; payload: DocPayload }
  | { step: "checking"; file: File; payload: DocPayload }
  | { step: "done"; file: File; payload: DocPayload; result: DocCheckResult }
  | { step: "retry"; file: File; payload: DocPayload; message: string }
  | { step: "error"; message: string };

function inspectorMessage(step: State["step"], availabilityPending: boolean, unavailable: boolean) {
  if (availabilityPending) return "Сначала проверю, доступна ли ИИ-сверка.";
  if (unavailable) return "Проверка временно недоступна. Это не замечание к твоему документу.";
  if (step === "reading") return "Читаю выбранный файл. Проверка начнётся после твоего подтверждения.";
  if (step === "checking") return "Проверяю содержание и применимые требования. Покажу итог, замечания и что делать дальше.";
  if (step === "ready") return "Файл выбран. Уточни заявку и нажми «Проверить документ» — до этого файл не отправляется на ИИ-анализ.";
  if (step === "retry") return "Проверка не завершилась. Файл остался выбран; причину покажу ниже.";
  if (step === "error") return "Не удалось подготовить файл. Причина ниже — выбери документ ещё раз после исправления.";
  return "Загрузи справку о доходах, состав семьи, банковскую выписку или перевод. Для проверки требований укажи программу и учебный год.";
}

export function DocCheck({ onComplete, academicYear }: { onComplete?: (result: DocCheckResult) => void; academicYear?: DocumentReviewContext["academicYear"]; portalInspector?: boolean } = {}) {
  const router = useRouter();
  const [state, setState] = useState<State>({ step: "idle" });
  const [context, setContext] = useState<DocumentReviewContext>({
    profile: "general", academicYear: academicYear || "unspecified", applicantScope: "unspecified",
  });
  function updateContext(value: Partial<DocumentReviewContext>) {
    setContext(current => ({ ...current, ...value }));
    setState(current => current.step === "done" || current.step === "retry"
      ? { step: "ready", file: current.file, payload: current.payload } : current);
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showExample, setShowExample] = useState(false);
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
    setShowExample(false);
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
      onComplete?.(result);
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
    <div className={styles.workbench} data-document-workbench>
      <div className={styles.auditContext}>

        <p className={styles.auditBadge}><ShieldCheck aria-hidden="true" /> AI Document Audit · Бесплатно</p>
        <h2>Проверь документ перед подачей</h2>
        <p className={styles.auditStatus} data-document-assistant={state.step}>{inspectorMessage(state.step, availabilityPending, unavailable)}</p>
      <fieldset disabled={state.step === "checking" || state.step === "reading"} className="mt-5 space-y-3 disabled:opacity-60">
        <legend className="text-apple-body-sm font-medium text-cloud-white">Для какой заявки?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="min-w-0 text-apple-caption text-cloud-body">
            Программа
            <select value={context.profile}
              onChange={e => updateContext({ profile: e.target.value as DocumentReviewContext["profile"] })}
              className="mt-1 block min-h-11 w-full rounded-apple-input border border-white/20 bg-bone px-3 text-apple-body-sm text-cloud-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson">
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
              className="mt-1 block min-h-11 w-full rounded-apple-input border border-white/20 bg-bone px-3 text-apple-body-sm text-cloud-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson">
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

        <ul className={styles.auditScope} aria-label="Что проверяем в файле">
          <li><Check aria-hidden="true" /><span>Апостиль: наличие и читаемость, если он нужен получателю.</span></li>
          <li><Check aria-hidden="true" /><span>Даты справок DSU: только по подтверждённым правилам выбранного конкурса.</span></li>
          <li><Check aria-hidden="true" /><span>Перевод: имена, комплектность и видимые несоответствия.</span></li>
          <li><Check aria-hidden="true" /><span>Выписка: владелец, период и читаемость данных.</span></li>
        </ul>
      </div>
      <div className={styles.auditTool}>

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
          className={styles.dropzone}
          data-drag={dragOver}
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
          <Files aria-hidden="true" />
          <b className={styles.fileAction}>Выбрать документ</b>
          <small>или перетащи сюда<br />Фото, PDF, Word до 5 МБ</small>
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
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-white/15 text-apple-caption font-medium text-cloud-meta sm:h-20 sm:w-20">
              {fileIcon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="break-words text-apple-body-sm font-medium text-cloud-white [overflow-wrap:anywhere]">{state.file.name}</p>
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

      {state.step !== "checking" && state.step !== "reading" && state.step !== "done" && <button type="button" className={styles.example} aria-expanded={showExample} onClick={() => setShowExample(!showExample)}>Проверить пример справки</button>}
      {showExample && <section className={styles.exampleResult} data-document-example aria-label="Пример разбора, не проверка твоего файла">
        <h3><ScanLine size={19} aria-hidden="true" className="mr-2 inline" />Пример разбора справки</h3>
        <p>Демонстрация интерфейса. Это вымышленный пример, файл не отправлялся на ИИ-анализ.</p>
        <p><b>Нужно уточнить.</b> В примере не указан конкурс. Нельзя определить нужный год доходов.</p>
        <ul><li><b>Читаемость:</b> текст различим.</li><li><b>Комплект:</b> данные владельца и подпись видны.</li><li><b>Даты:</b> сверь год и период с bando своей программы.</li></ul>
        <p><b>Следующее действие:</b> выбери программу и учебный год, затем приложи свой документ.</p>
      </section>}

      <p className="mt-3 text-apple-caption text-cloud-meta">
        После нажатия «Проверить документ» файл передаётся в Anthropic для ИИ-анализа.{" "}
        <a href="/privacy" className="font-medium text-crimson underline underline-offset-2">Как обрабатываются данные</a>
      </p>

      <div aria-live="polite" className="mt-5">
        {(state.step === "error" || state.step === "retry") && !unavailable && (
          <div role="alert" className="border border-red bg-red/5 px-4 py-3 text-apple-body-sm font-medium text-primary">
            {state.message}
            {state.step === "retry" && <p className="mt-2 font-normal">Файл остался выбран. Попробуй проверить его ещё раз.</p>}
          </div>
        )}
        {(state.step === "checking" || state.step === "reading") && (
          <div role="status" className="flex items-start gap-3 text-apple-body-sm text-cloud-body" data-document-review-pending>
            <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-crimson motion-safe:animate-pulse" />
            <p>{
              state.step === "reading"
                ? "Готовлю файл к проверке…"
                : "Проверка идёт. Результат появится здесь."
            }</p>
          </div>
        )}
        {state.step === "done" && (
          <DocResult result={state.result} onCta={onComplete ? undefined : () => router.push("/prices")} />
        )}
      </div>

      <p className="mt-5 text-apple-caption text-cloud-meta">
        Это предварительная проверка одного файла. Она не подтверждает
        подлинность документа и не гарантирует его принятие: решение принимает
        университет, CAF или стипендиальный орган.
      </p>
      </div>
    </div>
  );
}

export function DocResult({ result, onCta }: { result: DocCheckResult; onCta?: () => void }) {
  const v = result.verdict || "warn";
  const headingId = useId();
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => { resultRef.current?.focus({ preventScroll: true }); }, []);
  return (
    <div ref={resultRef} tabIndex={-1} role="region" aria-labelledby={headingId} className="rounded-apple-input border border-white/15 p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson">
      <header className={styles.resultHead} data-document-assistant="done">
        <div className="flex flex-wrap items-center gap-2.5">
          <ShieldCheck size={22} aria-hidden="true" />
          <span className={`rounded-apple-pill px-3 py-1 text-apple-caption font-medium ${v === "error" ? "bg-red/10 text-primary" : "bg-pebble text-cloud-white"}`}>{LABEL[v] || "Результат"}</span>
          <h3 id={headingId} className="break-words font-apple-display text-apple-subheading font-medium text-cloud-white [overflow-wrap:anywhere]">{result.docTitle || "Документ"}</h3>
        </div>
        {result.summary && <p>{result.summary}</p>}
      </header>

      {result.review && <div className="mt-4 border-b border-white/15 pb-4 text-apple-body-sm text-cloud-body">
        <p className="font-medium text-cloud-white">
          {result.review.profileLabel}{result.review.academicYear !== "unspecified" ? ` · ${result.review.academicYear}` : ""}
        </p>
        <p className="mt-1">{result.review.notice}</p>
        {result.review.referenceYear !== null && <p className="mt-1">Год доходов: {result.review.referenceYear}. Имущество — на 31 декабря {result.review.referenceYear}; допустимые альтернативы зависят от программы.</p>}
        <details className="mt-3 text-apple-caption">
          <summary className="min-h-11 cursor-pointer py-3 font-medium text-crimson focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson">
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
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  c.status === "ok"
                    ? "bg-green/15 text-green"
                    : c.status === "error"
                      ? "bg-red/15 text-primary"
                      : c.status === "warn"
                        ? "bg-warn/15 text-warn"
                        : "bg-bone/10 text-cloud-meta"
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

      {onCta && <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/15 pt-4">
        <AppleButton type="button" variant="filled" size="sm" onClick={onCta}>
          Собрать весь пакет с IItaly
        </AppleButton>
        <span className="text-apple-caption text-cloud-meta">
          Проверка одного документа бесплатна. Полный комплект ведёт система в тарифе.
        </span>
      </div>}
    </div>
  );
}
