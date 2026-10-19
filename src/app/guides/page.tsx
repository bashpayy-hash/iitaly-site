"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpLeft, ArrowUpRight, BookOpen, Check, ChevronDown, Search, X } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { EditorialArtwork } from "@/components/marketing/EditorialArtwork";
import { VespiIntroSection } from "@/components/mascot/VespiIntroSection";
import { VespiMark } from "@/components/mascot/VespiMark";
import { VespiAssistant, VespiIndicator } from "@/components/mascot/VespiAssistant";
import { VisaSection } from "@/components/guides/VisaSection";
import { GUIDE_HELP, guideAction, isGuideId, openGuideHelper, type GuideId } from "@/components/guides/guideJourney";
import { GUIDES, type GuideCard } from "@/data/guides";
import { ADMISSION_SOURCES, REVIEWED_AT, REVIEWED_LABEL, type SourceId } from "@/data/admissions";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { track } from "@/lib/track";
import ui from "./guides.module.css";

// Reading stages, not claims about the visitor's personal progress.
const STAGES = [
  { title: "Выбрать маршрут", ids: ["education", "tests"] },
  { title: "Подготовиться к отъезду", ids: ["apostille", "translation", "cimea", "con", "iseeu", "visa", "minors", "military"] },
  { title: "После приезда", ids: ["permesso", "codice", "health-travel"] },
] satisfies { title: string; ids: GuideId[] }[];
const PROMPTS = [
  { id: "education", label: "У меня 11 классов — что делать?" },
  { id: "tests", label: "Новые правила CEnT-S 2026" },
  { id: "apostille", label: "Апостиль в ЦОНе" },
  { id: "translation", label: "Перевод для Астаны" },
] satisfies { id: GuideId; label: string }[];
const VISA: GuideCard = {
  id: "visa", title: "Виза D", teaser: "Подача через VFS: средства, документы и сроки.", rows: [],
  warn: "Университет, консульство и стипендиальный орган проверяют разные условия. Начни с своего учебного года и официального чек-листа.",
  sources: ["visa", "procedure", "visaWhere", "visaFees", "visaTiming"],
};
const TOPICS = STAGES.flatMap(stage => stage.ids.map(id => id === "visa" ? VISA : GUIDES.find(guide => guide.id === id)!));
const ACTION_LABELS: Partial<Record<GuideId, string>> = {
  education: "Разобраться с моим аттестатом", tests: "Составить план подготовки",
  apostille: "Проверить документ с ИИ", translation: "Загрузить перевод на AI-сверку",
};
const TESTS_TIP = "У каждого вуза свои окна приёма CEnT-S. Не жди дедлайна подачи — сдай тест заранее, чтобы успеть получить нормализованный балл.";
const normalize = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е");
function searchable(guide: GuideCard) {
  return normalize([guide.title, guide.teaser, guide.lead, guide.warn,
    ...guide.rows.map(row => `${row.label} ${row.value}`), ...guide.sources.map(id => ADMISSION_SOURCES[id].label),
    guide.id === "visa" ? "банк счет выписка деньги средства страховка консульство VFS финансовая гарантия" : "",
  ].join(" "));
}
function stageOf(id: GuideId) { return STAGES.findIndex(stage => (stage.ids as GuideId[]).includes(id)); }

/** Wait for the committed panel and font metrics, including same-document hash changes. */
function focusTopic(id: GuideId, scroll = true, instant = false) {
  void document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
    if (window.location.hash.slice(1) !== id) return;
    const heading = document.querySelector<HTMLElement>(`[data-guide-panel="${id}"] h2`);
    heading?.focus({ preventScroll: true });
    if (scroll) heading?.scrollIntoView({ block: "start", behavior: instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  })));
}

function OfficialSources({ ids }: { ids: readonly SourceId[] }) {
  return <footer className={ui.sources} aria-label="Официальные источники">
    <ul>{ids.map(id => {
      const source = ADMISSION_SOURCES[id];
      return <li key={id}>
        <a href={source.href} target="_blank" rel="noopener noreferrer" className={ui.sourcePill}>{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a>
        <span>{source.scope}</span>
      </li>;
    })}</ul>
  </footer>;
}
function Insight({ guide }: { guide: GuideCard }) {
  if (!isGuideId(guide.id)) return null;
  const id = guide.id, help = GUIDE_HELP[id], action = guideAction(id);
  const note = guide.warn || (id === "tests" ? TESTS_TIP : "");
  const variant = help.action === "document" || ["cimea", "con", "visa"].includes(id) ? "inspector" : ["education", "tests"].includes(id) ? "route" : "copilot";
  return <VespiAssistant variant={variant} layout="editorial-callout" appearance="none" label="Подсказка Веспи"
    className={ui.insight} data-vespi-tip data-guide-next={id} aria-label="Совет Веспи">
    <div className={ui.insightCopy}>
      <VespiMark className={ui.vespiMark} />
      {!note && <p className={ui.insightNext}>{help.next}</p>}
      {note && <p>{note}</p>}
      <Link href={action.href} className={ui.primary} data-guide-inline-action data-fab-yield
        onClick={() => track("guide_next_action", { topic: id, action: help.action })}>
        {ACTION_LABELS[id] || action.label}<ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      {action.note.replace(/^Бесплатно, без регистрации\.\s*/, "").trim() && <small>{action.note.replace(/^Бесплатно, без регистрации\.\s*/, "")}</small>}
    </div>
  </VespiAssistant>;
}
function TopicBody({ guide }: { guide: GuideCard }) {
  return <>
    {guide.id === "visa" ? <VisaSection /> : <>
      {guide.lead && <p className={ui.lead}>{guide.lead}</p>}
      <dl className={ui.facts}>{guide.rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
    </>}
    {guide.id === "permesso" && <div className={ui.trainerNote}>
      <h3>Актуальная ремарка к тренажёру</h3>
      <p>Poste отдельно указывает €16 за marca da bollo, €30 за приём kit и €30,46 за электронную карточку; дополнительный contributo зависит от длительности и типа permesso. Для rinnovo требования также зависят от кода 24 / 31 — сверяй свой тип на Portale Immigrazione и у Questura.</p>
      <p>Rilascio и rinnovo · учебное заполнение · сохранение черновика только по твоему действию в браузере.</p>
    </div>}
    <Insight guide={guide} />
    <OfficialSources ids={guide.sources} />
  </>;
}

/** Observer-based visibility: no scroll polling, no user text in analytics. */
function StickyPlan({ topic }: { topic?: GuideId }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('[data-section="guides-header"]');
    if (!hero) return;
    const article = topic ? document.querySelector(`[data-guide-panel="${topic}"]`) : null;
    const insights = [...document.querySelectorAll('[data-vespi-tip], [data-vespi-tip] [data-vespi-presence], [data-vespi-intro=guides]')];
    const inView = (node: Element, extra = 0) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight + extra
        && rect.right > 0 && rect.left < window.innerWidth;
    };
    // Intersection callbacks are signals, not cached truth: hash jumps and an
    // expanding checklist can move several boundaries in one render. Read the
    // current geometry together so an old entry cannot keep the offer hidden.
    const update = () => setVisible(hero.getBoundingClientRect().bottom < 0
      && Boolean(article && inView(article)) && !insights.some(node => inView(node, 140)));
    const nodes = [hero, ...(article ? [article] : []), ...insights];
    const intersection = new IntersectionObserver(update, { rootMargin: "0px 0px 140px 0px" });
    const resize = new ResizeObserver(update);
    nodes.forEach(node => { intersection.observe(node); resize.observe(node); });
    const frame = requestAnimationFrame(update);
    return () => { cancelAnimationFrame(frame); intersection.disconnect(); resize.disconnect(); };
  }, [topic]);
  const href = topic && GUIDE_HELP[topic].action === "plan" ? guideAction(topic).href : "/plan#questionnaire";
  return <VespiAssistant variant="copilot" layout="floating-bar" label="" data-guide-sticky data-fab-yield className={ui.sticky} hidden={!visible || dismissed} aria-label="Персональный план IITALY">
    <div className={ui.stickyCopy}><strong>Запутался в правилах?</strong><p>Маршрут и проверка документов без лимита — в кабинете за {priceLabel(PRICE_MAIN)}.</p></div>
    <Link className={ui.primary} href={href} onClick={() => track("guide_sticky_action", { topic: topic || "" })}>Составить план<ArrowUpRight size={17} aria-hidden="true" /></Link>
    <button type="button" className={ui.iconButton} aria-label="Скрыть предложение плана" onClick={() => setDismissed(true)}><X size={17} aria-hidden="true" /></button>
  </VespiAssistant>;
}

export default function GuidesPage() {
  const [stage, setStage] = useState(0);
  const [activeId, setActiveId] = useState<GuideId | null>("education");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const filtered = TOPICS.filter(guide => terms.length ? terms.every(term => searchable(guide).includes(term)) : (STAGES[stage].ids as string[]).includes(guide.id));
  const active = filtered.find(guide => guide.id === activeId);
  const currentId = active && isGuideId(active.id) ? active.id : undefined;
  const currentStage = currentId ? stageOf(currentId) : stage;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("iitaly:guide-context", { detail: { guideId: currentId } }));
    return () => { window.dispatchEvent(new CustomEvent("iitaly:guide-context", { detail: {} })); };
  }, [currentId]);
  function selectTopic(id: GuideId, source: "question" | "stage" | "card") {
    setQuery(""); setStage(stageOf(id)); setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
    track(source === "question" ? "guide_prompt_selected" : "guide_topic_opened", { topic: id, source });
    focusTopic(id, source !== "stage");
  }
  useEffect(() => {
    function followHash() {
      const id = window.location.hash.slice(1);
      if (!isGuideId(id)) return;
      setQuery(""); setStage(stageOf(id)); setActiveId(id);
      focusTopic(id, true, true);
    }
    followHash(); window.addEventListener("hashchange", followHash);
    return () => window.removeEventListener("hashchange", followHash);
  }, []);
  function resetSearch() { setQuery(""); setStage(0); setActiveId("education"); searchRef.current?.focus(); }
  function closeTopic() {
    setActiveId(null); setQuery("");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    searchRef.current?.focus({ preventScroll: true });
    document.getElementById("guide-topics")?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  return <div className={ui.shell} data-guides-meta><MarketingLayout>
    <div className={ui.canvas}>
      <div className={ui.aura} aria-hidden="true" />
      <div className={ui.container}>
        <section className={ui.hero} data-section="guides-header">
          <div className={ui.heroCopy}>
            <span className={ui.badge}><BookOpen size={15} aria-hidden="true" />Справочник · бесплатно</span>
            <span className={ui.reviewBadge}><Check size={14} aria-hidden="true" />Правила сверены <time dateTime={REVIEWED_AT}>{REVIEWED_LABEL}</time></span>
            <h1>Как пройти<br /><span>бюрократию</span></h1>
            <p className={ui.subtitle}>Документы и виза D: где оформить в Казахстане, сколько стоит и с чего начать.</p>
            <Link href="/changes-2026-27" className={ui.alert}>Что изменилось в правилах 2026/27<ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className={ui.heroArt}><EditorialArtwork scene="terrace" priority /></div>
          <div id="guide-command" className={ui.command} data-fab-yield>
            <label htmlFor="guide-search" className="sr-only">Найти тему</label>
            <div className={ui.commandBar}>
              <VespiIndicator className={ui.commandIndicator} />
              <div className={ui.commandField}><span aria-hidden="true">Веспи поможет найти ответ</span>
                <input ref={searchRef} id="guide-search" type="search" value={query} autoComplete="off" spellCheck={false} placeholder="Найди свою тему: аттестат, виза, DSU…" onChange={event => { setQuery(event.target.value); setActiveId(null); }} />
              </div>
              {query ? <button type="button" className={ui.iconButton} aria-label="Сбросить поиск" onClick={resetSearch}><X size={20} aria-hidden="true" /></button> : <Search className={ui.searchIcon} size={22} aria-hidden="true" />}
            </div>
            <div className={ui.prompts} aria-label="С чего начать в справочнике">{PROMPTS.map(prompt => <a key={prompt.id} href={`#${prompt.id}`} onClick={event => { event.preventDefault(); selectTopic(prompt.id, "question"); }}>{prompt.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div>
            <p className={ui.searchStatus} role="status" aria-live="polite">{terms.length ? `Найдено тем: ${filtered.length} · поиск по всему справочнику` : "Найди тему или выбери вопрос."}</p>
          </div>
        </section>
        <section id="guide-topics" className={ui.topics} aria-label="Справочник по этапам">
          <nav className={ui.stages} aria-label="Этапы справочника" data-guide-current={currentId || ""}>
            {STAGES.map((item, index) => <a key={item.title} href={`#${item.ids[0]}`} aria-current={currentStage === index ? "step" : undefined} onClick={event => { event.preventDefault(); selectTopic(item.ids[0], "stage"); }}><span className={ui.stageNumber}>{index + 1}.</span>{item.title}</a>)}
          </nav>
          {!filtered.length ? <div className={ui.empty}><Search size={28} aria-hidden="true" /><h2>Такой темы не нашли</h2><p>Попробуй другое слово, например «перевод» или «стипендия».</p>
            <div><button type="button" className={ui.secondary} onClick={resetSearch}>Показать все темы</button><button type="button" className={ui.secondary} onClick={() => openGuideHelper(undefined, query)}>Спросить Веспи<ArrowUpRight size={16} aria-hidden="true" /></button></div>
          </div> : <>
            <div className={ui.topicGrid} aria-label="Темы выбранного этапа">{filtered.map(guide => <button key={guide.id} type="button" className={ui.topicCard} data-guide-select={guide.id} aria-expanded={active?.id === guide.id} aria-controls={`guide-panel-${guide.id}`}
              onClick={() => { if (isGuideId(guide.id)) { if (active?.id === guide.id) closeTopic(); else selectTopic(guide.id, "card"); } }}>
              <span><strong>{guide.title}</strong><span className={ui.topicTeaser}>{guide.teaser}</span></span><span className={ui.cardArrow}>{active?.id === guide.id ? <ChevronDown size={19} aria-hidden="true" /> : <ArrowDown size={19} aria-hidden="true" />}</span>
            </button>)}</div>
            {TOPICS.map(guide => <div key={guide.id} id={`guide-panel-${guide.id}`} hidden={active?.id !== guide.id}>
              {active?.id === guide.id && <article className={ui.article} data-guide-panel={guide.id} aria-labelledby="active-guide-title">
                <header className={ui.articleHeader}><div><p>{STAGES[currentStage].title}</p><h2 id="active-guide-title" tabIndex={-1}>{guide.title}</h2></div><button className={ui.iconButton} type="button" aria-label="Свернуть тему" onClick={closeTopic}><X size={20} aria-hidden="true" /></button></header>
                <TopicBody guide={guide} />
                <div className={ui.articleEnd}><button type="button" className={ui.secondary} onClick={closeTopic}><ArrowUpLeft size={16} aria-hidden="true" />К списку тем</button><button type="button" className={ui.secondary} onClick={() => { if (isGuideId(guide.id)) { track("guide_helper_opened", { topic: guide.id }); openGuideHelper(guide.id); } }}>Разобрать тему с Веспи<ArrowUpRight size={16} aria-hidden="true" /></button></div>
              </article>}
            </div>)}
          </>}
        </section>
        <VespiIntroSection placement="guides" href="/prices" action={`Проверка без лимита · ${priceLabel(PRICE_MAIN)}`} onAction={() => track("guide_cabinet_viewed", { topic: currentId || "" })} />
      </div>
      <StickyPlan topic={currentId} />
    </div>
  </MarketingLayout></div>;
}
