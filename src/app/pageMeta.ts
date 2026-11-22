import type { Metadata } from "next";
import { PRICE_MAIN } from "@/data/pricing";

/* The picture a link to the site arrives with: public/og.jpg, drawn by
   design/social/source/share-card.mjs.
   Until 22 Nov it was the file-based opengraph-image: a static export writes
   that file without an extension, and Netlify served it as text/plain with
   nosniff, which is not a picture to WhatsApp, Instagram or Telegram. Then a
   route wrote /og.png: words on plain paper in a fallback typeface. Owner,
   23 Nov, with the Telegram preview: «почему эта страница такая страшная,
   сделай ее нормально красивой с иллюстрацией в нашем стиле». It is now the
   /plan terrace with Vespi under the headline in the site's own face, as a
   JPEG (a photograph as PNG is over a megabyte; WhatsApp shows no preview for
   a heavy picture). The price is printed on it, so the address changes with
   the price and a stale copy is not kept by whoever cached the old one;
   design-share-review fails if the file was not drawn for the current price. */
export const SHARE_IMAGE = {
  url: `/og.jpg?v=${PRICE_MAIN}`,
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "IITALY — поступление в Италию по понятному плану",
} as const;

/* What a page says about itself when its link is sent to someone.
   Audit by taste-skill's rules, 22 Nov (owner: «проведи с ними аудит, то, что
   нужно в целом можно исправить»): every page inherited the home page's
   share title and description, so a link to /check or to a guide arrived in
   WhatsApp, Telegram or Instagram as «IITALY — поступление в Италию ведёт
   ИИ». A page's own title and description now go into its preview too, with
   its own address. The picture is named here again: a page's own openGraph
   replaces the root's whole object, the picture included. */
export function pageMeta({ path, title, description }: { path: string; title: string; description?: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "IITALY", locale: "ru_RU", title, description, url: path, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
  };
}
