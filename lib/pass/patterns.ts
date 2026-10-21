import { createSeededRandom, hexToRgba } from "./utils";
import { getMascotConfig, type MascotId } from "@/lib/config";

/**
 * Signature mascot world pattern renderer.
 * Pure vector canvas drawing, 100% deterministic per pass seed.
 * Generates one of eight unique signature patterns matching the character's world.
 */
export function drawMascotWorldPattern(
  ctx: CanvasRenderingContext2D,
  mascotId: MascotId | string,
  seed: number,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {
    opacity?: number;
    color?: string;
    blendMode?: GlobalCompositeOperation;
  }
): void {
  const prng = createSeededRandom(seed + 1013);
  const mascot = getMascotConfig(mascotId);
  const opacity = options?.opacity ?? 0.35;
  const primaryColor = options?.color ?? mascot.theme.glow;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  if (options?.blendMode) {
    ctx.globalCompositeOperation = options.blendMode;
  }

  switch (mascotId) {
    case "nova":
      drawNovaStarField(ctx, prng, x, y, width, height, primaryColor, opacity);
      break;
    case "byte":
      drawBytePixelGrid(ctx, prng, x, y, width, height, primaryColor, opacity);
      break;
    case "oracle":
      drawOracleConstellations(ctx, prng, x, y, width, height, primaryColor, opacity);
      break;
    case "forge":
      drawForgeHexBoltsAndSparks(ctx, prng, x, y, width, height, primaryColor, opacity);
      break;
    case "pixel":
      drawPixelPaintSplatters(ctx, prng, x, y, width, height, primaryColor, opacity);
      break;
    case "helix":
      drawHelixButterfliesAndRibbons(ctx, prng, x, y, width, height, primaryColor, opacity);
      break;
    case "atlas":
      drawAtlasTopographyAndCompass(ctx, prng, x, y, width, height, primaryColor, opacity);
      break;
    case "glitch":
    default:
      drawGlitchScanlinesAndSlices(ctx, prng, x, y, width, height, primaryColor, opacity);
      break;
  }

  ctx.restore();
}

/**
 * Nova: Star field with shooting streaks
 */
function drawNovaStarField(
  ctx: CanvasRenderingContext2D,
  prng: () => number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number
) {
  // 1. Sparkling 4-point stars
  const starCount = 45;
  for (let i = 0; i < starCount; i++) {
    const sx = x + prng() * width;
    const sy = y + prng() * height;
    const r = 2 + prng() * 5;
    const alpha = (0.2 + prng() * 0.8) * opacity;

    ctx.save();
    ctx.fillStyle = hexToRgba(color, alpha);
    ctx.beginPath();
    // 4-point diamond star
    ctx.moveTo(sx, sy - r * 2);
    ctx.quadraticCurveTo(sx, sy, sx + r * 2, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy + r * 2);
    ctx.quadraticCurveTo(sx, sy, sx - r * 2, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy - r * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Tiny star dust dots
  for (let i = 0; i < 70; i++) {
    const dx = x + prng() * width;
    const dy = y + prng() * height;
    const dr = 0.8 + prng() * 1.6;
    ctx.fillStyle = hexToRgba("#FFFFFF", (0.15 + prng() * 0.5) * opacity);
    ctx.beginPath();
    ctx.arc(dx, dy, dr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Diagonal shooting star streaks
  const streakCount = 3 + Math.floor(prng() * 2);
  for (let s = 0; s < streakCount; s++) {
    const startX = x + width * 0.1 + prng() * (width * 0.7);
    const startY = y + height * 0.1 + prng() * (height * 0.5);
    const length = 120 + prng() * 180;
    const angle = (25 + prng() * 15) * (Math.PI / 180); // ~30 deg
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;

    const grad = ctx.createLinearGradient(startX, startY, endX, endY);
    grad.addColorStop(0, hexToRgba(color, 0.9 * opacity));
    grad.addColorStop(0.3, hexToRgba("#FFFFFF", 0.6 * opacity));
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2 + prng() * 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Bright head sparkle
    ctx.fillStyle = hexToRgba("#FFFFFF", 0.95 * opacity);
    ctx.beginPath();
    ctx.arc(startX, startY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Byte: Pixel grid with scattered lit squares
 */
function drawBytePixelGrid(
  ctx: CanvasRenderingContext2D,
  prng: () => number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number
) {
  const cellSize = 28;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);

  // Faint grid lines
  ctx.save();
  ctx.strokeStyle = hexToRgba(color, 0.08 * opacity);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= cols; c++) {
    ctx.moveTo(x + c * cellSize, y);
    ctx.lineTo(x + c * cellSize, y + height);
  }
  for (let r = 0; r <= rows; r++) {
    ctx.moveTo(x, y + r * cellSize);
    ctx.lineTo(x + width, y + r * cellSize);
  }
  ctx.stroke();

  // Scattered lit pixel blocks
  const litCount = Math.floor(cols * rows * 0.14);
  for (let i = 0; i < litCount; i++) {
    const col = Math.floor(prng() * cols);
    const row = Math.floor(prng() * rows);
    const px = x + col * cellSize + 2;
    const py = y + row * cellSize + 2;
    const size = cellSize - 4;
    const alpha = (0.2 + prng() * 0.75) * opacity;

    ctx.fillStyle = hexToRgba(color, alpha);
    ctx.fillRect(px, py, size, size);

    // Occasional 2x2 cluster
    if (prng() > 0.85 && col < cols - 1 && row < rows - 1) {
      ctx.fillStyle = hexToRgba("#FFFFFF", (alpha * 0.7));
      ctx.fillRect(px + cellSize, py, size, size);
      ctx.fillRect(px, py + cellSize, size, size);
    }
  }
  ctx.restore();
}

/**
 * Oracle: Constellation lines joining small stars
 */
function drawOracleConstellations(
  ctx: CanvasRenderingContext2D,
  prng: () => number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number
) {
  const nodeCount = 38;
  const nodes: { x: number; y: number; r: number; alpha: number }[] = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: x + prng() * width,
      y: y + prng() * height,
      r: 2 + prng() * 3.5,
      alpha: (0.3 + prng() * 0.7) * opacity,
    });
  }

  // Draw connecting constellation lines between close neighbors
  ctx.save();
  ctx.lineWidth = 1.2;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 140) {
        const lineAlpha = (1 - dist / 140) * 0.45 * opacity;
        ctx.strokeStyle = hexToRgba(color, lineAlpha);
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw celestial nodes & faint rings
  for (const n of nodes) {
    ctx.fillStyle = hexToRgba(color, n.alpha);
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();

    // Occasional halo around bright stars
    if (n.r > 4) {
      ctx.strokeStyle = hexToRgba(color, n.alpha * 0.4);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Forge: Hex-bolt and spark motifs
 */
function drawForgeHexBoltsAndSparks(
  ctx: CanvasRenderingContext2D,
  prng: () => number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number
) {
  ctx.save();

  // 1. Hex-bolt polygons
  const hexCount = 20;
  for (let i = 0; i < hexCount; i++) {
    const hx = x + prng() * width;
    const hy = y + prng() * height;
    const r = 10 + prng() * 18;
    const rot = prng() * Math.PI;
    const alpha = (0.15 + prng() * 0.45) * opacity;

    ctx.strokeStyle = hexToRgba(color, alpha);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let s = 0; s < 6; s++) {
      const a = rot + (s * Math.PI) / 3;
      const vx = hx + Math.cos(a) * r;
      const vy = hy + Math.sin(a) * r;
      if (s === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.stroke();

    // Central circular bolt socket
    ctx.fillStyle = hexToRgba(color, alpha * 0.6);
    ctx.beginPath();
    ctx.arc(hx, hy, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Flying sparks / welding embers
  const sparkCount = 40;
  for (let i = 0; i < sparkCount; i++) {
    const sx = x + prng() * width;
    const sy = y + prng() * height;
    const sl = 8 + prng() * 18;
    const sa = (-45 + prng() * 90) * (Math.PI / 180);

    ctx.strokeStyle = hexToRgba("#F59E0B", (0.3 + prng() * 0.65) * opacity);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(sa) * sl, sy + Math.sin(sa) * sl);
    ctx.stroke();

    ctx.fillStyle = hexToRgba("#FFFFFF", (0.4 + prng() * 0.6) * opacity);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Pixel: Paint splatters and soft dots
 */
function drawPixelPaintSplatters(
  ctx: CanvasRenderingContext2D,
  prng: () => number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number
) {
  ctx.save();
  const clusters = 5;

  for (let c = 0; c < clusters; c++) {
    const cx = x + width * 0.15 + prng() * (width * 0.7);
    const cy = y + height * 0.15 + prng() * (height * 0.7);
    const baseR = 14 + prng() * 22;
    const clusterAlpha = (0.2 + prng() * 0.5) * opacity;

    // Center drop
    ctx.fillStyle = hexToRgba(color, clusterAlpha);
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.fill();

    // Surrounding droplets
    const dropCount = 12 + Math.floor(prng() * 16);
    for (let d = 0; d < dropCount; d++) {
      const angle = prng() * Math.PI * 2;
      const dist = baseR * 1.2 + prng() * 90;
      const dr = 2 + prng() * 6;
      const dx = cx + Math.cos(angle) * dist;
      const dy = cy + Math.sin(angle) * dist;

      ctx.fillStyle = hexToRgba(color, (0.15 + prng() * 0.65) * opacity);
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Scattered stippled soft dots
  for (let i = 0; i < 50; i++) {
    const sx = x + prng() * width;
    const sy = y + prng() * height;
    ctx.fillStyle = hexToRgba(color, (0.1 + prng() * 0.3) * opacity);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5 + prng() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Helix: Butterflies and twisting ribbon lines
 */
function drawHelixButterfliesAndRibbons(
  ctx: CanvasRenderingContext2D,
  prng: () => number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number
) {
  ctx.save();

  // 1. Dual twisting ribbon sine waves
  const ribbonCount = 2;
  for (let r = 0; r < ribbonCount; r++) {
    const yOffset = y + height * (0.35 + r * 0.3);
    const amplitude = 35 + prng() * 25;
    const wavelength = 180 + prng() * 80;

    ctx.strokeStyle = hexToRgba(color, (0.22 + r * 0.1) * opacity);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = x; px <= x + width; px += 8) {
      const py = yOffset + Math.sin((px - x) / wavelength) * amplitude;
      if (px === x) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Twin strand out of phase
    ctx.strokeStyle = hexToRgba("#F472B6", (0.15 + r * 0.1) * opacity);
    ctx.beginPath();
    for (let px = x; px <= x + width; px += 8) {
      const py = yOffset + Math.sin((px - x) / wavelength + Math.PI) * amplitude;
      if (px === x) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // 2. Stylized geometric butterflies
  const butterflyCount = 10;
  for (let b = 0; b < butterflyCount; b++) {
    const bx = x + prng() * width;
    const by = y + prng() * height;
    const wingSpan = 8 + prng() * 12;
    const rot = (-30 + prng() * 60) * (Math.PI / 180);
    const alpha = (0.25 + prng() * 0.55) * opacity;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);
    ctx.fillStyle = hexToRgba(color, alpha);

    // Left wing
    ctx.beginPath();
    ctx.ellipse(-wingSpan * 0.6, 0, wingSpan * 0.6, wingSpan * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.ellipse(wingSpan * 0.6, 0, wingSpan * 0.6, wingSpan * 0.4, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = hexToRgba("#FFFFFF", alpha * 0.9);
    ctx.fillRect(-1, -wingSpan * 0.5, 2, wingSpan);

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Atlas: Topographic contour lines and a faint compass mark
 */
function drawAtlasTopographyAndCompass(
  ctx: CanvasRenderingContext2D,
  prng: () => number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number
) {
  ctx.save();

  // 1. Topographic undulating contour lines
  const contourCount = 8;
  ctx.strokeStyle = hexToRgba(color, 0.22 * opacity);
  ctx.lineWidth = 1.5;

  for (let c = 0; c < contourCount; c++) {
    const baseY = y + (c / contourCount) * height;
    ctx.beginPath();
    ctx.moveTo(x, baseY);

    const segments = 6;
    const segWidth = width / segments;
    for (let s = 0; s < segments; s++) {
      const cpX = x + (s + 0.5) * segWidth;
      const cpY = baseY + (prng() - 0.5) * 80;
      const endX = x + (s + 1) * segWidth;
      const endY = baseY + (prng() - 0.5) * 40;
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    }
    ctx.stroke();
  }

  // 2. Faint 8-point nautical compass mark
  const compX = x + width * 0.2 + prng() * (width * 0.6);
  const compY = y + height * 0.25 + prng() * (height * 0.5);
  const compR = 48;

  ctx.save();
  ctx.translate(compX, compY);

  // Outer circles
  ctx.strokeStyle = hexToRgba(color, 0.3 * opacity);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, compR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = hexToRgba(color, 0.15 * opacity);
  ctx.beginPath();
  ctx.arc(0, 0, compR * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  // 8-point compass star
  for (let p = 0; p < 8; p++) {
    const angle = (p * Math.PI) / 4;
    const isMajor = p % 2 === 0;
    const len = isMajor ? compR * 0.9 : compR * 0.55;

    ctx.strokeStyle = hexToRgba(color, (isMajor ? 0.45 : 0.25) * opacity);
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

/**
 * Glitch: Scan lines and colour-split slices
 */
function drawGlitchScanlinesAndSlices(
  ctx: CanvasRenderingContext2D,
  prng: () => number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number
) {
  ctx.save();

  // 1. Horizontal raster scan lines
  ctx.fillStyle = hexToRgba("#000000", 0.12 * opacity);
  for (let sy = y; sy < y + height; sy += 6) {
    ctx.fillRect(x, sy, width, 1.5);
  }

  // 2. Colour-split offset horizontal slices
  const sliceCount = 9 + Math.floor(prng() * 6);
  for (let s = 0; s < sliceCount; s++) {
    const sliceY = y + prng() * height;
    const sliceH = 4 + prng() * 18;
    const sliceW = width * (0.15 + prng() * 0.4);
    const sliceX = x + prng() * (width - sliceW);
    const offset = (prng() > 0.5 ? 1 : -1) * (4 + prng() * 10);

    // Cyan glitch offset
    ctx.fillStyle = hexToRgba("#22D3EE", 0.35 * opacity);
    ctx.fillRect(sliceX + offset, sliceY, sliceW, sliceH);

    // Magenta glitch offset
    ctx.fillStyle = hexToRgba("#F43F5E", 0.35 * opacity);
    ctx.fillRect(sliceX - offset, sliceY, sliceW, sliceH);

    // Primary core highlight
    ctx.fillStyle = hexToRgba(color, 0.2 * opacity);
    ctx.fillRect(sliceX, sliceY, sliceW, sliceH);
  }

  ctx.restore();
}
