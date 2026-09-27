"use client";

import { useCallback, useEffect, useId, useRef, useState, type ClipboardEvent, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ALL_GUIDANCE_FIELDS, ORIGINAL_PAGES, OFFICIAL_PDF, PAPER, normalizedRuns, fieldBounds, fieldWidth, getPart, editorMode, valueProblem, type EditorField, type CellRun } from "./permessoOriginalGeometry";
import type { PermessoScenario } from "./permessoData";
import { fieldAnswer } from "./permessoFieldAnswer";
import { PermessoFieldHover, type FieldPreview } from "./PermessoFieldHover";
import s from "./permesso-editor.module.css";
import z from "./permesso-zones.module.css";

type Props = {
  page:number; selectedId:string; values:Record<string,string>; scenario:PermessoScenario; hints:boolean; zoom:number; showExample:boolean;
  onSelect:(f:EditorField,focus?:boolean)=>void; onChange:(f:EditorField,part:number,input:string)=>void;
  onPaste:(f:EditorField,part:number,e:ClipboardEvent<HTMLInputElement>)=>void;
  onToggle:(f:EditorField,option?:string)=>void; onEditLarge:(f:EditorField)=>void;
};
const percent=(n:number)=>`${n*100}%`;
function groupStyle(f:EditorField):CSSProperties { const b=fieldBounds(f);return {left:percent(b.x),top:percent(b.y),width:percent(b.width),height:percent(b.height)}; }
function partStyle(f:EditorField,r:CellRun):CSSProperties {
  const b=fieldBounds(f);
  return {left:percent((r.x/PAPER.width-b.x)/b.width),top:percent((r.y/PAPER.height-b.y)/b.height),width:percent(fieldWidth(r)/PAPER.width/b.width),height:percent(r.height/PAPER.height/b.height),"--cell-pitch":`${r.pitch/PAPER.width*100}cqw`,"--cell-pad":`${(r.cell-7.2)/2/PAPER.width*100}cqw`} as CSSProperties;
}
const label=(f:EditorField)=>`${f.kind==="block"?"Блок":"Поле"} ${f.id}, ${f.meta.it}, ${f.meta.ru}`;
const pointerDistance=(x:number,y:number,r:DOMRect)=>Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom));

export function PermessoPaperSheet(props:Props) {
  const {page,selectedId,values,scenario,hints,zoom,showExample,onSelect,onChange,onPaste,onToggle,onEditLarge}=props;
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
  const [preview,setPreview]=useState<FieldPreview|null>(null);
  const previewRef=useRef<FieldPreview|null>(null), rootRef=useRef<HTMLDivElement>(null);
  const openRef=useRef<ReturnType<typeof setTimeout>|null>(null),closeRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const overCardRef=useRef(false),touchRef=useRef<{x:number;y:number;scroll:number;id:number}|null>(null),cancelClickRef=useRef(false);
  const maskId=useId().replace(/:/g,"");
  const fields=ALL_GUIDANCE_FIELDS.filter(f=>f.page===page), asset=ORIGINAL_PAGES[page-1];
  const clearTimers=useCallback(()=>{if(openRef.current)clearTimeout(openRef.current);if(closeRef.current)clearTimeout(closeRef.current);},[]);
  const close=useCallback(()=>{clearTimers();previewRef.current=null;setPreview(null);},[clearTimers]);
  const keep=useCallback(()=>{overCardRef.current=true;if(closeRef.current)clearTimeout(closeRef.current);},[]);
  const leave=useCallback(()=>{
    overCardRef.current=false;
    if(openRef.current)clearTimeout(openRef.current);
    closeRef.current=setTimeout(()=>{
      const p=previewRef.current;
      if(!p||p.pinned||overCardRef.current||p.anchor.contains(document.activeElement))return;
      close();
    },180);
  },[close]);
  useEffect(()=>()=>clearTimers(),[clearTimers]);
  useEffect(()=>{
    const escape=(e:globalThis.KeyboardEvent)=>{if(e.key==="Escape"&&previewRef.current){e.preventDefault();close();}};
    const outside=(e:globalThis.PointerEvent)=>{if(!(e.target instanceof Element))return;if(e.target.closest('[data-permesso-hover], [data-zone-field]'))return;close();};
    window.addEventListener("keydown",escape);window.addEventListener("pointerdown",outside);
    return()=>{window.removeEventListener("keydown",escape);window.removeEventListener("pointerdown",outside);};
  },[close]);
  function anchorFor(f:EditorField){return rootRef.current?.querySelector<HTMLElement>(`[data-zone-field="${f.id}"]`)||null;}
  function show(f:EditorField,touch=false,pinned=false,delay=0){
    clearTimers();const anchor=anchorFor(f);if(!anchor)return;
    const apply=()=>{const p={field:f,anchor,touch,pinned};previewRef.current=p;setPreview(p);};
    if(delay)openRef.current=setTimeout(apply,delay);else apply();
  }
  function pin(f:EditorField,touch=false){onSelect(f);show(f,touch,true);}
  function onKey(e:KeyboardEvent<HTMLElement>,f:EditorField){
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){
      e.preventDefault();e.stopPropagation();
      const i=fields.findIndex(item=>item.id===selectedId),next=fields[Math.max(0,Math.min(fields.length-1,i+(e.key==="ArrowDown"?1:-1)))];
      pin(next);requestAnimationFrame(()=>{const el=anchorFor(next)?.querySelector<HTMLButtonElement>('[data-field-zone]');el?.focus({preventScroll:true});el?.scrollIntoView({block:"nearest",behavior:"auto"});});
    }else if(e.key==="Enter"&&e.target instanceof HTMLInputElement){e.preventDefault();pin(f);}
  }
  function nearest(x:number,y:number,fallback:EditorField){
    let nearestField=fallback,best=Infinity;
    for(const f of fields){
      const rects=Array.from(anchorFor(f)?.querySelectorAll<HTMLElement>('[data-cell-outline]')||[]).map(el=>el.getBoundingClientRect());
      const d=Math.min(...rects.map(r=>pointerDistance(x,y,r)));
      if(d<best){best=d;nearestField=f;}
    }
    return best<=30?nearestField:fallback;
  }
  function touchDown(e:PointerEvent<HTMLElement>){if(e.pointerType!=="touch")return;cancelClickRef.current=true;touchRef.current={x:e.clientX,y:e.clientY,scroll:window.scrollY,id:e.pointerId};}
  function touchUp(e:PointerEvent<HTMLElement>,f:EditorField){
    const start=touchRef.current;if(e.pointerType!=="touch"||!start||start.id!==e.pointerId)return;touchRef.current=null;
    if(Math.hypot(start.x-e.clientX,start.y-e.clientY)>8||Math.abs(start.scroll-window.scrollY)>3)return;
    const target=nearest(e.clientX,e.clientY,f);pin(target,true);
  }
  function userValue(f:EditorField){return f.id==="8"?(scenario==="rilascio"?"X":""):f.id==="9"?(scenario==="rinnovo"?"X":""):editorMode(f,scenario)==="empty"||f.readOnly?"":values[f.id]||"";}
  const activeField=preview?.field||fields.find(f=>f.id===selectedId);
  const activeRects=activeField?normalizedRuns(activeField):[];
  const pinnedField=fields.find(f=>f.id===selectedId);
  const reading=preview?fieldAnswer(preview.field,scenario,userValue(preview.field),showExample):null;
  return <>
    <div className={s.sheetViewport} aria-label="Лист: при увеличении можно прокручивать" data-sheet-viewport>
      <div className={s.sheet} ref={rootRef} style={{width:`${zoom*100}%`}} data-sheet-page={page} data-ready={ready}>
        {/* eslint-disable-next-line @next/next/no-img-element -- unchanged lossless original, not a generated skin */}
        <img key={retry} className={s.background} src={asset.url} width={1785} height={2526} alt="" aria-hidden="true" referrerPolicy="no-referrer" onLoad={()=>{setReady(true);setFailed(false);}} onError={()=>{setFailed(true);setReady(false);close();}}/>
        {!ready&&<div className={s.loading} role="status">{failed?<><p>Не удалось загрузить основу бланка. Поля скрыты, чтобы не показывать их без оригинала.</p><button type="button" onClick={()=>{setFailed(false);setRetry(retry+1);}}>Повторить загрузку</button><a href={OFFICIAL_PDF} target="_blank" rel="noopener noreferrer">Открыть PDF</a></>:"Загружаю оригинальный лист…"}</div>}
        {ready&&fields.map(f=>{
          const mode=editorMode(f,scenario),selected=selectedId===f.id,locked=mode==="empty"||mode==="post"||f.readOnly||f.kind==="signature";
          const real=userValue(f),sample=showExample&&!locked&&mode!=="verify"?f.meta.example?.[scenario]||"":"";
          const display=sample||real;
          return <div key={f.id} className={z.group} style={groupStyle(f)} data-zone-field={f.id} data-pinned={selected} data-block={f.kind==="block"} onPointerEnter={e=>{if(e.pointerType!=="touch"&&!e.buttons)show(f,false,false,100);}} onPointerLeave={leave} onFocusCapture={()=>{if(previewRef.current?.field.id!==f.id||!previewRef.current.pinned)show(f);}} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))leave();}} onKeyDown={e=>onKey(e,f)} onPointerDownCapture={touchDown} onPointerUpCapture={e=>touchUp(e,f)} onPointerCancel={()=>{touchRef.current=null;cancelClickRef.current=true;}}>
            <button type="button" className={z.zoneButton} data-field-zone={f.id} aria-label={label(f)} aria-pressed={selected} onClick={e=>{if(cancelClickRef.current&&e.detail>0){cancelClickRef.current=false;return;}pin(f);}}/>
            {f.runs.map((r,i)=>{
              const part=getPart(f,real,i),glyph=getPart(f,display,i),checkbox=f.kind==="check"||f.kind==="radio";
              const checked=f.kind==="radio"?display===r.label:display==="X";
              const name=label(f)+(f.runs.length>1?`, ${r.label||`часть ${i+1}`}`:"");
              return <div className={`${s.overlay} ${z.part}`} style={partStyle(f,r)} key={i} data-editor-field={f.id} data-part={i} data-selected={selected} data-state={mode} data-example={!!sample} data-locked={locked}>
                <span className={z.outlineProbe} data-cell-outline={f.id}/>
                {checkbox||locked?<button type="button" tabIndex={-1} className={s.mark} aria-label={name} aria-pressed={checkbox?checked:undefined} onClick={()=>{pin(f);if(!locked&&!showExample)onToggle(f,f.kind==="radio"?r.label:undefined);}}>{checkbox&&checked?"X":""}</button>:<>
                  <input tabIndex={-1} className={f.kind==="line"?s.lineInput:s.paperInput} aria-label={name} aria-invalid={!!valueProblem(f,real)} aria-describedby={selected?"permesso-value-format permesso-value-error":undefined} value={part} maxLength={f.kind==="line"?70:r.count} autoComplete="off" spellCheck={false} inputMode={f.kind==="date"||f.meta.kind==="number"?"numeric":"text"} placeholder={hints&&selected&&!display?(f.kind==="date"?["ДД","ММ","ГГГГ"][i]:f.meta.ru):""} onClick={()=>pin(f)} onChange={e=>{onSelect(f);onChange(f,i,e.target.value);}} onPaste={e=>{onSelect(f);onPaste(f,i,e);}}/>
                  {f.kind!=="line"&&<div className={s.glyphs} aria-hidden="true">{Array.from(glyph).map((char,k)=><span key={k} style={{left:`${(k*r.pitch+r.cell/2)/fieldWidth(r)*100}%`}}>{char}</span>)}</div>}
                </>}
              </div>;
            })}
          </div>;
        })}
        {ready&&activeField&&<svg className={z.focusLayer} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" data-focused-group={activeField.id}>
          <defs><mask id={maskId}><rect width="1" height="1" fill="white"/>{activeRects.map((r,i)=><rect key={i} x={r.x-.0015} y={r.y-.0015} width={r.width+.003} height={r.height+.003} fill="black"/>)}</mask></defs>
          <rect width="1" height="1" fill="#fffdf9" opacity=".45" mask={`url(#${maskId})`}/>
          {pinnedField&&pinnedField.id!==activeField.id&&normalizedRuns(pinnedField).map((r,i)=><rect key={`p${i}`} x={r.x-.001} y={r.y-.001} width={r.width+.002} height={r.height+.002} fill="none" stroke="#a46155" strokeWidth=".0014" vectorEffect="non-scaling-stroke"/>)}
          {activeRects.map((r,i)=><rect key={i} x={r.x-.0015} y={r.y-.0015} width={r.width+.003} height={r.height+.003} fill="#b8785e" fillOpacity=".09" stroke="#944137" strokeWidth=".002"/>)}
        </svg>}
      </div>
    </div>
    {preview&&reading&&<PermessoFieldHover preview={preview} answer={reading} onClose={close} onEnter={keep} onLeave={leave} onEdit={()=>{const f=preview.field;close();onEditLarge(f);}}/>}
  </>;
}
