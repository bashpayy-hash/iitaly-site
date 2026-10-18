"use client";
import { useState } from "react";
import { StepDot } from "./JourneyUI";
const PANELS = [
  { id: "documents", label: "Документы", title: "Собрать учебный комплект", rows: [["Аттестат и приложение", "Подготовлено"], ["Апостиль", "Следующий шаг"], ["Перевод", "После апостиля"]] },
  { id: "dsu", label: "DSU", title: "Подготовить заявку на стипендию", rows: [["Региональный конкурс", "Уточнить bando"], ["Доходы и состав семьи", "Собрать справки"], ["ISEEU", "Проверить требования"]] },
  { id: "visa", label: "Виза D", title: "Сверить комплект перед подачей", rows: [["Universitaly", "Подтвердить предзапись"], ["Средства и проживание", "Подготовить"], ["Запись на подачу", "По чек-листу"]] },
];
export function RoutePreview() {
  const [active, setActive] = useState(0);
  const panel = PANELS[active];
  return <section className="journey-route-preview" aria-label="Интерактивный пример персонального маршрута">
    <div className="journey-preview-top"><span>Пример маршрута</span><span>0{active + 1} / 03</span></div>
    <p className="journey-preview-university">Università di Bologna</p><p className="journey-preview-caption">Выбранный вуз · учебный пример</p>
    <div className="journey-preview-tabs" role="tablist" aria-label="Этап примера">{PANELS.map((item,index) => <button key={item.id} id={`preview-tab-${item.id}`} role="tab" aria-selected={active===index} aria-controls="preview-panel" tabIndex={active===index?0:-1} onClick={()=>setActive(index)} onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:2))%3;setActive(next);document.getElementById(`preview-tab-${PANELS[next].id}`)?.focus();}}}><StepDot active={active===index}/>{item.label}</button>)}</div>
    <div id="preview-panel" role="tabpanel" aria-labelledby={`preview-tab-${panel.id}`} tabIndex={0}><h2>{panel.title}</h2><dl>{panel.rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
    <p className="journey-preview-footer">Твой маршрут появится после короткой анкеты.</p>
  </section>;
}
