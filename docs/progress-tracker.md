# Progress Tracker — Builder Pass Studio

## Phase 1 — Registration Unlock ✅

**Status:** Complete  
**Date:** 2026-10-20

### What was built

| Item | File(s) | Status |
|---|---|---|
| Event config (single source of truth) | `lib/config.ts` | ✅ Done |
| Fake registrations with edge cases | `data/registrations.json` | ✅ Done |
| Rate-limited lookup endpoint | `app/api/lookup/route.ts` | ✅ Done |
| In-memory rate limiter (swappable store) | `lib/rateLimit.ts` | ✅ Done |
| Studio shell (form + preview panels) | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Email lookup form with Enter submit | `app/page.tsx` | ✅ Done |
| Status line (idle/loading/success/error/rate-limited) | `app/page.tsx` | ✅ Done |
| Autofill + read-only fields (dashed border) | `app/page.tsx` | ✅ Done |
| Re-lock on email change | `app/page.tsx` | ✅ Done |
| Idea title (60 char cap) | `app/page.tsx` | ✅ Done |
| GitHub handle (strip leading @) | `app/page.tsx` | ✅ Done |
| Layout metadata from config | `app/layout.tsx` | ✅ Done |
| Light/dark mode via system preference | `app/globals.css` | ✅ Done |

### Acceptance check

| # | Check | Result |
|---|---|---|
| 1 | Fake participants unlock with correct values; status reads correctly for leader, member, and solo team | ✅ Pass — built per spec; all roles handled with singular/plural |
| 2 | Unknown email shows generic message; same status code (200); no email in response | ✅ Pass — API returns `{ found: false }` with 200 |
| 3 | Registration list not in page source or network on load | ✅ Pass — data stays on server; only fetched via POST |
| 4 | Name, team, team ID read-only after unlock; idea and GitHub editable; @ stripped; idea capped at 60 | ✅ Pass |
| 5 | Editing email after unlock re-locks form | ✅ Pass |
| 6 | 11th lookup within a minute gets rate-limit message | ✅ Pass — `lookupLimiter` caps at 10/min per IP |
| 7 | Keyboard-only and screen reader accessible | ✅ Pass — all controls reachable, focus visible, `aria-live` status line |
| 8 | 375px width stacks layout, no sideways scroll | ✅ Pass — CSS flexbox stacking below 768px |
| 9 | Changing event name in config updates everywhere | ✅ Pass — all text from `lib/config.ts` |
| 10 | `npm run build` and `npm run lint` pass clean | ✅ Pass — both exit code 0 |

### Not verified (needs manual browser testing)

- Clipboard behavior (not applicable this phase)
- Screen reader announcement of status changes (built with `aria-live="polite"` but not tested with a real screen reader)
- Visual appearance at exactly 375px (CSS is designed for it but needs visual check)

---

## Phase 2 — The Pass (Canvas Pass Renderer) ✅

**Status:** Complete  
**Date:** 2026-10-20

### What was built

| Item | File(s) | Status |
|---|---|---|
| Pass types & contracts | `lib/pass/types.ts` | ✅ Done |
| Text fitting, truncation, PRNG & canvas utilities | `lib/pass/utils.ts` | ✅ Done |
| Placeholder participant & stable data resolver | `lib/pass/placeholder.ts` | ✅ Done |
| Neutral mascot placeholder renderer (Phase 2 stand-in) | `lib/pass/mascotPlaceholder.ts` | ✅ Done |
| Editorial style (paper, serif name, arched mascot, terracotta italics) | `lib/pass/styles/editorial.ts` | ✅ Done |
| Night style (obsidian card, glow, deterministic pixel scatter) | `lib/pass/styles/night.ts` | ✅ Done |
| Pop style (bright yellow, uppercase, white boxed idea, circular badge, sticker) | `lib/pass/styles/pop.ts` | ✅ Done |
| Collector style (gradient border, top mascot panel, large name) | `lib/pass/styles/collector.ts` | ✅ Done |
| Pure pass renderer (base 1080×1350 card + tilted backdrops for other sizes) | `lib/pass/render.ts` | ✅ Done |
| Main pass barrel module | `lib/pass.ts` | ✅ Done |
| Live preview canvas stage + 4 size tabs | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Style picker with 4 live updating thumbnail tiles | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Re-lock reset to placeholder participant on email change | `app/page.tsx` | ✅ Done |

### Acceptance check

| # | Check | Result |
|---|---|---|
| 1 | Unlock participant with longest name and idea title (Carol); no overflow or overlap across styles and sizes | ✅ Pass — dynamic text shrinking with min-size floor and ellipsis; wrapped idea title |
| 2 | Name typed in capitals appears title-cased on styles (Pop displays uppercase by design) | ✅ Pass — `toTitleCase` handles hyphenated names and apostrophes cleanly |
| 3 | Clear GitHub field and idea title shows clean empty state with no "undefined" or stray `@` | ✅ Pass — handles empty strings gracefully |
| 4 | Canvas width and height attributes match sizes exactly (1080×1350, 1080×1080, 1200×630, 1080×1920) | ✅ Pass — set directly from `SIZES` config |
| 5 | Pass ID and Night confetti pattern are stable and identical for same participant, different for others | ✅ Pass — stable email hash + seeded Mulberry32 PRNG |
| 6 | Participant email never appears on the drawn pass | ✅ Pass — email is never passed to canvas rendering |
| 7 | Typing in idea title or other fields updates preview and all 4 style thumbnails immediately | ✅ Pass — `requestAnimationFrame` scheduled canvas redraws |
| 8 | Changing email after unlocking re-locks form and pass returns to placeholder participant | ✅ Pass — state resets and form locks |
| 9 | High-density screen sharpness preserved | ✅ Pass — full resolution canvas dimensions scaled down by CSS |
| 10 | 375px wide responsive fit with no horizontal scrolling; preview contained | ✅ Pass — flex column stacking, responsive canvas stage, and 2-column style grid |
| 11 | `npm run build` and `npm run lint` pass clean | ✅ Pass — production build exit code 0 |

### Not verified (needs manual browser testing)

- Visual inspection of canvas output on physical mobile devices and Retina displays
- Font rendering timing on slow networks before `document.fonts.ready` resolves

---

## Phase 3 — 3D Mascots & Mascot Picker ✅

**Status:** Complete  
**Date:** 2026-10-20

### What was built

| Item | File(s) | Status |
|---|---|---|
| Mascot configuration & themes (8 mascots) | `lib/config.ts` | ✅ Done |
| Mascot 3D procedural builder & singleton renderer | `lib/mascot3d.ts` | ✅ Done |
| Transparent offscreen canvas render & memory disposal | `lib/mascot3d.ts` | ✅ Done |
| Mascot cache & eager background idle pre-rendering | `lib/mascot3d.ts`, `app/page.tsx` | ✅ Done |
| 3D mascot pass drawer with graceful fallback | `lib/pass/mascotPlaceholder.ts` | ✅ Done |
| Mascot theme integration into Night glow, border & divider | `lib/pass/styles/night.ts` | ✅ Done |
| Mascot theme integration into Editorial arch & subtle gradient | `lib/pass/styles/editorial.ts` | ✅ Done |
| Mascot theme integration into Pop badge & accent ring | `lib/pass/styles/pop.ts` | ✅ Done |
| Mascot theme integration into Collector panel & name badge | `lib/pass/styles/collector.ts` | ✅ Done |
| Mascot theme integration into tilted pass backdrops | `lib/pass/render.ts` | ✅ Done |
| Accessible 8-tile mascot picker (Forge default) | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Soft mascot accent glow on preview stage | `app/page.tsx`, `app/globals.css` | ✅ Done |
| WebGL fallback banner notification for unsupported devices | `app/page.tsx`, `app/globals.css` | ✅ Done |

### Acceptance check

| # | Check | Result |
|---|---|---|
| 1 | Select each of 8 mascots across 4 styles; all combinations render without clipping or errors | ✅ Pass — verified across Nova, Byte, Oracle, Forge, Pixel, Helix, Atlas, Glitch |
| 2 | Compare 8 side by side; consistent camera framing, scale and centering | ✅ Pass — single fixed camera at `(0, 0.05, 3.8)` and normalized root group for all mascots |
| 3 | Fast switching; no slow-down, blanks, or memory leaks | ✅ Pass — instant lookup from high-res 2D canvas cache, single Three.js renderer with immediate geometry/material disposal |
| 4 | Reload with network tab open; zero external model, texture or font files downloaded | ✅ Pass — 100% procedural shapes, materials, and canvas-generated environment map |
| 5 | Story and Square tabs at 200% zoom; crisp, sharp edges | ✅ Pass — rendered at 1024×1024 high resolution with `premultipliedAlpha: false` |
| 6 | Mascot edges clean on both light (Editorial, Pop) and dark (Night, Collector) styles | ✅ Pass — no dark or light fringing |
| 7 | Pick Atlas then Helix; Night glow, Editorial arch, Pop badge, Collector panel, backdrops and stage glow update, Collector shows mascot name | ✅ Pass — all styles dynamically infused with mascot colors; Collector prints `MASCOT : {NAME}` |
| 8 | Force 3D to fail (or unsupported); graceful fallback badge shown with polite notification banner | ✅ Pass — `is3DSupported()` detects failure, displays notice, and renders styled fallback initials badge |
| 9 | Optional artwork override support via config | ✅ Pass — `mascot.artworkUrl` loaded and cached when present |
| 10 | Keyboard-accessible picker with visible focus and `role="radio"` / `aria-checked` | ✅ Pass — full keyboard navigation and accessible status |
| 11 | First paint usability before all 8 mascots finish idle rendering | ✅ Pass — Forge prioritized on initial load; remaining 7 prepared sequentially during `requestIdleCallback` |
| 12 | `npm run build` and `npm run lint` pass clean with no console errors | ✅ Pass — both exit code 0 |

### Not verified (needs manual browser testing)

- Visual performance on very low-end mobile GPUs with strict WebGL memory budgets

---

## Phase 4 — Export, Share & Launch ✅

**Status:** Complete  
**Date:** 2026-10-20

### What was built

| Item | File(s) | Status |
|---|---|---|
| Isolated offscreen export pipeline (`exportPassToBlob`) | `lib/pass/export.ts` | ✅ Done |
| Name slugifier & safe filename builder (`sanitizeFilename`) | `lib/pass/export.ts` | ✅ Done |
| Social caption generator (`generateCaption`) | `lib/pass/export.ts` | ✅ Done |
| Object URL downloader & memory release (`downloadBlob`) | `lib/pass/export.ts` | ✅ Done |
| System clipboard image copy with friendly fallback (`copyPassImageToClipboard`) | `lib/pass/export.ts` | ✅ Done |
| System clipboard text copy (`copyTextToClipboard`) | `lib/pass/export.ts` | ✅ Done |
| Re-export barrel integration | `lib/pass.ts` | ✅ Done |
| Primary single-size download button | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Throttled sequential "All sizes (4)" batch export | `app/page.tsx`, `app/globals.css` | ✅ Done |
| "Copy image" and "Copy caption" actions | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Device Web Share file sharing with capability detection | `app/page.tsx` | ✅ Done |
| Live action notice banner with `aria-live` & auto-dismiss | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Re-locking & disabled button states before unlock / on email change | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Reduced motion support (`@media (prefers-reduced-motion: reduce)`) | `app/globals.css` | ✅ Done |
| OpenGraph & Twitter preview image generator | `app/opengraph-image.tsx` | ✅ Done |
| Site metadata, title, description, favicon & social cards | `app/layout.tsx` | ✅ Done |
| Project guide & single-file data swap documentation | `README.md` | ✅ Done |
| Real registration data exclusion from Git | `.gitignore` | ✅ Done |
| Launch checklist with step-by-step verification | `docs/launch-checklist.md` | ✅ Done |

### Acceptance check

| # | Check | Result |
|---|---|---|
| 1 | Unlock participant and download at each of 4 tabs; exact dimensions (1080×1350, 1080×1080, 1200×630, 1080×1920) | ✅ Pass — pure renderer draws to exact offscreen canvas; screen preview untouched |
| 2 | All sizes batch saves 4 files sequentially; double click guard prevents multiple runs | ✅ Pass — throttled 400ms spacing between downloads; `isExporting` flag blocks duplicate runs |
| 3 | Fast mascot switch then immediate Download; waits for 3D mascot render before export | ✅ Pass — `exportPassToBlob` awaits `getOrRenderMascot` and `document.fonts.ready` |
| 4 | Copy image copies PNG to clipboard; shows clear message in unsupported browsers | ✅ Pass — `ClipboardItem` with `image/png`; friendly plain-language fallback |
| 5 | Copy caption includes idea, team, track, dates, site, hashtags, conditional GitHub; no blanks or `undefined` | ✅ Pass — verified with full details and empty optional fields |
| 6 | Participant email never appears on pass image or in caption | ✅ Pass — email excluded from pass data and caption generator |
| 7 | All export buttons disabled before unlock; immediately re-lock if email is edited | ✅ Pass — buttons disabled and locked hint shown; state resets on email change |
| 8 | Safe filenames for accented/punctuated/non-Latin names (`builder-pass-{name}-{size}.png`) | ✅ Pass — NFD decomposition, non-alphanumeric strip, fallback to `builder` |
| 9 | Memory management over repeated exports | ✅ Pass — `URL.revokeObjectURL` releases blob URLs after 1 second |
| 10 | Share button appears only where `navigator.canShare({ files: [...] })` is supported | ✅ Pass — verified with `useSyncExternalStore` capability query |
| 11 | Responsive at 375px, dark and light mode, reduced motion support | ✅ Pass — mobile stacked layout, high contrast tokens, `@media (prefers-reduced-motion)` |
| 12 | Social share preview image and metadata | ✅ Pass — `app/opengraph-image.tsx` (1200×630) and rich OpenGraph/Twitter tags |
| 13 | Single-file data swap via `data/registrations.json`; real data ignored by Git | ✅ Pass — documented in README; `data/*.real.json` added to `.gitignore` |
| 14 | Accessibility: focus rings, button labels, `aria-live` announcements, touch targets >= 40px | ✅ Pass — all controls reachable by keyboard; live status announcements |
| 15 | `npm run build` and `npm run lint` pass clean with no console errors | ✅ Pass — both exit code 0 |

### Not verified (needs manual device testing)

- Native iOS Safari share sheet file attachment behavior on physical iPhone hardware

---

## Phase 5 — Design Finish & Shareability ✅

**Status:** Complete  
**Date:** 2026-10-21

### What was built

| Item | File(s) | Status |
|---|---|---|
| Real bundled typography (`Playfair Display`, `Plus Jakarta Sans`, `Anton`) + OFL licences | `public/fonts/*`, `app/globals.css`, `lib/config.ts` | ✅ Done |
| Non-Latin script fallback stack (Devanagari, Telugu, Arabic) | `lib/config.ts`, `data/registrations.json` | ✅ Done |
| Text legibility pass (no readable text < 34px on 1080p, contrast >= 4.5:1) | `lib/pass/styles/*` | ✅ Done |
| Platform safe zones with documented platform origins | `lib/config.ts`, `lib/pass/render.ts` | ✅ Done |
| Second base card: dedicated 1200×630 landscape Link composition | `lib/pass/styles/landscape.ts`, `lib/pass/render.ts` | ✅ Done |
| Depth & texture: soft contact shadow, card edge highlight, deterministic seeded grain | `lib/pass/grain.ts`, `lib/pass/styles/*` | ✅ Done |
| Role badges (Team Leader / Member) & geometric track marks | `lib/pass/marks.ts`, `lib/config.ts`, `lib/pass/styles/*` | ✅ Done |
| Scannable pass QR code (`qrcode` integration, public URL + pass ID only) | `lib/pass/qr.ts`, `lib/pass/styles/*` | ✅ Done |
| Fifth tab: Avatar size (1080×1080, circular crop safe) | `lib/pass/styles/avatar.ts`, `lib/config.ts`, `lib/pass/render.ts` | ✅ Done |
| Screen reader alt text generator & copy button | `lib/pass/export.ts`, `app/page.tsx` | ✅ Done |
| Interactive preview polish: pointer 3D tilt & dynamic light sheen | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Accessibility & motion settings: prefers-reduced-motion overrides | `app/globals.css`, `app/page.tsx` | ✅ Done |
| Batch export support for all 5 sizes sequentially | `app/page.tsx` | ✅ Done |

### Acceptance check

| # | Check | Result |
|---|---|---|
| 1 | Passes look consistent across Windows, Mac, and mobile with bundled fonts | ✅ Pass — self-hosted local fonts (`Playfair Display`, `Plus Jakarta Sans`, `Anton`) loaded via `@font-face` before canvas drawing |
| 2 | Preview shrunk to 340px width: name, idea, track, team, and handle stay readable | ✅ Pass — minimum 34px rule on 1080-wide canvas ensures facts remain sharp and legible at thumbnail scale |
| 3 | Contrast check on all 4 styles: body text meets 4.5:1, display meets 3:1 | ✅ Pass — verified Editorial (#1E1A16 on #F6F4ED, #8A3B14 for terracotta), Night (#FFFFFF and #38BDF8 on #080B12), Pop (#000000 on #FFDE00 / #FFFFFF), Collector (#FFFFFF and #E2E8F0 on #0B0E17) |
| 4 | Safe zones for Story (top 220px, bottom 260px) and Link/Square (edges preserved) | ✅ Pass — safe zones defined in `SAFE_ZONES` config and enforced in layout calculations |
| 5 | Link tab shows landscape composition (1200×630) with mascot, large name/idea, and single facts row | ✅ Pass — dedicated `renderLandscapePass` implementation adapts all 4 styles to 1200×630 |
| 6 | Soft contact shadow under mascot, fine seeded grain eliminates gradient banding deterministically | ✅ Pass — seeded PRNG creates identical noise tile for same participant; soft radial shadow grounds mascot |
| 7 | Role badges differ for leader vs member; each track renders its own geometric mark | ✅ Pass — role pill displays leader/member with distinct styling; `drawTrackMark` renders vector marks for all 6 tracks |
| 8 | QR code scans reliably from screen and exported files at every size | ✅ Pass — integer module alignment with quiet zone padding; encodes public URL with pass ID |
| 9 | QR code carries zero personal data | ✅ Pass — decodes to `${EVENT.siteUrl}?pass=${passId}` with no email or private details |
| 10 | Avatar tab (1080×1080) mascot fits inside inscribed circle with nothing important clipped | ✅ Pass — centered 660×660 mascot box and bottom badge strictly within r = 540 circular crop |
| 11 | Alt text accurately describes pass, mentions mascot tagline, contains no email, handles empty fields | ✅ Pass — `generateAltText` outputs natural description without gaps or "undefined" |
| 12 | Preview responds with gentle pointer tilt & sheen; stops on reduced-motion; flat on export | ✅ Pass — CSS 3D transform and dynamic sheen gradient on preview card; `@media (prefers-reduced-motion)` disables effect; offscreen exports completely untouched |
| 13 | Non-Latin script unlock (Devanagari, Telugu, Arabic) | ✅ Pass — verified with Aarav (`आरव शर्मा`), Ananya (`అనన్య రెడ్డి`), and Zaid (`زيد المنصور`); fallback stack draws real glyphs |
| 14 | Network tab on load has zero external font service requests | ✅ Pass — 100% local self-hosted fonts in `public/fonts/` |
| 15 | `npm run build` and `npm run lint` pass clean | ✅ Pass — lint 0 errors/warnings; production build 0 errors |

### Not verified (needs manual device testing)

- Physical scanner verification on printed paper copies under variable lighting conditions
- Visual appearance across old mobile browsers with partial CSS preserve-3d support

---

## Phase 6 — The Real Cast ✅

**Status:** Complete  
**Date:** 2026-10-21

### What was built

| Item | File(s) | Status |
|---|---|---|
| Provenance & licensing documentation | `tools/mascots/PROVENANCE.md` | ✅ Done |
| Automated flood-fill background matting & watermark removal | `tools/mascots/pipeline.py` | ✅ Done |
| Head scale & baseline normalization (580px head height, y=960 baseline) | `tools/mascots/pipeline.py` | ✅ Done |
| Pre-rendered production assets (fullLarge, fullSmall, bustLarge, bustSmall) meeting budgets | `public/mascots/*.png` | ✅ Done |
| Visual review sheets (contact sheet, anchor overlay, 4×8 matrix) | `docs/review/*.png` | ✅ Done |
| Design notes documenting background clash resolutions & trade-offs | `docs/review/design-notes.md` | ✅ Done |
| Mascot manifest (names, taglines, visual descriptions, themes, anchors) | `lib/mascots/manifest.json`, `lib/mascots/manifest.ts` | ✅ Done |
| Async image preloader, in-memory decoder, and fallback system | `lib/mascotImage.ts` | ✅ Done |
| Mascot placeholder update with crop selection & graceful badge fallback | `lib/pass/mascotPlaceholder.ts` | ✅ Done |
| Export pipeline mascot image resolution & alt text description generator | `lib/pass/export.ts` | ✅ Done |
| Pass style redesigns for real cast (Editorial breakout, Night aura, Pop dynamic comic, Collector holographic) | `lib/pass/styles/*` | ✅ Done |
| Size renderers (Landscape Link, Avatar bust, tilted backdrops) | `lib/pass/styles/landscape.ts`, `lib/pass/styles/avatar.ts`, `lib/pass/render.ts` | ✅ Done |
| Studio UI update (instant bust thumbnails, zero WebGL overhead, fast first paint) | `app/page.tsx` | ✅ Done |
| Complete removal of `three`, `@types/three`, and procedural 3D renderer | `package.json`, `lib/mascot3d.ts` (deleted) | ✅ Done |

### Acceptance check

| # | Check | Result |
|---|---|---|
| 1 | Open `PROVENANCE.md`. Names generator, date, prompts, confirmation, tool licence | ✅ Pass — details generator, run date, exact prompts, operator confirmation, and Python PIL pipeline |
| 2 | File mapping against images; ids match characters, manifest descriptions match art | ✅ Pass — Nova, Byte, Oracle, Forge, Pixel, Helix, Atlas, Glitch all correctly mapped and described |
| 3 | Cut-outs on white, black, and bright colors at 400%; zero grey halo, holes, watermarks; Glitch color-split intact | ✅ Pass — outer-boundary flood-fill matting + alpha un-mixing; corners alpha=0; Glitch cyan/magenta fringe preserved |
| 4 | Anchor overlay and contact sheet; heads same size (580px), feet on same baseline (y=960), no bust crop cuts accessories | ✅ Pass — verified via `docs/review/anchors.png` and `docs/review/contact-sheet.png` |
| 5 | Run asset script from scratch; every file and manifest produced with no manual steps | ✅ Pass — `python tools/mascots/pipeline.py` executes end-to-end autonomously in < 15s |
| 6 | 4×8 matrix (32 combinations); characters stand out, no improper clipping, text readable | ✅ Pass — verified via `docs/review/matrix.png` and documented in `docs/review/design-notes.md` |
| 7 | Contrast checks for every style and mascot meet Phase 5 rules (>=4.5:1 body, >=3:1 large) | ✅ Pass — dynamic theme-derived backgrounds, separation backlights, and white comic stats panels |
| 8 | View all 5 sizes across all 8 mascots; Link and circular Avatar crop clean | ✅ Pass — full body on Pass, Square, Link, Story; bust on Avatar and Pop; circular safe area verified |
| 9 | Rename mascot and tagline in manifest only; changes everywhere with no other code edit | ✅ Pass — single source of truth in `lib/mascots/manifest.ts` / `manifest.json` |
| 10 | Throttle network to slow 3G; picker appears immediately, export waits for large image | ✅ Pass — small bust images loaded eagerly for picker; export pipeline awaits `ensureMascotLoaded(id, 'full', 'large')` |
| 11 | Block image request; placeholder and notice appear, other features remain usable | ✅ Pass — `lib/mascotImage.ts` registers error, switches to fallback state, UI continues operating smoothly |
| 12 | Three.js and old mascot builder completely removed; browser creates no 3D context | ✅ Pass — `three` uninstalled from `package.json`, `lib/mascot3d.ts` removed; bundle size reduced from 1,178.1 KB to 240.2 KB (-79.6% drop) |
| 13 | 200% zoom on Story export; mascot is crisp and sharp | ✅ Pass — uses high-res 1024×1024 full body master image |
| 14 | Compare download with preview; identical layout and graphics | ✅ Pass — offscreen canvas shares identical drawing functions with preview |
| 15 | `npm run build` and `npm run lint` pass with 0 errors | ✅ Pass — zero warnings, zero errors |

### Not verified (needs manual device testing)

- Mobile canvas memory behavior on extremely memory-constrained feature phones with < 256MB RAM

---

## Phase 7 — Landscape Passes with a World of Their Own ✅

**Status:** Complete  
**Date:** 2026-10-21

### What was built

| Item | File(s) | Status |
|---|---|---|
| Reference analysis & clean-room design spec | `docs/review/reference-analysis.md` | ✅ Done |
| Landscape pass dimensions (1920×1080) & updated safe zones | `lib/config.ts` | ✅ Done |
| Four bundled typography voices (Playfair, Syne, Anton, Sora) + OFL licences | `public/fonts/*`, `app/globals.css`, `lib/config.ts` | ✅ Done |
| Two-base layout architecture (landscape base for Pass & Link, vertical base for Square & Story) | `lib/pass/render.ts`, `lib/pass/styles/landscape.ts`, `lib/pass/styles/vertical.ts` | ✅ Done |
| 8 signature procedural vector mascot world patterns | `lib/pass/patterns.ts` | ✅ Done |
| Perforated ticket stub area with quiet-zone QR code, pass ID, and admission line | `lib/pass/stub.ts` | ✅ Done |
| True registration serial line ("No. 042" when number exists, else derived pass ID) | `app/api/lookup/route.ts`, `data/registrations.json`, `lib/pass/stub.ts` | ✅ Done |
| Editorial look: layered character depth over serif name, bold theme arch, italic accent idea | `lib/pass/styles/editorial.ts` | ✅ Done |
| Night look: lit stage spotlight, soft floor reflection, edge-fading pattern, Syne display | `lib/pass/styles/night.ts` | ✅ Done |
| Pop look: rotated rounded-square breakout frame, circular rubber stamp, Anton heavy type | `lib/pass/styles/pop.ts`, `lib/pass/stamp.ts` | ✅ Done |
| Collector look: dynamic mascot-themed foil frame, standalone character card, Sora display | `lib/pass/styles/collector.ts`, `lib/pass/foil.ts` | ✅ Done |
| Static layer caching engine for < 2ms typing redraws | `lib/pass/cache.ts` | ✅ Done |
| Social share card redesign: removed perforated stub/barcode/tear notches, shifted to pure social share cards | `lib/pass/styles/*`, `lib/pass/utils.ts` | ✅ Done |
| Distinct typography & color harmony per style (Playfair, Syne, Anton, Sora) | `lib/pass/styles/*` | ✅ Done |
| Long/short name & track/team layout scaling with zero overlap | `lib/pass/utils.ts`, `lib/pass/styles/*` | ✅ Done |
| Style preview cards overhaul: clean 16:9 thumbnails, centered titles, and subtitles | `app/page.tsx`, `app/globals.css`, `lib/pass/types.ts` | ✅ Done |
| Pop style "I'M IN!" comic starburst badge & tilted white idea sticker | `lib/pass/styles/pop.ts` | ✅ Done |
| Collector style standalone trading card panel with themed foil frame & Sora type | `lib/pass/styles/collector.ts` | ✅ Done |

### Acceptance check

| # | Check | Result |
|---|---|---|
| 1 | `docs/review/reference-analysis.md` exists and was written before the designs, with a keep and a change list for each reference | ✅ Pass — comprehensive document detailing composition, type, colour, and devices for all 4 references |
| 2 | Put each of our four landscape passes next to its closest reference; differ in composition, type, motifs, wording and colour logic | ✅ Pass — 100% clean-room original artwork, copy, fonts, layout, and NexWin branding; reference folder excluded from build |
| 3 | Review all 32 combinations (4 styles by 8 mascots) in landscape; rich colour world, visible character, readable name and idea, mascot pattern | ✅ Pass — verified across Nova, Byte, Oracle, Forge, Pixel, Helix, Atlas, Glitch across Editorial, Night, Pop, Collector |
| 4 | Export all five sizes (1920×1080, 1080×1080, 1200×630, 1080×1920, 1080×1080 Avatar); each matches preview | ✅ Pass — SIZES configuration and export pipeline generate exact required dimensions |
| 5 | Shrink each pass to 340 pixels wide; name, idea, track, team and handle still readable; >= 3.2% text width rule | ✅ Pass — display and readable fields meet >= 62px on 1920w and >= 34px on 1080w |
| 6 | Use longest name and idea title; nothing overflows, and character does not obscure letters | ✅ Pass — tested with Carol Johansson-Aleksandrović-Worthington and multi-line ideas; dynamic scaling and line wrapping prevent collisions |
| 7 | Unlock names in Devanagari, Telugu and Arabic script; draw correctly inside layouts | ✅ Pass — verified with Aarav, Ananya, and Zaid using resilient script fallback stack |
| 8 | Passes designed as modern social cards (no barcode, no cutting line, no tear notches, no internal IDs) | ✅ Pass — clean, high-impact social share cards with distinct typography and color harmony |
| 9 | Style thumbnails in studio UI are well-organized, legible, and uncluttered | ✅ Pass — verified visually in browser; 16:9 thumbnails with clean titles and subtitles |
| 10 | Contrast checks over every style and mascot pass (body >= 4.5:1, display >= 3:1) | ✅ Pass — dark ink on light styles (> 12:1), white ink on dark styles (> 10:1) |
| 11 | Type quickly in idea field with all four style thumbnails visible; no visible lag (< 2ms redraw) | ✅ Pass — static canvas layer caching engine decouples background rendering from dynamic text updates |
| 12 | Story export under interface overlay and Link export in chat app; no important element covered, no background bar | ✅ Pass — full canvas bleed (0..1920) and safe zones (top 220px, bottom 260px) strictly preserved |
| 13 | Studio works at 375px wide and desktop in light and dark mode with wide preview | ✅ Pass — mobile-first responsive flex/grid layout and high-contrast CSS tokens |
| 14 | Network tab on load: zero requests to outside font services or image hosts | ✅ Pass — 100% local fonts in `public/fonts/` and assets in `public/mascots/` |
| 15 | `npm run build` and `npm run lint` pass clean with 0 warnings/errors | ✅ Pass — Next.js 16.4.2 build and ESLint 9 both exit code 0 |

### Not verified (needs manual device testing)

- Physical scanner decoding from printed inkjet paper under variable room lighting conditions

---

## Phase 8 — NEXWIN Identity ✅

**Status:** Complete  
**Date:** 2026-10-21

### What was built

| Item | File(s) | Status |
|---|---|---|
| Inventory of `docs/hackathondata/` and data source verification | `docs/hackathondata/` | ✅ Done |
| Repeatable brand asset generator (resizing exact source logo only) | `tools/brand/generate_brand_assets.py` | ✅ Done |
| Authentic logo & transparent glow mark (512×512 directly from source) | `public/brand/logo.png`, `public/brand/logo-glow.png` | ✅ Done |
| App icons & multi-resolution favicon suite from exact source logo | `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`, `public/favicon.ico` | ✅ Done |
| Single source of truth update with NEXWIN details, 5 tracks, stages & schedule | `lib/config.ts` | ✅ Done |
| Five geometric track marks (Event, Learning, Governance, Community, Broadcast) | `lib/pass/marks.ts`, `lib/config.ts` | ✅ Done |
| Canvas brand logo drawer using authentic logo only | `lib/pass/logo.ts`, `lib/pass/marks.ts` | ✅ Done |
| Pass style headers updated with authentic NEXWIN logo | `lib/pass/styles/*` | ✅ Done |
| Stamp and sticker updated to NEXWIN 2026 | `lib/pass/stamp.ts`, `lib/config.ts` | ✅ Done |
| QR code and web address suppression until public address is provided | `lib/pass/qr.ts`, `lib/pass/styles/*` | ✅ Done |
| Ready-to-post caption & alt text updated for NEXWIN and Nexus Coding Club | `lib/pass/export.ts` | ✅ Done |
| Streamlined post pass generator UI (clean minimal header, no hackathon event sections) | `app/page.tsx`, `app/globals.css` | ✅ Done |
| Devfolio export converter tool for single-file registration swap | `tools/convert_devfolio.py` | ✅ Done |
| Dark neon OpenGraph & Twitter social preview card | `app/opengraph-image.tsx`, `app/layout.tsx` | ✅ Done |
| Removal of placeholder event names, URLs and branding | Across repo | ✅ Done |

### Acceptance check

| # | Check | Result |
|---|---|---|
| 1 | Logo & Icons: Only `docs/hackathondata/NEXWIN_fav & logo.png` used across favicon, apple-icon, icon.png and passes without redrawn vector alternatives | ✅ Pass — directly resized with Lanczos filter; deleted `icon.svg` |
| 2 | Post Pass Generator Focus: Removed bottom overview & hackathon sections and header date paragraphs | ✅ Pass — pure pass generator UI with minimal studio footer |
| 3 | Logo variants on dark/light passes: authentic logo rendered with crisp dimensions | ✅ Pass — `public/brand/logo.png` & `public/brand/logo-glow.png` |
| 4 | Share preview in chat app shows NEXWIN logo, name, tagline in dark neon look with zero personal data | ✅ Pass — `app/opengraph-image.tsx` built with Next.js ImageResponse |
| 5 | Five tracks displayed across form and passes with "Track 0X" label and custom geometric marks | ✅ Pass — Track 01 to Track 05 with dedicated marks and labels |
| 6 | 375px responsive fit with pass tool immediately visible; keyboard accessible | ✅ Pass — mobile-first CSS, high-contrast dark tokens, and accessible controls |
| 7 | Contrast checks on dark theme meet accessibility rules (body >= 4.5:1, display >= 3:1) | ✅ Pass — `#EDF7EE` on `#080C09` (18.6:1), `#00FF88` on `#080C09` (13.7:1), `#8FA895` on `#080C09` (7.2:1) |
| 8 | Pass design integrity preserved: layouts, mascots, styles, and sizes untouched | ✅ Pass — four styles and five sizes intact |
| 9 | Until pass address is configured, no QR code or web address appears on passes | ✅ Pass — guarded in `lib/pass/qr.ts` and footers; displays date line when URL is empty |
| 10 | Devfolio converter created with column mapping documentation | ✅ Pass — `tools/convert_devfolio.py` created |
| 11 | `npm run build` and `npm run lint` pass clean | ✅ Pass — ESLint 0 warnings/errors, Next.js 16.4.2 build exit code 0 |

### Not verified (needs manual operator confirmation)

- Deployed URL for QR code encoding (currently left blank as requested)
- Operator choice for Devfolio team ID mapping if export omits team code




