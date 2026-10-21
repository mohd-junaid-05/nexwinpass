/**
 * Pure utility functions for pass rendering, string formatting, and canvas helpers.
 */

/**
 * Converts a string to Title Case, preserving hyphens and apostrophes.
 * E.g. "DAVID PARK" -> "David Park"
 *      "CAROL JOHANSSON-ALEKSANDROVIĆ-WORTHINGTON" -> "Carol Johansson-Aleksandrović-Worthington"
 *      "FRANK O'SULLIVAN" -> "Frank O'Sullivan"
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str.toLowerCase().replace(/(?:^|[\s\-'’])\p{L}/gu, (match) => match.toUpperCase());
}

/**
 * Deterministic 32-bit FNV-1a hash of a string.
 */
export function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Generates a stable pass ID and numeric seed from an email.
 * Never echoes the email itself.
 */
export function generatePassId(email: string): { passId: string; seed: number } {
  const normalized = email.trim().toLowerCase();
  const seed = hashString(normalized);
  const hex = (seed & 0xfffff).toString(16).toUpperCase().padStart(5, "0");
  return {
    passId: `#NW-${hex}`,
    seed,
  };
}

/**
 * Deterministic PRNG (Mulberry32) seeded with an unsigned 32-bit integer.
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Extracts 1-2 uppercase initials from a person's name.
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "NW";
  const words = trimmed.split(/[\s\-]+/).filter(Boolean);
  if (words.length === 0) return "NW";
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Measures single line text, decreasing font size down to minSize,
 * and truncating with ellipsis if it still exceeds maxWidth.
 */
export function fitSingleLineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  fontFace: string,
  weight: string = "normal"
): { fontSize: number; text: string } {
  if (!text) return { fontSize: initialSize, text: "" };

  let currentSize = initialSize;
  ctx.font = `${weight} ${currentSize}px ${fontFace}`;

  // Shrink font size first
  while (ctx.measureText(text).width > maxWidth && currentSize > minSize) {
    currentSize -= 2;
    ctx.font = `${weight} ${currentSize}px ${fontFace}`;
  }

  // If still too wide at minSize, truncate with ellipsis
  let fittedText = text;
  if (ctx.measureText(fittedText).width > maxWidth) {
    while (fittedText.length > 0 && ctx.measureText(`${fittedText}…`).width > maxWidth) {
      fittedText = fittedText.slice(0, -1);
    }
    fittedText = `${fittedText}…`;
  }

  return { fontSize: currentSize, text: fittedText };
}

/**
 * Wraps text into lines up to maxLines, truncating the final line with ellipsis if needed.
 */
export function wrapAndFitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  font: string
): string[] {
  if (!text) return [];
  ctx.font = font;

  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (lines.length + 1 >= maxLines) {
        // Last line, must cut with ellipsis
        let truncated = currentLine ? `${currentLine} ${word}` : word;
        while (truncated.length > 0 && ctx.measureText(`${truncated}…`).width > maxWidth) {
          truncated = truncated.slice(0, -1);
        }
        lines.push(`${truncated}…`);
        return lines;
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Draws a rounded rectangle path.
 */
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | number[]
): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radii);
  } else {
    const r = typeof radii === "number" ? radii : radii[0] || 0;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Draws an arch path: flat bottom, vertical sides, and semicircular top.
 */
export function drawArchPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0, false);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

/**
 * Converts a hex color string (e.g. #F97316 or #FFF) to rgba(r, g, b, alpha).
 */
export function hexToRgba(hex: string, alpha = 1): string {
  const clean = hex.replace("#", "").trim();
  let r = 0;
  let g = 0;
  let b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Formats Track and Team cleanly without pass IDs or internal codes.
 */
export function formatTrackAndTeam(
  trackName: string,
  trackIndex: number,
  team?: string
): string {
  const trackNum = `Track ${String(trackIndex + 1).padStart(2, "0")}`;
  if (team && team.trim().length > 0) {
    return `${trackNum}: ${trackName} • Team ${team.trim()}`;
  }
  return `${trackNum}: ${trackName}`;
}

/**
 * Draws Track & Team string right-aligned in the footer.
 * Sizing adapts dynamically: short text gets 24px, long text scales down to 16px,
 * with truncation if needed so it NEVER collides with the left footer link.
 */
export function drawFooterTrackAndTeam(
  ctx: CanvasRenderingContext2D,
  text: string,
  rightX: number,
  y: number,
  maxW: number,
  fontFamily: string,
  color: string,
  scale: number
): void {
  const maxFont = Math.round(24 * scale);
  const minFont = Math.round(16 * scale);
  const fitted = fitSingleLineText(ctx, text, maxW, maxFont, minFont, fontFamily, "600");

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `600 ${fitted.fontSize}px ${fontFamily}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(fitted.text, rightX, y);
  ctx.restore();
}

/**
 * Draws the participant hero name cleanly with stacked or wrapping layout.
 * Ensures short names (1-2 words) are large and impactful (100px - 125px),
 * and long names scale gracefully without overflowing bounds.
 */
export function drawHeroName(
  ctx: CanvasRenderingContext2D,
  rawName: string,
  x: number,
  topY: number,
  maxW: number,
  maxH: number,
  fontFamily: string,
  color: string,
  weight: string = "700",
  isUppercase: boolean = false
): { bottomY: number } {
  const name = (isUppercase ? rawName.toUpperCase() : rawName).trim() || "BUILDER";
  const words = name.split(/\s+/);

  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  if (words.length === 2 && name.length <= 22) {
    // Two clean words (e.g. "Mohd Junaid" or "Alice Chen") -> stack in 2 lines with huge impactful type
    const line1 = words[0];
    const line2 = words[1];
    const maxFont = Math.min(Math.round(maxH * 0.44), 116);
    const minFont = 62;

    const fit1 = fitSingleLineText(ctx, line1, maxW, maxFont, minFont, fontFamily, weight);
    const fit2 = fitSingleLineText(ctx, line2, maxW, maxFont, minFont, fontFamily, weight);
    const chosenFont = Math.min(fit1.fontSize, fit2.fontSize);

    const lineGap = Math.round(chosenFont * 0.12);
    ctx.font = `${weight} ${chosenFont}px ${fontFamily}`;
    ctx.fillText(fit1.text, x, topY);
    ctx.fillText(fit2.text, x, topY + chosenFont + lineGap);

    ctx.restore();
    return { bottomY: topY + chosenFont * 2 + lineGap };
  } else if (words.length === 1 && name.length <= 14) {
    // Single short word -> 1 massive line
    const maxFont = Math.min(Math.round(maxH * 0.7), 125);
    const fit = fitSingleLineText(ctx, name, maxW, maxFont, 64, fontFamily, weight);
    ctx.font = `${weight} ${fit.fontSize}px ${fontFamily}`;
    ctx.fillText(fit.text, x, topY);

    ctx.restore();
    return { bottomY: topY + fit.fontSize };
  } else {
    // Multi-word or long hyphenated name (e.g. Carol Johansson-Aleksandrović-Worthington)
    // Wrap across 2 to 3 lines with dynamic font fitting
    let bestFont = 88;
    let lines: string[] = [];
    while (bestFont >= 46) {
      const fontStr = `${weight} ${bestFont}px ${fontFamily}`;
      lines = wrapAndFitText(ctx, name, maxW, 3, fontStr);
      const totalH = lines.length * (bestFont * 1.15);
      if (totalH <= maxH) break;
      bestFont -= 4;
    }

    ctx.font = `${weight} ${bestFont}px ${fontFamily}`;
    const lineHeight = Math.round(bestFont * 1.15);
    lines.forEach((l, idx) => {
      ctx.fillText(l, x, topY + idx * lineHeight);
    });

    ctx.restore();
    return { bottomY: topY + lines.length * lineHeight };
  }
}

