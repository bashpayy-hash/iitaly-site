import Link from "next/link";
import type { MouseEventHandler } from "react";
export function VespiIntroSection({href="/portal",action="Заполнить анкету",onAction,withAction=true}:{placement?:"home"|"guides"|"portal";href?:string;action?:string;onAction?:MouseEventHandler<HTMLAnchorElement>;withAction?:boolean}) {
 return <section className="gallery-onboarding-intro"><h2>Начни со своей ситуации.</h2><p>Образование, цель и год поступления помогут собрать последовательный план.</p>{withAction&&<Link href={href} className="gallery-button" onClick={onAction}><span>{action}</span></Link>}</section>;
}
