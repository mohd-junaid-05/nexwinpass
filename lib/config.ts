/**
 * Single source of truth for NEXWIN hackathon text, tracks, dates, and export sizes.
 * Sourced directly from docs/hackathondata/event.json.
 */

export const EVENT = {
  name: "NEXWIN",
  organizer: "Nexus Coding Club",
  year: 2026,
  tagline: "Find the problem. Build the solution. Show what you can do.",
  summary:
    "An internal online hackathon organized by Nexus Coding Club. Turn an idea into a working project, explore new technologies, experiment with AI, and learn by building something meaningful.",
  badgeText: "NEXWIN 2026",
  siteUrl: "" as string, // Left empty until deployed pass page address is provided by operator
  dates: "19–24 Oct 2026 · Online",
  passDateLine: "19–24 Oct 2026 · Online",
  hashtags: ["#NEXWIN", "#NexusCodingClub"] as readonly string[],
  scheduleNote:
    "Dates and timings are subject to change in the event of unforeseen circumstances. Any changes will be communicated through official NEXWIN announcements.",
  timezone: "Asia/Kolkata",
};

export const TRACKS = [
  "Event & Workshop Management",
  "Learning, Resources & Skill Development",
  "Club Governance & Operations",
  "Member Experience & Community",
  "Public Relations & Digital Presence",
] as const;

export const TRACK_DETAILS = [
  {
    id: 1,
    label: "Track 01",
    name: "Event & Workshop Management",
    shortName: "Events & Workshops",
    mark: "event_calendar" as const,
    symbol: "🗓",
    focus:
      "Improving the planning, organization, and experience of club events and workshops.",
  },
  {
    id: 2,
    label: "Track 02",
    name: "Learning, Resources & Skill Development",
    shortName: "Learning & Skills",
    mark: "open_book" as const,
    symbol: "📖",
    focus:
      "Making learning resources easier to access and helping members develop technical skills.",
  },
  {
    id: 3,
    label: "Track 03",
    name: "Club Governance & Operations",
    shortName: "Governance & Ops",
    mark: "governance_shield" as const,
    symbol: "🛡",
    focus:
      "Improving internal workflows and the day-to-day operations of the club.",
  },
  {
    id: 4,
    label: "Track 04",
    name: "Member Experience & Community",
    shortName: "Member Experience",
    mark: "community_nodes" as const,
    symbol: "👥",
    focus:
      "Improving the experience of club members and strengthening the community.",
  },
  {
    id: 5,
    label: "Track 05",
    name: "Public Relations & Digital Presence",
    shortName: "PR & Digital",
    mark: "digital_broadcast" as const,
    symbol: "📡",
    focus:
      "Improving how the club communicates, presents itself, and shares its work with an audience.",
  },
] as const;

export type TrackMarkShape = (typeof TRACK_DETAILS)[number]["mark"];

export const AT_A_GLANCE = [
  { label: "Eligibility", value: "Nexus Coding Club members only" },
  { label: "Mode", value: "Online" },
  { label: "Duration", value: "Approximately one week" },
  { label: "Team size", value: "1–3 members" },
  { label: "Tracks", value: "Choose one of five tracks" },
  { label: "Technology", value: "Any suitable technology" },
  { label: "AI usage", value: "Encouraged, but optional" },
  { label: "Project", value: "A new project built for NEXWIN" },
  { label: "Deployment", value: "Required for final submission" },
  { label: "Registration", value: "Devfolio" },
  { label: "Team communication", value: "Discord" },
  { label: "Final presentation", value: "Google Meet" },
] as const;

export const STAGES = [
  {
    order: 1,
    title: "Idea Submission",
    purpose: "Plan your project before you start building.",
  },
  {
    order: 2,
    title: "Mid-Hackathon Review",
    purpose:
      "Show your progress, explain your work, and improve your project.",
  },
  {
    order: 3,
    title: "Final Submission and Presentation",
    purpose: "Complete your project and demonstrate the final result.",
  },
] as const;

export const SCHEDULE = [
  {
    order: 1,
    title: "Idea Submission",
    display: "Monday, 19 October 2026 · 4:00 PM",
    date: "2026-10-19",
    time: "16:00",
    description:
      "Submit your Idea Document outlining your selected track, proposed solution, technology stack, team responsibilities, and execution plan.",
  },
  {
    order: 2,
    title: "Mid-Hackathon Review",
    display: "Wednesday, 21 October 2026 · 3:00 PM",
    date: "2026-10-21",
    time: "15:00",
    description:
      "Present your progress, demonstrate the working parts of your project, and receive feedback from the organizing team. This is a progress review, not an elimination round.",
  },
  {
    order: 3,
    title: "Final Submission Deadline",
    display: "Friday, 23 October 2026 · 11:59 PM",
    date: "2026-10-23",
    time: "23:59",
    description:
      "Submit your completed working project, deployment link, presentation slides, and all other required deliverables before the deadline.",
  },
  {
    order: 4,
    title: "NEXWIN Finals — Project Presentation",
    display: "Saturday, 24 October 2026 · Timing to be announced",
    date: "2026-10-24",
    time: null,
    description:
      "Present your final project to the reviewing team, explain your solution and technical decisions, and showcase your team's contributions. Presentation timings and further instructions will be announced by the organizers.",
  },
] as const;

/**
 * Brand logo configuration.
 * - Clear space: fixed fraction (10%) of mark size.
 * - Minimum size for detailed glow mark: 72px. Below this, simple mark is used.
 */
export const LOGO_CONFIG = {
  clearSpaceFraction: 0.05,
  minDetailedSize: 32,
  logoPath: "/brand/logo.png",
  glowPath: "/brand/logo-glow.png",
} as const;

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
