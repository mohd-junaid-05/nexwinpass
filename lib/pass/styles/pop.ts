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

/**
 * Draws a multi-pointed comic starburst badge.
 */
function drawComicStarburst(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  points: number,
  rotation: number,
  fillColor: string,
  text: string
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `900 ${Math.round(outerRadius * 0.44)}px ${FONTS.condensedPop}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

/**
 * Pop Style (Landscape 1920×1080):
 * Saturated full-bleed colour world with halftone dots,
 * massive tightly stacked heavy name (Anton) in jet black,
 * idea title on a tilted white comic sticker,
 * character showcased inside a large circular breakout frame with an "I'M IN!" starburst badge,
 * and clean black footer.
 */
export function renderPopStyle(
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

  // 1. Saturated Full-Bleed Colour World
  const bgBase = mascot.theme.popBg || mascot.theme.base || "#10B981";
  ctx.fillStyle = bgBase;
  ctx.fillRect(0, 0, width, height);

  // Layered subtle gradient
  const popGrad = ctx.createLinearGradient(0, 0, width, height);
  popGrad.addColorStop(0, "rgba(255, 255, 255, 0.2)");
  popGrad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  popGrad.addColorStop(1, hexToRgba(mascot.theme.deeper, 0.35));
  ctx.fillStyle = popGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle halftone dot screen around edges
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  const dotStep = Math.round(36 * scale);
  for (let dx = 0; dx < width; dx += dotStep) {
    for (let dy = 0; dy < height; dy += dotStep) {
      ctx.beginPath();
      ctx.arc(dx + dotStep / 2, dy + dotStep / 2, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Heavy comic outer border
  ctx.lineWidth = Math.max(4, 7 * scale);
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(24 * scale, 24 * scale, width - 48 * scale, height - 48 * scale);

  drawCardEdgeHighlight(ctx, 24 * scale, 24 * scale, width - 48 * scale, height - 48 * scale, 12 * scale, false);

  // 2. Right Column: Large Circular Breakout Frame with Mascot
  const circleX = Math.round(1480 * scale);
  const circleY = Math.round(520 * scale);
  const circleR = Math.round(340 * scale);

  // Drop shadow behind circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(circleX + 8 * scale, circleY + 12 * scale, circleR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fill();
  ctx.restore();

  // Circle background fill
  ctx.save();
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
  ctx.clip();

  const circleGrad = ctx.createLinearGradient(circleX, circleY - circleR, circleX, circleY + circleR);
  circleGrad.addColorStop(0, hexToRgba(mascot.theme.gradient[0], 0.35));
  circleGrad.addColorStop(1, hexToRgba(mascot.theme.gradient[1], 0.7));
  ctx.fillStyle = circleGrad;
  ctx.fillRect(circleX - circleR, circleY - circleR, circleR * 2, circleR * 2);

  // Mascot inside circle
  const mascotBoxW = circleR * 2 - Math.round(40 * scale);
  const mascotBoxH = circleR * 2 - Math.round(40 * scale);
  const mascotBoxX = circleX - mascotBoxW / 2;
  const mascotBoxY = circleY - mascotBoxH / 2 + Math.round(30 * scale);

  drawContactShadow(ctx, circleX, circleY + circleR - Math.round(50 * scale), circleR * 1.2, Math.round(28 * scale), 0.45);

  drawMascot(
    ctx,
    { x: mascotBoxX, y: mascotBoxY, width: mascotBoxW, height: mascotBoxH },
    participant,
    "pop",
    "full"
  );
  ctx.restore();

  // Thick crisp white ring border around circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(6, 12 * scale);
  ctx.strokeStyle = "#FFFFFF";
  ctx.stroke();

  ctx.lineWidth = Math.max(2, 3 * scale);
  ctx.strokeStyle = "#000000";
  ctx.stroke();
  ctx.restore();

  // Top-Right of circle: "I'M IN!" comic starburst badge
  const starX = circleX + Math.round(circleR * 0.72);
  const starY = circleY - Math.round(circleR * 0.72);
  drawComicStarburst(
    ctx,
    starX,
    starY,
    Math.round(80 * scale),
    Math.round(62 * scale),
    14,
    (14 * Math.PI) / 180,
    "#000000",
    "I'M IN!"
  );

  // Bottom of circle: Floating black pill badge with Mascot Name & Tagline
  const pillW = Math.round(390 * scale);
  const pillH = Math.round(54 * scale);
  const pillX = Math.round(circleX - pillW / 2);
  const pillY = Math.round(circleY + circleR - pillH / 2 - 12 * scale);

  drawRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.lineWidth = Math.max(1, 2 * scale);
  ctx.strokeStyle = "#FFFFFF";
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `900 ${Math.round(18 * scale)}px ${FONTS.condensedPop}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${mascot.name.toUpperCase()} • ${mascot.tagline.toUpperCase()}`,
    pillX + pillW / 2,
    pillY + pillH / 2
  );

  // 3. Left Content Column
  const infoX = Math.round(90 * scale);
  const infoW = Math.round(970 * scale);

  // Event Header
  const headerY = Math.round(110 * scale);
  ctx.fillStyle = "#000000";
  ctx.font = `900 ${Math.round(32 * scale)}px ${FONTS.condensedPop}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`✱ ${EVENT.badgeText}`, infoX, headerY);

  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.font = `700 ${Math.round(22 * scale)}px ${FONTS.sansFacts}`;
  ctx.fillText(`${EVENT.name} • by NexWin`, infoX, headerY + Math.round(40 * scale));

  // Hero Participant Name (Anton, all-caps, massive condensed poster type)
  const nameStartY = Math.round(230 * scale);
  drawHeroName(
    ctx,
    participant.name,
    infoX,
    nameStartY,
    infoW,
    Math.round(340 * scale),
    FONTS.condensedPop,
    "#000000",
    "400",
    true
  );

  // Building Section: Tilted White Comic Sticker
  const stickerX = Math.round(80 * scale);
  const stickerY = Math.round(620 * scale);
  const stickerW = Math.round(880 * scale);
  const stickerH = Math.round(168 * scale);
  const stickerR = Math.round(28 * scale);
  const tiltAngle = (-2.5 * Math.PI) / 180;

  ctx.save();
  ctx.translate(stickerX + stickerW / 2, stickerY + stickerH / 2);
  ctx.rotate(tiltAngle);

  // Drop shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  drawRoundRect(ctx, -stickerW / 2 + 5 * scale, -stickerH / 2 + 8 * scale, stickerW, stickerH, stickerR);
  ctx.fill();

  // White sticker body
  ctx.fillStyle = "#FFFFFF";
  drawRoundRect(ctx, -stickerW / 2, -stickerH / 2, stickerW, stickerH, stickerR);
  ctx.fill();
  ctx.lineWidth = Math.max(2, 3.5 * scale);
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  // Sticker content
  ctx.fillStyle = "#000000";
  ctx.font = `800 ${Math.round(16 * scale)}px ${FONTS.sansFacts}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("BUILDING", -stickerW / 2 + Math.round(36 * scale), -stickerH / 2 + Math.round(26 * scale));

  const ideaText = participant.ideaTitle || "Building the Future with NexWin";
  const ideaFontSize = Math.round(34 * scale);
  const ideaFont = `800 ${ideaFontSize}px ${FONTS.sansFacts}`;
  const ideaLines = wrapAndFitText(ctx, ideaText, stickerW - Math.round(72 * scale), 2, ideaFont);

  ctx.fillStyle = "#000000";
  ctx.font = ideaFont;
  ideaLines.forEach((line, idx) => {
    ctx.fillText(
      line,
      -stickerW / 2 + Math.round(36 * scale),
      -stickerH / 2 + Math.round(66 * scale) + idx * Math.round(44 * scale)
    );
  });
  ctx.restore();

  // 4. Bottom Footer
  const footerY = Math.round(965 * scale);

  // Left: Event Site Link
  ctx.fillStyle = "#000000";
  ctx.font = `900 ${Math.round(26 * scale)}px ${FONTS.condensedPop}`;
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
    "rgba(0, 0, 0, 0.8)",
    scale
  );

  // Seeded grain across the card
  applySeededGrain(ctx, participant.seed, width, height, "overlay");

  ctx.restore();
}
