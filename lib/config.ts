/**
 * Single source of truth for event-specific text, tracks, and export sizes.
 * Changing the event later means editing this file and nothing else.
 */

export const EVENT = {
  name: "NexWin Hackathon 2026",
  badgeText: "NEXWIN/HACK 26",
  siteUrl: "https://nexwin.dev",
  dates: "1–7 Nov 2026 · Online",
  hashtags: ["#NexWinHack", "#NexWin2026", "#BuildersUnite"],
  organiser: "NexWin Foundation",
} as const;

export const TRACKS = [
  "AI & Machine Learning",
  "Web3 & Blockchain",
  "Health & Biotech",
  "Climate & Sustainability",
  "Education & Access",
  "Open Innovation",
] as const;

export const TRACK_DETAILS = [
  { name: "AI & Machine Learning", mark: "neural_node", symbol: "✦" },
  { name: "Web3 & Blockchain", mark: "blockchain_cube", symbol: "⬡" },
  { name: "Health & Biotech", mark: "double_helix", symbol: "🧬" },
  { name: "Climate & Sustainability", mark: "leaf_rings", symbol: "◎" },
  { name: "Education & Access", mark: "open_book", symbol: "⎊" },
  { name: "Open Innovation", mark: "compass_star", symbol: "✳" },
] as const;

export type TrackMarkShape = (typeof TRACK_DETAILS)[number]["mark"];

export const SIZES = {
  pass: { width: 1920, height: 1080, label: "The pass" },
  square: { width: 1080, height: 1080, label: "Square" },
  link: { width: 1200, height: 630, label: "Link" },
  story: { width: 1080, height: 1920, label: "Story" },
  avatar: { width: 1080, height: 1080, label: "Avatar" },
} as const;

export type SizeKey = keyof typeof SIZES;

/**
 * Safe zone margins for each format with context on their origins.
 * Derived from platform overlays (Instagram, TikTok, Twitter cards, chat embeds).
 */
export const SAFE_ZONES = {
  pass: {
    top: 50,
    bottom: 50,
    left: 60,
    right: 60,
    note: "Landscape pass 1920×1080 card bleed margin; preserves decorative border and print safety",
  },
  square: {
    top: 60,
    bottom: 60,
    left: 60,
    right: 60,
    note: "Feed post safe area to avoid thumbnail cropping in Instagram/chat feeds",
  },
  link: {
    top: 40,
    bottom: 40,
    left: 60,
    right: 60,
    note: "OpenGraph / Twitter / LinkedIn card safe zone to avoid browser or card border clipping",
  },
  story: {
    top: 220,
    bottom: 260,
    left: 60,
    right: 60,
    note: "Instagram / TikTok / Snapchat story safe margins avoiding status header, profile pill and bottom reply/share bar",
  },
  avatar: {
    top: 60,
    bottom: 60,
    left: 60,
    right: 60,
    note: "1080×1080 circular crop safe zone; content strictly inscribed within radius 540 circle",
  },
} as const;

/**
 * Bundled local font families with resilient fallback stack for non-Latin scripts.
 */
export const FONTS = {
  serifDisplay:
    "'Playfair Display', 'Noto Serif Devanagari', 'Noto Serif Telugu', 'Amiri', Georgia, 'Times New Roman', serif",
  sansFacts:
    "'Plus Jakarta Sans', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Arabic', system-ui, -apple-system, sans-serif",
  condensedPop:
    "'Anton', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Arabic', Impact, sans-serif",
  wideNight:
    "'Syne', 'Plus Jakarta Sans', 'Noto Sans Devanagari', 'Noto Sans Telugu', system-ui, sans-serif",
  techCollector:
    "'Sora', 'Plus Jakarta Sans', 'Noto Sans Devanagari', 'Noto Sans Telugu', system-ui, sans-serif",
  monospace:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

export type MascotId =
  | "nova"
  | "byte"
  | "oracle"
  | "forge"
  | "pixel"
  | "helix"
  | "atlas"
  | "glitch";

export type {
  MascotManifestEntry,
  MascotTheme,
  MascotImages,
  MascotAnchors,
} from "./mascots/manifest";
export {
  MASCOT_MANIFEST,
  getMascotManifestEntry,
  DEFAULT_MASCOT_ID,
} from "./mascots/manifest";

import {
  MASCOT_MANIFEST,
  getMascotManifestEntry,
  type MascotManifestEntry,
} from "./mascots/manifest";

// Alias for backwards compatibility across pass renderer and UI
export type MascotConfig = MascotManifestEntry;
export const MASCOTS = MASCOT_MANIFEST;

export function getMascotConfig(id: MascotId | string): MascotConfig {
  return getMascotManifestEntry(id);
}

