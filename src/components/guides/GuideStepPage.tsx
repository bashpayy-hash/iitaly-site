/* eslint-disable @next/next/no-img-element -- Local riso art with explicit dimensions. */
import Link from "next/link";
import { GUIDE_TOPICS, guideHref, guidePoints, guideStageHref, stageForGuide } from "./guideCatalogue";
import { guideArt } from "./guideArt";
import { isGuideId } from "./guideJourney";
import { GuideBreadcrumbs, GuideFrame, GuideReviewed } from "./GuidePage";
import { GuideActionLink, GuideHelperLink, GuideReadingContext } from "./GuideReadingContext";
import { guideSentences } from "./guideText";
import { guideStepOpen } from "./guideAccess";
import { GuideSentences } from "./GuideSentences";
import { GuideLockedStep } from "./GuideLockedStep";
import { GuideStepPath } from "./GuideStepPath";
import { GuideReadMark } from "./GuideReadMark";
import ui from "./guide-pages.module.css";
import styles from "./guide-step-page.module.css";

/* Отдельная страница одного шага темы. Тот же текст, что был в переключателе
   пунктов, но разложен на короткие пункты, с картинкой темы, точками всех
   шагов и переходами «назад / дальше». На последнем шаге — действие темы.
   Owner, 4 Nov (скрин с телефона): без «Шаг 02 из 04» и «Шаг 02» на карточках
   перехода — над заголовком стоит тема, место шага показывают точки, в хлебных
   крошках и на карточках перехода — названия шагов.
   Owner, 9 Nov: закрытый шаг (guideAccess.ts) показывает название, столько
   же пустых пунктов и стену; текст разбора в HTML не попадает.
   Owner, 10 Nov: под шапкой — путь-прогресс по шагам темы вместо ряда точек
   внизу; закрытые шаги на пути несут замок. */
export function GuideStepPage({ id, step }: { id: string; step: number }) {
  const guide = GUIDE_TOPICS.find(topic => topic.id === id)!;
  const stage = stageForGuide(id)!;
  const points = guidePoints(id);
  const point = points[step - 1];
  const previous = points[step - 2], next = points[step];
  const sentences = guideSentences(point.text);
  const open = guideStepOpen(id, step);
  const art = guideArt(id);
  const helpId = isGuideId(id) ? id : undefined;
  return <GuideFrame narrow>
    <GuideReadingContext id={helpId} />
    <GuideBreadcrumbs items={[{ title:stage.title, href:guideStageHref(stage.id) }, { title:guide.title, href:guideHref(id) }, { title:point.title }]} />
    <article className={ui.article} data-guide-step={id} data-guide-current={id} data-instruction-point={step} aria-labelledby="guide-step-title">
      <header className={styles.header}>
        <div>
          <p className={styles.position}>{guide.title}</p>
          <h1 id="guide-step-title" tabIndex={-1}>{point.title}</h1>
          <GuideReviewed />
        </div>
        <img className={styles.art} src={art.src} srcSet={art.srcSet} sizes="(max-width: 700px) 50vw, 240px" width={art.width} height={art.height} alt="" decoding="async" />
      </header>
      <div className={styles.path}><GuideStepPath index={step - 1} stops={points.map((item, index) => ({ title: item.title, href: item.href, locked: !guideStepOpen(id, index + 1) }))} /></div>
      <GuideReadMark readKey={`${id}/${step}`} open={open} />
      {open ? <GuideSentences sentences={sentences} text={point.text} /> : <GuideLockedStep id={id} step={step} count={sentences.length} />}
      {!next && <section className={styles.finish} aria-label="Тема разобрана">
        <p>Это последний шаг темы «{guide.title}».</p>
        {helpId && <GuideActionLink id={helpId} />}
      </section>}
      <nav className={styles.pager} aria-label="Соседние шаги">
        {previous ? <Link className={styles.pagerCard} href={previous.href} data-guide-step-prev><span><small>Назад</small>{previous.title}</span></Link>
          : <Link className={styles.pagerCard} href={guideHref(id)}><span><small>К теме</small>{guide.title}</span></Link>}
        {next ? <Link className={`${styles.pagerCard} ${styles.forward}`} href={next.href} data-guide-step-next><span><small>Дальше</small>{next.title}</span></Link>
          : <Link className={`${styles.pagerCard} ${styles.forward}`} href={guideHref(id)}><span><small>Готово</small>Вернуться к теме</span></Link>}
      </nav>
      <footer className={ui.articleFooter}><GuideHelperLink id={helpId} /><Link href="/guides" className={ui.textLink}>Все темы</Link></footer>
    </article>
  </GuideFrame>;
}
