import { FONTS, TRACK_DETAILS } from "@/lib/config";
import type { CertificateTemplate, CertificateType } from "./types";

/**
 * Switch controlling whether the Certificates tab is visible.
 *
 * Rules:
 * - Off in production by default until Phase 10 is finished.
 * - On in development and preview environments.
 * - Can be explicitly overridden via NEXT_PUBLIC_ENABLE_CERTIFICATES.
 */
export const IS_CERTIFICATES_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_CERTIFICATES !== "false";

/**
 * Optional second check setting: requires team ID matching in addition to email.
 * Off by default per Operator Decision 4.
 */
export const IS_REQUIRE_TEAM_ID_ENABLED =
  process.env.NEXT_PUBLIC_REQUIRE_TEAM_ID === "true";

/**
 * Support text configuration for certificates.
 */
export const CERTIFICATE_SUPPORT = {
  helpPrompt: "Questions about your certificate or eligibility?",
  channelName: "Discord #help-desk",
  contactUrl: "https://discord.gg/nexuscodingclub",
  supportEmail: "nexus@mjcollege.ac.in",
};

/**
 * Resolves human-readable track name from track number or index.
 */
export function getTrackTitle(trackNumber: number): string {
  const detail = TRACK_DETAILS.find((t) => t.id === trackNumber);
  if (detail) return `${detail.label}: ${detail.name}`;
  return TRACK_DETAILS[0] ? `${TRACK_DETAILS[0].label}: ${TRACK_DETAILS[0].name}` : "Track";
}

/**
 * Declarative Certificate Templates (Single Source of Truth).
 * Sourced directly from real high-resolution graphic templates in public/certificates/
 * (2000×1414 landscape, A4 ratio).
 */
export const CERTIFICATE_TEMPLATES: Record<CertificateType, CertificateTemplate> = {
  participation: {
    id: "participation",
    title: "Certificate of Participation",
    badgeLabel: "PARTICIPATION",
    description: "Awarded to every registered builder who joined NEXWIN 2026.",
    ineligibleReason:
      "Participation certificates are issued to registered participants who joined the NEXWIN hackathon.",
    width: 2000,
    height: 1414,
    backgroundPath: "/certificates/participation.png",
    hasCertificateId: false,
    fields: [
      {
        id: "part-role",
        dataKey: "role",
        box: { x: 75, y: 298, width: 400, height: 50 },
        mask: { color: "#1F2636" },
        align: "center",
        fontFamily: FONTS.sansFacts,
        weight: "600",
        color: "#FFFFFF",
        largestSize: 24,
        smallestSize: 16,
        maxLines: 1,
        casing: "upper",
        label: "PARTICIPANT ROLE (BADGE)",
      },
      {
        id: "part-name",
        dataKey: "name",
        box: { x: 650, y: 708, width: 1050, height: 110 },
        mask: { color: "#0D1426" },
        align: "center",
        fontFamily: FONTS.sansFacts,
        weight: "700",
        color: "#FFFFFF",
        largestSize: 66,
        smallestSize: 32,
        maxLines: 1,
        casing: "upper",
        label: "PARTICIPANT NAME",
      },
      {
        id: "part-body",
        dataKey: "body",
        box: { x: 650, y: 840, width: 1050, height: 235 },
        mask: { color: "#0D1426" },
        align: "left",
        fontFamily: FONTS.sansFacts,
        weight: "500",
        color: "#FFFFFF",
        largestSize: 36,
        smallestSize: 22,
        maxLines: 4,
        casing: "as-is",
        label: "CITATION BODY",
      },
    ],
  },

  completion: {
    id: "completion",
    title: "Certificate of Completion",
    badgeLabel: "COMPLETION",
    description:
      "Awarded to builders whose teams made the final project submission and presented at NEXWIN Finals.",
    ineligibleReason:
      "Completion certificates are issued to teams that made a final submission and presented at NEXWIN Finals.",
    width: 2000,
    height: 1414,
    backgroundPath: "/certificates/completion.png",
    hasCertificateId: false,
    fields: [
      {
        id: "comp-name",
        dataKey: "name",
        box: { x: 80, y: 712, width: 1150, height: 105 },
        mask: { sliceY: 700, sliceHeight: 4 },
        align: "left",
        fontFamily: FONTS.certificateBrush,
        weight: "normal",
        color: "#FFFFFF",
        largestSize: 66,
        smallestSize: 32,
        maxLines: 1,
        casing: "upper",
        label: "RECIPIENT NAME",
      },
      {
        id: "comp-body",
        dataKey: "body",
        box: { x: 80, y: 845, width: 1335, height: 175 },
        mask: { sliceY: 835, sliceHeight: 4 },
        align: "left",
        fontFamily: FONTS.sansFacts,
        weight: "500",
        color: "#FFFFFF",
        largestSize: 35,
        smallestSize: 20,
        maxLines: 3,
        casing: "as-is",
        label: "CITATION BODY",
      },
    ],
  },
};
