import { SIZES, type SizeKey } from "@/lib/config";
import type { ParticipantPassData, StyleKey } from "./types";
import { renderEditorialStyle } from "./styles/editorial";
import { renderNightStyle } from "./styles/night";
import { renderPopStyle } from "./styles/pop";
import { renderCollectorStyle } from "./styles/collector";
import { renderLandscapePass } from "./styles/landscape";
import { renderVerticalPass } from "./styles/vertical";
import { renderAvatarPass } from "./styles/avatar";

/**
 * Renders the 1920×1080 landscape base pass directly into the provided 2D canvas context.
 */
export function renderBasePass(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  style: StyleKey,
  width: number = 1920,
  height: number = 1080
): void {
  ctx.save();
  switch (style) {
    case "editorial":
      renderEditorialStyle(ctx, participant, width, height);
      break;
    case "night":
      renderNightStyle(ctx, participant, width, height);
      break;
    case "pop":
      renderPopStyle(ctx, participant, width, height);
      break;
    case "collector":
      renderCollectorStyle(ctx, participant, width, height);
      break;
  }
  ctx.restore();
}

/**
 * Main Pure Pass Renderer.
 * Draws the pass for any participant data, style, and size onto the provided canvas context.
 * Pure function of data, style, and size.
 *
 * Implements the two-base architecture:
 * 1. Landscape Base: "The pass" (1920×1080) and "Link" (1200×630).
 * 2. Vertical Base: "Square" (1080×1080) and "Story" (1080×1920).
 * 3. Avatar: "Avatar" (1080×1080 bust crop).
 */
export function renderPass(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  style: StyleKey,
  size: SizeKey
): void {
  const { width, height } = SIZES[size];

  if (size === "pass") {
    renderBasePass(ctx, participant, style, width, height);
  } else if (size === "link") {
    renderLandscapePass(ctx, participant, style);
  } else if (size === "square") {
    renderVerticalPass(ctx, participant, style, "square");
  } else if (size === "story") {
    renderVerticalPass(ctx, participant, style, "story");
  } else if (size === "avatar") {
    renderAvatarPass(ctx, participant, style);
  }
}
