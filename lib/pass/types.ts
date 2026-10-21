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
  number?: number;
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
  { key: "editorial", label: "Editorial", description: "Warm ivory paper & arch portal" },
  { key: "night", label: "Night", description: "Obsidian stage & luminous glow" },
  { key: "pop", label: "Pop", description: "Comic poster & starburst badge" },
  { key: "collector", label: "Collector", description: "Trading card & themed foil frame" },
] as const;

export type { SizeKey };
