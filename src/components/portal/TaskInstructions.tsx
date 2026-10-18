import type { PortalTask } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { taskDate, taskExplanation, taskHelpDetails } from "@/lib/portalNavigation";
const ACTIONS: Record<string,string[]>={
 profile:["Укажи образование, год поступления и язык обучения.","Ответь на вопросы о бюджете и учебной цели.","Сохрани анкету — маршрут подстроится под ответы."],
 shortlist:["Выбери город и отфильтруй университеты по типу и языку.","Сравни условия подходящих программ.","Добавь выбранные вузы в свой список и сохрани его."],
 chances:["Уточни состав семьи, доходы и имущество за период из bando.","Сопоставь сведения с условиями выбранного регионального конкурса.","Рассчитай бюджет до первой возможной выплаты стипендии."],
 familyDocs:["Открой актуальное bando выбранного конкурса DSU.","Собери справки о составе, доходах и имуществе семьи за указанный период.","Сверь имена, даты и требования к переводу перед проверкой файла."],
 money:["Открой визовый чек-лист по своей ситуации.","Рассчитай доступные средства и уточни допустимые подтверждения.","Подготовь финансовую гарантию к подаче."],
};
export function TaskInstructions({task}:{task:PortalTask}) {
 const doc=DOC_TASKS[task.id];
 const actions=ACTIONS[task.id]||(doc?[taskExplanation(task),"Сверь имена, даты, комплектность и читаемость файла.","Приложи документ и проверь рекомендации до подачи."]:[taskExplanation(task),"Сверь требования и сроки своего вуза или учреждения.","Выполни действие и отметь результат в маршруте."]);
 const details=taskHelpDetails(task);
 return <div className="gallery-task-checklist" data-step-help>
  <p className="gallery-task-date"><strong>Срок:</strong> {taskDate(task)||"Не задан — уточни в календаре своей программы или официальном чек-листе."}</p>
  <h3>Что сделать</h3><ol>{actions.map(text=><li key={text}>{text}</li>)}</ol>
  <h3>Нужные файлы</h3><p>{doc||"Для отметки этого шага файл загружать не требуется."}</p>
  {details.length>0&&<div className="gallery-task-notes">{details.map(text=><p key={text}>{text}</p>)}</div>}
 </div>;
}
