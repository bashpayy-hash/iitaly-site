"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { ADMISSION_SOURCES } from "@/data/admissions";
import { GUIDE_STAGES, GUIDE_TOPICS, guideHref, guideStageHref, stageForGuide } from "./guideCatalogue";
import { isGuideId, openGuideHelper } from "./guideJourney";
import { GuideTiles } from "./GuideTiles";
import ui from "./guide-pages.module.css";
import styles from "./guide-explorer.module.css";

const normalize = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е");

/* Справочник: поиск и три раздела сверху, ниже — галерея тем в один ряд.
   Каждая тема ведёт на свою страницу, а оттуда — на отдельные страницы шагов. */
export function GuideDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  // The gallery walks through the topics by itself only until the visitor
  // starts searching or filtering.
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    const followLocation = () => {
      const id = window.location.hash.slice(1);
      const params = new URLSearchParams(window.location.search);
      // Old links: /guides#cimea and the former inspector's /guides?topic=cimea.
      const topic = params.get("topic") || "";
      if (isGuideId(id)) router.replace(guideHref(id));
      else if (isGuideId(topic)) router.replace(guideHref(topic));
      else {
        setQuery(params.get("q") || "");
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
  const stage = GUIDE_STAGES.find(item => item.id === category);
  function location(key: string, value: string) {
    const url = new URL(window.location.href);
    if (value && value !== "all") url.searchParams.set(key, value); else url.searchParams.delete(key);
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }
  return <>
    <search className={ui.search} aria-label="Поиск по справочнику">
      <label htmlFor="guide-search">Найти тему</label>
      <div className={ui.searchField}><Search size={20} aria-hidden="true" /><input ref={inputRef} id="guide-search" type="search" value={query} onChange={event=>{setTouched(true);setQuery(event.target.value);location("q",event.target.value);}} placeholder="Аттестат, перевод, виза, DSU…" autoComplete="off" />{query && <button type="button" aria-label="Сбросить поиск" onClick={()=>{setQuery("");location("q","");inputRef.current?.focus();}}><X size={18} aria-hidden="true" /></button>}</div>
    </search>
    <div className={styles.categories} aria-label="Фильтр тем">
      {[{id:"all",title:"Все темы"},...GUIDE_STAGES].map(item=><button type="button" key={item.id} data-guide-category={item.id} aria-pressed={category===item.id} onClick={()=>{setTouched(true);setCategory(item.id);location("category",item.id);}}>{item.title}</button>)}
    </div>
    {/* Owner, 3 Nov: no caption over the band. The count is spoken only while
        searching (it answers the query); the section link appears with a section. */}
    <p className={terms.length ? styles.resultCount : "sr-only"} role="status">{terms.length ? `Найдено тем: ${matches.length}` : ""}</p>
    {stage && <div className={styles.resultRow}><Link className={styles.stageLink} data-guide-stage={stage.id} href={guideStageHref(stage.id)}>Раздел целиком: {stage.title}<ArrowRight size={15} aria-hidden="true" /></Link></div>}
    {matches.length ? <section className={styles.explorer} aria-label="Темы справочника" data-guide-explorer>
      <GuideTiles key={matches.map(guide => guide.id).join()} guides={matches} variant="gallery" autoplay={!touched && !query && category === "all"} />
    </section> : <section className={ui.directory}><h2>Такой темы не нашли</h2><p>Попробуй другое слово или выбери «Все темы».</p><button className={ui.textLink} type="button" onClick={()=>openGuideHelper(undefined,query)}>Спросить Веспи<ArrowRight size={17} aria-hidden="true" /></button></section>}
  </>;
}
