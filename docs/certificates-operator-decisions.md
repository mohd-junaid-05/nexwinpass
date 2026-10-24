# Operator Decisions — Phase 9 (Certificates)

Date: 2026-10-24
Status: Approved by Operator

This document records the operator's answers to the Phase 9 configuration and eligibility questions before implementation.

---

### Question 1: Who gets the Participation certificate?
**Decision:** Every registered person in the registration list.
**Rationale:** Anyone who signed up and joined the NEXWIN hackathon receives a participation certificate recognizing their involvement in the internal hackathon.

---

### Question 2: Who gets the Completion certificate?
**Decision:** Teams that completed the final submission and presentation (controlled by the `completion` boolean flag in the registration/hackathondata).
**Rationale:** The completion certificate is an earned achievement reserved for teams that submitted their project deliverables and presented to the review team at NEXWIN Finals.

---

### Question 3: Does each team member get their own certificate, with their own name?
**Decision:** Yes, each member gets an individual certificate with their own personal name.
**Rationale:** Individual certificates provide personal recognition for portfolios, resumes, and social sharing.

---

### Question 4: Is an email alone enough to download a certificate, or should team ID verification be required?
**Decision:** Email alone by default, with an optional team ID verification setting (`REQUIRE_TEAM_ID` environment variable) that is off (`false`) by default.
**Rationale:** Provides an easy, low-friction unlock experience by default, while supporting higher security mode if required by the event organizers. When enabled, a mismatch gives the same generic error as an unknown email.

---

### Question 5: Which details appear on the certificates?
**Decision:** 
- Participant's Name (prominently displayed)
- Team Name
- Track Name
- Role (Team Leader / Member)
- Event Name & Dates ("NEXWIN 2026", "19–24 Oct 2026 · Online")
- Organizer ("Nexus Coding Club")
- Certificate ID (deterministic, tamper-evident verification code)

---

### Question 6: Output Formats
**Decision:** PNG only (no PDF needed).
**Rationale:** The operator specified that participants will download crisp, full-resolution PNG certificates (identical to the pass workflow). No third-party PDF library or dependencies required.

---

## Phase 10 Decisions (Real Templates & Placeholder Calibration)

Date: 2026-10-24
Status: Approved by Operator

### Question 7: Participation Top-Left Badge Box
**Decision:** Render the participant's hackathon role (`TEAM LEADER` or `MEMBER`) in uppercase, matching the template placeholder `{{participant_role}}` exactly.

### Question 8: Completion Project Name Slot (`{{project_name}}`)
**Decision:** Allow the participant to enter their project name directly in the UI (just like the idea field in the Pass Studio) with live canvas preview updates. Default to the lookup idea or "their project" if left blank.

### Question 9: Certificate ID Canvas Placement
**Decision:** Keep the Certificate ID off the visual certificate canvas to preserve the authentic graphic artwork of the official templates (`1.png` and `2.png`), while keeping it prominently displayed in the UI tag and copied social caption.

### Question 10: Dummy Template Assets
**Decision:** Delete the dummy sample certificates (`public/certificates/dummy/*`) and dummy generator script (`tools/certificates/generate_dummy_certificates.py`) now that the real templates are active.

