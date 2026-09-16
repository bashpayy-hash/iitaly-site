"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { preparePayload, type DocPayload } from "@/lib/docPayload";
import { checkDocument, DocCheckError, type DocCheckResult } from "@/lib/checkDocument";
import { track } from "@/lib/track";
import { AppleButton } from "@/components/apple/Button";
import { VespaRide } from "./VespaRide";
import { VespaReveal } from "@/components/VespaReveal";

const MARK: Record<string, string> = { ok: "✓", warn: "!", error: "✕", unknown: "?" };
const LABEL: Record<string, string> = {
  ok: "Всё в порядке",
  warn: "Есть замечания",
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
  | { step: "error"; message: string };

export function DocCheck() {
  const router = useRouter();
  const [state, setState] = useState<State>({ step: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  async function accept(file: File | null | undefined) {
    if (!file) return;
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
    if (state.step !== "ready" && state.step !== "done") return;
    const { file, payload } = state;
    setState({ step: "checking", file, payload });
    track("doc_check_start");
    try {
      const result = await checkDocument(payload);
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
      /* В аналитику уходит только вид сбоя и код ответа — по ним видно,
         что именно ломается в проде, и для этого не нужны ни имя файла,
         ни его содержимое. */
      track("doc_check_error", { kind: err?.kind ?? "unknown", status: err?.status ?? 0 });
      setState({
        step: "error",
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
    <div className="border border-white/15 p-5 sm:p-7">
      <p className="text-apple-caption text-cloud-meta uppercase">
        Проверка документов · бесплатно
      </p>
      <h2 className="mt-1 font-apple-display text-apple-heading-sm font-semibold text-cloud-white">
        Загрузи документ — ИИ найдёт ошибки до подачи
      </h2>
      <p className="mt-2 text-apple-body-sm text-cloud-body">
        Справка о доходах, свидетельство о рождении, состав семьи, банковская
        выписка, апостиль. Система сверит с правилами DSU и ISU: референсный
        год, цепочка «апостиль → перевод → нотариус», реквизиты, арифметика.
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {[
          ["Соединение зашифровано", "файл идёт по HTTPS, как в банковском приложении"],
          ["Не публикуем и не продаём", "документ виден только тебе и проверяющему эксперту"],
          ["Не идёт на обучение моделей", "используется один раз — для твоего разбора"],
          ["Удалим по запросу", "напиши, и данные сотрём"],
        ].map(([b, s]) => (
          <div key={b} className="border border-white/10 px-3 py-2 text-apple-caption">
            <b className="block text-cloud-white">{b}</b>
            <span className="text-cloud-meta">{s}</span>
          </div>
        ))}
      </div>

      {state.step === "idle" || state.step === "error" || state.step === "reading" ? (
        <label
          className={`mt-5 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed px-6 py-8 text-center transition-colors ${
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
            hidden
            onChange={(e) => accept(e.target.files?.[0])}
          />
          <span aria-hidden className="text-3xl">
            📄
          </span>
          <b className="text-cloud-white">Выбрать документ</b>
          <span className="text-apple-body-sm text-cloud-body">или перетащи сюда · фото, PDF, Word до 5 МБ</span>
        </label>
      ) : (
        <div className="mt-5 flex flex-col gap-4 border border-white/15  p-4 sm:flex-row sm:items-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="документ"
              className="h-28 w-28 shrink-0 border border-white/15 object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center border border-white/15 font-apple-display text-apple-subheading font-semibold text-cloud-meta">
              {fileIcon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-apple-body-sm font-semibold text-cloud-white">{state.file.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AppleButton
                type="button"
                variant="filled"
                size="sm"
                onClick={run}
                disabled={state.step === "checking"}
                className={state.step === "checking" ? "vespa-wait-pulse" : undefined}
              >
                {state.step === "checking"
                  ? "Проверяю…"
                  : state.step === "done"
                    ? "Проверить ещё раз"
                    : "Проверить документ"}
              </AppleButton>
              <AppleButton type="button" variant="outlined" size="sm" onClick={reset}>
                Выбрать другой
              </AppleButton>
            </div>
          </div>
        </div>
      )}

      <div aria-live="polite" className="mt-5">
        {state.step === "error" && (
          <div className="border border-red bg-red/5 px-4 py-3 text-apple-body-sm font-semibold text-red">
            {state.message}
          </div>
        )}
        {(state.step === "checking" || state.step === "reading") && (
          <VespaRide
            text={
              state.step === "reading"
                ? "Читаю файл — сжимаю фото, чтобы оно доехало"
                : "Сверяю с правилами DSU и ISU — это занимает 10–20 секунд"
            }
          />
        )}
        {state.step === "done" && (
          <DocResult result={state.result} onCta={() => router.push("/prices")} />
        )}
      </div>

      <p className="mt-5 text-apple-caption text-cloud-meta">
        Проверка помогает не подать документ с ошибкой, но результат не
        гарантирует: решение о стипендии принимает регион Италии. Подробнее о
        работе с данными — в{" "}
        <a href="/privacy" className="font-semibold text-crimson">
          политике конфиденциальности
        </a>
        .
      </p>
    </div>
  );
}

function DocResult({ result, onCta }: { result: DocCheckResult; onCta: () => void }) {
  const v = result.verdict || "warn";
  return (
    <div className="border border-white/15 p-4">
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
        <span className="font-apple-display text-apple-subheading font-semibold text-cloud-white">{result.docTitle || "Документ"}</span>
      </div>

      {result.summary && <p className="mt-3 text-apple-body-sm text-cloud-body">{result.summary}</p>}

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
