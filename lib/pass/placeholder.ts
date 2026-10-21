import { DEFAULT_MASCOT_ID, type MascotId } from "@/lib/config";
import type { ParticipantPassData } from "./types";
import { toTitleCase, generatePassId } from "./utils";

export const DEFAULT_PARTICIPANT: ParticipantPassData = {
  name: "Alex Morgan",
  team: "CyberCraft",
  teamId: "CC-042",
  track: 0,
  role: "Team Leader",
  ideaTitle: "Autonomous multi-agent code orchestration",
  github: "alexmorgan",
  passId: "#NW-7701A",
  seed: 770142,
  mascotId: DEFAULT_MASCOT_ID,
};

export interface FormValues {
  name: string;
  team: string;
  teamId: string;
  track: number;
  role?: string;
  ideaTitle: string;
  github: string;
  number?: number;
}

/**
 * Resolves participant data for rendering.
 * If unlocked, uses current form values with title-cased name and email-derived stable pass ID.
 * If not unlocked, returns the default placeholder participant (with selected mascot).
 */
export function resolveParticipantData(
  isUnlocked: boolean,
  formValues: FormValues,
  email: string,
  mascotId: MascotId = DEFAULT_MASCOT_ID
): ParticipantPassData {
  if (!isUnlocked) {
    return {
      ...DEFAULT_PARTICIPANT,
      mascotId,
    };
  }

  const { passId, seed } = generatePassId(email);

  return {
    name: toTitleCase(formValues.name.trim()),
    team: formValues.team.trim(),
    teamId: formValues.teamId.trim(),
    track: Math.max(0, Math.min(5, formValues.track || 0)),
    role: formValues.role?.trim() || "Member",
    ideaTitle: formValues.ideaTitle.trim(),
    github: formValues.github.replace(/^@+/, "").trim(),
    passId,
    seed,
    mascotId,
    number: formValues.number,
  };
}
