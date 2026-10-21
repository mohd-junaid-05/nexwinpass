import { EVENT, FONTS } from "@/lib/config";
import { hexToRgba } from "./utils";

/**
 * Draws an authentic circular rubber-stamp mark carrying the event's short name and year,
 * slightly rotated deterministically based on pass seed.
 */
export function drawRubberStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  seed: number,
  color: string = "#DC2626"
): void {
  // Deterministic slight angle variation between -14 deg and +14 deg
  const angleVariationDeg = ((seed % 29) - 14);
  const angleRad = (angleVariationDeg * Math.PI) / 180;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  // Outer ring (double ring stamp effect)
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner dotted / thin ring
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, radius - 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Innermost ring
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 13, 0, Math.PI * 2);
  ctx.stroke();

  // Top curved text: EVENT.badgeText
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `800 ${Math.round(radius * 0.17)}px ${FONTS.condensedPop}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const topText = `★  ${EVENT.badgeText}  ★`;
  drawCurvedText(ctx, topText, 0, 0, radius - 24, Math.PI, 0);

  // Center bold badge: "VERIFIED" / "2026"
  ctx.font = `900 ${Math.round(radius * 0.32)}px ${FONTS.condensedPop}`;
  ctx.fillText("VERIFIED", 0, -4);

  ctx.font = `800 ${Math.round(radius * 0.18)}px ${FONTS.monospace}`;
  ctx.fillText("BUILDER PASS", 0, 18);

  // Bottom curved text: "OFFICIAL ENTRY"
  const bottomText = "• OFFICIAL ENTRY 2026 •";
  drawCurvedText(ctx, bottomText, 0, 0, radius - 24, 0, Math.PI, true);

  ctx.restore();

  // Subtle ink distress / ink spatter texture
  ctx.fillStyle = hexToRgba(color, 0.25);
  let s = seed + 777;
  for (let i = 0; i < 24; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = (s % radius) * 0.9;
    const a = (s % 360) * (Math.PI / 180);
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws text curved along a circle arc.
 */
function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  inward: boolean = false
) {
  const chars = text.split("");
  const totalAngle = Math.abs(endAngle - startAngle);
  const angleStep = totalAngle / (chars.length + 1);

  ctx.save();
  for (let i = 0; i < chars.length; i++) {
    const angle = inward
      ? startAngle + (i + 1) * angleStep
      : startAngle - (i + 1) * angleStep;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + (inward ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}
