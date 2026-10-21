# Phase 7 — Landscape passes with a world of their own

**Goal.** Passes that look like collectable event posters: landscape, rich in
colour, bold in type, each one built around its character. Someone should
recognise the style at a glance, and recognise it as ours.

Phases 1 to 6 are done. The cast of eight characters is in place, with a theme
for each. The passes are still the portrait layouts from earlier phases. This
phase redesigns them in landscape, in four distinct looks, and adds details that
make each pass feel individual.

Read `AGENTS.md`, `project-doc.md` and this file. Where this file is more
specific, this file wins. It changes the pass format from Phases 2 and 5, as
listed under "What changes".

The agent works as the **designer** as well as the developer. See "Design
authority" below.

## Reference material

Four exported passes from another event are in `docs/design-reference/`. They
are there to show the level of finish, the mood of each look and the use of
colour and type: a light editorial poster, a dark stage, a loud pop poster and a
dark collector card. They are references for mood and structure only.

They are not templates. Do not reproduce their exact layouts, type, colours,
wording, motifs or artwork. The character, name and branding shown in them are
someone else's and must not appear anywhere in this app. The reference folder is
never served or bundled. The aim is that nobody could mistake our passes for
theirs.

## Step 0 — Reference analysis

Before designing, write `docs/review/reference-analysis.md`. For each of the four
references, describe in your own words:
- what the composition is and where the eye goes first;
- the roles of type (name, idea, labels) and how they differ in size and weight;
- the colour roles (background, panel, ink, accent) and how rich colour is built;
- the devices that give it character.

Then, for each, list **what we keep as a principle** and **what we do
differently**. Design only after that list exists.

## Build

- **A landscape main pass.** "The pass" becomes 1920×1080. The four styles are
  redesigned as landscape compositions in the language below.
- **Two base layouts, not more.** A landscape base for The pass and Link, and a
  vertical base for Square and Story. The four styles apply to both. Avatar stays
  as in Phase 5.
- **Four looks**, each with its own colour logic, type voice and signature
  device. These are directions, not drawings; the agent designs the details and
  improves on them. Style names are data and can be changed.
  - **Editorial.** A light, tinted paper background with one large bold colour
    shape from the mascot's theme behind the character. A big, refined serif
    name set so that the character stands in front of part of it, creating depth.
    The idea title in an italic accent.
  - **Night.** A deep dark card with a lit stage: a spotlight in the mascot's
    glow colour, a soft floor reflection under the character, and the
    mascot's world pattern fading in from one edge. Wide geometric sans for the
    name, a monospaced voice for labels.
  - **Pop.** A saturated, full-bleed colour world with layered gradients. An
    oversized, tightly stacked heavy name, the idea on a tilted tape or ticket
    label, and the character breaking out of a rotated rounded-square frame.
    Use shapes other than a circle badge and a starburst sticker. A circular
    rubber-stamp mark carrying the event's short name and year, slightly rotated.
  - **Collector.** A dark trading-card look. A foil frame whose colours come from
    the mascot's theme, not a fixed rainbow; a large character panel; the
    mascot's name and tagline on the card; a serial line; and a clean information
    column beside it.
- **Rich colour from the theme.** Each mascot's theme from Phase 6 is extended
  into a colour world: a base, a deep shade, a highlight, an accent from its
  costume and a secondary hue that sits well beside the base. Backgrounds are
  built from layered gradients and the Phase 5 grain. They are never flat grey
  or a single flat fill, except where a style deliberately wants it.
- **A signature world pattern for each mascot**, drawn in code from the pass ID,
  used by every style in its own way:

  | Mascot | Pattern idea |
  |---|---|
  | Nova | star field with a few shooting streaks |
  | Byte | pixel grid with scattered lit squares |
  | Oracle | constellation lines joining small stars |
  | Forge | hex-bolt and spark motifs |
  | Pixel | paint splatters and soft dots |
  | Helix | butterflies and twisting ribbon lines |
  | Atlas | topographic contour lines and a faint compass mark |
  | Glitch | scan lines and colour-split slices |

- **Layered depth.** Where the character overlaps large type, the overlap
  must be deliberate. The name stays fully readable, because overlap is only
  allowed over parts of letters, never enough to hide a letter.
- **A ticket stub.** Every pass has a perforated stub area that holds the QR
  code, the pass ID and a short line such as "Admit one builder". The QR code
  sits on a light area with its quiet zone intact at every size, so it scans
  reliably. The stub's position and shape fit each style.
- **A serial that doesn't lie.** If the registration has an optional `number`
  field, show it as "No. 042". If it doesn't, show only the derived pass ID. Never
  invent an order number.
- **Small per-pass variations.** Pattern seed, stamp angle, sticker position and
  foil highlight angle vary slightly per pass, all seeded from the pass ID, so
  the same person always gets identical pixels and different people get passes
  that are not copies of each other.
- **Four type voices, local and licensed.** Editorial: a high-contrast serif with
  a good italic. Night: a wide or geometric sans plus a monospace. Pop: an
  ultra-bold, tightly set grotesque or condensed face. Collector: a techy or
  rounded display face plus the monospace. Pick the families yourself. For
  orientation, check candidates such as Fraunces, DM Serif Display, Sora,
  Unbounded, Syne, Bricolage Grotesque and Archivo for licences and fit, and
  avoid choosing the same pairings as the reference passes. Keep the total to
  four families plus one monospace, subset and bundled with the app.
- **Studio layout for landscape.** The live preview is now wide. Rework the studio
  page so the preview is large and comfortable on desktop and full width on a
  phone, with the tabs, style thumbnails and actions still easy to reach.
- **Updated docs.** Update `project-doc.md` (the sizes table and style
  descriptions) and the Phase 5 safe zones in the config to match.

## Design authority

The agent may change composition, shapes, colour use, type, ornament and the
studio layout. It must keep: every fact from Phase 2, the role badge and track
mark from Phase 5, the QR code, the export behaviour from Phase 4, and the
legibility rules below. Record each significant decision, with the reason and
a before and after, in `docs/review/design-notes.md`.

## Constraints

- **Not a copy.** Layout, type pairings, motifs, wording and colour logic are our
  own. The acceptance check includes a side-by-side comparison with the
  references.
- **Legibility scales with the canvas.** Any text meant to be read is at least
  3.2% of the canvas width in size (34 pixels on a 1080-wide canvas, about 62 on
  the 1920-wide pass). Smaller marks are only for pure decoration and never
  carry needed information. This is stricter than most posters, deliberately: the
  pass must read in a feed thumbnail.
- **Contrast stays a rule.** Body-size text meets 4.5 to 1 and large display text
  3 to 1 against what's directly behind it, including over gradients, patterns
  and the character's edges.
- **The character always separates from its background.** The Phase 6 rule still
  applies in every style and with every mascot.
- **Drawing is still a pure function** of data, style, size and seed. Nothing in
  it reads the page. All randomness comes from the pass ID.
- **Cache the static layers.** Background, pattern and character are drawn once
  per mascot, style, size and seed and reused. Typing redraws only the text and
  the layers that depend on it, so the preview never lags.
- **Fonts are local and ready before drawing**, with licence files in the repo.
  No request to an outside font service.
- **Safe zones** from Phase 5 apply, and background and pattern bleed past the
  card edges so cropping and letterboxing for Link never show a bar.
- **No outside images.** Patterns, textures and shapes are drawn in code.
- **Names in other scripts still work.** Devanagari, Telugu and Arabic names
  render as real characters, in the right order, with the display faces falling
  back gracefully.
- **No email anywhere on the pass.** The QR code contains only the site address
  and the pass ID.
- No new dependency except fonts, unless approved first.

## What changes from earlier phases

- "The pass" is 1920×1080 landscape instead of 1080×1350 portrait. The size tabs
  and export names stay the same.
- Link (1200×630) now uses the landscape base card with bleed. Square (1080×1080)
  and Story (1080×1920) use the vertical base. Avatar is unchanged.
- Style thumbnails become landscape tiles.
- Phase 2's rule "one base card" and Phase 5's "two base cards (portrait and
  landscape)" become: landscape and vertical, with landscape as the main one.

## Acceptance check

1. `docs/review/reference-analysis.md` exists and was written before the designs,
   with a keep and a change list for each reference.
2. Put each of our four landscape passes next to its closest reference. They differ
   in composition, type, motifs, wording and colour logic. None of their text,
   branding or characters appears anywhere in the app, and the reference folder is
   not in `public/` or the build.
3. Review all 32 combinations (4 styles by 8 mascots) in landscape. Each has a rich
   colour world, a clearly visible character, a readable name and idea, and the
   mascot's own pattern.
4. Export all five sizes. They are exactly 1920×1080, 1080×1080, 1200×630,
   1080×1920 and the 1080×1080 Avatar, and each matches its preview.
5. Shrink each pass to 340 pixels wide. The name, idea, track, team and handle are
   still readable. Run the text size check: nothing meant to be read falls under
   the minimum.
6. Use the longest name and idea title. Nothing overflows, and in the layered
   styles no letter of the name is hidden by the character.
7. Unlock names in Devanagari, Telugu and Arabic script. They draw correctly and
   stay inside their layouts.
8. Scan the QR code from the screen, a downloaded file and a printed copy, at every
   size. It opens the site with the pass ID each time, and its quiet zone is clear.
9. Export the same participant twice: identical pixels. Export two different
   participants with the same mascot: the pattern, stamp and highlight differ
   slightly. No email appears anywhere.
10. Run the contrast checks over every style and mascot. All pass, and exceptions
    are listed in the launch checklist.
11. Type quickly in the idea field with all four style thumbnails visible. There's
    no visible lag, and the notes record how long a redraw takes.
12. View a Story export under an app's own interface overlay and a Link export in a
    chat app. Nothing important is covered or cropped, and no background bar shows.
13. The studio works at 375 pixels wide and on desktop, in light and dark mode,
    with the wide preview.
14. Network tab on load: no request to an outside font service or image host.
15. `npm run build` and `npm run lint` pass, and the console is clean.

## Not in this phase

Animated passes. New mascots or poses. New export sizes. Collecting the link to a
participant's post. Check-in scanning and an organiser dashboard. Participants
uploading their own artwork.