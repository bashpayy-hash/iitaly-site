import type { Metadata } from "next";
import { GuideTopicPage } from "@/components/guides/GuidePage";
import { VISA_GUIDE } from "@/components/guides/guideCatalogue";

export const metadata:Metadata={title:VISA_GUIDE.title,description:VISA_GUIDE.teaser,alternates:{canonical:"/guides/visa"}};
export default function VisaPage(){return <GuideTopicPage id="visa" />;}
