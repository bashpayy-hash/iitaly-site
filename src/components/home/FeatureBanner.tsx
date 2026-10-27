"use client";

import { useState } from "react";
import { ArrowRight, FileText, Plane } from "lucide-react";
import { SceneCard } from "@/components/journey/SceneCard";
import { GUIDE_TOPICS, GUIDE_STAGES, guideHref } from "@/components/guides/guideCatalogue";
import styles from "./journey-scenes.module.css";

export function FeatureBanner() {
  const [stageIndex, setStageIndex] = useState(0);
  const [topicId, setTopicId] = useState("permesso");
  const stage = GUIDE_STAGES[stageIndex];
  const topic = GUIDE_TOPICS.find(item => item.id === topicId)!;
  const arrival = GUIDE_TOPICS.filter(item => ["permesso", "codice", "health-travel"].includes(item.id));
  return <section className={styles.section} data-section="feature" aria-label="План и первые шаги в Италии">
    <SceneCard title={<>Один шаг.<br />Понятный маршрут.</>} href="/plan" actionLabel="Составить мой план" caption="Ответь на вопросы о себе. План покажет, с чего начать и какой шаг будет следующим.">
      <div className={styles.window}>
        <div className={styles.windowBar}><span>FLIGHT PLAN / ОБЗОР</span><Plane size={17} aria-hidden="true" /></div>
        <div className={styles.stages} aria-label="Превью этапов">
          {GUIDE_STAGES.map((item,index)=><button type="button" key={item.id} aria-pressed={index===stageIndex} onClick={()=>setStageIndex(index)}><span>{String(index+1).padStart(2,"0")}</span>{["Маршрут","До отъезда","В Италии"][index]}</button>)}
        </div>
        <div className={styles.content} key={stage.id}><span className={styles.position}>ЭТАП {String(stageIndex+1).padStart(2,"0")}</span><h3>{stage.title}</h3><p>{stage.description}</p></div>
        <div className={styles.windowFoot}><span>Казахстан</span><span className={styles.flightLine} aria-hidden="true"><Plane size={17} style={{left:`${stageIndex * 43}%`}} /></span><span>Италия</span></div>
      </div>
    </SceneCard>
    <SceneCard title={<>После визы<br />путь продолжается.</>} href={guideHref(topicId)} actionLabel={`Открыть гайд: ${topic.title}`} caption="Первые формальности в новом городе. Выбирай одну тему, разбирайся с ней и переходи дальше.">
      <div className={styles.window}>
        <div className={styles.windowBar}><span>СПРАВОЧНИК / ПОСЛЕ ПРИЕЗДА</span><FileText size={17} aria-hidden="true" /></div>
        <div className={styles.document} key={topic.id}><span className={styles.position}>ТВОЙ СЛЕДУЮЩИЙ ВОПРОС</span><h3>{topic.title}</h3><p>{topic.teaser}</p><ArrowRight size={21} aria-hidden="true" /></div>
        <div className={styles.topicTabs} aria-label="Темы после приезда">{arrival.map(item=><button type="button" key={item.id} aria-pressed={item.id===topicId} onClick={()=>setTopicId(item.id)}>{({permesso:"Permesso",codice:"Codice fiscale","health-travel":"Страховка"} as Record<string,string>)[item.id]}</button>)}</div>
      </div>
    </SceneCard>
  </section>;
}
