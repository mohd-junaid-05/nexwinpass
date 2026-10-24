import crypto from "crypto";

/**
 * Returns the secret used to sign deterministic certificate IDs.
 * Fails loudly with an explicit error if the secret is missing.
 */
export function getCertificateSecret(): string {
  const secret = process.env.CERTIFICATE_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "FATAL: CERTIFICATE_SECRET environment variable is missing or empty. " +
        "Please define CERTIFICATE_SECRET in your environment or .env.local file. " +
        "See .env.example for guidance."
    );
  }
  return secret;
}

/**
 * Computes a deterministic, tamper-evident certificate ID on the server
 * from the participant's details and the secret key.
 * 
 * Rules:
 * - Email is NEVER included in the certificate ID.
 * - The same participant always receives the exact same ID for a given certificate type.
 * - Different participants receive distinct IDs.
 * - Format: NW-PART-XXXX-XXXX or NW-COMP-XXXX-XXXX.
 */
export function generateCertificateId(
  type: "participation" | "completion",
  participant: { name: string; teamId: string }
): string {
  const secret = getCertificateSecret();
  const normalizedName = participant.name.trim().toLowerCase();
  const normalizedTeamId = (participant.teamId || "SOLO").trim().toUpperCase();

  const payload = `nexwin:certificate:v1:${type}:${normalizedTeamId}:${normalizedName}`;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .toUpperCase();

  const prefix = type === "participation" ? "NW-PART" : "NW-COMP";
  const code1 = digest.slice(0, 4);
  const code2 = digest.slice(4, 8);

  return `${prefix}-${code1}-${code2}`;
}
