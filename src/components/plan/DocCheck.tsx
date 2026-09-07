"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { preparePayload, type DocPayload } from "@/lib/docPayload";
import { checkDocument, type DocCheckResult } from "@/lib/checkDocument";
import { track } from "@/lib/track";
import { Button } from "@/components/Button";
import { Vespa } from "@/components/Vespa";

const MARK: Record<string, string> = { ok: "✓", warn: "!", error: "✕", unknown: "?" };
const LABEL: Record<string, string> = {
  ok: "Всё в порядке",
  warn: "Есть замечания",
  error: "Найдены ошибки",
  unreadable: "Плохо видно",
};

type State =
  | { step: "idle" }
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
      const message =
        e instanceof Error && e.message === "no-backend"
          ? "Проверка заработает после подключения сервера."
          : e instanceof Error && e.message === "fail"
            ? "Не удалось проверить документ. Попробуй ещё раз через минуту."
            : "Нет связи с сервером. Проверь интернет и попробуй снова.";
      setState({ step: "error", message });
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
    <div className="rounded-xl border-2 border-ink bg-paper p-5 shadow-lg sm:p-7">
      <p className="text-xs font-extrabold tracking-[0.14em] text-sec uppercase">
        Проверка документов · бесплатно
      </p>
      <h3 className="mt-1 font-display text-2xl font-black">
        Загрузи документ — ИИ найдёт ошибки до подачи
      </h3>
      <p className="mt-2 text-sm text-ink-soft">
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
          <div key={b} className="rounded-md bg-cream px-3 py-2 text-xs">
            <b className="block text-ink">{b}</b>
            <span className="text-ink-soft">{s}</span>
          </div>
        ))}
      </div>

      {state.step === "idle" || state.step === "error" ? (
        <label
          className={`mt-5 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragOver ? "border-red bg-red/5" : "border-line hover:bg-cream"
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
          <b>Выбрать документ</b>
          <span className="text-sm text-ink-soft">или перетащи сюда · фото, PDF, Word до 5 МБ</span>
        </label>
      ) : (
        <div className="mt-5 flex flex-col gap-4 rounded-lg border-2 border-ink bg-cream p-4 sm:flex-row sm:items-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="документ"
              className="h-28 w-28 shrink-0 rounded-md border-2 border-ink object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-paper font-display text-lg font-black text-ink-soft">
              {fileIcon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{state.file.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={run}
                disabled={state.step === "checking"}
              >
                {state.step === "checking"
                  ? "Проверяю…"
                  : state.step === "done"
                    ? "Проверить ещё раз"
                    : "Проверить документ"}
              </Button>
              <Button type="button" variant="ghost" onClick={reset}>
                Выбрать другой
              </Button>
            </div>
          </div>
        </div>
      )}

      <div aria-live="polite" className="mt-5">
        {state.step === "error" && (
          <div className="rounded-md border-2 border-red bg-red/5 px-4 py-3 text-sm font-bold text-red">
            {state.message}
          </div>
        )}
        {state.step === "checking" && (
          <div className="flex items-center gap-3 rounded-md border-2 border-line px-4 py-3 text-sm text-ink-soft">
            <Vespa pose="documents" className="h-9 w-auto shrink-0" />
            Сверяю с правилами DSU и ISU — это занимает 10–20 секунд
          </div>
        )}
        {state.step === "done" && (
          <DocResult result={state.result} onCta={() => router.push("/prices")} />
        )}
      </div>

      <p className="mt-5 text-xs text-ink-soft">
        Проверка помогает не подать документ с ошибкой, но результат не
        гарантирует: решение о стипендии принимает регион Италии. Подробнее о
        работе с данными — в{" "}
        <a href="/privacy" className="font-bold text-red">
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
    <div className="rounded-lg border-2 border-ink p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        {v === "ok" && <Vespa pose="success" className="h-9 w-auto shrink-0" />}
        <span
          className={`rounded-pill px-3 py-1 text-xs font-extrabold uppercase ${
            v === "ok"
              ? "bg-green text-cream"
              : v === "error"
                ? "bg-red text-cream"
                : v === "unreadable"
                  ? "bg-sec text-cream"
                  : "bg-warn text-cream"
          }`}
        >
          {LABEL[v] || "Результат"}
        </span>
        <span className="font-display text-lg font-black">{result.docTitle || "Документ"}</span>
      </div>

      {result.summary && <p className="mt-3 text-sm text-ink-soft">{result.summary}</p>}

      {result.checks && result.checks.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.checks.map((c, i) => (
            <div key={i} className="flex gap-2.5 text-sm">
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  c.status === "ok"
                    ? "bg-green/15 text-green"
                    : c.status === "error"
                      ? "bg-red/15 text-red"
                      : c.status === "warn"
                        ? "bg-warn/15 text-warn"
                        : "bg-line text-ink-soft"
                }`}
              >
                {MARK[c.status || "unknown"] || "?"}
              </span>
              <span>
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
              className={`rounded-md border-2 px-3 py-2.5 text-sm ${
                p.severity === "critical" ? "border-red bg-red/5" : "border-warn bg-warn/5"
              }`}
            >
              <b>{p.severity === "critical" ? "Критично: " : "Замечание: "}</b>
              {p.text}
              {p.fix && <span className="mt-1 block text-ink-soft">Что делать: {p.fix}</span>}
            </div>
          ))}
        </div>
      )}

      {result.nextSteps && result.nextSteps.length > 0 && (
        <div className="mt-4 text-sm">
          <b>Что дальше</b>
          {result.nextSteps.map((n, i) => (
            <div key={i} className="mt-1 text-ink-soft">
              → {n}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t-2 border-line pt-4">
        <Button type="button" variant="dark" onClick={onCta}>
          Собрать весь пакет с IItaly
        </Button>
        <span className="text-xs text-ink-soft">
          Проверка одного документа бесплатна. Полный комплект ведёт система в тарифе.
        </span>
      </div>
    </div>
  );
}
