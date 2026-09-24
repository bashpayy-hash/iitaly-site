"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  COUNTRY_CODES,
  PERMIT_CODES,
  PROVINCES,
  TRAINER_SECTIONS,
  type FieldMode,
  type PermessoScenario,
  type TrainerField,
  type TrainerSection,
} from "./permessoData";
import styles from "./permesso-trainer.module.css";

const MODE_LABEL: Record<FieldMode, string> = {
  write: "ПИШИ",
  empty: "ПРОПУСТИ",
  post: "ТОЛЬКО НА ПОЧТЕ",
  ifExists: "ЕСЛИ ЕСТЬ",
  recommended: "ЖЕЛАТЕЛЬНО",
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
  const [scenario, setScenario] = useState<PermessoScenario>("rilascio");
  const [showExample, setShowExample] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [selected, setSelected] = useState<TrainerField>(TRAINER_SECTIONS[0].fields[0]);
  const [requestCode, setRequestCode] = useState("");
  const [currentCardCode, setCurrentCardCode] = useState("");
  const [worker, setWorker] = useState(false);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [myDataOpen, setMyDataOpen] = useState(false);
  const [useMyData, setUseMyData] = useState(false);
  const [myData, setMyData] = useState<Record<string, string>>({});
  const [dataReady, setDataReady] = useState(false);
  const [copies, setCopies] = useState<Record<string, string>>({
    passport: "", permit: "", fiscal: "", insurance: "", enrollment: "", funds: "", housing: "", module2: "",
  });

  const sectionMap = useMemo(
    () => new Map(TRAINER_SECTIONS.map((section) => [section.id, section])),
    [],
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCAL_DATA_KEY);
      if (saved) setMyData(JSON.parse(saved) as Record<string, string>);
    } catch {
      // Local-only helper must never block the trainer.
    } finally {
      setDataReady(true);
    }
  }, []);

  useEffect(() => {
    if (!dataReady) return;
    try {
      window.localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(myData));
    } catch {
      // Storage can be unavailable in private/restricted browser modes.
    }
  }, [dataReady, myData]);

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
    if (field.number === "25") return padTwo(sheetTotal);
    return field.example?.[scenario] || "";
  }

  function displayValueFor(field: TrainerField): string {
    if (useMyData && myData[field.number]) return myData[field.number];
    if (showExample) return suggestedValueFor(field);
    return "";
  }

  function field(sectionId: string, number: string) {
    const result = sectionMap.get(sectionId)?.fields.find((item) => item.number === number);
    if (!result) throw new Error("Missing trainer field " + sectionId + ":" + number);
    return result;
  }

  function allEmpty(section: TrainerSection) {
    return section.fields.every((item) => modeFor(item) === "empty");
  }

  function firstWritableOnPage(pageIndex: number, targetScenario: PermessoScenario = scenario) {
    const page = FORM_PAGES[pageIndex];
    const fields = page.sections.flatMap((sectionId) => sectionMap.get(sectionId)?.fields || []);
    return fields.find((item) => modeForScenario(item, targetScenario) === "write") || fields[0];
  }

  function switchScenario(nextScenario: PermessoScenario) {
    setScenario(nextScenario);
    const first = firstWritableOnPage(activePage, nextScenario);
    if (first) setSelected(first);
  }

  function showPage(index: number) {
    const next = Math.max(0, Math.min(FORM_PAGES.length - 1, index));
    setActivePage(next);
    const first = firstWritableOnPage(next);
    if (first) setSelected(first);
    requestAnimationFrame(() => document.getElementById("modulo-sheet")?.scrollIntoView({ block: "start", behavior: "smooth" }));
  }

  const emptyFields = TRAINER_SECTIONS.flatMap((section) => section.fields)
    .filter((item) => modeFor(item) === "empty")
    .map((item) => item.number);

  const activeFormPage = FORM_PAGES[activePage];
  const activePageFields = activeFormPage.sections.flatMap((sectionId) => sectionMap.get(sectionId)?.fields || []);
  const writablePageFields = activePageFields.filter((item) => modeFor(item) === "write");
  const selectedWritableIndex = writablePageFields.findIndex((item) => item.number === selected.number);

  function selectRelativeField(delta: number) {
    if (!writablePageFields.length) return;
    const current = selectedWritableIndex >= 0 ? selectedWritableIndex : 0;
    const next = Math.max(0, Math.min(writablePageFields.length - 1, current + delta));
    setSelected(writablePageFields[next]);
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
    if (field.number === "45" && isValidCompactDate(clean) && compactDateToTime(clean) < Date.now()) return "Паспорт уже истёк — проверь документ до подачи.";
    if (field.number === "20" && isValidCompactDate(clean) && compactDateToTime(clean) < Date.now()) return "Срок ВНЖ уже прошёл. Это не блокирует тренажёр, но лучше отдельно проверить порядок действий.";
    return "";
  }

  const editableMyDataFields = TRAINER_SECTIONS.flatMap((section) => section.fields)
    .filter((item) => {
      const mode = modeFor(item);
      return mode !== "empty" && mode !== "post" && item.kind !== "x" && !["22", "25", "26", "62"].includes(item.number);
    });

  function helpSourceFor(field: TrainerField) {
    if (field.number === "31" && scenario === "rinnovo") {
      return "Возьми существующий codice fiscale из карточки / сертификата. При продлении не придумывай новый код.";
    }
    return field.source;
  }

  function codeHintFor(field: TrainerField) {
    if (field.number === "16") return requestCode ? requestCode + " — выбран в помощнике ниже" : "УТОЧНЯЕТСЯ · не подставляем 24/31 автоматически";
    if (field.number === "19") return currentCardCode ? currentCardCode + " — выбран по текущему документу" : "ПЕРЕПИШИ С ТЕКУЩЕГО ВНЖ / ПРОШЛОГО KIT";
    if (field.number === "32") return "A — не в браке · B — в браке";
    if (field.number === "35" || field.number === "36") return "СВЕРЬ С TABELLA 3 ТВОЕГО KIT";
    if (field.number === "46") return "Часто 01, если паспорт выдан госорганом страны — сверить foglio note";
    return "";
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Permesso di soggiorno · учебный тренажёр</p>
          <h1>Заполняй прямо по виду бумажного Modulo 1</h1>
          <p>
            Макет повторяет структуру Mod. 209: те же секции, номера полей и клетки. Держи бумажный kit рядом и переноси только свои данные.
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

      <section className={styles.prepStrip} aria-label="Что подготовить">
        <div>
          <span>Подготовь на стол</span>
          <b>Kit · чёрная ручка · паспорт · codice fiscale{scenario === "rinnovo" ? " · карточка ВНЖ" : ""} · marca da bollo €16</b>
        </div>
        <a href="#helpers">Коды и листы ↓</a>
      </section>

      <section className={styles.controls}>
        <div className={styles.scenarioSwitch} aria-label="Сценарий подачи">
          <button type="button" data-active={scenario === "rilascio"} onClick={() => switchScenario("rilascio")}>
            <span>Первое ВНЖ</span>
            <small>RILASCIO · только приехал</small>
          </button>
          <button type="button" data-active={scenario === "rinnovo"} onClick={() => switchScenario("rinnovo")}>
            <span>Продление</span>
            <small>RINNOVO · карточка уже есть</small>
          </button>
        </div>
        <div className={styles.controlActions}>
          <button
            type="button"
            className={styles.exampleToggle}
            aria-pressed={showExample}
            onClick={() => {
              setShowExample((value) => !value);
              setUseMyData(false);
            }}
          >
            {showExample ? "Скрыть пример" : "Показать пример"}
          </button>
          <button type="button" className={styles.myDataButton} onClick={() => setMyDataOpen((value) => !value)}>
            Мои данные
          </button>
        </div>
      </section>

      {myDataOpen && (
        <section className={styles.myDataPanel}>
          <div className={styles.myDataHeader}>
            <div>
              <span>Режим «Мои данные»</span>
              <b>Данные остаются только в этом браузере и не отправляются на сервер.</b>
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
              }}
            >
              Показать мои данные в клетках
            </button>
            {useMyData && <span>Мои данные сейчас показаны тёмно-синими «чернилами».</span>}
          </div>
        </section>
      )}

      <div className={styles.legendBar}>
        <span data-mode="write"><i /> Обычное поле — заполняй</span>
        <span data-mode="empty"><i /> Пропусти</span>
        <span data-mode="post"><i /> Только на почте</span>
        <span data-mode="ifExists"><i /> Если есть</span>
      </div>

      <section id="modulo-sheet" className={styles.trainer}>
        <nav className={styles.pageTabs} aria-label="Страницы тренажёра">
          {FORM_PAGES.map((item, index) => (
            <button key={item.number} type="button" data-active={index === activePage} onClick={() => showPage(index)}>
              <span>Стр. {item.number}</span>
              <small>{item.title}</small>
            </button>
          ))}
        </nav>

        <div className={styles.formLayout}>
          <div className={styles.paper}>
            <FormHeader
              page={activeFormPage.number}
              showExample={showExample}
              scenario={scenario}
            />

            {activeFormPage.number === 1 && (
              <>
                <FormSection section={sectionMap.get("request")!} empty={false}>
                  <div className={styles.fullRows}>
                    <FormField field={field("request", "3")} mode={modeFor(field("request", "3"))} example={displayValueFor(field("request", "3"))} selected={selected.number === "3"} onSelect={setSelected} />
                    <FormField field={field("request", "4")} mode={modeFor(field("request", "4"))} example={displayValueFor(field("request", "4"))} selected={selected.number === "4"} onSelect={setSelected} />
                    <div className={styles.twoColumnFields}>
                      <FormField field={field("request", "5")} compact mode={modeFor(field("request", "5"))} example={displayValueFor(field("request", "5"))} selected={selected.number === "5"} onSelect={setSelected} />
                      <FormField field={field("request", "6")} mode={modeFor(field("request", "6"))} example={displayValueFor(field("request", "6"))} selected={selected.number === "6"} onSelect={setSelected} />
                    </div>
                  </div>

                  <div className={styles.requestChoices}>
                    <div className={styles.choicePanel}>
                      <p>7. RICHIEDE IL:</p>
                      <ChoiceField field={field("request", "8")} mode={modeFor(field("request", "8"))} example={displayValueFor(field("request", "8"))} selected={selected.number === "8"} onSelect={setSelected} />
                      <ChoiceField field={field("request", "9")} mode={modeFor(field("request", "9"))} example={displayValueFor(field("request", "9"))} selected={selected.number === "9"} onSelect={setSelected} />
                      <ChoiceField field={field("request", "10")} mode={modeFor(field("request", "10"))} example="" selected={selected.number === "10"} onSelect={setSelected} />
                      <ChoiceField field={field("request", "11")} mode={modeFor(field("request", "11"))} example="" selected={selected.number === "11"} onSelect={setSelected} />
                      <ChoiceField field={field("request", "12")} mode={modeFor(field("request", "12"))} example="" selected={selected.number === "12"} onSelect={setSelected} />
                    </div>
                    <div className={styles.choicePanel}>
                      <p>13. DEL/DELLA:</p>
                      <ChoiceField field={field("request", "14")} mode={modeFor(field("request", "14"))} example={displayValueFor(field("request", "14"))} selected={selected.number === "14"} onSelect={setSelected} />
                      <ChoiceField field={field("request", "15")} mode={modeFor(field("request", "15"))} example="" selected={selected.number === "15"} onSelect={setSelected} />
                      <FormField field={field("request", "16")} compact mode={modeFor(field("request", "16"))} example={displayValueFor(field("request", "16"))} selected={selected.number === "16"} onSelect={setSelected} />
                      <ChoiceField field={field("request", "17")} mode={modeFor(field("request", "17"))} example="" selected={selected.number === "17"} onSelect={setSelected} />
                    </div>
                  </div>

                  <div className={styles.permitStrip}>
                    <FormField field={field("request", "18")} mode={modeFor(field("request", "18"))} example={displayValueFor(field("request", "18"))} selected={selected.number === "18"} onSelect={setSelected} />
                    <FormField field={field("request", "19")} compact mode={modeFor(field("request", "19"))} example={displayValueFor(field("request", "19"))} selected={selected.number === "19"} onSelect={setSelected} />
                    <FormField field={field("request", "20")} compact mode={modeFor(field("request", "20"))} example={displayValueFor(field("request", "20"))} selected={selected.number === "20"} onSelect={setSelected} />
                  </div>
                </FormSection>

                <FormSection section={sectionMap.get("application")!} empty={false}>
                  <div className={styles.applicationGrid}>
                    <FormField field={field("application", "22")} compact mode={modeFor(field("application", "22"))} example={displayValueFor(field("application", "22"))} selected={selected.number === "22"} onSelect={setSelected} />
                    <ChoiceField field={field("application", "23")} mode={modeFor(field("application", "23"))} example={displayValueFor(field("application", "23"))} selected={selected.number === "23"} onSelect={setSelected} />
                    <ChoiceField field={field("application", "24")} mode={modeFor(field("application", "24"))} example={displayValueFor(field("application", "24"))} selected={selected.number === "24"} onSelect={setSelected} />
                    <FormField field={field("application", "25")} compact mode={modeFor(field("application", "25"))} example={displayValueFor(field("application", "25"))} selected={selected.number === "25"} onSelect={setSelected} />
                    <FormField field={field("application", "26")} compact mode={modeFor(field("application", "26"))} example="" selected={selected.number === "26"} onSelect={setSelected} />
                  </div>
                  <p className={styles.legalLine}>27. RESPONSABILITÀ PER DICHIARAZIONI MENDACI · этот текст только читают, здесь ничего не пишут.</p>
                  <div className={styles.dateSignature}>
                    <FormField field={field("application", "28")} mode={modeFor(field("application", "28"))} example={displayValueFor(field("application", "28"))} selected={selected.number === "28"} onSelect={setSelected} />
                    <FormField field={field("application", "29")} signature mode={modeFor(field("application", "29"))} example="" selected={selected.number === "29"} onSelect={setSelected} />
                  </div>
                </FormSection>
              </>
            )}

            {activeFormPage.number === 2 && (
              <>
                <FormSection section={sectionMap.get("identity")!} empty={false}>
                  <div className={styles.identityGrid}>
                    <FormField className={styles.spanAll} field={field("identity", "31")} mode={modeFor(field("identity", "31"))} example={displayValueFor(field("identity", "31"))} selected={selected.number === "31"} onSelect={setSelected} />
                    <FormField field={field("identity", "32")} compact mode={modeFor(field("identity", "32"))} example={displayValueFor(field("identity", "32"))} selected={selected.number === "32"} onSelect={setSelected} />
                    <FormField field={field("identity", "33")} compact mode={modeFor(field("identity", "33"))} example={displayValueFor(field("identity", "33"))} selected={selected.number === "33"} onSelect={setSelected} />
                    <FormField field={field("identity", "34")} compact mode={modeFor(field("identity", "34"))} example={displayValueFor(field("identity", "34"))} selected={selected.number === "34"} onSelect={setSelected} />
                    <FormField field={field("identity", "35")} compact mode={modeFor(field("identity", "35"))} example={displayValueFor(field("identity", "35"))} selected={selected.number === "35"} onSelect={setSelected} />
                    <FormField field={field("identity", "36")} compact mode={modeFor(field("identity", "36"))} example={displayValueFor(field("identity", "36"))} selected={selected.number === "36"} onSelect={setSelected} />
                    <RefugeeField field={field("identity", "37")} mode={modeFor(field("identity", "37"))} value={displayValueFor(field("identity", "37"))} selected={selected.number === "37"} onSelect={setSelected} />
                    <FormField className={styles.spanAll} field={field("identity", "38")} mode={modeFor(field("identity", "38"))} example={displayValueFor(field("identity", "38"))} selected={selected.number === "38"} onSelect={setSelected} />
                  </div>
                </FormSection>

                <FormSection section={sectionMap.get("passport")!} empty={false}>
                  <div className={styles.passportTop}>
                    <ChoiceField field={field("passport", "40")} mode={modeFor(field("passport", "40"))} example={displayValueFor(field("passport", "40"))} selected={selected.number === "40"} onSelect={setSelected} />
                    <div className={styles.passportOther}>
                      <ChoiceField field={field("passport", "41")} mode={modeFor(field("passport", "41"))} example="" selected={selected.number === "41"} onSelect={setSelected} />
                      <FormField field={field("passport", "42")} compact mode={modeFor(field("passport", "42"))} example="" selected={selected.number === "42"} onSelect={setSelected} />
                      <FormField field={field("passport", "43")} mode={modeFor(field("passport", "43"))} example="" selected={selected.number === "43"} onSelect={setSelected} />
                    </div>
                  </div>
                  <FormField field={field("passport", "44")} mode={modeFor(field("passport", "44"))} example={displayValueFor(field("passport", "44"))} selected={selected.number === "44"} onSelect={setSelected} />
                  <div className={styles.twoColumnFields}>
                    <FormField field={field("passport", "45")} mode={modeFor(field("passport", "45"))} example={displayValueFor(field("passport", "45"))} selected={selected.number === "45"} onSelect={setSelected} />
                    <FormField field={field("passport", "46")} compact mode={modeFor(field("passport", "46"))} example={displayValueFor(field("passport", "46"))} selected={selected.number === "46"} onSelect={setSelected} />
                  </div>
                </FormSection>

                <FormSection section={sectionMap.get("visa")!} empty={allEmpty(sectionMap.get("visa")!)}>
                  <FormField field={field("visa", "48")} mode={modeFor(field("visa", "48"))} example={displayValueFor(field("visa", "48"))} selected={selected.number === "48"} onSelect={setSelected} />
                  <FormField field={field("visa", "49")} mode={modeFor(field("visa", "49"))} example={displayValueFor(field("visa", "49"))} selected={selected.number === "49"} onSelect={setSelected} />
                  <div className={styles.twoColumnFields}>
                    <FormField field={field("visa", "50")} mode={modeFor(field("visa", "50"))} example={displayValueFor(field("visa", "50"))} selected={selected.number === "50"} onSelect={setSelected} />
                    <FormField field={field("visa", "51")} compact mode={modeFor(field("visa", "51"))} example={displayValueFor(field("visa", "51"))} selected={selected.number === "51"} onSelect={setSelected} />
                  </div>
                  <div className={styles.twoColumnFields}>
                    <ChoiceField field={field("visa", "52")} mode={modeFor(field("visa", "52"))} example={displayValueFor(field("visa", "52"))} selected={selected.number === "52"} onSelect={setSelected} />
                    <ChoiceField field={field("visa", "53")} mode={modeFor(field("visa", "53"))} example={displayValueFor(field("visa", "53"))} selected={selected.number === "53"} onSelect={setSelected} />
                  </div>
                  <FormField field={field("visa", "54")} mode={modeFor(field("visa", "54"))} example={displayValueFor(field("visa", "54"))} selected={selected.number === "54"} onSelect={setSelected} />
                  <div className={styles.threeColumnFields}>
                    <FormField field={field("visa", "55")} compact mode={modeFor(field("visa", "55"))} example={displayValueFor(field("visa", "55"))} selected={selected.number === "55"} onSelect={setSelected} />
                    <FormField field={field("visa", "56")} mode={modeFor(field("visa", "56"))} example={displayValueFor(field("visa", "56"))} selected={selected.number === "56"} onSelect={setSelected} />
                    <FormField field={field("visa", "57")} mode={modeFor(field("visa", "57"))} example={displayValueFor(field("visa", "57"))} selected={selected.number === "57"} onSelect={setSelected} />
                  </div>
                </FormSection>
              </>
            )}

            {activeFormPage.number === 3 && (
              <>
                <FormSection section={sectionMap.get("travel")!} empty={true}>
                  <div className={styles.travelGrid}>
                    <ChoiceField field={field("travel", "59")} mode={modeFor(field("travel", "59"))} example="" selected={selected.number === "59"} onSelect={setSelected} />
                    <ChoiceField field={field("travel", "60")} mode={modeFor(field("travel", "60"))} example="" selected={selected.number === "60"} onSelect={setSelected} />
                    <ChoiceField field={field("travel", "61")} mode={modeFor(field("travel", "61"))} example="" selected={selected.number === "61"} onSelect={setSelected} />
                    <div className={styles.periodLabel}>62. PERIODO PER IL QUALE SI CHIEDE IL RINNOVO</div>
                    <ChoiceField field={field("travel", "63")} mode={modeFor(field("travel", "63"))} example="" selected={selected.number === "63"} onSelect={setSelected} />
                    <ChoiceField field={field("travel", "64")} mode={modeFor(field("travel", "64"))} example="" selected={selected.number === "64"} onSelect={setSelected} />
                  </div>
                </FormSection>

                <FormSection section={sectionMap.get("address")!} empty={false}>
                  <div className={styles.twoColumnFields}>
                    <FormField field={field("address", "66")} compact mode={modeFor(field("address", "66"))} example={displayValueFor(field("address", "66"))} selected={selected.number === "66"} onSelect={setSelected} />
                    <FormField field={field("address", "67")} mode={modeFor(field("address", "67"))} example={displayValueFor(field("address", "67"))} selected={selected.number === "67"} onSelect={setSelected} />
                  </div>
                  <FormField field={field("address", "68")} mode={modeFor(field("address", "68"))} example={displayValueFor(field("address", "68"))} selected={selected.number === "68"} onSelect={setSelected} />
                  <div className={styles.threeColumnFields}>
                    <FormField field={field("address", "69")} compact mode={modeFor(field("address", "69"))} example={displayValueFor(field("address", "69"))} selected={selected.number === "69"} onSelect={setSelected} />
                    <div className={styles.twoMiniFields}>
                      <FormField field={field("address", "70")} compact mode={modeFor(field("address", "70"))} example={displayValueFor(field("address", "70"))} selected={selected.number === "70"} onSelect={setSelected} />
                      <FormField field={field("address", "71")} compact mode={modeFor(field("address", "71"))} example={displayValueFor(field("address", "71"))} selected={selected.number === "71"} onSelect={setSelected} />
                    </div>
                    <FormField field={field("address", "72")} compact mode={modeFor(field("address", "72"))} example={displayValueFor(field("address", "72"))} selected={selected.number === "72"} onSelect={setSelected} />
                  </div>
                  <FormField field={field("address", "73")} mode={modeFor(field("address", "73"))} example={displayValueFor(field("address", "73"))} selected={selected.number === "73"} onSelect={setSelected} />
                  <div className={styles.twoColumnFields}>
                    <FormField field={field("address", "74")} mode={modeFor(field("address", "74"))} example="" selected={selected.number === "74"} onSelect={setSelected} />
                    <FormField field={field("address", "75")} mode={modeFor(field("address", "75"))} example={displayValueFor(field("address", "75"))} selected={selected.number === "75"} onSelect={setSelected} />
                  </div>
                </FormSection>

                <FormSection section={sectionMap.get("correspondence")!} empty={false}>
                  <FormField field={field("correspondence", "77")} mode={modeFor(field("correspondence", "77"))} example={displayValueFor(field("correspondence", "77"))} selected={selected.number === "77"} onSelect={setSelected} />
                  <div className={styles.twoColumnFields}>
                    <FormField field={field("correspondence", "78")} compact mode={modeFor(field("correspondence", "78"))} example={displayValueFor(field("correspondence", "78"))} selected={selected.number === "78"} onSelect={setSelected} />
                    <FormField field={field("correspondence", "79")} mode={modeFor(field("correspondence", "79"))} example={displayValueFor(field("correspondence", "79"))} selected={selected.number === "79"} onSelect={setSelected} />
                  </div>
                  <FormField field={field("correspondence", "80")} mode={modeFor(field("correspondence", "80"))} example={displayValueFor(field("correspondence", "80"))} selected={selected.number === "80"} onSelect={setSelected} />
                  <div className={styles.fourColumnFields}>
                    <FormField field={field("correspondence", "81")} compact mode={modeFor(field("correspondence", "81"))} example={displayValueFor(field("correspondence", "81"))} selected={selected.number === "81"} onSelect={setSelected} />
                    <FormField field={field("correspondence", "82")} compact mode={modeFor(field("correspondence", "82"))} example={displayValueFor(field("correspondence", "82"))} selected={selected.number === "82"} onSelect={setSelected} />
                    <FormField field={field("correspondence", "83")} compact mode={modeFor(field("correspondence", "83"))} example={displayValueFor(field("correspondence", "83"))} selected={selected.number === "83"} onSelect={setSelected} />
                    <FormField field={field("correspondence", "84")} compact mode={modeFor(field("correspondence", "84"))} example={displayValueFor(field("correspondence", "84"))} selected={selected.number === "84"} onSelect={setSelected} />
                  </div>
                </FormSection>

                <div className={styles.pagesEmpty}>
                  <span>Страницы 4–8 бумажного Modulo 1</span>
                  <strong>НЕ ВЫРЫВАТЬ · ОСТАВИТЬ ПУСТЫМИ</strong>
                  <p>Для сценария студента без семьи они остаются частью комплекта и учитываются в числе листов.</p>
                </div>
              </>
            )}

            <footer className={styles.paperFooter}>Mod. 209 Modulo 1 · Pagina {activeFormPage.number} di 8</footer>
          </div>

          <aside className={styles.detailPanel} data-mode={modeFor(selected)}>
            <div className={styles.detailTop}>
              <span>Поле {selected.number}</span>
              <span>{MODE_LABEL[modeFor(selected)]}</span>
            </div>
            <h3>{selected.it}</h3>
            <p className={styles.detailRu}>{selected.ru}</p>
            <dl>
              <div><dt>Откуда взять</dt><dd>{selected.source}</dd></div>
              <div><dt>Формат</dt><dd>{selected.format}</dd></div>
              {exampleFor(selected) && <div><dt>Пример</dt><dd>{exampleFor(selected)}</dd></div>}
              <div><dt>Частая ошибка</dt><dd>{selected.mistake}</dd></div>
            </dl>
            <p className={styles.exampleNote}>Серые буквы — выдуманный пример. На бумаге пиши свои данные чёрной ручкой.</p>
            <div className={styles.detailNav}>
              <button type="button" onClick={() => selectRelativeField(-1)} disabled={selectedPageIndex <= 0}>
                ← Предыдущее
              </button>
              <span>{Math.max(1, selectedPageIndex + 1)} / {activePageFields.length}</span>
              <button type="button" onClick={() => selectRelativeField(1)} disabled={selectedPageIndex < 0 || selectedPageIndex >= activePageFields.length - 1}>
                Следующее →
              </button>
            </div>
          </aside>
        </div>

        <div className={styles.mobilePager}>
          <button type="button" onClick={() => showPage(activePage - 1)} disabled={activePage === 0}>← Предыдущая страница</button>
          <button type="button" onClick={() => showPage(activePage + 1)} disabled={activePage === FORM_PAGES.length - 1}>Следующая страница →</button>
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

function FormHeader({ page, showExample, scenario }: { page: number; showExample: boolean; scenario: PermessoScenario }) {
  return (
    <header className={styles.paperHeader}>
      <div className={styles.headerTop}>
        <div className={styles.stateEmblem} aria-hidden>
          <span>★</span>
          <small>RI</small>
        </div>

        <div className={styles.ministry}>
          <b>MINISTERO DELL&apos;INTERNO</b>
          {page === 1 ? (
            <div className={styles.questoreBlock}>
              <div className={styles.questoreRow}>
                <span>Al Signor Questore di:</span>
                <span className={styles.questoreHandLine}>{showExample ? "FIRENZE" : ""}</span>
              </div>
              <div className={styles.questoreRow}>
                <span>(Sigla Provincia)</span>
                <CellRun count={2} value={showExample ? "FI" : ""} />
              </div>
            </div>
          ) : (
            <div className={styles.topInstruction}>1. SCRIVERE IN STAMPATELLO CON PENNA NERA</div>
          )}
        </div>

        <div className={styles.barcode} aria-label="Область штрихкода бумажного бланка">
          <span className={styles.barcodeBars}><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
          <small>IL TUO KIT HA UN NUMERO UNICO · NON SCRIVERE QUI</small>
        </div>
      </div>

      <div className={styles.headerBottom}>
        <div className={styles.modLabel}>MOD. 209<br />MODULO 1</div>
        <div className={styles.instruction}>1. SCRIVERE IN STAMPATELLO CON PENNA NERA</div>
        {page === 1 ? (
          <div className={styles.stampBox}>
            <small>MARCA DA BOLLO</small>
            <strong>€ 16,00</strong>
            <span>NON SCRIVERE · QUI VA LA MARCA</span>
          </div>
        ) : (
          <div className={styles.pageMark}>PAGINA {page} DI 8</div>
        )}
      </div>

      <span className={styles.headerScenario}>{scenario === "rilascio" ? "RILASCIO" : "RINNOVO"}</span>
    </header>
  );
}

function FormSection({ section, empty, children }: { section: TrainerSection; empty: boolean; children: ReactNode }) {
  return (
    <section className={styles.formSection} data-empty={empty || undefined}>
      <header>
        <b>{section.label.toUpperCase()} · {section.title.toUpperCase()}</b>
        {section.note && <span>{section.note}</span>}
        {empty && <strong className={styles.skipBadge}>ПРОПУСТИ ЦЕЛИКОМ</strong>}
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function ChoiceField({
  field, mode, example, selected, onSelect,
}: {
  field: TrainerField; mode: FieldMode; example: string; selected: boolean; onSelect: (field: TrainerField) => void;
}) {
  return (
    <button
      type="button"
      aria-label={"Поле " + field.number + ", " + field.it + ", " + MODE_LABEL[mode]}
      className={styles.choiceField}
      data-mode={mode}
      data-selected={selected || undefined}
      onClick={() => onSelect(field)}
    >
      <span><b>{field.number}. {field.it}</b><small>{field.ru}</small></span>
      <span className={styles.xBox}>{example === "X" ? "X" : ""}</span>
      {mode !== "write" && <em>{MODE_LABEL[mode]}</em>}
    </button>
  );
}

function RefugeeField({
  field, mode, value, selected, onSelect,
}: {
  field: TrainerField; mode: FieldMode; value: string; selected: boolean; onSelect: (field: TrainerField) => void;
}) {
  const upper = value.toUpperCase();
  return (
    <button
      type="button"
      aria-label={"Поле 37, Rifugiato, " + MODE_LABEL[mode]}
      className={styles.refugeeField}
      data-mode={mode}
      data-selected={selected || undefined}
      onClick={() => onSelect(field)}
    >
      <span className={styles.formLabel}><b>37. RIFUGIATO</b><small>Статус беженца</small></span>
      <span className={styles.yesNo}>
        <span><b>SI</b><i>{upper === "SI" ? "X" : ""}</i></span>
        <span><b>NO</b><i>{upper === "NO" ? "X" : ""}</i></span>
      </span>
    </button>
  );
}

function FormField({
  field,
  mode,
  example,
  selected,
  onSelect,
  compact = false,
  signature = false,
  className = "",
}: {
  field: TrainerField;
  mode: FieldMode;
  example: string;
  selected: boolean;
  onSelect: (field: TrainerField) => void;
  compact?: boolean;
  signature?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={"Поле " + field.number + ", " + field.it + ", " + MODE_LABEL[mode]}
      className={styles.formField + " " + (compact ? styles.compactField : "") + " " + (signature ? styles.signatureField : "") + " " + className}
      data-mode={mode}
      data-selected={selected || undefined}
      onClick={() => onSelect(field)}
    >
      <span className={styles.formLabel}><b>{field.number}. {field.it}</b><small>{field.ru}</small></span>
      {signature ? <span className={styles.signatureLine} /> : <FieldCells field={field} value={example} compact={compact} />}
      {mode !== "write" && <em>{MODE_LABEL[mode]}</em>}
    </button>
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
