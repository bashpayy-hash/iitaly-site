"use client";

import { useMemo, useState } from "react";
import {
  COUNTRY_CODES,
  PERMIT_CODES,
  PROVINCES,
  TRAINER_SECTIONS,
  type FieldMode,
  type PermessoScenario,
  type TrainerField,
} from "./permessoData";
import styles from "./permesso-trainer.module.css";

const MODE_LABEL: Record<FieldMode, string> = {
  write: "ПИШИ",
  empty: "ОСТАВЬ ПУСТЫМ",
  post: "ТОЛЬКО НА ПОЧТЕ",
  optional: "ЕСЛИ ЕСТЬ / ЖЕЛАТЕЛЬНО",
};

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

export function PermessoTrainer() {
  const [scenario, setScenario] = useState<PermessoScenario>("rilascio");
  const [showExample, setShowExample] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [selected, setSelected] = useState<TrainerField>(TRAINER_SECTIONS[0].fields[0]);
  const [requestCode, setRequestCode] = useState("");
  const [currentCardCode, setCurrentCardCode] = useState("");
  const [worker, setWorker] = useState(false);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [copies, setCopies] = useState<Record<string, string>>({
    passport: "", permit: "", fiscal: "", insurance: "", enrollment: "", funds: "", housing: "", module2: "",
  });

  const extraSheets = useMemo(() => {
    let total = 0;
    for (const [key] of COPY_KEYS) {
      if (key === "permit" && scenario !== "rinnovo") continue;
      total += Number(copies[key] || 0);
    }
    if (worker) total += Number(copies.module2 || 0);
    return total;
  }, [copies, scenario, worker]);

  const sheetTotal = 8 + extraSheets;

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

  function modeFor(field: TrainerField): FieldMode {
    if (field.number === "24") return worker ? "write" : "empty";
    return field.mode[scenario];
  }

  function exampleFor(field: TrainerField): string {
    if (field.number === "16") return requestCode;
    if (field.number === "19") return currentCardCode || requestCode;
    if (field.number === "22") return worker ? "02" : "01";
    if (field.number === "24") return worker ? "X" : "";
    if (field.number === "25") return padTwo(sheetTotal);
    return field.example?.[scenario] || "";
  }

  function moveSection(delta: number) {
    const next = Math.max(0, Math.min(TRAINER_SECTIONS.length - 1, activeSection + delta));
    setActiveSection(next);
    const first = TRAINER_SECTIONS[next].fields[0];
    if (first) setSelected(first);
    requestAnimationFrame(() => document.getElementById("modulo-sheet")?.scrollIntoView({ block: "start", behavior: "smooth" }));
  }

  const emptyFields = TRAINER_SECTIONS.flatMap((section) => section.fields)
    .filter((field) => modeFor(field) === "empty")
    .map((field) => field.number);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Permesso di soggiorno · учебный тренажёр</p>
          <h1>Как заполнить Modulo 1</h1>
          <p>
            Держи бумажный kit рядом и проходи секцию за секцией. Экран показывает, где писать, что оставить пустым и что заполняется только у сотрудника Poste.
          </p>
        </div>
        <div className={styles.disclaimer}>
          <b>Важно</b>
          <p>
            Учебный макет, не официальный бланк и не юридическая консультация. Сдавать нужно бумажный kit со Sportello Amico. Если foglio note твоего kit расходится с экраном — верь бумажному kit и Questura своей провинции.
          </p>
          <a href="https://www.portaleimmigrazione.it/ITA/tabelleCosti.html" target="_blank" rel="noopener noreferrer">Перед походом сверить суммы ↗</a>
        </div>
      </section>

      <section className={styles.controls}>
        <div className={styles.scenarioSwitch} aria-label="Сценарий подачи">
          <button type="button" data-active={scenario === "rilascio"} onClick={() => setScenario("rilascio")}>
            <span>Первое ВНЖ</span>
            <small>RILASCIO · только приехал</small>
          </button>
          <button type="button" data-active={scenario === "rinnovo"} onClick={() => setScenario("rinnovo")}>
            <span>Продление</span>
            <small>RINNOVO · карточка уже есть</small>
          </button>
        </div>
        <button type="button" className={styles.exampleToggle} aria-pressed={showExample} onClick={() => setShowExample((v) => !v)}>
          {showExample ? "Скрыть пример" : "Показать пример"}
        </button>
      </section>

      <div className={styles.legendBar}>
        <span data-mode="write"><i /> Пиши</span>
        <span data-mode="empty"><i /> Оставь пустым</span>
        <span data-mode="post"><i /> Только на почте</span>
        <span data-mode="optional"><i /> Если есть / желательно</span>
      </div>

      <section id="modulo-sheet" className={styles.trainer}>
        <div className={styles.mobileSectionNav}>
          <span>{TRAINER_SECTIONS[activeSection].label} · {activeSection + 1}/{TRAINER_SECTIONS.length}</span>
          <strong>{TRAINER_SECTIONS[activeSection].title}</strong>
        </div>

        <div className={styles.formLayout}>
          <div className={styles.paper}>
            <div className={styles.paperHeader}>
              <div>
                <span>MINISTERO DELL&apos;INTERNO</span>
                <b>MOD. 209 · MODULO 1</b>
              </div>
              <div className={styles.stampBox}>
                <small>MARCA DA BOLLO</small>
                <strong>€ 16,00</strong>
                <span>НЕ ПИСАТЬ · СЮДА МАРКА</span>
              </div>
            </div>

            {TRAINER_SECTIONS.map((section, index) => (
              <section
                key={section.id}
                className={styles.formSection + " " + (index === activeSection ? styles.formSectionActive : "")}
                data-section-index={index}
              >
                <header>
                  <span>{section.label}</span>
                  <div>
                    <h2>{section.title}</h2>
                    {section.note && <p>{section.note}</p>}
                  </div>
                </header>

                <div className={styles.fields}>
                  {section.fields.map((field) => (
                    <FieldBlock
                      key={field.number}
                      field={field}
                      mode={modeFor(field)}
                      example={showExample ? exampleFor(field) : ""}
                      selected={selected.number === field.number}
                      onSelect={() => setSelected(field)}
                    />
                  ))}
                </div>
              </section>
            ))}

            <div className={styles.pagesEmpty}>
              <span>Страницы 4–8</span>
              <strong>ОСТАВЬ ПУСТЫМИ</strong>
              <p>Для студента без семьи эти страницы остаются частью бумажного Modulo 1 и входят в число листов, но их не нужно разворачивать в тренажёре.</p>
            </div>
          </div>

          <aside className={styles.detailPanel} data-mode={modeFor(selected)}>
            <div className={styles.detailTop}>
              <span>Поле {selected.number}</span>
              <button type="button" aria-label="Закрыть подсказку" onClick={() => setSelected(TRAINER_SECTIONS[activeSection].fields[0])}>×</button>
            </div>
            <h3>{selected.it}</h3>
            <p className={styles.detailRu}>{selected.ru}</p>
            <div className={styles.modeBadge}>{MODE_LABEL[modeFor(selected)]}</div>
            <dl>
              <div><dt>Откуда взять</dt><dd>{selected.source}</dd></div>
              <div><dt>Формат</dt><dd>{selected.format}</dd></div>
              {exampleFor(selected) && <div><dt>Пример</dt><dd>{exampleFor(selected)}</dd></div>}
              <div><dt>Частая ошибка</dt><dd>{selected.mistake}</dd></div>
            </dl>
            <p className={styles.exampleNote}>Серые буквы в клетках — пример выдуманного студента. На бумаге пиши свои данные чёрной ручкой.</p>
          </aside>
        </div>

        <div className={styles.mobilePager}>
          <button type="button" onClick={() => moveSection(-1)} disabled={activeSection === 0}>← Назад</button>
          <button type="button" onClick={() => moveSection(1)} disabled={activeSection === TRAINER_SECTIONS.length - 1}>Дальше →</button>
        </div>
      </section>

      <section className={styles.toolsSection}>
        <div className={styles.toolHeader}>
          <p className={styles.eyebrow}>Перед тем как писать в клетки</p>
          <h2>Четыре помощника</h2>
        </div>

        <div className={styles.toolsGrid}>
          <section className={styles.toolCard}>
            <h3>Код в поле 16</h3>
            <p>Не подставляем 24 или 31 автоматически. Выбери только после сверки с типом обучения и своим kit.</p>
            <select value={requestCode} onChange={(e) => setRequestCode(e.target.value)}>
              <option value="">Выбери код</option>
              {PERMIT_CODES.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.title}</option>)}
            </select>
            {requestCode && <p className={styles.helperText}>{PERMIT_CODES.find((item) => item.code === requestCode)?.note}</p>}
            {scenario === "rinnovo" && (
              <>
                <label className={styles.smallLabel}>Код на текущей карточке для поля 19</label>
                <select value={currentCardCode} onChange={(e) => setCurrentCardCode(e.target.value)}>
                  <option value="">Совпадает / пока не выбрано</option>
                  {PERMIT_CODES.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
                </select>
              </>
            )}
            <p className={styles.helperText}>После диплома поиск работы = код 30 и обычно Modulo 2. Этот сценарий здесь не рисуем.</p>
          </section>

          <section className={styles.toolCard}>
            <h3>Поле 25 · сколько листов</h3>
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
              <input type="checkbox" checked={worker} onChange={(e) => setWorker(e.target.checked)} />
              <span>Я официально работаю и кладу Modulo 2</span>
            </label>
            {worker && (
              <label className={styles.module2Pages}>
                <span>Физические листы Modulo 2</span>
                <input inputMode="numeric" min="0" max="20" type="number" value={copies.module2} placeholder="0" onChange={(e) => setCopies((prev) => ({ ...prev, module2: e.target.value }))} />
              </label>
            )}
            <div className={styles.totalBox}><span>Поле 25</span><strong>{padTwo(sheetTotal)}</strong></div>
          </section>

          <section className={styles.toolCard}>
            <h3>Сигла провинции</h3>
            <input type="search" value={provinceQuery} onChange={(e) => setProvinceQuery(e.target.value)} placeholder="Milano, Firenze или MI…" />
            <div className={styles.lookupList}>
              {filteredProvinces.map(([code, city]) => <button type="button" key={code} onClick={() => setProvinceQuery(code)}><b>{code}</b><span>{city}</span></button>)}
            </div>
            <p className={styles.helperText}>Если города нет: открой Tabella 1 бумажного kit. Не угадывай код.</p>
          </section>

          <section className={styles.toolCard}>
            <h3>Код страны</h3>
            <input type="search" value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} placeholder="Казахстан, KAZ…" />
            <div className={styles.lookupList}>
              {filteredCountries.map(([code, country]) => <button type="button" key={code} onClick={() => setCountryQuery(code)}><b>{code}</b><span>{country}</span></button>)}
            </div>
            <p className={styles.helperText}>Поля 35 и 36 независимы. Если Tabella 3 твоего kit показывает другое — используй kit.</p>
          </section>
        </div>
      </section>

      <section className={styles.checklistSection}>
        <div className={styles.toolHeader}>
          <p className={styles.eyebrow}>Финальная проверка</p>
          <h2>Что взять и как заполнять</h2>
        </div>
        <div className={styles.checklistGrid}>
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
          <a href="https://www.poste.it/guida-rilascio-e-rinnovo-permesso-di-soggiorno" target="_blank" rel="noopener noreferrer">Poste Italiane ↗</a>
          <a href="https://www.portaleimmigrazione.it/ITA/tabelleCosti.html" target="_blank" rel="noopener noreferrer">Portale Immigrazione · costi ↗</a>
          <a href="https://www.portaleimmigrazione.it/ITA/tabellauffpostali.html" target="_blank" rel="noopener noreferrer">Portale Immigrazione · codici ↗</a>
        </div>

        <details className={styles.cheatSheet}>
          <summary>Шпаргалка: что оставить пустым в сценарии {scenario === "rilascio" ? "RILASCIO" : "RINNOVO"}</summary>
          <p>Поля / блоки: {emptyFields.join(", ")}. Страницы 4–8 также не заполняй в сценарии студента без семьи.</p>
          <small>Это учебная шпаргалка, а не замена foglio note бумажного kit.</small>
        </details>
      </section>
    </div>
  );
}

function FieldBlock({
  field,
  mode,
  example,
  selected,
  onSelect,
}: {
  field: TrainerField;
  mode: FieldMode;
  example: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const chars = example.toUpperCase().split("");
  const count = Math.max(1, field.cells || chars.length || 1);
  return (
    <button type="button" className={styles.field} data-mode={mode} data-selected={selected || undefined} onClick={onSelect}>
      <span className={styles.fieldNumber}>{field.number}</span>
      <span className={styles.fieldNames}><b>{field.it}</b><small>{field.ru}</small></span>
      <span className={styles.cells} aria-hidden>
        {Array.from({ length: count }).map((_, index) => (
          <i key={index}>
            {example && chars[index] ? chars[index] : ""}
            {field.kind === "date" && (index === 1 || index === 3) && index < count - 1 ? <em>/</em> : null}
          </i>
        ))}
      </span>
      <span className={styles.fieldMode}>{MODE_LABEL[mode]}</span>
    </button>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <section className={styles.checklistCard}>
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}
