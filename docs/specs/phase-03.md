# Phase 3 — 3D mascots

**Goal.** Someone picks a mascot from eight and the pass fills with a polished 3D
character in that mascot's colours. The pick changes the whole look of the pass,
not just the picture.

Phases 1 and 2 are done: unlock, live preview, four styles, four sizes, and a
stand-in where the mascot goes. This phase replaces the stand-in and adds the
picker. Nothing is downloadable yet.

Read `AGENTS.md`, `project-doc.md` and this file. Where this file is more
specific, this file wins.

## Build

- **Eight mascots:** Nova, Byte, Oracle, Forge, Pixel, Helix, Atlas and Glitch.
  They share one friendly robot body language (rounded head, dark visor, glowing
  eyes, small shoulders) and differ by colour theme, eye style and one signature
  feature, for example ears, antennae, horns, a halo, a cap or a screen face.
  Each has its own colour theme: a body colour, an accent, an eye glow and a
  two-colour background gradient.
- **Real 3D, built by us.** Each mascot is modelled in code from basic shapes
  with glossy physical materials, lit by a key light, a rim light in the
  mascot's accent colour and a built-in procedural environment for reflections.
  Slightly turned and slightly tilted so it reads as 3D, not a flat icon.
- **Rendered once, reused everywhere.** A mascot is drawn to a transparent
  image the first time it's needed and cached. The picker tiles, the style
  thumbnails, the preview and later the exports all use that one image.
- **The mascot slot from Phase 2 is filled.** The function that draws a mascot
  into a box now draws the 3D render, scaled to fit. The four layouts don't
  change.
- **A mascot picker.** Eight tiles, each showing the mascot on its own gradient
  with its name beneath. One is selected at a time, clearly marked, and Forge is
  the default.
- **The mascot's theme drives the pass.** Its gradient and accent colour feed the
  Night glow, the Editorial arch, the Pop badge, the Collector panel, the
  backdrop behind the tilted sizes, and a soft glow on the preview stage. The
  Collector style also prints the mascot's name.
- **Eager rendering without blocking.** The other seven mascots are prepared in
  idle time after the first paint, so the first click on any tile is instant and
  the page is never frozen waiting for them.
- **A graceful failure.** If 3D can't start on the visitor's device, the page
  keeps the Phase 2 stand-in, shows one short notice, and everything else keeps
  working.
- **Optional artwork override.** The config can name an image file for any
  mascot id. If present, that image is drawn instead of the 3D render for that
  mascot only.

## Constraints

- **One 3D context for the whole app.** Create a single renderer and reuse it for
  every mascot. Browsers cap the number of live 3D contexts, and one per tile
  or per render ends in a blank canvas that appears after the sixth click. Free
  the geometry and materials of each mascot once its image is made.
- **Rendering happens in the browser only.** It must not run during server
  rendering. If the page throws on first load, this is the first thing to check.
- **Sharp at full size.** Render each mascot large enough that it isn't scaled
  up when drawn at its largest on the pass. A mascot that's crisp in the picker
  and soft on the Story export is the failure to avoid.
- **Transparent edges must be clean.** No dark or light fringe when the mascot
  sits on a light background (Editorial, Pop) or a dark one (Night, Collector).
- **Same framing for all eight.** Same camera, same scale, same centre. Swapping
  mascots must not make the layout shift or the character jump around the slot.
- **No downloaded models, textures, environment maps or fonts.** Everything is
  built from code. Network traffic on load contains no model or texture file.
- **`three` is the one approved new dependency** for this phase. Use only what
  ships in the package. Anything else needs a question first.
- **The mascot's theme is data.** Colours, eye style and feature for each mascot
  sit in one list. Adding a ninth mascot is adding an entry, not new drawing
  code in the layouts.
- Drawing stays a pure function of data, style and size. The mascot chosen is
  part of that data, not something the renderer looks up on its own.
- Picker tiles are real buttons, reachable and operable by keyboard, with the
  selected state exposed to assistive technology and visible focus.
- Nothing is uploaded or sent anywhere.

## Acceptance check

1. Select each of the eight mascots in each of the four styles. Every
   combination renders, nothing is cut off, and no console errors appear.
2. Compare the eight side by side in one style. They are the same size and in the
   same place in the slot. Only the character changes.
3. Switch mascots fifty times quickly. Nothing slows down, nothing goes blank,
   and memory in the browser's task manager doesn't climb steadily.
4. Reload with the network tab open. No model, texture or environment file is
   requested.
5. On the Story and Square tabs, zoom the preview to 200%. The mascot edges are
   sharp and not blurry.
6. Look at the mascot's edges on Editorial and Pop (light backgrounds) and on
   Night and Collector (dark backgrounds). There is no halo or fringe.
7. Pick Atlas, then Helix. The Night glow, Editorial arch, Pop badge, Collector
   panel, tilted-size backdrop and stage glow all change colour with the pick,
   and Collector shows the mascot's name.
8. Force 3D to fail, for example by disabling hardware acceleration or by making
   the 3D start throw. The placeholder appears, one notice is shown, and
   unlocking, typing and switching styles still work.
9. Set an artwork image for one mascot in the config. That mascot uses the image
   and the other seven still use the 3D render.
10. Use the picker with the keyboard alone. Each tile is reachable, the selected
    one is announced, and focus is visible.
11. Load the page and view the first paint. The page is usable before all eight
    mascots have finished preparing.
12. `npm run build` and `npm run lint` pass, and the console is clean.

## Not in this phase

Animated or draggable mascots. Participants uploading their own mascot. New
styles or new sizes. Download, All sizes, Copy image and Copy caption. Any change
to the lookup or unlock behaviour.