import { PRICE_MAIN } from "@/data/pricing";
import { FAQ, faqParagraphs } from "@/components/home/faqData";


export function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IITALY",
    url: "https://iitaly.net",
    areaServed: "KZ",
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "IITALY\u00A0— сопровождение поступления в Италию",
    provider: { "@type": "Organization", name: "IITALY", url: "https://iitaly.net" },
    areaServed: "Kazakhstan",
    serviceType: "Сопровождение поступления в университеты Италии",
    offers: {
      "@type": "Offer",
      price: PRICE_MAIN,
      priceCurrency: "KZT",
      url: "https://iitaly.net/prices",
      availability: "https://schema.org/InStock",
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    // The answers the page shows (faqData.ts). This used to be an older copy
    // whose refund condition was the one for manual payment (22 Nov).
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: faqParagraphs(item.a).join(" ") },
    })),
  };

  return (
    <>
      {[organization, service, faqPage].map((value, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
