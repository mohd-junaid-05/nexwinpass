import { EVENT, FONTS } from "@/lib/config";
import type { ParticipantPassData, StyleKey } from "./types";
import { drawPassQrCode } from "./qr";
import { drawRoundRect } from "./utils";

export interface TicketStubOptions {
  orientation: "landscape" | "vertical";
  style: StyleKey;
  notchRadius?: number;
}

/**
 * Draws the authentic perforated ticket stub area for Builder Passes.
 * Every pass has a perforated stub area that holds the QR code,
 * the pass ID, admission line, and true registration serial.
 */
export function drawTicketStub(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  stubX: number,
  stubY: number,
  stubWidth: number,
  stubHeight: number,
  options: TicketStubOptions
): void {
  const { style } = options;

  ctx.save();

  // 1. Perforation Line & Semicircular Tear Notches
  const notchR = options.notchRadius ?? 18;

  // Background tint for the stub panel
  if (style === "editorial") {
    ctx.fillStyle = "#EFEAE0";
  } else if (style === "night") {
    ctx.fillStyle = "#0A0D15";
  } else if (style === "pop") {
    ctx.fillStyle = "#FFFFFF";
  } else {
    // Collector
    ctx.fillStyle = "#0C101A";
  }
  ctx.fillRect(stubX, stubY, stubWidth, stubHeight);

  // Semicircular tear cutouts on top and bottom of perforation line
  ctx.save();
  ctx.fillStyle = style === "editorial" ? "#F7F5EE" : style === "pop" ? "#000000" : "#05070D";
  // Top notch
  ctx.beginPath();
  ctx.arc(stubX, stubY, notchR, 0, Math.PI);
  ctx.fill();
  // Bottom notch
  ctx.beginPath();
  ctx.arc(stubX, stubY + stubHeight, notchR, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Dashed perforation line
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 2;
  ctx.strokeStyle =
    style === "editorial"
      ? "#CFC6B3"
      : style === "pop"
      ? "#000000"
      : style === "night"
      ? "rgba(56, 189, 248, 0.4)"
      : "rgba(255, 255, 255, 0.25)";

  ctx.beginPath();
  ctx.moveTo(stubX, stubY + notchR + 4);
  ctx.lineTo(stubX, stubY + stubHeight - notchR - 4);
  ctx.stroke();
  ctx.restore();

  // 2. Stub Content Layout
  const contentCenterX = stubX + stubWidth / 2;
  const isLandscape = options.orientation === "landscape";

  if (isLandscape) {
    // LANDSCAPE STUB (on right flank)
    // Header tag: "ADMIT ONE BUILDER"
    const headerY = stubY + 70;
    ctx.fillStyle =
      style === "editorial"
        ? "#8A3B14"
        : style === "pop"
        ? "#000000"
        : style === "night"
        ? "#38BDF8"
        : "#E2E8F0";

    ctx.font = `800 18px ${FONTS.monospace}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ADMIT ONE BUILDER", contentCenterX, headerY);

    // Event Badge
    const badgeY = headerY + 36;
    ctx.fillStyle =
      style === "editorial"
        ? "#575043"
        : style === "pop"
        ? "#000000"
        : "rgba(255, 255, 255, 0.7)";
    ctx.font = `700 16px ${FONTS.monospace}`;
    ctx.fillText(EVENT.badgeText, contentCenterX, badgeY);

    // QR Code Container with guaranteed quiet zone and pure white backing
    const qrSize = Math.min(stubWidth - 80, 240);
    const qrX = contentCenterX - qrSize / 2;
    const qrY = stubY + (stubHeight - qrSize) / 2 - 20;

    // QR Code pad (white card with subtle border and rounded corners)
    drawRoundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 16);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = style === "pop" ? 3 : 1;
    ctx.strokeStyle = style === "pop" ? "#000000" : "rgba(0, 0, 0, 0.12)";
    ctx.stroke();

    drawPassQrCode(ctx, participant.passId, qrX, qrY, qrSize, {
      darkColor: style === "pop" ? "#000000" : "#0B0F19",
      lightColor: "#FFFFFF",
      borderRadius: 6,
      quietZoneModules: 3,
    });

    // Serial line that doesn't lie:
    // If registration has number: "No. 042", else derived pass ID
    const serialY = qrY + qrSize + 48;
    const serialText =
      participant.number !== undefined
        ? `No. ${String(participant.number).padStart(3, "0")}`
        : `PASS // ${participant.passId}`;

    ctx.fillStyle =
      style === "editorial"
        ? "#1E1A16"
        : style === "pop"
        ? "#000000"
        : "#FFFFFF";
    ctx.font = `800 24px ${FONTS.monospace}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(serialText, contentCenterX, serialY);

    // Secondary caption
    ctx.fillStyle =
      style === "editorial"
        ? "#7E7667"
        : style === "pop"
        ? "#4B5563"
        : "rgba(255, 255, 255, 0.5)";
    ctx.font = `600 14px ${FONTS.sansFacts}`;
    ctx.fillText("SCAN TO VERIFY PASS", contentCenterX, serialY + 30);

    // Decorative ticket barcode stripes at bottom
    drawTicketBarcode(
      ctx,
      contentCenterX - (stubWidth - 100) / 2,
      stubY + stubHeight - 80,
      stubWidth - 100,
      40,
      participant.seed,
      style === "editorial" ? "#CFC6B3" : style === "pop" ? "#000000" : "rgba(255, 255, 255, 0.25)"
    );
  } else {
    // VERTICAL STUB (e.g. for Square/Story base card)
    const qrSize = 180;
    const qrX = stubX + 30;
    const qrY = stubY + (stubHeight - qrSize) / 2;

    drawRoundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 12);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = style === "pop" ? 3 : 1;
    ctx.strokeStyle = style === "pop" ? "#000000" : "rgba(0, 0, 0, 0.1)";
    ctx.stroke();

    drawPassQrCode(ctx, participant.passId, qrX, qrY, qrSize, {
      darkColor: style === "pop" ? "#000000" : "#0B0F19",
      lightColor: "#FFFFFF",
      borderRadius: 4,
      quietZoneModules: 3,
    });

    const infoX = qrX + qrSize + 40;
    const textY = stubY + stubHeight / 2 - 30;

    ctx.fillStyle = style === "editorial" ? "#8A3B14" : style === "pop" ? "#000000" : "#38BDF8";
    ctx.font = `800 16px ${FONTS.monospace}`;
    ctx.textAlign = "left";
    ctx.fillText("ADMIT ONE BUILDER", infoX, textY);

    const serialText =
      participant.number !== undefined
        ? `No. ${String(participant.number).padStart(3, "0")}`
        : `PASS // ${participant.passId}`;
    ctx.fillStyle = style === "editorial" ? "#1E1A16" : style === "pop" ? "#000000" : "#FFFFFF";
    ctx.font = `800 22px ${FONTS.monospace}`;
    ctx.fillText(serialText, infoX, textY + 32);

    ctx.fillStyle = style === "editorial" ? "#7E7667" : style === "pop" ? "#4B5563" : "rgba(255, 255, 255, 0.6)";
    ctx.font = `600 14px ${FONTS.sansFacts}`;
    ctx.fillText(`${EVENT.badgeText} · SCAN TO VERIFY`, infoX, textY + 60);
  }

  ctx.restore();
}

/**
 * Draws authentic ticket barcode stripes.
 */
function drawTicketBarcode(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  seed: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  let currX = bx;
  let s = seed + 42;

  while (currX < bx + bw) {
    s = (s * 9301 + 49297) % 233280;
    const barW = (s % 4) + 1;
    const gapW = ((s >> 2) % 3) + 2;
    ctx.fillRect(currX, by, barW, bh);
    currX += barW + gapW;
  }
  ctx.restore();
}
