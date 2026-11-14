import { CalendarClock, FileCheck2, ListChecks, Repeat, Timer } from "lucide-react";
import { AppleButtonLink } from "@/components/apple/Button";
import { Bento, BentoCell, BentoStat, bento } from "@/components/ui/Bento";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import styles from "./document-check-feature.module.css";

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
   повторная правка, отдельный договор), без чужих цен и сроков. */

const FACTS = [
  { icon: Timer, value: "10–30 секунд", label: "обычно до ответа", note: "Без очереди и записи к менеджеру." },
  { icon: CalendarClock, value: "24/7", label: "днём, ночью, в выходные", note: "Проверяй, когда документ готов, а не когда открыт офис." },
  { icon: Repeat, value: "Без лимита", label: "проверок с маршрутом", note: "Исправил — проверь снова, сколько нужно. Первая — бесплатно." },
  { icon: ListChecks, value: "По пунктам", label: "имена, даты, печати, перевод", note: "Сверка с правилами твоего вуза, DSU и визы на твой учебный год." },
] as const;

const COMPARE = [
  { row: "Когда ответят", agency: "В рабочие часы менеджера", us: "В любое время, обычно за 10–30 секунд" },
  { row: "Повторная проверка после правки", agency: "Снова ждать ответа", us: "Сразу и сколько угодно раз" },
  { row: "Сколько стоит", agency: "Отдельный договор с агентством", us: `Входит в ${priceLabel(PRICE_MAIN)} за весь путь, первая проверка бесплатно` },
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
      {FACTS.map(fact => <BentoCell key={fact.value} span={{ md: 3, lg: 3 }} icon={fact.icon} className={styles.fact} data-bento-row data-document-check-fact>
        <BentoStat value={fact.value} label={fact.label} note={fact.note} />
      </BentoCell>)}
      <BentoCell span={{ md: 6, lg: compact ? 12 : 8 }} data-document-check-compare>
        <table className={styles.compare}>
          <caption className={bento.heading}>Проверка у агентства и здесь</caption>
          <thead><tr><th scope="col"><span className={styles.srOnly}>Что сравниваем</span></th><th scope="col">Агентство</th><th scope="col">IITALY</th></tr></thead>
          <tbody>{COMPARE.map(item => <tr key={item.row}><th scope="row">{item.row}</th><td>{item.agency}</td><td>{item.us}</td></tr>)}</tbody>
        </table>
      </BentoCell>
      {!compact && <BentoCell span={{ md: 6, lg: 4 }} tone="action" icon={FileCheck2} data-document-check-cta>
        <div className={bento.body}>
          <p className={bento.heading}>Проверь один документ бесплатно</p>
          <p className={bento.text}>Без регистрации. Проверка помогает не потерять время на ошибках; решение о приёме принимает вуз.</p>
        </div>
        <div className={bento.actions}><AppleButtonLink href="/plan#document-check">Проверить документ</AppleButtonLink></div>
      </BentoCell>}
    </Bento>
  </section>;
}
