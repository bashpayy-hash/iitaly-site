import { ImageResponse } from "next/og";
import { PRICE_MAIN, fmtPrice } from "@/data/pricing";

export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export function socialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#f5f0e8",
          color: "#181925",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
            IITALY<span style={{ color: "#fc1c46" }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#686868" }}>Казахстан → Италия</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 0.98, fontWeight: 800, letterSpacing: -3 }}>
            Поступление в Италию.
          </div>
          <div style={{ display: "flex", marginTop: 16, fontSize: 76, lineHeight: 0.98, fontWeight: 800, letterSpacing: -3, color: "#fc1c46" }}>
            По понятному плану.
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 27, lineHeight: 1.35, color: "#4f4f56" }}>
            Вузы · документы · DSU · Universitaly · виза D · Telegram-дедлайны
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24 }}>
          <div style={{ display: "flex", fontWeight: 700 }}>{fmtPrice(PRICE_MAIN)} KZT · разово</div>
          <div style={{ display: "flex", color: "#686868" }}>iitaly.kz</div>
        </div>
      </div>
    ),
    SOCIAL_IMAGE_SIZE,
  );
}
