/**
 * Offscreen Static Layer Caching Engine.
 * Caches static background, mascot world pattern, character render, contact shadows,
 * and ticket stub container once per mascot, style, size, and seed.
 * Typing in input fields only redraws the dynamic text layers, achieving < 2ms redraws.
 */

type StaticLayerDrawer = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

const staticLayerCache = new Map<string, HTMLCanvasElement>();

/**
 * Retrieves a cached static canvas layer or generates it via the drawer function.
 */
export function getOrCreateStaticLayer(
  cacheKey: string,
  width: number,
  height: number,
  drawStaticFn: StaticLayerDrawer
): HTMLCanvasElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  const existing = staticLayerCache.get(cacheKey);
  if (existing && existing.width === width && existing.height === height) {
    return existing;
  }

  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) return null;

  drawStaticFn(offCtx, width, height);
  staticLayerCache.set(cacheKey, offscreen);

  // Evict older entries if cache exceeds 40 layers
  if (staticLayerCache.size > 40) {
    const firstKey = staticLayerCache.keys().next().value;
    if (firstKey) staticLayerCache.delete(firstKey);
  }

  return offscreen;
}

/**
 * Clears the static layer cache (e.g. on mascot change).
 */
export function clearStaticLayerCache(): void {
  staticLayerCache.clear();
}
