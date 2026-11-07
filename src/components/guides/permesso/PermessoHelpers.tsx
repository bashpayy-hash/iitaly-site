"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { COUNTRY_CODES, PERMIT_CODES, PROVINCES, TRAINER_SECTIONS } from "./permessoData";
import { rememberWorker, rememberedWorker, setPermessoParam, usePermessoRoute } from "./usePermessoRoute";
import { PERMESSO_TOOLS, PermessoReferenceFrame, type PermessoToolId } from "./PermessoSections";
import styles from "./permesso-helpers.module.css";
import disclosure from "@/components/ui/disclosure.module.css";

/* Справочники Modulo 1 — каждый на своей странице (owner, 7 Nov: «слишком
   много информации… разбить по блокам, или даже на другие сайты»).
   Раньше обе части шли под бланком одной простынёй: четыре инструмента и три
   чек-листа подряд. Теперь «Коды и расчёты» показывают один инструмент за
   раз (вкладки), «Перед почтой» — три отдельных блока. Сценарий берётся из
   адреса — тот же, что выбран над бланком. Ничего не переносится в черновик
   автоматически. */

const COPY_KEYS = [
  ["passport", "Паспорт: нужные страницы + виза + штампы"],
  ["permit", "Текущий permesso, лицо и оборот"],
  ["fiscal", "Codice fiscale, если есть"],
  ["insurance", "Страховка"],
  ["enrollment", "Зачисление / выписка экзаменов"],
  ["funds", "Подтверждение денег"],
  ["housing", "Жильё, если просит твоя Questura"],
] as const;

function padTwo(n: number) {
  return String(Math.max(0, Math.min(99, n))).padStart(2, "0");
}

export function PermessoCodes() {
  const { scenario, search } = usePermessoRoute();
  const requested = new URLSearchParams(search).get("tool");
  const active: PermessoToolId = PERMESSO_TOOLS.find(tool => tool.id === requested)?.id ?? "16";
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [requestCode, setRequestCode] = useState("");
  const [currentCardCode, setCurrentCardCode] = useState("");
  const [worker, setWorker] = useState(rememberedWorker);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [copies, setCopies] = useState<Record<string, string>>({
    passport: "", permit: "", fiscal: "", insurance: "", enrollment: "", funds: "", housing: "", module2: "",
  });

  let extraSheets = 0;
  for (const [key] of COPY_KEYS) {
    if (key === "permit" && scenario !== "rinnovo") continue;
    extraSheets += Number(copies[key] || 0);
  }
  if (worker) extraSheets += Number(copies.module2 || 0);

  const filteredProvinces = useMemo(() => {
    const q = provinceQuery.trim().toLowerCase();
    if (!q) return PROVINCES.slice(0, 8);
    return PROVINCES.filter(([code, city]) => code.toLowerCase().includes(q) || city.toLowerCase().includes(q)).slice(0, 10);
  }, [provinceQuery]);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return COUNTRY_CODES.slice(0, 8);
    return COUNTRY_CODES.filter(([code, country]) => code.toLowerCase().includes(q) || country.toLowerCase().includes(q)).slice(0, 10);
  }, [countryQuery]);

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = PERMESSO_TOOLS.length - 1;
    const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (next < 0) return;
    event.preventDefault();
    setPermessoParam("tool", PERMESSO_TOOLS[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <PermessoReferenceFrame section="kody" title="Коды и расчёты" lead="Используй только там, где бумажный kit требует код или число. Ничего не переносится автоматически.">
      <div className={styles.toolLayout} id="helpers">
        <div className={styles.tabs} role="tablist" aria-label="Справочники Modulo 1">
          {PERMESSO_TOOLS.map((tool, index) => (
            <button key={tool.id} ref={node => { tabs.current[index] = node; }} type="button" role="tab" id={`permesso-tool-${tool.id}`} aria-controls={`permesso-panel-${tool.id}`} aria-selected={active === tool.id} tabIndex={active === tool.id ? 0 : -1} onClick={() => setPermessoParam("tool", tool.id)} onKeyDown={event => onTabKey(event, index)}>{tool.title}</button>
          ))}
        </div>

        <section role="tabpanel" id="permesso-panel-16" aria-labelledby="permesso-tool-16" hidden={active !== "16"} className={styles.panel}>
          <h2>Код в поле 16</h2>
          <p>Не подставляем 24 или 31 автоматически. Выбери только после сверки с типом обучения и своим kit.</p>
          <select aria-label="Код типа обучения для поля 16" value={requestCode} onChange={(e) => setRequestCode(e.target.value)}>
            <option value="">Выбери код</option>
            {PERMIT_CODES.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.title}</option>)}
          </select>
          {requestCode && <p className={styles.note}>{PERMIT_CODES.find((item) => item.code === requestCode)?.note}</p>}
          {scenario === "rinnovo" && (
            <>
              <label htmlFor="current-card-code" className={styles.smallLabel}>Код на текущей карточке для поля 19</label>
              <select id="current-card-code" value={currentCardCode} onChange={(e) => setCurrentCardCode(e.target.value)}>
                <option value="">Совпадает / пока не выбрано</option>
                {PERMIT_CODES.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
              </select>
            </>
          )}
          <p className={styles.note}>После диплома поиск работы = код 30 и обычно Modulo 2. Этот сценарий здесь не рисуем.</p>
        </section>

        <section role="tabpanel" id="permesso-panel-25" aria-labelledby="permesso-tool-25" hidden={active !== "25"} className={styles.panel}>
          <h2>Поле 25 · сколько листов</h2>
          <p>8 страниц Modulo 1 + реальные листы A4, которые кладёшь в конверт.</p>
          <div className={styles.copyList}>
            {COPY_KEYS.map(([key, label]) => {
              if (key === "permit" && scenario !== "rinnovo") return null;
              return (
                <label key={key}>
                  <span>{label}</span>
                  <input inputMode="numeric" min="0" max="40" type="number" value={copies[key]} placeholder="0" onChange={(e) => setCopies((prev) => ({ ...prev, [key]: e.target.value }))} />
                </label>
              );
            })}
          </div>
          <label className={styles.workerToggle}>
            <input type="checkbox" checked={worker} onChange={(e) => { setWorker(e.target.checked); rememberWorker(e.target.checked); }} />
            <span>Я официально работаю и кладу Modulo 2</span>
          </label>
          {worker && (
            <label className={styles.module2Pages}>
              <span>Физические листы Modulo 2</span>
              <input inputMode="numeric" min="0" max="20" type="number" value={copies.module2} placeholder="0" onChange={(e) => setCopies((prev) => ({ ...prev, module2: e.target.value }))} />
            </label>
          )}
          <div className={styles.total}><span>Ориентир для поля 25 · проверь перед переносом</span><strong>{padTwo(8 + extraSheets)}</strong></div>
        </section>

        <section role="tabpanel" id="permesso-panel-sigla" aria-labelledby="permesso-tool-sigla" hidden={active !== "sigla"} className={styles.panel}>
          <h2>Сигла провинции</h2>
          <input type="search" aria-label="Город или сигла провинции" value={provinceQuery} onChange={(e) => setProvinceQuery(e.target.value)} placeholder="Milano, Firenze или MI…" />
          <div className={styles.lookupList}>
            {filteredProvinces.map(([code, city]) => <button type="button" key={code} onClick={() => setProvinceQuery(code)}><b>{code}</b><span>{city}</span></button>)}
          </div>
          <p className={styles.note}>Если города нет: открой Tabella 1 бумажного kit. Не угадывай код.</p>
        </section>

        <section role="tabpanel" id="permesso-panel-paese" aria-labelledby="permesso-tool-paese" hidden={active !== "paese"} className={styles.panel}>
          <h2>Код страны</h2>
          <input type="search" aria-label="Страна или код страны" value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} placeholder="Казахстан, KAZ…" />
          <div className={styles.lookupList}>
            {filteredCountries.map(([code, country]) => <button type="button" key={code} onClick={() => setCountryQuery(code)}><b>{code}</b><span>{country}</span></button>)}
          </div>
          <p className={styles.note}>Поля 35 и 36 независимы. Если Tabella 3 твоего kit показывает другое — используй kit.</p>
        </section>
      </div>
    </PermessoReferenceFrame>
  );
}

export function PermessoPoste() {
  const { scenario } = usePermessoRoute();
  const [worker] = useState(rememberedWorker);
  // Поле 24 пустое, пока человек не отметил, что работает и кладёт Modulo 2.
  const emptyFields = TRAINER_SECTIONS.flatMap((section) => section.fields)
    .filter((item) => (item.number === "24" ? !worker : item.mode[scenario] === "empty"))
    .map((item) => item.number);

  return (
    <PermessoReferenceFrame section="pochta" title="Перед почтой" lead="Последняя проверка перед Sportello Amico: бумага, документы и расходы.">
      <div className={styles.checklistGrid} id="before-poste">
        <Checklist title="На бумаге" items={[
          "Печатные ЗАГЛАВНЫЕ латиницей.",
          "Чёрная ручка, один символ в клетке.",
          "X, а не галочка и не заливка.",
          "Слэши в датах уже напечатаны.",
          "Ошибся — лучше взять чистый бланк; корректор не использовать.",
          "Не заклеивай конверт заранее.",
        ]} />
        <Checklist title={scenario === "rilascio" ? "Для первого ВНЖ" : "Для продления"} items={scenario === "rilascio" ? [
          "Подать в течение 8 дней после въезда.",
          "Копии паспорта, визы и штампа въезда.",
          "Документ о зачислении, который использовался для визы.",
          "Страховка на срок будущего permesso.",
        ] : [
          "Копия текущего permesso с двух сторон.",
          "Документ о продолжении обучения / экзаменах — по правилам твоего типа permesso.",
          "Страховка на новый срок.",
          "Подтверждение финансовых средств.",
        ]} />
        <Checklist title="Деньги" items={[
          "Marca da bollo: €16.",
          "Poste за приём kit: €30.",
          "Производство электронной карточки: €30,46.",
          "Дополнительный contributo зависит от длительности / типа permesso — сверить перед визитом.",
        ]} />
      </div>

      <div className={styles.sources}>
        <b>Проверяй перед походом:</b>
        <a href="https://www.poste.it/guida-rilascio-e-rinnovo-permesso-di-soggiorno" target="_blank" rel="noopener noreferrer">Poste Italiane</a>
        <a href="https://www.portaleimmigrazione.it/ITA/tabelleCosti.html" target="_blank" rel="noopener noreferrer">Portale Immigrazione · costi</a>
        <a href="https://www.portaleimmigrazione.it/ITA/tabellauffpostali.html" target="_blank" rel="noopener noreferrer">Portale Immigrazione · codici</a>
      </div>

      <details className={styles.cheatSheet}>
        <summary className={disclosure.row}>Шпаргалка: что оставить пустым в сценарии {scenario === "rilascio" ? "RILASCIO" : "RINNOVO"}</summary>
        <p>Поля / блоки: {emptyFields.join(", ")}. Страницы 4–8 также не заполняй в сценарии студента без семьи.</p>
        <small>Это учебная шпаргалка, а не замена foglio note бумажного kit.</small>
      </details>
    </PermessoReferenceFrame>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <section className={styles.checklist}>
      <h2>{title}</h2>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}
