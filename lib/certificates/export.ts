import { EVENT } from "@/lib/config";
import { sanitizeFilename } from "@/lib/pass/export";
import type {
  CertificateTemplate,
  ParticipantCertificateData,
} from "./types";
import { preloadTemplateImage, renderCertificate } from "./render";

/**
 * Renders an isolated off-screen certificate canvas and exports it to a PNG Blob.
 * Waits for fonts and background assets to ensure zero visual glitches.
 */
export async function exportCertificateToBlob(
  template: CertificateTemplate,
  data: ParticipantCertificateData
): Promise<Blob> {
  // 1. Ensure fonts are loaded
  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }

  // 2. Preload background image
  const bgImage = await preloadTemplateImage(template.backgroundPath);

  // 3. Create isolated offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to obtain 2D canvas context for certificate export");
  }

  // Render certificate cleanly without dev placement overlay
  renderCertificate(ctx, template, data, {
    showPlacementOverlay: false,
    bgImage,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to export certificate canvas to PNG blob"));
      }
    }, "image/png");
  });
}

/**
 * Downloads a certificate blob to disk with a clean, sanitized filename.
 */
export function downloadCertificateBlob(
  blob: Blob,
  type: string,
  participantName: string
) {
  const safeName = sanitizeFilename(participantName, "builder");
  const filename = `NEXWIN-${type}-${safeName}.png`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Generates a ready-to-post social media caption for certificates.
 * Always mentions NEXWIN and Nexus Coding Club without echoing email.
 */
export function generateCertificateCaption(
  type: "participation" | "completion",
  data: ParticipantCertificateData
): string {
  const lines: string[] = [];
  const eventName = EVENT.name;
  const organizer = EVENT.organizer;

  if (type === "completion") {
    lines.push(
      `🏆 Proud to have completed ${eventName} 2026 organized by ${organizer}!`
    );
    if (data.team) {
      lines.push(
        `Built with team "${data.team}" as ${data.role || "Builder"}. Huge shoutout to my teammates!`
      );
    }
  } else {
    lines.push(
      `🎓 Proud to have participated in ${eventName} 2026 organized by ${organizer}!`
    );
    if (data.team) {
      lines.push(
        `Collaborated with team "${data.team}" as ${data.role || "Builder"}.`
      );
    }
  }

  if (data.certificateId) {
    lines.push(`📜 Verification ID: ${data.certificateId}`);
  }

  if (EVENT.siteUrl && EVENT.siteUrl.trim()) {
    lines.push(`🌐 ${EVENT.siteUrl}`);
  }

  if (EVENT.hashtags && EVENT.hashtags.length > 0) {
    lines.push(EVENT.hashtags.join(" "));
  }

  return lines.join("\n\n");
}
