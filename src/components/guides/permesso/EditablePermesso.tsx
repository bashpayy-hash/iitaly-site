"use client";

import { useRef, useState, type ClipboardEvent } from "react";
import { type PermessoScenario } from "./permessoData";
import { ALL_GUIDANCE_FIELDS, EDITOR_FIELDS, OFFICIAL_PDF, capacity, editorMode, getPart, setPart, normalize, valueProblem, type EditorField } from "./permessoOriginalGeometry";
import { PermessoPaperTransfer } from "./PermessoPaperTransfer";
import { expiryWarning } from "./permessoTransferModel";
import { PermessoNavigation } from "./PermessoNavigation";
import c from "./permesso-compact.module.css";
import styles from "./permesso-editor.module.css";
import z from "./permesso-zones.module.css";
import { PermessoPaperSheet } from "./PermessoPaperSheet";
import { AnswerSummary } from "./PermessoFieldHover";
import { fieldAnswer } from "./permessoFieldAnswer";
import { usePermessoRoute, pinPermessoField, usePermessoHint } from "./usePermessoRoute";

type Draft = Record<string, string>;
const STORAGE_KEY = "iitaly:permesso-paper-editor:v1";
const STATES = { write: "Заполняй", empty: "В этом сценарии — пропусти", ifExists: "Если есть", recommended: "Необязательно", verify: "Сначала уточни", post: "На почте" };
const shortId = (f: EditorField) => /^\d+$/.test(f.id) ? `Поле ${f.id}` : "Шапка бланка";
const smooth = (): ScrollBehavior => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export function EditablePermesso({ active = true }: { active?: boolean }) {
  const route = usePermessoRoute();
  const scenario = route.scenario, selected = route.field, selectedId = selected.id, page = selected.page;
  const onboarding = usePermessoHint();
  const [showExample, setShowExample] = useState(false);
  const [values, setValues] = useState<Draft>({});
  const [hints, setHints] = useState(true);
  const [savedSnapshot, setSavedSnapshot] = useState("");
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
  const status = editorMode(selected, scenario);
  const applicable = EDITOR_FIELDS.filter(f => editorMode(f,scenario) !== "empty");
  const selectedIndex = ALL_GUIDANCE_FIELDS.indexOf(selected);
  const currentValue = valueFor(selected);
  const problem = valueProblem(selected, currentValue);
  const expiry = expiryWarning(selected, currentValue, today);
  const entered = applicable.filter(f => !["8","9"].includes(f.id) && Boolean(values[f.id]?.replace(/[\s/]/g,""))).length;
  const nextField = applicable.find(f => ALL_GUIDANCE_FIELDS.indexOf(f) > selectedIndex);
  const previousField = [...applicable].reverse().find(f => ALL_GUIDANCE_FIELDS.indexOf(f) < selectedIndex);

  function valueFor(f: EditorField) {
    if (f.id === "8") return scenario === "rilascio" ? "X" : "";
    if (f.id === "9") return scenario === "rinnovo" ? "X" : "";
    return editorMode(f,scenario) === "empty" || f.readOnly ? "" : values[f.id] || "";
  }
  function patch(f: EditorField, next: string) {
    if (f.readOnly || editorMode(f, scenario) === "post" || f.kind === "signature") return;
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
  function editLarge(f: EditorField) { setShowExample(false); chooseField(f, true); }
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
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify({ version: 1, scenario, values })); setSavedSnapshot(JSON.stringify({ scenario, values })); setMessage("Снимок черновика сохранён в этом браузере. После новых изменений нажми «Сохранить» ещё раз."); }
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
      setSavedSnapshot(JSON.stringify({ scenario: "scenario" in saved && saved.scenario === "rinnovo" ? "rinnovo" : "rilascio", values: restored }));
      setValues(restored); pinPermessoField(selected, "scenario" in saved && saved.scenario === "rinnovo" ? "rinnovo" : "rilascio");
      setTransferEpoch(epoch => epoch + 1);
      setMessage("Сохранённый черновик восстановлен. Отметки переноса нужно поставить заново.");
    } catch { setMessage("Не удалось прочитать черновик. Текущие данные не изменены."); }
  }
  function clear() {
    setSavedSnapshot(""); setValues({}); setShowExample(false); setClearConfirm(false); setReview(false); setTransferOpen(false); setTransferEpoch(epoch => epoch + 1);
    try { localStorage.removeItem(STORAGE_KEY); setMessage("Черновик удалён из этой вкладки и памяти браузера."); }
    catch { setMessage("Вкладка очищена. Браузер не разрешил удалить сохранённую копию — очисти данные сайта в настройках браузера."); }
  }
  function closeTransfer() { setTransferOpen(false); requestAnimationFrame(() => root.current?.querySelector<HTMLElement>('[data-compact-menu="tools"] > summary')?.focus()); }
  function editTransfer(field: EditorField) { setTransferOpen(false); chooseField(field, true); }
  const issues = applicable.filter(f => f.kind !== "signature" && (valueProblem(f,valueFor(f)) || (editorMode(f,scenario)==="write" && !valueFor(f).trim())));
  const expiryNotices = applicable.map(f => ({ field: f, warning: expiryWarning(f, valueFor(f), today) })).filter(item => item.warning);

  return (
    <div className={`${styles.editor} ${c.editor}`} ref={root} data-permesso-editor data-pinned-field={selectedId} data-scenario={scenario}>
      <header className={styles.intro}>
        <div><h1>Заполни Modulo 1 без спешки.</h1><p>Выбери строку на бланке. Подсказка скажет, что писать и что пропустить.</p></div>
      </header>
      <PermessoNavigation scenario={scenario} page={page} hints={hints} zoom={zoom} showExample={showExample}
        transferOpen={transferOpen} entered={entered} saved={savedSnapshot === JSON.stringify({ scenario, values })}
        onScenario={chooseScenario}
        onPage={nextPage => chooseField(nextPage <= 3 ? EDITOR_FIELDS.find(f => f.page === nextPage && editorMode(f, scenario) !== "empty")! : ALL_GUIDANCE_FIELDS.find(f => f.page === nextPage)!)}
        onSave={save} onRestore={restore} onClear={() => setClearConfirm(true)}
        onExample={() => setShowExample(!showExample)} onMyData={() => { setShowExample(false); requestAnimationFrame(() => inspector.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true })); }}
        onHints={setHints} onZoom={() => setZoom(zoom === 1 ? (window.matchMedia("(max-width: 600px)").matches ? 2.5 : 1.6) : 1)}
        onTransfer={() => setTransferOpen(true)} onReview={() => { setTransferOpen(false); setReview(true); requestAnimationFrame(() => reviewSection.current?.scrollIntoView({ block: "start", behavior: smooth() })); }} />
      {message && <p role="status" className={styles.notice}>{message}</p>}
      {clearConfirm && <div className={styles.confirm} role="group" aria-label="Подтверждение очистки"><span>Удалить введённые данные и сохранённую копию?</span><button type="button" onClick={clear}>Да, стереть</button><button type="button" onClick={() => setClearConfirm(false)}>Отмена</button></div>}
      <PermessoPaperTransfer key={scenario + ":" + transferEpoch} active={transferOpen} scenario={scenario} values={values} today={today} onClose={closeTransfer} onEdit={editTransfer} />
      <div hidden={transferOpen}>
        {onboarding.visible && <div className={z.onboarding}><span>Наведи на любую строку — скажу, писать или пропустить</span><button type="button" aria-label="Больше не показывать подсказку" onClick={onboarding.dismiss}>×</button></div>}
        {page>3 && <p className={z.scopeNote}>Эти страницы остаются в kit. Здесь показаны пропуски для студенческого сценария без семьи. Если он тебе не подходит, не используй эти подсказки как правила для семейного заявления.</p>}
        <div className={`${styles.workspace} ${z.workspace}`}>
          <div className={styles.document} data-fab-yield>
            <div className={styles.documentBar}><span>Mod. 209 · Modulo 1 · {page} / 8</span><a href={OFFICIAL_PDF + "#page=" + page} target="_blank" rel="noopener noreferrer">Сверить с PDF ↗</a></div>
            {active && !transferOpen && <PermessoPaperSheet key={page} page={page} selectedId={selectedId} values={values} scenario={scenario} hints={hints} zoom={zoom} showExample={showExample} onSelect={chooseField} onChange={(f,i,v)=>{setShowExample(false);changePart(f,i,v);}} onPaste={paste} onToggle={toggle} onEditLarge={editLarge} />}
            <div className={styles.documentFoot}>Основа — точный рендер официальной страницы. Поля и подсказки IITALY расположены поверх неё и не меняют печатный бланк.</div>
          </div>
          <aside className={`${styles.inspector} ${c.inspector}`} ref={inspector} data-fab-yield aria-label="Подсказка и ввод выбранного поля">
            <div className={styles.inspectorTop}><span>Стр. {page} · {shortId(selected)}</span><strong data-state={status}>{STATES[status]}</strong></div>
            <h2>{selected.meta.ru}</h2><p className={styles.italian}>{selected.meta.it}</p>
            <div className={c.answer}><AnswerSummary field={selected} answer={fieldAnswer(selected,scenario,currentValue,showExample)} detail/></div>
            <div className={styles.fieldEditor} key={selectedId}>
              {selected.kind === "signature" ? <p className={styles.caution}>Здесь будет подпись на бумаге. Ввод имени не является подписью. Момент подписания уточни по инструкции своего kit.</p>
                : status === "post" ? <p className={styles.caution}>Этот участок заполняется на почте. В режиме «Мои данные» ввод отключён.</p>
                : selected.readOnly || status === "empty" ? <p className={styles.caution}>По текущему сценарию поле не заполняется. Оно остаётся на оригинальном листе; подсказку можно прочитать здесь.</p>
                : selected.quick?.choices ? <div className={z.choiceSelect} role="group" aria-label={selected.meta.ru}>{selected.quick.choices.map(c=><label key={c.value}><input type="radio" name={"choice-"+selected.id} checked={currentValue===c.value} onChange={()=>patch(selected,c.value)}/><span>{c.value} — {c.label}</span></label>)}</div>
                : selected.kind === "check" ? <label className={styles.checkLabel}><input type="checkbox" checked={currentValue === "X"} onChange={() => toggle(selected)} />Поставить X в поле {selected.id}</label>
                : selected.kind === "radio" ? <fieldset className={styles.radioGroup}><legend>Выбери свой статус, без автоматической подстановки</legend>{["SI","NO"].map(option => <label key={option}><input type="radio" name="editor-refugee" value={option} checked={currentValue===option} onChange={() => toggle(selected,option)} />{option === "SI" ? "SI — да" : "NO — нет"}</label>)}</fieldset>
                : selected.kind === "split" ? selected.runs.map((r,i) => <label className={styles.editorLabel} key={i}><span>{r.label}</span><input aria-label={selected.meta.ru + ": " + r.label} value={getPart(selected,currentValue,i)} maxLength={r.count} onChange={e => changePart(selected,i,e.target.value)} autoComplete="off" spellCheck={false} /></label>)
                : <label className={styles.editorLabel}><span>{selected.kind === "date" ? "Дата — ДДММГГГГ" : "Твоё значение"}</span><input data-panel-input value={currentValue} aria-label={"Ввести: " + selected.meta.ru} aria-invalid={!!problem} aria-describedby="permesso-value-format permesso-value-error" maxLength={capacity(selected)} inputMode={selected.kind === "date" || selected.meta.kind === "number" ? "numeric" : "text"} autoComplete="off" spellCheck={false} placeholder={selected.kind === "date" ? "ДДММГГГГ" : selected.meta.ru} onPaste={e => { const text=normalize(selected,e.clipboardData.getData("text")); if(text.length>capacity(selected)){e.preventDefault();setMessage("Вставка длиннее поля. Данные не обрезаны и прежнее значение сохранено.");} }} onChange={e => patch(selected,normalize(selected,e.target.value))} /><small>{currentValue.length} / {capacity(selected)} {selected.kind === "line" ? "символов" : "клеток"}</small></label>}
            </div>
            {status === "verify" && <p className={styles.caution}>Значение можно записать в черновик, но перед переносом на бумагу уточни правило по своему kit / в Sportello Amico.</p>}
            <p id="permesso-value-error" className={styles.validation} role={problem ? "alert" : undefined}>{problem}</p>
            {!!expiry && <p className={styles.caution} data-editor-date-warning>{expiry}</p>}
            <div className={`${styles.fieldNav} ${c.fieldNav}`}><button type="button" onClick={() => go(-1)} disabled={!previousField}>Назад</button><span>{Math.max(1,applicable.indexOf(selected)+1)} / {applicable.length}</span><button type="button" data-next-field onClick={() => go(1)}>{nextField ? "Дальше →" : "К проверке →"}</button></div>
            <p className={c.nextHint}>{nextField ? `Дальше: ${nextField.meta.ru}` : "Дальше: проверка черновика."}</p>
            <details className={c.details}><summary>Откуда взять и как не ошибиться</summary><dl className={styles.explanation}><div><dt>{status === "empty" ? "Почему пропустить" : "Откуда взять"}</dt><dd>{selected.meta.source}</dd></div><div id="permesso-value-format"><dt>Как писать</dt><dd>{selected.kind === "date" ? "Две цифры дня, две месяца, четыре года. Разделители уже есть на оригинальном бланке." : selected.kind === "split" ? "Заполняй части отдельно, как подписано на бумаге. Разделитель / уже напечатан." : selected.meta.format}</dd></div><div><dt>Не перепутай</dt><dd>{selected.meta.mistake}</dd></div></dl></details>
            <details className={styles.fieldJump}><summary>Перейти к полю на странице {page}</summary><div>{ALL_GUIDANCE_FIELDS.filter(f => f.page===page).map(f => <button type="button" key={f.id} onClick={() => chooseField(f,true)}>{shortId(f)} · {f.meta.ru}</button>)}</div></details>
          </aside>
        </div>
        <section ref={reviewSection} className={styles.reviewSection} aria-label="Проверка черновика"><button type="button" className={styles.reviewToggle} aria-expanded={review} onClick={() => setReview(!review)}>Проверить черновик <span>{review ? "−" : "+"}</span></button>{review && <div className={styles.reviewBody}><h2>Перед переносом на бумагу</h2><p>Это проверка заполненности и формата, не юридическая проверка документов или готовности заявления.</p>{issues.length ? <ul>{issues.map(f => <li key={f.id}><button type="button" onClick={() => chooseField(f,true)}><b>Стр. {f.page} · {shortId(f)} — {f.meta.ru}</b><span>{valueProblem(f,valueFor(f)) || "Пока не заполнено"}</span></button></li>)}</ul> : <p>В проверяемых полях нет пропусков или ошибок формата. Это не подтверждает правильность сведений.</p>}{!!expiryNotices.length && <ul data-review-date-warnings>{expiryNotices.map(item => <li key={item.field.id}><button type="button" onClick={() => chooseField(item.field,true)}><b>{shortId(item.field)} · проверить срок документа</b><span>{item.warning}</span></button></li>)}</ul>}<p>Отдельно сверь поля «Сначала уточни», набор приложений и порядок подписания. Страницы 4–8 находятся в оригинальном PDF; семейные и другие специальные случаи не охвачены этим студенческим сценарием.</p></div>}</section>
      </div>
    </div>
  );
}
