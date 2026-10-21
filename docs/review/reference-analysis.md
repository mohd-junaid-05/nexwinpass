# Reference Analysis — Phase 07: Landscape Passes

This document analyses the four reference passes located in `docs/design-reference/` (`AIBuildChallenge2026-Mohd-Junaid-*.png`). Per `docs/specs/phase-07.md`, this analysis precedes all design and implementation work. It establishes the principles we adopt and the deliberate ways our passes differ.

---

## 1. Editorial Reference (`AIBuildChallenge2026-Mohd-Junaid-editorial-pass.png`)

### Composition and Eye Flow
- **Aspect & Grid:** Landscape format (16:9). A two-column split layout: the left 60% contains event branding, a large attendee name, building idea, and a metadata footer; the right 40% houses a vertical arched window framing the 3D mascot.
- **Visual Path:** The viewer's eye is captured first by the friendly, illuminated 3D character inside the glowing emerald-green arch. It then sweeps left to the dominant high-contrast serif attendee name ("Mohd Junaid"), drops down to the bright blue italic idea title ("LoForge: Custom AI WorkSpace"), and finally settles on the quiet bottom baseline containing the event URL and track/team details.

### Roles of Type
- **Header:** Monospaced/geometric sans with an asterisk glyph (`✱ BFWAI/HACK 26`), subtitle (`AI Build Challenge 2026 · by Build Fast with AI`), and right-aligned `Team ID U9X70K6V`.
- **Attendee Name:** High-contrast display serif with sharp bracketed serifs and tall x-height, stacked over two lines. It occupies approximately 40% of the vertical space in the left column.
- **Idea Title:** An expressive italic serif rendered in electric royal blue, preceded by a tiny spaced uppercase `BUILDING` label. It behaves as a personal quote or mission statement.
- **Labels & Details:** Neutral low-contrast sans in light charcoal for the website (`buildfastwithai.com/hackathon ↗`) and metadata (`Track 03 · Team NexBinary`).
- **Mascot Name Tag:** A dark pill floating at the bottom apex of the arch: `Glitch • The Breaker`.

### Colour Roles
- **Background:** Warm tinted paper/cream (`#F4F1EA`) giving a tactile, editorial print feel.
- **Panel:** A smooth emerald-to-mint gradient inside the arch, reflecting the mascot's green visor glow.
- **Ink:** Deep charcoal/near-black (`#1E1A16`) for maximum legibility and classic typographic presence.
- **Accent:** Saturated electric blue for the idea title, emerald green on the character and floating voxels.

### Signature Devices
- Architectural arch enclosing the character.
- Floating voxel cubes around the character's head.
- Minimal hairline rules partitioning header, content, and footer zones.
- Rounded dark pill anchoring the base of the arch.

### Principles Kept vs. What We Do Differently
- **What we keep as a principle:**
  - Warm paper-tinted background rather than sterile digital white.
  - Expressive, refined serif display for the builder's name.
  - Distinct italic accent voice for the project idea.
  - Strong visual hierarchy balancing a large hero character with crisp typography.
- **What we do differently:**
  - **Layered Depth & Overlap:** In the reference, the character is rigidly boxed inside its arch on the right, separated from the text. In our design, the character dynamically steps in front of the large serif name, creating real dimensional depth while keeping every letter fully legible (per Phase 7 spec: overlap is strictly over portions of letters, never hiding a letter).
  - **Ticket Stub Integration:** We introduce a perforated ticket stub on the right flank, bounded by realistic tear notches and dashed cut lines, featuring the verified QR code, pass ID, and "ADMIT ONE BUILDER".
  - **Mascot Signature World Pattern:** Rather than a plain gradient arch, our background incorporates each character's custom procedural pattern (e.g. Glitch scan-lines/slices, Nova star field, Oracle celestial lines) drawn from the pass seed.
  - **Expanded Theme Colour World:** The arch and accent tones draw from our 5-color mascot theme (base, deep, highlight, costume accent, secondary hue) rather than a generic green gradient.
  - **Role Badges & Track Marks:** Includes our vector geometric track marks and Leader/Member status pills.
  - **NexWin Branding:** 100% original copy, `NEXWIN/HACK 26`, `nexwin.dev`, and our own cast of eight mascots.

---

## 2. Night Reference (`AIBuildChallenge2026-Mohd-Junaid-night-pass (1).png`)

### Composition and Eye Flow
- **Aspect & Grid:** Landscape format (16:9). The canvas is split between an obsidian void on the left and a luminous illuminated stage on the right.
- **Visual Path:** The eye is drawn immediately to the glowing cyan/green robot visor illuminated by the atmospheric spotlight, sweeps across the digital pixel mosaic along the top margin, and transitions left to the crisp white attendee name.

### Roles of Type
- **Header:** White monospace/sans (`✱ BFWAI/HACK 26`), matching the dark environment.
- **Attendee Name:** Serif display face identical to the Editorial reference, inverted to pure white against pitch black.
- **Idea Title:** Glowing neon green italic serif matching the spotlight hue, under a muted `BUILDING` label.
- **Labels & Details:** Cool grey / muted silver for secondary details (`#94A3B8`).

### Colour Roles
- **Background:** Pitch obsidian / near-black (`#07080A`).
- **Panel/Stage:** Smooth atmospheric radial spotlight (`#22C55E` to transparent) creating volume and illumination behind the character.
- **Ink:** High-contrast pure white (`#FFFFFF`) for the name and header.
- **Accent:** Multi-color pixel matrix (cyan, yellow, white, grey) across the top edge, and vibrant green for the project idea.

### Signature Devices
- Theatrical stage spotlight with soft falloff.
- Pixel matrix band fading along the upper border.
- Floating green voxel cubes.

### Principles Kept vs. What We Do Differently
- **What we keep as a principle:**
  - Deep obsidian nocturnal atmosphere with intense, high-contrast luminous lighting.
  - Atmospheric stage spotlight matched to the character's glow colour.
  - High-tech, midnight-hacker ambience.
- **What we do differently:**
  - **Distinct Typographic Voice (Wide Geometric Sans):** The reference reuses the exact same serif font as Editorial. In our pass, Night employs a bold, wide geometric sans display face (e.g. `Syne` / `Sora`), paired with a crisp monospace for labels, establishing a distinct high-tech voice.
  - **Grounded Floor Reflection & Contact Shadow:** We render an authentic soft floor reflection and contact shadow under the character, grounding them firmly on the stage.
  - **Edge-Fading World Pattern:** The mascot's unique procedural pattern (e.g., Nova star field, Byte pixel grid, Glitch scanlines) softly fades in from the card edges, seeded deterministically from the pass ID.
  - **Nocturnal Perforated Ticket Stub:** Houses the scannable high-contrast QR code (with certified quiet zone), Pass ID, and admission credentials.
  - **Dynamic Theme Backlight:** Oracle (black hoodie), Atlas (navy), and Forge (deep amber) receive custom-tuned backlight rims ensuring > 3:1 contrast across all 8 cast members.

---

## 3. Pop Reference (`AIBuildChallenge2026-Mohd-Junaid-pop-pass (1).png`)

### Composition and Eye Flow
- **Aspect & Grid:** Full-bleed saturated field (16:9). Bold, asymmetrical split: giant tightly-stacked typography dominating the left 55%, balanced by a large circular character badge on the right.
- **Visual Path:** The eye is instantly grabbed by the colossal, ultra-heavy condensed uppercase black name ("MOHD JUNAID"), then jumps to the circular white mascot badge and the jagged black "I'M IN!" starburst sticker.

### Roles of Type
- **Attendee Name:** Ultra-condensed, ultra-heavy grotesque sans in solid black, tightly tracked with near-zero line spacing. Imposing, poster-like presence.
- **Idea Title:** Clean sans inside a tilted white sticker panel with a drop shadow.
- **Header & Footer:** Solid black sans labels framing the canvas perimeter.
- **Sticker Text:** Bold, angled sans shouting "I'M IN!".

### Colour Roles
- **Background:** Saturated emerald green (`#10B981`).
- **Panel:** Pure white circular badge with heavy black comic stroke; white tilted sticker panel.
- **Ink:** Solid ink-black (`#000000`).
- **Accent:** Halftone dot screen pattern in the lower right; black starburst badge.

### Signature Devices
- Circular framed comic badge with 6px black outline.
- Tilted white label sticker for the idea.
- Jagged starburst sticker ("I'M IN!").
- Halftone screen dots.

### Principles Kept vs. What We Do Differently
- **What we keep as a principle:**
  - Saturated, high-energy pop poster aesthetic.
  - Oversized, tightly stacked heavy display name commanding immediate attention.
  - Physical tape and label sticker motifs with realistic offset drop shadows.
- **What we do differently:**
  - **No Circular Badge, No Starburst:** The spec explicitly directs: *"the character breaking out of a rotated rounded-square frame. Use shapes other than a circle badge and a starburst sticker. A circular rubber-stamp mark carrying the event's short name and year, slightly rotated."*
  - **Rotated Rounded-Square Breakout Frame:** We replace the circle with a bold rounded square tilted at -4°, with the character's head, accessories, and antenna dramatically breaking out over the frame border.
  - **Circular Rubber-Stamp Mark:** We replace the jagged "I'M IN!" sticker with an authentic circular rubber-stamp mark (`★ NEXWIN HACKATHON ★ 2026 ★ VERIFIED BUILDER`), rotated dynamically based on pass seed.
  - **Tilted Tape / Ticket Label:** The idea sits on a textured tape banner with angled cut ends and shadow.
  - **Layered Gradient Backgrounds:** Pop backgrounds use dynamic layered gradients derived from `mascot.theme.popBg` and secondary hues, combined with seeded halftone dot grids and mascot world patterns.
  - **Pop Ticket Stub:** A comic-styled perforated ticket stub with tear notches and barcode styling.

---

## 4. Collector Reference (`AIBuildChallenge2026-Mohd-Junaid-collector-pass.png`)

### Composition and Eye Flow
- **Aspect & Grid:** Landscape format (16:9). Left side features a framed vertical trading card; right side contains a clean information column with large sans attendee name, glass idea card, and metadata footer. Outer perimeter is framed by a rainbow foil border.
- **Visual Path:** The viewer's attention starts on the glossy character trading card on the left with its foil border and character badges, moves across to the prominent white name, down to the translucent glass idea container, and across the bottom details.

### Roles of Type
- **Attendee Name:** Clean, modern geometric sans in title case with generous horizontal tracking.
- **Idea Title:** Clean sans text housed within a translucent glassmorphism container, labeled with a compact `BUILDING` tag.
- **Trading Card Elements:** Crisp uppercase pill badges (`BUILDER`, `Glitch`, `The Breaker`, diamond icon).
- **Metadata:** Muted cool-grey sans and monospace for track, team, and URL.

### Colour Roles
- **Background:** Deep slate/navy graphite (`#0D1924`).
- **Panel:** Translucent dark glass container (`rgba(255, 255, 255, 0.05)`) with subtle stroke.
- **Ink:** Clean white (`#FFFFFF`) and slate (`#94A3B8`).
- **Accent:** Universal rainbow spectrum border (`#EC4899`, `#8B5CF6`, `#06B6D4`, `#10B981`, `#F59E0B`).

### Signature Devices
- Standalone trading card container on the left with rounded corners.
- Holographic rainbow perimeter border.
- Glassmorphic idea container.
- Diamond gem icon in card header.

### Principles Kept vs. What We Do Differently
- **What we keep as a principle:**
  - Premium collectible trading card aesthetic with an authentic physical feel.
  - Dedicated character showcase card displaying the figurine with mascot name and official tagline.
  - Structured, high-tech information column beside the card.
- **What we do differently:**
  - **Foil Frame from Mascot's Theme (Not Fixed Rainbow):** The spec explicitly states: *"A foil frame whose colours come from the mascot's theme, not a fixed rainbow"*. Our foil gradient uses dynamic linear and conic color stops driven by the mascot's theme colors (e.g. Forge's amber/gold/slate foil, Nova's flame/cyan/cream foil, Glitch's emerald/cyan/magenta foil), angled deterministically per pass ID.
  - **A Serial Line That Doesn't Lie:** Displays `No. 042` if the registration contains an optional `number` field; otherwise displays the verified pass ID `PASS ID // NW-XXXX-26`. We never invent order numbers.
  - **Techy Rounded Display Typography:** Employs a futuristic/tech display typeface for the attendee name, balanced with monospace data fields.
  - **Foil-Edged Perforated Ticket Stub:** Includes an authentic collectible ticket stub with QR code, security holographic emblem, and registration serial.

---

## Summary of Design Principles for Builder Pass Studio

| Attribute | Reference Behavior | Our Studio Principle |
|---|---|---|
| **Branding & Copy** | `BFWAI/HACK 26`, `buildfastwithai.com` | `NEXWIN/HACK 26`, `nexwin.dev`, NexWin Hackathon 2026 |
| **Character Roster** | Single generic robot ("Glitch The Breaker") | Full cast of 8 distinct mascots (Nova, Byte, Oracle, Forge, Pixel, Helix, Atlas, Glitch) |
| **Pass Dimensions** | 1920×1080 landscape | 1920×1080 main landscape pass, 1200×630 Link, 1080×1080 Square, 1080×1920 Story, 1080×1080 Avatar |
| **Depth & Overlap** | Character segregated in side container | Deliberate layered depth: character stands in front of large display type without obscuring letter legibility |
| **Ticket Stub** | None (plain footer only) | Perforated ticket stub on every pass with tear notches, dashed cut lines, quiet-zone QR code, and pass ID |
| **Color Source** | Static green / rainbow | Dynamically extended 5-color theme world for each mascot, layered with fine grain |
| **World Patterns** | Pixel blocks on top edge | 8 signature procedural vector patterns drawn from pass seed in code |
| **Pop Framing** | Circle badge + starburst "I'M IN!" sticker | Rotated rounded-square breakout frame + circular rubber stamp (`NEXWIN HACKATHON 2026`) |
| **Collector Foil** | Static rainbow spectrum | Dynamic multi-stop foil shader keyed to mascot's unique theme palette |
| **Serial Numbers** | Arbitrary Team ID | True serial: `No. 042` when `number` exists, else verified derived pass ID |
