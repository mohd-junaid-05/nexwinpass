import { EVENT, TRACKS, TRACK_DETAILS, FONTS, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData, StyleKey } from "../types";
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
 * Landscape Link Composition (1200×630):
 * Second base card designed specifically for 1200×630 link preview shares.
 * Mascot on one side, name and idea large on the other, facts in a single bottom row,
 * and a crisp scannable QR code.
 */
export function renderLandscapePass(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  style: StyleKey
): void {
  const width = 1200;
  const height = 630;
  const mascot = getMascotConfig(participant.mascotId);
  const trackIndex = Math.max(0, Math.min(5, participant.track || 0));
  const trackInfo = TRACK_DETAILS[trackIndex] || TRACK_DETAILS[0];
  const roleText = participant.role || "Member";
  const isLeader = roleText.toLowerCase().includes("leader");

  ctx.save();

  // 1. STYLE-SPECIFIC BACKGROUND
  if (style === "editorial") {
    ctx.fillStyle = "#F6F4ED";
    ctx.fillRect(0, 0, width, height);

    // Warm hairline borders
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#DDD5C4";
    ctx.strokeRect(32, 32, width - 64, height - 64);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ECE6DA";
    ctx.strokeRect(40, 40, width - 80, height - 80);
  } else if (style === "night") {
    ctx.fillStyle = "#090B10";
    ctx.fillRect(0, 0, width, height);

    // Deep cosmic radial glow
    const aura = ctx.createRadialGradient(
      280,
      300,
      40,
      280,
      300,
      450
    );
    aura.addColorStop(0, hexToRgba(mascot.theme.glow, 0.45));
    aura.addColorStop(0.4, hexToRgba(mascot.theme.accent, 0.28));
    aura.addColorStop(0.7, hexToRgba(mascot.theme.gradient[1], 0.1));
    aura.addColorStop(1, "rgba(9, 11, 16, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);

    // Thin accent border
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.4);
    ctx.strokeRect(32, 32, width - 64, height - 64);
  } else if (style === "pop") {
    // Pop: theme-derived punchy background
    ctx.fillStyle = mascot.theme.popBg || "#FFDD00";
    ctx.fillRect(0, 0, width, height);

    // Heavy Pop black outer border
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(30, 30, width - 60, height - 60);
  } else {
    // Collector: Dark metallic graphite
    ctx.fillStyle = "#0D111A";
    ctx.fillRect(0, 0, width, height);

    // Gradient foil perimeter
    const foil = ctx.createLinearGradient(0, 0, width, height);
    foil.addColorStop(0, mascot.theme.accent);
    foil.addColorStop(0.5, "#E2E8F0");
    foil.addColorStop(1, mascot.theme.gradient[1]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = foil;
    ctx.strokeRect(32, 32, width - 64, height - 64);
  }


  // Edge highlight
  drawCardEdgeHighlight(
    ctx,
    34,
    34,
    width - 68,
    height - 68,
    16,
    style !== "editorial" && style !== "pop"
  );

  // 2. HEADER BAR (y = 50 to 95)
  const headerY = 72;

  // Event badge
  if (style === "pop") {
    drawRoundRect(ctx, 60, headerY - 26, 260, 48, 12);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 20px ${FONTS.condensedPop}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`★ ${EVENT.badgeText}`, 190, headerY);
  } else {
    const badgeBg =
      style === "editorial"
        ? "#EDE7DA"
        : hexToRgba(mascot.theme.accent, 0.18);
    const badgeStroke =
      style === "editorial"
        ? "#CFC6B3"
        : hexToRgba(mascot.theme.accent, 0.45);
    const badgeText =
      style === "editorial" ? "#4A4337" : mascot.theme.glow;


    drawRoundRect(ctx, 60, headerY - 26, 240, 46, 23);
    ctx.fillStyle = badgeBg;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = badgeStroke;
    ctx.stroke();

    ctx.fillStyle = badgeText;
    ctx.font = `700 18px ${FONTS.monospace}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`◆ ${EVENT.badgeText}`, 180, headerY);
  }

  // Role Badge (Leader or Member)
  const roleX = 320;
  const roleBg = isLeader
    ? style === "pop"
      ? "#FFFFFF"
      : style === "editorial"
      ? "#E2DAC8"
      : hexToRgba("#F59E0B", 0.25)
    : style === "editorial"
    ? "#ECE5D5"
    : "rgba(255, 255, 255, 0.1)";
  const roleColor = isLeader
    ? style === "pop"
      ? "#000000"
      : style === "editorial"
      ? "#8A3B14"
      : "#FBBF24"
    : style === "editorial"
    ? "#57534E"
    : "#94A3B8";

  drawRoundRect(ctx, roleX, headerY - 24, 180, 42, 21);
  ctx.fillStyle = roleBg;
  ctx.fill();
  if (style === "pop") {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
  }
  ctx.fillStyle = roleColor;
  ctx.font = `700 16px ${FONTS.sansFacts}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${isLeader ? "★" : "●"} ${roleText.toUpperCase()}`,
    roleX + 90,
    headerY
  );

  // Pass ID (Right-aligned in header)
  ctx.textAlign = "right";
  ctx.font = `700 22px ${FONTS.monospace}`;
  ctx.fillStyle =
    style === "editorial"
      ? "#57534E"
      : style === "pop"
      ? "#000000"
      : "#94A3B8";
  ctx.fillText(participant.passId, 1140, headerY);

  // 3. MASCOT (Left Side: x = 60, y = 125, w = 340, h = 340)
  const mascotX = 60;
  const mascotY = 125;
  const mascotW = 340;
  const mascotH = 340;

  // Mascot frame per style
  if (style === "editorial") {
    drawArchPath(ctx, mascotX, mascotY, mascotW, mascotH);
    ctx.fillStyle = "#EDE8DC";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.4);
    ctx.stroke();
  } else if (style === "night") {
    drawRoundRect(ctx, mascotX, mascotY, mascotW, mascotH, 24);
    ctx.fillStyle = "rgba(18, 22, 34, 0.75)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.45);
    ctx.stroke();
  } else if (style === "pop") {
    drawRoundRect(ctx, mascotX, mascotY, mascotW, mascotH, 20);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
  } else {
    drawRoundRect(ctx, mascotX, mascotY, mascotW, mascotH, 20);
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.45);
    ctx.stroke();
  }

  // Soft contact shadow under the mascot
  drawContactShadow(
    ctx,
    mascotX + mascotW / 2,
    mascotY + mascotH - 18,
    mascotW * 0.68,
    24,
    style === "pop" ? 0.25 : 0.45
  );

  // Draw full-body Mascot inside frame
  drawMascot(
    ctx,
    { x: mascotX + 10, y: mascotY + 10, width: mascotW - 20, height: mascotH - 20 },
    participant,
    style,
    "full"
  );


  // 4. RIGHT COLUMN: NAME & IDEA
  const contentX = 430;
  const contentW = 710;

  // Name: minimum 46px on landscape (equivalent to >40px on 1080p)
  const isPop = style === "pop";
  const nameFontFace = isPop ? FONTS.condensedPop : FONTS.serifDisplay;
  const displayName = isPop
    ? participant.name.toUpperCase()
    : participant.name;

  const fittedName = fitSingleLineText(
    ctx,
    displayName,
    contentW,
    isPop ? 68 : 58,
    38,
    nameFontFace,
    "700"
  );

  const nameColor =
    style === "editorial"
      ? "#1E1A16"
      : style === "pop"
      ? "#000000"
      : "#FFFFFF";

  ctx.fillStyle = nameColor;
  ctx.font = `700 ${fittedName.fontSize}px ${nameFontFace}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(fittedName.text, contentX, 135);

  const ideaStartY = 135 + fittedName.fontSize + 16;

  // Idea: 38px font size (strictly >= 38px on 1200w for 34px threshold)
  if (participant.ideaTitle) {
    const ideaFont =
      style === "editorial"
        ? `italic 38px ${FONTS.serifDisplay}`
        : style === "pop"
        ? `700 36px ${FONTS.sansFacts}`
        : `500 36px ${FONTS.sansFacts}`;

    const ideaLines = wrapAndFitText(
      ctx,
      `“${participant.ideaTitle}”`,
      contentW,
      2,
      ideaFont
    );

    ctx.font = ideaFont;
    ctx.fillStyle =
      style === "editorial"
        ? "#B43B12" // High contrast terracotta
        : style === "pop"
        ? "#111827"
        : "#E2E8F0";

    ideaLines.forEach((line, idx) => {
      ctx.fillText(line, contentX, ideaStartY + idx * 44);
    });
  }

  // 5. DIVIDER LINE
  const divY = 475;
  ctx.beginPath();
  ctx.moveTo(60, divY);
  ctx.lineTo(width - 60, divY);
  ctx.lineWidth = style === "pop" ? 3 : 1;
  ctx.strokeStyle =
    style === "editorial"
      ? "#DDD5C4"
      : style === "pop"
      ? "#000000"
      : "rgba(255, 255, 255, 0.15)";
  ctx.stroke();

  // 6. BOTTOM FACTS IN A SINGLE ROW (y = 490 to 590)
  // Facts: Track (with Mark), Team, Builder handle, and Scannable QR Code
  const factsY = 500;

  // Fact 1: Track with geometric mark
  const trackX = 60;
  drawTrackMark(
    ctx,
    trackInfo.mark,
    trackX,
    factsY + 8,
    38,
    style === "editorial"
      ? "#8A3B14"
      : style === "pop"
      ? "#000000"
      : mascot.theme.accent
  );

  ctx.fillStyle =
    style === "editorial"
      ? "#6B6355"
      : style === "pop"
      ? "#374151"
      : "#94A3B8";
  ctx.font = `700 15px ${FONTS.monospace}`;
  ctx.fillText("TRACK", trackX + 46, factsY);

  const trackName = TRACKS[trackIndex] || "Open Innovation";
  const fittedTrack = fitSingleLineText(
    ctx,
    trackName,
    270,
    38,
    34,
    FONTS.sansFacts,
    "700"
  );
  ctx.fillStyle = nameColor;
  ctx.font = `700 ${fittedTrack.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedTrack.text, trackX + 46, factsY + 22);

  // Fact 2: Team & Team ID
  const teamX = 420;
  ctx.fillStyle =
    style === "editorial"
      ? "#6B6355"
      : style === "pop"
      ? "#374151"
      : "#94A3B8";
  ctx.font = `700 15px ${FONTS.monospace}`;
  ctx.fillText("TEAM", teamX, factsY);

  const teamString = `${participant.team} · ${participant.teamId}`;
  const fittedTeam = fitSingleLineText(
    ctx,
    teamString,
    270,
    38,
    34,
    FONTS.sansFacts,
    "700"
  );
  ctx.fillStyle = nameColor;
  ctx.font = `700 ${fittedTeam.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedTeam.text, teamX, factsY + 22);

  // Fact 3: Builder handle
  const builderX = 740;
  ctx.fillStyle =
    style === "editorial"
      ? "#6B6355"
      : style === "pop"
      ? "#374151"
      : "#94A3B8";
  ctx.font = `700 15px ${FONTS.monospace}`;
  ctx.fillText("BUILDER", builderX, factsY);

  const builderText = participant.github
    ? `@${participant.github}`
    : "Verified Pass";
  const fittedBuilder = fitSingleLineText(
    ctx,
    builderText,
    230,
    38,
    34,
    FONTS.sansFacts,
    "700"
  );
  ctx.fillStyle = nameColor;
  ctx.font = `700 ${fittedBuilder.fontSize}px ${FONTS.sansFacts}`;
  ctx.fillText(fittedBuilder.text, builderX, factsY + 22);

  // Scannable QR Code on the far right of the facts row (size = 96×96)
  const qrX = 1044;
  const qrY = 490;
  const qrSize = 96;

  drawPassQrCode(ctx, participant.passId, qrX, qrY, qrSize, {
    darkColor: style === "pop" ? "#000000" : "#111827",
    lightColor: "#FFFFFF",
    borderRadius: 8,
    quietZoneModules: 2,
  });

  // Apply fine seeded grain over the entire landscape pass
  applySeededGrain(ctx, participant.seed, width, height, "overlay");

  ctx.restore();
}
