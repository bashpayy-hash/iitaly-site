"use client";
export type PortalView = "today" | "plan" | "docs" | "settings";
const DESTINATIONS: {view:PortalView;label:string}[]=[{view:"today",label:"Сейчас"},{view:"plan",label:"Весь маршрут"},{view:"docs",label:"Документы"},{view:"settings",label:"Настройки"}];
export function PortalNavigation({current,onNavigate}:{current:PortalView;onNavigate:(view:PortalView)=>void}) {
 return <nav className="gallery-portal-nav" aria-label="Навигация кабинета">{DESTINATIONS.map(item=><a key={item.view} href={item.view==="today"?"/portal":`/portal?view=${item.view}`} aria-current={current===item.view?"page":undefined} onClick={e=>{if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();onNavigate(item.view);}}>{item.label}</a>)}</nav>;
}
