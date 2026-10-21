import { EVENT, TRACKS, FONTS, getMascotConfig, SAFE_ZONES } from "@/lib/config";
import type { ParticipantPassData, StyleKey } from "../types";
import {
  drawRoundRect,
  drawArchPath,
  hexToRgba,
  formatTrackAndTeam,
  drawFooterTrackAndTeam,
  drawHeroName,
  wrapAndFitText,
} from "../utils";
import { drawMascot } from "../mascotPlaceholder";
import { drawContactShadow, applySeededGrain, drawCardEdgeHighlight } from "../grain";
import { drawMascotWorldPattern } from "../patterns";
import { drawThemedFoilFrame, drawCollectorHoloEmblem } from "../foil";

/**
 * Vertical Base Card Layout for Square (1080×1080) and Story (1080×1920).
 * Clean digital social share card layout adhering to safe-zone guidelines,
 * distinct typography and color harmony for all four styles (Editorial, Night, Pop, Collector),
 * zero physical ticket artifacts (no cutting lines, barcodes, or pass IDs).
 */
export function renderVerticalPass(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  style: StyleKey,
  size: "square" | "story"
): void {
  const width = 1080;
  const height = size === "square" ? 1080 : 1920;
  const mascot = getMascotConfig(participant.mascotId);
  const trackIndex = Math.max(0, Math.min(5, participant.track || 0));
  const trackName = TRACKS[trackIndex] || "Open Innovation";
  const isStory = size === "story";

  ctx.save();

  // 1. Style Background
  if (style === "editorial") {
    ctx.fillStyle = "#F7F5EE";
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    grad.addColorStop(1, "rgba(224, 218, 206, 0.35)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#DDD5C4";
    ctx.strokeRect(32, 32, width - 64, height - 64);
  } else if (style === "night") {
    ctx.fillStyle = "#070A12";
    ctx.fillRect(0, 0, width, height);

    const spotY = isStory ? 920 : 540;
    const spotlight = ctx.createRadialGradient(width / 2, spotY, 30, width / 2, spotY, 560);
    spotlight.addColorStop(0, hexToRgba(mascot.theme.glow, 0.38));
    spotlight.addColorStop(0.5, hexToRgba(mascot.theme.gradient[0], 0.18));
    spotlight.addColorStop(1, "rgba(7, 10, 18, 0)");
    ctx.fillStyle = spotlight;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.35);
    ctx.strokeRect(32, 32, width - 64, height - 64);
  } else if (style === "pop") {
    ctx.fillStyle = mascot.theme.popBg || mascot.theme.base || "#10B981";
    ctx.fillRect(0, 0, width, height);

    const popGrad = ctx.createLinearGradient(0, 0, width, height);
    popGrad.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    popGrad.addColorStop(1, hexToRgba(mascot.theme.deeper, 0.35));
    ctx.fillStyle = popGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 5;
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(28, 28, width - 56, height - 56);
  } else {
    // Collector
    ctx.fillStyle = "#0A0D15";
    ctx.fillRect(0, 0, width, height);

    drawThemedFoilFrame(ctx, 28, 28, width - 56, height - 56, 24, 3.5, participant.mascotId, participant.seed);
  }

  drawCardEdgeHighlight(ctx, 32, 32, width - 64, height - 64, 16, style !== "editorial" && style !== "pop");

  // World Pattern in background
  drawMascotWorldPattern(ctx, participant.mascotId, participant.seed, 0, 0, width, height, {
    opacity: style === "editorial" ? 0.18 : style === "night" ? 0.24 : style === "pop" ? 0.12 : 0.15,
    color: style === "pop" ? "#000000" : mascot.theme.glow,
  });

  // 2. Safe Zone Bounds
  const safeZone = SAFE_ZONES[size];
  const contentTop = safeZone.top + 20;
  const contentBottom = height - safeZone.bottom - 20;
  const contentW = width - 120;
  const contentX = 60;

  // 3. Header Bar
  const headerY = contentTop + 10;
  const isLight = style === "editorial";
  const isPop = style === "pop";
  const primaryTextColor = isPop ? "#000000" : isLight ? "#1A1715" : "#FFFFFF";
  const secondaryTextColor = isPop ? "rgba(0, 0, 0, 0.75)" : isLight ? "#78716C" : "#94A3B8";

  ctx.fillStyle = primaryTextColor;
  ctx.font = isPop
    ? `900 28px ${FONTS.condensedPop}`
    : style === "collector"
    ? `800 26px ${FONTS.techCollector}`
    : `800 26px ${FONTS.sansFacts}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`✱ ${EVENT.badgeText}`, contentX, headerY);

  ctx.fillStyle = secondaryTextColor;
  ctx.font = `600 18px ${FONTS.sansFacts}`;
  ctx.fillText(`${EVENT.name} • by NexWin`, contentX, headerY + 34);

  // 4. Hero Participant Name
  const nameStartY = headerY + 70;
  const nameFontFamily =
    style === "editorial" || style === "night"
      ? FONTS.serifDisplay
      : style === "pop"
      ? FONTS.condensedPop
      : FONTS.techCollector;
  const nameWeight = style === "pop" ? "400" : style === "collector" ? "800" : "700";

  const { bottomY: nameEndY } = drawHeroName(
    ctx,
    participant.name,
    contentX,
    nameStartY,
    contentW,
    isStory ? 240 : 160,
    nameFontFamily,
    primaryTextColor,
    nameWeight,
    isPop
  );

  // 5. Idea / Building Container
  const ideaBoxY = nameEndY + 20;
  const ideaBoxW = contentW;
  const ideaBoxH = isStory ? 140 : 110;
  const ideaBoxR = 20;

  if (isPop) {
    // Pop Tilted Sticker
    ctx.save();
    ctx.translate(contentX + ideaBoxW / 2, ideaBoxY + ideaBoxH / 2);
    ctx.rotate((-2 * Math.PI) / 180);

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    drawRoundRect(ctx, -ideaBoxW / 2 + 4, -ideaBoxH / 2 + 6, ideaBoxW, ideaBoxH, ideaBoxR);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    drawRoundRect(ctx, -ideaBoxW / 2, -ideaBoxH / 2, ideaBoxW, ideaBoxH, ideaBoxR);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = `800 14px ${FONTS.sansFacts}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("BUILDING", -ideaBoxW / 2 + 28, -ideaBoxH / 2 + 18);

    const ideaText = participant.ideaTitle || "Building the Future of Tech";
    const ideaFont = `800 ${isStory ? 26 : 22}px ${FONTS.sansFacts}`;
    const lines = wrapAndFitText(ctx, ideaText, ideaBoxW - 56, 2, ideaFont);
    ctx.font = ideaFont;
    lines.forEach((l, idx) => {
      ctx.fillText(l, -ideaBoxW / 2 + 28, -ideaBoxH / 2 + (isStory ? 48 : 42) + idx * 32);
    });
    ctx.restore();
  } else if (style === "collector") {
    // Collector Glass Container
    drawRoundRect(ctx, contentX, ideaBoxY, ideaBoxW, ideaBoxH, ideaBoxR);
    ctx.fillStyle = "rgba(16, 24, 39, 0.78)";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.stroke();

    ctx.fillStyle = "#38BDF8";
    ctx.font = `800 14px ${FONTS.techCollector}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("BUILDING", contentX + 28, ideaBoxY + 18);

    const ideaText = participant.ideaTitle || "Building the Future of Tech";
    const ideaFont = `600 ${isStory ? 26 : 22}px ${FONTS.sansFacts}`;
    const lines = wrapAndFitText(ctx, ideaText, ideaBoxW - 56, 2, ideaFont);
    ctx.fillStyle = "#F8FAFC";
    ctx.font = ideaFont;
    lines.forEach((l, idx) => {
      ctx.fillText(l, contentX + 28, ideaBoxY + (isStory ? 48 : 42) + idx * 32);
    });
  } else {
    // Editorial & Night clean inline building section
    ctx.fillStyle = secondaryTextColor;
    ctx.font = `800 14px ${FONTS.sansFacts}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("BUILDING", contentX, ideaBoxY + 6);

    const ideaText = participant.ideaTitle || "Building the Future of Hackathons";
    const ideaFont = `italic 700 ${isStory ? 34 : 26}px ${FONTS.serifDisplay}`;
    const lines = wrapAndFitText(ctx, ideaText, ideaBoxW, 2, ideaFont);
    ctx.fillStyle = style === "editorial" ? "#1D4ED8" : mascot.theme.glow;
    ctx.font = ideaFont;
    lines.forEach((l, idx) => {
      ctx.fillText(l, contentX, ideaBoxY + 32 + idx * (isStory ? 40 : 32));
    });
  }

  // 6. Mascot Frame & Artwork
  const mascotAreaTop = ideaBoxY + ideaBoxH + (isStory ? 40 : 20);
  const footerAreaY = contentBottom - 40;
  const mascotAreaH = footerAreaY - mascotAreaTop - 30;
  const mascotBoxW = Math.min(contentW, Math.round(mascotAreaH * 0.9));
  const mascotBoxX = Math.round((width - mascotBoxW) / 2);
  const mascotBoxY = mascotAreaTop;

  if (style === "editorial") {
    // Arch Frame
    ctx.save();
    drawArchPath(ctx, mascotBoxX, mascotBoxY, mascotBoxW, mascotAreaH);
    ctx.fillStyle = "#EAE4D5";
    ctx.fill();

    const archGrad = ctx.createLinearGradient(mascotBoxX, mascotBoxY, mascotBoxX + mascotBoxW, mascotBoxY + mascotAreaH);
    archGrad.addColorStop(0, hexToRgba(mascot.theme.gradient[0], 0.25));
    archGrad.addColorStop(1, hexToRgba(mascot.theme.accent, 0.35));
    ctx.fillStyle = archGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.5);
    ctx.stroke();
    ctx.restore();
  } else if (style === "pop") {
    // Pop Circular Frame
    const cr = Math.min(mascotBoxW, mascotAreaH) / 2;
    const cx = width / 2;
    const cy = mascotBoxY + mascotAreaH / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(mascot.theme.gradient[1], 0.6);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.restore();
  } else if (style === "collector") {
    // Collector Trading Card Container
    drawRoundRect(ctx, mascotBoxX, mascotBoxY, mascotBoxW, mascotAreaH, 24);
    ctx.fillStyle = "rgba(13, 17, 28, 0.95)";
    ctx.fill();
    drawThemedFoilFrame(ctx, mascotBoxX, mascotBoxY, mascotBoxW, mascotAreaH, 24, 3, participant.mascotId, participant.seed);
    drawCollectorHoloEmblem(ctx, mascotBoxX + mascotBoxW - 36, mascotBoxY + 36, 16, participant.mascotId, participant.seed);
  }

  // Soft Contact Shadow
  drawContactShadow(ctx, width / 2, mascotBoxY + mascotAreaH - 24, mascotBoxW * 0.65, 24, 0.45);

  // Mascot Render
  drawMascot(
    ctx,
    { x: mascotBoxX + 16, y: mascotBoxY + 16, width: mascotBoxW - 32, height: mascotAreaH - 32 },
    participant,
    style,
    "full"
  );

  // Pill badge with mascot name & tagline
  const pillW = Math.min(360, mascotBoxW - 40);
  const pillH = 44;
  const pillX = Math.round((width - pillW) / 2);
  const pillY = Math.round(mascotBoxY + mascotAreaH - pillH / 2 - 8);

  drawRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = isPop ? "#000000" : isLight ? "#1A1715" : "rgba(18, 24, 38, 0.92)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isPop ? "#FFFFFF" : mascot.theme.accent;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = isPop ? `900 15px ${FONTS.condensedPop}` : `700 15px ${FONTS.sansFacts}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${mascot.name} • ${mascot.tagline}`, pillX + pillW / 2, pillY + pillH / 2);

  // 7. Footer Row
  const footerY = footerAreaY + 15;

  // Left: Event Site Link
  ctx.fillStyle = isPop ? "#000000" : isLight ? "#1A1715" : "#38BDF8";
  ctx.font = `700 20px ${FONTS.sansFacts}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`${EVENT.siteUrl.replace(/^https?:\/\//, "")} ↗`, contentX, footerY);

  // Right: Track and Team
  const trackTeamText = formatTrackAndTeam(trackName, trackIndex, participant.team);
  drawFooterTrackAndTeam(
    ctx,
    trackTeamText,
    contentX + contentW,
    footerY,
    contentW - 240,
    FONTS.sansFacts,
    secondaryTextColor,
    1.0
  );

  // Seeded grain across the card
  applySeededGrain(ctx, participant.seed, width, height, "overlay");

  ctx.restore();
}
