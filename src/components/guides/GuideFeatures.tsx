"use client";

import { useState } from "react";
import { FileText, Plane } from "lucide-react";
import { PERMESSO_COST_LABEL } from "@/data/admissions";
import { VISA_KEY_FACTS } from "@/data/guides";
import { SceneCard } from "@/components/journey/SceneCard";
import { GUIDE_TOPICS, guideHref } from "./guideCatalogue";
import { GUIDE_FACTS } from "./guideFacts";
import styles from "./guide-explorer.module.css";

const topic = (id: string) => GUIDE_TOPICS.find(item => item.id === id)!;
const VISA_TABS = ["Средства", "Сбор", "Срок"];
const PERMESSO_DEADLINE = GUIDE_FACTS.permesso.deadline!;
const PERMESSO_COST_NOTE = GUIDE_FACTS.permesso.cost!.replace(PERMESSO_COST_LABEL, "").trim();

/* Две карточки Butter над справочником: заголовок со стрелкой, тёмная
   сцена с переключателем и спокойная подпись. Все цифры — те же цитаты из
   гайдов, что и в бейджах инспектора; детали раскрываются по вкладкам. */
export function GuideFeatures() {
  const [visaFact, setVisaFact] = useState(0);
  const [permessoView, setPermessoView] = useState<"deadline" | "cost">("deadline");
  const visa = topic("visa"), permesso = topic("permesso");
  const fact = VISA_KEY_FACTS[visaFact];
  return <section className={styles.features} aria-label="Главные темы">
    <SceneCard title={visa.title} href={guideHref("visa")} actionLabel={`Открыть гайд: ${visa.title}`} caption={visa.teaser}>
      <div className={styles.window} data-guide-feature="visa">
        <div className={styles.windowBar}><span>VISA D / КЛЮЧЕВЫЕ ЦИФРЫ</span><Plane size={16} aria-hidden="true" /></div>
        <div className={styles.windowBody} key={visaFact}>
          <strong>{fact.value}</strong>
          <span>{fact.label}</span>
        </div>
        <div className={styles.windowTabs} role="group" aria-label="Цифры визы D">
          {VISA_TABS.map((label, index) => <button type="button" key={label} aria-pressed={index === visaFact} onClick={() => setVisaFact(index)}>{label}</button>)}
        </div>
      </div>
    </SceneCard>
    <SceneCard title={permesso.title} href={guideHref("permesso")} actionLabel={`Открыть гайд: ${permesso.title}`} caption={permesso.teaser}>
      <div className={styles.window} data-guide-feature="permesso">
        <div className={styles.windowBar}><span>PERMESSO / ПОСЛЕ ВЪЕЗДА</span><FileText size={16} aria-hidden="true" /></div>
        {permessoView === "deadline" ? <div className={styles.windowBody} key="deadline">
          <span className={styles.days} aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index}>{index + 1}</i>)}</span>
          <span>{PERMESSO_DEADLINE}</span>
        </div> : <div className={styles.windowBody} key="cost">
          <strong>{PERMESSO_COST_LABEL}</strong>
          <span>{PERMESSO_COST_NOTE}</span>
        </div>}
        <div className={styles.windowTabs} role="group" aria-label="Permesso: срок и сборы">
          <button type="button" aria-pressed={permessoView === "deadline"} onClick={() => setPermessoView("deadline")}>Срок подачи</button>
          <button type="button" aria-pressed={permessoView === "cost"} onClick={() => setPermessoView("cost")}>Сборы</button>
        </div>
      </div>
    </SceneCard>
  </section>;
}
