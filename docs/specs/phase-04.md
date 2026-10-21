# Phase 4 — Export, share and launch

**Goal.** A participant finishes their pass, downloads it or copies it, grabs a
caption, and posts it, all from a phone in under a minute. And the app is safe
and solid enough to put in front of real registrants.

Phases 1 to 3 are done: unlock, live preview, four styles, four sizes, eight 3D
mascots. This phase makes the pass leave the page, then tightens everything for
launch.

Read `AGENTS.md`, `project-doc.md` and this file. Where this file is more
specific, this file wins.

## Build

- **Download PNG.** Saves the pass at the size of the tab currently open. The
  file opens as a normal image at exactly that size.
- **All sizes.** Saves all four sizes, one after another, and says when it's
  finished.
- **Copy image.** Puts the pass on the clipboard as an image so it can be pasted
  straight into a post. Where the browser can't do that, the person is told in
  plain words and pointed to Download PNG.
- **Copy caption.** Copies a ready-to-post caption: what they're building, the
  team, the track, their GitHub link if they gave one, the event dates, the site
  and the hashtags. All event text comes from the config.
- **Share where it exists.** On devices that can share an image file through
  the system share sheet, offer a Share button that does it. Elsewhere the
  button doesn't appear.
- **Feedback on every action.** Each button confirms what happened ("Downloaded",
  "Image copied", "Caption copied") or says what went wrong. A busy state shows
  while an export is being made, and a double click can't start two exports.
- **Actions are locked until someone is found.** Before unlocking, the export
  buttons are disabled and look it, so nobody can download the placeholder pass.
- **Launch polish.**
  - A friendly state for each way the page can be empty, loading or failing.
  - Light and dark both look intentional, and animation respects a visitor's
    reduced-motion setting.
  - A real page title and description, a favicon, and a share preview image for
    the site's own link.
  - A short README: how to run it, how to change the event config, and how to
    replace the sample registrations with the real list.
  - A launch checklist file covering the checks below.

## Constraints

- **Export uses the same renderer on an off-screen canvas.** The preview on
  screen is never touched, resized or redrawn by an export. Anything else makes
  a download that differs from what the person was looking at.
- **Exported pixels match the size exactly:** 1080×1350, 1080×1080, 1200×630,
  1080×1920. Not scaled by the screen, not affected by zoom or screen density.
- **Fonts and the mascot are ready before an export starts.** If the 3D
  mascot isn't finished, the export waits for it. A pass saved with the
  stand-in or a fallback font is the failure to avoid.
- **File names are safe and predictable:** `builder-pass-{name}-{size}.png`, with
  the name reduced to letters, digits and dashes. If nothing is left after that
  (for example a name in a script the cleaner strips out), use a neutral word,
  never an empty or broken name.
- **Temporary file links are released** after each download so memory doesn't
  grow over repeated exports.
- **The caption never contains the email** and never shows "undefined", an
  empty line or a dangling link when the idea or GitHub handle is missing.
- **Failures are never silent.** Clipboard permission, an unsupported browser, a
  blocked download: each shows a message that says what to do next.
- **Several downloads in a row can prompt the browser for permission.** Handle
  it: space the downloads, and if one is blocked say so and offer to try again.
- **Nothing leaves the browser.** No uploading of passes, no tracking pixels, no
  analytics added in this phase.
- **Launch data is a one-file swap.** Replacing the sample registrations with
  real ones must only touch the single place the lookup reads from. Real data
  stays out of the repo.
- No new dependency.
- Do not change the lookup contract, the privacy rules, the config shape or the
  drawing behaviour from earlier phases unless this file says so.

## Acceptance check

1. Unlock a participant and download at each of the four tabs. Each file opens
   at exactly the right pixel size and looks identical to the preview.
2. Press All sizes. Four files arrive, named correctly, and the page says it's
   done. Press it twice quickly. Only one run starts.
3. Choose a mascot, immediately press Download before the page has finished
   preparing mascots. The file still has the 3D mascot, not the stand-in.
4. Paste the copied image into a chat app and an image editor. It arrives as the
   pass at the right size. In a browser that can't copy images, a clear message
   appears.
5. Paste the copied caption. It contains the idea, team, track, dates, site and
   hashtags, and a GitHub link only when a handle was given. Clear the idea and
   the handle and copy again: no blanks, no "undefined".
6. Search the caption and the exported image for the participant's email. It
   isn't there.
7. Before unlocking, every export button is disabled. After editing the email,
   they disable again.
8. Download a pass for a name that's mostly non-Latin characters and one with
   punctuation. The file names are valid and readable.
9. Run twenty exports in a row. Memory doesn't climb steadily and nothing slows.
10. Test on Chrome, Safari on iPhone, and Firefox. Download works in all three,
    Copy image works or fails with a clear message, and Share appears only where
    the device supports it.
11. Check the page at 375px, in light and dark, and with reduced motion turned
    on. Nothing breaks and animations stop or soften.
12. Open the page's link in a chat app. The title, description and preview image
    show up correctly.
13. Swap the sample registrations for a fresh file by editing only the one place
    the README names. Lookup works with the new data. Real data is not in the
    repo and is ignored by version control.
14. Run an accessibility audit in the browser. Score 95 or above, with every
    button labelled and every status announced.
15. `npm run build` and `npm run lint` pass, the production build runs, and the
    console is clean.

## Not in this phase

Collecting the link to a participant's post after they share. Check-in QR codes.
Accounts, server-side storage of passes, or an organiser dashboard. A landscape
layout built specially for Link. Participants uploading their own mascot.
Analytics.