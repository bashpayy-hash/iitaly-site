"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Search, X, FileText } from "lucide-react";
import { ADMISSION_SOURCES } from "@/data/admissions";
import { GUIDE_STAGES, GUIDE_TOPICS, guideHref, guideStageHref, stageForGuide } from "./guideCatalogue";
import { isGuideId, openGuideHelper } from "./guideJourney";
import ui from "./guide-pages.module.css";
import styles from "./guide-explorer.module.css";

const normalize = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е");

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
  const cost = guide?.rows.find(row => row.label === "Стоимость")?.value || (guide?.id === "codice" ? "Бесплатно" : guide?.id === "cimea" ? "Verification: €150 за квалификацию" : "Уточнить для своего случая");
  const duration = guide?.rows.find(row => row.label === "Срок")?.value || (guide?.id === "cimea" ? "Verification: 60 рабочих дней после оплаты и полного комплекта; возможны внешние проверки" : "Зависит от процедуры");
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
          <span className={styles.indexNumber}>{String(GUIDE_TOPICS.indexOf(topic)+1).padStart(2,"0")}</span><span>{topic.title}</span><ArrowUpRight size={18} aria-hidden="true" />
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
          <dl className={styles.parameters}>
            <div><dt>Срок оформления</dt><dd>{duration}</dd></div>
            <div><dt>Стоимость</dt><dd>{cost}</dd></div>
            <div><dt>Дедлайн</dt><dd>{guide.id==="permesso" ? guide.teaser : "По условиям заявки"}</dd></div>
            <div><dt>Сложность</dt><dd>Зависит от комплекта документов</dd></div>
          </dl>
          <Link className={styles.open} href={guideHref(guide.id)}>Открыть подробный наглядный разбор<ArrowRight size={18} aria-hidden="true" /></Link>
          {stage && <Link className={styles.stageLink} data-guide-stage={stage.id} href={guideStageHref(stage.id)}>Другие темы: {stage.title}</Link>}
        </div>
      </div>
    </section> : <section className={ui.directory}><h2>Такой темы не нашли</h2><p>Попробуй другое слово или выбери «Все темы».</p><button className={ui.textLink} type="button" onClick={()=>openGuideHelper(undefined,query)}>Спросить Веспи<ArrowRight size={17} aria-hidden="true" /></button></section>}
  </>;
}
