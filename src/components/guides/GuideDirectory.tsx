"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Search, X, FileText } from "lucide-react";
import { ADMISSION_SOURCES, PERMESSO_COST_LABEL } from "@/data/admissions";
import { VISA_KEY_FACTS, type GuideCard } from "@/data/guides";
import { GUIDE_STAGES, GUIDE_TOPICS, VISA_PARTS, guideHref, guideStageHref, stageForGuide } from "./guideCatalogue";
import { isGuideId, openGuideHelper } from "./guideJourney";
import ui from "./guide-pages.module.css";
import styles from "./guide-explorer.module.css";

const normalize = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е");
const plural = (n: number, one: string, few: string, many: string) => n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;

/* Бейджи инспектора — короткие цитаты из самих гайдов (src/data/guides.ts),
   сверенные вручную: меняй вместе с текстом гайда. Где в гайде нет срока,
   цены или дедлайна, бейдж честно говорит «по ситуации», а не придумывает.
   «Сложность» — сколько пунктов в подробном разборе. */
const GUIDE_FACTS: Record<string, { duration?: string; cost?: string; deadline?: string }> = {
  tests: { cost: "€55 за попытку CEnT-S" },
  apostille: { duration: "до 15 рабочих дней", cost: "0,5 МРП за документ" },
  cimea: { duration: "Verification: 60 рабочих дней после оплаты", cost: "Verification: €150 за квалификацию" },
  visa: { duration: `${VISA_KEY_FACTS[2].value} · обычный общий срок`, cost: `${VISA_KEY_FACTS[1].value} · сервисный сбор отдельно`, deadline: "Национальный предел: 30 ноября 2026 для 2026/27" },
  permesso: { cost: `${PERMESSO_COST_LABEL} для взрослого при сроке свыше 3 месяцев до года`, deadline: "первые восемь рабочих дней после въезда" },
  codice: { cost: "выдача бесплатна" },
  "health-travel": { cost: "SSN: от €700 за календарный год" },
};

function guideFacts(guide: GuideCard) {
  const known = GUIDE_FACTS[guide.id] || {};
  const points = guide.id === "visa" ? VISA_PARTS.length : guide.rows.length;
  return [
    { label: "Срок оформления", value: known.duration || "по ситуации", known: Boolean(known.duration) },
    { label: "Стоимость", value: known.cost || "по ситуации", known: Boolean(known.cost) },
    { label: "Дедлайн", value: known.deadline || "по условиям заявки", known: Boolean(known.deadline) },
    { label: "Сложность", value: `${points} ${plural(points, "пункт", "пункта", "пунктов")} в разборе`, known: true },
  ];
}

export function GuideDirectory() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("visa");
  const [category, setCategory] = useState("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const indexRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const followLocation = () => {
      const id = window.location.hash.slice(1);
      if (isGuideId(id)) router.replace(guideHref(id));
      else {
        const params = new URLSearchParams(window.location.search);
        setQuery(params.get("q") || "");
        setSelectedId(GUIDE_TOPICS.some(topic => topic.id === params.get("topic")) ? params.get("topic")! : "visa");
        setCategory(GUIDE_STAGES.some(stage => stage.id === params.get("category")) ? params.get("category")! : "all");
      }
    };
    followLocation();
    window.addEventListener("hashchange", followLocation); window.addEventListener("popstate", followLocation);
    return () => { window.removeEventListener("hashchange", followLocation); window.removeEventListener("popstate", followLocation); };
  }, [router]);
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const matches = GUIDE_TOPICS.filter(guide => {
    const haystack = normalize([guide.title,guide.teaser,guide.lead,guide.warn,...guide.rows.map(row => `${row.label} ${row.value}`),...guide.sources.map(id => ADMISSION_SOURCES[id].label),guide.id === "visa" ? "банк счет выписка деньги средства страховка консульство VFS финансовая гарантия" : ""].join(" "));
    return (category === "all" || stageForGuide(guide.id)?.id === category) && terms.every(term => haystack.includes(term));
  });
  const guide = matches.find(topic => topic.id === selectedId) || matches[0];
  const stage = guide && stageForGuide(guide.id);
  useEffect(() => {
    const active = indexRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (active && indexRef.current && indexRef.current.scrollWidth > indexRef.current.clientWidth) {
      indexRef.current.scrollLeft += active.getBoundingClientRect().left - indexRef.current.getBoundingClientRect().left;
    }
  }, [guide?.id]);
  const facts = guide ? guideFacts(guide) : [];
  const number = guide ? GUIDE_TOPICS.indexOf(guide) + 1 : 0;
  function location(key: string, value: string, push = false) {
    const url = new URL(window.location.href);
    if (value && value !== "all") url.searchParams.set(key, value); else url.searchParams.delete(key);
    window.history[push ? "pushState" : "replaceState"](window.history.state, "", url.pathname + url.search);
  }
  function select(id: string) { setSelectedId(id); location("topic", id, true); }
  return <>
    <search className={ui.search} aria-label="Поиск по справочнику">
      <label htmlFor="guide-search">Найти тему</label>
      <div className={ui.searchField}><Search size={20} aria-hidden="true" /><input ref={inputRef} id="guide-search" type="search" value={query} onChange={event=>{setQuery(event.target.value);location("q",event.target.value);}} placeholder="Аттестат, перевод, виза, DSU…" autoComplete="off" />{query && <button type="button" aria-label="Сбросить поиск" onClick={()=>{setQuery("");location("q","");inputRef.current?.focus();}}><X size={18} aria-hidden="true" /></button>}</div>
    </search>
    <div className={styles.categories} aria-label="Фильтр тем">
      {[{id:"all",title:"Все темы"},...GUIDE_STAGES].map(item=><button type="button" key={item.id} data-guide-category={item.id} aria-pressed={category===item.id} onClick={()=>{setCategory(item.id);location("category",item.id);}}>{item.title}</button>)}
    </div>
    <p className={styles.resultCount} role="status">{terms.length ? `Найдено тем: ${matches.length}` : "Выбери тему — разбор появится справа"}</p>
    {guide ? <section className={styles.explorer} aria-label="Выбор темы и превью" data-guide-explorer>
      <div className={styles.index} role="tablist" aria-label="Темы справочника" aria-orientation="vertical" ref={indexRef} onKeyDown={event=>{
        if (!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
        event.preventDefault();
        const current = matches.findIndex(topic=>topic.id===guide.id);
        const position = event.key==="Home" ? 0 : event.key==="End" ? matches.length-1 : (current+(["ArrowDown","ArrowRight"].includes(event.key)?1:-1)+matches.length)%matches.length;
        select(matches[position].id);
        indexRef.current?.querySelector<HTMLElement>(`[data-guide-select="${matches[position].id}"]`)?.focus({preventScroll:true});
      }}>
        {matches.map(topic=><button type="button" role="tab" key={topic.id} id={`topic-${topic.id}`} aria-controls="guide-inspector" aria-selected={guide.id===topic.id} tabIndex={guide.id===topic.id?0:-1} className={styles.topic} data-guide-select={topic.id} onClick={()=>select(topic.id)}>
          <span className={styles.indexNumber}>{String(GUIDE_TOPICS.indexOf(topic)+1).padStart(2,"0")}</span><span className={styles.topicTitle}>{topic.title}</span><span className={styles.topicStage} aria-hidden="true">{({choose:"Маршрут",prepare:"До отъезда",arrival:"В Италии"} as Record<string,string>)[stageForGuide(topic.id)?.id || ""]}</span><ArrowUpRight size={18} aria-hidden="true" />
        </button>)}
      </div>
      <div className={styles.inspector} id="guide-inspector" role="tabpanel" aria-labelledby={`topic-${guide.id}`} tabIndex={0}>
        <div key={guide.id} className={styles.preview} data-guide-preview={guide.id}>
          <header className={styles.previewHead}><h2>{guide.title}</h2><Link className={styles.roundLink} href={guideHref(guide.id)} aria-label={`Открыть: ${guide.title}`}><ArrowUpRight size={20} aria-hidden="true" /></Link></header>
          <div className={styles.documentScene}>
            <div className={styles.sceneBar}><span>GUIDE / {String(number).padStart(2,"0")}</span><FileText size={18} aria-hidden="true" /></div>
            <p>{guide.teaser}</p>
            {guide.lead && <p className={styles.sceneNote}>{guide.lead}</p>}
            <div className={styles.sceneFooter}><span>{stage?.title}</span><span>{guide.sources.length} {guide.sources.length === 1 ? "источник" : guide.sources.length < 5 ? "источника" : "источников"}</span></div>
          </div>
          <dl className={styles.parameters} data-guide-facts>
            {facts.map(fact=><div key={fact.label} data-known={fact.known}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
          </dl>
          <Link className={styles.open} href={guideHref(guide.id)}>Открыть подробный наглядный разбор<ArrowRight size={18} aria-hidden="true" /></Link>
          {stage && <Link className={styles.stageLink} data-guide-stage={stage.id} href={guideStageHref(stage.id)}>Другие темы: {stage.title}</Link>}
        </div>
      </div>
    </section> : <section className={ui.directory}><h2>Такой темы не нашли</h2><p>Попробуй другое слово или выбери «Все темы».</p><button className={ui.textLink} type="button" onClick={()=>openGuideHelper(undefined,query)}>Спросить Веспи<ArrowRight size={17} aria-hidden="true" /></button></section>}
  </>;
}
