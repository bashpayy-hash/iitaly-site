"use client";
import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { EditorField } from "./permessoOriginalGeometry";
import { ANSWER_STATUS, type FieldAnswer } from "./permessoFieldAnswer";
import styles from "./permesso-hover.module.css";

/* compact — карточка на телефоне (owner, 7 Nov: «всё друг на друга
   наслаивается»). Раньше она несла всё: статус, ответ, название, клетки,
   источник, ловушку, подпись — до половины экрана поверх бланка. Теперь
   только то, что нужно, чтобы решить: статус, ответ, одна строка и
   «Не пиши». Остальное — в панели поля и «Подробном пояснении». */
export function AnswerSummary({answer:a,field,detail=false,compact=false}:{answer:FieldAnswer;field:EditorField;detail?:boolean;compact?:boolean}){
 const full=!detail&&!compact;
 return <div className={styles.summary} data-answer-for={field.id} data-state={a.status} data-answer-example={a.example} data-answer-detail={detail} data-answer-compact={compact||undefined}>
  {!detail&&<span className={styles.status}>{ANSWER_STATUS[a.status]}</span>}
  <strong className={styles.answer} data-quick-answer title={a.answer}>{a.answer}</strong>
  {a.example&&<span className={styles.example}>Пример — не твои данные</span>}
  <p className={styles.hint}>{a.hint}</p>
  {full&&<p className={styles.label}>{field.meta.it} · {field.meta.ru}</p>}
  {a.cells&&!compact&&<p className={styles.cells}><span>В клетки: </span>{a.cells}</p>}
  {full&&<p className={styles.source}><span>Откуда: </span>{a.source}</p>}
  {a.dontWrite&&<p className={styles.trap}><span>Не пиши: </span>{a.dontWrite}</p>}
  {full&&<small className={styles.caption}>{a.caption}</small>}
 </div>;
}
export type FieldPreview={field:EditorField;anchor:HTMLElement;touch:boolean;pinned:boolean};
type Props={preview:FieldPreview;answer:FieldAnswer;onClose:()=>void;onEnter:()=>void;onLeave:()=>void;onEdit:()=>void};
const clamp=(n:number,low:number,high:number)=>Math.max(low,Math.min(n,high));
const overlap=(a:{x:number;y:number;width:number;height:number},b:DOMRect)=>Math.max(0,Math.min(a.x+a.width,b.right)-Math.max(a.x,b.left))*Math.max(0,Math.min(a.y+a.height,b.bottom)-Math.max(a.y,b.top));
/** Нижний край липкой «шапки» экрана: шапка сайта и прилипшая панель бланка.
    Карточка поля не встаёт поверх них — раньше на телефоне она закрывала
    логотип, сценарий и номера страниц. */
function chromeEdge(){
 let edge=0;
 const bars=Array.from(document.querySelectorAll<HTMLElement>('[data-marketing-surface] > header, [data-workbench-bar]'))
  .filter(el=>{const position=getComputedStyle(el).position;return position==="sticky"||position==="fixed";})
  .map(el=>el.getBoundingClientRect()).filter(r=>r.height).sort((a,b)=>a.top-b.top);
 for(const r of bars)if(r.top<=edge+2&&r.bottom>edge)edge=r.bottom;
 return edge;
}

/** Controlled projection: no answer storage, URL writes or selected-field changes. */
export function PermessoFieldHover({preview:p,answer,onClose,onEnter,onLeave,onEdit}:Props){
 const cardRef=useRef<HTMLElement>(null),id=`permesso-field-help-${p.field.page}`;
 useLayoutEffect(()=>{
  const node=cardRef.current;if(!node)return;
  function position(){
   if(!node||!p.anchor.isConnected||!p.anchor.getClientRects().length){onClose();return;}
   const vv=window.visualViewport,left=vv?.offsetLeft||0,top=vv?.offsetTop||0,vw=vv?.width||innerWidth,vh=vv?.height||innerHeight,gap=p.touch?8:12;
   const ceiling=Math.max(top,chromeEdge()),floor=top+vh;
   node.style.width=(p.touch?Math.min(520,vw-2*gap):Math.min(280,vw-2*gap))+"px";node.style.maxHeight=Math.max(96,floor-ceiling-2*gap)+"px";
   const bounds=p.anchor.getBoundingClientRect(),box=node.getBoundingClientRect(),sheet=p.anchor.closest('[data-sheet-page]');
   const rectangles=Array.from(sheet?.querySelectorAll<HTMLElement>(`[data-cell-outline="${p.field.id}"]`)||[]).map(el=>el.getBoundingClientRect()),active=rectangles.length?rectangles:[bounds];
   const minX=Math.min(...active.map(r=>r.left)),maxX=Math.max(...active.map(r=>r.right)),minY=Math.min(...active.map(r=>r.top)),maxY=Math.max(...active.map(r=>r.bottom));
   // Справа от клеток, иначе над полем или под ним; слева — последним:
   // там карточка закрывает подпись той самой строки, которую заполняют.
   // На телефоне — лист во всю ширину у нижнего края, а если поле внизу —
   // у верхнего, под шапкой. Плавающая карточка рядом с клетками на узком
   // экране всегда ложилась на соседние строки бланка.
   const docked=[{x:left+(vw-box.width)/2,y:floor-box.height-gap},{x:left+(vw-box.width)/2,y:ceiling+gap}];
   const candidates=p.touch?docked:[
    {x:maxX+gap,y:clamp(minY,ceiling+gap,floor-box.height-gap)},
    {x:clamp(minX,left+gap,left+vw-box.width-gap),y:minY-box.height-gap},
    {x:clamp(minX,left+gap,left+vw-box.width-gap),y:maxY+gap},
    {x:minX-box.width-gap,y:clamp(minY,ceiling+gap,floor-box.height-gap)},
   ];
   const fits=(v:{x:number;y:number})=>v.x>=left+gap-1&&v.y>=ceiling+gap-1&&v.x+box.width<=left+vw-gap+1&&v.y+box.height<=floor-gap+1;
   // Панель справа («Твоё значение», «Дальше») — тоже препятствие: карточка
   // поля ставилась справа от клеток прямо поверх неё и закрывала ввод.
   const panels=p.touch?[]:Array.from(document.querySelectorAll<HTMLElement>('[data-permesso-inspector]')).map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height);
   const clear=(v:{x:number;y:number})=>active.every(r=>overlap({...v,width:box.width,height:box.height},r)<.5)&&panels.every(r=>overlap({...v,width:box.width,height:box.height},r)<.5);
   let placement=candidates.find(v=>fits(v)&&clear(v));
   if(!placement){
    const above=minY-ceiling-gap*2,below=floor-maxY-gap*2,upper=above>below,free=Math.max(64,upper?above:below);
    node.style.maxHeight=free+"px";const height=Math.min(box.height,free);
    const x=p.touch?left+(vw-box.width)/2:clamp(minX,left+gap,left+vw-box.width-gap);
    placement={x,y:upper?minY-height-gap:maxY+gap};placement.y=clamp(placement.y,ceiling+gap,floor-height-gap);
   }
   node.style.left=placement.x+"px";node.style.top=placement.y+"px";node.style.visibility="visible";
  }
  position();const resize=new ResizeObserver(position);resize.observe(node);
  const scroll=(e:Event)=>{if(!(e.target instanceof Node)||!node.contains(e.target))position();};
  window.addEventListener("scroll",scroll,true);window.addEventListener("resize",position);window.visualViewport?.addEventListener("resize",position);
  return()=>{resize.disconnect();window.removeEventListener("scroll",scroll,true);window.removeEventListener("resize",position);window.visualViewport?.removeEventListener("resize",position);};
 },[p.anchor,p.field.id,p.touch,answer,onClose]);
 const locked=answer.status==="empty"||answer.status==="post"||p.field.readOnly||p.field.kind==="signature";
 return createPortal(<aside ref={cardRef} id={id} className={styles.preview} data-permesso-hover={p.field.id} data-touch={p.touch} data-pinned={p.pinned} role={p.touch?"dialog":"tooltip"} aria-label={p.touch?`${p.field.meta.ru} — подсказка`:undefined} aria-modal={p.touch?false:undefined} onPointerEnter={onEnter} onPointerLeave={onLeave} data-fab-yield>
  {p.touch&&<button className={styles.close} type="button" aria-label="Закрыть подсказку" onClick={onClose}>×</button>}
  <AnswerSummary answer={answer} field={p.field} compact={p.touch}/>
  {p.touch&&!locked&&<button type="button" className={styles.edit} onClick={onEdit}>Ввести крупно</button>}
 </aside>,document.body);
}
