import type { PortalData } from "./portalApi";
import { taskTitle, taskExplanation } from "./portalNavigation";
// Runtime migration for older server labels; task IDs remain stable.
const LEGACY_STEM = /\u0440\u043e\u0434\u0438\u0442\u0435\u043b[\u0430-\u044f\u0451]*/giu;
function normalizeText(value:string|null|undefined) {
 if(!value)return value;
 return value.replace(LEGACY_STEM,word=>{
  const ending=word.toLowerCase().slice(7);
  const replacement=ending==="ей"?"законных представителей":ending==="ями"?"законными представителями":ending==="ям"?"законным представителям":ending==="и"?"законные представители":ending==="я"?"законного представителя":ending==="ю"?"законному представителю":ending==="ем"?"законным представителем":"законный представитель";
  return word[0]===word[0].toUpperCase()?replacement[0].toUpperCase()+replacement.slice(1):replacement;
 });
}
/** Presentation migration only: no IDs, dates, availability or completion change. */
export function studentRoadmap(data:PortalData):PortalData {
 return {...data,roadmap:data.roadmap.map(stage=>({...stage,title:normalizeText(stage.title)!,tasks:stage.tasks.map(task=>{
 const next={...task,owner:undefined,t:taskTitle(task),explain:["chances","familyDocs","money","statements","housing"].includes(task.id)?taskExplanation(task):normalizeText(task.explain),note:normalizeText(task.note),warn:normalizeText(task.warn),timingLabel:normalizeText(task.timingLabel)};
 return {...next,t:normalizeText(next.t)!,explain:normalizeText(next.explain)};
 })}))};
}
