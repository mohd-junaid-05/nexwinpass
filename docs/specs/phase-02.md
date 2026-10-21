# Phase 2 — The pass

**Goal.** Once someone is unlocked, they see their own pass appear and update
live as they type. They can switch between four looks and four sizes, and every
one of them holds up with real-world names, not just tidy demo ones.

Phase 1 is done: the config, the lookup and the unlock form exist. This phase
draws. Nothing is downloadable yet, and the mascot is a stand-in.

Read `AGENTS.md`, `project-doc.md` and this file. Where this file is more
specific, this file wins.

## Build

- **A pass renderer.** Given the participant's details, a style and a size, it
  draws the finished pass onto a canvas. The same call must work for the
  on-screen preview and, later, for an off-screen canvas used for export.
- **Four styles.**
  - *Editorial.* Light paper background, a large serif name stacked over two
    lines, the idea title in an accent colour and italics, and the mascot
    sitting in an arched panel.
  - *Night.* Dark card, name on the left, mascot large on the right with a
    coloured glow behind it, and a scatter of small pixel squares along the top
    edge that is different for every participant but the same every time for
    the same one.
  - *Pop.* Bright yellow, a heavy condensed uppercase name, the idea title in a
    white boxed label with a thick border, the mascot in a circular badge, and a
    small "I'M IN" sticker.
  - *Collector.* Dark card with a gradient border, a coloured mascot panel
    across the top, the name large underneath.
- **Every style shows the same facts.** Event badge, name (title-cased even if
  typed in capitals), idea title, track, team and team ID, GitHub handle, a
  short pass ID and the site address.
- **A pass ID that is stable.** The same participant always gets the same ID,
  derived from their email, and the email itself never appears on the pass.
- **Four size tabs above the preview:** The pass (1080×1350), Square
  (1080×1080), Link (1200×630) and Story (1080×1920). The pass tab shows the
  card full-bleed. The other three show the card slightly tilted on a coloured
  backdrop, with the line "I'm building at {event}" above it and the site and
  dates below.
- **A style picker.** Four tiles, each a small live thumbnail of that style
  using the participant's real details. The selected one is clearly marked.
- **A mascot placeholder.** Until Phase 3, the mascot area shows a neutral
  stand-in, such as the participant's initials on a coloured shape. It sits
  behind one function that takes a mascot and a box and draws into it, so
  Phase 3 replaces the inside without touching the layouts.
- **Live preview.** Typing in any field updates the preview straight away. The
  preview area keeps its shape while sizes change so the page doesn't jump.

## Constraints

- **Drawing is a pure function of data, style and size.** It doesn't read the
  page, the form or any component state. If it did, exporting from an off-screen
  canvas in Phase 4 would mean rewriting it.
- **One base card, everything else derived from it.** The other sizes scale and
  place the same card. A second set of hand-tuned layouts per size is how four
  styles quietly become sixteen.
- **Text never overflows and never collides.** Measure before drawing. Shrink
  the name down to a floor, then cut with an ellipsis. Long idea titles wrap to
  a fixed number of lines and cut. Long team names and handles are cut to their
  column. A missing GitHub handle or idea title leaves no hole or the word
  "undefined".
- **The canvas keeps its full pixel size and is scaled down by CSS for display.**
  That keeps the preview sharp on high-density screens and means the pixels
  you see are the pixels that will be exported.
- **No outside fonts, images or icons.** Use the system font stacks already in
  the project, and wait for fonts to be ready before the first draw so the
  first frame isn't in a fallback face.
- **Colours and spacing for each style live together in one place per style.**
  A change to Night shouldn't require reading the code for Pop.
- **No new dependency.** Canvas 2D is built in.
- The pass is drawn from the form's current values, including before anyone is
  unlocked, using the placeholder participant. It must never show data from a
  previous lookup after the email changes.
- Nothing is uploaded or sent anywhere. Drawing is local to the browser.

## Acceptance check

1. Unlock the participant with the longest name and idea title. In every style,
   at every size, nothing overflows, overlaps or runs off the card.
2. Unlock the participant typed in capitals. The name appears title-cased on
   every style (Pop may show it in capitals by design).
3. Clear the GitHub field and the idea title. The passes show a sensible empty
   state with no hole, no "undefined", no stray `@`.
4. Inspect the canvas at each tab. Its width and height attributes are exactly
   1080×1350, 1080×1080, 1200×630 and 1080×1920.
5. Reload and unlock the same participant twice. The pass ID and the Night
   confetti pattern are identical both times. A different participant gets a
   different pair.
6. Search the drawn pass for the participant's email. It isn't there.
7. Type in the idea title field. The preview and all four style thumbnails
   change as you type, without visible lag.
8. Change the email after unlocking. The form locks and the pass goes back to the
   placeholder participant.
9. View the preview on a high-density screen or zoomed to 200%. Text edges
   are sharp, not blurry.
10. At 375px wide, the tabs, preview and style tiles fit with no sideways
    scrolling. The preview never exceeds the viewport.
11. `npm run build` and `npm run lint` pass, and the console is clean.

## Not in this phase

3D mascots and the mascot picker. Download, All sizes, Copy image and Copy
caption. A landscape layout built specially for Link. Custom fonts. Any change
to the lookup or unlock behaviour from Phase 1.