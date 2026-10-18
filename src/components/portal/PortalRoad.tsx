"use client";
import { useEffect } from "react";
import type { PortalData,PortalStage,PortalTask } from "@/lib/portalApi";
import { Hexagon } from "@/components/gallery/GalleryPrimitives";
export type RoadTravel={fromDone:number;id:number};
/** Progress is a readout. Route navigation lives once in PortalNavigation. */
export function PortalRoad({data,current,stage,travel,onTravelStart}:{data:PortalData;current:PortalTask|null;stage:PortalStage|null;onOpenTask:(task:PortalTask)=>void;travel?:RoadTravel;onTravelStart?:()=>void;currentOpen?:boolean;secondaryAction?:boolean;showMascot?:boolean;navigationOnly?:boolean}) {
 const tasks=data.roadmap.flatMap(s=>s.tasks);const done=tasks.filter(t=>data.done[t.id]).length;
 useEffect(()=>{if(travel)onTravelStart?.();},[travel,onTravelStart]);
 return <div className="gallery-route-readout" data-portal-road data-current-step={current?.id} data-road-done={done} data-road-total={tasks.length}><span><Hexagon active/>{stage?.title||"Твой маршрут"}</span><span role="status" data-road-count>{done} из {tasks.length} шагов</span></div>;
}
