import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EditorialHeading } from "@/components/marketing/EditorialSection";
import { StoryArtwork } from "@/components/story/StoryArtwork";
import styles from "@/components/marketing/editorial-sections.module.css";

export function FeatureBanner() {
  return <section data-section="feature" className={styles.section} aria-labelledby="arrival-title">
    <EditorialHeading id="arrival-title" eyebrow="После прилёта" title="Виза — ещё не финал."><strong>Первые недели тоже по плану.</strong> Codice fiscale, kit giallo и приём в Questura — каждый вопрос в своём гайде.</EditorialHeading>
    <div className={`${styles.bento} ${styles.arrival}`}>
      <article className={styles.card}><h3>Первые недели в Италии</h3><StoryArtwork subject="key" /><Link className={styles.cardLink} href="/guides/stages/arrival">Открыть раздел<ArrowUpRight size={18} aria-hidden="true" /></Link></article>
      <article className={styles.card}><h3>Permesso di soggiorno</h3><StoryArtwork subject="envelope" /><Link className={styles.cardLink} href="/guides/permesso">Подготовить kit<ArrowUpRight size={18} aria-hidden="true" /></Link></article>
      <article className={styles.card}><h3>Codice fiscale</h3><StoryArtwork subject="folder" /><Link className={styles.cardLink} href="/guides/codice">Получить налоговый код<ArrowUpRight size={18} aria-hidden="true" /></Link></article>
    </div>
  </section>;
}
