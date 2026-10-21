import { getMascotConfig } from "@/lib/config";
import { getCachedMascotImage } from "@/lib/mascotImage";
import type { MascotBox, ParticipantPassData, StyleKey } from "./types";
import { getInitials, drawRoundRect, hexToRgba } from "./utils";

/**
 * Draws the mascot into the specified bounding box.
 * If the mascot image is cached (preferring large, then small for fast paint),
 * it draws the image scaled with high smoothing quality.
 * If the image is not ready or failed, it gracefully falls back to the Phase 2 stand-in badge.
 */
export function drawMascot(
  ctx: CanvasRenderingContext2D,
  box: MascotBox,
  participant: ParticipantPassData,
  style: StyleKey,
  crop: "full" | "bust" = "full"
): void {
  const { x, y, width, height } = box;

  // 1. Check for cached mascot image (large first, then small for instantaneous preview)
  const mascotImage =
    getCachedMascotImage(participant.mascotId, crop, "large") ||
    getCachedMascotImage(participant.mascotId, crop, "small");

  if (mascotImage) {
    const imgW = mascotImage.naturalWidth || mascotImage.width || 1024;
    const imgH = mascotImage.naturalHeight || mascotImage.height || 1024;

    // Scale to fit within box with comfortable breathing room
    const scale = Math.min(width / imgW, height / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = x + (width - drawW) / 2;
    const drawY = y + (height - drawH) / 2;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(mascotImage, drawX, drawY, drawW, drawH);
    ctx.restore();
    return;
  }


  // 2. Graceful fallback: Phase 2 Stand-in Badge tinted to the mascot's theme
  const mascot = getMascotConfig(participant.mascotId);
  const cx = x + width / 2;
  const cy = y + height / 2;
  const initials = getInitials(participant.name);

  ctx.save();

  if (style === "editorial") {
    // Elegant warm stone & terracotta emblem
    const radius = Math.min(width, height) * 0.38;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#E4DEC3";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#8C7E6A";
    ctx.stroke();

    // Inner subtle ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 10, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = hexToRgba(mascot.theme.accent, 0.5);
    ctx.stroke();

    // Initials
    ctx.fillStyle = "#2D261E";
    ctx.font = `600 ${Math.round(radius * 0.75)}px Georgia, 'Times New Roman', serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, cx, cy + 2);
  } else if (style === "night") {
    // Cyber shield emblem with neon glowing rings in mascot colors
    const radius = Math.min(width, height) * 0.42;

    // Glowing outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = mascot.theme.accent;
    ctx.stroke();

    // Neon accent ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 14, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = mascot.theme.glow;
    ctx.stroke();

    // Initials
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 ${Math.round(radius * 0.78)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, cx, cy);

    // Subtle HUD tick marks
    ctx.strokeStyle = mascot.theme.accent;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const x1 = cx + Math.cos(angle) * (radius - 4);
      const y1 = cy + Math.sin(angle) * (radius - 4);
      const x2 = cx + Math.cos(angle) * (radius + 8);
      const y2 = cy + Math.sin(angle) * (radius + 8);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  } else if (style === "pop") {
    // Bold pop-comic circular badge with heavy black outline
    const radius = Math.min(width, height) * 0.44;

    // Offset drop shadow
    ctx.beginPath();
    ctx.arc(cx + 8, cy + 8, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();

    // White circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // Inner mascot accent ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 16, 0, Math.PI * 2);
    ctx.fillStyle = mascot.theme.accent;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // Heavy condensed black initials
    ctx.fillStyle = "#000000";
    ctx.font = `900 ${Math.round(radius * 0.85)}px Impact, 'Arial Black', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, cx, cy + 2);
  } else {
    // Collector: metallic foil emblem with mascot gradient
    const w = width * 0.5;
    const h = height * 0.6;
    const xPos = cx - w / 2;
    const yPos = cy - h / 2;

    const grad = ctx.createLinearGradient(xPos, yPos, xPos + w, yPos + h);
    grad.addColorStop(0, mascot.theme.gradient[0]);
    grad.addColorStop(0.5, mascot.theme.accent);
    grad.addColorStop(1, mascot.theme.gradient[1]);

    drawRoundRect(ctx, xPos, yPos, w, h, 24);
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = grad;
    ctx.stroke();

    // Inner badge
    drawRoundRect(ctx, xPos + 12, yPos + 12, w - 24, h - 24, 16);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.stroke();

    // Initials
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 ${Math.round(w * 0.4)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, cx, cy);
  }

  ctx.restore();
}
