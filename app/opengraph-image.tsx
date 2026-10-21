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
          background: "#080C09",
          color: "#EDF7EE",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Subtle glowing aura */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, rgba(8, 12, 9, 0) 70%)",
            top: "65px",
            left: "350px",
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 255, 136, 0.1)",
            border: "1px solid rgba(0, 255, 136, 0.4)",
            borderRadius: "9999px",
            padding: "8px 24px",
            fontSize: "18px",
            fontWeight: 700,
            color: "#00FF88",
            letterSpacing: "0.08em",
            marginBottom: "24px",
          }}
        >
          {EVENT.badgeText} • BUILDER PASS STUDIO
        </div>

        {/* Brand Name */}
        <div
          style={{
            display: "flex",
            fontSize: "76px",
            fontWeight: 900,
            textAlign: "center",
            marginBottom: "10px",
            color: "#EDF7EE",
            letterSpacing: "-0.02em",
          }}
        >
          {EVENT.name}
        </div>

        {/* Organizer */}
        <div
          style={{
            display: "flex",
            fontSize: "26px",
            fontWeight: 700,
            color: "#00FF88",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          {`by ${EVENT.organizer}`}
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: "22px",
            color: "#8FA895",
            textAlign: "center",
            maxWidth: "840px",
            lineHeight: 1.4,
            marginBottom: "36px",
          }}
        >
          {EVENT.tagline}
        </div>

        {/* Date Line */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            fontSize: "19px",
            color: "#EDF7EE",
            background: "#0E1A12",
            border: "1px solid #1B3624",
            padding: "10px 28px",
            borderRadius: "12px",
          }}
        >
          <span style={{ display: "flex" }}>{`🗓️ ${EVENT.passDateLine}`}</span>
          <span style={{ display: "flex", color: "#00FF88" }}>•</span>
          <span style={{ display: "flex", color: "#8FA895" }}>Nexus Coding Club</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
