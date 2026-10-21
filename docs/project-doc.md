# Project Doc: Builder Pass Studio

Single source of truth for goals, scope, rules and acceptance criteria.
Fill every `TODO` before the first real build.

## 1. Goal

Give every registered participant of our hackathon a polished, personal, shareable **digital builder pass**. Participants post it on social media, which promotes the event and proves they are building.

Success looks like:
- A registered participant gets from landing on the page to a downloaded pass in under 60 seconds.
- Passes look good enough that people want to post them.
- Unregistered people cannot unlock a pass.

## 2. Event details (fill in)

| Field | Value |
|---|---|
| Event name | TODO |
| Short badge text (e.g. `ABC/HACK 26`) | TODO |
| Site URL | TODO |
| Dates and mode | TODO (e.g. `1–7 Nov 2026 · Online`) |
| Hashtags | TODO |
| Tracks (6) | TODO |
| Organiser | TODO |

## 3. Users

- **Participant:** registered, wants a pass fast, mostly on a phone.
- **Organiser:** maintains the registration list, wants to see passes shared.

## 4. Inspiration and legal approach

The feature is inspired by a public hackathon pass page we studied. We follow a **clean-room** approach:
- We copy the idea and the user experience, never their code, artwork, mascots, fonts or wording.
- All visuals, mascots and text are ours.
- Research rules are in `reverse-engineering.md`.

## 5. Features

### 5.1 Email unlock
- Input for the registered email and a "Find me" button. Enter key also submits.
- On success, show a green status line: `✓ Found you — {role} of {team} · {members} member(s)`.
- Autofill name, team, team ID and track. Name, team and team ID become **read-only** with a dashed border.
- On failure, show a generic message: "No registration found for that email. Use the email you registered with."
- Until unlocked, the form fields are disabled.

### 5.2 Editable fields
- Idea title (max 60 chars), GitHub username (strip a leading `@`), track select (6 options).

### 5.3 Mascot picker
- 8 named mascots shown as tiles, one selected at a time. Names: Nova, Byte, Oracle, Forge, Pixel, Helix, Atlas, Glitch.
- Each mascot uses high-resolution pre-rendered character assets with normalized head sizes and baselines, transparent backgrounds, and character-specific color themes. Preloaded asynchronously and cached in memory.

### 5.4 Style picker
- 4 layouts: **Editorial**, **Night**, **Pop**, **Collector**. Tiles show a live thumbnail with the participant's real details.

### 5.5 Sizes (tabs above the preview)
| Tab | Size | Use |
|---|---|---|
| The pass | 1080×1350 | Main download |
| Square | 1080×1080 | Feed posts |
| Link | 1200×630 | Link previews |
| Story | 1080×1920 | Stories |

Non-pass sizes show the pass tilted on a coloured background with the headline `I'm building at {event}` and the site plus dates underneath.

### 5.6 Actions
- **Download PNG:** current size.
- **All sizes:** downloads all four, one after another.
- **Copy image:** clipboard PNG, with a clear fallback message when unsupported.
- **Copy caption:** event, idea, team, track, GitHub link, dates, site and hashtags.

### 5.7 Pass content
Event badge, participant name (title-cased), idea title, track, team and team ID, GitHub handle, mascot, a short pass ID derived from the email, and the site URL.

## 6. Architecture

- **UI:** one client component page; state for form, mascot, style, size, lookup status.
- **Rendering:** Canvas 2D draws the pass from a 1080×1350 base. Other sizes scale and tilt that card. Export uses an offscreen canvas so the preview is never disturbed.
- **Mascots:** `lib/mascots/manifest` and `lib/mascotImage` manage high-resolution pre-rendered character assets (`public/mascots/*.png`) with head/baseline normalization, theme colors, and async preloading. No runtime 3D library is loaded.
- **Config:** `lib/config` holds all event text, tracks and sizes.
- **API:** `POST /api/lookup` reads `data/registrations.json`.

### API contract

Request:
```json
{ "email": "person@example.com" }
```

Response when found (never includes the email):
```json
{ "found": true, "name": "…", "team": "…", "teamId": "…", "track": 2, "role": "Team Leader", "members": 2, "idea": "optional" }
```

Response when not found: `{ "found": false }` with HTTP 200 and the same timing as a hit.
Response when rate limited: HTTP 429 `{ "error": "Too many tries. Wait a minute." }`.

### Registration record
```json
{ "email": "…", "name": "…", "team": "…", "teamId": "…", "track": 0, "role": "Team Leader | Member", "members": 1 }
```

## 7. Design principles

- Mobile first. Everything works at 375px.
- One clear primary action: Download PNG.
- The preview updates instantly as the user types.
- Visible focus states, labels on every input, sufficient contrast, respects light and dark mode.
- Passes must stay readable with long names and long idea titles (truncate with an ellipsis, never overflow).
- No layout shift when the status line changes.

## 8. Privacy and security rules

- The lookup returns only what the pass needs.
- Rate-limit the lookup endpoint (default 10 requests per minute per IP). Use a shared store if deployed on several servers.
- Use the same generic message for every miss. Do not reveal whether an email exists in any other way.
- Never log full emails in production.
- Registration data is never committed to the repo, never sent to the client in bulk and never exposed through any endpoint that lists records.
- Pass images are generated in the browser. We do not upload them anywhere.

## 9. Non-goals (for now)

- Accounts or login beyond the email lookup.
- Storing generated passes on a server.
- Landscape-specific layouts for Link (use the tilted portrait pass first).
- Admin dashboard.

## 10. Milestones

1. Config, API route, lookup UI with autofill and read-only fields.
2. Canvas pass renderer with the four layouts.
3. Size tabs and tilted backgrounds.
4. 3D mascots and tiles.
5. Download, All sizes, Copy image, Copy caption.
6. Polish: responsive layout, accessibility, edge cases.
7. Optional: landscape Link layout, custom mascot art, fonts, real database.

## 11. Acceptance criteria

- [ ] Registered email unlocks the form and autofills the right fields; unregistered email does not.
- [ ] Read-only fields cannot be edited.
- [ ] All 8 mascots and 4 styles render with no console errors.
- [ ] All 4 sizes export correct pixel dimensions.
- [ ] Copy image works in Chrome, with a clear message elsewhere.
- [ ] Long names, long idea titles and missing GitHub handle do not break layouts.
- [ ] Works at 375px and at desktop width, light and dark.
- [ ] `npm run build` and `npm run lint` pass.
- [ ] No third-party code, art, fonts or copy used.

## 12. Open questions (fill in)

- TODO: Where does the real registration list come from (sheet, form, database)?
- TODO: Do we need check-in QR codes on the pass?
- TODO: Do we collect the participant's social post link after they share?