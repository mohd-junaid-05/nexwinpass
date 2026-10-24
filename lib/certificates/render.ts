import { EVENT, TRACK_DETAILS } from "@/lib/config";
import { toTitleCase } from "@/lib/pass/utils";
import type {
  CertificateField,
  CertificateTemplate,
  ParticipantCertificateData,
} from "./types";
import { getTrackTitle } from "./config";

/**
 * In-memory image cache for certificate template backgrounds.
 */
const templateImageCache = new Map<string, HTMLImageElement>();

export function getLoadedTemplateImage(src: string): HTMLImageElement | null {
  const cached = templateImageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return cached;
  }
  return null;
}

export async function preloadTemplateImage(src: string): Promise<HTMLImageElement> {
  const existing = templateImageCache.get(src);
  if (existing && existing.complete && existing.naturalWidth > 0) {
    return existing;
  }

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cannot preload image on server"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      templateImageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load certificate template background at ${src}`));
    };
    img.src = src;
  });
}

/**
 * Resolves the display string for a template field based on participant data.
 */
export function resolveFieldValue(
  field: CertificateField,
  data: ParticipantCertificateData,
  template: CertificateTemplate
): string {
  let text = "";
  switch (field.dataKey) {
    case "name":
      text = data.name || "Participant Name";
      break;
    case "role":
      text = data.role || "Member";
      break;
    case "body": {
      const detail =
        TRACK_DETAILS.find((t) => t.id === data.track) || TRACK_DETAILS[0];
      const trackName = detail ? detail.name : "Hackathon Track";
      if (template.id === "completion") {
        const project = (data.projectName || "").trim() || "their project";
        text = `"for completing all project milestones in NEXWIN 2026 by building and presenting '${project}' with team ${data.team} (${trackName})."`;
      } else {
        const roleWord =
          data.role && data.role.toLowerCase().includes("leader")
            ? "leader"
            : "member";
        text = `for actively participating in NEXWIN 2026, an online hackathon organized by Nexus Coding Club, as a ${roleWord} of team "${data.team}" under the ${trackName} track.`;
      }
      break;
    }
    case "project":
      text = (data.projectName || "").trim() || "their project";
      break;
    case "event":
      text = template.title.toUpperCase();
      break;
    case "organizer":
      text = `${EVENT.organizer.toUpperCase()}  •  ${EVENT.name} ${EVENT.year}`;
      break;
    case "track": {
      const trackLabel = getTrackTitle(data.track);
      const teamPart = data.team ? ` with team "${data.team}"` : "";
      const rolePart = data.role ? ` as ${data.role}` : "";
      if (template.id === "completion") {
        text = `For successfully completing and presenting their project in ${trackLabel}${teamPart}${rolePart}.`;
      } else {
        text = `For active participation and contribution in ${trackLabel}${teamPart}${rolePart}.`;
      }
      break;
    }
    case "dates":
      text = `${EVENT.dates}  •  Nexus Coding Club`;
      break;
    case "certificateId":
      text = data.certificateId ? `VERIFICATION ID: ${data.certificateId}` : "";
      break;
    case "team":
      text = data.team || "";
      break;
    default:
      text = "";
  }

  if (field.casing === "title") {
    return toTitleCase(text);
  }
  if (field.casing === "upper") {
    return text.toUpperCase();
  }
  return text;
}

/**
 * Fits single- or multi-line text dynamically within a bounding box.
 * Shrinks font size down to smallestSize, wraps up to maxLines, and truncates with ellipsis.
 */
export function fitCertificateText(
  ctx: CanvasRenderingContext2D,
  rawText: string,
  field: CertificateField
): { fontSize: number; lines: string[]; lineHeight: number } {
  const { box, largestSize, smallestSize, maxLines, fontFamily, weight = "normal" } = field;
  const maxWidth = box.width;
  const maxHeight = box.height;

  if (!rawText.trim()) {
    return { fontSize: largestSize, lines: [], lineHeight: largestSize * 1.3 };
  }

  // Single line optimization
  if (maxLines <= 1) {
    let size = largestSize;
    ctx.font = `${weight} ${size}px ${fontFamily}`;

    while (ctx.measureText(rawText).width > maxWidth && size > smallestSize) {
      size -= 1;
      ctx.font = `${weight} ${size}px ${fontFamily}`;
    }

    let line = rawText;
    if (ctx.measureText(line).width > maxWidth) {
      while (line.length > 0 && ctx.measureText(`${line}…`).width > maxWidth) {
        line = line.slice(0, -1);
      }
      line = `${line}…`;
    }

    return { fontSize: size, lines: [line], lineHeight: size * 1.25 };
  }

  // Multi-line wrapping with font shrinking
  const words = rawText.split(/\s+/).filter(Boolean);

  for (let size = largestSize; size >= smallestSize; size -= 1) {
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    const lineHeight = size * 1.35;
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    const fitsLines = lines.length <= maxLines;
    const fitsHeight = lines.length * lineHeight <= maxHeight;

    if (fitsLines && fitsHeight) {
      return { fontSize: size, lines, lineHeight };
    }
  }

  // Floor at smallestSize: wrap to maxLines and truncate the final line
  const floorSize = smallestSize;
  ctx.font = `${weight} ${floorSize}px ${fontFamily}`;
  const floorLineHeight = floorSize * 1.35;
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        // Last line: append all remaining words then truncate
        const remaining = words.slice(i).join(" ");
        let lastLine = `${currentLine} ${remaining}`.trim();
        if (ctx.measureText(lastLine).width > maxWidth) {
          while (lastLine.length > 0 && ctx.measureText(`${lastLine}…`).width > maxWidth) {
            lastLine = lastLine.slice(0, -1);
          }
          lastLine = `${lastLine}…`;
        }
        lines.push(lastLine);
        return { fontSize: floorSize, lines, lineHeight: floorLineHeight };
      }
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return { fontSize: floorSize, lines, lineHeight: floorLineHeight };
}

/**
 * Pure function to render a certificate template with participant data onto a canvas context.
 */
export function renderCertificate(
  ctx: CanvasRenderingContext2D,
  template: CertificateTemplate,
  data: ParticipantCertificateData,
  options?: {
    showPlacementOverlay?: boolean;
    bgImage?: HTMLImageElement | null;
  }
) {
  const { width, height } = template;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Draw template background
  const bg = options?.bgImage || getLoadedTemplateImage(template.backgroundPath);
  if (bg && bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, width, height);
  } else {
    // Fallback background while loading
    ctx.fillStyle = template.id === "completion" ? "#07120B" : "#080F18";
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw placeholder masks to seamlessly hide baked-in template text
  for (const field of template.fields) {
    if (!field.mask) continue;
    if (
      field.mask.sliceY != null &&
      bg &&
      bg.complete &&
      bg.naturalWidth > 0
    ) {
      const sliceH = field.mask.sliceHeight || 4;
      ctx.drawImage(
        bg,
        field.box.x,
        field.mask.sliceY,
        field.box.width,
        sliceH,
        field.box.x,
        field.box.y,
        field.box.width,
        field.box.height
      );
    } else if (field.mask.color) {
      ctx.fillStyle = field.mask.color;
      ctx.fillRect(field.box.x, field.box.y, field.box.width, field.box.height);
    }
  }

  // 3. Draw each dynamic field
  for (const field of template.fields) {
    const value = resolveFieldValue(field, data, template);
    if (!value) continue;

    const { fontSize, lines, lineHeight } = fitCertificateText(ctx, value, field);
    ctx.font = `${field.weight || "normal"} ${fontSize}px ${field.fontFamily}`;
    ctx.fillStyle = field.color;

    let x = field.box.x;
    if (field.align === "center") {
      ctx.textAlign = "center";
      x = field.box.x + field.box.width / 2;
    } else if (field.align === "right") {
      ctx.textAlign = "right";
      x = field.box.x + field.box.width;
    } else {
      ctx.textAlign = "left";
      x = field.box.x;
    }

    const totalTextHeight = lines.length * lineHeight;
    const startY = field.box.y + (field.box.height - totalTextHeight) / 2 + fontSize * 0.95;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, startY + i * lineHeight);
    }
  }

  // 3. Development Placement Overlay
  // Strictly disabled in production builds to prevent leaking dev guides
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev && options?.showPlacementOverlay) {
    ctx.save();
    for (const field of template.fields) {
      const { x, y, width: bw, height: bh } = field.box;
      // Draw dashed outline
      ctx.strokeStyle = "#FF007F";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(x, y, bw, bh);

      // Draw label & box dimensions
      ctx.fillStyle = "rgba(255, 0, 127, 0.9)";
      ctx.fillRect(x, Math.max(0, y - 20), ctx.measureText(field.label).width + 120, 20);

      ctx.font = "bold 12px ui-monospace, monospace";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.setLineDash([]);
      ctx.fillText(
        `${field.label} [${bw}×${bh} @ (${x},${y})]`,
        x + 4,
        Math.max(14, y - 5)
      );
    }
    ctx.restore();
  }
}
