# Phase 10 — Final Certificates (Real Templates & Placeholder Replacement)

## Goal
A participant opens the Certificates tab, enters the email they registered with, and gets their Participation or Completion certificate generated directly from the real templates in the `certificateTemplate/` folder[cite: 1, 2]. When a certificate is requested, the system takes the corresponding template image and updates **only** the designated placeholders with the participant's actual data[cite: 1, 2]. All other static content, text, dates, signatures, and graphics on the template must remain completely untouched[cite: 1, 2].

Read `AGENTS.md`, `project-doc.md`  and this file. Where this file is more specific, this file wins.


## Build
- **Inspect the templates.** Read the images in `certificateTemplate/` to get their exact pixel dimensions (`width` and `height`) and locate the exact coordinates of every placeholder[cite: 1, 2]:
  - **Participation certificate:**
    - `{ID}` and `{TEAM ID}` inside the top-left badge box[cite: 1].
    - Participant name slot (`MOHD JUNAID`) below `"This certificate is proudly presented to"`[cite: 1].
    - `{team name}`, `{track label}`, and `{track name}` inside the body text (`"has participated in NEXWIN 2026, an online hackathon organized by Nexus Coding Club, as part of team {team name} in {track label}: {track name}."`)[cite: 1].
  - **Completion certificate:**
    - Participant name slot (`MOHD JUNAID`) below `"this certificate is proudly awarded to"`[cite: 2].
    - `{team name}` and `{track label}` inside the body text (`"has successfully completed NEXWIN 2026, an online hackathon organized by Nexus Coding Club, by building and presenting a working project as part of team {team name} in {track label}."`)[cite: 2].
- **Update the template config.** In `lib/certificates/config.ts`, point the Participation and Completion templates to the real image paths in `public/certificates/` and set their exact pixel dimensions.
- **Map placeholder coordinates only.** Define field boxes in `lib/certificates/config.ts` strictly for the placeholders listed above[cite: 1, 2]. If the raw template images still contain the literal placeholder words (`MOHD JUNAID`, `{team name}`, etc.) in the image pixels[cite: 1, 2], mask only those specific regions with the matching background color before drawing the dynamic text so the old placeholder text does not show through.
- **Calibrate positions.** Use the development placement overlay to align every bounding box (`x`, `y`, `width`, `height`), font size, weight, color, and alignment so the dynamic text fits seamlessly into the template[cite: 1, 2].
- **Remove dummy files.** Delete the dummy watermarked images (`public/certificates/dummy/*`) and any dummy generator scripts.
- **Enable for production.** Set `IS_CERTIFICATES_ENABLED = true` in `lib/certificates/config.ts` so the Certificates tab is active in production.

## Constraints
- **Update placeholders only.** Do not alter, cover, or redraw any non-placeholder content on the template. Static text (`"grants and certifies this certificate on"`[cite: 1], `"Certificate of Participation"`[cite: 1], `"Certificate of Completion"`[cite: 2], `"PRESIDENT"`[cite: 1, 2], `"24-10-2026"`[cite: 1, 2], `"DATE"`[cite: 1, 2]), signatures[cite: 1, 2], logos[cite: 1, 2], borders[cite: 1, 2], and the trophy graphic[cite: 2] must remain untouched.
- **Templates are pure configuration.** Do not hardcode coordinates inside `lib/certificates/render.ts` unless adding an optional background mask property to the template field definition.
- **Fit the text, always.** Long names, long team names, and names in Devanagari, Telugu, and Arabic scripts must shrink to fit their bounding box down to the minimum font size, wrap within allowed lines, or truncate with an ellipsis without overflowing or colliding with surrounding static text.
- **Exact export output.** Downloaded PNG/PDF files must match the live preview at the template's exact native resolution, with no development overlay or watermarks.

## Acceptance check
1. The operator questions at the top are answered and recorded in `docs/certificates-operator-decisions.md`.
2. `IS_CERTIFICATES_ENABLED` is `true`, and the Certificates tab is visible in a production build.
3. Unlocking a participant eligible for both certificates shows both real templates with only the placeholder slots (`{ID}`, `{TEAM ID}`, participant name, `{team name}`, `{track label}`, `{track name}`) filled with the participant's data[cite: 1, 2].
4. No literal `{...}` bracket text or `"MOHD JUNAID"` sample text is visible beneath or beside the rendered participant data[cite: 1, 2].
5. All static template elements (headers, `"PRESIDENT"` signature, `"24-10-2026"` date, logos, and background artwork) remain completely unchanged[cite: 1, 2].
6. The longest name and team name in `data/registrations.json`, plus Devanagari, Telugu, and Arabic script names, fit cleanly inside their boxes without overflowing or overlapping static text.
7. In development mode, the placement overlay boxes align cleanly with the template's placeholder areas. In production (`npm run build`), the overlay is completely absent.
8. Downloading each certificate outputs a sharp file matching the template's exact pixel dimensions with a safe filename (`NEXWIN-participation-{name}.png`).
9. `npm run build` and `npm run lint` pass with zero errors or warnings.

## Not in this phase
- Changing any static wording, dates, signatures, or graphics baked into the template images[cite: 1, 2].
- Modifying the Pass tab, pass designs, or lookup/rate-limit rules.
- Emailing certificates or building a public certificate verification page.