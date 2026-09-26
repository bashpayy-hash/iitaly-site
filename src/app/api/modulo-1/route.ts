const OFFICIAL_MODULO_1 = "https://www.portaleimmigrazione.it/media/documentazione/Modulo_1.pdf";

export async function GET() {
  try {
    const upstream = await fetch(OFFICIAL_MODULO_1, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "IITALY/1.0 (+https://iitaly.netlify.app)" },
    });

    if (!upstream.ok) {
      return Response.json({ ok: false, error: "official_form_unavailable" }, { status: 502 });
    }

    const body = await upstream.arrayBuffer();
    return new Response(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=Mod-209-Modulo-1.pdf",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ ok: false, error: "official_form_unavailable" }, { status: 502 });
  }
}
