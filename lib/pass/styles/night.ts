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
import { drawNexWinLogo } from "../logo";

/**
 * Night Style (Landscape 1920×1080):
 * Deep obsidian card with a lit stage: spotlight in the mascot's glow colour,
 * soft floor reflection under the character, mascot's world pattern fading in from edge,
 * high-contrast display name (Playfair Display), glowing accent idea title, and clean footer.
 */
export function renderNightStyle(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  width: number = 1920,
  height: number = 1080
): void {
  const mascot = getMascotConfig(participant.mascotId);
  const trackIndex = Math.max(0, Math.min(TRACKS.length - 1, participant.track || 0));
  const trackName = TRACKS[trackIndex] || TRACKS[0];

  const scale = width / 1920;

  ctx.save();

  // 1. Deep Obsidian Card Background
  ctx.fillStyle = "#070A12";
  ctx.fillRect(0, 0, width, height);

  // Gradient stage floor at bottom
  const floorGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
  floorGrad.addColorStop(0, "rgba(7, 10, 18, 0)");
  floorGrad.addColorStop(1, hexToRgba(mascot.theme.glow, 0.08));
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, height * 0.65, width, height * 0.35);

  // Outer border & edge highlight
  ctx.lineWidth = Math.max(1.5, 2 * scale);
  ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.35);
  ctx.strokeRect(28 * scale, 28 * scale, width - 56 * scale, height - 56 * scale);

  drawCardEdgeHighlight(ctx, 28 * scale, 28 * scale, width - 56 * scale, height - 56 * scale, 16 * scale, true);

  // 2. Lit Stage Spotlight in Mascot's Glow Colour on the right
  const spotCenterX = Math.round(1490 * scale);
  const spotCenterY = Math.round(520 * scale);
  const spotRadius = Math.round(520 * scale);

  const spotlight = ctx.createRadialGradient(
    spotCenterX,
    spotCenterY,
    30 * scale,
    spotCenterX,
    spotCenterY,
    spotRadius
  );
  spotlight.addColorStop(0, hexToRgba(mascot.theme.glow, 0.38));
  spotlight.addColorStop(0.35, hexToRgba(mascot.theme.gradient[0], 0.22));
  spotlight.addColorStop(0.7, hexToRgba(mascot.theme.deeper, 0.1));
  spotlight.addColorStop(1, "rgba(7, 10, 18, 0)");

  ctx.fillStyle = spotlight;
  ctx.fillRect(width * 0.45, 0, width * 0.55, height);

  // 3. Signature Mascot World Pattern Fading in from the Top / Left Edge
  drawMascotWorldPattern(ctx, participant.mascotId, participant.seed, 0, 0, Math.round(980 * scale), Math.round(380 * scale), {
    opacity: 0.28,
    color: mascot.theme.glow,
    blendMode: "screen",
  });

  // 4. Mascot Stage on the Right
  const mascotBoxX = Math.round(1140 * scale);
  const mascotBoxY = Math.round(140 * scale);
  const mascotBoxW = Math.round(700 * scale);
  const mascotBoxH = Math.round(820 * scale);
  const baselineY = Math.round(920 * scale);

  // Soft floor contact shadow
  drawContactShadow(ctx, mascotBoxX + mascotBoxW / 2, baselineY, mascotBoxW * 0.65, Math.round(30 * scale), 0.55);

  drawMascot(
    ctx,
    { x: mascotBoxX, y: mascotBoxY, width: mascotBoxW, height: mascotBoxH },
    participant,
    "night",
    "full"
  );

  // Mascot Name & Tagline Pill at bottom right
  const pillW = Math.round(380 * scale);
  const pillH = Math.round(54 * scale);
  const pillX = Math.round(mascotBoxX + (mascotBoxW - pillW) / 2);
  const pillY = Math.round(baselineY + Math.round(20 * scale));

  drawRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = "rgba(18, 24, 38, 0.9)";
  ctx.fill();
  ctx.lineWidth = Math.max(1, 1.5 * scale);
  ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.5);
  ctx.stroke();

  // Theme colored dot + Name + Tagline
  ctx.beginPath();
  ctx.arc(pillX + Math.round(30 * scale), pillY + pillH / 2, 5 * scale, 0, Math.PI * 2);
  ctx.fillStyle = mascot.theme.glow;
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${Math.round(17 * scale)}px ${FONTS.sansFacts}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${mascot.name} • ${mascot.tagline}`, pillX + pillW / 2 + Math.round(8 * scale), pillY + pillH / 2);

  // 5. Left Content Column
  const infoX = Math.round(90 * scale);
  const infoW = Math.round(970 * scale);

  // Event Header
  const headerY = Math.round(110 * scale);
  const markSize = Math.round(52 * scale);
  drawNexWinLogo(ctx, infoX, headerY, markSize, {
    variant: "glow",
    isDarkBackground: true,
  });

  const headerTextX = infoX + markSize + Math.round(14 * scale);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 ${Math.round(28 * scale)}px ${FONTS.wideNight}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(EVENT.name, headerTextX, headerY - Math.round(2 * scale));

  ctx.fillStyle = "#64748B";
  ctx.font = `600 ${Math.round(18 * scale)}px ${FONTS.sansFacts}`;
  ctx.fillText(`by ${EVENT.organizer}`, headerTextX, headerY + Math.round(30 * scale));

  // Fine divider line below header
  const headerDivY = Math.round(185 * scale);
  ctx.beginPath();
  ctx.moveTo(infoX, headerDivY);
  ctx.lineTo(infoX + infoW, headerDivY);
  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.stroke();

  // Hero Participant Name (High-contrast display serif Playfair Display)
  const nameStartY = Math.round(270 * scale);
  drawHeroName(
    ctx,
    participant.name,
    infoX,
    nameStartY,
    infoW,
    Math.round(260 * scale),
    FONTS.serifDisplay,
    "#FFFFFF",
    "700",
    false
  );

  // Building Section
  const buildingY = Math.round(600 * scale);
  ctx.fillStyle = "#64748B";
  ctx.font = `800 ${Math.round(16 * scale)}px ${FONTS.sansFacts}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("BUILDING", infoX, buildingY);

  // Idea Title in Glowing Theme Accent Italic Serif
  const ideaText = participant.ideaTitle || "Building the Future of Tech";
  const ideaFontSize = Math.round(44 * scale);
  const ideaFont = `italic 700 ${ideaFontSize}px ${FONTS.serifDisplay}`;
  const ideaLines = wrapAndFitText(ctx, ideaText, infoW, 2, ideaFont);

  ctx.fillStyle = mascot.theme.glow; // Glowing theme accent as in design reference
  ctx.font = ideaFont;
  ideaLines.forEach((line, idx) => {
    ctx.fillText(line, infoX, buildingY + Math.round(44 * scale) + idx * Math.round(52 * scale));
  });

  // 6. Bottom Footer
  const footerDivY = Math.round(900 * scale);
  ctx.beginPath();
  ctx.moveTo(infoX, footerDivY);
  ctx.lineTo(infoX + infoW, footerDivY);
  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.stroke();

  const footerY = Math.round(965 * scale);

  // Left: Event Site Link or Pass Date Line
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 ${Math.round(24 * scale)}px ${FONTS.sansFacts}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  if (EVENT.siteUrl) {
    ctx.fillText(`${EVENT.siteUrl.replace(/^https?:\/\//, "")} ↗`, infoX, footerY);
  } else {
    ctx.fillText(EVENT.passDateLine, infoX, footerY);
  }

  // Right: Track and Team (dynamically sized and formatted, never overlaps)
  const trackTeamText = formatTrackAndTeam(trackName, trackIndex, participant.team);
  const rightX = infoX + infoW;
  const availableTrackW = infoW - Math.round(340 * scale);
  drawFooterTrackAndTeam(
    ctx,
    trackTeamText,
    rightX,
    footerY,
    availableTrackW,
    FONTS.sansFacts,
    "#94A3B8",
    scale
  );

  // Seeded grain across the card
  applySeededGrain(ctx, participant.seed, width, height, "overlay");

  ctx.restore();
}
