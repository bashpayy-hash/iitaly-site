import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EditorialHeading } from "@/components/marketing/EditorialSection";
import { StoryArtwork } from "@/components/story/StoryArtwork";
import styles from "@/components/marketing/editorial-sections.module.css";

export function JourneyBento() {
  return <section className={styles.section} aria-labelledby="journey-title" data-journey-preview>
    <EditorialHeading id="journey-title" eyebrow="Твой маршрут" title="Большой путь. Маленькие шаги."><strong>Один вопрос за раз.</strong> Подбор вузов, документы и первые недели в Италии — открой то, что нужно сейчас.</EditorialHeading>
    <div className={styles.bento} data-public-bento>
      <article className={`${styles.card} ${styles.wide}`}>
        <div><h3>43 университета</h3><p>Найди место, где хочется учиться.</p></div>
        <StoryArtwork subject="map" />
        <Link className={styles.cardLink} href="/universities">Выбрать университет<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </article>
      <article className={styles.card}><h3>CEnT-S</h3><p>Тесты и сроки твоей заявки.</p><StoryArtwork subject="calendar" /><Link className={styles.cardLink} href="/guides/tests">Разобраться со сроками<ArrowUpRight size={18} aria-hidden="true" /></Link></article>
      <article className={styles.card}><h3>Документы</h3><p>От оригинала до готового пакета.</p><StoryArtwork subject="folder" /><Link className={styles.cardLink} href="/guides/stages/prepare">Подготовить документы<ArrowUpRight size={18} aria-hidden="true" /></Link></article>
      <article className={styles.card}><h3>DSU</h3><p>Условия по конкурсу твоего года.</p><StoryArtwork subject="envelope" /><Link className={styles.cardLink} href="/guides/iseeu">Разобраться со стипендией<ArrowUpRight size={18} aria-hidden="true" /></Link></article>
      <article className={`${styles.card} ${styles.mascot}`} data-vespi-intro="home"><h3>Веспи рядом</h3><p>Твой ИИ-проводник в Италию.</p><StoryArtwork subject="vespi" /><Link className={styles.cardLink} href="/portal">Начать с Веспи<ArrowUpRight size={18} aria-hidden="true" /></Link></article>
    </div>
  </section>;
}
