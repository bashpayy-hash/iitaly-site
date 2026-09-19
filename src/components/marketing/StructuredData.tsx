import { PRICE_MAIN } from "@/data/pricing";

const faq = [
  {
    q: "Гарантируете поступление, визу или стипендию?",
    a: "Нет. Решения принимают университет, консульство и регион. IITALY помогает выстроить маршрут, проверить документы и не пропустить сроки.",
  },
  {
    q: "Можно вернуть деньги?",
    a: "Да. В течение 7 календарных дней с оплаты возможен полный возврат, если личный кабинет ещё не активирован и персональный маршрут не выдан.",
  },
  {
    q: "ИИ может ошибиться?",
    a: "Да. Поэтому критичные требования нужно сверять с официальными источниками и, при необходимости, с человеком.",
  },
];

export function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IITALY",
    url: "https://iitaly.kz",
    areaServed: "KZ",
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "IITALY — сопровождение поступления в Италию",
    provider: { "@type": "Organization", name: "IITALY", url: "https://iitaly.kz" },
    areaServed: "Kazakhstan",
    serviceType: "Сопровождение поступления в университеты Италии",
    offers: {
      "@type": "Offer",
      price: PRICE_MAIN,
      priceCurrency: "KZT",
      url: "https://iitaly.kz/prices",
      availability: "https://schema.org/InStock",
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
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
