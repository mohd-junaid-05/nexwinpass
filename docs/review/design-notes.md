# Builder Pass Studio: Phase 06 Design Notes

## Overview

Phase 06 replaces the procedural 3D Three.js mascots with high-resolution pre-rendered character assets (`docs/character/*.jpg`). This document details the visual design rationale, background clash solutions, silhouette normalization, accessory breakout handling, and typography harmonization across all 4 pass styles (Editorial, Night, Pop, Collector) and all 5 pass formats (Pass, Square, Link, Story, Avatar).

---

## 1. Character Silhouette & Scale Normalization

### Problem
The 8 characters have widely disparate silhouettes:
- **Wide**: Atlas (heavily loaded utility explorer backpack and tool belt)
- **Tall**: Oracle (floating holographic ring / angelic halo atop dark hoodie)
- **Accessories**: Forge (flame antenna & welding visor), Spark (lightning antenna), Nova (astronaut helmet & comm antenna), Glitch (floating digital horns & chromatic aberration fringe), Byte (artist beret & palette), Pixel (oversized futuristic VR goggles).

Without normalization, switching mascots caused the visual center of mass to jump erratically, causing some heads to dwarf others or feet to float at disparate heights.

### Solution
- **Fixed Head Metric**: In `tools/mascots/pipeline.py`, each character's head bounding box was measured and scaled to a uniform reference head height of **580px** (variance: 579–580px across all 8).
- **Fixed Baseline Metric**: The lowest contact point of the boots was pinned to a universal baseline at **y = 960px** on the 1024×1024 master canvas.
- **Bust Crop Safety**: Bust crops are extracted with a generous top padding (+50px) above the highest accessory boundary, ensuring Oracle's halo, Forge's antenna, Spark's lightning bolt, and Byte's beret are never clipped in circular or square bust frames.

---

## 2. Resolving Background & Character Clashes

In Phase 5, pass styles utilized static background colors (e.g. Pop was universally yellow `#FFE600`, Collector had fixed green accents, Night was pitch dark `#0A0D14`). With the real cast, static colors caused severe figure-ground clashes.

### A. Forge (Amber/Orange) and Byte (Lime/Teal) on Pop
- **Before**: Forge's amber armor and Byte's neon lime highlights blended into the static yellow `#FFE600` Pop background, destroying legibility and visual separation.
- **After**: Pop background color is dynamically derived from `mascot.theme.popBg`:
  - Forge uses deep indigo/violet (`#1E1B4B`), creating electric contrast against Forge's warm amber visor and yellow accents.
  - Byte uses vibrant magenta/fuchsia (`#701A75` / `#A21CAF`), providing crisp separation for Byte's bright green/lime accents.
  - Bright characters get dark, energetic pop backgrounds; dark characters get high-key pop backgrounds.
  - The Pop text color dynamically checks background luminance (`getLuminance(popBg)`) to switch between crisp ink black `#0B0F19` with yellow drop-shadows or pure white `#FFFFFF` with ink-black drop-shadows.
  - The stats panel on Pop cards is rendered as a clean white comic sticker panel (`#FFFFFF` with `#000000` 3px border and 4px offset shadow), ensuring stat numbers and labels always have pristine 15:1+ contrast regardless of the mascot.

### B. Glitch (Emerald/Neon Green) in Collector Style
- **Before**: Glitch's emerald visor and green chassis merged directly into the default green cybernetic Collector accents.
- **After**:
  - The Collector style card container tint (`mascot.theme.collectorPanel`) is keyed specifically to character palettes, utilizing a deep obsidian background with tinted rim highlights.
  - A dynamic separation rim glow (`mascot.theme.glow`, e.g., `#10B981` at 25% opacity with an inner `#FFFFFF` accent) is painted directly behind Glitch's silhouette.
  - The decorative holographic foil accents adapt dynamically, giving Glitch crisp separation and highlighting its signature cyan/magenta chromatic fringe.

### C. Oracle (Deep Violet / Black Hoodie) on Night Style
- **Before**: Oracle's dark stealth hoodie and deep indigo chassis vanished against the deep navy/black Night card (`#0A0D14`), leaving only the floating visor visible.
- **After**:
  - Night style paints a multi-stop radial separation disk (`mascot.theme.nightAura`) directly behind the upper torso and head.
  - A soft, luminous backlight circle (radius 220px, 35% opacity gradient fading to transparent) creates an immediate luminance step, guaranteeing > 3:1 luminance contrast against Oracle's dark hoodie.
  - A grounded contact shadow at the feet grounds the character naturally.

---

## 3. Accessory Breakout & Layering

### Problem
Traditional card designs clip character renders within an interior bounding box, rectangle, or circle. This neuters charismatic silhouettes by cutting off antennas, halos, and hats.

### Solutions
- **Editorial Arch Breakout**:
  - In `lib/pass/styles/editorial.ts`, the background features a tinted editorial arch.
  - The mascot render is positioned and layered in front of the arch's top rim.
  - Oracle's halo, Spark's antenna, and Nova's comm fin break past the arch curve into the upper header zone, creating genuine editorial depth and a three-dimensional poster feel.
- **Pop Comic Sticker Badge**:
  - In `lib/pass/styles/pop.ts`, the mascot bust is centered within a circular comic sticker badge (`arc`).
  - Rather than clipping the canvas to the circle, the circular badge is drawn first with thick comic strokes and offset shadows, and the bust image is rendered on top with its accessories overlapping the boundary.
  - A punchy comic caption ribbon wraps across the lower quarter of the badge.

---

## 4. Grounding and Contact Shadows

### Problem
The 3D studio renders float cleanly on transparent alpha backgrounds. Without ground interaction, characters in full-body styles (Editorial, Night, Collector, Landscape) appear to levitate disconnectedly.

### Solution
- A multi-layered elliptical contact shadow is programmatically rendered at the character's baseline (`y = 960px`):
  - **Core occlusion shadow**: Dark, tight ellipse under the boots (`rgba(0, 0, 0, 0.45)`, blur: 12px, vertical scale: 0.18).
  - **Ambient contact shadow**: Softer, wider ellipse (`rgba(0, 0, 0, 0.20)`, blur: 28px, vertical scale: 0.26).
  - Both shadows are tinted slightly towards the card's background luminance to blend photorealistically.

---

## 5. Style-by-Style Crop Selection Rationale

| Pass Style | Crop Mode | Rationale |
|:---|:---:|:---|
| **Editorial** | **Full** | Wide portrait frame accommodates the full hero silhouette against the editorial typographic arch. |
| **Night** | **Full** | Minimalist dark canvas provides ample vertical room for full costume details and glowing accessories. |
| **Collector** | **Full** | Trading card format highlights the complete character figurine, costume, and collector tagline. |
| **Pop** | **Bust** | Comic sticker aesthetic emphasizes the face, visor expression, and headwear within an explosive badge. |
| **Square (1:1)** | **Full** | Balanced 1200×1200 layout comfortably houses full body alongside attendee credentials. |
| **Link (1.91:1)** | **Full** | Wide landscape frame places full body hero on the right flank with credentials on the left. |
| **Story (9:16)** | **Full** | Tall vertical format provides dramatic presentation for the full character grounded above the footer. |
| **Avatar (1:1)** | **Bust** | Social profile circle crops strictly around the head and shoulders, optimized for 96px icon legibility. |

---

## 6. Contrast & Typography Compliance

- **Theme Harmonization**: The attendee name, track badge, and tagline pick up `mascot.theme.primary` and `mascot.theme.secondary`.
- **WCAG AA Verification**: All body text maintains > 4.5:1 contrast against its immediate backing:
  - On dark styles (Night, Collector), body text is `#FFFFFF` or `#E2E8F0` on dark panels (> 10:1).
  - On light styles (Editorial, Pop), body text is `#0F172A` on `#FFFFFF` or pale pastel panels (> 12:1).
  - Small decorative labels (e.g. `TRACK`, `DATE`, `BUILDER ID`) use uppercase bold weights with minimum 12pt / 24px canvas font size to guarantee readability even at small preview scales.
