import { VISA_DOCS, VISA_REJECT_REASONS, VISA_TIMELINE } from "@/data/guides";
import { GUIDE_STAGES, GUIDE_TOPICS, VISA_PARTS, guideHref, guidePoints, guideStageHref } from "./guideCatalogue";
import { guideStepOpen, visaPointOpen, type VisaPointsPart } from "./guideAccess";
import { guideArt, objectFrame } from "./guideArt";
import type { GuideRoadStation, GuideRoadStep } from "./GuideRoad";

/* Дороги гайдов и визы (GuideRoad.tsx) собираются на сервере: только
   названия, адреса и что закрыто. Текст разборов в дорогу не попадает. */

/** Short stop names for «Перед подачей», whose titles only repeat the number. */
export const BEFORE_SHORT = ["Средства", "Жильё", "Валидация и документы", "Сроки"];

const stageMark = (name: string) => ({ src: `/illustrations/stages/${name}-128.webp`, srcSet: `/illustrations/stages/${name}-128.webp 128w, /illustrations/stages/${name}-256.webp 256w`, width: 128, height: 128 });
const STAGE_MARK: Record<string, string> = { choose: "start", prepare: "docs", arrival: "arrival" };

function topicSteps(id: string): GuideRoadStep[] {
  return guidePoints(id).map((point, index) => {
    const key = `${id}/${index + 1}`, open = guideStepOpen(id, index + 1);
    return { key, title: point.title, href: point.href, locked: !open, keys: [key], openKeys: open ? [key] : [] };
  });
}

const VISA_POINTS: Record<string, { titles: string[]; mark: { name: string; height: number } }> = {
  timeline: { titles: VISA_TIMELINE.map(step => step.t), mark: { name: "alarm", height: 357 } },
  funds: { titles: ["Годовой минимум в тенге"], mark: { name: "coins", height: 367 } },
  documents: { titles: VISA_DOCS.map(document => document.title), mark: { name: "folder", height: 338 } },
  "before-application": { titles: BEFORE_SHORT.slice(0, VISA_REJECT_REASONS.length), mark: { name: "stamp-pad", height: 371 } },
};

function visaSteps(part: string): GuideRoadStep[] {
  return VISA_POINTS[part].titles.map((title, index) => {
    const key = `visa/${part}/${index + 1}`;
    const open = part === "funds" || visaPointOpen(part as VisaPointsPart, index + 1);
    const href = part === "funds" ? "/guides/visa/funds" : `/guides/visa/${part}?point=${index + 1}`;
    return { key, title, href, locked: !open, keys: [key], openKeys: open ? [key] : [] };
  });
}

/** A topic page: its steps, under the page header. */
export function topicRoad(id: string): GuideRoadStation[] {
  const guide = GUIDE_TOPICS.find(topic => topic.id === id)!;
  return [{ id, title: guide.title, text: guide.teaser, mark: guideArt(id), steps: topicSteps(id) }];
}

/** The visa page: four parts as stations, every point as a stop. */
export function visaRoad(): GuideRoadStation[] {
  return VISA_PARTS.map(part => ({ id: part.id, title: part.title, text: part.description, href: `/guides/visa/${part.id}`,
    mark: objectFrame(VISA_POINTS[part.id].mark.name, VISA_POINTS[part.id].mark.height), steps: visaSteps(part.id) }));
}

/** /guides: three sections as stations, every topic as a stop. */
export function guidesRoad(): GuideRoadStation[] {
  return GUIDE_STAGES.map(stage => stageStation(stage.id));
}

/** A section page: the same station as on /guides, with its topics. */
export function stageRoad(id: string): GuideRoadStation[] {
  return [stageStation(id)];
}

function stageStation(id: string): GuideRoadStation {
  return [GUIDE_STAGES.find(item => item.id === id)!].map(stage => ({ id: stage.id, title: stage.title, text: stage.description, href: guideStageHref(stage.id), mark: stageMark(STAGE_MARK[stage.id]),
    steps: stage.ids.map(id => {
      const inner = id === "visa" ? VISA_PARTS.flatMap(part => visaSteps(part.id)) : topicSteps(id);
      // Owner, 12 Nov («не вижу дозирования»): a topic whose steps are all
      // closed carries a lock on the guides road too; its page still opens.
      return { key: `topic/${id}`, title: GUIDE_TOPICS.find(topic => topic.id === id)!.title, href: guideHref(id), locked: inner.every(step => step.locked),
        keys: inner.flatMap(step => step.keys), openKeys: inner.flatMap(step => step.openKeys) };
    }) }))[0];
}
