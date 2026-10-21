import type { ParticipantPassData, StyleKey } from "../types";
import { renderEditorialStyle } from "./editorial";
import { renderNightStyle } from "./night";
import { renderPopStyle } from "./pop";
import { renderCollectorStyle } from "./collector";

/**
 * Landscape Link Composition (1200×630):
 * Uses the landscape base card with bleed, scaled cleanly to 1200×630.
 */
export function renderLandscapePass(
  ctx: CanvasRenderingContext2D,
  participant: ParticipantPassData,
  style: StyleKey
): void {
  const width = 1200;
  const height = 630;

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
