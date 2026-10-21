# Phase 8 — NEXWIN identity

**Goal.** Anyone who opens the page should know within a second that it belongs
to NEXWIN, the Nexus Coding Club hackathon: its logo, its colours, its name in
the browser tab, its dates, tracks and stages, and its name on every pass. The
pass designs themselves stay as they are.

There is no separate event website. This pass page is the only page, so
everything the event needs to say is said here, the QR needs to get connected to their project repo that will be done in next phase.

Read `AGENTS.md`, `project-doc.md` and this file. Where this file is more
specific, this file wins. It applies to whichever pass designs exist when the
phase starts. Do not redesign them.

## The data source: `hackathondata/`

Everything event-specific comes from the folder `docs/hackathondata/`. Do not type
event facts into the code from memory.

Expected contents:

| Item | Notes |
|---|---|
| `NEXWIN__fan & logo.png` | The logo: a glowing green isometric cube drawn in binary digits on black |
| `event.json` | Event details: dates, tracks, stages, at-a-glance facts. A first draft is provided |
| Register-form icon and header | The icon and header image used on the Devfolio registration form |
| Registrations | A Devfolio export or similar. Private, never committed |
| The handbook text, if supplied | For wording checks |

**First task:** list what is in the folder and what is missing, and wait for the
operator before guessing at anything absent. If a supplied file disagrees with
`event.json`, the supplied file wins and `event.json` is corrected. Items marked
`CONFIRM` in `event.json` are questions for the operator, not facts.

## Build

- **Brand assets from the logo.** The source image is detailed and is black-backed.
  Produce, with a repeatable script, a small set of variants and keep the source
  out of the shipped bundle:
  - *Glow mark* for dark backgrounds: the logo with its black removed, so only the
    glowing green remains and it blends cleanly over any dark surface.
  - *Simple mark* for small sizes and light backgrounds: a simplified drawing of the
    same cube silhouette, with the binary maze reduced to a few bold strokes, in
    solid green and in solid dark ink. The binary digits turn to mush below a few
    dozen pixels, so the detailed mark must not be used small.
  - *Lockup*: the mark with "NEXWIN" set in type, and a version with "by Nexus
    Coding Club" beneath. The wordmark is live text in the bundled fonts, never
    baked into an image.
  The operator approves the simple mark before it is used anywhere.
- **Favicon and app icons**, built from the simple mark so they read at 16 and 32
  pixels: a favicon, a vector version where supported, an icon for phone home
  screens, and the standard larger icons. Use the framework's file-based icon
  convention.
- **Share preview.** The image shown when the page's link is pasted into a chat
  app or social post: NEXWIN logo, name, tagline and the date line, in the brand
  look. It never contains participant data. The page title and description say
  NEXWIN and Nexus Coding Club.
- **A NEXWIN theme for the page.** Dark only. The brand is glowing green on black
  and loses its point in a light version, so the light and dark switching from
  earlier phases is retired for the page. Take colours from the logo: near-black
  background, a bright neon green, a deep green for panels and borders, an off-white
  for text and a soft green-grey for secondary text. Sample the real values from the
  logo and tune them. A faint binary-digit texture, drawn in code and static, may sit
  behind the header. No animation.
- **A header.** The mark, "NEXWIN", "Nexus Coding Club" and the tagline: "Find the
  problem. Build the solution. Show what you can do." The pass tool stays the main
  thing on the page and is reachable without scrolling.
- **Registration form assets.** Use the supplied icon and header image where they fit
  the brand: for example the header as a banner, the icon alongside the lockup. If
  their size or style doesn't fit, say so and propose a crop or use. Don't alter any
  text inside them.
- **Event details below the pass tool.** On this same page, after the tool, in this
  order, using the wording in `event.json` word for word:
  1. *At a glance*: the facts list.
  2. *How NEXWIN works*: the three stages and their one-line purposes.
  3. *Tracks*: five cards, each with the track label, name and focus line.
  4. *Schedule*: four milestones with their dates, times and descriptions, followed
     by the note that dates and timings may change.
  Keep it clean and quick to scan. Don't add invented copy, sponsors, FAQs, social
  links or a contact section.
- **The pass, content only.** The pass layouts do not change. Only these do:
  - the event badge and any event mark become the NEXWIN logo, using the simple mark
    wherever the detailed one would be too small or sits on a light background, and
    the glow mark on dark backgrounds;
  - the event name, short badge, date line and hashtags come from `event.json`;
  - there are five tracks, not six. The form lists each by label and full name. The
    pass shows the label ("Track 03") as before, and a track mark for each of the five;
  - the stamp or sticker that carries an event name now says NEXWIN 2026;
  - the caption and the alt text name NEXWIN and Nexus Coding Club.
- **The pass address and the QR code.** Both use the deployed address of this page,
  held as one value in the config. Until the operator provides it, don't draw a QR
  code or a web address on the pass. Never leave a placeholder address in place.
- **Registrations from Devfolio.** Write a small script that converts the supplied
  export into the record shape the lookup already uses. Show the operator the column
  mapping and wait for confirmation before running it on real data. Keep the output
  out of version control. If the export has no team ID, ask the operator whether to
  show none or to derive a short team code, and never invent one silently.
- **Remove every trace of earlier placeholders and any other event.** Sample event
  names, sample domains, example team names and the other event's branding.

## Constraints

- **Event facts are copied, not rewritten.** Names, dates, times and descriptions
  appear as written in the data source. Don't convert times, recompute weekdays or
  shorten the sentences. The "subject to change" note must be present.
- **The logo is theirs, not ours to redraw.** The glow mark is the supplied image with
  its background removed. The only redrawn artwork is the simplified small-size mark,
  and the operator approves it.
- **Clear space and minimum size.** Give the mark clear space equal to a fixed fraction
  of its size, and a minimum size below which only the simple mark is used. Write both
  in the config.
- **Edges are clean** on every background the logo meets: black, the page's panels, the
  passes' light and dark backgrounds, and the share preview.
- **Contrast follows the earlier rules.** Green on black is easy to read, but green on
  green, and thin glowing text on dark panels, are not. Check body and large text.
- **The pass design stays.** Layouts, type, colour logic, mascots and sizes are untouched
  except for the content changes listed above. A before and after comparison proves it.
- **No new pages, routes or links to places that don't exist.** The only links are to
  things the operator supplies.
- **Real participant data never enters the repo**, the bundle, the share preview or any
  log.
- **Images are optimised.** The full-size source logo is not served.
- **Accessibility.** The logo has a text alternative, headings are in a sensible order,
  the sections work by keyboard, and nothing relies on colour alone.
- **Fonts stay local.** No new family unless approved first.
- Nothing is uploaded or sent anywhere by the app.

## What changes from earlier phases

- Six tracks become five.
- The light and dark switching is retired for the page. It is dark only.
- The event name, address, dates and hashtags in the config come from the data source.
- The pass's event badge and event mark become the NEXWIN logo.

## Acceptance check

1. The inventory of `hackathondata/` is written down, and anything missing or marked
   `CONFIRM` was put to the operator.
2. View the logo variants on black, on white, on each pass background and on the page
   panels. The glow mark is clean on dark, the simple mark is clean on light, and no
   halo or black box shows anywhere. The operator has approved the simple mark.
3. Open the page in a browser tab and look at the favicon at 16 and 32 pixels, on a light
   and a dark tab bar, and as a phone home-screen icon. It is recognisable, not a blur.
4. Paste the page's link into a chat app. The title, description and preview image all say
   NEXWIN and none contains a participant's details.
5. Compare the page's details with `event.json`, word for word: all four milestones with
   their dates and times, the five tracks, the three stages and the change note.
6. At 375 pixels wide and on desktop, nothing scrolls sideways, the pass tool is visible
   without scrolling, and the sections can be reached and read by keyboard.
7. Run the contrast checks on the dark theme. Everything passes, with exceptions listed in
   the launch checklist.
8. Export all four styles and all sizes. The NEXWIN logo shows on each, and a side-by-side
   against the previous exports shows only the logo and text changes.
9. The track list has five entries. Each pass shows its "Track 0X" label and its track mark.
10. Until a pass address is configured, no QR code or web address appears. Once it is set,
    the QR code scans from a screen, a download and a printout, and opens this page.
11. Search the project for the other event's name and branding, sample domains, sample team
    names and the old placeholder event name. Nothing remains outside `docs/design-reference/`.
12. Run the registration converter on the operator's confirmed mapping. Look up a real test row
    that belongs to the operator. The output file is ignored by version control.
13. The supplied icon and header from the registration form are used, or the reason they
    weren't is written down.
14. `npm run build` and `npm run lint` pass, and the console is clean.

## Not in this phase

Any new page or route. Links to Devfolio, Discord or social accounts the operator hasn't
supplied. Sponsors, FAQs or a contact section. A light theme. Animated backgrounds. Changes to
pass layouts, mascots or sizes. Collecting post links or check-in scanning.