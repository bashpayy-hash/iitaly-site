import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ADMISSION_SOURCES, REVIEWED_AT, REVIEWED_LABEL, type SourceId } from "@/data/admissions";
import { GUIDE_HELP, guideAction, isGuideId } from "./guideJourney";
import { GUIDE_TOPICS, VISA_PARTS, guideHref, guideStageHref, stageForGuide, type VisaPart } from "./guideCatalogue";
import { GuideActionLink, GuideHelperLink, GuideReadingContext } from "./GuideReadingContext";
import { VisaSection } from "./VisaSection";
import { StoryArtwork } from "@/components/story/StoryArtwork";
import { GuidePointSwitcher } from "./GuidePointSwitcher";
import ui from "./guide-pages.module.css";

export function GuideFrame({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <div className={ui.shell} data-guides-pages><MarketingLayout><div className={`${ui.container} ${narrow ? ui.narrow : ""}`}>{children}</div></MarketingLayout></div>;
}

export function GuideBreadcrumbs({ items }: { items: { title: string; href?: string }[] }) {
  return <nav className={ui.breadcrumbs} aria-label="Путь по справочнику"><ol>
    <li><Link href="/guides">Гайды и виза</Link></li>
    {items.map(item => <li key={item.title}>{item.href ? <Link href={item.href}>{item.title}</Link> : <span aria-current="page">{item.title}</span>}</li>)}
  </ol></nav>;
}

export function GuideReviewed() {
  return <p className={ui.reviewed}>Правила сверены <time dateTime={REVIEWED_AT}>{REVIEWED_LABEL}</time></p>;
}

function GuideSources({ ids }: { ids: readonly SourceId[] }) {
  return <details className={ui.sources}>
    <summary>Официальные источники</summary>
    <ul>{ids.map(id => <li key={id}><a href={ADMISSION_SOURCES[id].href} target="_blank" rel="noopener noreferrer">{ADMISSION_SOURCES[id].label}<ArrowUpRight size={14} aria-hidden="true" /></a><p>{ADMISSION_SOURCES[id].scope}</p></li>)}</ul>
  </details>;
}

export function GuideTopicLinks({ ids }: { ids: readonly string[] }) {
  return <ul className={`${ui.topicList} ${ui.topicBento}`}>{ids.map(id => {
    const guide = GUIDE_TOPICS.find(topic => topic.id === id)!;
    return <li key={id}><Link href={guideHref(id)} data-guide-select={id}><StoryArtwork subject={id === "tests" ? "calendar" : stageForGuide(id)?.id === "arrival" ? "key" : "folder"} /><span><strong>{guide.title}</strong><span>{guide.teaser}</span></span><ArrowRight size={20} aria-hidden="true" /></Link></li>;
  })}</ul>;
}

export function GuideTopicPage({ id, visaPart }: { id: string; visaPart?: VisaPart }) {
  const guide = GUIDE_TOPICS.find(topic => topic.id === id)!;
  const stage = stageForGuide(id)!;
  const part = VISA_PARTS.find(item => item.id === visaPart);
  const helpId = isGuideId(id) ? id : undefined;
  const action = helpId ? guideAction(helpId) : null;
  const nextId = stage.ids[stage.ids.findIndex(topic => topic === id) + 1];
  const next = GUIDE_TOPICS.find(topic => topic.id === nextId);
  const note = guide.warn || (id === "tests" ? "У каждого вуза свои окна приёма CEnT-S. Не жди дедлайна подачи — сдай тест заранее, чтобы успеть получить нормализованный балл." : "");
  return <GuideFrame narrow>
    <GuideReadingContext id={helpId} />
    <GuideBreadcrumbs items={[{ title:stage.title, href:guideStageHref(stage.id) }, ...(part ? [{title:guide.title,href:guideHref(id)},{title:part.title}] : [{title:guide.title}])]} />
    <article className={ui.article} data-guide-panel={id} data-guide-current={id} data-guide-part={visaPart} aria-labelledby="guide-title">
      <header className={ui.articleHeader}>
        <h1 id="guide-title" tabIndex={-1}>{part?.title || guide.title}</h1>
        <p className={ui.intro}>{part?.description || guide.teaser}</p>
        <GuideReviewed />
      </header>
      <div className={ui.readingBody}>
        {id === "visa" ? <VisaSection part={visaPart} /> : <>
          {guide.lead && <p className={ui.lead}>{guide.lead}</p>}
          <GuidePointSwitcher rows={guide.rows} subject={id === "tests" ? "calendar" : stage.id === "arrival" ? "key" : stage.id === "choose" ? "map" : "folder"} endAction={helpId ? <GuideActionLink id={helpId} /> : undefined} />
        </>}
        {id === "permesso" && <section className={ui.note}>
          <h2>Актуальная ремарка к тренажёру</h2>
          <p>Poste отдельно указывает €16 за marca da bollo, €30 за приём kit и €30,46 за электронную карточку; дополнительный contributo зависит от длительности и типа permesso. Для rinnovo требования также зависят от кода 24 / 31 — сверяй свой тип на Portale Immigrazione и у Questura.</p>
          <p>Rilascio и rinnovo · учебное заполнение · сохранение черновика только по твоему действию в браузере.</p>
        </section>}
        {note && <p className={ui.note}>{note}</p>}
        <GuideSources ids={guide.sources} />
        {action && helpId && id !== "visa" && <section className={ui.nextAction} data-guide-next={id} aria-label="Что сделать по этой теме">
          {!note && <p>{GUIDE_HELP[helpId].next}</p>}
          <p className={ui.actionNote}>{action.note}</p>
        </section>}
      </div>
      <footer className={ui.articleFooter}>
        <GuideHelperLink id={helpId} />
        {part ? <Link href="/guides/visa" className={ui.textLink}>К вопросам о визе<ArrowRight size={16} aria-hidden="true" /></Link>
          : next ? <Link href={guideHref(next.id)} className={ui.textLink} data-guide-next-topic={next.id}>{next.title}<ArrowRight size={16} aria-hidden="true" /></Link>
          : <Link href={guideStageHref(stage.id)} className={ui.textLink}>Все темы раздела<ArrowRight size={16} aria-hidden="true" /></Link>}
      </footer>
    </article>
  </GuideFrame>;
}
