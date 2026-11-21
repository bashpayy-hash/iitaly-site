/* eslint-disable @next/next/no-img-element -- Local riso art with explicit dimensions. */
import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ADMISSION_SOURCES, REVIEWED_AT, REVIEWED_LABEL, type SourceId } from "@/data/admissions";
import { isGuideId } from "./guideJourney";
import { GUIDE_TOPICS, VISA_PARTS, guideHref, guideStageHref, stageForGuide, type VisaPart } from "./guideCatalogue";
import { GuideHelperLink, GuideReadingContext } from "./GuideReadingContext";
import { VisaSection } from "./VisaSection";
import { GuideRoad } from "./GuideRoad";
import { topicRoad, visaRoad } from "./guideRoads";
import { GuideLegacyPoint } from "./GuideLegacyPoint";
import { guidePoints } from "./guideCatalogue";
import { guideFree } from "./guideAccess";
import { guideArt } from "./guideArt";
import { GuideTopicOverview, VisaOverview } from "./GuideOverview";
import steps from "./guide-steps.module.css";
import { GuideBandField } from "./GuideBandField";
import ui from "./guide-pages.module.css";
import disclosure from "@/components/ui/disclosure.module.css";

export function GuideFrame({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <div className={ui.shell} data-guides-pages><MarketingLayout><div className={`${ui.container} ${narrow ? ui.narrow : ""}`}>{children}</div></MarketingLayout></div>;
}

/* The path does not prefetch. Measured 21 Nov on a topic page, phone: the link
   to the stage pulled the stage page in advance, and with it the pictures of
   its first two tiles — 134 KB, the first at high priority, that the page
   being read does not show. The pages are static and open at once without it. */
export function GuideBreadcrumbs({ items }: { items: { title: string; href?: string }[] }) {
  return <nav className={ui.breadcrumbs} aria-label="Путь по справочнику"><ol>
    <li><Link href="/guides" prefetch={false}>Гайды и виза</Link></li>
    {items.map(item => <li key={item.title}>{item.href ? <Link href={item.href} prefetch={false}>{item.title}</Link> : <span aria-current="page">{item.title}</span>}</li>)}
  </ol></nav>;
}

export function GuideReviewed() {
  return <p className={ui.reviewed}>Правила сверены <time dateTime={REVIEWED_AT}>{REVIEWED_LABEL}</time></p>;
}

function GuideSources({ ids }: { ids: readonly SourceId[] }) {
  return <details className={ui.sources}>
    <summary className={disclosure.row}>Официальные источники</summary>
    <ul>{ids.map(id => <li key={id}><a href={ADMISSION_SOURCES[id].href} target="_blank" rel="noopener noreferrer">{ADMISSION_SOURCES[id].label}</a><p>{ADMISSION_SOURCES[id].scope}</p></li>)}</ul>
  </details>;
}

export function GuideTopicPage({ id, visaPart }: { id: string; visaPart?: VisaPart }) {
  const guide = GUIDE_TOPICS.find(topic => topic.id === id)!;
  const stage = stageForGuide(id)!;
  const part = VISA_PARTS.find(item => item.id === visaPart);
  const helpId = isGuideId(id) ? id : undefined;
  const nextId = stage.ids[stage.ids.findIndex(topic => topic === id) + 1];
  const next = GUIDE_TOPICS.find(topic => topic.id === nextId);
  const art = guideArt(id);
  const note = guide.warn || (id === "tests" ? "У каждого вуза свои окна приёма CEnT-S. Не жди дедлайна подачи\u00A0— сдай тест заранее, чтобы успеть получить нормализованный балл." : "");
  return <GuideFrame narrow>
    <GuideReadingContext id={helpId} />
    <article className={ui.article} data-guide-panel={id} data-guide-current={id} data-guide-part={visaPart} aria-labelledby="guide-title">
      {/* Owner, 20 Nov (late), with a reference of a grainy sage-to-sand
          section: «имплементи такого рода текстуру в страницы с гайдами и
          визой, на которые переходит пользователь после нажатия на иконку».
          The path and the topic header stand on that band, full width. */}
      <div className={ui.band} data-guide-band>
      <GuideBandField />
      <GuideBreadcrumbs items={[{ title:stage.title, href:guideStageHref(stage.id) }, ...(part ? [{title:guide.title,href:guideHref(id)},{title:part.title}] : [{title:guide.title}])]} />
      <header className={`${ui.articleHeader} ${part ? "" : steps.topicHeader}`}>
        <div>
          <h1 id="guide-title" tabIndex={-1}>{part?.title || guide.title}</h1>
          <p className={ui.intro}>{part?.description || guide.teaser}</p>
          <GuideReviewed />
        </div>
        {/* The topic's own picture is the first thing to paint on a phone. */}
        {!part && <img className={steps.topicArt} src={art.src} srcSet={art.srcSet} sizes="(max-width: 374px) 96px, (max-width: 700px) 120px, 260px" width={art.width} height={art.height} alt="" decoding="async" fetchPriority="high" />}
      </header>
      </div>
      {/* Owner, 12 Nov (Lamossa Studio): facts, the next action, the note and
          the sources as one bento above the steps (GuideOverview.tsx). */}
      {!part && (id === "visa" ? <VisaOverview guide={guide} note={note} /> : <GuideTopicOverview guide={guide} note={note} />)}
      {/* The document check is its own section in the main navigation
          (owner, 21 Nov: «вместо того, чтобы бесконечно в разных ответвлениях
          писать… сделай так, чтобы проверка документов была отдельным
          разделом»), so a topic page carries no promo for it. */}
      <div className={ui.readingBody}>
        {id === "visa" ? <>
          {part && <VisaSection part={visaPart} />}
          {!part && <GuideRoad id="visa" heading="Путь по визе" stations={visaRoad()} scenery={2} />}
        </> : <><GuideLegacyPoint hrefs={guidePoints(id).map(point => point.href)} />
          {/* Owner, 14 Nov 2026 (UX audit, item 7): a free topic's step is often
             one sentence, and «Шаг 1 из 4» for one phrase made the reader tap
             four pages for a paragraph. The whole topic now reads on one
             screen; the road below stays for those who keep track. */}
          {guideFree(id) && <section className={ui.brief} aria-labelledby="guide-brief" data-guide-brief>
            <h2 id="guide-brief">Вся тема коротко</h2>
            <ol>{guidePoints(id).map(point => <li key={point.href}><b>{point.title}</b><p>{point.text}</p></li>)}</ol>
          </section>}
          <GuideRoad id={id} heading="Разбор по шагам" stations={topicRoad(id)} showStations={false} scenery={GUIDE_TOPICS.findIndex(topic => topic.id === id)} /></>}
        {id === "permesso" && <section className={ui.note}>
          <h2>Актуальная ремарка к тренажёру</h2>
          <p>Poste отдельно указывает €16 за marca da bollo, €30 за приём kit и €30,46 за электронную карточку; дополнительный contributo зависит от длительности и типа permesso. Для rinnovo требования также зависят от кода 24 / 31&nbsp;— сверяй свой тип на Portale Immigrazione и у Questura.</p>
          <p>Rilascio и rinnovo · учебное заполнение · сохранение черновика только по твоему действию в браузере.</p>
        </section>}
        {part && note && <p className={ui.note}>{note}</p>}
        {part && <GuideSources ids={guide.sources} />}
      </div>
      <footer className={ui.articleFooter}>
        <GuideHelperLink id={helpId} />
        {part ? <Link href="/guides/visa" className={ui.textLink}>К вопросам о визе</Link>
          : next ? <Link href={guideHref(next.id)} className={ui.textLink} data-guide-next-topic={next.id}>{next.title}</Link>
          : <Link href={guideStageHref(stage.id)} className={ui.textLink}>Все темы раздела</Link>}
      </footer>
    </article>
  </GuideFrame>;
}
