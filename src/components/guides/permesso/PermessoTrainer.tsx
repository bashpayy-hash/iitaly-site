"use client";

import { useEffect, useMemo, useState } from "react";
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
  empty: "ПРОПУСТИ",
  post: "ТОЛЬКО НА ПОЧТЕ",
  ifExists: "ЕСЛИ ЕСТЬ",
  recommended: "ЖЕЛАТЕЛЬНО",
  verify: "УТОЧНИ",
};

const LOCAL_DATA_KEY = "iitaly:permesso-modulo1-local-data";

const COPY_KEYS = [
  ["passport", "Паспорт: нужные страницы + виза + штампы"],
  ["permit", "Текущий permesso, лицо и оборот"],
  ["fiscal", "Codice fiscale, если есть"],
  ["insurance", "Страховка"],
  ["enrollment", "Зачисление / выписка экзаменов"],
  ["funds", "Подтверждение денег"],
  ["housing", "Жильё, если просит твоя Questura"],
] as const;

const FORM_PAGES = [
  { number: 1, title: "Заявление", sections: ["request", "application"] },
  { number: 2, title: "Личные данные и виза", sections: ["identity", "passport", "visa"] },
  { number: 3, title: "Адрес в Италии", sections: ["travel", "address", "correspondence"] },
] as const;

const RUNTIME_NOW = Date.now();

function readUrlScenario(): PermessoScenario {
  if (typeof window === "undefined") return "rilascio";
  return new URLSearchParams(window.location.search).get("scenario") === "rinnovo" ? "rinnovo" : "rilascio";
}

function readUrlPageIndex() {
  if (typeof window === "undefined") return 0;
  const page = new URLSearchParams(window.location.search).get("page");
  const index = FORM_PAGES.findIndex((item) => String(item.number) === page);
  return index >= 0 ? index : 0;
}

function fieldsForPageIndex(pageIndex: number) {
  const sectionIds = new Set<string>(FORM_PAGES[pageIndex].sections);
  return TRAINER_SECTIONS.filter((section) => sectionIds.has(section.id)).flatMap((section) => section.fields);
}

function readUrlField() {
  const scenario = readUrlScenario();
  const pageIndex = readUrlPageIndex();
  const fields = fieldsForPageIndex(pageIndex);
  const requested = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("field");
  return fields.find((item) => item.number === requested) || fields.find((item) => item.mode[scenario] === "write") || fields[0] || TRAINER_SECTIONS[0].fields[0];
}

function readLocalData() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  try {
    const saved = window.localStorage.getItem(LOCAL_DATA_KEY);
    return saved ? JSON.parse(saved) as Record<string, string> : {};
  } catch {
    return {};
  }
}

function padTwo(n: number) {
  return String(Math.max(0, Math.min(99, n))).padStart(2, "0");
}

function compactDateToTime(value: string) {
  const clean = value.replace(/\D/g, "");
  if (clean.length !== 8) return Number.NaN;
  const day = Number(clean.slice(0, 2));
  const month = Number(clean.slice(2, 4));
  const year = Number(clean.slice(4, 8));
  return new Date(year, month - 1, day).getTime();
}

function isValidCompactDate(value: string) {
  const clean = value.replace(/\D/g, "");
  if (clean.length !== 8) return false;
  const day = Number(clean.slice(0, 2));
  const month = Number(clean.slice(2, 4));
  const year = Number(clean.slice(4, 8));
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function PermessoTrainer() {
  const [scenario, setScenario] = useState<PermessoScenario>(() => readUrlScenario());
  const [showExample, setShowExample] = useState(false);
  const [activePage, setActivePage] = useState(() => readUrlPageIndex());
  const [selected, setSelected] = useState<TrainerField>(() => readUrlField());
  const [requestCode, setRequestCode] = useState("");
  const [currentCardCode, setCurrentCardCode] = useState("");
  const [worker, setWorker] = useState(false);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [myDataOpen, setMyDataOpen] = useState(false);
  const [useMyData, setUseMyData] = useState(false);
  const [myData, setMyData] = useState<Record<string, string>>(() => readLocalData());
  const [copies, setCopies] = useState<Record<string, string>>({
    passport: "", permit: "", fiscal: "", insurance: "", enrollment: "", funds: "", housing: "", module2: "",
  });

  const sectionMap = useMemo(
    () => new Map(TRAINER_SECTIONS.map((section) => [section.id, section])),
    [],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(myData));
    } catch {
      // Storage can be unavailable in private/restricted browser modes.
    }
  }, [myData]);

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

  function modeForScenario(field: TrainerField, targetScenario: PermessoScenario): FieldMode {
    if (field.number === "24") return worker ? "write" : "empty";
    return field.mode[targetScenario];
  }

  function modeFor(field: TrainerField): FieldMode {
    return modeForScenario(field, scenario);
  }

  function suggestedValueFor(field: TrainerField): string {
    if (field.number === "16") return requestCode;
    if (field.number === "19") return currentCardCode;
    if (field.number === "22") return worker ? "02" : "01";
    if (field.number === "24") return worker ? "X" : "";
    if (field.number === "25") return "";
    return field.example?.[scenario] || "";
  }

  function displayValueFor(field: TrainerField): string {
    if (useMyData && myData[field.number]) return myData[field.number];
    if (useMyData && (field.number === "22" || field.number === "24")) return suggestedValueFor(field);
    if (useMyData && field.kind === "x" && modeFor(field) === "write") return field.example?.[scenario] || "";
    if (showExample) return suggestedValueFor(field);
    return "";
  }

  function firstWritableOnPage(pageIndex: number, targetScenario: PermessoScenario = scenario) {
    const page = FORM_PAGES[pageIndex];
    const fields = page.sections.flatMap((sectionId) => sectionMap.get(sectionId)?.fields || []);
    return fields.find((item) => modeForScenario(item, targetScenario) === "write") || fields[0];
  }

  function updateUrl(nextScenario: PermessoScenario, pageIndex: number, fieldNumber: string, replace = false) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("scenario", nextScenario);
    url.searchParams.set("page", String(FORM_PAGES[pageIndex].number));
    url.searchParams.set("field", fieldNumber);
    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
  }

  function selectField(nextField: TrainerField, replace = false) {
    setSelected(nextField);
    updateUrl(scenario, activePage, nextField.number, replace);
  }

  function switchScenario(nextScenario: PermessoScenario) {
    setScenario(nextScenario);
    const first = firstWritableOnPage(activePage, nextScenario);
    if (first) {
      setSelected(first);
      updateUrl(nextScenario, activePage, first.number);
    }
  }

  function showPage(index: number) {
    const next = Math.max(0, Math.min(FORM_PAGES.length - 1, index));
    setActivePage(next);
    const first = firstWritableOnPage(next);
    if (first) {
      setSelected(first);
      updateUrl(scenario, next, first.number);
    }
    requestAnimationFrame(() => document.getElementById("modulo-sheet")?.scrollIntoView({ block: "start", behavior: "smooth" }));
  }

  const emptyFields = TRAINER_SECTIONS.flatMap((section) => section.fields)
    .filter((item) => modeFor(item) === "empty")
    .map((item) => item.number);

  const activeFormPage = FORM_PAGES[activePage];
  const activePageFields = activeFormPage.sections.flatMap((sectionId) => sectionMap.get(sectionId)?.fields || []);
  const writablePageFields = activePageFields.filter((item) => modeFor(item) === "write");
  const selectedWritableIndex = writablePageFields.findIndex((item) => item.number === selected.number);
  const selectedSection = sectionMap.get(selected.section);
  const selectedProgress = writablePageFields.length
    ? Math.max(0, Math.min(100, ((Math.max(0, selectedWritableIndex) + 1) / writablePageFields.length) * 100))
    : 0;

  function selectRelativeField(delta: number) {
    if (!writablePageFields.length) return;
    const current = selectedWritableIndex >= 0 ? selectedWritableIndex : 0;
    const next = Math.max(0, Math.min(writablePageFields.length - 1, current + delta));
    selectField(writablePageFields[next]);
  }

  function clearMyData() {
    setMyData({});
    setUseMyData(false);
    try {
      window.localStorage.removeItem(LOCAL_DATA_KEY);
    } catch {
      // Ignore storage restrictions.
    }
  }

  function validationFor(field: TrainerField, value: string) {
    if (!value) return "";
    const clean = value.replace(/\s/g, "");
    const capacity = (field.cells || 0) * (field.rows || 1);
    if (capacity && value.length > capacity) return "Не помещается в клетки: сократи только если это допустимо по документу.";
    if (field.number === "31" && !/^[A-Z0-9]{16}$/i.test(clean)) return "Codice fiscale должен содержать ровно 16 букв и цифр.";
    if ((field.number === "72" || field.number === "84") && !/^\d{5}$/.test(clean)) return "CAP должен состоять из 5 цифр.";
    if (field.kind === "date" && !isValidCompactDate(clean)) return "Проверь дату: формат ДДММГГГГ и дата должна существовать.";
    if (field.number === "45" && isValidCompactDate(clean) && compactDateToTime(clean) < RUNTIME_NOW) return "Паспорт уже истёк — проверь документ до подачи.";
    if (field.number === "20" && isValidCompactDate(clean) && compactDateToTime(clean) < RUNTIME_NOW) return "Срок ВНЖ уже прошёл. Это не блокирует тренажёр, но лучше отдельно проверить порядок действий.";
    return "";
  }

  const editableMyDataFields = TRAINER_SECTIONS.flatMap((section) => section.fields)
    .filter((item) => {
      const mode = modeFor(item);
      return mode !== "empty" && mode !== "post" && mode !== "verify" && item.kind !== "x" && !["22", "25", "26", "62"].includes(item.number);
    });

  function helpSourceFor(field: TrainerField) {
    if (field.number === "31" && scenario === "rinnovo") {
      return "Возьми существующий codice fiscale из карточки / сертификата. При продлении не придумывай новый код.";
    }
    return field.source;
  }

  function codeHintFor(field: TrainerField) {
    if (field.number === "16") {
      const value = myData["16"] || requestCode;
      return value ? value + " — выбран вручную" : "УТОЧНЯЕТСЯ · не подставляем 24/31 автоматически";
    }
    if (field.number === "19") {
      const value = myData["19"] || currentCardCode;
      return value ? value + " — перепроверь по текущему документу" : "ПЕРЕПИШИ С ТЕКУЩЕГО ВНЖ / ПРОШЛОГО KIT";
    }
    if (field.number === "32") return "A — не в браке · B — в браке";
    if (field.number === "35" || field.number === "36") return "СВЕРЬ С TABELLA 3 ТВОЕГО KIT";
    if (field.number === "46") return "Часто 01, если паспорт выдан госорганом страны — сверить foglio note";
    return "";
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button")) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        selectRelativeField(1);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        selectRelativeField(-1);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  useEffect(() => {
    function applyUrlState() {
      const params = new URLSearchParams(window.location.search);
      const nextScenario: PermessoScenario = params.get("scenario") === "rinnovo" ? "rinnovo" : "rilascio";
      const requestedPage = params.get("page");
      const foundPage = FORM_PAGES.findIndex((item) => String(item.number) === requestedPage);
      const pageIndex = foundPage >= 0 ? foundPage : 0;
      const fields = fieldsForPageIndex(pageIndex);
      const requestedField = params.get("field");
      const nextField = fields.find((item) => item.number === requestedField) || fields.find((item) => item.mode[nextScenario] === "write") || fields[0];
      setScenario(nextScenario);
      setActivePage(pageIndex);
      if (nextField) setSelected(nextField);
    }
    window.addEventListener("popstate", applyUrlState);
    return () => window.removeEventListener("popstate", applyUrlState);
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>Modulo 1 — по оригинальному бланку</h1>
          <p>
            В центре — официальный Mod. 209 без перерисовки. IITALY только объясняет активное поле, помогает проверить формат и ведёт по шагам.
          </p>
          <div className={styles.heroFacts} aria-label="Как работает тренажёр">
            <span>Официальный PDF</span>
            <span>Rilascio и Rinnovo</span>
            <span>Данные остаются в браузере</span>
          </div>
        </div>
        <aside className={styles.disclaimer} aria-label="Что важно знать">
          <b>Бланк остаётся главным источником.</b>
          <p>
            Это учебный помощник, не замена инструкции Questura. Если foglio note твоего kit расходится с подсказкой, следуй бумажному kit и требованиям своей провинции.
          </p>
          <a href="https://www.portaleimmigrazione.it/ITA/tabelleCosti.html" target="_blank" rel="noopener noreferrer">Сверить официальные расходы ↗</a>
        </aside>
      </section>

      <section className={styles.prepStrip} aria-label="Что подготовить">
        <div>
          <span>Перед началом</span>
          <b>Kit · чёрная ручка · паспорт · codice fiscale{scenario === "rinnovo" ? " · карточка ВНЖ" : ""} · marca da bollo €16</b>
        </div>
        <a href="#helpers">Коды и расчёты ↓</a>
      </section>

      <section className={styles.controls}>
        <div className={styles.scenarioSwitch} aria-label="Сценарий подачи">
          <button type="button" aria-pressed={scenario === "rilascio"} data-active={scenario === "rilascio"} onClick={() => switchScenario("rilascio")}>
            <span>Первое ВНЖ</span>
            <small>RILASCIO · только приехал</small>
          </button>
          <button type="button" aria-pressed={scenario === "rinnovo"} data-active={scenario === "rinnovo"} onClick={() => switchScenario("rinnovo")}>
            <span>Продление</span>
            <small>RINNOVO · карточка уже есть</small>
          </button>
        </div>
        <div className={styles.controlActions}>
          <button
            type="button"
            className={styles.exampleToggle}
            aria-pressed={showExample}
            aria-label={showExample ? "Скрыть пример заполнения" : "Показать пример заполнения"}
            onClick={() => {
              setShowExample((value) => !value);
              setUseMyData(false);
            }}
          >
            {showExample ? "Скрыть пример" : "Показать пример"}
          </button>
          <button type="button" className={styles.myDataButton} aria-expanded={myDataOpen} aria-controls="permesso-my-data" onClick={() => setMyDataOpen((value) => !value)}>
            Мои данные
          </button>
        </div>
      </section>

      {myDataOpen && (
        <section id="permesso-my-data" className={styles.myDataPanel}>
          <div className={styles.myDataHeader}>
            <div>
              <h2>Мои данные</h2>
              <p>Сохраняются только в этом браузере и не отправляются на сервер.</p>
            </div>
            <button type="button" onClick={clearMyData}>Стереть</button>
          </div>
          <div className={styles.myDataGrid}>
            {editableMyDataFields.map((item) => {
              const value = myData[item.number] || "";
              const error = validationFor(item, value);
              return (
                <label key={item.section + ":" + item.number} className={styles.myDataField}>
                  <span><b>{item.number}. {item.ru}</b><small>{item.it}</small></span>
                  <input
                    value={value}
                    inputMode={item.kind === "number" || item.kind === "date" ? "numeric" : "text"}
                    placeholder={item.kind === "date" ? "ДДММГГГГ" : ""}
                    onChange={(event) => setMyData((prev) => ({ ...prev, [item.number]: event.target.value.toUpperCase() }))}
                  />
                  {error && <em>{error}</em>}
                </label>
              );
            })}
          </div>
          <div className={styles.myDataFooter}>
            <button
              type="button"
              className={styles.useMyDataButton}
              onClick={() => {
                setUseMyData(true);
                setShowExample(false);
                setMyDataOpen(false);
                const first = firstWritableOnPage(activePage);
                if (first) selectField(first, true);
                requestAnimationFrame(() => document.getElementById("modulo-sheet")?.scrollIntoView({ behavior: "smooth", block: "start" }));
              }}
            >
              Использовать в пошаговом режиме
            </button>
            {useMyData && <span>Активное значение показывается в подсказке; на телефоне — ещё и в клетках.</span>}
          </div>
        </section>
      )}

      <div className={styles.legendBar}>
        <span data-mode="write"><i /> Обычное поле — заполняй</span>
        <span data-mode="empty"><i /> Пропусти</span>
        <span data-mode="post"><i /> Только на почте</span>
        <span data-mode="ifExists"><i /> Если есть</span>
        <span data-mode="verify"><i /> Уточни</span>
      </div>

      <section id="modulo-sheet" className={styles.trainer}>
        <div className={styles.trainerHead}>
          <nav className={styles.pageTabs} aria-label="Страницы тренажёра">
            {FORM_PAGES.map((item, index) => (
              <button
                key={item.number}
                type="button"
                aria-current={index === activePage ? "page" : undefined}
                data-active={index === activePage}
                onClick={() => showPage(index)}
              >
                <span>Стр. {item.number}</span>
                <small>{item.title}</small>
              </button>
            ))}
          </nav>
          <div className={styles.journeyLinks} aria-label="Дополнительные шаги">
            <button type="button" onClick={() => document.getElementById("pages4-8")?.scrollIntoView({ behavior: "smooth" })}>
              Стр. 4–8: не заполнять
            </button>
            <button type="button" onClick={() => document.getElementById("before-poste")?.scrollIntoView({ behavior: "smooth" })}>
              Перед почтой
            </button>
          </div>
        </div>

        <div className={styles.mobileFieldCard} data-mode={modeFor(selected)}>
          <div className={styles.mobileFieldHead}>
            <span>Стр. {activeFormPage.number} · поле {selected.number}</span>
            <b>{MODE_LABEL[modeFor(selected)]}</b>
          </div>
          <h2>{selected.it}</h2>
          <p>{selected.ru}</p>
          {selected.kind !== "x" && selected.cells !== 0 && <FieldCells field={selected} value={displayValueFor(selected)} compact={false} />}
          {codeHintFor(selected) && <div className={styles.codeHint}>{codeHintFor(selected)}</div>}
          <dl>
            <div><dt>{modeFor(selected) === "empty" ? "Почему пусто" : "Откуда взять"}</dt><dd>{helpSourceFor(selected)}</dd></div>
            <div><dt>Формат</dt><dd>{selected.format}</dd></div>
          </dl>
          <div className={styles.mobileFieldNav}>
            <button type="button" onClick={() => selectRelativeField(-1)} disabled={selectedWritableIndex <= 0}>← Назад</button>
            <span>{Math.max(1, selectedWritableIndex + 1)} из {writablePageFields.length}</span>
            <button type="button" onClick={() => selectRelativeField(1)} disabled={!writablePageFields.length || selectedWritableIndex >= writablePageFields.length - 1}>Дальше →</button>
          </div>
        </div>

        <div className={styles.formLayout}>
          <div className={styles.paperExact}>
            <div className={styles.paperExactBar}>
              <div>
                <span>Официальный бланк</span>
                <strong>Mod. 209 · Modulo 1 · Pagina {activeFormPage.number}</strong>
              </div>
              <a
                href="https://www.portaleimmigrazione.it/media/documentazione/Modulo_1.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть PDF ↗
              </a>
            </div>
            <object
              key={activeFormPage.number}
              className={styles.paperPdf}
              data={"https://www.portaleimmigrazione.it/media/documentazione/Modulo_1.pdf#page=" + activeFormPage.number + "&zoom=page-width&toolbar=0&navpanes=0&scrollbar=0"}
              type="application/pdf"
              aria-label={"Оригинальный Mod. 209 Modulo 1, страница " + activeFormPage.number}
            >
              <div className={styles.paperPdfFallback}>
                <p>Браузер не показал встроенный PDF.</p>
                <a
                  href="https://www.portaleimmigrazione.it/media/documentazione/Modulo_1.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Открыть оригинальный бланк ↗
                </a>
              </div>
            </object>
            <div className={styles.paperExactFooter}>
              <span>Оригинал Portale Immigrazione</span>
              <span>Линии, клетки и подписи не перерисовываются IITALY.</span>
            </div>
          </div>

          <aside
            className={styles.detailPanel}
            data-mode={modeFor(selected)}
            aria-live="polite"
            aria-label={"Подсказка к полю " + selected.number}
          >
            <div className={styles.detailTop}>
              <span>{selectedSection?.label || "Modulo 1"} · поле {selected.number}</span>
              <strong>{MODE_LABEL[modeFor(selected)]}</strong>
            </div>
            <div className={styles.detailProgress} aria-hidden>
              <span style={{ width: selectedProgress + "%" }} />
            </div>
            <h3>{selected.it}</h3>
            <p className={styles.detailRu}>{selected.ru}</p>
            {codeHintFor(selected) && <div className={styles.codeHint}>{codeHintFor(selected)}</div>}
            {useMyData && myData[selected.number] && (
              <div className={styles.myValue}>
                <span>Моё значение</span>
                <strong>{myData[selected.number]}</strong>
              </div>
            )}
            {(showExample || (useMyData && myData[selected.number])) && selected.kind !== "x" && selected.cells !== 0 && (
              <div className={styles.detailCellPreview}>
                <span>{useMyData && myData[selected.number] ? "Как перенести в клетки" : "Пример в клетках"}</span>
                <FieldCells
                  field={selected}
                  value={useMyData && myData[selected.number] ? myData[selected.number] : suggestedValueFor(selected)}
                  compact={false}
                />
              </div>
            )}
            <dl>
              <div>
                <dt>{modeFor(selected) === "empty" ? "Почему пропустить" : "Откуда взять"}</dt>
                <dd>{helpSourceFor(selected)}</dd>
              </div>
              <div><dt>Как писать</dt><dd>{selected.format}</dd></div>
              {suggestedValueFor(selected) && !showExample && <div><dt>Пример</dt><dd>{suggestedValueFor(selected)}</dd></div>}
              <div><dt>Не перепутай</dt><dd>{selected.mistake}</dd></div>
            </dl>
            <div className={styles.detailNav}>
              <button type="button" onClick={() => selectRelativeField(-1)} disabled={selectedWritableIndex <= 0}>
                Предыдущее
              </button>
              <span>{Math.max(1, selectedWritableIndex + 1)} из {writablePageFields.length}</span>
              <button
                type="button"
                data-primary
                onClick={() => selectRelativeField(1)}
                disabled={!writablePageFields.length || selectedWritableIndex >= writablePageFields.length - 1}
              >
                Следующее
              </button>
            </div>
            <p className={styles.keyboardHint}>На компьютере: ↑ и ↓ переключают поля.</p>
          </aside>
        </div>

        <div className={styles.mobilePager}>
          <button type="button" onClick={() => showPage(activePage - 1)} disabled={activePage === 0}>← Предыдущая страница</button>
          <button type="button" onClick={() => showPage(activePage + 1)} disabled={activePage === FORM_PAGES.length - 1}>Следующая страница →</button>
        </div>
      </section>

      <section id="helpers" className={styles.toolsSection}>
        <div className={styles.toolHeader}>
          <h2>Коды и расчёты</h2>
          <p>Используй только там, где бумажный kit требует код или число. Ничего не переносится автоматически.</p>
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
            <div className={styles.totalBox}><span>Ориентир для поля 25 · проверь перед переносом</span><strong>{padTwo(sheetTotal)}</strong></div>
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

      <section id="before-poste" className={styles.checklistSection}>
        <div className={styles.toolHeader}>
          <h2>Перед почтой</h2>
          <p>Последняя проверка перед Sportello Amico: бумага, документы и расходы.</p>
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

function FieldCells({ field, value, compact }: { field: TrainerField; value: string; compact: boolean }) {
  if (field.kind === "date") return <DateCells value={value} />;
  if (field.number === "69" || field.number === "81") return <HouseCells value={value} />;
  if (field.number === "74" || field.number === "75") return <PhoneCells value={value} />;
  if (field.rows === 2) return <DoubleRowCells count={field.cells || 20} value={value} />;
  const count = Math.max(1, compact ? Math.min(field.cells || 8, 10) : field.cells || 12);
  return <CellRun count={count} value={value} />;
}

function DateCells({ value = "" }: { value?: string }) {
  const clean = value.replace(/\D/g, "");
  return (
    <span className={styles.dateCells} aria-hidden>
      <span><CellRun count={2} value={clean.slice(0, 2)} /><small>gg</small></span>
      <b>/</b>
      <span><CellRun count={2} value={clean.slice(2, 4)} /><small>mm</small></span>
      <b>/</b>
      <span><CellRun count={4} value={clean.slice(4, 8)} /><small>aaaa</small></span>
    </span>
  );
}

function HouseCells({ value = "" }: { value?: string }) {
  const [numberPart, letterPart = ""] = value.toUpperCase().split("/");
  return (
    <span className={styles.splitCells} aria-hidden>
      <span><CellRun count={5} value={numberPart} /><small>numero</small></span>
      <b>/</b>
      <span><CellRun count={2} value={letterPart} /><small>lettera</small></span>
    </span>
  );
}

function PhoneCells({ value = "" }: { value?: string }) {
  const parts = value.replace(/\s/g, "").split("/");
  const prefix = parts.length > 1 ? parts[0] : value.replace(/\D/g, "").slice(0, 3);
  const number = parts.length > 1 ? parts[1] : value.replace(/\D/g, "").slice(3);
  return (
    <span className={styles.splitCells} aria-hidden>
      <span><CellRun count={4} value={prefix} /><small>prefisso</small></span>
      <b>/</b>
      <span><CellRun count={8} value={number} /><small>numero</small></span>
    </span>
  );
}

function DoubleRowCells({ count, value = "" }: { count: number; value?: string }) {
  const normalized = value.toUpperCase();
  return (
    <span className={styles.doubleCells} aria-hidden>
      <CellRun count={count} value={normalized.slice(0, count)} />
      <CellRun count={count} value={normalized.slice(count, count * 2)} />
    </span>
  );
}

function CellRun({ count, value = "" }: { count: number; value?: string }) {
  const chars = value.toUpperCase().split("");
  return (
    <span className={styles.cells} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <i key={index}>{chars[index] === " " ? "" : chars[index] || ""}</i>
      ))}
    </span>
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
