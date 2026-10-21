import { EVENT, TRACKS, TRACK_DETAILS, FONTS, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData } from "../types";
import {
  fitSingleLineText,
  wrapAndFitText,
  drawRoundRect,
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
 * Collector Style (1080×1350):
 * Metallic foil border, rich top mascot showcase panel, contact shadow,
 * role badge, geometric track mark, scannable QR code, and >=34px text legibility.
 */
export function renderCollectorStyle(
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

  // 1. Background — Dark Metallic Slate
  ctx.fillStyle = "#0B0E17";
  ctx.fillRect(0, 0, width, height);

  // Gradient Border around card infused with mascot colors
  const borderGrad = ctx.createLinearGradient(0, 0, width, height);
  borderGrad.addColorStop(0, mascot.theme.accent);
  borderGrad.addColorStop(0.3, "#818CF8");
  borderGrad.addColorStop(0.6, mascot.theme.gradient[1]);
  borderGrad.addColorStop(1, "#FBBF24");


  drawRoundRect(ctx, 36, 36, width - 72, height - 72, 28);
  ctx.lineWidth = 4;
  ctx.strokeStyle = borderGrad;
  ctx.stroke();

  // Edge highlight
  drawCardEdgeHighlight(ctx, 42, 42, width - 84, height - 84, 24, true);

  // 2. Header
  const headerY = 96;

  // Event Badge
  drawRoundRect(ctx, 70, headerY - 24, 250, 48, 24);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.stroke();

  ctx.fillStyle = "#E2E8F0";
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

  // Collector Serial / Pass ID (Right)
  ctx.textAlign = "right";
  ctx.font = `700 22px ${FONTS.monospace}`;
  ctx.fillStyle = "#FBBF24"; // Gold
  ctx.fillText(`NO. ${participant.passId}`, 1010, headerY);

  // 3. Coloured Mascot Panel Across the Top (x = 70, y = 145, w = 940, h = 520)
  const panelX = 70;
  const panelY = 145;
  const panelW = 940;
  const panelH = 520;

  const panelGrad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
  panelGrad.addColorStop(0, mascot.theme.collectorPanel[0]);
  panelGrad.addColorStop(1, mascot.theme.collectorPanel[1]);

  drawRoundRect(ctx, panelX, panelY, panelW, panelH, 24);
  ctx.fillStyle = panelGrad;
  ctx.fill();

  // Multi-stop radial backlight aura inside panel ensuring > 3:1 separation
  const glowCenterX = panelX + panelW / 2;
  const glowCenterY = panelY + panelH / 2;
  const panelGlow = ctx.createRadialGradient(
    glowCenterX,
    glowCenterY - 20,
    30,
    glowCenterX,
    glowCenterY - 20,
    280
  );
  panelGlow.addColorStop(0, hexToRgba(mascot.theme.glow, 0.45));
  panelGlow.addColorStop(0.5, hexToRgba(mascot.theme.accent, 0.22));
  panelGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = panelGlow;
  ctx.fillRect(panelX, panelY, panelW, panelH);

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.55);
  ctx.stroke();

  // Draw Mascot Series badge on top panel
  const mascotBadgeText = `SERIES · ${mascot.name.toUpperCase()}`;
  drawRoundRect(ctx, panelX + 24, panelY + 20, 260, 38, 19);
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.stroke();

  ctx.fillStyle = mascot.theme.glow;
  ctx.font = `700 16px ${FONTS.monospace}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(mascotBadgeText, panelX + 24 + 130, panelY + 39);

  // Soft contact shadow under the mascot inside top panel
  drawContactShadow(
    ctx,
    panelX + panelW / 2,
    panelY + panelH - 24,
    440,
    30,
    0.5
  );

  // Full body Mascot inside top panel
  const mascotBoxSize = 480;
  drawMascot(
    ctx,
    {
      x: panelX + (panelW - mascotBoxSize) / 2,
      y: panelY + 20,
      width: mascotBoxSize,
      height: mascotBoxSize,
    },
    participant,
    "collector",
    "full"
  );

  // 4. Participant Name Underneath Panel (x = 70, y = 685)
  const nameX = 70;
  const nameMaxW = 940;
  const fittedName = fitSingleLineText(
    ctx,
    participant.name,
    nameMaxW,
    64,
    38,
    FONTS.serifDisplay,
    "700"
  );

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${fittedName.fontSize}px ${FONTS.serifDisplay}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(fittedName.text, nameX, 680);

  let nextY = 680 + fittedName.fontSize + 8;

  // Print mascot tagline under the name
  ctx.fillStyle = mascot.theme.glow;
  ctx.font = `700 18px ${FONTS.monospace}`;
  ctx.fillText(`MASCOT: ${mascot.name.toUpperCase()} — "${mascot.tagline}"`, nameX, nextY);
  nextY += 32;


  // 5. Idea Title (>= 34px)
  if (participant.ideaTitle) {
    ctx.fillStyle = "#E2E8F0";
    const ideaFont = `italic 35px ${FONTS.serifDisplay}`;
    const ideaLines = wrapAndFitText(
      ctx,
      `“${participant.ideaTitle}”`,
      nameMaxW,
      2,
      ideaFont
    );

    ctx.font = ideaFont;
    ctx.textBaseline = "top";
    ideaLines.forEach((l, idx) => {
      ctx.fillText(l, nameX, nextY + idx * 46);
    });
    nextY += ideaLines.length * 46 + 10;
  }

  // 6. Section Divider
  const divY = Math.max(820, nextY + 10);
  ctx.beginPath();
  ctx.moveTo(70, divY);
  ctx.lineTo(1010, divY);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.stroke();

  // 7. Metadata Details & Scannable QR Code
  const factsY = divY + 30;
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
    darkColor: "#0B0E17",
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
