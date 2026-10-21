# Phase 6 — The real cast

**Goal.** Replace the mascots built in code with the eight character images in
`docs/character/`, everywhere a mascot appears. Then redesign the pass around
them, because these characters have costumes, silhouettes and colours the old
ones never had. Each mascot should look as if the pass was designed for it.

Phases 1 to 5 are done. The mascots on the pass today are generated in the
browser. They are going away. The lookup, privacy rules, export behaviour, size
tabs and QR code stay as they are.

Read `AGENTS.md`, `project-doc.md` and this file. Where this file is more
specific, this file wins. This phase supersedes Phase 3's run-time 3D approach.

In this phase the agent works as the **designer** as well as the developer. See
"Design authority" below for what that allows.

## The source images

Eight JPG files in `docs/character/`. The file names don't match the mascot
names, so use this mapping, and check each one by looking at the image before
relying on it.

| File | Mascot id | What it shows |
|---|---|---|
| `orangechar.jpg` | `nova` | Orange robot, cream puffer vest with a gold star pin, white sneakers, star-shaped fin, round cyan-glow eyes |
| `neonchar.jpg` | `byte` | Lime-green robot, pixel-style square eyes, black headphones around the neck, short antenna, black-and-lime high-tops |
| `purplechar.jpg` | `oracle` | Violet robot, half-closed lavender eyes, floating halo, crescent-moon fin, star-patterned indigo hoodie, crystal pendant |
| `yellowchar.jpg` | `forge` | Amber robot, backwards navy cap, gold chain, tool belt with a hammer, tan work boots |
| `lightbluechar.jpg` | `pixel` | Teal robot, soft square mint eyes, lilac beret, paintbrush fin, paint-splashed tote bag, sticker-covered arm |
| `pinkchar.jpg` | `helix` | Hot-pink robot, ringed round eyes, sunglasses on the head, butterfly clips, twisted helix fin, striped arm warmers, platform sneakers |
| `darkbluechar.jpg` | `atlas` | Blue robot, smiling-arc eyes, thin antenna, navy varsity jacket with pins, striped tie, backpack |
| `greenchar.jpg` | `glitch` | Emerald robot, flat bar eyes with cyan and magenta glitch edges, cracked visor corner, lightning-bolt fin, black harness vest, black boots |

Things true of every source file, which drive the work below:
- They are flat JPGs on a light grey background. There is no transparency.
- Each has a small sparkle watermark in the lower right corner.
- All are three-quarter views, but the poses, proportions and framing differ:
  different head heights, different amounts of body, and things sticking out
  above the head (a halo, a beret, a cap, antennae, sunglasses).
- Glitch has a pink and cyan colour-split fringe around its outline on purpose.

## Step 0 — Provenance

Create `tools/mascots/PROVENANCE.md`. Ask the operator to fill in which image
generator made the files, when, and the prompts used, and to confirm that the
generator's terms allow using the images for this event. Record the
background-removal tool and its licence once chosen.

## Build

- **Cut-outs.** Turn each JPG into a clean transparent image: no grey
  background, no watermark, no grey fringe around the edges, no holes where a
  highlight is as pale as the background. Keep Glitch's colour-split fringe as a
  designed effect, with proper transparency on it.
  - The agent proposes a background-removal method and waits for approval. A
    local tool that can be rerun is preferred.
  - If no method is approved, stop and ask the operator to supply transparent
    PNGs in `docs/character/cutouts/` with the mascot ids as names, then
    continue from those.
- **A repeatable asset script.** `tools/mascots/` holds a script that takes the
  cut-outs and produces everything shipped. It can be rerun end to end with one
  command. It is a development tool and is not part of the app bundle.
- **Normalise the cast.** The characters share the same head design, so the head
  is the unit of scale.
  - For each mascot record anchor points: the head's centre and width, and the
    lowest point of the feet or hem.
  - Scale all eight so the heads are the same size, and place them on one
    shared baseline.
  - A halo, beret, antenna or cap must never make a mascot smaller than the
    others. It simply extends above the head.
  - Show the anchors drawn on each image in the review sheet so they can be
    checked by eye.
- **Two crops per mascot.** *Full* (the whole character) and *bust* (head and
  shoulders, for tiles, the Avatar and badge layouts). The bust crop never cuts
  through a halo, hat, antenna or sunglasses. If it would, the crop changes, not
  the accessory.
- **Two resolutions per crop.** A large one for the pass and exports, sharp at
  the biggest size it's drawn at with no upscaling, and a small one for tiles and
  thumbnails. Use an efficient image format that keeps transparency, saved under
  `public/mascots/`. State the size budgets in the README and stay within them.
- **A manifest** replacing the old mascot list. For each mascot: id, name,
  tagline, image paths for each crop and resolution, the anchors, the colour
  theme (below), and a plain-language description for alt text. Start the
  taglines with: Nova "The Launch Pilot", Byte "The Bug Hunter", Oracle "The
  Pattern Seer", Forge "The Code Smith", Pixel "The Interface Artist", Helix
  "The Model Whisperer", Atlas "The Systems Navigator", Glitch "The Chaos
  Tester". Names and taglines are data the operator can change.
- **Colour themes sampled from the art.** For each mascot define, from the
  actual image: its shell colour, a deeper shade, a light tint, a glow colour
  for dark backgrounds, and one accent taken from its costume (Atlas's red tie,
  Pixel's lilac beret, Nova's cream vest, and so on). The agent samples them,
  then tunes them as a designer. Treat any hex value you meet in older files as
  obsolete.
- **Replace every use of the old mascots.** Picker tiles, style thumbnails, live
  preview, all sizes including Link and Avatar, exports, alt text, and the
  Collector tagline. Nothing should refer to the old mascot code.
- **Remove the old character system.** Delete the run-time 3D mascot builder, the
  old mascot colour and feature definitions, the artwork-override config from
  Phase 3, and the `three` dependency if nothing else uses it. Keep the Phase 2
  placeholder as the failure fallback.
- **Redesign the pass around the cast.** See below.
- **Review material.** The script also produces, in `docs/review/`: a contact
  sheet of the eight cut-outs on white, black and their own theme colours; the
  anchor overlay sheet; and a 4-style by 8-mascot matrix showing every
  combination of the real pass.
- **Update the docs.** This phase authorises the agent to update `AGENTS.md`'s
  repo map and `project-doc.md` section 5.3 to describe the new mascot sourcing.

## Design authority

The agent may change layouts, colour use, type colour, panel shapes, ornaments
and the order of elements on all four styles and all five sizes, as long as these
survive: the facts from Phase 2, the safe zones, the minimum text size, the role
badge and the QR code from Phase 5, and the exact export sizes. Write each
non-obvious change and its reason in `docs/review/design-notes.md` with a
before and after.

Design problems the agent must solve, not ignore:

- **Characters that fight their background.** Forge (amber) and Byte (lime) sit
  badly on a yellow Pop background. Glitch (emerald) can merge into a green
  Collector panel. Oracle (dark violet with a dark hoodie) can vanish on the dark
  Night card. Each background, panel and glow is derived from the mascot's theme
  so the character always stands out. A fixed colour for a whole style is no
  longer allowed where it causes this.
- **Things that stick out.** Halos, berets, caps, antennae and fins are part of
  the personality. Let them break out of the Pop circle and the Editorial arch
  instead of being clipped by them.
- **Full body or bust.** Costumes are what make these characters. Show the full
  body where there's room and the bust where there isn't, and decide per style.
- **Varied silhouettes.** Wide ones (Atlas with the backpack), tall ones (Oracle
  with the halo) and compact ones must all sit comfortably in the same slots
  without the layout shifting between them.
- **Grounding.** The renders float. Give them a soft contact shadow so they sit
  on the pass.
- **Type that belongs to the character.** Name and idea colours come from the
  theme so each pass feels like one piece, while still meeting contrast rules.

## Constraints

- **The mascot images are data.** Layouts get image, anchors and theme from the
  manifest, and don't contain mascot-specific drawing rules. Adding a ninth
  mascot means adding images and a manifest entry.
- **Never flip an image.** Pins, text on bags and asymmetric costumes must not be
  mirrored.
- **Clean edges on every background the pass uses.** Check light, dark and every
  theme colour, at high zoom.
- **Same size heads, same baseline.** Swapping mascots must not make the slot
  look different apart from the character itself.
- **Each mascot recognisable at 96 pixels and in greyscale.**
- **Text and character separation are measurable.** Text contrast follows the
  Phase 5 rules. The main body colour of the character has at least 3 to 1
  luminance contrast against the background directly behind it, or a deliberate
  separation device such as a rim light, a pale panel or an outline.
- **Images are decoded before drawing.** First paint never waits for the large
  images. An export always waits for the chosen mascot's large image.
- **A failed image degrades gracefully:** the placeholder and a single notice
  appear, and everything else keeps working.
- **No watermark in any shipped image.** Check the corners of every output.
- **Drawing is still a pure function** of data, style and size. Mascot images and
  themes arrive as data.
- **Dependencies.** Removing `three` is expected. Adding a package, including for
  background removal or image processing, needs approval first. Keep it as a
  development dependency and not part of the app bundle.
- Nothing is uploaded or sent anywhere by the app.

## Acceptance check

1. Open `PROVENANCE.md`. It names the generator, date and prompts, records the
   operator's confirmation about terms of use, and the background-removal tool
   and its licence.
2. Check the file mapping against the images. Each id has the matching
   character, and the manifest descriptions match what the picture shows.
3. Open each cut-out on white, black and a bright colour at 400%. There is no
   grey halo, no holes, no leftover background, and no watermark in any corner.
   Glitch's colour-split edge is intact.
4. Look at the anchor overlay and the normalised contact sheet. The eight heads
   are the same size, feet sit on the same baseline, and no bust crop cuts a
   halo, hat, antenna or pair of sunglasses.
5. Run the asset script from scratch. Every file and the manifest are produced
   with no manual steps.
6. Open the 4 by 8 matrix. In every one of the 32 combinations the character
   clearly stands out from its background, nothing is clipped that shouldn't be,
   and the text is readable. Record any trade-off in `design-notes.md`.
7. Run the Phase 5 contrast checks for every style and mascot. All pass, and
   any exception is listed in the launch checklist.
8. View all five sizes with each of the eight mascots, including Link and the
   Avatar cropped to a circle. Nothing important is cut off.
9. Rename a mascot and its tagline in the manifest only. They change on the
   picker, the pass and the alt text with no other file edited.
10. Throttle the network to slow 3G and reload. The picker appears quickly and
    the page is usable before large images arrive. Press Download straight after
    choosing a mascot: the file has the real character, not the placeholder.
11. Block one mascot's image request. The placeholder and a single notice appear.
    Unlocking, typing and switching styles still work.
12. Search the code and `package.json` for the old mascot builder and `three`.
    Both are gone. The browser creates no 3D context. Report the bundle size
    before and after.
13. Check at 200% zoom on the Story export. The mascot is sharp.
14. Compare a download with its preview. They are identical.
15. `npm run build` and `npm run lint` pass, and the console is clean.

## Not in this phase

New characters or extra poses. Animated mascots. Participants choosing or
uploading their own character. A live 3D viewer. Changes to the lookup, privacy
or export rules. Collecting post links or check-in scanning.