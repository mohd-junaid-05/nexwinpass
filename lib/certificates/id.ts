import crypto from "crypto";

const FALLBACK_CERTIFICATE_SECRET = "nexwin-builder-cert-deterministic-secret-2026";

/**
 * Returns the secret used to sign deterministic certificate IDs.
 * Uses CERTIFICATE_SECRET from the environment if present.
 * If missing, falls back to a deterministic seed with a warning so
 * production deployments (like Vercel) never crash with a 500 error.
 */
export function getCertificateSecret(): string {
  const secret = process.env.CERTIFICATE_SECRET?.trim();
  if (!secret) {
    if (process.env.STRICT_CERTIFICATE_SECRET === "true") {
      throw new Error(
        "FATAL: CERTIFICATE_SECRET environment variable is missing or empty. " +
          "Please define CERTIFICATE_SECRET in your environment or .env.local file. " +
          "See .env.example for guidance."
      );
    }
    console.warn(
      "[WARN] CERTIFICATE_SECRET environment variable is missing or empty. " +
        "Using fallback deterministic seed. For production security, configure CERTIFICATE_SECRET in Vercel Project Settings."
    );
    return FALLBACK_CERTIFICATE_SECRET;
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
