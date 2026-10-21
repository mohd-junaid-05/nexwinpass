/**
 * Brand Logo Manager and Canvas Drawer for NEXWIN.
 * Uses ONLY the authentic NEXWIN logo from docs/hackathondata/NEXWIN_fav & logo.png.
 * Zero redrawing or alterations of the original artwork.
 */

import { EVENT, FONTS, LOGO_CONFIG } from "@/lib/config";

let glowImageCache: HTMLImageElement | null = null;
let directImageCache: HTMLImageElement | null = null;
let isGlowLoading = false;
let isDirectLoading = false;

/**
 * Preloads or retrieves the cached glow mark image for canvas rendering.
 */
export function getGlowLogoImage(): HTMLImageElement | null {
  if (glowImageCache && glowImageCache.complete && glowImageCache.naturalWidth > 0) {
    return glowImageCache;
  }
  if (typeof window !== "undefined" && !isGlowLoading) {
    isGlowLoading = true;
    const img = new Image();
    img.src = LOGO_CONFIG.glowPath;
    img.onload = () => {
      glowImageCache = img;
      isGlowLoading = false;
    };
    img.onerror = () => {
      isGlowLoading = false;
    };
  }
  return glowImageCache && glowImageCache.complete ? glowImageCache : null;
}

/**
 * Preloads or retrieves the cached original logo image for canvas rendering.
 */
export function getDirectLogoImage(): HTMLImageElement | null {
  if (directImageCache && directImageCache.complete && directImageCache.naturalWidth > 0) {
    return directImageCache;
  }
  if (typeof window !== "undefined" && !isDirectLoading) {
    isDirectLoading = true;
    const img = new Image();
    img.src = LOGO_CONFIG.logoPath;
    img.onload = () => {
      directImageCache = img;
      isDirectLoading = false;
    };
    img.onerror = () => {
      isDirectLoading = false;
    };
  }
  return directImageCache && directImageCache.complete ? directImageCache : null;
}

export interface DrawLogoOptions {
  variant?: "glow" | "simple" | "auto";
  isDarkBackground?: boolean;
  color?: string;
}

/**
 * Draws the authentic NEXWIN logo onto the canvas at (x, y) with the specified size.
 * Uses only the exact artwork provided in docs/hackathondata/NEXWIN_fav & logo.png.
 */
export function drawNexWinLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  options: DrawLogoOptions = {}
): void {
  const isDark = options.isDarkBackground ?? true;
  const glowImg = getGlowLogoImage();
  const directImg = getDirectLogoImage();

  ctx.save();

  if (isDark) {
    // Dark background: draw glowing green logo
    const imgToDraw = glowImg || directImg;
    if (imgToDraw) {
      const pad = size * LOGO_CONFIG.clearSpaceFraction;
      const drawSize = size - pad * 2;
      ctx.drawImage(imgToDraw, x + pad, y + pad, drawSize, drawSize);
    }
  } else {
    // Light background: draw crisp dark rounded container so the original neon green cube displays cleanly
    const badgeR = size * 0.22;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, size, size, badgeR);
    } else {
      ctx.rect(x, y, size, size);
    }
    ctx.fillStyle = "#080C09";
    ctx.fill();

    const imgToDraw = glowImg || directImg;
    if (imgToDraw) {
      const pad = size * 0.1;
      const drawSize = size - pad * 2;
      ctx.drawImage(imgToDraw, x + pad, y + pad, drawSize, drawSize);
    }
  }

  ctx.restore();
}

/**
 * Draws the NEXWIN brand lockup:
 * Authentic Logo + "NEXWIN" + "by Nexus Coding Club"
 * Live text set in bundled fonts, never baked into an image.
 */
export function drawNexWinLockup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  options: {
    isDark?: boolean;
    showSubtitle?: boolean;
    textColor?: string;
    subtextColor?: string;
  } = {}
): void {
  const isDark = options.isDark ?? true;
  const showSub = options.showSubtitle ?? true;
  const textColor = options.textColor || (isDark ? "#EDF7EE" : "#080C09");
  const subtextColor = options.subtextColor || (isDark ? "#8FA895" : "#576059");

  const markSize = height;
  drawNexWinLogo(ctx, x, y, markSize, {
    isDarkBackground: isDark,
  });

  const textX = x + markSize + Math.round(height * 0.25);
  const titleFontSize = Math.round(height * 0.52);

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = showSub ? "top" : "middle";

  // Brand Name
  ctx.fillStyle = textColor;
  ctx.font = `900 ${titleFontSize}px ${FONTS.sansFacts}`;
  const titleY = showSub ? y + Math.round(height * 0.08) : y + height / 2;
  ctx.fillText(EVENT.name, textX, titleY);

  // Subtitle: by Nexus Coding Club
  if (showSub) {
    const subFontSize = Math.round(height * 0.26);
    ctx.fillStyle = subtextColor;
    ctx.font = `600 ${subFontSize}px ${FONTS.sansFacts}`;
    ctx.fillText(`by ${EVENT.organizer}`, textX, y + Math.round(height * 0.62));
  }

  ctx.restore();
}
