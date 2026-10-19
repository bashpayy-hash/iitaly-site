"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Search, X } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { EditorialArtwork } from "@/components/marketing/EditorialArtwork";
import { VisaSection } from "@/components/guides/VisaSection";
import { GUIDE_HELP, guideAction, isGuideId, openGuideHelper, type GuideId } from "@/components/guides/guideJourney";
import { GUIDES, type GuideCard } from "@/data/guides";
import { ADMISSION_SOURCES, REVIEWED_AT, REVIEWED_LABEL, type SourceId } from "@/data/admissions";
import { track } from "@/lib/track";
import ui from "./guides.module.css";

// Reading stages, not claims about the visitor's personal progress.
const STAGES = [
  { title: "Выбрать маршрут", description: "Образование и вступительные тесты", ids: ["education", "tests"] },
  { title: "Подготовиться к отъезду", description: "Документы, стипендия и виза", ids: ["apostille", "translation", "cimea", "con", "iseeu", "visa", "minors", "military"] },
  { title: "После приезда", description: "Permesso, налоговый код и страховка", ids: ["permesso", "codice", "health-travel"] },
] satisfies { title: string; description: string; ids: GuideId[] }[];
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
  return <aside className={ui.insight} data-vespi-tip data-guide-next={id} aria-label="Что сделать по этой теме">
    <div className={ui.insightCopy}>
      {!note && <p className={ui.insightNext}>{help.next}</p>}
      {note && <p>{note}</p>}
      <Link href={action.href} className={ui.inlineAction} data-guide-inline-action
        onClick={() => track("guide_next_action", { topic: id, action: help.action })}>
        {ACTION_LABELS[id] || action.label}<ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      {action.note.replace(/^Бесплатно, без регистрации\.\s*/, "").trim() && <small>{action.note.replace(/^Бесплатно, без регистрации\.\s*/, "")}</small>}
    </div>
  </aside>;
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

export default function GuidesPage() {
  const [stage, setStage] = useState(0);
  const [activeId, setActiveId] = useState<GuideId | null>("education");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const filtered = TOPICS.filter(guide => terms.every(term => searchable(guide).includes(term)));
  const active = TOPICS.find(guide => guide.id === activeId);
  const currentId = active && isGuideId(active.id) ? active.id : undefined;
  const currentStage = currentId ? stageOf(currentId) : stage;
  const nextTopic = currentId ? TOPICS[TOPICS.findIndex(guide => guide.id === currentId) + 1] : undefined;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("iitaly:guide-context", { detail: { guideId: currentId } }));
    return () => { window.dispatchEvent(new CustomEvent("iitaly:guide-context", { detail: {} })); };
  }, [currentId]);

  function selectTopic(id: GuideId, source: "stage" | "card" | "next") {
    setQuery(""); setStage(stageOf(id)); setActiveId(id);
    if (window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);
    track("guide_topic_opened", { topic: id, source });
    focusTopic(id, source !== "stage");
  }

  useEffect(() => {
    function followHash() {
      const id = window.location.hash.slice(1);
      if (!isGuideId(id)) {
        setQuery(""); setStage(0); setActiveId("education");
        return;
      }
      setQuery(""); setStage(stageOf(id)); setActiveId(id);
      focusTopic(id, true, true);
    }
    followHash();
    window.addEventListener("hashchange", followHash);
    window.addEventListener("popstate", followHash);
    return () => {
      window.removeEventListener("hashchange", followHash);
      window.removeEventListener("popstate", followHash);
    };
  }, []);

  function resetSearch() {
    setQuery(""); setStage(0); setActiveId("education");
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#education`);
    searchRef.current?.focus();
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
              <Image src="/mascot/vespi-search-avatar.webp" alt="" width={64} height={64} unoptimized className={ui.commandAvatar} data-vespi-search-avatar />
              <div className={ui.commandField}><span aria-hidden="true">Веспи поможет найти ответ</span>
                <input ref={searchRef} id="guide-search" type="search" value={query} autoComplete="off" spellCheck={false} placeholder="Найди свою тему: аттестат, виза, DSU…" onChange={event => {
                  const value = event.target.value;
                  setQuery(value);
                  if (value.trim()) {
                    setActiveId(null);
                  } else {
                    const hashTopic = window.location.hash.slice(1);
                    const restoredTopic = isGuideId(hashTopic) ? hashTopic : STAGES[stage].ids[0];
                    setStage(stageOf(restoredTopic));
                    setActiveId(restoredTopic);
                  }
                }} />
              </div>
              {query ? <button type="button" className={ui.iconButton} aria-label="Сбросить поиск" onClick={resetSearch}><X size={20} aria-hidden="true" /></button> : <Search className={ui.searchIcon} size={22} aria-hidden="true" />}
            </div>
            <p className={ui.searchStatus} role="status" aria-live="polite">{terms.length ? `Найдено тем: ${filtered.length} · поиск по всему справочнику` : ""}</p>
          </div>
        </section>

        <section id="guide-topics" className={ui.topics} aria-labelledby="guide-route-title">
          <div className={ui.routeIntro} data-guide-invite data-fab-yield>
            <div>
              <p className={ui.routeEyebrow}>Твой путь по шагам</p>
              <h2 id="guide-route-title">Сначала маршрут. Потом документы.</h2>
              <p>Начни с первого этапа или выбери тот, на котором ты сейчас. Я помогу разобраться с каждой темой по порядку.</p>
            </div>
            <Image src="/mascot/vespi-guide-invite.webp" alt="" width={300} height={360} unoptimized className={ui.invitePose} data-vespi-guide-invite />
          </div>

          <div className={ui.readingLayout}>
            <nav className={ui.timeline} aria-label="Этапы справочника" data-guide-current={currentId || ""} data-guide-timeline>
              <ol>{STAGES.map((item, index) => <li key={item.title} className={ui.timelineStage} data-current-stage={currentStage === index}>
                <a className={ui.stageLink} href={`#${item.ids[0]}`} aria-current={currentStage === index ? "step" : undefined} onClick={event => { event.preventDefault(); selectTopic(item.ids[0], "stage"); }}>
                  <span className={ui.stageNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{item.title}</strong><small>{item.description}</small></span>
                </a>
                {currentStage === index && !terms.length && <ol className={ui.topicList} aria-label="Темы выбранного этапа">{item.ids.map((id, topicIndex) => {
                  const guide = TOPICS.find(topic => topic.id === id)!;
                  return <li key={id}><button type="button" className={ui.topicLink} data-guide-select={id} aria-current={activeId === id ? "true" : undefined} aria-expanded={activeId === id} aria-controls={`guide-panel-${id}`} onClick={() => selectTopic(id, "card")}>
                    <span aria-hidden="true">{index + 1}.{topicIndex + 1}</span><span>{guide.title}</span>
                  </button></li>;
                })}</ol>}
              </li>)}</ol>
            </nav>

            <div className={ui.readingContent}>
              {terms.length > 0 && <section className={ui.searchResults} aria-labelledby="guide-search-results-title">
                <h2 id="guide-search-results-title">{filtered.length ? "Подходящие темы" : "Такой темы не нашли"}</h2>
                {filtered.length ? <div className={ui.resultList}>{filtered.map(guide => <button key={guide.id} type="button" className={ui.resultTopic} data-guide-select={guide.id} aria-controls={`guide-panel-${guide.id}`} onClick={() => { if (isGuideId(guide.id)) selectTopic(guide.id, "card"); }}>
                  <span><strong>{guide.title}</strong><span>{guide.teaser}</span></span><ArrowRight size={18} aria-hidden="true" />
                </button>)}</div> : <><p>Попробуй другое слово, например «перевод» или «стипендия».</p><button type="button" className={ui.inlineAction} onClick={() => openGuideHelper(undefined, query)}>Спросить Веспи<ArrowUpRight size={16} aria-hidden="true" /></button></>}
              </section>}

              {TOPICS.map(guide => <div key={guide.id} id={`guide-panel-${guide.id}`} hidden={active?.id !== guide.id}>
                {active?.id === guide.id && <article className={ui.article} data-guide-panel={guide.id} data-fab-yield aria-labelledby="active-guide-title">
                  <header className={ui.articleHeader}><div><p>Этап {currentStage + 1} · {STAGES[currentStage].title}</p><h2 id="active-guide-title" tabIndex={-1}>{guide.title}</h2></div></header>
                  <TopicBody guide={guide} />
                  <div className={ui.articleEnd}>
                    <button type="button" className={ui.inlineAction} onClick={() => {
                      if (isGuideId(guide.id)) { track("guide_helper_opened", { topic: guide.id }); openGuideHelper(guide.id); }
                    }}>Есть вопрос? Спроси Веспи<ArrowUpRight size={16} aria-hidden="true" /></button>
                    {nextTopic && isGuideId(nextTopic.id) ? <button type="button" className={ui.nextTopic} data-guide-next-topic={nextTopic.id} onClick={() => { if (isGuideId(nextTopic.id)) selectTopic(nextTopic.id, "next"); }}>
                      <span><small>Следующая тема</small><strong>{nextTopic.title}</strong></span><ArrowRight size={19} aria-hidden="true" />
                    </button> : <Link href="/plan#questionnaire" className={ui.primary}>Перейти к своему плану<ArrowUpRight size={17} aria-hidden="true" /></Link>}
                  </div>
                </article>}
              </div>)}
            </div>
          </div>
        </section>
      </div>
    </div>
  </MarketingLayout></div>;
}
