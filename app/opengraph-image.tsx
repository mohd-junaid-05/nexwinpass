import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/config";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#ffffff",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1e1533",
            border: "1px solid #7c3aed",
            borderRadius: "9999px",
            padding: "8px 24px",
            fontSize: "20px",
            fontWeight: 700,
            color: "#c4b5fd",
            marginBottom: "28px",
          }}
        >
          {EVENT.badgeText}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: 900,
            textAlign: "center",
            marginBottom: "18px",
            color: "#ffffff",
          }}
        >
          Builder Pass Studio
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "26px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            marginBottom: "36px",
          }}
        >
          {`Customise, preview and export your official digital builder pass for ${EVENT.name}.`}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            fontSize: "20px",
            color: "#a1a1aa",
          }}
        >
          <span style={{ display: "flex" }}>{EVENT.dates}</span>
          <span style={{ display: "flex" }}>-</span>
          <span style={{ display: "flex" }}>{EVENT.siteUrl}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
