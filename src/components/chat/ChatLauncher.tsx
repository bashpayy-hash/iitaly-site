"use client";
import { useEffect,useRef,useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
/** One quiet, functional chat entry. Never opens without a click. */
export function ChatLauncher({onOpen,hidden=false}:{onOpen:()=>void;hidden?:boolean}) {
 const ref=useRef<HTMLButtonElement>(null);const [blocked,setBlocked]=useState(false);const pathname=usePathname();
 useEffect(()=>{let frame=0;const update=()=>{frame=0;const box=ref.current?.getBoundingClientRect();if(!box)return;setBlocked(Array.from(document.querySelectorAll<HTMLElement>('[data-fab-yield]')).some(node=>{const r=node.getBoundingClientRect();return r.width>0&&r.height>0&&r.left<box.right+8&&r.right>box.left-8&&r.top<box.bottom+8&&r.bottom>box.top-8;}));};const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);const observer=new ResizeObserver(schedule);observer.observe(document.body);update();return()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);observer.disconnect();cancelAnimationFrame(frame);};},[pathname]);
 // Portal already exposes focused assistance within the same global widget.
 return <button id="chat-launcher" ref={ref} type="button" className="journey-chat-launcher" data-chat-launcher aria-label="Открыть ИИ-помощника" onClick={onOpen} data-hidden={hidden||blocked} tabIndex={hidden||blocked?-1:0} aria-hidden={hidden||blocked}><MessageCircle size={18} aria-hidden="true"/><span>Помощник</span></button>;
}
