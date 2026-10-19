"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { JourneyTitle, StepDot } from "@/components/journey/JourneyUI";
import { VisaSection } from "@/components/guides/VisaSection";
import { GUIDES, type GuideCard } from "@/data/guides";
import { ADMISSION_SOURCES, REVIEWED_AT, REVIEWED_LABEL } from "@/data/admissions";
import { isGuideId, type GuideId } from "@/components/guides/guideJourney";
import ui from "./guides.module.css";
import { FramedArtwork } from "@/components/marketing/FramedArtwork";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionPanel } from "@/components/motion/TransitionPanel";

const SCENARIOS = [
  { id:"education",title:"Школа / 11 классов",description:"Как компенсировать год и выбрать путь к поступлению.",ids:["education","tests","minors","military"] },
  { id:"documents",title:"Документы и признание",description:"Апостиль, перевод и подтверждение CIMEA / DoV.",ids:["apostille","translation","cimea"] },
  { id:"scholarship",title:"Стипендия DSU",description:"Справки о составе семьи, доходах и расчёт ISEEU.",ids:["con","iseeu"] },
  { id:"visa",title:"Universitaly и виза D",description:"Предзапись, подача и первые документы после приезда.",ids:["visa","permesso","codice","health-travel"] },
] satisfies {id:string;title:string;description:string;ids:GuideId[]}[];
const VISA: GuideCard={id:"visa",title:"Universitaly и виза D",teaser:"Подготовь предзапись и визовый комплект.",rows:[],sources:["visa","procedure","visaWhere","visaTiming"]};
const TOPICS=[...GUIDES,VISA];
function scenarioFor(id:GuideId){return SCENARIOS.findIndex(s=>(s.ids as string[]).includes(id));}
export default function GuidesPage(){
  const [topic,setTopic]=useState<GuideId|null>(null);
  const [query,setQuery]=useState("");
  const heading=useRef<HTMLHeadingElement>(null);
  const current=topic?TOPICS.find(g=>g.id===topic):null;
  const scenarioIndex=topic?scenarioFor(topic):-1;
  const scenario=SCENARIOS[scenarioIndex];
  const step=scenario?(scenario.ids as string[]).indexOf(topic!):0;
  const results=query.trim()?TOPICS.filter(g=>`${g.title} ${g.teaser} ${g.rows.map(r=>r.value).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())):[];
  useEffect(()=>{const follow=()=>{const hash=decodeURIComponent(window.location.hash.slice(1));setTopic(isGuideId(hash)?hash:null);};follow();window.addEventListener("hashchange",follow);window.addEventListener("popstate",follow);return()=>{window.removeEventListener("hashchange",follow);window.removeEventListener("popstate",follow);};},[]);
  useEffect(()=>{window.dispatchEvent(new CustomEvent("iitaly:guide-context",{detail:{guideId:topic||undefined}}));return()=>{window.dispatchEvent(new CustomEvent("iitaly:guide-context",{detail:{}}));};},[topic]);
  function select(id:GuideId|null){setTopic(id);setQuery("");window.history.pushState({},"",id?`#${id}`:"/guides");requestAnimationFrame(()=>{if(id){heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:"start",behavior:"instant"});}else document.getElementById("guide-start")?.scrollIntoView({block:"start",behavior:"instant"});});}
  return <MarketingLayout><div className={ui.shell} data-guides-meta>
    <header id="guide-start" className={`journey-page-header ${ui.header}`} data-section="guides-header"><Reveal><p className="journey-eyebrow">Справочник · бесплатно</p><JourneyTitle as="h1">Бюрократия.<br/><em>По порядку.</em></JourneyTitle><p className={ui.description}>Не нужно разбираться во всём сразу. Выбери свою ситуацию — пройдём необходимые темы шаг за шагом.</p></Reveal><FramedArtwork scene="canal" variant="miniature" className={ui.headerArt} /></header>
    <div className="journey-body">
    <TransitionPanel transitionKey={topic || "start"}>
    {!current ? <section className={ui.start} aria-labelledby="scenario-heading"><h2 id="scenario-heading">Какая у тебя сейчас ситуация?</h2><div className={ui.scenarios}>{SCENARIOS.map((item,index)=><Reveal key={item.id} delay={index * 0.06} className={ui.scenarioReveal}><button type="button" className={ui.scenario} data-guide-scenario={item.id} onClick={()=>select(item.ids[0])}><span className={ui.number}>0{index+1}<StepDot/></span><h3>{item.title}</h3><p>{item.description}</p><span className={ui.scenarioAction}>Начать разбор <span aria-hidden>↗</span></span></button></Reveal>)}</div>
      <details className={ui.search}><summary>Найти конкретную тему</summary><label htmlFor="guide-search">Поиск по справочнику</label><input id="guide-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Например, перевод или permesso"/><p role="status">{query?`Найдено тем: ${results.length}`:"Введи название документа или вопрос."}</p><ul>{results.map(g=><li key={g.id}><button className="journey-link" onClick={()=>{if(isGuideId(g.id))select(g.id);}}>{g.title} <span aria-hidden>↗</span></button></li>)}</ul></details>
    </section> : <section className={ui.journey} aria-label="Пошаговый разбор">
      <div className={ui.journeyTop}><button className="journey-link" onClick={()=>select(null)}>Изменить ситуацию</button><span>{scenario?.title} · {step+1} / {scenario?.ids.length}</span></div>
      <ol className={ui.progress} tabIndex={0} aria-label="Порядок чтения">{scenario?.ids.map((id,index)=><li key={id} aria-current={id===topic?"step":undefined}><StepDot active={index<=step}/><span>{TOPICS.find(g=>g.id===id)?.title}</span></li>)}</ol>
      <article className={ui.article} data-guide-panel={topic} data-guide-current={topic}><h2 ref={heading} tabIndex={-1}>{current.title}</h2>{current.lead&&<p className={ui.lead}>{current.lead}</p>}
        {topic==="visa"?<VisaSection/>:<dl className={ui.facts}>{current.rows.map(row=><div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>}
        {current.warn&&<aside className={ui.note}><strong>Перед подачей</strong><p>{current.warn}</p></aside>}
        {topic==="permesso"&&<Link href="/guides/permesso-modulo-1" className="journey-link">Открыть тренажёр бланка Modulo 1 ↗</Link>}
        <footer className={ui.sources}><h3>Официальные источники</h3><ul>{current.sources.map(id=><li key={id}><a href={ADMISSION_SOURCES[id].href} target="_blank" rel="noopener noreferrer">{ADMISSION_SOURCES[id].label} ↗</a></li>)}</ul></footer>
        <div className={ui.next}>{step>0?<button className="journey-link" onClick={()=>select(scenario.ids[step-1])}>Предыдущий шаг</button>:<span/>}{scenario&&step<scenario.ids.length-1?<button className="journey-button" onClick={()=>select(scenario.ids[step+1])}><span>Далее: {TOPICS.find(g=>g.id===scenario.ids[step+1])?.title}</span></button>:<Link href="/plan#questionnaire" className="journey-button"><span>Перейти к своему плану</span></Link>}</div>
      </article>
    </section>}
    </TransitionPanel>
    <div className={ui.review}><span>Материалы сверены <time dateTime={REVIEWED_AT}>{REVIEWED_LABEL}</time></span><Link href="/changes-2026-27" className="journey-link">Изменения 2026/27 ↗</Link></div>
    </div></div></MarketingLayout>;
}
