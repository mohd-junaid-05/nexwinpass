import { EVENT, SIZES, FONTS, type SizeKey, getMascotConfig } from "@/lib/config";
import type { ParticipantPassData, StyleKey } from "./types";
import { hexToRgba } from "./utils";
import { renderEditorialStyle } from "./styles/editorial";
import { renderNightStyle } from "./styles/night";
import { renderPopStyle } from "./styles/pop";
import { renderCollectorStyle } from "./styles/collector";
import { renderLandscapePass } from "./styles/landscape";
import { renderAvatarPass } from "./styles/avatar";
import { applySeededGrain } from "./grain";

/**
 * Renders the 1080×1350 portrait base pass directly into the provided 2D canvas context.
 */
export function renderBasePass(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  style: StyleKey
): void {
  ctx.save();
  switch (style) {
    case "editorial":
      renderEditorialStyle(ctx, participant);
      break;
    case "night":
      renderNightStyle(ctx, participant);
      break;
    case "pop":
      renderPopStyle(ctx, participant);
      break;
    case "collector":
      renderCollectorStyle(ctx, participant);
      break;
  }
  ctx.restore();
}

/**
 * Draws the tilted pass on a coloured backdrop for Square (1080×1080) and Story (1080×1920) sizes,
 * strictly observing social safe zones and applying seeded grain to eliminate banding.
 */
function renderTiltedPassOnBackdrop(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  style: StyleKey,
  size: "square" | "story"
): void {
  const { width, height } = SIZES[size];
  const mascot = getMascotConfig(participant.mascotId);

  // 1. Draw Coloured Backdrop per Style driven by mascot's theme
  ctx.save();
  if (style === "editorial") {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#E7E2D6");
    grad.addColorStop(0.7, "#D8D1C2");
    grad.addColorStop(1, hexToRgba(mascot.theme.accent, 0.16));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (style === "night") {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#05070E");
    grad.addColorStop(1, "#0A0D18");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const aura = ctx.createRadialGradient(
      width / 2,
      height / 2,
      50,
      width / 2,
      height / 2,
      width * 0.65
    );
    aura.addColorStop(0, hexToRgba(mascot.theme.glow, 0.45));
    aura.addColorStop(0.4, hexToRgba(mascot.theme.accent, 0.25));
    aura.addColorStop(0.7, hexToRgba(mascot.theme.gradient[1], 0.12));
    aura.addColorStop(1, "rgba(5, 7, 14, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);
  } else if (style === "pop") {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, mascot.theme.popBg || "#FFDE00");
    grad.addColorStop(1, mascot.theme.accent);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Collector
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#090B10");
    grad.addColorStop(0.5, mascot.theme.collectorPanel[0]);
    grad.addColorStop(1, mascot.theme.collectorPanel[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }


  // 2. Render Base Card to Offscreen Canvas
  const offscreen = document.createElement("canvas");
  offscreen.width = 1080;
  offscreen.height = 1350;
  const offscreenCtx = offscreen.getContext("2d");
  if (!offscreenCtx) {
    ctx.restore();
    return;
  }
  renderBasePass(offscreenCtx, participant, style);

  // 3. Safe Zone Layout Dimensions & Scales
  let headlineY = 90;
  let headlineSize = 38;
  let footerY = height - 90;
  let footerSize = 24;
  let cardScale = 0.55;
  let cardCenterX = width / 2;
  let cardCenterY = height / 2;
  const rotationRad = (-4 * Math.PI) / 180; // -4 degrees tilt

  if (size === "square") {
    // Square: safe top 60px, bottom 60px
    headlineY = 95;
    headlineSize = 36;
    footerY = 990;
    footerSize = 24;
    cardScale = 0.55;
    cardCenterX = width / 2;
    cardCenterY = 540;
  } else if (size === "story") {
    // Story (1080×1920): safe top 220px, safe bottom 260px (Instagram/TikTok overlays)
    headlineY = 250;
    headlineSize = 42;
    footerY = 1630;
    footerSize = 26;
    cardScale = 0.88;
    cardCenterX = width / 2;
    cardCenterY = 940;
  }

  // 4. Headline above the card: "I'm building at {EVENT.name}"
  const textColor = style === "editorial" ? "#292524" : "#FFFFFF";
  ctx.fillStyle = textColor;
  ctx.font = `700 ${headlineSize}px ${FONTS.sansFacts}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`I'm building at ${EVENT.name}`, width / 2, headlineY);

  // 5. Draw Tilted Card with Drop Shadow
  ctx.save();
  ctx.translate(cardCenterX, cardCenterY);
  ctx.rotate(rotationRad);
  ctx.scale(cardScale, cardScale);

  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 24;

  ctx.drawImage(offscreen, -1080 / 2, -1350 / 2, 1080, 1350);
  ctx.restore();

  // 6. Footer below the card: "{EVENT.siteUrl} · {EVENT.dates}"
  ctx.fillStyle = style === "editorial" ? "#57534E" : "rgba(255, 255, 255, 0.85)";
  ctx.font = `600 ${footerSize}px ${FONTS.monospace}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${EVENT.siteUrl}  ·  ${EVENT.dates}`, width / 2, footerY);

  // 7. Seeded grain over the entire backdrop
  applySeededGrain(ctx, participant.seed, width, height, "overlay");

  ctx.restore();
}

/**
 * Main Pure Pass Renderer.
 * Draws the pass for any data, style, and size onto the provided canvas context.
 * Pure function of data, style, and size.
 */
export function renderPass(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  style: StyleKey,
  size: SizeKey
): void {
  if (size === "pass") {
    renderBasePass(ctx, participant, style);
  } else if (size === "link") {
    renderLandscapePass(ctx, participant, style);
  } else if (size === "avatar") {
    renderAvatarPass(ctx, participant, style);
  } else {
    renderTiltedPassOnBackdrop(ctx, participant, style, size);
  }
}
