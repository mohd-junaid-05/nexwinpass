/**
 * Export, download, clipboard, and caption utilities for Builder Pass Studio.
 * All functions use an isolated off-screen canvas so the on-screen live preview
 * is never disturbed.
 */

import { EVENT, TRACKS, SIZES, type SizeKey, type MascotId, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData, StyleKey } from "./types";
import { renderPass } from "./render";
import { ensureMascotLoaded } from "@/lib/mascotImage";

/**
 * Sanitizes a participant name into a safe, predictable filename slug.
 * Removes accents/diacritics, strips non-alphanumeric characters, and
 * collapses consecutive hyphens. If empty (e.g. all non-Latin or symbols),
 * uses the fallback neutral word.
 */
export function sanitizeFilename(name: string, fallback = "builder"): string {
  if (!name || typeof name !== "string") return fallback;

  // Decompose accented characters and strip diacritical marks
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Convert to lowercase and replace non-alphanumeric chars with hyphens
  const cleaned = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || fallback;
}

/**
 * Generates a clean, ready-to-post caption.
 * Sourced entirely from the event configuration and user pass details.
 * Never includes participant email, never outputs "undefined", and
 * avoids dangling links or empty lines.
 */
export function generateCaption(participant: {
  ideaTitle?: string;
  team?: string;
  track?: number;
  github?: string;
}): string {
  const lines: string[] = [];

  // 1. What they're building / Headline
  const idea = participant.ideaTitle?.trim();
  if (idea) {
    lines.push(`🚀 I'm building "${idea}" at ${EVENT.name}!`);
  } else {
    lines.push(`🚀 I'm building at ${EVENT.name}!`);
  }

  // 2. Team & Track
  const team = participant.team?.trim();
  const trackIdx = participant.track ?? 0;
  const trackName = TRACKS[trackIdx] ?? TRACKS[0];

  if (team && trackName) {
    lines.push(`👥 Team: ${team}\n🎯 Track: ${trackName}`);
  } else if (team) {
    lines.push(`👥 Team: ${team}`);
  } else if (trackName) {
    lines.push(`🎯 Track: ${trackName}`);
  }

  // 3. GitHub (only if provided and trimmed non-empty)
  const cleanGithub = participant.github?.trim().replace(/^@+/, "");
  if (cleanGithub) {
    lines.push(`💻 GitHub: https://github.com/${cleanGithub}`);
  }

  // 4. Dates & Site URL
  lines.push(`🗓️ ${EVENT.dates}\n🌐 ${EVENT.siteUrl}`);

  // 5. Hashtags
  if (EVENT.hashtags && EVENT.hashtags.length > 0) {
    lines.push(EVENT.hashtags.join(" "));
  }

  return lines.filter(Boolean).join("\n\n");
}

/**
 * Generates an accurate, accessible description of the pass for screen reader users
 * to paste into social media alt text fields.
 * Reads naturally, mentions the mascot's name and look, never includes personal email,
 * and gracefully handles missing optional fields without gaps or "undefined".
 */
export function generateAltText(participant: {
  name?: string;
  role?: string;
  team?: string;
  teamId?: string;
  track?: number;
  ideaTitle?: string;
  github?: string;
  mascotId?: MascotId;
  passId?: string;
}): string {
  const parts: string[] = [];
  const name = participant.name?.trim() || "Builder";
  const mascot = getMascotConfig(participant.mascotId || "forge");
  const trackIdx = participant.track ?? 0;
  const trackName = TRACKS[trackIdx] ?? TRACKS[0];

  // 1. Core identification
  parts.push(`Digital builder pass for ${name} at ${EVENT.name}.`);

  // 2. Mascot description
  parts.push(
    `Features mascot ${mascot.name} ("${mascot.tagline}"): ${mascot.description}`
  );


  // 3. Role, team, track
  const role = participant.role?.trim();
  const team = participant.team?.trim();
  const teamId = participant.teamId?.trim();
  const rolePrefix = role ? `${role} of ` : "";
  if (team && teamId) {
    parts.push(
      `${rolePrefix}team "${team}" (${teamId}), building in the ${trackName} track.`
    );
  } else if (team) {
    parts.push(
      `${rolePrefix}team "${team}", building in the ${trackName} track.`
    );
  } else {
    parts.push(`Participating in the ${trackName} track.`);
  }

  // 4. Project idea
  const idea = participant.ideaTitle?.trim();
  if (idea) {
    parts.push(`Project idea: "${idea}".`);
  }

  // 5. GitHub
  const cleanGithub = participant.github?.trim().replace(/^@+/, "");
  if (cleanGithub) {
    parts.push(`GitHub profile: @${cleanGithub}.`);
  }

  // 6. QR & Verification
  if (participant.passId) {
    parts.push(
      `Includes a verified scannable QR code linking to ${EVENT.siteUrl} with pass ID ${participant.passId}.`
    );
  } else {
    parts.push(
      `Includes a verified scannable QR code linking to ${EVENT.siteUrl}.`
    );
  }

  return parts.join(" ");
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
}

/**
 * Pure export function that renders the pass onto an offscreen canvas
 * at the exact required pixel dimensions without affecting the on-screen preview.
 * Ensures all fonts and 3D mascots are fully resolved before generating the blob.
 */
export async function exportPassToBlob(
  participant: ParticipantPassData,
  style: StyleKey,
  size: SizeKey
): Promise<ExportResult> {
  // 1. Ensure fonts are fully loaded
  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }

  // 2. Ensure mascot images are ready and decoded
  if (participant.mascotId) {
    await Promise.all([
      ensureMascotLoaded(participant.mascotId, "full", "large"),
      ensureMascotLoaded(participant.mascotId, "bust", "large"),
    ]);
  }


  // 3. Create isolated offscreen canvas matching exact dimensions
  const sizeDef = SIZES[size];
  const offscreen = document.createElement("canvas");
  offscreen.width = sizeDef.width;
  offscreen.height = sizeDef.height;

  const ctx = offscreen.getContext("2d");
  if (!ctx) {
    throw new Error("Could not initialize 2D canvas context for export.");
  }

  // 4. Render pass using the standard pure renderer
  renderPass(ctx, participant, style, size);

  // 5. Convert offscreen canvas to PNG blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    offscreen.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Failed to generate image blob from canvas."));
    }, "image/png");
  });

  const slug = sanitizeFilename(participant.name, "builder");
  const filename = `builder-pass-${slug}-${size}.png`;

  return {
    blob,
    filename,
    width: sizeDef.width,
    height: sizeDef.height,
  };
}

/**
 * Triggers a client-side download of a Blob with the specified filename.
 * Revokes the temporary object URL after download to prevent memory leaks.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Release object URL after the browser has accepted the download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export interface ClipboardResult {
  success: boolean;
  message: string;
}

/**
 * Copies a PNG Blob directly to the system clipboard as an image.
 * Returns a friendly, informative message when the browser does not support it.
 */
export async function copyPassImageToClipboard(
  blob: Blob
): Promise<ClipboardResult> {
  if (typeof window === "undefined" || !navigator.clipboard) {
    return {
      success: false,
      message:
        "Your browser doesn't support clipboard access. Please use 'Download PNG' instead.",
    };
  }

  if (typeof ClipboardItem === "undefined") {
    return {
      success: false,
      message:
        "Your browser doesn't support copying images to the clipboard. Please use 'Download PNG' instead.",
    };
  }

  try {
    const item = new ClipboardItem({ "image/png": blob });
    await navigator.clipboard.write([item]);
    return {
      success: true,
      message: "Image copied to clipboard! Ready to paste.",
    };
  } catch (err: unknown) {
    console.warn("Clipboard image write failed:", err);
    return {
      success: false,
      message:
        "Could not copy image to clipboard. Permissions might be denied. Please use 'Download PNG' instead.",
    };
  }
}

/**
 * Copies text (such as the social caption) to the clipboard.
 */
export async function copyTextToClipboard(
  text: string
): Promise<ClipboardResult> {
  if (typeof window === "undefined") {
    return { success: false, message: "Clipboard is not available." };
  }

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return {
        success: true,
        message: "Caption copied to clipboard!",
      };
    }

    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (successful) {
      return {
        success: true,
        message: "Caption copied to clipboard!",
      };
    }

    return {
      success: false,
      message: "Could not copy caption to clipboard.",
    };
  } catch {
    return {
      success: false,
      message: "Could not copy caption to clipboard.",
    };
  }
}
