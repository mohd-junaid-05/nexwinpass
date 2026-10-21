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
- 4 distinct landscape looks:
  - **Editorial:** Warm tinted paper, large bold mascot theme arch shape behind character, big refined display serif name with deliberate layered character depth (character stands in front of part of the name), idea title in an italic accent voice, and a perforated ticket stub with QR code.
  - **Night:** Deep obsidian card with a lit stage: spotlight in the mascot's glow colour, soft floor reflection under the character, mascot's world pattern fading in from edge, wide geometric sans for the name (Syne), and monospaced voice for labels.
  - **Pop:** Saturated full-bleed colour world with layered gradients, oversized tightly stacked heavy name (Anton), idea on a tilted tape/ticket label, character breaking out of a rotated rounded-square frame, and a circular rubber-stamp mark with seeded rotation.
  - **Collector:** Dark trading-card look with a themed foil frame derived from the mascot's theme palette, standalone character card panel, clean information column, techy display type (Sora), and a true serial line.

### 5.5 Sizes (tabs above the preview)
| Tab | Size | Use | Base Layout |
|---|---|---|---|
| The pass | 1920×1080 | Main download | Landscape base |
| Link | 1200×630 | Link previews | Landscape base (with bleed) |
| Square | 1080×1080 | Feed posts | Vertical base |
| Story | 1080×1920 | Stories | Vertical base |
| Avatar | 1080×1080 | Profile avatars | Inscribed circle bust crop |

Every pass features an authentic perforated ticket stub area holding a verified scannable QR code (public URL + pass ID only), true registration serial ("No. 042" if number exists, else derived pass ID), and admission line.

### 5.6 Actions
- **Download PNG:** current size.
- **All sizes:** downloads all five sequentially.
- **Copy image:** clipboard PNG, with a clear fallback message when unsupported.
- **Copy caption:** event, idea, team, track, GitHub link, dates, site and hashtags.
- **Copy alt text:** accessible pass description for screen reader users.

### 5.7 Pass content
Event badge, participant name (title-cased), idea title, track (with geometric mark), team and team ID, role badge, GitHub handle, mascot, true serial line, scannable QR code, and site URL.

## 6. Architecture

- **UI:** client component studio page; state for form, mascot, style, size, lookup status. Live preview stage with pointer 3D tilt, light sheen, and landscape thumbnail tiles.
- **Rendering:** Pure 2D Canvas with a two-base layout architecture:
  - Landscape Base: for "The pass" (1920×1080) and "Link" (1200×630 with bleed).
  - Vertical Base: for "Square" (1080×1080) and "Story" (1080×1920).
  - Avatar: centered circular bust crop (1080×1080).
- **Mascots:** `lib/mascots/manifest` and `lib/mascotImage` manage pre-rendered character assets (`public/mascots/*.png`) with head/baseline normalization, theme colors, and async preloading.
- **Patterns:** `lib/pass/patterns` generates 8 signature vector world patterns in code, deterministically seeded per pass ID.
- **Ticket Stubs:** `lib/pass/stub` draws perforated tear notches, dashed cut lines, quiet-zone QR pads, and true serial lines.
- **Config:** `lib/config` holds all event text, tracks, sizes, and safe zones.
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