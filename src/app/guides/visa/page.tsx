import type { Metadata } from "next";
import { pageMeta } from "@/app/pageMeta";
import { GuideTopicPage } from "@/components/guides/GuidePage";
import { VISA_GUIDE } from "@/components/guides/guideCatalogue";

export const metadata:Metadata=pageMeta({path:"/guides/visa",title:VISA_GUIDE.title,description:VISA_GUIDE.teaser});
export default function VisaPage(){return <GuideTopicPage id="visa" />;}
