import { EVENT, TRACKS, TRACK_DETAILS, FONTS, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData } from "../types";
import {
  fitSingleLineText,
  wrapAndFitText,
  drawRoundRect,
  createSeededRandom,
  hexToRgba,
} from "../utils";
import { drawMascot } from "../mascotPlaceholder";
import { drawTrackMark } from "../marks";
import { drawPassQrCode } from "../qr";
import {
  drawContactShadow,
  applySeededGrain,
  drawCardEdgeHighlight,
} from "../grain";

/**
 * Night Style (1080×1350):
 * Dark obsidian card, vivid mascot neon glow, deterministic pixel scatter,
 * role badge, geometric track mark, scannable QR code, and >=34px text legibility.
 */
export function renderNightStyle(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData
): void {
  const width = 1080;
  const height = 1350;
  const mascot = getMascotConfig(participant.mascotId);
  const trackIndex = Math.max(0, Math.min(5, participant.track || 0));
  const trackInfo = TRACK_DETAILS[trackIndex] || TRACK_DETAILS[0];
  const roleText = participant.role || "Member";
  const isLeader = roleText.toLowerCase().includes("leader");

  // 1. Background — Dark Obsidian
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, "#080B12");
  bgGrad.addColorStop(0.5, "#0D111E");
  bgGrad.addColorStop(1, "#07090F");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer border with mascot accent
  drawRoundRect(ctx, 36, 36, width - 72, height - 72, 28);
  ctx.lineWidth = 2;
  ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.5);
  ctx.stroke();

  // Edge highlight
  drawCardEdgeHighlight(ctx, 38, 38, width - 76, height - 76, 26, true);

  // 2. Deterministic Pixel Scatter along the top edge
  const random = createSeededRandom(participant.seed);
  const pixelColors = [
    mascot.theme.accent,
    mascot.theme.glow,
    mascot.theme.tint,
    "#38BDF8",
    "#FFFFFF",
  ];
  const pixelCount = 38;

  for (let i = 0; i < pixelCount; i++) {
    const px = 60 + random() * (width - 120);
    const py = 45 + random() * 80;
    const pSize = Math.floor(4 + random() * 10);
    const color = pixelColors[Math.floor(random() * pixelColors.length)];
    const opacity = 0.35 + random() * 0.6;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, pSize, pSize);
    ctx.restore();
  }

  // 3. Header Row (Below pixel constellation: y = 165)
  const headerY = 165;

  // Event Badge
  drawRoundRect(ctx, 70, headerY - 24, 250, 48, 24);
  ctx.fillStyle = hexToRgba(mascot.theme.shell, 0.25);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = mascot.theme.accent;
  ctx.stroke();

  ctx.fillStyle = mascot.theme.glow;
  ctx.font = `700 18px ${FONTS.monospace}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`◆ ${EVENT.badgeText}`, 195, headerY);

  // Role Badge (Leader or Member)
  const roleX = 335;
  drawRoundRect(ctx, roleX, headerY - 24, 180, 46, 23);
  ctx.fillStyle = isLeader
    ? hexToRgba("#F59E0B", 0.22)
    : "rgba(255, 255, 255, 0.1)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = isLeader ? "#FBBF24" : "rgba(255, 255, 255, 0.25)";
  ctx.stroke();

  ctx.fillStyle = isLeader ? "#FDE68A" : "#CBD5E1";
  ctx.font = `700 16px ${FONTS.sansFacts}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${isLeader ? "★" : "●"} ${roleText.toUpperCase()}`,
    roleX + 90,
    headerY
  );

  // Pass ID (Right)
  ctx.textAlign = "right";
  ctx.font = `700 24px ${FONTS.monospace}`;
  ctx.fillStyle = mascot.theme.glow;
  ctx.fillText(participant.passId, 1010, headerY);

  // 4. Mascot with Luminous Theme Glow (Right Side)
  const mascotX = 540;
  const mascotY = 230;
  const mascotW = 460;
  const mascotH = 570;

  // Multi-stop radial aura behind mascot guaranteeing > 3:1 separation
  const glowCenterX = mascotX + mascotW / 2;
  const glowCenterY = mascotY + mascotH / 2;
  const radialGlow = ctx.createRadialGradient(
    glowCenterX,
    glowCenterY - 20,
    30,
    glowCenterX,
    glowCenterY - 20,
    320
  );
  radialGlow.addColorStop(0, hexToRgba(mascot.theme.glow, 0.55));
  radialGlow.addColorStop(0.35, hexToRgba(mascot.theme.accent, 0.38));
  radialGlow.addColorStop(0.7, hexToRgba(mascot.theme.gradient[1], 0.18));
  radialGlow.addColorStop(1, "rgba(8, 11, 18, 0)");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(mascotX - 80, mascotY - 60, mascotW + 160, mascotH + 120);

  // Soft illuminated separation disk immediately behind character core
  ctx.beginPath();
  ctx.ellipse(glowCenterX, glowCenterY - 30, mascotW * 0.42, mascotH * 0.44, 0, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(mascot.theme.glow, 0.16);
  ctx.fill();

  // Soft contact shadow under the mascot
  drawContactShadow(
    ctx,
    glowCenterX,
    mascotY + mascotH - 24,
    mascotW * 0.72,
    32,
    0.55
  );

  // Draw full-body Mascot
  drawMascot(
    ctx,
    { x: mascotX, y: mascotY, width: mascotW, height: mascotH },
    participant,
    "night",
    "full"
  );


  // 5. Left Column: Name & Idea (x = 70, w = 450)
  const nameX = 70;
  const nameMaxW = 450;
  const nameParts = participant.name.split(/\s+/);
  let line1 = "";
  let line2 = "";

  if (nameParts.length <= 1) {
    line1 = nameParts[0] || "Builder";
    line2 = "";
  } else if (nameParts.length === 2) {
    line1 = nameParts[0];
    line2 = nameParts[1];
  } else {
    line1 = nameParts[0];
    line2 = nameParts.slice(1).join(" ");
  }

  // Name lines >= 36px
  const fitted1 = fitSingleLineText(
    ctx,
    line1,
    nameMaxW,
    64,
    38,
    FONTS.serifDisplay,
    "700"
  );

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${fitted1.fontSize}px ${FONTS.serifDisplay}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(fitted1.text, nameX, 260);

  let nextY = 260 + fitted1.fontSize + 14;

  if (line2) {
    const fitted2 = fitSingleLineText(
      ctx,
      line2,
      nameMaxW,
      Math.min(fitted1.fontSize, 56),
      36,
      FONTS.serifDisplay,
      "700"
    );
    ctx.font = `700 ${fitted2.fontSize}px ${FONTS.serifDisplay}`;
    ctx.fillText(fitted2.text, nameX, nextY);
    nextY += fitted2.fontSize + 24;
  } else {
    nextY += 24;
  }

  // Idea Title (>= 34px)
  if (participant.ideaTitle) {
    ctx.fillStyle = mascot.theme.glow;
    const ideaFont = `500 35px ${FONTS.sansFacts}`;
    const ideaLines = wrapAndFitText(
      ctx,
      `“${participant.ideaTitle}”`,
      nameMaxW,
      3,
      ideaFont
    );

    ctx.font = ideaFont;
    ctx.textBaseline = "top";
    ideaLines.forEach((l, idx) => {
      ctx.fillText(l, nameX, nextY + idx * 46);
    });
  }

  // 6. Section Divider
  const divY = 800;
  ctx.beginPath();
  ctx.moveTo(70, divY);
  ctx.lineTo(1010, divY);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.stroke();

  // 7. Metadata Details & Scannable QR Code
  const factsY = divY + 40;
  const colW = 540;

  // Track (with geometric mark)
  drawTrackMark(
    ctx,
    trackInfo.mark,
    nameX,
    factsY + 34,
    42,
    mascot.theme.accent
  );

  ctx.fillStyle = "#94A3B8";
  ctx.font = `700 16px ${FONTS.monospace}`;
  ctx.fillText("TRACK", nameX + 54, factsY);

  const trackName = TRACKS[trackIndex] || "Open Innovation";
  const fittedTrack = fitSingleLineText(
    ctx,
    trackName,
    colW - 54,
    36,
    34,
    FONTS.sansFacts,
    "700"
  );
  ctx.fillStyle = "#F8FAFC";
  ctx.font = `700 ${fittedTrack.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedTrack.text, nameX + 54, factsY + 32);

  // Team
  const teamY = factsY + 110;
  ctx.fillStyle = "#94A3B8";
  ctx.font = `700 16px ${FONTS.monospace}`;
  ctx.fillText("TEAM", nameX, teamY);

  const teamText = `${participant.team} · ${participant.teamId}`;
  const fittedTeam = fitSingleLineText(
    ctx,
    teamText,
    colW,
    36,
    34,
    FONTS.sansFacts,
    "700"
  );
  ctx.fillStyle = "#F8FAFC";
  ctx.font = `700 ${fittedTeam.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedTeam.text, nameX, teamY + 28);

  // Builder handle
  const builderY = teamY + 105;
  ctx.fillStyle = "#94A3B8";
  ctx.font = `700 16px ${FONTS.monospace}`;
  ctx.fillText("BUILDER", nameX, builderY);

  const handleText = participant.github
    ? `@${participant.github}`
    : "Verified Pass";
  const fittedHandle = fitSingleLineText(
    ctx,
    handleText,
    colW,
    36,
    34,
    FONTS.sansFacts,
    "700"
  );
  ctx.fillStyle = "#F8FAFC";
  ctx.font = `700 ${fittedHandle.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedHandle.text, nameX, builderY + 28);

  // Scannable QR Code on the right side
  const qrX = 770;
  const qrY = factsY + 10;
  const qrSize = 240;

  drawPassQrCode(ctx, participant.passId, qrX, qrY, qrSize, {
    darkColor: "#090B10",
    lightColor: "#FFFFFF",
    borderRadius: 12,
    quietZoneModules: 3,
  });

  // QR Label below code
  ctx.fillStyle = "#94A3B8";
  ctx.font = `700 16px ${FONTS.monospace}`;
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO VERIFY PASS", qrX + qrSize / 2, qrY + qrSize + 28);

  // 8. Bottom Footer
  const footerY = 1270;
  ctx.beginPath();
  ctx.moveTo(70, footerY - 30);
  ctx.lineTo(1010, footerY - 30);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.stroke();

  ctx.fillStyle = "#94A3B8";
  ctx.font = `600 20px ${FONTS.monospace}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(EVENT.siteUrl, 70, footerY);

  ctx.textAlign = "right";
  ctx.fillText(EVENT.dates, 1010, footerY);

  // Seeded grain across the card
  applySeededGrain(ctx, participant.seed, width, height, "overlay");
}
