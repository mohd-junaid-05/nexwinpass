import { EVENT, TRACK_DETAILS, FONTS, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData, StyleKey } from "../types";
import { drawMascot } from "../mascotPlaceholder";
import { drawRoundRect, hexToRgba } from "../utils";
import { drawTrackMark } from "../marks";
import {
  drawContactShadow,
  applySeededGrain,
  drawCardEdgeHighlight,
} from "../grain";

/**
 * Avatar Size Renderer (1080×1080):
 * Displays the mascot alone on its theme background, designed to survive
 * being cropped to a circle for profile avatars. Everything essential
 * sits strictly within the inscribed circle (r = 540 from center 540, 540).
 */
export function renderAvatarPass(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  style: StyleKey
): void {
  const width = 1080;
  const height = 1080;
  const mascot = getMascotConfig(participant.mascotId);
  const trackIndex = Math.max(0, Math.min(5, participant.track || 0));
  const trackInfo = TRACK_DETAILS[trackIndex] || TRACK_DETAILS[0];

  ctx.save();

  // 1. STYLE-THEMED BACKGROUND
  if (style === "editorial") {
    // Warm rich stone & paper
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#F6F4ED");
    grad.addColorStop(0.65, "#EBE5D8");
    grad.addColorStop(1, hexToRgba(mascot.theme.accent, 0.18));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (style === "night") {
    // Deep obsidian with intense mascot cosmic aura
    ctx.fillStyle = "#090B10";
    ctx.fillRect(0, 0, width, height);

    const aura = ctx.createRadialGradient(
      540,
      520,
      60,
      540,
      520,
      500
    );
    aura.addColorStop(0, hexToRgba(mascot.theme.glow, 0.55));
    aura.addColorStop(0.4, hexToRgba(mascot.theme.accent, 0.35));
    aura.addColorStop(0.7, hexToRgba(mascot.theme.gradient[1], 0.15));
    aura.addColorStop(1, "rgba(9, 11, 16, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);
  } else if (style === "pop") {
    // Pop: vibrant punchy gradient from popBg
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, mascot.theme.popBg || "#FFDE00");
    grad.addColorStop(1, mascot.theme.accent);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle decorative pop circle
    ctx.beginPath();
    ctx.arc(540, 540, 480, 0, Math.PI * 2);
    ctx.lineWidth = 12;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.stroke();
  } else {
    // Collector: dark foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#0B0E17");
    grad.addColorStop(0.5, mascot.theme.collectorPanel[0]);
    grad.addColorStop(1, mascot.theme.collectorPanel[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Metallic ring
    ctx.beginPath();
    ctx.arc(540, 540, 490, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.4);
    ctx.stroke();
  }

  // 2. CONTACT SHADOW UNDER MASCOT
  const shadowCenterY = 820;
  drawContactShadow(
    ctx,
    540,
    shadowCenterY,
    460,
    32,
    style === "pop" ? 0.3 : 0.5
  );

  // 3. MASCOT CENTERED (fits comfortably inside inscribed circle)
  // Circle boundary is r = 540. Mascot box is 660×660 centered at (540, 490),
  // which leaves >110px margin from top, left, and right circular crop edges!
  const mascotBox = {
    x: 540 - 330,
    y: 150,
    width: 660,
    height: 660,
  };

  drawMascot(ctx, mascotBox, participant, style, "bust");


  // 4. OPTIONAL SMALL BADGE AT BOTTOM (strictly inside circular boundary)
  // At y = 890, for a circle of r = 540 centered at 540,
  // width available at y = 890 (delta y = 350) is 2 * sqrt(540^2 - 350^2) = 2 * 411 = 822px.
  // Badge width is 320px, so it's comfortably inside the circle!
  const badgeY = 880;
  const badgeW = 320;
  const badgeH = 50;
  const badgeX = 540 - badgeW / 2;

  const badgeBg =
    style === "editorial"
      ? "rgba(237, 231, 218, 0.92)"
      : style === "pop"
      ? "#000000"
      : "rgba(15, 23, 42, 0.85)";

  const badgeStroke =
    style === "editorial"
      ? "#CFC6B3"
      : style === "pop"
      ? "#FFFFFF"
      : hexToRgba(mascot.theme.accent, 0.5);

  drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 25);
  ctx.fillStyle = badgeBg;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = badgeStroke;
  ctx.stroke();

  // Track mark inside badge
  drawTrackMark(
    ctx,
    trackInfo.mark,
    badgeX + 16,
    badgeY + 10,
    30,
    style === "editorial"
      ? "#8A3B14"
      : style === "pop"
      ? "#FFDD00"
      : mascot.theme.accent
  );


  // Badge text
  ctx.fillStyle =
    style === "editorial"
      ? "#4A4337"
      : style === "pop"
      ? "#FFFFFF"
      : "#F8FAFC";
  ctx.font = `700 18px ${FONTS.sansFacts}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(EVENT.badgeText, 540 + 15, badgeY + badgeH / 2);

  // 5. CARD EDGE HIGHLIGHT & DETERMINISTIC GRAIN
  drawCardEdgeHighlight(
    ctx,
    20,
    20,
    width - 40,
    height - 40,
    30,
    style !== "editorial" && style !== "pop"
  );

  applySeededGrain(ctx, participant.seed, width, height, "overlay");

  ctx.restore();
}
