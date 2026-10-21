import type { SizeKey, MascotId } from "@/lib/config";

export type StyleKey = "editorial" | "night" | "pop" | "collector";

export interface ParticipantPassData {
  name: string;
  team: string;
  teamId: string;
  track: number;
  role?: string;
  ideaTitle: string;
  github: string;
  passId: string;
  seed: number;
  mascotId: MascotId;
}

export interface MascotBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StyleOption {
  key: StyleKey;
  label: string;
  description: string;
}

export const STYLE_OPTIONS: readonly StyleOption[] = [
  { key: "editorial", label: "Editorial", description: "Warm paper & serif elegance" },
  { key: "night", label: "Night", description: "Obsidian glow & pixel constellation" },
  { key: "pop", label: "Pop", description: "Vibrant yellow & bold sticker energy" },
  { key: "collector", label: "Collector", description: "Gradient foil & metallic top badge" },
] as const;

export type { SizeKey };
