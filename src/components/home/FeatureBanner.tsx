"use client";

import { useState } from "react";
import { SceneCard } from "@/components/journey/SceneCard";
import { GUIDE_TOPICS, GUIDE_STAGES, guideHref } from "@/components/guides/guideCatalogue";
import styles from "./journey-scenes.module.css";

/* Две сцены на главной. Owner, 3 Nov: «слишком много данных, сверху линии
   совсем бесполезные, линия с самолётиком очень кривая». Оба окна устроены
   одинаково: название, одна строка и капсулы-переключатели внизу — без
   строки-заголовка окна, подчёркнутых вкладок, меток «этап/вопрос» и линии
   с самолётом. */
export function FeatureBanner() {
  const [stageIndex, setStageIndex] = useState(0);
  const [topicId, setTopicId] = useState("permesso");
  const stage = GUIDE_STAGES[stageIndex];
  const topic = GUIDE_TOPICS.find(item => item.id === topicId)!;
  const arrival = GUIDE_TOPICS.filter(item => ["permesso", "codice", "health-travel"].includes(item.id));
  return <section className={styles.section} data-section="feature" aria-label="План и первые шаги в Италии">
    <SceneCard title={<>Один шаг.<br />Понятный маршрут.</>} href="/plan" actionLabel="Составить мой план" caption="Ответь на вопросы о себе. План покажет, с чего начать и какой шаг будет следующим.">
      <div className={styles.window}>
        <div className={styles.content} key={stage.id}><h3>{stage.title}</h3><p>{stage.description}</p></div>
        <div className={styles.chips} aria-label="Превью этапов">
          {GUIDE_STAGES.map((item, index) => <button type="button" key={item.id} aria-pressed={index === stageIndex} onClick={() => setStageIndex(index)}>{["Маршрут", "До отъезда", "В Италии"][index]}</button>)}
        </div>
      </div>
    </SceneCard>
    <SceneCard title={<>После визы<br />путь продолжается.</>} href={guideHref(topicId)} actionLabel={`Открыть гайд: ${topic.title}`} caption="Первые формальности в новом городе. Выбирай одну тему, разбирайся с ней и переходи дальше.">
      <div className={styles.window}>
        <div className={styles.content} key={topic.id}><h3>{topic.title}</h3><p>{topic.teaser}</p></div>
        <div className={styles.chips} aria-label="Темы после приезда">{arrival.map(item => <button type="button" key={item.id} aria-pressed={item.id === topicId} onClick={() => setTopicId(item.id)}>{({ permesso: "Permesso", codice: "Codice fiscale", "health-travel": "Страховка" } as Record<string, string>)[item.id]}</button>)}</div>
      </div>
    </SceneCard>
  </section>;
}
