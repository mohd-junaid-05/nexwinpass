import assert from "assert";
import { generateCertificateId } from "../lib/certificates/id";
import { CERTIFICATE_TEMPLATES } from "../lib/certificates/config";
import { sanitizeFilename } from "../lib/pass/export";

process.env.CERTIFICATE_SECRET = "test-secret-key-1234567890";

console.log("=== Testing Phase 9 Logic & Edge Cases ===");

// 1. Test Certificate ID stability and uniqueness
const p1 = { name: "Abdul Raouf", teamId: "DC-001" };
const p2 = { name: "Carol Johansson-Aleksandrović-Worthington", teamId: "QA-005" };
const p3 = { name: "आरव शर्मा", teamId: "CS-006" };

const id1_a = generateCertificateId("participation", p1);
const id1_b = generateCertificateId("participation", p1);
assert.strictEqual(id1_a, id1_b, "Same participant must produce identical ID");
assert.ok(id1_a.startsWith("NW-PART-"), "Participation ID prefix check");

const comp_id1 = generateCertificateId("completion", p1);
assert.ok(comp_id1.startsWith("NW-COMP-"), "Completion ID prefix check");
assert.notStrictEqual(id1_a, comp_id1, "Different certificate types must produce different IDs");

const id2 = generateCertificateId("participation", p2);
assert.notStrictEqual(id1_a, id2, "Different participants must produce different IDs");

const id3 = generateCertificateId("participation", p3);
assert.ok(id3.startsWith("NW-PART-"), "Devanagari name ID generation check");

console.log("✓ Certificate ID stability and uniqueness tests passed.");

// 2. Test Safe Filenames
assert.strictEqual(
  sanitizeFilename("Carol Johansson-Aleksandrović-Worthington"),
  "carol-johansson-aleksandrovic-worthington",
  "Accents and hyphens sanitized"
);
assert.strictEqual(
  sanitizeFilename("आरव शर्मा", "builder"),
  "builder",
  "Fallback for non-Latin script filename"
);
console.log("✓ Filename sanitization tests passed.");

// 3. Test Graceful Fallback on missing secret & Strict Mode
delete process.env.CERTIFICATE_SECRET;
const fallbackId = generateCertificateId("participation", p1);
assert.ok(fallbackId.startsWith("NW-PART-"), "Fallback ID generated gracefully without crashing");

// In strict mode, verify loud failure
process.env.STRICT_CERTIFICATE_SECRET = "true";
let failedLoudly = false;
try {
  generateCertificateId("participation", p1);
} catch (err: unknown) {
  if (err instanceof Error && err.message.includes("CERTIFICATE_SECRET environment variable is missing")) {
    failedLoudly = true;
  }
}
delete process.env.STRICT_CERTIFICATE_SECRET;
assert.strictEqual(failedLoudly, true, "App must fail loudly if secret is missing in strict mode");
console.log("✓ Fallback behavior and strict missing secret tests passed.");

// 4. Test Template Configs
assert.ok(CERTIFICATE_TEMPLATES.participation, "Participation template exists");
assert.ok(CERTIFICATE_TEMPLATES.completion, "Completion template exists");
assert.strictEqual(CERTIFICATE_TEMPLATES.participation.width, 2000);
assert.strictEqual(CERTIFICATE_TEMPLATES.participation.height, 1414);
assert.strictEqual(CERTIFICATE_TEMPLATES.completion.width, 2000);
assert.strictEqual(CERTIFICATE_TEMPLATES.completion.height, 1414);
assert.strictEqual(CERTIFICATE_TEMPLATES.participation.backgroundPath, "/certificates/participation.png");
assert.strictEqual(CERTIFICATE_TEMPLATES.completion.backgroundPath, "/certificates/completion.png");
console.log("✓ Template definitions and real 2000x1414 dimensions verified.");

console.log("\nALL CERTIFICATE UNIT TESTS PASSED SUCCESSFULLY! 🎉");
