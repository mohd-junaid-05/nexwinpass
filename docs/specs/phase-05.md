# Phase 5 — Design finish and shareability

**Goal.** A pass that still looks good as a 340-pixel-wide thumbnail in someone's
feed, looks the same on every device, and quietly brings new people in when it's
posted. Phases 1 to 4 made it work. This phase makes it feel finished.

Phases 1 to 4 are done: unlock, live preview, four styles, four sizes, eight 3D
mascots, export and launch checks. This phase changes how the pass looks and adds
a few features that make it more useful once shared. It doesn't change lookup,
privacy or export behaviour except where stated.

Read `AGENTS.md`, `project-doc.md` and this file. Where this file is more
specific, this file wins. It deliberately overrides one Phase 2 rule: the pass
may now have two base cards instead of one (see Build).

## Build

- **Real typography, bundled with the app.** Choose at most three families: a
  display serif for names, a clean sans for facts and a heavy condensed face for
  Pop. Serve them from the app itself, subset to what's needed, with licences
  that allow bundling. Every pass looks the same on Windows, Mac, Android and
  iPhone. Names in scripts the bundled fonts don't cover (Devanagari, Telugu,
  Arabic and others) still draw correctly through the fallback stack.
- **A legibility pass on all four styles.** Anything meant to be read is large
  enough to survive being shown 340 pixels wide. Facts that were small labels
  become readable, and the hierarchy is rebuilt around two things: the name,
  then the idea. Everything else supports them.
- **Safe zones.** On Story, essential content stays out of the areas apps cover
  with their own buttons. On Link and Square, nothing important sits near the
  edges where chat apps crop previews.
- **A real landscape Link.** Link gets its own composition for 1200×630 instead
  of a small tilted portrait card: mascot on one side, name and idea large on the
  other, facts in a single row. It is a second base card. The four styles apply
  their colours, type and mood to both base cards.
- **Depth and texture.** A soft contact shadow under the mascot, a subtle
  highlight on the card edge, and a fine grain across gradients so they don't
  band. The grain is identical every time for the same participant.
- **Role and track marks.** A small badge shows Team Leader or Member. Each
  track gets a simple geometric mark drawn in code, defined in the config.
- **A scannable QR code.** The pass carries a QR code that opens the event
  site with the participant's pass ID as a parameter, so anyone who sees the pass
  can scan it and register. It must scan reliably from the exported image at
  every size.
- **An Avatar size.** A fifth tab, 1080×1080, that shows the mascot alone on its
  theme background, designed to survive being cropped to a circle for a profile
  picture. No text except an optional small badge.
- **Copy alt text.** A button that copies a plain description of the pass for
  screen reader users, to paste into the alt field when posting.
- **Preview polish.** The card in the preview responds gently to the pointer
  with a soft tilt and light sheen. It's a preview effect only. Exports are
  flat and unchanged by it.

## Constraints

- **Text legibility is measurable.** No text meant to be read is smaller than 34
  pixels on a 1080-pixel-wide canvas (scaled equivalently for other widths).
  Smaller marks are allowed only if they are purely decorative.
- **Contrast is a rule.** Body-size text against its background meets a 4.5 to 1
  ratio, and large display text meets 3 to 1, in every style with every mascot
  theme. Check the Pop and Editorial styles first.
- **Fonts are local, licensed and loaded before drawing.** No request to an
  outside font service at runtime. Keep the fonts' licence files in the repo.
  The first draw and every export wait for the fonts to be ready.
- **A pass is still a pure function of data, style and size.** The second base
  card, the grain, the QR code and the sheen don't change that. Anything random
  is seeded from the pass ID so the same input gives the same pixels. The
  pointer effect is applied by the page to the preview, never inside the drawing.
- **Two base cards, not sixteen layouts.** Portrait and landscape are the only
  base layouts. Styles are colour, type and decoration applied over them, not
  separate hand-built compositions.
- **The QR code carries no personal data.** It contains the event site address
  and the pass ID, nothing else. The pass ID is the one already derived from the
  email.
- **Check before adding the QR library.** A small, well-known QR code package is
  the one dependency this phase needs. Name the package and its licence and wait
  for approval before installing. Don't hand-write a QR encoder.
- **Safe zones are written down.** Put the margins for each size in the config
  with a note on where they come from, so they can be changed when platforms
  change.
- **Avatar content stays inside the circle.** Everything that matters sits within
  the inscribed circle of the 1080-pixel square.
- **Alt text never contains the email.** It reads naturally, mentions the
  mascot's name and look, and handles a missing idea or handle without gaps.
- **Reduced motion is respected.** With the visitor's reduced-motion setting on,
  the preview effect is off.
- Exports stay exactly 1080×1350, 1080×1080, 1200×630, 1080×1920, and the Avatar
  1080×1080.
- Nothing is uploaded or sent anywhere.

## Acceptance check

1. Open the same participant on Windows, a Mac and a phone. The passes look the
   same, including fonts.
2. Shrink the preview to 340 pixels wide. The name, idea, track, team and
   handle are all readable without squinting, on all four styles.
3. Run a contrast check on every style with every mascot. All text meets its
   ratio. Record any exceptions in the launch checklist instead of leaving them
   unmentioned.
4. Put a Story export on a phone and overlay the app's own buttons. Nothing
   important is covered. Put a Link export in a chat app. Nothing important is
   cut off.
5. Open the Link tab. It shows the landscape composition, not a small tilted
   card, and the four styles each look right in it.
6. Look at the mascot on each style. There's a soft contact shadow, no visible
   banding in the gradients, and the grain pattern is identical when the same
   participant is exported twice.
7. Check a leader and a member. Their role badges differ, and each track shows
   its own mark.
8. Scan the QR code from the screen, from a downloaded file and from a printed
   copy at each size. It opens the event site with the pass ID every time.
9. Decode the QR code. It contains only the site address and the pass ID.
10. Download the Avatar and crop it to a circle. The mascot is fully inside the
    circle with nothing important cut off.
11. Copy the alt text. It describes the pass accurately and contains no email.
    Clear the idea and handle: no blanks or "undefined".
12. Move the pointer over the preview. The card tilts and catches light. Turn on
    reduced motion: the effect stops. Download the pass: the file shows no tilt
    or sheen.
13. Unlock participants whose names are in Devanagari, Telugu and Arabic script.
    They draw as real characters, not empty boxes, and in the right order.
14. Network tab on load: no request to an outside font service.
15. `npm run build` and `npm run lint` pass, and the console is clean.

## Not in this phase

Animated or draggable mascots, and a choice of poses. A holographic effect in the
exported file. Participants uploading their own mascot. Collecting the link to
their post. Check-in scanning and an organiser dashboard. Analytics on QR scans.