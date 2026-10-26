import type { PortalTask } from "@/lib/portalApi";
import { taskExplanation } from "@/lib/portalNavigation";
import styles from "./portal-micro-steps.module.css";

type Step = { title: string; text: string };
const steps: Record<string, Step[]> = {
  apostille: [
    { title: "Сверь требования", text: "Уточни у получателя нужный документ и приложение." },
    { title: "Выбери услугу", text: "Найди на eGov или в ЦОНе услугу для своего документа." },
    { title: "Проверь комплект", text: "Сохрани документ с апостилем для следующего шага." },
  ],
  translate: [
    { title: "Собери оригиналы", text: "Подготовь документ, приложение и апостиль, если он требуется." },
    { title: "Передай переводчику", text: "Укажи язык и требования вуза или консульства." },
    { title: "Сверь перевод", text: "Проверь имя по паспорту и полноту всех страниц." },
  ],
  notary: [
    { title: "Уточни способ", text: "Сверь требования к заверению с получателем перевода." },
    { title: "Подготовь комплект", text: "Передай перевод и оригиналы выбранному специалисту." },
    { title: "Проверь результат", text: "Сверь данные и сохрани все страницы заверенного перевода." },
  ],
  shortlist: [
    { title: "Сравни программы", text: "Посмотри язык обучения, город и требования." },
    { title: "Оцени условия", text: "Сопоставь стоимость и доступные варианты помощи." },
    { title: "Сохрани выбор", text: "Отметь университеты, с которыми продолжишь маршрут." },
  ],
  kit: [
    { title: "Подготовь данные", text: "Открой паспорт и документы для своей ситуации." },
    { title: "Заполни черновик", text: "Пройди поля Modulo 1 в тренажёре." },
    { title: "Сверь с оригиналом", text: "Проверь данные перед переносом в бумажный бланк." },
  ],
};

/** Navigation copy only; full maintained rules and sources stay in the detail. */
export function PortalMicroSteps({ task, authoredOnly = false }: { task: PortalTask; authoredOnly?: boolean }) {
  if (authoredOnly && !steps[task.id]) return null;
  const items = steps[task.id] || [
    { title: "Уточни задачу", text: taskExplanation(task) },
    { title: "Открой разбор", text: "Сверь требования и подготовь сведения для своего случая." },
    { title: "Сохрани результат", text: "Заверши действие в разборе или отметь выполненный шаг." },
  ];
  return <ol className={styles.steps} data-micro-steps aria-label="Три действия по шагу">
    {items.map((item, i) => <li key={item.title}><span className={styles.index} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><p>{item.text}</p></div></li>)}
  </ol>;
}
