"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { PermessoScenario } from "./permessoData";
import { ORIGINAL_PAGES, PAPER, OFFICIAL_PDF, fieldWidth, getPart, editorMode, valueProblem, type EditorField } from "./permessoOriginalGeometry";
import { expiryWarning, hasPaperValue, needsVerification, paperValue, transferSignature, transferSteps, type PaperValues, type TransferReceipt, type TransferStep } from "./permessoTransferModel";
import styles from "./permesso-transfer.module.css";

const CHECKS = [
  "Сведения сверены с моими документами, а не с вымышленным примером.",
  "Перенесённые значения проверены на бумаге: буквы, пробелы и даты.",
  "Все страницы kit на месте; применимость страниц 4–8 сверена с инструкцией.",
  "Приложения собраны по инструкции моего сценария.",
  "Марка и расходы сверены с актуальными официальными суммами.",
  "Порядок заполнения даты и подписи уточнён перед подачей.",
];
const fieldName = (f: EditorField) => /^\d+$/.test(f.id) ? `Поле ${f.id}` : "Шапка бланка";

type Props = {
  active: boolean; scenario: PermessoScenario; values: PaperValues; today: Date;
  onEdit: (field: EditorField) => void; onClose: () => void;
};

/** Only explicit acknowledgements are counted. Receipts are bound to the exact
 * value and scenario; editing an answer invalidates its previous acknowledgement.
 * No persistence, network access or automatic legal conclusions in this view. */
export function PermessoPaperTransfer({ active, scenario, values, today, onEdit, onClose }: Props) {
  const [cursor, setCursor] = useState(0);
  const [finished, setFinished] = useState(false);
  const [receipts, setReceipts] = useState<Record<string, TransferReceipt>>({});
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const steps = transferSteps(scenario);
  const step = steps[Math.min(cursor, steps.length - 1)];
  const field = step.fields[0];
  const mode = editorMode(field, scenario);
  const value = paperValue(field, values, scenario);
  const problem = step.skip ? "" : valueProblem(field, value);
  const uncertain = !step.skip && needsVerification(field, scenario);
  const optional = ["ifExists", "recommended"].includes(mode);
  const empty = !hasPaperValue(value);
  const warning = step.skip ? "" : expiryWarning(field, value, today);
  const isCurrent = (s: TransferStep) => receipts[s.id]?.signature === transferSignature(s, values, scenario);
  const addressed = steps.filter(isCurrent).length;
  const copied = steps.filter(s => isCurrent(s) && receipts[s.id].action === "copied").length;
  const deferred = steps.filter(s => !s.skip && needsVerification(s.fields[0], scenario));
  const outstanding = steps.filter(s => !isCurrent(s));
  const pageSteps = steps.filter(s => s.page === step.page);
  const pagePosition = pageSteps.findIndex(s => s.id === step.id) + 1;
  const canConfirm = step.skip || uncertain || (!problem && (!empty || optional));
  const confirmed = isCurrent(step);
  const actionText = step.skip ? "Оставил пустым" : uncertain ? "Отложить до уточнения" : optional && empty ? "Не применимо — оставить пустым" : "Перенёс ✓";

  useEffect(() => {
    if (!active) return;
    const heading = headingRef.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active, cursor, finished]);

  function next() { if (cursor < steps.length - 1) setCursor(cursor + 1); else setFinished(true); }
  function mark() {
    if (!canConfirm) return;
    const action: TransferReceipt["action"] = uncertain ? "deferred" : step.skip || empty ? "blank" : "copied";
    setReceipts(previous => ({ ...previous, [step.id]: { signature: transferSignature(step, values, scenario), action } }));
    next();
  }
  function jump(index: number) { setCursor(index); setFinished(false); }
  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("input, textarea, select, button, a, summary") || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowDown") { event.preventDefault(); next(); }
    if (event.key === "ArrowUp" && cursor > 0) { event.preventDefault(); setCursor(cursor - 1); }
  }
  if (!active) return null;

  return <section className={styles.transfer} data-permesso-transfer data-fab-yield aria-label="Перенос на бумагу" onKeyDown={keyboard}>
    <div className={styles.topbar}><div><span>Перенос на бумагу</span><b>{scenario === "rinnovo" ? "Продление · Rinnovo" : "Первое ВНЖ · Rilascio"}</b></div><button type="button" onClick={onClose}>Вернуться к бланку</button></div>
    <p className={styles.privacy}>Отметки переноса остаются в этой вкладке. «Сохранить» сохраняет значения черновика, но не эти отметки. Изменённое значение нужно подтвердить заново.</p>
    <div className={styles.progressRow}><span data-transfer-progress>Отмечено шагов: {addressed} из {steps.length}</span><span>Перенесено полей: {copied}</span></div>
    <progress className={styles.progress} value={addressed} max={steps.length} aria-label="Отмеченные шаги переноса" />

    {finished ? <div className={styles.finish}>
      <h2 ref={headingRef} tabIndex={-1}>Перед почтой</h2>
      <p>Отметки описывают твой перенос, а не готовность заявления. Проверка формата не подтверждает правильность сведений или право на ВНЖ.</p>
      <div className={styles.summary}><strong>{copied} полей отмечены как перенесённые</strong><span>Без отметки: {outstanding.length}. Полей с неуточнённым правилом: {deferred.length}.</span></div>
      {!!outstanding.length && <details open><summary>Что ещё не отмечено</summary><div className={styles.jumpList}>{outstanding.map(s => <button type="button" key={s.id} onClick={() => jump(steps.findIndex(x => x.id === s.id))}>Стр. {s.page} · {s.skip ? `Пропустить поля ${s.fields.map(f => f.id).join(", ")}` : `${fieldName(s.fields[0])}: ${s.fields[0].meta.ru}`}</button>)}</div></details>}
      <details><summary>Что нужно уточнить отдельно ({deferred.length})</summary><div className={styles.jumpList}>{deferred.map(s => <button type="button" key={s.id} onClick={() => jump(steps.findIndex(x => x.id === s.id))}>{fieldName(s.fields[0])} · {s.fields[0].meta.ru}</button>)}</div><p>«Отложить» не означает «проверено». Не переносим неподтверждённое правило автоматически.</p></details>
      <fieldset className={styles.checklist}><legend>Проверяешь самостоятельно</legend>{CHECKS.map((label, i) => <label key={label}><input type="checkbox" checked={!!checks[i]} onChange={e => setChecks(previous => ({ ...previous, [i]: e.target.checked }))} /><span>{label}</span></label>)}</fieldset>
      <p className={styles.pagesNote}>Страницы 4–8 не вырывай. Этот помощник охватывает обычный студенческий сценарий без семьи, а не все специальные случаи.</p>
      <div className={styles.sources}><a href={OFFICIAL_PDF} target="_blank" rel="noopener noreferrer">Оригинальный Modulo 1 ↗</a><a href="https://www.portaleimmigrazione.it/ITA/tabelleCosti.html" target="_blank" rel="noopener noreferrer">Сверить официальные расходы ↗</a></div>
      <button type="button" className={styles.secondary} onClick={() => jump(Math.max(0, cursor))}>Назад к шагам</button>
    </div> : <>
      <div className={styles.stepLayout}>
        <figure className={styles.locator}><PageLocator key={step.page} step={step} /><figcaption>Страница {step.page} · место на оригинале</figcaption></figure>
        <div className={styles.stepContent}>
          <div className={styles.stepMeta}><span>Стр. {step.page} · шаг {pagePosition} из {pageSteps.length}</span><strong data-transfer-state>{step.skip ? "Пропустить" : uncertain ? "Сначала уточни" : optional ? "Если применимо" : "Перенести"}</strong></div>
          <h2 ref={headingRef} tabIndex={-1} data-transfer-heading>{step.skip ? `${step.sectionLabel}: оставить пустым` : field.meta.ru}</h2>
          <p className={styles.italian}>{step.skip ? `Поля ${step.fields.map(f => f.id).join(", ")}` : `${fieldName(field)} · ${field.meta.it}`}</p>
          {confirmed && <p className={styles.receipt}>Этот шаг уже отмечен для текущего значения.</p>}
          {step.skip ? <p className={styles.instruction}>Эти поля не заполняются в выбранном сценарии. Они остаются на бумаге: не ставь прочерки или дополнительные X. Для другого основания подачи подсказка может не подходить.</p>
            : uncertain ? <div className={styles.caution}><b>Не переносим неподтверждённое правило</b><p>{field.kind === "signature" ? "Подпись ставится на бумаге. Введённое имя не является электронной подписью; порядок подписания уточни по kit." : "Значение в черновике не означает, что порядок заполнения проверен. Сверь его по инструкции kit / в Sportello Amico."}</p>{hasPaperValue(value) && <p>В черновике: <strong>{value}</strong></p>}</div>
            : <><LargeValues field={field} value={value} />{empty && <p className={styles.instruction}>{optional ? "В черновике нет значения. Подтверди пропуск только если поле действительно неприменимо." : "Сначала заполни это поле в электронном бланке. Пустое поле нельзя отметить как перенесённое."}</p>}</>}
          {!!problem && <p className={styles.error} role="alert">{problem}</p>}
          {!!warning && <p className={styles.caution} data-transfer-date-warning>{warning}</p>}
          {!step.skip && <button type="button" className={styles.edit} onClick={() => onEdit(field)}>{empty ? "Заполнить в бланке" : "Изменить значение в бланке"}</button>}
          <dl className={styles.explanation}><div><dt>{step.skip ? "Почему пусто" : "Откуда взять"}</dt><dd>{field.meta.source}</dd></div><div><dt>Как писать</dt><dd>{step.skip ? "Оставь группу пустой; далее переходи к следующему полю." : field.meta.format}</dd></div><div><dt>Не перепутай</dt><dd>{field.meta.mistake}</dd></div></dl>
        </div>
      </div>
      <div className={styles.actions}><button type="button" onClick={() => setCursor(Math.max(0, cursor - 1))} disabled={!cursor}>← Назад</button><button type="button" data-transfer-confirm disabled={!canConfirm} onClick={mark}>{actionText}</button><button type="button" onClick={next}>Дальше без отметки →</button></div>
      <p className={styles.next}>{cursor < steps.length - 1 ? `Далее: стр. ${steps[cursor + 1].page} · ${steps[cursor + 1].skip ? "группа, которую нужно пропустить" : steps[cursor + 1].fields[0].meta.ru}` : "Далее: самостоятельная проверка перед почтой."}</p>
      <details className={styles.jump}><summary>Выбрать шаг или перейти к проверке</summary><div className={styles.jumpList}>{steps.map((s, i) => <button type="button" key={s.id} onClick={() => jump(i)} aria-current={i === cursor ? "step" : undefined}>Стр. {s.page} · {s.skip ? `Пропустить ${s.fields.map(f => f.id).join(", ")}` : `${fieldName(s.fields[0])}: ${s.fields[0].meta.ru}`}{isCurrent(s) ? " · отмечено" : ""}</button>)}</div><button type="button" className={styles.secondary} onClick={() => setFinished(true)}>Перед почтой</button></details>
    </>}
  </section>;
}

function PageLocator({ step }: { step: TransferStep }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <p className={styles.mapFallback}>Мини-карта не загрузилась. Ориентир: страница {step.page}, поля {step.fields.map(f => f.id).join(", ")}.</p>;
  return <svg viewBox={`0 0 ${PAPER.width} ${PAPER.height}`} role="img" aria-label={`Страница ${step.page}, выделены поля ${step.fields.map(f => f.id).join(", ")}`} data-transfer-minimap>
    <image href={ORIGINAL_PAGES[step.page - 1].url} x="0" y="0" width={PAPER.width} height={PAPER.height} onError={() => setFailed(true)} />
    {step.fields.flatMap(f => f.runs.map((r, i) => <rect key={f.id + ":" + i} x={r.x - 3} y={r.y - 3} width={fieldWidth(r) + 6} height={r.height + 6} rx="2" fill="#234d78" fillOpacity=".18" stroke="#234d78" strokeWidth="3" />))}
  </svg>;
}

function LargeValues({ field, value }: { field: EditorField; value: string }) {
  if (field.kind === "line") return <div className={styles.lineValue} data-transfer-value>{value || "Пока не заполнено"}</div>;
  if (field.kind === "check") return <div className={styles.checkValue} data-transfer-value><span aria-hidden="true">{value === "X" ? "X" : ""}</span><p>{value === "X" ? "Поставь X в этой клетке." : "В черновике отметки нет."}</p></div>;
  if (field.kind === "radio") return <div className={styles.checkValue} data-transfer-value>{["SI", "NO"].map(option => <div key={option}><b>{option}</b><span aria-label={value === option ? "Выбрано" : "Не выбрано"}>{value === option ? "X" : ""}</span></div>)}</div>;
  return <div className={styles.values} data-transfer-value data-date={field.kind === "date"}>
    {field.runs.map((run, i) => {
      const part = getPart(field, value, i).trimEnd();
      const label = field.kind === "date" ? ["День · gg", "Месяц · mm", "Год · aaaa"][i] : run.label || (field.runs.length > 1 ? `Строка ${i + 1}` : "Значение");
      if (!part && field.runs.length > 1 && field.kind !== "date" && field.kind !== "split") return <p key={i} className={styles.emptyRow}>{label}: оставь пустой.</p>;
      const visibleCount = field.kind === "date" || field.kind === "split" ? run.count : Math.min(run.count, Math.max(10, Math.ceil(part.length / 10) * 10));
      const chunks = Array.from({ length: Math.ceil(visibleCount / 10) }, (_, chunk) => ({ start: chunk * 10, length: Math.min(10, visibleCount - chunk * 10) }));
      return <div key={i} className={styles.valueRow}><span className={styles.rowLabel}>{label}</span><span className={styles.srOnly}>{part || "Пусто"}</span>{chunks.map(chunk => <div key={chunk.start} className={styles.chunk}>{chunks.length > 1 && <small>Клетки {chunk.start + 1}–{chunk.start + chunk.length}</small>}<div className={styles.cells} aria-hidden="true">{Array.from({ length: chunk.length }, (_, j) => <span key={j} data-glyph={part[chunk.start + j] || ""}>{part[chunk.start + j] || " "}</span>)}</div></div>)}{visibleCount < run.count && <small className={styles.emptyRow}>Оставшиеся {run.count - visibleCount} клеток — пустые.</small>}</div>;
    })}
    {field.kind !== "date" && <p className={styles.cellNote}>Один символ — одна клетка. Пробел между словами — пустая клетка. Деление по десять здесь только для удобства чтения; строки на бумаге не меняются.</p>}
  </div>;
}
