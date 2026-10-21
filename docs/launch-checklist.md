# Launch Checklist — Builder Pass Studio

This checklist details every verification check required before putting the studio in front of real hackathon registrants.

---

## 1. Functional & Export Checks

- [x] **Download PNG (All 4 Tabs)**
  - Unlock test participant (e.g. `alice@example.com`).
  - Test download on each size tab:
    - `The pass`: 1080×1350 px
    - `Square`: 1080×1080 px
    - `Link`: 1200×630 px
    - `Story`: 1080×1920 px
  - Verify exported image resolution matches exact dimensions and renders identically to the preview.
- [x] **All Sizes (Sequential Batch)**
  - Press "All sizes (4)".
  - 4 separate PNG files arrive spaced ~400ms apart to prevent browser download blocking.
  - Page confirms with "✓ All 4 pass sizes downloaded!".
  - Fast double-click test: button is disabled during export; only 1 batch run starts.
- [x] **Eager Mascot Readiness**
  - Select a new mascot and trigger "Download PNG" immediately.
  - The exported PNG contains the fully resolved 3D mascot render (or artwork override), never the placeholder stand-in.
- [x] **Copy Image**
  - Press "Copy image" in Chromium/supported desktop browser.
  - Status confirms "Image copied to clipboard! Ready to paste."
  - Pastes cleanly into Discord/Slack/Figma/image editors.
  - In unsupported environments, plain text message instructs the user: *"Your browser doesn't support copying images to the clipboard. Please use 'Download PNG' instead."*
- [x] **Copy Caption**
  - Press "Copy caption".
  - Caption format contains:
    - What they're building / headline
    - Team & competition track
    - GitHub link (`https://github.com/{handle}`) when provided
    - Event dates and website URL from `EVENT`
    - Official hashtags
  - Test with empty idea title and empty GitHub handle: no blank lines, no `undefined`, no dangling `https://github.com/`.
- [x] **Data Privacy & Email Exclusion**
  - Search caption text for the participant's email: **never present**.
  - Inspect generated PNG image canvas and metadata: **email is never drawn or embedded**.
- [x] **Re-locking Protection**
  - Before lookup/unlock: all export buttons ("Download PNG", "All sizes", "Copy image", "Copy caption", "Share") are strictly disabled.
  - Edit or delete the email in the input box: form and export buttons immediately re-lock and return to placeholder state.
- [x] **Safe Filename Sanitization**
  - Test name with accents and punctuation (e.g., `Carol Johansson-Aleksandrović-Worthington`):
    - Output filename: `builder-pass-carol-johansson-aleksandrovic-worthington-{size}.png`.
  - Test name with all non-Latin or symbol characters:
    - Falls back safely to `builder-pass-builder-{size}.png`.
  - Filenames never contain invalid path characters, spaces, or empty strings.
- [x] **Memory & Object URL Management**
  - Trigger 20+ consecutive exports.
  - `URL.revokeObjectURL` releases all temporary blobs after download. Memory usage remains stable.
- [x] **System Share Sheet**
  - "Share" button only renders on devices supporting `navigator.canShare({ files: [...] })`.
  - On unsupported desktop browsers, the button does not appear.

---

## 2. Visual, Responsive & Accessibility Checks

- [x] **Mobile Responsiveness (375px)**
  - Layout cleanly stacks form on top of preview.
  - No horizontal scrolling or viewport overflows.
  - Preview canvas scales proportionally within container bounds.
- [x] **Theme & Contrast**
  - System light and dark modes tested.
  - High contrast on text, inputs, buttons, and canvas cards across all 4 styles (Editorial, Night, Pop, Collector).
- [x] **Reduced Motion**
  - Verified `@media (prefers-reduced-motion: reduce)` disables animations, transitions, and replaces animated spinners with static indicators.
- [x] **Accessibility Audit**
  - All interactive elements reachable via keyboard Tab/Shift+Tab.
  - Visible focus outlines (`:focus-visible`) on all controls.
  - `aria-live="polite"` status lines announce lookup states and export progress.
  - Form fields equipped with descriptive labels and `aria-describedby` hints.

---

## 3. SEO & Share Previews

- [x] **Page Metadata**
  - Descriptive page title and meta description configured in `app/layout.tsx`.
- [x] **Open Graph & Twitter Cards**
  - Open Graph preview image generated at 1200×630 px (`app/opengraph-image.tsx`).
  - Twitter summary card configured.
- [x] **Favicon**
  - Favicon configured and verified.

---

## 4. Production Build & Data Isolation

- [x] **Build Verification**
  - `npm run build` exits 0 with all routes prerendered.
  - `npm run lint` exits 0 with zero warnings and zero errors.
- [x] **One-File Data Swap**
  - Lookup reads strictly from `data/registrations.json`.
  - Version control ignores real data files via `.gitignore` (`data/*.real.json`).
  - No real participant data in Git history.

---

## 5. Phase 6 Mascot & Cast Verification

- [x] **Zero 3D Dependencies & Reduced Bundle**
  - `three` and `@types/three` completely uninstalled.
  - Client JS bundle reduced from 1,178.1 KB to 240.2 KB (~80% savings).
  - No WebGL contexts created during studio operation.
- [x] **Character Asset Budgets & Quality**
  - All 8 character cutouts verified with 0 grey halo, no holes, and no corner watermarks.
  - File size budgets strictly met (<250KB full large, <45KB full small, <120KB bust large, <20KB bust small).
  - Head sizes normalized to 580px, baseline grounded at y=960px.
- [x] **Background Separation Across 32 Combinations**
  - 4 styles × 8 mascots matrix (`docs/review/matrix.png`) verified for legibility, separation, and contrast (>3:1 graphic, >4.5:1 text).
  - Forge/Byte Pop clash resolved via dynamic `popBg` and white comic stats panel.
  - Glitch Collector clash resolved via metallic rim glow and dynamic obsidian container tint.
  - Oracle Night clash resolved via multi-stop radial separation aura.
- [x] **Accessory Breakouts & Crop Selection**
  - Halos, berets, helmets, sunglasses, and antennas break out cleanly beyond circular badges and arches without clipping.
- [x] **Single-File Rebrand & Manifest Fast Rename**
  - Renaming character name or tagline in `lib/mascots/manifest.ts` instantly updates picker tiles, card titles, taglines, and alt text.

