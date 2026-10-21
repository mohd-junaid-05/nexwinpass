import { EVENT, TRACKS, FONTS, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData } from "../types";
import {
  drawRoundRect,
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
 * Collector Style (Landscape 1920×1080):
 * Modern digital social share card with a themed foil frame derived from the mascot's theme,
 * standalone character trading-card panel on the left, high-impact tech display typography (Sora),
 * glassmorphic building mission container, and clean footer.
 */
export function renderCollectorStyle(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  width: number = 1920,
  height: number = 1080
): void {
  const mascot = getMascotConfig(participant.mascotId);
  const trackIndex = Math.max(0, Math.min(5, participant.track || 0));
  const trackName = TRACKS[trackIndex] || "Open Innovation";

  const scale = width / 1920;

  ctx.save();

  // 1. Dark Trading-Card Graphite Background
  ctx.fillStyle = "#0A0D15";
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient backdrop glow
  const bgGlow = ctx.createRadialGradient(
    width * 0.35,
    height * 0.5,
    60 * scale,
    width * 0.35,
    height * 0.5,
    width * 0.7
  );
  bgGlow.addColorStop(0, hexToRgba(mascot.theme.deeper, 0.28));
  bgGlow.addColorStop(0.5, hexToRgba(mascot.theme.gradient[1], 0.12));
  bgGlow.addColorStop(1, "rgba(10, 13, 21, 0)");
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, width, height);

  // Outer perimeter foil accent frame
  drawThemedFoilFrame(
    ctx,
    24 * scale,
    24 * scale,
    width - 48 * scale,
    height - 48 * scale,
    24 * scale,
    Math.max(2, 3.5 * scale),
    participant.mascotId,
    participant.seed
  );

  drawCardEdgeHighlight(ctx, 24 * scale, 24 * scale, width - 48 * scale, height - 48 * scale, 20 * scale, true);

  // 2. Standalone Character Trading-Card Panel on the Left
  const cardX = Math.round(64 * scale);
  const cardY = Math.round(64 * scale);
  const cardW = Math.round(710 * scale);
  const cardH = Math.round(952 * scale);
  const cardR = Math.round(32 * scale);

  // Card panel background (dark glass container)
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = "rgba(13, 17, 28, 0.96)";
  ctx.fill();

  // Signature Mascot World Pattern inside trading card panel
  drawMascotWorldPattern(ctx, participant.mascotId, participant.seed, cardX, cardY, cardW, cardH, {
    opacity: 0.16,
    color: mascot.theme.glow,
  });

  // Themed Foil Frame around character panel (colors from mascot theme)
  drawThemedFoilFrame(
    ctx,
    cardX,
    cardY,
    cardW,
    cardH,
    cardR,
    Math.max(3, 4.5 * scale),
    participant.mascotId,
    participant.seed
  );

  // Trading card header inside panel: "BUILDER" badge + Holographic Diamond Emblem
  const cardHeaderY = cardY + Math.round(48 * scale);
  drawRoundRect(ctx, cardX + 32 * scale, cardHeaderY - 20 * scale, 136 * scale, 42 * scale, 21 * scale);
  ctx.fillStyle = "rgba(10, 14, 22, 0.85)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 ${Math.round(15 * scale)}px ${FONTS.techCollector}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BUILDER", cardX + 100 * scale, cardHeaderY);

  // Holographic Diamond Emblem in top-right of trading card
  drawCollectorHoloEmblem(ctx, cardX + cardW - 52 * scale, cardHeaderY, 20 * scale, participant.mascotId, participant.seed);

  // Character inside trading card
  const mascotBoxX = cardX + Math.round(24 * scale);
  const mascotBoxY = cardY + Math.round(88 * scale);
  const mascotBoxW = cardW - Math.round(48 * scale);
  const mascotBoxH = cardH - Math.round(190 * scale);
  const baselineY = cardY + cardH - Math.round(90 * scale);

  // Grounding contact shadow
  drawContactShadow(ctx, cardX + cardW / 2, baselineY, cardW * 0.65, Math.round(30 * scale), 0.5);

  drawMascot(
    ctx,
    { x: mascotBoxX, y: mascotBoxY, width: mascotBoxW, height: mascotBoxH },
    participant,
    "collector",
    "full"
  );

  // Bottom banner inside trading card: Mascot Name & Tagline
  const cardFooterY = cardY + cardH - Math.round(46 * scale);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 ${Math.round(38 * scale)}px ${FONTS.techCollector}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(mascot.name, cardX + 36 * scale, cardFooterY);

  ctx.fillStyle = "#94A3B8";
  ctx.font = `600 ${Math.round(22 * scale)}px ${FONTS.sansFacts}`;
  ctx.textAlign = "right";
  ctx.fillText(mascot.tagline, cardX + cardW - 36 * scale, cardFooterY);

  // 3. Right Hero Content Column
  const infoX = Math.round(850 * scale);
  const infoW = width - infoX - Math.round(70 * scale);

  // Event Header
  const headerY = Math.round(110 * scale);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 ${Math.round(28 * scale)}px ${FONTS.techCollector}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`✱ ${EVENT.badgeText}`, infoX, headerY);

  ctx.fillStyle = "#94A3B8";
  ctx.font = `600 ${Math.round(20 * scale)}px ${FONTS.sansFacts}`;
  ctx.fillText(`${EVENT.name} • by NexWin`, infoX, headerY + Math.round(38 * scale));

  // Hero Participant Name (Sora)
  const nameStartY = Math.round(270 * scale);
  drawHeroName(
    ctx,
    participant.name,
    infoX,
    nameStartY,
    infoW,
    Math.round(260 * scale),
    FONTS.techCollector,
    "#FFFFFF",
    "800",
    false
  );

  // Building Card Container
  const boxY = Math.round(600 * scale);
  const boxW = infoW;
  const boxH = Math.round(168 * scale);
  const boxR = Math.round(24 * scale);

  drawRoundRect(ctx, infoX, boxY, boxW, boxH, boxR);
  ctx.fillStyle = "rgba(16, 24, 39, 0.78)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.stroke();

  // Building Label
  ctx.fillStyle = "#38BDF8";
  ctx.font = `800 ${Math.round(16 * scale)}px ${FONTS.techCollector}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("BUILDING", infoX + Math.round(36 * scale), boxY + Math.round(28 * scale));

  // Idea Title
  const ideaText = participant.ideaTitle || "Building the Future of Tech";
  const ideaFontSize = Math.round(34 * scale);
  const ideaFont = `600 ${ideaFontSize}px ${FONTS.sansFacts}`;
  const ideaLines = wrapAndFitText(ctx, ideaText, boxW - Math.round(72 * scale), 2, ideaFont);

  ctx.fillStyle = "#F8FAFC";
  ctx.font = ideaFont;
  ideaLines.forEach((line, idx) => {
    ctx.fillText(
      line,
      infoX + Math.round(36 * scale),
      boxY + Math.round(66 * scale) + idx * Math.round(44 * scale)
    );
  });

  // 4. Bottom Footer
  const footerY = Math.round(965 * scale);

  // Left: Event Site Link
  ctx.fillStyle = "#38BDF8";
  ctx.font = `700 ${Math.round(24 * scale)}px ${FONTS.techCollector}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`${EVENT.siteUrl.replace(/^https?:\/\//, "")} ↗`, infoX, footerY);

  // Right: Track and Team (dynamically sized and formatted, never overlaps)
  const trackTeamText = formatTrackAndTeam(trackName, trackIndex, participant.team);
  const rightX = width - Math.round(70 * scale);
  const availableTrackW = rightX - (infoX + Math.round(360 * scale));
  drawFooterTrackAndTeam(
    ctx,
    trackTeamText,
    rightX,
    footerY,
    availableTrackW,
    FONTS.techCollector,
    "#94A3B8",
    scale
  );

  // Seeded grain across the card
  applySeededGrain(ctx, participant.seed, width, height, "overlay");

  ctx.restore();
}
