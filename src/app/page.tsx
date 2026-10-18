import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { StructuredData } from "@/components/marketing/StructuredData";
import { GalleryTitle, Hexagon, Painting } from "@/components/gallery/GalleryPrimitives";
import { RoutePreview } from "@/components/gallery/RoutePreview";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { UNIS, CITIES } from "@/data/italy";

const JOURNEY = [
  { title: "Подбор и стратегия", text: "Сопоставь образование, язык и бюджет с требованиями программ. Выбери университеты и свой путь поступления.", scene: "square" as const },
  { title: "Документы и подача", text: "Подготовь аттестат, уточни CIMEA или DoV, затем подай заявки по календарю выбранных программ.", scene: "canal" as const },
  { title: "Стипендия и переезд", text: "Пройди конкурс DSU, предзапись Universitaly и визовый этап. После приезда — оформление в Италии.", scene: "lagoon" as const },
];
const FEATURES = ["Персональный чек-лист на весь цикл поступления", "AI-проверка каждого документа до подачи", "Сохранённые разборы и отметки выполнения", "Напоминания о важных сроках"];
export default function Home() {
  return <MarketingLayout home><StructuredData/><div className="gallery-home">
    <section className="gallery-hero" data-gallery-room="putty">
      <div className="gallery-hero-grid"><div className="gallery-hero-copy">
        <p className="gallery-eyebrow">Из Казахстана — в Италию</p>
        <GalleryTitle as="h1">Твоё будущее.<br/><em>В Италии.</em></GalleryTitle>
        <p className="gallery-deck">Поступление становится понятнее, когда знаешь свой следующий шаг. Собери личный маршрут — от первого решения до начала учёбы.</p>
        <div className="gallery-actions"><Link href="/plan#questionnaire" className="gallery-button" data-fab-yield><span>Составить план бесплатно</span></Link><Link href="/universities" className="gallery-link">Выбрать университет <span aria-hidden>↗</span></Link></div>
        <div className="gallery-stats"><span>ВУЗОВ: {UNIS.length}</span><span>ГОРОДОВ: {Object.keys(CITIES).length}</span></div>
      </div><RoutePreview/></div>
      <div className="gallery-wordmark" aria-hidden="true" data-gallery-reveal><span>ITALIA</span></div>
    </section>
    <section className="gallery-room gallery-journey" data-gallery-room="ink" aria-label="Три этапа поступления">
      <GalleryTitle>От решения<br/>до <em>отъезда.</em></GalleryTitle><p className="gallery-room-intro">Три последовательных этапа. На каждом — понятный результат.</p>
      <ol className="gallery-stages">{JOURNEY.map((item,index)=><li key={item.title}><div className="gallery-stage-label">Этап {index+1}</div><h3>{item.title}</h3><div className="gallery-vignette"><Painting scene={item.scene}/></div><Hexagon/><p>{item.text}</p></li>)}</ol>
    </section>
    <section className="gallery-painting-panel" data-gallery-parallax aria-label="Твой кабинет в Италии">
      <Painting eager/>
      <div className="gallery-notched-card"><span className="gallery-eyebrow">Личный кабинет iItaly</span><h2>Весь путь.<br/><em>Перед глазами.</em></h2><p>Открой текущий шаг, прочитай инструкцию и приложи нужный файл. Всё остаётся в одном месте.</p><Link href="/portal" className="gallery-link">Посмотреть кабинет <span aria-hidden>↗</span></Link><span className="gallery-micro">IL TUO PERCORSO / ТВОЙ МАРШРУТ</span></div>
      <a className="gallery-art-credit" href="https://www.metmuseum.org/art/collection/search/438100" target="_blank" rel="noreferrer">Каналетто · Большой канал, Венеция · The Met ↗</a>
    </section>
    <section className="gallery-price-section" data-gallery-room="putty"><div className="gallery-price-copy"><GalleryTitle>Одна цена.<br/><em>Весь маршрут.</em></GalleryTitle><p>Без подписки. Доступ к цифровому кабинету на весь цикл поступления.</p></div>
      <div className="gallery-price-details"><div className="gallery-price-line"><span>{priceLabel(PRICE_MAIN)}</span><span>ОДИН ПЛАТЁЖ</span></div><ul>{FEATURES.map(text=><li key={text}><Hexagon/>{text}</li>)}</ul><Link href="/prices#main-package" className="gallery-button" data-fab-yield><span>Что входит в доступ</span></Link><p className="gallery-small">Решения о поступлении, стипендии и визе принимают соответствующие учреждения.</p></div>
    </section>
    <section className="gallery-faq" data-gallery-room="ink"><GalleryTitle>Перед первым<br/><em>шагом.</em></GalleryTitle><div>
      <details><summary>Можно начать без регистрации?</summary><p>Да. Анкета и локальный маршрут доступны бесплатно. Ответы сохраняются на твоём устройстве.</p></details>
      <details><summary>Что делать, если пока не выбран вуз?</summary><p>Начни с каталога: посмотри города, фильтруй программы и сравни до трёх университетов.</p></details>
      <details><summary>С чего начать разбираться в документах?</summary><p>В гайдах выбери свою ситуацию. Проводник покажет материалы в нужном порядке и ссылки на официальные источники.</p><Link href="/guides" className="gallery-link">Открыть проводник ↗</Link></details>
    </div></section>
  </div></MarketingLayout>;
}
