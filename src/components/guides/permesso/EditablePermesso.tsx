"use client";

import { useRef, useState, type CSSProperties, type ClipboardEvent } from "react";
import { type PermessoScenario } from "./permessoData";
import {
  EDITOR_FIELDS, ORIGINAL_PAGES, OFFICIAL_PDF, PAPER,
  capacity, editorMode, fieldWidth, getPart, setPart, normalize, valueProblem,
  type EditorField, type CellRun,
} from "./permessoOriginalGeometry";
import styles from "./permesso-editor.module.css";

type Draft = Record<string, string>;
const STORAGE_KEY = "iitaly:permesso-paper-editor:v1";
const STATES = { write: "Заполняй", empty: "В этом сценарии — пропусти", ifExists: "Если есть", recommended: "Необязательно", verify: "Сначала уточни", post: "На почте" };
const isNumber = (id: string) => /^\d+$/.test(id);
const shortId = (f: EditorField) => isNumber(f.id) ? `Поле ${f.id}` : "Шапка бланка";
const getLabel = (f: EditorField, i: number) => `${shortId(f)}. ${f.meta.ru}${f.runs.length > 1 ? ". " + (f.runs[i].label || `Часть ${i+1}`) : ""}`;
const smooth = (): ScrollBehavior => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export function EditablePermesso() {
  const [scenario, setScenario] = useState<PermessoScenario>("rilascio");
  const [values, setValues] = useState<Draft>({});
  const [selectedId, setSelectedId] = useState("questore");
  const [hints, setHints] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState("");
  const [review, setReview] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const inspector = useRef<HTMLElement>(null);
  const selected = EDITOR_FIELDS.find(f => f.id === selectedId) || EDITOR_FIELDS[0];
  const page = selected.page;
  const status = editorMode(selected, scenario);
  const applicable = EDITOR_FIELDS.filter(f => editorMode(f,scenario) !== "empty");
  const selectedIndex = applicable.findIndex(f => f.id === selectedId);
  const currentValue = valueFor(selected);
  const problem = valueProblem(selected, currentValue);
  const entered = applicable.filter(f => !["8","9"].includes(f.id) && Boolean(values[f.id]?.replace(/[\s/]/g,""))).length;
  const nextField = applicable[selectedIndex + 1];

  function valueFor(f: EditorField) {
    if (f.id === "8") return scenario === "rilascio" ? "X" : "";
    if (f.id === "9") return scenario === "rinnovo" ? "X" : "";
    return editorMode(f,scenario) === "empty" ? "" : values[f.id] || "";
  }
  function patch(f: EditorField, next: string) {
    setMessage("");
    setValues(previous => {
      const result = { ...previous, [f.id]: next };
      if (next === "X" && f.id === "52") result["53"] = "";
      if (next === "X" && f.id === "53") result["52"] = "";
      return result;
    });
  }
  function chooseScenario(next: PermessoScenario) {
    setScenario(next);
    setMessage("Сценарий изменён. Введённые значения сохранены; неприменимые поля не показываются заполненными.");
    if (editorMode(selected,next) === "empty") {
      setSelectedId(EDITOR_FIELDS.find(f => f.page === page && editorMode(f,next) !== "empty")?.id || "questore");
    }
  }
  function chooseField(f: EditorField, focus = false) {
    setSelectedId(f.id);
    setReview(false);
    if (focus) requestAnimationFrame(() => {
      const mobile = window.matchMedia("(max-width: 900px)").matches;
      const target = mobile
        ? inspector.current?.querySelector<HTMLElement>("input, textarea, select, [data-next-field]")
        : root.current?.querySelector<HTMLElement>(`[data-editor-field="${f.id}"][data-part="0"] input, [data-editor-field="${f.id}"][data-part="0"] button`);
      target?.focus({ preventScroll: true });
      (mobile ? inspector.current : target)?.scrollIntoView({ block: "nearest", behavior: smooth() });
    });
  }
  function go(delta: number) {
    const index = EDITOR_FIELDS.indexOf(selected);
    const target = delta > 0
      ? applicable.find(f => EDITOR_FIELDS.indexOf(f) > index)
      : [...applicable].reverse().find(f => EDITOR_FIELDS.indexOf(f) < index);
    if (target) chooseField(target,true);
    else if (delta > 0) setReview(true);
  }
  function changePart(f: EditorField, part: number, input: string) {
    const next = normalize(f,input);
    const limit = f.kind === "line" ? 70 : f.runs[part].count;
    if (next.length > limit) {
      setMessage("В этой части не хватает клеток. Данные не обрезаны: используй полное поле в подсказке."); return;
    }
    patch(f,setPart(f,values[f.id] || "",part,next));
  }
  function paste(f: EditorField, part: number, event: ClipboardEvent<HTMLInputElement>) {
    const text = normalize(f,event.clipboardData.getData("text"));
    event.preventDefault();
    if (f.kind === "split") {
      if (text.includes("/")) {
        if (valueProblem(f,text)) setMessage("Вставка не помещается. Проверь префикс и номер отдельно; прежнее значение сохранено.");
        else patch(f,text);
      } else changePart(f,part,text);
      return;
    }
    const offset = f.kind === "line" ? 0 : f.runs.slice(0,part).reduce((n,r) => n+r.count,0);
    if (offset + text.length > capacity(f)) {
      setMessage("Вставка длиннее поля. Прежние данные сохранены: ничего не обрезано."); return;
    }
    const previous = values[f.id] || "";
    patch(f,(previous.padEnd(offset," ").slice(0,offset) + text + previous.slice(offset+text.length)).trimEnd());
  }
  function toggle(f: EditorField, option?: string) {
    if (f.id === "8" || f.id === "9") { chooseScenario(f.id === "8" ? "rilascio" : "rinnovo"); return; }
    if (editorMode(f,scenario) === "empty" || f.kind === "signature") { chooseField(f); return; }
    patch(f, option ? (values[f.id] === option ? "" : option) : (values[f.id] === "X" ? "" : "X"));
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY,JSON.stringify({ version: 1, scenario, values }));
      setMessage("Снимок черновика сохранён в этом браузере. После новых изменений нажми «Сохранить» ещё раз.");
    } catch { setMessage("Браузер не разрешил сохранение. В открытой вкладке данные остаются доступны."); }
  }
  function restore() {
    try {
      const text = localStorage.getItem(STORAGE_KEY);
      if (!text) { setMessage("В этом браузере пока нет сохранённого черновика."); return; }
      const saved: unknown = JSON.parse(text);
      if (!saved || typeof saved !== "object" || !("version" in saved) || saved.version !== 1 || !("values" in saved) || !saved.values || typeof saved.values !== "object") throw new Error("Invalid draft");
      const restored: Draft = {};
      for (const f of EDITOR_FIELDS) {
        const value = (saved.values as Record<string,unknown>)[f.id];
        if (typeof value === "string" && value.length <= 256) restored[f.id] = value;
      }
      setValues(restored);
      setScenario("scenario" in saved && saved.scenario === "rinnovo" ? "rinnovo" : "rilascio");
      setMessage("Сохранённый черновик восстановлен.");
    } catch { setMessage("Не удалось прочитать черновик. Текущие данные не изменены."); }
  }
  function clear() {
    setValues({}); setClearConfirm(false); setReview(false);
    try { localStorage.removeItem(STORAGE_KEY); setMessage("Черновик удалён из этой вкладки и памяти браузера."); }
    catch { setMessage("Вкладка очищена. Браузер не разрешил удалить сохранённую копию — очисти данные сайта в настройках браузера."); }
  }
  const issues = applicable.filter(f => f.kind !== "signature" && (valueProblem(f,valueFor(f)) || (editorMode(f,scenario)==="write" && !valueFor(f).trim())));

  return (
    <div className={styles.editor} ref={root} data-permesso-editor>
      <header className={styles.intro}>
        <div><h1>Тот же бланк. Теперь можно заполнять.</h1><p>Нажми на поле на листе: рядом появится пояснение. Ввод остаётся в своей клетке, а «Дальше» ведёт по форме.</p></div>
        <p className={styles.scope}>Учебный черновик для первого студенческого ВНЖ или продления. Заполняем страницы 1–3. Полный восьмистраничный документ остаётся во вкладке «Оригинал».</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.scenarios} role="group" aria-label="Сценарий электронного бланка">
          <button type="button" aria-pressed={scenario === "rilascio"} onClick={() => chooseScenario("rilascio")}>Первое ВНЖ <small>Rilascio</small></button>
          <button type="button" aria-pressed={scenario === "rinnovo"} onClick={() => chooseScenario("rinnovo")}>Продление <small>Rinnovo</small></button>
        </div>
        <div className={styles.draftActions}>
          <button type="button" onClick={save}>Сохранить</button>
          <button type="button" onClick={restore}>Восстановить</button>
          <button type="button" onClick={() => setClearConfirm(true)}>Стереть</button>
        </div>
      </div>
      <div className={styles.privacy}><span>Без отправки данных на сервер. «Сохранить» оставляет копию на этом устройстве — не используй на общем компьютере.</span><span>Введено полей: {entered}</span></div>
      {message && <p role="status" className={styles.notice}>{message}</p>}
      {clearConfirm && <div className={styles.confirm} role="group" aria-label="Подтверждение очистки"><span>Удалить введённые данные и сохранённую копию?</span><button type="button" onClick={clear}>Да, стереть</button><button type="button" onClick={() => setClearConfirm(false)}>Отмена</button></div>}

      <div className={styles.pagebar}>
        <nav aria-label="Страницы электронного бланка" className={styles.pageTabs}>
          {ORIGINAL_PAGES.map(p => <button type="button" key={p.page} aria-current={page===p.page ? "page" : undefined} onClick={() => chooseField(EDITOR_FIELDS.find(f => f.page===p.page && editorMode(f,scenario)!=="empty")!)}><b>{p.page}</b><span>{p.title}</span></button>)}
        </nav>
        <div className={styles.viewTools}>
          <label><input type="checkbox" checked={hints} onChange={e => setHints(e.target.checked)} />Подсказки на листе</label>
          <button type="button" aria-pressed={zoom>1} onClick={() => setZoom(zoom===1 ? 1.6 : 1)}>{zoom===1 ? "Увеличить лист" : "Вместить лист"}</button>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.document}>
          <div className={styles.documentBar}><span>Mod. 209 · Modulo 1 · {page} / 8</span><a href={OFFICIAL_PDF + "#page=" + page} target="_blank" rel="noopener noreferrer">Сверить с PDF ↗</a></div>
          <PaperSheet key={page} page={page} selectedId={selectedId} values={values} scenario={scenario} hints={hints} zoom={zoom} onSelect={chooseField} onChange={changePart} onPaste={paste} onToggle={toggle} />
          <div className={styles.documentFoot}>Основа — точный рендер официальной страницы. Поля и подсказки IITALY расположены поверх неё и не меняют печатный бланк.</div>
        </div>

        <aside className={styles.inspector} ref={inspector} data-fab-yield aria-label="Подсказка и ввод выбранного поля">
          <div className={styles.inspectorTop}><span>Стр. {page} · {shortId(selected)}</span><strong data-state={status}>{STATES[status]}</strong></div>
          <h2>{selected.meta.ru}</h2><p className={styles.italian}>{selected.meta.it}</p>
          <div className={styles.fieldEditor} key={selectedId}>
            {selected.kind === "signature" ? <p className={styles.caution}>Здесь будет подпись на бумаге. Ввод имени не является подписью. Момент подписания уточни по инструкции своего kit.</p>
              : status === "empty" ? <p className={styles.caution}>По текущему сценарию поле не заполняется. Оно остаётся на оригинальном листе; подсказку можно прочитать здесь.</p>
              : selected.kind === "check" ? <label className={styles.checkLabel}><input type="checkbox" checked={currentValue === "X"} onChange={() => toggle(selected)} />Поставить X в поле {selected.id}</label>
              : selected.kind === "radio" ? <fieldset className={styles.radioGroup}><legend>Выбери свой статус, без автоматической подстановки</legend>{["SI","NO"].map(option => <label key={option}><input type="radio" name="editor-refugee" value={option} checked={currentValue===option} onChange={() => toggle(selected,option)} />{option === "SI" ? "SI — да" : "NO — нет"}</label>)}</fieldset>
              : selected.kind === "split" ? selected.runs.map((r,i) => <label className={styles.editorLabel} key={i}><span>{r.label}</span><input aria-label={selected.meta.ru + ": " + r.label} value={getPart(selected,currentValue,i)} maxLength={r.count} onChange={e => changePart(selected,i,e.target.value)} autoComplete="off" spellCheck={false} /></label>)
              : <label className={styles.editorLabel}><span>{selected.kind === "date" ? "Дата — ДДММГГГГ" : "Твоё значение"}</span><input data-panel-input value={currentValue} aria-label={"Ввести: " + selected.meta.ru} aria-invalid={!!problem} aria-describedby="permesso-value-format permesso-value-error" maxLength={capacity(selected)} inputMode={selected.kind === "date" || selected.meta.kind === "number" ? "numeric" : "text"} autoComplete="off" spellCheck={false} placeholder={selected.kind === "date" ? "ДДММГГГГ" : selected.meta.ru} onPaste={e => {
                const text = normalize(selected,e.clipboardData.getData("text"));
                if (text.length>capacity(selected)) { e.preventDefault(); setMessage("Вставка длиннее поля. Данные не обрезаны и прежнее значение сохранено."); }
              }} onChange={e => patch(selected,normalize(selected,e.target.value))} /><small>{currentValue.length} / {capacity(selected)} {selected.kind === "line" ? "символов" : "клеток"}</small></label>}
          </div>
          {status === "verify" && <p className={styles.caution}>Значение можно записать в черновик, но перед переносом на бумагу уточни правило по своему kit / в Sportello Amico.</p>}
          <p id="permesso-value-error" className={styles.validation} role={problem ? "alert" : undefined}>{problem}</p>
          <dl className={styles.explanation}>
            <div><dt>{status === "empty" ? "Почему пропустить" : "Откуда взять"}</dt><dd>{selected.meta.source}</dd></div>
            <div id="permesso-value-format"><dt>Как писать</dt><dd>{selected.kind === "date" ? "Две цифры дня, две месяца, четыре года. Разделители уже есть на оригинальном бланке." : selected.kind === "split" ? "Заполняй части отдельно, как подписано на бумаге. Разделитель / уже напечатан." : selected.meta.format}</dd></div>
            <div><dt>Не перепутай</dt><dd>{selected.meta.mistake}</dd></div>
          </dl>
          <div className={styles.fieldNav}><button type="button" onClick={() => go(-1)} disabled={selectedId === applicable[0]?.id}>Назад</button><button type="button" data-next-field onClick={() => go(1)}>{nextField ? "Дальше →" : "К проверке →"}</button></div>
          <p className={styles.upNext}>{nextField ? `Дальше: ${shortId(nextField)} — ${nextField.meta.ru}` : "Дальше: обзор черновика перед переносом на бумагу."}</p>
          <details className={styles.fieldJump}><summary>Перейти к полю на странице {page}</summary><div>{EDITOR_FIELDS.filter(f => f.page===page).map(f => <button type="button" key={f.id} onClick={() => chooseField(f,true)}>{shortId(f)} · {f.meta.ru}</button>)}</div></details>
        </aside>
      </div>

      <section className={styles.reviewSection} aria-label="Проверка черновика">
        <button type="button" className={styles.reviewToggle} aria-expanded={review} onClick={() => setReview(!review)}>Проверить черновик <span>{review ? "−" : "+"}</span></button>
        {review && <div className={styles.reviewBody}><h2>Перед переносом на бумагу</h2><p>Это проверка заполненности и формата, не юридическая проверка документов или готовности заявления.</p>{issues.length ? <ul>{issues.map(f => <li key={f.id}><button type="button" onClick={() => chooseField(f,true)}><b>Стр. {f.page} · {shortId(f)} — {f.meta.ru}</b><span>{valueProblem(f,valueFor(f)) || "Пока не заполнено"}</span></button></li>)}</ul> : <p>В проверяемых полях нет пропусков или ошибок формата. Это не подтверждает правильность сведений.</p>}<p>Отдельно сверь поля «Сначала уточни», набор приложений и порядок подписания. Страницы 4–8 находятся в оригинальном PDF; семейные и другие специальные случаи не охвачены этим студенческим сценарием.</p></div>}
      </section>
    </div>
  );
}

function runStyle(r: CellRun): CSSProperties {
  return { left: `${r.x / PAPER.width * 100}%`, top: `${r.y / PAPER.height * 100}%`, width: `${fieldWidth(r) / PAPER.width * 100}%`, height: `${r.height / PAPER.height * 100}%`, "--cell-pitch": `${r.pitch / PAPER.width * 100}cqw`, "--cell-pad": `${(r.cell - 7.2)/2/PAPER.width*100}cqw` } as CSSProperties;
}

type SheetProps = {
  page: number; selectedId: string; values: Draft; scenario: PermessoScenario; hints: boolean; zoom: number;
  onSelect: (f: EditorField) => void; onChange: (f: EditorField, part: number, input: string) => void;
  onPaste: (f: EditorField, part: number, event: ClipboardEvent<HTMLInputElement>) => void;
  onToggle: (f: EditorField, option?: string) => void;
};
function PaperSheet({ page, selectedId, values, scenario, hints, zoom, onSelect, onChange, onPaste, onToggle }: SheetProps) {
  const [ready,setReady] = useState(false);
  const [failed,setFailed] = useState(false);
  const [retry,setRetry] = useState(0);
  const asset=ORIGINAL_PAGES[page-1];
  return <div className={styles.sheetViewport} tabIndex={0} aria-label="Лист: при увеличении можно прокручивать" data-sheet-viewport>
    <div className={styles.sheet} style={{ width: `${zoom*100}%` }} data-sheet-page={page} data-ready={ready}>
      {/* eslint-disable-next-line @next/next/no-img-element -- lossless official rendering; no resizing/cropping by an optimizer */}
      <img key={retry} className={styles.background} src={asset.url} width={1785} height={2526} alt="" aria-hidden="true" referrerPolicy="no-referrer" onLoad={() => {setReady(true);setFailed(false);}} onError={() => {setFailed(true);setReady(false);}} />
      {!ready && <div className={styles.loading} role="status">{failed ? <><p>Не удалось загрузить основу бланка. Поля скрыты, чтобы не показывать их без оригинала.</p><button type="button" onClick={() => {setFailed(false);setRetry(retry+1);}}>Повторить загрузку</button><a href={OFFICIAL_PDF} target="_blank" rel="noopener noreferrer">Открыть PDF</a></> : "Загружаю оригинальный лист…"}</div>}
      {ready && EDITOR_FIELDS.filter(f => f.page===page).map(f => {
        const mode=editorMode(f,scenario);
        const value=f.id==="8" ? (scenario==="rilascio" ? "X":"") : f.id==="9" ? (scenario==="rinnovo" ? "X":"") : mode==="empty" ? "" : values[f.id] || "";
        const locked=mode==="empty" && !["8","9"].includes(f.id);
        return f.runs.map((r,i) => {
          const part=getPart(f,value,i);
          const selected=f.id===selectedId;
          const checkbox=f.kind==="check" || f.kind==="radio";
          const checked=f.kind==="radio" ? value===r.label : value==="X";
          const prompt=f.kind==="date" ? ["ДД","ММ","ГГГГ"][i] : f.runs.length>1 && i>0 ? (r.label || "Продолжение") : f.meta.ru;
          return <div key={f.id+":"+i} className={styles.overlay} style={runStyle(r)} data-editor-field={f.id} data-part={i} data-selected={selected} data-locked={locked} data-state={mode}>
            {checkbox || f.kind==="signature" || locked ? <button type="button" className={styles.mark} aria-label={getLabel(f,i) + (f.kind==="radio" ? ": "+r.label : "")} aria-pressed={checkbox ? checked : undefined} onFocus={() => onSelect(f)} onClick={() => {onSelect(f);onToggle(f,f.kind==="radio" ? r.label : undefined);}}>{checkbox && checked ? "X" : f.kind==="signature" && hints ? "Подпись — на бумаге" : locked && hints && i===0 && r.count>4 ? "В этом сценарии пропусти" : ""}</button>
              : <>
                <input className={f.kind==="line" ? styles.lineInput : styles.paperInput} aria-label={getLabel(f,i)} aria-describedby={selected ? "permesso-value-format permesso-value-error" : undefined} aria-invalid={!!valueProblem(f,value)} value={part} maxLength={f.kind==="line" ? 70 : r.count} inputMode={f.kind==="date" || f.meta.kind==="number" ? "numeric":"text"} autoComplete="off" spellCheck={false} placeholder={hints ? prompt : ""} onFocus={() => onSelect(f)} onChange={e => onChange(f,i,e.target.value)} onPaste={e => onPaste(f,i,e)} onKeyDown={e => {
                  if (e.key==="Enter") { e.preventDefault(); const inputs=e.currentTarget.closest("[data-sheet-page]")?.querySelectorAll<HTMLInputElement>("input"); if(inputs){const a=Array.from(inputs),n=a.indexOf(e.currentTarget);a[n+1]?.focus();} }
                }} />
                {f.kind!=="line" && <div className={styles.glyphs} aria-hidden="true">{Array.from(part).map((char,k) => <span key={k} style={{left:`${(k*r.pitch+r.cell/2)/fieldWidth(r)*100}%`}}>{char}</span>)}</div>}
              </>}
          </div>;
        });
      })}
    </div>
  </div>;
}
