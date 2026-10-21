/**
 * Browser image loader, cache, and decoding manager for Builder Pass Studio.
 * Replaces run-time 3D rendering with static pre-rendered character assets.
 */

import { getMascotConfig, type MascotId } from "@/lib/config";

// Cache for loaded HTMLImageElement instances keyed by image URL
const imageCache = new Map<string, HTMLImageElement>();
// In-flight loading promises to prevent duplicate fetches
const loadPromises = new Map<string, Promise<HTMLImageElement>>();
// Set of image URLs that failed to load
const failedImages = new Set<string>();

type ErrorListener = (errorInfo: { mascotId: string; url: string; message: string }) => void;
const errorListeners = new Set<ErrorListener>();

export function addMascotImageErrorListener(listener: ErrorListener): () => void {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

function notifyError(mascotId: string, url: string, message: string) {
  for (const listener of errorListeners) {
    try {
      listener({ mascotId, url, message });
    } catch (e) {
      console.error("Error in mascot image error listener:", e);
    }
  }
}

/**
 * Loads an image URL into an HTMLImageElement and waits for it to decode.
 */
export async function loadMascotImage(url: string, mascotId?: string): Promise<HTMLImageElement> {
  if (typeof window === "undefined") {
    throw new Error("loadMascotImage can only be called in browser environments");
  }

  const cached = imageCache.get(url);
  if (cached) {
    return cached;
  }

  const existingPromise = loadPromises.get(url);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      try {
        if ("decode" in img) {
          await img.decode();
        }
        imageCache.set(url, img);
        loadPromises.delete(url);
        resolve(img);
      } catch {
        // Even if decode fails (rare), the image is loaded and drawable
        imageCache.set(url, img);
        loadPromises.delete(url);
        resolve(img);
      }
    };

    img.onerror = () => {
      failedImages.add(url);
      loadPromises.delete(url);
      const msg = `Failed to load mascot image from ${url}`;
      notifyError(mascotId || "unknown", url, msg);
      reject(new Error(msg));
    };

    img.src = url;
  });

  loadPromises.set(url, promise);
  return promise;
}

/**
 * Returns a cached HTMLImageElement synchronously if already loaded and decoded,
 * or null if not yet ready or failed.
 */
export function getCachedMascotImage(
  mascotId: MascotId | string,
  crop: "full" | "bust" = "full",
  resolution: "large" | "small" = "large"
): HTMLImageElement | null {
  const mascot = getMascotConfig(mascotId);
  const imageKey =
    crop === "bust"
      ? resolution === "small"
        ? mascot.images.bustSmall
        : mascot.images.bustLarge
      : resolution === "small"
      ? mascot.images.fullSmall
      : mascot.images.fullLarge;

  return imageCache.get(imageKey) ?? null;
}

/**
 * Checks if a mascot's image is recorded as failed.
 */
export function isMascotImageFailed(
  mascotId: MascotId | string,
  crop: "full" | "bust" = "full",
  resolution: "large" | "small" = "large"
): boolean {
  const mascot = getMascotConfig(mascotId);
  const imageKey =
    crop === "bust"
      ? resolution === "small"
        ? mascot.images.bustSmall
        : mascot.images.bustLarge
      : resolution === "small"
      ? mascot.images.fullSmall
      : mascot.images.fullLarge;

  return failedImages.has(imageKey);
}

/**
 * Guarantees that a mascot image is loaded and decoded before proceeding (e.g. for exports).
 * If the image fails to load, gracefully resolves to null and triggers fallback.
 */
export async function ensureMascotLoaded(
  mascotId: MascotId | string,
  crop: "full" | "bust" = "full",
  resolution: "large" | "small" = "large"
): Promise<HTMLImageElement | null> {
  const mascot = getMascotConfig(mascotId);
  const imageKey =
    crop === "bust"
      ? resolution === "small"
        ? mascot.images.bustSmall
        : mascot.images.bustLarge
      : resolution === "small"
      ? mascot.images.fullSmall
      : mascot.images.fullLarge;

  try {
    return await loadMascotImage(imageKey, mascot.id);
  } catch {
    return null;
  }
}

/**
 * Preloads small thumbnail images for all 8 mascots in background during idle time
 * so the picker and thumbnails respond instantaneously.
 */
export function preloadAllMascotsIdle(): void {
  if (typeof window === "undefined") return;

  const preloader = () => {
    const mascots = [
      "nova",
      "byte",
      "oracle",
      "forge",
      "pixel",
      "helix",
      "atlas",
      "glitch",
    ];

    for (const id of mascots) {
      const conf = getMascotConfig(id);
      loadMascotImage(conf.images.bustSmall, id).catch(() => {});
      loadMascotImage(conf.images.fullSmall, id).catch(() => {});
    }
  };

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(preloader);
  } else {
    setTimeout(preloader, 200);
  }
}
