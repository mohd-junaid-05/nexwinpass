import { EVENT, TRACKS, TRACK_DETAILS, FONTS, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData } from "../types";
import {
  fitSingleLineText,
  wrapAndFitText,
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
 * Pop Style (1080×1350):
 * High-voltage yellow, heavy condensed Anton typography, boxed idea label,
 * circular mascot badge with contact shadow, role sticker, geometric track mark,
 * scannable QR code, and >=34px text legibility.
 */
export function renderPopStyle(
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

  // 1. Background — Mascot Theme Pop Color
  const popBg = mascot.theme.popBg || "#FFDE00";
  ctx.fillStyle = popBg;
  ctx.fillRect(0, 0, width, height);

  // Compute text contrast for top section
  const cHex = popBg.replace("#", "");
  const rLum = parseInt(cHex.substring(0, 2), 16) / 255;
  const gLum = parseInt(cHex.substring(2, 4), 16) / 255;
  const bLum = parseInt(cHex.substring(4, 6), 16) / 255;
  const isLightBg = (0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum) > 0.45;
  const topTextColor = isLightBg ? "#000000" : "#FFFFFF";

  // Heavy outer border
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Edge highlight
  drawCardEdgeHighlight(ctx, 36, 36, width - 72, height - 72, 8, !isLightBg);

  // 2. Header
  const headerY = 90;

  // Event Badge (Black block with white text)
  const badgeW = 280;
  const badgeH = 48;
  ctx.fillStyle = "#000000";
  ctx.fillRect(76, headerY - 20, badgeW, badgeH);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 20px ${FONTS.condensedPop}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`★ ${EVENT.badgeText}`, 76 + badgeW / 2, headerY + 4);

  // Role Badge (Sticker beside event badge)
  const roleX = 380;
  const roleW = 200;
  const roleH = 48;
  ctx.fillStyle = "#000000";
  ctx.fillRect(roleX + 4, headerY - 20 + 4, roleW, roleH); // drop shadow
  ctx.fillStyle = isLeader ? "#FFFFFF" : "#E2E8F0";
  ctx.fillRect(roleX, headerY - 20, roleW, roleH);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(roleX, headerY - 20, roleW, roleH);

  ctx.fillStyle = "#000000";
  ctx.font = `800 18px ${FONTS.condensedPop}`;
  ctx.fillText(
    `${isLeader ? "★" : "●"} ${roleText.toUpperCase()}`,
    roleX + roleW / 2,
    headerY + 4
  );

  // Pass ID (White box with black border)
  const idW = 210;
  const idH = 48;
  const idX = width - 76 - idW;
  ctx.fillStyle = "#000000";
  ctx.fillRect(idX + 4, headerY - 20 + 4, idW, idH);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(idX, headerY - 20, idW, idH);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(idX, headerY - 20, idW, idH);

  ctx.fillStyle = "#000000";
  ctx.font = `800 20px ${FONTS.monospace}`;
  ctx.fillText(participant.passId, idX + idW / 2, headerY + 4);

  // 3. Mascot in Circular Badge (Right side: bust crop breaking out past the top)
  const mascotX = 570;
  const mascotY = 180;
  const mascotSize = 440;

  const circleCX = mascotX + mascotSize / 2;
  const circleCY = mascotY + mascotSize / 2;
  const circleR = mascotSize / 2;

  // Drop shadow
  ctx.beginPath();
  ctx.arc(circleCX + 8, circleCY + 8, circleR, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();

  // White base circle
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, circleR, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  // Inner accent ring powered by mascot theme
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, circleR - 16, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(mascot.theme.accent, 0.22);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = mascot.theme.accent;
  ctx.stroke();

  // Contact shadow under the bust
  drawContactShadow(
    ctx,
    circleCX,
    circleCY + circleR - 24,
    mascotSize * 0.65,
    26,
    0.35
  );

  // Draw Bust Mascot breaking out of the circle at the top
  drawMascot(
    ctx,
    {
      x: circleCX - mascotSize * 0.54,
      y: circleCY - mascotSize * 0.66,
      width: mascotSize * 1.08,
      height: mascotSize * 1.08,
    },
    participant,
    "pop",
    "bust"
  );


  // 4. Large Heavy Condensed Uppercase Name (Left side: x = 76, w = 460)
  const nameX = 76;
  const nameMaxW = 460;
  const upperName = participant.name.toUpperCase();
  const nameParts = upperName.split(/\s+/);
  let line1 = "";
  let line2 = "";

  if (nameParts.length <= 1) {
    line1 = nameParts[0] || "BUILDER";
    line2 = "";
  } else if (nameParts.length === 2) {
    line1 = nameParts[0];
    line2 = nameParts[1];
  } else {
    line1 = nameParts[0];
    line2 = nameParts.slice(1).join(" ");
  }

  // Name lines >= 40px
  const fitted1 = fitSingleLineText(
    ctx,
    line1,
    nameMaxW,
    72,
    40,
    FONTS.condensedPop,
    "800"
  );

  ctx.fillStyle = topTextColor;
  ctx.font = `800 ${fitted1.fontSize}px ${FONTS.condensedPop}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(fitted1.text, nameX, 190);

  let nextY = 190 + fitted1.fontSize + 10;

  if (line2) {
    const fitted2 = fitSingleLineText(
      ctx,
      line2,
      nameMaxW,
      Math.min(fitted1.fontSize, 62),
      38,
      FONTS.condensedPop,
      "800"
    );
    ctx.fillStyle = topTextColor;
    ctx.font = `800 ${fitted2.fontSize}px ${FONTS.condensedPop}`;
    ctx.fillText(fitted2.text, nameX, nextY);
    nextY += fitted2.fontSize + 24;
  } else {
    nextY += 24;
  }

  // 5. Idea Title in Boxed White Label (>= 34px)
  if (participant.ideaTitle) {
    const boxW = 470;
    const ideaFont = `700 35px ${FONTS.sansFacts}`;
    const ideaLines = wrapAndFitText(
      ctx,
      `“${participant.ideaTitle}”`,
      boxW - 40,
      3,
      ideaFont
    );

    const boxH = Math.max(90, ideaLines.length * 48 + 36);

    // Box Drop Shadow
    ctx.fillStyle = "#000000";
    ctx.fillRect(nameX + 6, nextY + 6, boxW, boxH);

    // White Box
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(nameX, nextY, boxW, boxH);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(nameX, nextY, boxW, boxH);

    ctx.fillStyle = "#000000";
    ctx.font = ideaFont;
    ctx.textBaseline = "top";
    ideaLines.forEach((l, idx) => {
      ctx.fillText(l, nameX + 20, nextY + 18 + idx * 48);
    });
  }

  // 6. Section Divider or Comic Stats Panel
  const divY = 780;
  if (!isLightBg) {
    // Drop shadow
    ctx.fillStyle = "#000000";
    ctx.fillRect(66, divY + 6, width - 132, 450);
    // White Comic Stats Panel for dark pop backgrounds
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(60, divY, width - 120, 450);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(60, divY, width - 120, 450);
  } else {
    ctx.beginPath();
    ctx.moveTo(76, divY);
    ctx.lineTo(1004, divY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
  }


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
    "#000000"
  );

  ctx.fillStyle = "#1F2937";
  ctx.font = `800 16px ${FONTS.condensedPop}`;
  ctx.fillText("TRACK", nameX + 54, factsY);

  const trackName = TRACKS[trackIndex] || "Open Innovation";
  const fittedTrack = fitSingleLineText(
    ctx,
    trackName,
    colW - 54,
    36,
    34,
    FONTS.sansFacts,
    "800"
  );
  ctx.fillStyle = "#000000";
  ctx.font = `800 ${fittedTrack.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedTrack.text, nameX + 54, factsY + 32);

  // Team
  const teamY = factsY + 110;
  ctx.fillStyle = "#1F2937";
  ctx.font = `800 16px ${FONTS.condensedPop}`;
  ctx.fillText("TEAM", nameX, teamY);

  const teamText = `${participant.team} · ${participant.teamId}`;
  const fittedTeam = fitSingleLineText(
    ctx,
    teamText,
    colW,
    36,
    34,
    FONTS.sansFacts,
    "800"
  );
  ctx.fillStyle = "#000000";
  ctx.font = `800 ${fittedTeam.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedTeam.text, nameX, teamY + 28);

  // Builder handle
  const builderY = teamY + 105;
  ctx.fillStyle = "#1F2937";
  ctx.font = `800 16px ${FONTS.condensedPop}`;
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
    "800"
  );
  ctx.fillStyle = "#000000";
  ctx.font = `800 ${fittedHandle.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedHandle.text, nameX, builderY + 28);

  // Scannable QR Code on the right side
  const qrX = 764;
  const qrY = factsY + 10;
  const qrSize = 240;

  // Pop drop shadow for QR code
  ctx.fillStyle = "#000000";
  ctx.fillRect(qrX + 6, qrY + 6, qrSize, qrSize);

  drawPassQrCode(ctx, participant.passId, qrX, qrY, qrSize, {
    darkColor: "#000000",
    lightColor: "#FFFFFF",
    borderRadius: 8,
    quietZoneModules: 3,
  });

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);

  // QR Label below code
  ctx.fillStyle = "#000000";
  ctx.font = `800 16px ${FONTS.condensedPop}`;
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO VERIFY PASS", qrX + qrSize / 2, qrY + qrSize + 28);

  // 8. Bottom Footer
  const footerY = 1270;
  ctx.beginPath();
  ctx.moveTo(76, footerY - 30);
  ctx.lineTo(1004, footerY - 30);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  ctx.fillStyle = "#000000";
  ctx.font = `800 20px ${FONTS.monospace}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(EVENT.siteUrl, 76, footerY);

  ctx.textAlign = "right";
  ctx.fillText(EVENT.dates, 1004, footerY);

  // Seeded grain across the card
  applySeededGrain(ctx, participant.seed, width, height, "overlay");
}
