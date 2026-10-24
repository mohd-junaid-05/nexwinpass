import assert from "assert";
import fs from "fs";
import { CERTIFICATE_TEMPLATES } from "../lib/certificates/config";
import { resolveFieldValue } from "../lib/certificates/render";
import type { ParticipantCertificateData } from "../lib/certificates/types";

const registrations = JSON.parse(fs.readFileSync("data/registrations.json", "utf-8"));

console.log("=== Testing All Registrations & Complex Scripts ===");

for (const reg of registrations) {
  const data: ParticipantCertificateData = {
    name: reg.name,
    team: reg.team,
    teamId: reg.teamId,
    track: reg.track,
    role: reg.role,
    certificateId: "NW26-TEST-1234",
    projectName: "Test Project",
  };

  // Test Participation template fields
  const partTpl = CERTIFICATE_TEMPLATES.participation;
  for (const field of partTpl.fields) {
    const val = resolveFieldValue(field, data, partTpl);
    assert.ok(val.length > 0, `Participation field ${field.id} must resolve non-empty for ${reg.name}`);
    assert.ok(!val.includes("{{"), `Field ${field.id} must not contain raw brackets for ${reg.name}: ${val}`);
    assert.ok(!val.includes("undefined"), `Field ${field.id} must not contain undefined for ${reg.name}`);
  }

  // Test Completion template fields
  const compTpl = CERTIFICATE_TEMPLATES.completion;
  for (const field of compTpl.fields) {
    const val = resolveFieldValue(field, data, compTpl);
    assert.ok(val.length > 0, `Completion field ${field.id} must resolve non-empty for ${reg.name}`);
    assert.ok(!val.includes("{{"), `Field ${field.id} must not contain raw brackets for ${reg.name}: ${val}`);
    assert.ok(!val.includes("undefined"), `Field ${field.id} must not contain undefined for ${reg.name}`);
  }
}

console.log(`✓ All ${registrations.length} registrations tested cleanly (Latin, Devanagari, Telugu, Arabic)!`);
