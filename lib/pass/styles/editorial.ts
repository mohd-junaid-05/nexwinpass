import { EVENT, TRACKS, TRACK_DETAILS, FONTS, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData } from "../types";
import {
  fitSingleLineText,
  wrapAndFitText,
  drawRoundRect,
  drawArchPath,
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
 * Editorial Style (1080×1350):
 * Warm paper background, serif typography (Playfair Display),
 * arched panel with mascot and soft contact shadow, role badge,
 * geometric track mark, scannable QR code, and >=34px text legibility.
 */
export function renderEditorialStyle(
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

  // 1. Background — Warm paper with inner hairline border
  ctx.fillStyle = "#F6F4ED";
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#DDD5C4";
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Inner border
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ECE6DA";
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // Card edge highlight
  drawCardEdgeHighlight(ctx, 44, 44, width - 88, height - 88, 4, false);

  // 2. Header (y = 60 to 115)
  const headerY = 96;

  // Event Badge
  drawRoundRect(ctx, 70, headerY - 26, 250, 48, 24);
  ctx.fillStyle = "#EDE7DA";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#CFC6B3";
  ctx.stroke();

  ctx.fillStyle = "#383126";
  ctx.font = `700 18px ${FONTS.monospace}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`◆ ${EVENT.badgeText}`, 195, headerY);

  // Role Badge (Leader or Member)
  const roleX = 335;
  drawRoundRect(ctx, roleX, headerY - 24, 180, 44, 22);
  ctx.fillStyle = isLeader ? "#E2DAC8" : "#ECE5D5";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = isLeader ? "#BA7042" : "#D4CCBA";
  ctx.stroke();

  ctx.fillStyle = isLeader ? "#8A3B14" : "#4A4337";
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
  ctx.fillStyle = "#575043";
  ctx.fillText(participant.passId, 1010, headerY);

  // 3. Arched Panel for Mascot (Right side)
  const archX = 560;
  const archY = 160;
  const archW = 450;
  const archH = 580;

  drawArchPath(ctx, archX, archY, archW, archH);
  ctx.fillStyle = "#EDE8DC";
  ctx.fill();

  // Subtle mascot gradient wash inside the arch
  const archGrad = ctx.createLinearGradient(archX, archY, archX, archY + archH);
  archGrad.addColorStop(0, hexToRgba(mascot.theme.gradient[0], 0.08));
  archGrad.addColorStop(0.5, hexToRgba(mascot.theme.gradient[1], 0.12));
  archGrad.addColorStop(1, hexToRgba(mascot.theme.accent, 0.22));
  ctx.fillStyle = archGrad;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.45);
  ctx.stroke();

  // Contact shadow under the mascot baseline
  drawContactShadow(
    ctx,
    archX + archW / 2,
    archY + archH - 24,
    archW * 0.72,
    30,
    0.4
  );

  // Mascot inside arch - accessories (halo, beret, cap) break out past the arch outline
  drawMascot(
    ctx,
    { x: archX + 10, y: archY - 20, width: archW - 20, height: archH + 26 },
    participant,
    "editorial",
    "full"
  );


  // 4. Large Serif Name (Left side: x = 70, w = 460)
  const nameX = 70;
  const nameMaxW = 460;
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

  ctx.fillStyle = "#1E1A16";
  ctx.font = `700 ${fitted1.fontSize}px ${FONTS.serifDisplay}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(fitted1.text, nameX, 190);

  let nextY = 190 + fitted1.fontSize + 12;

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

  // 5. Idea Title in Accent Terracotta & Italics (>= 34px)
  if (participant.ideaTitle) {
    ctx.fillStyle = "#A53510"; // Rich contrast terracotta
    const ideaFont = `italic 35px ${FONTS.serifDisplay}`;
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
  const divY = 770;
  ctx.beginPath();
  ctx.moveTo(70, divY);
  ctx.lineTo(1010, divY);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#DDD5C4";
  ctx.stroke();

  // 7. Metadata Details & Scannable QR Code
  // Facts section: Track (with Mark), Team, Builder, and QR code (all >= 34px values)
  const factsY = divY + 40;
  const colW = 540;

  // Track (with geometric mark)
  drawTrackMark(
    ctx,
    trackInfo.mark,
    nameX,
    factsY + 34,
    42,
    "#8A3B14"
  );

  ctx.fillStyle = "#6B6355";
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
  ctx.fillStyle = "#1E1A16";
  ctx.font = `700 ${fittedTrack.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedTrack.text, nameX + 54, factsY + 32);

  // Team
  const teamY = factsY + 110;
  ctx.fillStyle = "#6B6355";
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
  ctx.fillStyle = "#1E1A16";
  ctx.font = `700 ${fittedTeam.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedTeam.text, nameX, teamY + 28);

  // Builder handle
  const builderY = teamY + 105;
  ctx.fillStyle = "#6B6355";
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
  ctx.fillStyle = "#1E1A16";
  ctx.font = `700 ${fittedHandle.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedHandle.text, nameX, builderY + 28);

  // Scannable QR Code on the right side of the facts block
  const qrX = 770;
  const qrY = factsY + 10;
  const qrSize = 240;

  drawPassQrCode(ctx, participant.passId, qrX, qrY, qrSize, {
    darkColor: "#1E1A16",
    lightColor: "#FFFFFF",
    borderRadius: 12,
    quietZoneModules: 3,
  });

  // QR Label below code (>= 34px readable note or clear caption)
  ctx.fillStyle = "#6B6355";
  ctx.font = `700 16px ${FONTS.monospace}`;
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO VERIFY PASS", qrX + qrSize / 2, qrY + qrSize + 28);

  // 8. Bottom Footer
  const footerY = 1270;
  ctx.beginPath();
  ctx.moveTo(70, footerY - 30);
  ctx.lineTo(1010, footerY - 30);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#E6E0D2";
  ctx.stroke();

  ctx.fillStyle = "#575043";
  ctx.font = `600 20px ${FONTS.monospace}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(EVENT.siteUrl, 70, footerY);

  ctx.textAlign = "right";
  ctx.fillText(EVENT.dates, 1010, footerY);

  // Seeded grain across the card
  applySeededGrain(ctx, participant.seed, width, height, "overlay");
}
