"use client";
/* eslint-disable @next/next/no-img-element -- Existing local editorial illustration. */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useId, useState } from "react";
import { StoryPills } from "@/components/story/MediaSwitcher";
import styles from "@/components/marketing/editorial-sections.module.css";
import story from "@/components/story/story.module.css";

type Preview = { id: string; name: string; type: string; city: string };
export function UniversitySpotlight({ universities }: { universities: Preview[] }) {
  const [index, setIndex] = useState(0);
  const panel = useId();
  const university = universities[index];
  return <div className={styles.card} data-university-switcher>
    <StoryPills items={universities.map(item => ({ id:item.id, title:item.name }))} index={index} onSelect={setIndex} label="Университеты Италии" panelId={panel} />
    <div className={`${styles.universityPanel} ${story.frame}`} key={university.id} role="tabpanel" id={panel} aria-labelledby={`${panel}-tab-${index}`}>
      <div><h3>{university.name}</h3><p>{university.city} · {university.type}</p><p>Программы, требования и дедлайны — в общей базе университетов.</p><Link data-fab-yield className={styles.cardLink} href="/universities">Открыть каталог<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      <img src="/illustrations/editorial/portal-campus-512.webp" alt="" width={512} height={512} loading="lazy" />
    </div>
  </div>;
}
