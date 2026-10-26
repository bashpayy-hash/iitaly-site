"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { ADMISSION_SOURCES } from "@/data/admissions";
import { GUIDE_STAGES, GUIDE_TOPICS, guideHref, guideStageHref } from "./guideCatalogue";
import { isGuideId, openGuideHelper } from "./guideJourney";
import ui from "./guide-pages.module.css";
import { StoryArtwork } from "@/components/story/StoryArtwork";

const normalize = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е");
export function GuideDirectory() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    const followLocation = () => {
      const id = window.location.hash.slice(1);
      if (isGuideId(id)) router.replace(guideHref(id));
      else setQuery(new URLSearchParams(window.location.search).get("q") || "");
    };
    followLocation();
    window.addEventListener("hashchange", followLocation); window.addEventListener("popstate", followLocation);
    return () => { window.removeEventListener("hashchange", followLocation); window.removeEventListener("popstate", followLocation); };
  }, [router]);
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const matches = GUIDE_TOPICS.filter(guide => {
    const haystack = normalize([guide.title,guide.teaser,guide.lead,guide.warn,...guide.rows.map(row => `${row.label} ${row.value}`),...guide.sources.map(id => ADMISSION_SOURCES[id].label),guide.id === "visa" ? "банк счет выписка деньги средства страховка консульство VFS финансовая гарантия" : ""].join(" "));
    return terms.every(term => haystack.includes(term));
  });
  function updateQuery(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set("q",value); else url.searchParams.delete("q");
    window.history.replaceState(window.history.state,"",url.pathname+url.search);
  }
  return <>
    <search className={ui.search} aria-label="Поиск по справочнику">
      <label htmlFor="guide-search">Найти тему</label>
      <div className={ui.searchField}><Search size={20} aria-hidden="true" /><input ref={inputRef} id="guide-search" type="search" value={query} onChange={event=>updateQuery(event.target.value)} placeholder="Аттестат, перевод, виза, DSU…" autoComplete="off" />{query && <button type="button" aria-label="Сбросить поиск" onClick={()=>{ updateQuery(""); inputRef.current?.focus(); }}><X size={18} aria-hidden="true" /></button>}</div>
    </search>
    {terms.length ? <section className={ui.directory} aria-labelledby="guide-results-title">
      <h2 id="guide-results-title">{matches.length ? "Подходящие темы" : "Такой темы не нашли"}</h2>
      <p role="status" className={ui.reviewed}>Найдено тем: {matches.length}</p>
      {matches.length ? <ul className={ui.topicList}>{matches.map(guide=><li key={guide.id}><Link href={guideHref(guide.id)} data-guide-select={guide.id}><span><strong>{guide.title}</strong><span>{guide.teaser}</span></span><ArrowRight size={20} aria-hidden="true" /></Link></li>)}</ul>
        : <><p>Попробуй другое слово, например «перевод» или «стипендия».</p><button className={ui.textLink} type="button" onClick={()=>openGuideHelper(undefined,query)}>Спросить Веспи<ArrowRight size={17} aria-hidden="true" /></button></>}
    </section> : <nav className={ui.directory} aria-label="Разделы справочника">
      <ul className={ui.stageList}>{GUIDE_STAGES.map(stage=><li key={stage.id}><Link href={guideStageHref(stage.id)} data-guide-stage={stage.id}><StoryArtwork subject={stage.id === "choose" ? "calendar" : stage.id === "arrival" ? "key" : "envelope"} /><span><strong>{stage.title}</strong><span>{stage.description}</span></span><ArrowRight size={24} aria-hidden="true" /></Link></li>)}</ul>
    </nav>}
  </>;
}
