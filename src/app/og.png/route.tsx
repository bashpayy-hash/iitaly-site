import { socialImage } from "@/lib/socialImage";

/* The share picture as a file with an extension: a static export writes this
   route to out/og.png, and the host serves a .png as image/png. See
   SHARE_IMAGE in src/app/pageMeta.ts. */
export const dynamic = "force-static";

export function GET() {
  return socialImage();
}
