import Link from "next/link";
import { EditorialHeading } from "@/components/marketing/EditorialSection";
import { UniversitySpotlight } from "./UniversitySpotlight";
import { UNIS, CITIES } from "@/data/italy";
import styles from "@/components/marketing/editorial-sections.module.css";

export function Split() {
  const universities = ["unipd", "unibo", "luiss"].map(id => UNIS.find(item => item.id === id)!).filter(Boolean).map(item => ({ id:item.id, name:item.name, type:item.tp, city:CITIES[item.city].name }));
  return <section data-section="split" className={styles.section} aria-labelledby="university-title">
    <EditorialHeading id="university-title" eyebrow="Университеты" title="Одна Италия. Твой выбор."><strong>Начни с того, что интересно тебе.</strong> Сравни университеты, затем открой карту и требования к программе.</EditorialHeading>
    <UniversitySpotlight universities={universities} />
    <div className={styles.universityFooter}><span>43 университета · 30 городов</span><Link href="/universities">Все университеты на карте <span aria-hidden="true">↗</span></Link></div>
  </section>;
}
