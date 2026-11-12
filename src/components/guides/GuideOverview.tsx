import Link from "next/link";
import { ArrowUpRight, Calculator, CalendarClock, Clock, Coins, ExternalLink, Hourglass, Landmark, ListChecks, Route, Stamp, TriangleAlert, Wallet, type LucideIcon } from "lucide-react";
import { Bento, BentoCell, BentoIcon, BentoStat, bento, type BentoSpan } from "@/components/ui/Bento";
import { ADMISSION_SOURCES, type SourceId } from "@/data/admissions";
import { VISA_DOCS, VISA_KEY_FACTS, VISA_REJECT_REASONS, VISA_TIMELINE, type GuideCard } from "@/data/guides";
import { guideFacts } from "./guideFacts";
import { GUIDE_HELP, guideAction, isGuideId } from "./guideJourney";
import { GuideActionLink } from "./GuideReadingContext";
import { GUIDE_TOPICS, VISA_PARTS } from "./guideCatalogue";
import { guideStepOpen } from "./guideAccess";
import { GuideDose } from "./GuideDose";
import ui from "./guide-pages.module.css";
import steps from "./guide-steps.module.css";

/* Обзор темы и визы бенто-сеткой (owner, 12 Nov: «информацию … в гайдах и
   визе нужно подавать в такой вот форме», референс Lamossa Studio). Те же
   факты, действие, примечание и источники, что стояли столбиком, — теперь
   ячейками разного размера над разбором по шагам. Тексты не менялись.
   На шести колонках (страница темы ≤ 880px): три факта в ряд; четвёртый
   факт и широкое действие; широкие источники и примечание — ряды зеркалят
   друг друга. Без действия факты встают два на два. */

const LONG_VALUE = 22;

const points = (n: number) => n % 10 === 1 && n % 100 !== 11 ? "пункта" : "пунктов";
const topics = (n: number) => n % 10 === 1 && n % 100 !== 11 ? "тема" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "темы" : "тем";
const VISA_POINTS = VISA_TIMELINE.length + VISA_DOCS.length + VISA_REJECT_REASONS.length;
const ROUTE_TAIL = "Один платёж, не подписка.";

/** Что в теме открыто сейчас и что откроется с маршрутом — словами ячейки дозирования. */
function topicDose(guide: GuideCard) {
  const total = guide.rows.length, open = guide.rows.filter((_, index) => guideStepOpen(guide.id, index + 1)).length;
  if (open === total) {
    const others = GUIDE_TOPICS.filter(topic => topic.id !== guide.id && topic.id !== "visa").length;
    return { free: "Вся тема целиком — как образец того, что открывает маршрут.", paid: `Остальные ${others} ${topics(others)}, ${VISA_POINTS} пунктов визы, тренажёр Modulo 1 и проверка документов без лимита. ${ROUTE_TAIL}` };
  }
  return { free: `Название и первая фраза каждого из ${total} ${points(total)} разбора.`, paid: `Полный разбор: что именно сделать, суммы, сроки и ссылки. Вместе с остальными гайдами, визой, тренажёром Modulo 1 и проверкой документов без лимита. ${ROUTE_TAIL}` };
}

function Fact({ icon, value, label, known = true, span, ...data }: { icon: LucideIcon; value: string; label: string; known?: boolean; span: BentoSpan } & { [key: `data-${string}`]: string | boolean | undefined }) {
  return <BentoCell span={span} icon={icon} data-bento-row {...data}>
    <BentoStat value={value} label={label} quiet={!known} long={value.length > LONG_VALUE} />
  </BentoCell>;
}

function Sources({ ids, span }: { ids: readonly SourceId[]; span: BentoSpan }) {
  return <BentoCell span={span} data-guide-sources>
    <h2 className={bento.heading}>Официальные источники</h2>
    <ul className={bento.list} data-columns={ids.length > 1 && span.md > 2 ? "2" : undefined}>
      {ids.map(id => <li key={id}><a className={bento.listLink} href={ADMISSION_SOURCES[id].href} target="_blank" rel="noopener noreferrer">
        <span className={bento.dot} aria-hidden="true"><ExternalLink size={14} strokeWidth={1.8} /></span>
        <span className={bento.listTitle}>{ADMISSION_SOURCES[id].label}</span>
        <span className={bento.listNote}>{ADMISSION_SOURCES[id].scope}</span>
      </a></li>)}
    </ul>
  </BentoCell>;
}

function Note({ text, span }: { text: string; span: BentoSpan }) {
  return <BentoCell span={span} tone="quiet" icon={TriangleAlert} data-guide-note>
    <p className={bento.text}>{text}</p>
  </BentoCell>;
}

/** Источники и примечание: широкие источники слева, примечание справа. */
function Closing({ ids, note }: { ids: readonly SourceId[]; note: string }) {
  return note ? <><Sources ids={ids} span={{ md: 4 }} /><Note text={note} span={{ md: 2 }} /></> : <Sources ids={ids} span={{ md: 6 }} />;
}

const TOPIC_ICONS = [Clock, Wallet, CalendarClock, ListChecks];

export function GuideTopicOverview({ guide, note }: { guide: GuideCard; note: string }) {
  const helpId = isGuideId(guide.id) ? guide.id : undefined;
  const action = helpId ? guideAction(helpId) : null;
  const facts = guideFacts(guide);
  const factSpan: BentoSpan = action ? { md: 2 } : { md: 3 };
  return <Bento label="Коротко о теме" className={steps.overviewBento} data-guide-overview data-with-lead={Boolean(guide.lead)}>
    {guide.lead && <BentoCell span={{ md: 6 }} data-guide-lead><p className={steps.bentoLead}>{guide.lead}</p></BentoCell>}
    {facts.map((fact, index) => <Fact key={fact.label} icon={TOPIC_ICONS[index]} value={fact.value} label={fact.label} known={fact.known} span={factSpan} data-guide-fact={fact.known} />)}
    {action && helpId && <BentoCell span={{ md: 4 }} tone="action" icon={Route} data-guide-next={guide.id}>
      <p className={bento.heading}>{GUIDE_HELP[helpId].next}</p>
      <div className={bento.actions}>
        <GuideActionLink id={helpId} />
        <p className={bento.text}>{action.note}</p>
      </div>
    </BentoCell>}
    <GuideDose place="guide-overview" span={{ md: 6 }} {...topicDose(guide)} />
    <Closing ids={guide.sources} note={note} />
  </Bento>;
}

const VISA_ICONS = [Coins, Stamp, Hourglass];

export function VisaOverview({ guide, note }: { guide: GuideCard; note: string }) {
  const funds = VISA_PARTS.find(part => part.id === "funds")!;
  return <Bento label="Коротко о визе" className={steps.overviewBento} data-guide-overview data-visa-overview>
    {VISA_KEY_FACTS.map((fact, index) => <Fact key={fact.label} icon={VISA_ICONS[index]} value={fact.value} label={fact.label} span={{ md: 2 }} data-guide-fact />)}
    <BentoCell as="a" span={{ md: 2 }} href={ADMISSION_SOURCES.visaWhere.href} target="_blank" rel="noopener noreferrer" data-visa-vfs>
      <div className={bento.head}><BentoIcon icon={Landmark} /><ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" /></div>
      <p className={`${bento.heading} ${bento.pushDown}`}>Официальный VFS для Италии в Казахстане</p>
    </BentoCell>
    <BentoCell span={{ md: 4 }} tone="action" icon={Calculator} data-visa-funds>
      <div className={bento.body}>
        <p className={bento.heading}>{funds.title}</p>
        <p className={bento.text}>{funds.description}</p>
      </div>
      <div className={bento.actions}><Link href={`/guides/visa/${funds.id}`} className={ui.primary}>Посчитать в тенге</Link></div>
    </BentoCell>
    <GuideDose place="guide-overview" span={{ md: 6 }} free={`Ключевые факты, ссылка на VFS, калькулятор средств и первая фраза каждого из ${VISA_POINTS} пунктов.`}
      paid={`Все ${VISA_POINTS} пунктов подробно: когда подавать, документы для визы, проверка перед подачей. Вместе с гайдами, тренажёром Modulo 1 и проверкой документов без лимита. ${ROUTE_TAIL}`} />
    <Closing ids={guide.sources} note={note} />
  </Bento>;
}
