import { RisoSpot } from "@/components/marketing/PublicPaper";
import paper from "@/components/marketing/public-paper.module.css";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GuideFrame, GuideReviewed } from "@/components/guides/GuidePage";
import { GuideDirectory } from "@/components/guides/GuideDirectory";
import { GuideHelperLink, GuideReadingContext } from "@/components/guides/GuideReadingContext";
import ui from "@/components/guides/guide-pages.module.css";

export default function GuidesPage() {
  return <GuideFrame>
    <GuideReadingContext />
    <div className={paper.guideIntro} data-public-paper-zone="guides-intro">
    <RisoSpot subject="folder" placement="guide" />
    <header className={ui.indexHeader}>
      <h1>Гайды и виза</h1>
      <p className={ui.intro}>Выбери вопрос, который решаешь сейчас. Документы, поступление и жизнь в Италии — по одной теме за раз.</p>
      <GuideReviewed />
    </header>
    </div>
    <GuideDirectory />
    <div className={ui.indexFooter}>
      <Link href="/changes-2026-27" className={ui.textLink}>Что изменилось в правилах 2026/27<ArrowUpRight size={16} aria-hidden="true" /></Link>
      <GuideHelperLink />
    </div>
  </GuideFrame>;
}
