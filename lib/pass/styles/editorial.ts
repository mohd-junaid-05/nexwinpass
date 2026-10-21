import { EVENT, TRACKS, FONTS, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData } from "../types";
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

/**
 * Editorial Style (Landscape 1920×1080):
 * Warm ivory paper, large mascot theme arch portal showcasing the character,
 * refined display serif name (Playfair Display), vibrant royal-blue italic idea title,
 * hairline rules, and clean footer track & team info.
 */
export function renderEditorialStyle(
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

  // 1. Warm Ivory Paper Background
  ctx.fillStyle = "#F7F5EE";
  ctx.fillRect(0, 0, width, height);

  // Subtle warm paper gradient
  const paperGrad = ctx.createLinearGradient(0, 0, width, height);
  paperGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
  paperGrad.addColorStop(1, "rgba(224, 218, 206, 0.35)");
  ctx.fillStyle = paperGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer paper hairline border
  ctx.lineWidth = Math.max(1.5, 2 * scale);
  ctx.strokeStyle = "#DDD5C4";
  ctx.strokeRect(28 * scale, 28 * scale, width - 56 * scale, height - 56 * scale);

  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.strokeStyle = "#ECE6DA";
  ctx.strokeRect(38 * scale, 38 * scale, width - 76 * scale, height - 76 * scale);

  drawCardEdgeHighlight(ctx, 38 * scale, 38 * scale, width - 76 * scale, height - 76 * scale, 12 * scale, false);

  // 2. Right Column: Large Bold Mascot Theme Arch Portal
  const archX = Math.round(1140 * scale);
  const archY = Math.round(64 * scale);
  const archW = Math.round(710 * scale);
  const archH = Math.round(952 * scale);

  ctx.save();
  drawArchPath(ctx, archX, archY, archW, archH);
  ctx.fillStyle = "#EAE4D5";
  ctx.fill();

  // Rich gradient from mascot theme
  const archGrad = ctx.createLinearGradient(archX, archY, archX + archW, archY + archH);
  archGrad.addColorStop(0, hexToRgba(mascot.theme.gradient[0], 0.25));
  archGrad.addColorStop(0.5, hexToRgba(mascot.theme.gradient[1], 0.38));
  archGrad.addColorStop(1, hexToRgba(mascot.theme.accent, 0.3));
  ctx.fillStyle = archGrad;
  ctx.fill();

  ctx.lineWidth = Math.max(1.5, 2.5 * scale);
  ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.5);
  ctx.stroke();

  // Signature mascot world pattern inside the arch
  drawMascotWorldPattern(ctx, participant.mascotId, participant.seed, archX, archY, archW, archH, {
    opacity: 0.2,
    color: mascot.theme.shell,
  });
  ctx.restore();

  // Mascot stands inside the arch
  const mascotBoxX = archX + Math.round(20 * scale);
  const mascotBoxY = archY + Math.round(80 * scale);
  const mascotBoxW = archW - Math.round(40 * scale);
  const mascotBoxH = archH - Math.round(180 * scale);
  const baselineY = archY + archH - Math.round(90 * scale);

  // Soft contact shadow
  drawContactShadow(ctx, archX + archW / 2, baselineY, archW * 0.65, Math.round(30 * scale), 0.45);

  drawMascot(
    ctx,
    { x: mascotBoxX, y: mascotBoxY, width: mascotBoxW, height: mascotBoxH },
    participant,
    "editorial",
    "full"
  );

  // Mascot Name & Tagline Pill at base of arch
  const pillW = Math.round(380 * scale);
  const pillH = Math.round(54 * scale);
  const pillX = Math.round(archX + (archW - pillW) / 2);
  const pillY = Math.round(archY + archH - pillH / 2 - 16 * scale);

  drawRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = "#1A1715";
  ctx.fill();
  ctx.lineWidth = Math.max(1, 1.5 * scale);
  ctx.strokeStyle = mascot.theme.accent;
  ctx.stroke();

  // Theme colored dot + Name + Tagline
  ctx.beginPath();
  ctx.arc(pillX + Math.round(30 * scale), pillY + pillH / 2, 5 * scale, 0, Math.PI * 2);
  ctx.fillStyle = mascot.theme.glow;
  ctx.fill();

  ctx.fillStyle = "#F7F5EE";
  ctx.font = `700 ${Math.round(17 * scale)}px ${FONTS.sansFacts}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${mascot.name} • ${mascot.tagline}`, pillX + pillW / 2 + Math.round(8 * scale), pillY + pillH / 2);

  // 3. Left Content Column
  const infoX = Math.round(90 * scale);
  const infoW = Math.round(970 * scale);

  // Event Header
  const headerY = Math.round(110 * scale);
  ctx.fillStyle = "#1A1715";
  ctx.font = `800 ${Math.round(28 * scale)}px ${FONTS.sansFacts}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`✱ ${EVENT.badgeText}`, infoX, headerY);

  ctx.fillStyle = "#78716C";
  ctx.font = `600 ${Math.round(20 * scale)}px ${FONTS.sansFacts}`;
  ctx.fillText(`${EVENT.name} • by NexWin`, infoX, headerY + Math.round(38 * scale));

  // Hairline divider below header
  const headerDivY = Math.round(185 * scale);
  ctx.beginPath();
  ctx.moveTo(infoX, headerDivY);
  ctx.lineTo(infoX + infoW, headerDivY);
  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.strokeStyle = "#DDD5C4";
  ctx.stroke();

  // Hero Participant Name (Playfair Display)
  const nameStartY = Math.round(270 * scale);
  drawHeroName(
    ctx,
    participant.name,
    infoX,
    nameStartY,
    infoW,
    Math.round(260 * scale),
    FONTS.serifDisplay,
    "#1A1715",
    "700",
    false
  );

  // Building Section
  const buildingY = Math.round(600 * scale);
  ctx.fillStyle = "#78716C";
  ctx.font = `800 ${Math.round(16 * scale)}px ${FONTS.sansFacts}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("BUILDING", infoX, buildingY);

  // Idea Title in Royal Blue Italic Serif
  const ideaText = participant.ideaTitle || "Building the Future of Hackathons";
  const ideaFontSize = Math.round(44 * scale);
  const ideaFont = `italic 700 ${ideaFontSize}px ${FONTS.serifDisplay}`;
  const ideaLines = wrapAndFitText(ctx, ideaText, infoW, 2, ideaFont);

  ctx.fillStyle = "#1D4ED8"; // Royal blue as in design reference
  ctx.font = ideaFont;
  ideaLines.forEach((line, idx) => {
    ctx.fillText(line, infoX, buildingY + Math.round(44 * scale) + idx * Math.round(52 * scale));
  });

  // 4. Bottom Footer
  const footerDivY = Math.round(900 * scale);
  ctx.beginPath();
  ctx.moveTo(infoX, footerDivY);
  ctx.lineTo(infoX + infoW, footerDivY);
  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.strokeStyle = "#DDD5C4";
  ctx.stroke();

  const footerY = Math.round(965 * scale);

  // Left: Event Site Link
  ctx.fillStyle = "#1A1715";
  ctx.font = `800 ${Math.round(24 * scale)}px ${FONTS.sansFacts}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`${EVENT.siteUrl.replace(/^https?:\/\//, "")} ↗`, infoX, footerY);

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
    "#78716C",
    scale
  );

  // Seeded grain across the card
  applySeededGrain(ctx, participant.seed, width, height, "overlay");

  ctx.restore();
}
