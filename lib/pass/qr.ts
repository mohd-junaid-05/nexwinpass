import QRCode from "qrcode";
import { EVENT } from "@/lib/config";

// Cache QR code matrix so repeated redraws of same pass ID are instantaneous
const qrCache = new Map<string, QRCode.QRCode>();

/**
 * Builds the URL to be encoded into the pass QR code.
 * Contains only the public event site and the participant's derived pass ID.
 * Carries zero personal data.
 */
export function getPassQrUrl(passId: string): string {
  const cleanId = encodeURIComponent(passId.trim());
  return `${EVENT.siteUrl}?pass=${cleanId}`;
}

/**
 * Generates or retrieves cached QR code matrix for a pass ID.
 */
export function getOrCreateQrCode(passId: string): QRCode.QRCode {
  const url = getPassQrUrl(passId);
  let qr = qrCache.get(url);
  if (!qr) {
    qr = QRCode.create(url, {
      errorCorrectionLevel: "M",
    });
    qrCache.set(url, qr);
  }
  return qr;
}

export interface DrawQrOptions {
  darkColor?: string;
  lightColor?: string;
  quietZoneModules?: number;
  borderRadius?: number;
}

/**
 * Draws a scannable QR code onto a canvas context.
 * Uses integer pixel alignment to eliminate fuzzy antialiasing and ensure
 * instant scanner decoding from screens, exported images, and prints.
 */
export function drawPassQrCode(
  ctx: CanvasRenderingContext2D,
  passId: string,
  x: number,
  y: number,
  size: number,
  options: DrawQrOptions = {}
): void {
  const qr = getOrCreateQrCode(passId);
  const darkColor = options.darkColor ?? "#000000";
  const lightColor = options.lightColor ?? "#FFFFFF";
  const quietZone = options.quietZoneModules ?? 2;
  const borderRadius = options.borderRadius ?? 8;

  const moduleCount = qr.modules.size;
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = size / totalModules;

  ctx.save();

  // 1. Draw rounded background/quiet zone container
  ctx.fillStyle = lightColor;
  if (borderRadius > 0 && typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, borderRadius);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, size, size);
  }

  // 2. Draw dark QR modules
  ctx.fillStyle = darkColor;
  const startX = x + quietZone * moduleSize;
  const startY = y + quietZone * moduleSize;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.modules.get(row, col)) {
        const mx = Math.floor(startX + col * moduleSize);
        const my = Math.floor(startY + row * moduleSize);
        const mw = Math.ceil(startX + (col + 1) * moduleSize) - mx;
        const mh = Math.ceil(startY + (row + 1) * moduleSize) - my;
        ctx.fillRect(mx, my, mw, mh);
      }
    }
  }

  ctx.restore();
}
