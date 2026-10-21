import { createSeededRandom } from "./utils";

// Cache generated seeded grain patterns to ensure 60fps performance without redundant work
const grainPatternCache = new Map<number, CanvasPattern>();

/**
 * Draws a soft, realistic contact shadow under the mascot.
 * Simulates grounding with diffuse ambient occlusion.
 */
export function drawContactShadow(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  bottomY: number,
  shadowWidth: number,
  shadowHeight = 28,
  opacity = 0.38
): void {
  ctx.save();
  ctx.translate(centerX, bottomY);

  const shadowGrad = ctx.createRadialGradient(
    0,
    0,
    shadowWidth * 0.08,
    0,
    0,
    shadowWidth * 0.5
  );
  shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
  shadowGrad.addColorStop(0.4, `rgba(0, 0, 0, ${opacity * 0.6})`);
  shadowGrad.addColorStop(0.8, `rgba(0, 0, 0, ${opacity * 0.15})`);
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = shadowGrad;
  ctx.scale(1, shadowHeight / shadowWidth);
  ctx.beginPath();
  ctx.arc(0, 0, shadowWidth * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Creates a deterministic, seeded grain pattern tile (128×128).
 * Fast, pure function of the participant's seed. Eliminates gradient banding.
 */
export function getSeededGrainPattern(
  ctx: CanvasRenderingContext2D,
  seed: number
): CanvasPattern | null {
  const cached = grainPatternCache.get(seed);
  if (cached) return cached;

  const tileSize = 128;
  const tileCanvas = document.createElement("canvas");
  tileCanvas.width = tileSize;
  tileCanvas.height = tileSize;
  const tileCtx = tileCanvas.getContext("2d");
  if (!tileCtx) return null;

  const imgData = tileCtx.createImageData(tileSize, tileSize);
  const data = imgData.data;
  const prng = createSeededRandom(seed ^ 0xa5a5a5a5);

  for (let i = 0; i < data.length; i += 4) {
    const val = Math.floor(prng() * 255);
    // Subtle monochromatic noise
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = Math.floor(prng() * 28); // Low alpha: 0 to 28 (max ~11%)
  }

  tileCtx.putImageData(imgData, 0, 0);
  const pattern = ctx.createPattern(tileCanvas, "repeat");
  if (pattern) {
    grainPatternCache.set(seed, pattern);
  }
  return pattern;
}

/**
 * Applies deterministic grain over the entire canvas or clipped region.
 */
export function applySeededGrain(
  ctx: CanvasRenderingContext2D,
  seed: number,
  width: number,
  height: number,
  blendMode: GlobalCompositeOperation = "overlay"
): void {
  const pattern = getSeededGrainPattern(ctx, seed);
  if (!pattern) return;

  ctx.save();
  ctx.globalCompositeOperation = blendMode;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Draws a subtle, crisp highlight on the top and left edges of the card.
 */
export function drawCardEdgeHighlight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 24,
  isDark = true
): void {
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isDark
    ? "rgba(255, 255, 255, 0.18)"
    : "rgba(255, 255, 255, 0.65)";

  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.stroke();

  // Fine inner bevel top line
  ctx.strokeStyle = isDark
    ? "rgba(255, 255, 255, 0.28)"
    : "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + radius, y + 1);
  ctx.lineTo(x + w - radius, y + 1);
  ctx.stroke();

  ctx.restore();
}
