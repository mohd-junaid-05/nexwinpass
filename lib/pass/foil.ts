import { getMascotConfig, type MascotId } from "@/lib/config";
import { drawRoundRect, hexToRgba } from "./utils";

/**
 * Creates a dynamic metallic / holographic foil gradient driven by the mascot's theme colors.
 * Foil highlight angle is rotated deterministically per pass seed.
 */
export function createThemedFoilGradient(
  ctx: CanvasRenderingContext2D,
  mascotId: MascotId | string,
  seed: number,
  x: number,
  y: number,
  width: number,
  height: number
): CanvasGradient {
  const mascot = getMascotConfig(mascotId);
  const angleDeg = (seed % 360);
  const angleRad = (angleDeg * Math.PI) / 180;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const radius = Math.max(width, height) / 2;

  const x0 = cx - Math.cos(angleRad) * radius;
  const y0 = cy - Math.sin(angleRad) * radius;
  const x1 = cx + Math.cos(angleRad) * radius;
  const y1 = cy + Math.sin(angleRad) * radius;

  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, mascot.theme.shell);
  grad.addColorStop(0.2, mascot.theme.glow);
  grad.addColorStop(0.35, "#FFFFFF"); // Gleaming foil highlight
  grad.addColorStop(0.5, mascot.theme.accent);
  grad.addColorStop(0.68, mascot.theme.deeper);
  grad.addColorStop(0.85, mascot.theme.tint);
  grad.addColorStop(1, mascot.theme.shell);

  return grad;
}

/**
 * Draws a foil-bordered frame with the mascot's themed foil gradient.
 */
export function drawThemedFoilFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  lineWidth: number,
  mascotId: MascotId | string,
  seed: number
): void {
  ctx.save();
  const foilGrad = createThemedFoilGradient(ctx, mascotId, seed, x, y, width, height);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = foilGrad;
  drawRoundRect(ctx, x, y, width, height, radius);
  ctx.stroke();

  // Subtle inner sheen line
  ctx.lineWidth = 1;
  ctx.strokeStyle = hexToRgba("#FFFFFF", 0.35);
  drawRoundRect(ctx, x + lineWidth, y + lineWidth, width - lineWidth * 2, height - lineWidth * 2, Math.max(2, radius - lineWidth));
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a collector holographic diamond emblem.
 */
export function drawCollectorHoloEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  mascotId: MascotId | string,
  seed: number
): void {
  ctx.save();
  const foil = createThemedFoilGradient(ctx, mascotId, seed, cx - size, cy - size, size * 2, size * 2);

  ctx.translate(cx, cy);
  ctx.fillStyle = foil;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.75, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.75, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner sparkle
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
