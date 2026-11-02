"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { ADMISSION_SOURCES } from "@/data/admissions";
import { GUIDE_STAGES, GUIDE_TOPICS, guideHref, guideStageHref, stageForGuide } from "./guideCatalogue";
import { guideFacts } from "./guideFacts";
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
  const userSelected = useRef(false);
  useEffect(() => {
    // On phones the inspector unfolds under the chosen topic; keep that topic
    // in view when an earlier inspector above it collapses.
    if (!userSelected.current || !guide || !matchMedia("(max-width: 860px)").matches) return;
    userSelected.current = false;
    const row = indexRef.current?.querySelector<HTMLElement>(`[data-guide-select="${guide.id}"]`);
    const top = row?.getBoundingClientRect().top;
    if (top !== undefined && (top < 72 || top > innerHeight * .6)) window.scrollBy({ top: top - 88, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [guide]);
  const facts = guide ? guideFacts(guide) : [];
  const number = guide ? GUIDE_TOPICS.indexOf(guide) + 1 : 0;
  function location(key: string, value: string, push = false) {
    const url = new URL(window.location.href);
    if (value && value !== "all") url.searchParams.set(key, value); else url.searchParams.delete(key);
    window.history[push ? "pushState" : "replaceState"](window.history.state, "", url.pathname + url.search);
  }
  function select(id: string) { userSelected.current = true; setSelectedId(id); location("topic", id, true); }
  return <>
    <search className={ui.search} aria-label="Поиск по справочнику">
      <label htmlFor="guide-search">Найти тему</label>
      <div className={ui.searchField}><Search size={20} aria-hidden="true" /><input ref={inputRef} id="guide-search" type="search" value={query} onChange={event=>{setQuery(event.target.value);location("q",event.target.value);}} placeholder="Аттестат, перевод, виза, DSU…" autoComplete="off" />{query && <button type="button" aria-label="Сбросить поиск" onClick={()=>{setQuery("");location("q","");inputRef.current?.focus();}}><X size={18} aria-hidden="true" /></button>}</div>
    </search>
    <div className={styles.categories} aria-label="Фильтр тем">
      {[{id:"all",title:"Все темы"},...GUIDE_STAGES].map(item=><button type="button" key={item.id} data-guide-category={item.id} aria-pressed={category===item.id} onClick={()=>{setCategory(item.id);location("category",item.id);}}>{item.title}</button>)}
    </div>
    <p className={styles.resultCount} role="status">{terms.length ? `Найдено тем: ${matches.length}` : "Выбери тему — коротко о ней откроется рядом"}</p>
    {guide ? <section className={styles.explorer} aria-label="Выбор темы и превью" data-guide-explorer>
      {/* Типографский индекс по референсу sebneil.com: крупные названия тем,
          выбранная — в фокусе, остальные приглушены. Инспектор на широком
          экране выезжает справа и держится при прокрутке, на телефоне
          раскрывается прямо под выбранной темой (порядок задаёт CSS order). */}
      <div className={styles.index} role="group" aria-label="Темы справочника" ref={indexRef} data-spotlight={guide.id} onKeyDown={event=>{
        if (!(event.target as HTMLElement).closest("[data-guide-select]")) return;
        if (!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
        event.preventDefault();
        const current = matches.findIndex(topic=>topic.id===guide.id);
        const position = event.key==="Home" ? 0 : event.key==="End" ? matches.length-1 : (current+(["ArrowDown","ArrowRight"].includes(event.key)?1:-1)+matches.length)%matches.length;
        select(matches[position].id);
        indexRef.current?.querySelector<HTMLElement>(`[data-guide-select="${matches[position].id}"]`)?.focus({preventScroll:true});
      }}>
        {matches.map((topic, position)=><button type="button" key={topic.id} id={`topic-${topic.id}`} aria-controls="guide-inspector" aria-expanded={guide.id===topic.id} className={styles.topic} data-guide-select={topic.id} style={{order:position*2}} onClick={()=>select(topic.id)}>
          <span className={styles.indexNumber}>{String(GUIDE_TOPICS.indexOf(topic)+1).padStart(2,"0")}</span><span className={styles.topicTitle}>{topic.title}</span><span className={styles.topicStage} aria-hidden="true">{({choose:"Маршрут",prepare:"До отъезда",arrival:"В Италии"} as Record<string,string>)[stageForGuide(topic.id)?.id || ""]}</span>
        </button>)}
        <div className={styles.inspector} id="guide-inspector" role="region" aria-labelledby={`topic-${guide.id}`} tabIndex={-1} style={{order:matches.indexOf(guide)*2+1}}>
          <div key={guide.id} className={styles.preview} data-guide-preview={guide.id}>
            <header className={styles.previewHead}><span>GUIDE / {String(number).padStart(2,"0")}</span><span>{stage?.title}</span></header>
            <h2>{guide.title}</h2>
            <p className={styles.teaser}>{guide.teaser}</p>
            {guide.lead && <p className={styles.sceneNote}>{guide.lead}</p>}
            <dl className={styles.parameters} data-guide-facts>
              {facts.map(fact=><div key={fact.label} data-known={fact.known}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
            </dl>
            <Link className={styles.open} href={guideHref(guide.id)}>Открыть подробный наглядный разбор<ArrowRight size={18} aria-hidden="true" /></Link>
            <p className={styles.previewFoot}>
              {stage && <Link className={styles.stageLink} data-guide-stage={stage.id} href={guideStageHref(stage.id)}>Другие темы: {stage.title}</Link>}
              <span>{guide.sources.length} {guide.sources.length === 1 ? "источник" : guide.sources.length < 5 ? "источника" : "источников"}</span>
            </p>
          </div>
        </div>
      </div>
    </section> : <section className={ui.directory}><h2>Такой темы не нашли</h2><p>Попробуй другое слово или выбери «Все темы».</p><button className={ui.textLink} type="button" onClick={()=>openGuideHelper(undefined,query)}>Спросить Веспи<ArrowRight size={17} aria-hidden="true" /></button></section>}
  </>;
}
