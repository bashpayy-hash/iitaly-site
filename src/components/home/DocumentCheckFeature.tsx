/* eslint-disable @next/next/no-img-element -- Local cartouche renditions with explicit dimensions. */
import { AppleButtonLink } from "@/components/apple/Button";
import { Bento, BentoCell, BentoStat, bento } from "@/components/ui/Bento";
import { PRICE_MAIN, fmtPrice, priceLabel } from "@/data/pricing";
import { cartoucheFrame } from "@/components/guides/guideArt";
import styles from "./document-check-feature.module.css";

const CTA_ART = cartoucheFrame("doc-check");

/* Проверка документов — главная фишка (owner, 13 Nov: «проверка документов —
   это такая киллер-фича… в любое время суток, в неограниченное количество…
   надо нести в лендинг и промоутить: не как у агентств — быстрее, дешевле,
   доступнее»; ещё 6 Nov: «главная фишка сайта»).
   Только то, что правда:
   - время — замер 12 Nov на живом сервере: справка-фото 11 с, текст 7 с;
     PDF дольше, поэтому «обычно 10–30 секунд»;
   - «без лимита» — с маршрутом, как в пакете; до оплаты одна проверка;
   - что сверяется — пункты, которые проверка показывает сама (апостиль,
     даты справок, имена в переводе, владелец и период выписки);
   - «никогда не ошибается» не пишем: ИИ может ошибаться, решение
     принимает вуз — так сказано на всём сайте.
   Сравнение с агентством — про устройство работы (рабочие часы менеджера,
   повторная правка, отдельный договор), без чужих сроков. Цена агентств —
   та, что владелец называет с начала проекта (NEXT_CHAT.md: «агентства
   берут 650 000 – 1 000 000 ₸»), показать её он подтвердил 14 Nov: «Да,
   добавь». Прежняя строка «Отдельный договор с агентством» остаётся,
   цена идёт под ней: design-content сверяет весь прежний текст.
   15 Nov владелец задал новый диапазон: «сделай новый диапазон 500 000 —
   миллион». Замена разрешена в design-content.mjs. */

const AGENCY_SUPPORT = { from: 500_000, to: 1_000_000 };

const FACTS = [
  { value: "10–30 секунд", label: "обычно до ответа", note: "Без очереди и записи к менеджеру." },
  { value: "24/7", label: "днём, ночью, в выходные", note: "Проверяй, когда документ готов, а не когда открыт офис." },
  { value: "Без лимита", label: "проверок с маршрутом", note: "Исправил — проверь снова, сколько нужно. Первая — бесплатно." },
  { value: "По пунктам", label: "имена, даты, печати, перевод", note: "Сверка с правилами твоего вуза, DSU и визы на твой учебный год." },
] as const;

const COMPARE = [
  { row: "Когда ответят", agency: "В рабочие часы менеджера", us: "В любое время, обычно за 10–30 секунд" },
  { row: "Повторная проверка после правки", agency: "Снова ждать ответа", us: "Сразу и сколько угодно раз" },
  { row: "Сколько стоит", agency: "Отдельный договор с агентством", agencyPrice: `Сопровождение — обычно ${fmtPrice(AGENCY_SUPPORT.from)}–⁠${priceLabel(AGENCY_SUPPORT.to)}`, us: `Входит в ${priceLabel(PRICE_MAIN)} за весь путь, первая проверка бесплатно` },
] as const;

export function DocumentCheckFeature({ compact = false }: { compact?: boolean }) {
  return <section className={`${styles.section} ${compact ? styles.compact : ""}`} data-section={compact ? undefined : "document-check-feature"} data-document-check-feature aria-labelledby={compact ? "document-check-promo-title" : "document-check-feature-title"}>
    <div className={styles.head}>
      <h2 id={compact ? "document-check-promo-title" : "document-check-feature-title"} className={styles.title}>
        Проверка документов.<br /><span>Пункт за пунктом — в любое время.</span>
      </h2>
      <p className={styles.lead}>
        Загрузи справку, перевод, выписку или аттестат. ИИ сверит их с требованиями твоего вуза, DSU и визы
        на твой учебный год и скажет, что исправить, — пока агентство ещё не открылось.
      </p>
    </div>
    <Bento label="Чем проверка документов отличается от агентства" className={styles.bento}>
      {FACTS.map(fact => <BentoCell key={fact.value} span={{ md: 3, lg: 3 }} className={styles.fact} data-bento-row data-document-check-fact>
        <BentoStat value={fact.value} label={fact.label} note={fact.note} />
      </BentoCell>)}
      <BentoCell span={{ md: 6, lg: compact ? 12 : 8 }} data-document-check-compare>
        <table className={styles.compare}>
          <caption className={bento.heading}>Проверка у агентства и здесь</caption>
          <thead><tr><th scope="col"><span className={styles.srOnly}>Что сравниваем</span></th><th scope="col">Агентство</th><th scope="col">IITALY</th></tr></thead>
          <tbody>{COMPARE.map(item => <tr key={item.row}><th scope="row">{item.row}</th><td>{item.agency}{"agencyPrice" in item && <span className={styles.agencyPrice} data-document-check-agency-price>{item.agencyPrice}</span>}</td><td>{item.us}</td></tr>)}</tbody>
        </table>
      </BentoCell>
      {!compact && <BentoCell span={{ md: 6, lg: 4 }} tone="action" data-document-check-cta>
        <div className={bento.body}>
          <p className={bento.heading}>Проверь один документ бесплатно</p>
          <p className={bento.text}>Без регистрации. Проверка помогает не потерять время на ошибках; решение о приёме принимает вуз.</p>
        </div>
        {/* Owner, 19 Nov: «проверка документов это киллер фича, её нужно
            активнее рекламировать» — the cell gets the document-check cartouche
            instead of an empty dotted field. */}
        <img className={styles.ctaArt} src={CTA_ART.src} srcSet={CTA_ART.srcSet} sizes="(max-width: 640px) 120px, 160px" width={CTA_ART.width} height={CTA_ART.height} alt="" loading="lazy" decoding="async" draggable={false} data-document-check-art />
        <div className={bento.actions}><AppleButtonLink href="/plan#document-check">Проверить документ</AppleButtonLink></div>
      </BentoCell>}
    </Bento>
  </section>;
}
