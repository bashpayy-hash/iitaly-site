/* eslint-disable @next/next/no-img-element -- Local riso art with explicit dimensions. */
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GUIDE_TOPICS, guideHref, guidePoints, guideStageHref, stageForGuide } from "./guideCatalogue";
import { guideArt } from "./guideArt";
import { isGuideId } from "./guideJourney";
import { GuideBreadcrumbs, GuideFrame, GuideReviewed } from "./GuidePage";
import { GuideActionLink, GuideHelperLink, GuideReadingContext } from "./GuideReadingContext";
import ui from "./guide-pages.module.css";
import styles from "./guide-step-page.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/** Текст пункта делится на предложения: каждое — отдельный шаг списка. */
export function guideSentences(text: string) {
  return text.split(/(?<=[.!?])\s+(?=[A-ZА-ЯЁ«"(])/u).map(part => part.trim()).filter(Boolean);
}

/* Отдельная страница одного шага темы. Тот же текст, что был в переключателе
   пунктов, но разложен на короткие пункты, с картинкой темы, точками всех
   шагов и переходами «назад / дальше». На последнем шаге — действие темы. */
export function GuideStepPage({ id, step }: { id: string; step: number }) {
  const guide = GUIDE_TOPICS.find(topic => topic.id === id)!;
  const stage = stageForGuide(id)!;
  const points = guidePoints(id);
  const point = points[step - 1];
  const previous = points[step - 2], next = points[step];
  const sentences = guideSentences(point.text);
  const art = guideArt(id);
  const helpId = isGuideId(id) ? id : undefined;
  return <GuideFrame narrow>
    <GuideReadingContext id={helpId} />
    <GuideBreadcrumbs items={[{ title:stage.title, href:guideStageHref(stage.id) }, { title:guide.title, href:guideHref(id) }, { title:`Шаг ${step}` }]} />
    <article className={ui.article} data-guide-step={id} data-guide-current={id} data-instruction-point={step} aria-labelledby="guide-step-title">
      <header className={styles.header}>
        <div>
          <p className={styles.position}>Шаг {pad(step)} из {pad(points.length)} · {guide.title}</p>
          <h1 id="guide-step-title" tabIndex={-1}>{point.title}</h1>
          <GuideReviewed />
        </div>
        <img className={styles.art} src={art.src} srcSet={art.srcSet} sizes="(max-width: 700px) 50vw, 240px" width={art.width} height={art.height} alt="" />
      </header>
      {sentences.length > 1 ? <ol className={styles.sentences} data-guide-step-body>
        {sentences.map((sentence, index) => <li key={index}><span aria-hidden="true">{index + 1}</span><p>{sentence}</p></li>)}
      </ol> : <p className={styles.single} data-guide-step-body>{point.text}</p>}
      <nav className={styles.dots} aria-label="Шаги темы">
        {points.map((item, index) => <Link key={item.href} href={item.href} aria-current={index + 1 === step ? "step" : undefined} title={item.title} aria-label={`Шаг ${index + 1}: ${item.title}`}><span /></Link>)}
      </nav>
      {!next && <section className={styles.finish} aria-label="Тема разобрана">
        <p>Это последний шаг темы «{guide.title}».</p>
        {helpId && <GuideActionLink id={helpId} />}
      </section>}
      <nav className={styles.pager} aria-label="Соседние шаги">
        {previous ? <Link className={styles.pagerCard} href={previous.href} data-guide-step-prev><ArrowLeft size={18} aria-hidden="true" /><span><small>Шаг {pad(step - 1)}</small>{previous.title}</span></Link>
          : <Link className={styles.pagerCard} href={guideHref(id)}><ArrowLeft size={18} aria-hidden="true" /><span><small>К теме</small>{guide.title}</span></Link>}
        {next ? <Link className={`${styles.pagerCard} ${styles.forward}`} href={next.href} data-guide-step-next><span><small>Шаг {pad(step + 1)}</small>{next.title}</span><ArrowRight size={18} aria-hidden="true" /></Link>
          : <Link className={`${styles.pagerCard} ${styles.forward}`} href={guideHref(id)}><span><small>Готово</small>Вернуться к теме</span><ArrowRight size={18} aria-hidden="true" /></Link>}
      </nav>
      <footer className={ui.articleFooter}><GuideHelperLink id={helpId} /><Link href="/guides" className={ui.textLink}>Все темы<ArrowRight size={16} aria-hidden="true" /></Link></footer>
    </article>
  </GuideFrame>;
}
