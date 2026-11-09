"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { type PermessoScenario } from "./permessoData";
import { ALL_GUIDANCE_FIELDS, EDITOR_FIELDS, OFFICIAL_PDF, ORIGINAL_PAGES, PAPER, capacity, editorMode, getPart, setPart, normalize, valueProblem, type EditorField } from "./permessoOriginalGeometry";
import { PermessoPaperTransfer } from "./PermessoPaperTransfer";
import { expiryWarning } from "./permessoTransferModel";
import styles from "./permesso-editor.module.css";
import z from "./permesso-zones.module.css";
import light from "./permesso-light.module.css";
import { PermessoWorkbenchControls } from "./PermessoWorkbenchControls";
import { PermessoPaperSheet } from "./PermessoPaperSheet";
import { AnswerSummary } from "./PermessoFieldHover";
import { fieldAnswer } from "./permessoFieldAnswer";
import { usePermessoRoute, pinPermessoField, usePermessoHint, rememberDraft, rememberTrainerSearch, rememberedDraft } from "./usePermessoRoute";
import { PERMESSO_FIELD_TOOL, PERMESSO_TOOLS, PermessoSectionNav, permessoSectionHref } from "./PermessoSections";
import disclosure from "@/components/ui/disclosure.module.css";
import { paidDeviceNow, usePaidDevice } from "@/components/access/usePaidDevice";
import { useWallPurchase } from "@/components/access/useWallPurchase";
import { GuideWall } from "../GuideWall";
import { FREE_PERMESSO_PAGES } from "../guideAccess";

type Draft = Record<string, string>;
const STORAGE_KEY = "iitaly:permesso-paper-editor:v1";
/* Убранный режим «Оригинал» сам писал «Мои данные» сюда на каждое нажатие.
   Вместе с режимом ушла и его кнопка «Стереть», поэтому личные данные
   удаляем, а не оставляем в браузере без способа их увидеть или стереть. */
const RETIRED_TRAINER_KEY = "iitaly:permesso-modulo1-local-data";
const STATES = { write: "Заполняй", empty: "Пропусти", ifExists: "Если есть", recommended: "Необязательно", verify: "Уточни", post: "На почте" };
const shortId = (f: EditorField) => /^\d+$/.test(f.id) ? `Поле ${f.id}` : "Шапка бланка";
const smooth = (): ScrollBehavior => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/** embedded — внутри кабинета (PortalPermessoStep): без вкладок разделов
    сверху, а справочники открываются в новой вкладке, чтобы задача кабинета
    оставалась на месте. */
export function EditablePermesso({ embedded = false }: { embedded?: boolean }) {
  const route = usePermessoRoute();
  const scenario = route.scenario, selected = route.field, selectedId = selected.id, page = selected.page;
  /* Owner, 9 Nov (guideAccess.ts): before payment the application sheet and
     the sheets a student leaves empty are open; sheets 2–3 and the transfer
     to paper wait for the route. Inside the cabinet nothing is closed here. */
  const paid = usePaidDevice();
  const pageLocked = !embedded && !paid && !FREE_PERMESSO_PAGES.includes(page);
  const transferLocked = !embedded && !paid;
  const transferWall = useWallPurchase("permesso", transferLocked && !paidDeviceNow());
  const onboarding = usePermessoHint();
  const [showExample, setShowExample] = useState(false);
  const [values, setValues] = useState<Draft>(rememberedDraft);
  const [hints, setHints] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState("");
  const [review, setReview] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferEpoch, setTransferEpoch] = useState(0);
  const [today] = useState(() => new Date());
  const root = useRef<HTMLDivElement>(null);
  const inspector = useRef<HTMLElement>(null);
  const reviewSection = useRef<HTMLElement>(null);
  const transferLaunch = useRef<HTMLButtonElement>(null);
  useEffect(() => { try { localStorage.removeItem(RETIRED_TRAINER_KEY); } catch { /* Storage can be unavailable in restricted modes. */ } }, []);
  useEffect(() => { rememberDraft(values); }, [values]);
  useEffect(() => { rememberTrainerSearch(route.search); }, [route.search]);
  const status = editorMode(selected, scenario);
  const applicable = EDITOR_FIELDS.filter(f => editorMode(f,scenario) !== "empty");
  const selectedIndex = ALL_GUIDANCE_FIELDS.indexOf(selected);
  const currentValue = valueFor(selected);
  const problem = valueProblem(selected, currentValue);
  const expiry = expiryWarning(selected, currentValue, today);
  const quickAnswer = fieldAnswer(selected, scenario, currentValue, showExample);
  const fieldTool = status !== "empty" ? PERMESSO_TOOLS.find(tool => tool.id === PERMESSO_FIELD_TOOL[selected.id]) : undefined;
  const entered = applicable.filter(f => !["8","9"].includes(f.id) && Boolean(values[f.id]?.replace(/[\s/]/g,""))).length;
  const nextField = applicable.find(f => ALL_GUIDANCE_FIELDS.indexOf(f) > selectedIndex);
  const previousField = [...applicable].reverse().find(f => ALL_GUIDANCE_FIELDS.indexOf(f) < selectedIndex);

  function valueFor(f: EditorField) {
    if (f.id === "8") return scenario === "rilascio" ? "X" : "";
    if (f.id === "9") return scenario === "rinnovo" ? "X" : "";
    return editorMode(f,scenario) === "empty" || f.readOnly ? "" : values[f.id] || "";
  }
  function patch(f: EditorField, next: string) {
    if (f.readOnly || editorMode(f, scenario) === "post" || editorMode(f, scenario) === "empty" || f.kind === "signature") return;
    setShowExample(false); setMessage("");
    setValues(previous => {
      const result = { ...previous, [f.id]: next };
      if (next === "X" && f.id === "52") result["53"] = "";
      if (next === "X" && f.id === "53") result["52"] = "";
      return result;
    });
  }
  function chooseScenario(next: PermessoScenario) {
    pinPermessoField(selected, next);
    setMessage("Сценарий изменён. Значения сохранены; пропускаемые поля остаются пустыми.");
  }
  function chooseField(f: EditorField, focus = false) {
    pinPermessoField(f, scenario); setReview(false);
    if (focus) requestAnimationFrame(() => {
      const target = inspector.current?.querySelector<HTMLElement>("input, textarea, select, [data-next-field]");
      target?.focus({ preventScroll: true });
      inspector.current?.scrollIntoView({ block: "nearest", behavior: smooth() });
    });
  }
  function choosePage(number: number) {
    const field = EDITOR_FIELDS.find(f => f.page === number && editorMode(f,scenario) !== "empty") || ALL_GUIDANCE_FIELDS.find(f => f.page === number);
    if (field) chooseField(field);
  }
  function editLarge(f: EditorField) { setShowExample(false); chooseField(f, true); }
  function personal() { setShowExample(false); }
  function go(delta: number) {
    const target = delta > 0 ? nextField : previousField;
    if (target) chooseField(target,true);
    else if (delta > 0) { setReview(true); requestAnimationFrame(() => reviewSection.current?.scrollIntoView({ block: "center", behavior: smooth() })); }
  }
  function changePart(f: EditorField, part: number, input: string) {
    const next = normalize(f,input), limit = f.kind === "line" ? 70 : f.runs[part].count;
    if (next.length > limit) { setMessage("В этой части не хватает клеток. Данные не обрезаны: используй полное поле в подсказке."); return; }
    patch(f,setPart(f,values[f.id] || "",part,next));
  }
  function paste(f: EditorField, part: number, event: ClipboardEvent<HTMLInputElement>) {
    const text = normalize(f,event.clipboardData.getData("text")); event.preventDefault();
    if (f.kind === "split") {
      if (text.includes("/")) { if (valueProblem(f,text)) setMessage("Вставка не помещается. Проверь префикс и номер отдельно; прежнее значение сохранено."); else patch(f,text); }
      else changePart(f,part,text);
      return;
    }
    const offset = f.kind === "line" ? 0 : f.runs.slice(0,part).reduce((n,r) => n+r.count,0);
    if (offset + text.length > capacity(f)) { setMessage("Вставка длиннее поля. Прежние данные сохранены: ничего не обрезано."); return; }
    const previous = values[f.id] || "";
    patch(f,previous.padEnd(offset," ").slice(0,offset) + text + previous.slice(offset+text.length));
  }
  function toggle(f: EditorField, option?: string) {
    if (f.id === "8" || f.id === "9") { chooseScenario(f.id === "8" ? "rilascio" : "rinnovo"); return; }
    if (editorMode(f,scenario) === "empty" || editorMode(f,scenario) === "post" || f.kind === "signature" || f.readOnly) { chooseField(f); return; }
    patch(f, option ? (values[f.id] === option ? "" : option) : (values[f.id] === "X" ? "" : "X"));
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify({ version: 1, scenario, values })); setMessage("Черновик сохранён на этом устройстве. После изменений сохрани ещё раз."); }
    catch { setMessage("Браузер не разрешил сохранение. В открытой вкладке данные остаются доступны."); }
  }
  function restore() {
    try {
      const text = localStorage.getItem(STORAGE_KEY);
      if (!text) { setMessage("В этом браузере пока нет сохранённого черновика."); return; }
      const saved: unknown = JSON.parse(text);
      if (!saved || typeof saved !== "object" || !("version" in saved) || saved.version !== 1 || !("values" in saved) || !saved.values || typeof saved.values !== "object") throw new Error("Invalid draft");
      const restored: Draft = {};
      for (const f of EDITOR_FIELDS) { const value = (saved.values as Record<string,unknown>)[f.id]; if (typeof value === "string" && value.length <= 256) restored[f.id] = value; }
      setValues(restored); pinPermessoField(selected, "scenario" in saved && saved.scenario === "rinnovo" ? "rinnovo" : "rilascio");
      setTransferEpoch(epoch => epoch + 1);
      setMessage("Черновик восстановлен. Отметки переноса нужно поставить заново.");
    } catch { setMessage("Не удалось прочитать черновик. Текущие данные не изменены."); }
  }
  function clear() {
    setValues({}); setShowExample(false); setClearConfirm(false); setReview(false); setTransferOpen(false); setTransferEpoch(epoch => epoch + 1);
    try { localStorage.removeItem(STORAGE_KEY); setMessage("Черновик удалён из этой вкладки и памяти браузера."); }
    catch { setMessage("Вкладка очищена. Браузер не разрешил удалить сохранённую копию — очисти данные сайта в настройках браузера."); }
  }
  function closeTransfer() { setTransferOpen(false); requestAnimationFrame(() => transferLaunch.current?.focus()); }
  function editTransfer(field: EditorField) { setTransferOpen(false); chooseField(field, true); }
  const issues = applicable.filter(f => f.kind !== "signature" && (valueProblem(f,valueFor(f)) || (editorMode(f,scenario)==="write" && !valueFor(f).trim())));
  const expiryNotices = applicable.map(f => ({ field: f, warning: expiryWarning(f, valueFor(f), today) })).filter(item => item.warning);

  return (
    <div className={`${styles.editor} ${light.light}`} ref={root} data-permesso-editor data-pinned-field={selectedId} data-scenario={scenario}>
      {/* Один режим вместо двух вкладок. Вкладка «Оригинал» показывала тот же
          бланк встроенным PDF со своим пошаговым гидом («1 из 9»), а черновик —
          своим («1 / 55»): два параллельных маршрута по одним и тем же полям.
          Оригинал теперь — ссылка на официальный PDF. Справочники («Коды и
          расчёты», «Перед почтой») — отдельные разделы (PermessoSections). */}
      {!embedded && <PermessoSectionNav current="blank" />}
      <header className={light.heading}>
        <div>
          <h1>Заполни Modulo 1</h1>
          <p>Твой черновик — на точной копии бумажного бланка.</p>
          <p className={light.prep}><span>Перед началом</span> Kit · чёрная ручка · паспорт · codice fiscale{scenario === "rinnovo" ? " · карточка ВНЖ" : ""} · marca da bollo €16</p>
        </div>
        <aside className={light.scope} aria-label="Что важно знать">
          {/* Оговорка свёрнута до одной строки (owner, 7 Nov: «слишком много
              информации»): на телефоне она одна занимала полэкрана над бланком. */}
          <details className={light.scopeNote}><summary className={disclosure.row}><b>Бланк остаётся главным источником.</b></summary><p>Это учебный помощник, не замена инструкции Questura. Если foglio note твоего kit расходится с подсказкой, следуй бумажному kit и требованиям своей провинции.</p></details>
          <p className={light.headLinks}><a href={OFFICIAL_PDF} target="_blank" rel="noopener noreferrer">Оригинал PDF</a></p>
        </aside>
      </header>
      <PermessoWorkbenchControls scenario={scenario} page={page} entered={entered} zoom={zoom} hints={hints} showExample={showExample} transferOpen={transferOpen} onScenario={chooseScenario} onPage={choosePage} onSave={save} onRestore={restore} onClear={() => setClearConfirm(true)} onExample={() => setShowExample(!showExample)} onPersonal={personal} onHints={setHints} onZoom={() => setZoom(zoom === 1 ? (window.matchMedia("(max-width: 600px)").matches ? 2.5 : 1.6) : 1)} />
      {message && <p role="status" className={styles.notice}>{message}</p>}
      {clearConfirm && <div className={styles.confirm} role="group" aria-label="Подтверждение очистки"><span>Удалить введённые данные и сохранённую копию?</span><button type="button" onClick={clear}>Да, стереть</button><button type="button" onClick={() => setClearConfirm(false)}>Отмена</button></div>}
      <PermessoPaperTransfer key={scenario + ":" + transferEpoch} active={transferOpen} scenario={scenario} values={values} today={today} onClose={closeTransfer} onEdit={editTransfer} />
      <div hidden={transferOpen}>
        {onboarding.visible && !pageLocked && <div className={z.onboarding}><span><span className={z.onPointer}>Наведи на</span><span className={z.onTouch}>Нажми на</span> любую строку — скажу, писать или пропустить</span><button type="button" aria-label="Больше не показывать подсказку" onClick={onboarding.dismiss}>×</button></div>}
        {page > 3 && <p className={z.scopeNote}>Эти листы остаются в kit. Здесь — пропуски для сценария без семьи, не инструкция для семейного заявления.</p>}
        {pageLocked ? <LockedSheet page={page} /> : <div className={`${styles.workspace} ${z.workspace}`}>
          <div className={styles.document} data-fab-yield>
            <div className={styles.documentBar}><span>Mod. 209 · Modulo 1 · страница {page} из 8</span><a href={OFFICIAL_PDF + "#page=" + page} target="_blank" rel="noopener noreferrer">Сверить с PDF</a></div>
            {!transferOpen && <PermessoPaperSheet key={page} page={page} selectedId={selectedId} values={values} scenario={scenario} hints={hints} zoom={zoom} showExample={showExample} onSelect={chooseField} onChange={(f,i,v) => {setShowExample(false);changePart(f,i,v);}} onPaste={paste} onToggle={toggle} onEditLarge={editLarge} />}
            <div className={styles.documentFoot}>Оригинальные клетки и подписи не изменены. Это учебный черновик, не подача заявления.</div>
          </div>
          <aside className={`${styles.inspector} ${light.inspector}`} ref={inspector} data-fab-yield data-permesso-inspector aria-label="Подсказка и ввод выбранного поля">
            <div className={styles.inspectorTop}><span>Стр. {page} · {shortId(selected)}</span><strong data-state={status}>{STATES[status]}</strong></div>
            <h2>{selected.meta.ru}</h2><p className={styles.italian}>{selected.meta.it}</p>
            <div className={light.quick}><AnswerSummary field={selected} answer={quickAnswer} detail /></div>
            {fieldTool && <SectionLink embedded={embedded} className={light.toolLink} href={permessoSectionHref("kody", scenario, "tool=" + fieldTool.id)} data-field-tool={fieldTool.id}>Справочник: {fieldTool.title}</SectionLink>}
            <div className={styles.fieldEditor} key={selectedId}>
              {selected.kind === "signature" ? <p className={styles.caution}>Здесь будет подпись на бумаге. Ввод имени не является подписью. Момент подписания уточни по инструкции своего kit.</p>
                : status === "post" ? <p className={styles.caution}>Этот участок заполняется на почте. В режиме «Мои данные» ввод отключён.</p>
                : selected.readOnly || status === "empty" ? null
                : selected.quick?.choices ? <div className={`${z.choiceSelect} ${light.choices}`} role="group" aria-label={selected.meta.ru}>{selected.quick.choices.map(c => <label key={c.value}><input type="radio" name={"choice-" + selected.id} checked={currentValue === c.value} onChange={() => patch(selected,c.value)} /><span>{c.value} — {c.label}</span></label>)}</div>
                : selected.kind === "check" ? <label className={styles.checkLabel}><input type="checkbox" checked={currentValue === "X"} onChange={() => toggle(selected)} />Поставить X в поле {selected.id}</label>
                : selected.kind === "radio" ? <fieldset className={styles.radioGroup}><legend>Выбери свой статус, без автоматической подстановки</legend>{["SI","NO"].map(option => <label key={option}><input type="radio" name="editor-refugee" value={option} checked={currentValue === option} onChange={() => toggle(selected,option)} />{option === "SI" ? "SI — да" : "NO — нет"}</label>)}</fieldset>
                : selected.kind === "split" ? selected.runs.map((r,i) => <label className={styles.editorLabel} key={i}><span>{r.label}</span><input aria-label={selected.meta.ru + ": " + r.label} value={getPart(selected,currentValue,i)} maxLength={r.count} onChange={e => changePart(selected,i,e.target.value)} autoComplete="off" spellCheck={false} /></label>)
                : <label className={styles.editorLabel}><span>{selected.kind === "date" ? "Дата — ДДММГГГГ" : "Твоё значение"}</span><input data-panel-input value={currentValue} aria-label={"Ввести: " + selected.meta.ru} aria-invalid={!!problem} aria-describedby="permesso-value-format permesso-value-error" maxLength={capacity(selected)} inputMode={selected.kind === "date" || selected.meta.kind === "number" ? "numeric" : "text"} autoComplete="off" spellCheck={false} placeholder={selected.kind === "date" ? "ДДММГГГГ" : selected.meta.ru} onPaste={e => { const text = normalize(selected,e.clipboardData.getData("text")); if (text.length > capacity(selected)) {e.preventDefault();setMessage("Вставка длиннее поля. Данные не обрезаны и прежнее значение сохранено.");} }} onChange={e => patch(selected,normalize(selected,e.target.value))} /><small>{currentValue.length} / {capacity(selected)} {selected.kind === "line" ? "символов" : "клеток"}</small></label>}
            </div>
            <p id="permesso-value-error" className={styles.validation} role={problem ? "alert" : undefined}>{problem}</p>
            {!!expiry && <p className={styles.caution} data-editor-date-warning>{expiry}</p>}
            <div className={`${styles.fieldNav} ${light.fieldNav}`} title="Стрелки ↑ и ↓ переключают поля страницы"><button type="button" onClick={() => go(-1)} disabled={!previousField}>Назад</button><span>{applicable.includes(selected) ? `${applicable.indexOf(selected) + 1} / ${applicable.length}` : shortId(selected)}</span><button type="button" data-next-field onClick={() => go(1)}>{nextField ? "Дальше →" : "К проверке →"}</button></div>
            <p className={styles.upNext}>{nextField ? `Дальше: ${shortId(nextField)} — ${nextField.meta.ru}` : "Дальше: обзор черновика перед переносом на бумагу."}</p>
            <details className={light.detail} key={"detail-" + selectedId}><summary>Подробное пояснение</summary><dl className={styles.explanation}><div><dt>{status === "empty" ? "Почему пропустить" : "Откуда взять"}</dt><dd>{selected.meta.source}</dd></div><div id="permesso-value-format"><dt>Как писать</dt><dd>{selected.kind === "date" ? "Две цифры дня, две месяца, четыре года. Разделители уже есть на оригинальном бланке." : selected.kind === "split" ? "Заполняй части отдельно, как подписано на бумаге. Разделитель / уже напечатан." : selected.meta.format}</dd></div><div><dt>Не перепутай</dt><dd>{selected.meta.mistake}</dd></div></dl>{status === "verify" && <p className={styles.caution}>Значение в черновике не подтверждает правило. Перед переносом уточни его по своему kit / в Sportello Amico.</p>}</details>
            {showExample && quickAnswer.example && <details className={light.samplePreview} key={"sample-" + selectedId}><summary className={disclosure.row}>Пример по клеткам — не твои данные</summary><div className={light.sampleRows} data-rows={selected.kind === "text"}>{selected.runs.map((r,i) => <div className={light.sampleRun} key={i} aria-label={r.label || `Часть ${i + 1}`}>{Array.from({length:r.count},(_,k) => <span key={k}>{getPart(selected,quickAnswer.value,i)[k] || ""}</span>)}</div>)}</div></details>}
            <details className={styles.fieldJump}><summary>Перейти к полю на странице {page}</summary><div>{ALL_GUIDANCE_FIELDS.filter(f => f.page === page).map(f => <button type="button" key={f.id} onClick={() => chooseField(f,true)}>{shortId(f)} · {f.meta.ru}</button>)}</div></details>
          </aside>
        </div>}
        {transferLocked ? <div className={light.finishBar} data-permesso-transfer-locked><div><b>Черновик заполнен?</b><p>Перенос на бумагу по одному полю откроется с маршрутом, вместе с листами 2 и 3.</p></div><button type="button" className={light.finishBuy} data-wall-buy data-wall-place="permesso" aria-haspopup="dialog" onClick={transferWall.open}>{transferWall.label}</button>{transferWall.modal}</div>
          : <div className={light.finishBar}><div><b>Черновик заполнен?</b><p>Переноси на бумагу по одному полю, с крупными буквами и отметками.</p></div><button type="button" ref={transferLaunch} onClick={() => setTransferOpen(true)}>Переносим на бумагу</button></div>}
        <section ref={reviewSection} className={styles.reviewSection} aria-label="Проверка черновика"><button type="button" className={styles.reviewToggle} aria-expanded={review} onClick={() => setReview(!review)}>Проверить черновик <span>{review ? "−" : "+"}</span></button>{review && <div className={styles.reviewBody}><h2>Перед переносом на бумагу</h2><p>Это проверка заполненности и формата, не юридическая проверка документов или готовности заявления.</p>{issues.length ? <ul>{issues.map(f => <li key={f.id}><button type="button" onClick={() => chooseField(f,true)}><b>Стр. {f.page} · {shortId(f)} — {f.meta.ru}</b><span>{valueProblem(f,valueFor(f)) || "Пока не заполнено"}</span></button></li>)}</ul> : <p>В проверяемых полях нет пропусков или ошибок формата. Это не подтверждает правильность сведений.</p>}{!!expiryNotices.length && <ul data-review-date-warnings>{expiryNotices.map(item => <li key={item.field.id}><button type="button" onClick={() => chooseField(item.field,true)}><b>{shortId(item.field)} · проверить срок документа</b><span>{item.warning}</span></button></li>)}</ul>}<p>Отдельно сверь поля «Уточни», набор приложений и порядок подписания. Семейные и другие специальные случаи не охвачены этим студенческим сценарием.</p></div>}</section>
        <nav className={light.nextSections} aria-label="Справочники Modulo 1">
          <SectionLink embedded={embedded} href={permessoSectionHref("kody", scenario)}><b>Коды и расчёты</b><span>Поле 16, поле 25, провинция, страна</span></SectionLink>
          <SectionLink embedded={embedded} href={permessoSectionHref("pochta", scenario)}><b>Перед почтой</b><span>Бумага, документы и расходы</span></SectionLink>
        </nav>
      </div>
    </div>
  );
}

/** Sheets 2–3 before payment: the official page itself, its title and the wall. */
function LockedSheet({ page }: { page: number }) {
  const sheet = ORIGINAL_PAGES.find(item => item.page === page);
  return <section className={light.lockedSheet} data-permesso-locked-page={page} aria-labelledby="permesso-locked-sheet">
    {/* eslint-disable-next-line @next/next/no-img-element -- The official blank page, a local static file. */}
    <img src={sheet?.url} alt="" width={PAPER.width} height={PAPER.height} loading="lazy" decoding="async" />
    <div>
      <h2 id="permesso-locked-sheet">Лист {page}{sheet ? ` · ${sheet.title}` : ""}</h2>
      <GuideWall place="permesso" flat note="Пояснения к каждому полю этого листа, ввод черновика и перенос на бумагу откроются после оплаты. Открыты первый лист — само заявление — и листы 4–8, которые студент оставляет пустыми. Один платёж, без подписки." />
    </div>
  </section>;
}

function SectionLink({ embedded, href, className, children, ...data }: { embedded: boolean; href: string; className?: string; children: ReactNode; "data-field-tool"?: string }) {
  return embedded
    ? <a className={className} href={href} target="_blank" rel="noopener" {...data}>{children}</a>
    : <Link className={className} href={href} {...data}>{children}</Link>;
}
