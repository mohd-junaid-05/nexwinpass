# Phase 1 — Registration unlock

**Goal.** A registered participant types the email they signed up with and lands
in a form that already knows who they are. Anyone who isn't registered gets
nowhere and learns nothing.

The app is a fresh boilerplate. This phase is about what has to be true before
any pass can exist: the event config, the lookup, and the unlock flow. Nothing
is drawn yet.

Read `AGENTS.md` and `project-doc.md` first. Where this file is more specific,
this file wins.

## Build

- **One config file for the event.** Event name, badge text, site, dates,
  hashtags, the six tracks and the four export sizes all live in one place.
  Running a different event later means editing that file and nothing else.
- **A registrations file with fake participants.** Enough variety to break
  things: a team leader, a plain member, a very long name, a name typed in
  capitals, a participant with no idea title. The real list is never committed.
- **A lookup endpoint.** It takes an email and answers found or not found.
  Matching ignores case and surrounding spaces. A hit returns only what the
  pass needs: name, team, team ID, track, role, member count and an optional
  idea title. It never returns the email.
- **The endpoint pushes back on hammering.** Too many tries from one caller in
  a short window get a clear "wait a minute" answer.
- **The unlock form.** An email field and a Find me button, and Enter submits
  too. While the check runs the button is disabled and the status line says so.
  On success the status line turns green and reads
  `✓ Found you — Team Leader of {team} · {n} members`, singular for one member.
  On failure it shows one generic message.
- **Autofill, then lock.** A successful lookup fills name, team, team ID and
  track. Name, team and team ID become read-only with a dashed border. Idea
  title and GitHub stay editable, the idea capped at 60 characters, a leading
  `@` stripped from the GitHub handle. Track stays a select.
- **The form is locked until someone is found.** Before a successful lookup
  every field except the email is disabled and looks it. If the person edits
  the email after unlocking, the form locks again and has to be unlocked again.
- **The studio shell.** The page layout later phases render into: the form on
  the left, a preview area on the right that for now only says where the pass
  will appear, stacked on phones. It follows the system's light or dark setting.

## Constraints

- **The lookup happens on the server, and the list never leaves it.** Not in a
  bundle, not in a response, not in a prop handed to the page. Checking an
  email against a list in the browser looks finished and isn't, because anyone
  can read the list in the page source.
- **A miss and a hit must not be tellable apart by anything except the body.**
  Same status code, same generic message for every kind of failure. If the
  endpoint can be used to find out who is registered, it's broken.
- **Event text comes from the config and nowhere else.** A name, URL or date
  typed into a component is a bug that stays invisible until the second event.
- Use what the boilerplate already provides: its router, its language
  (JavaScript or TypeScript, whichever it started with) and its lint setup.
  Don't mix languages and don't migrate anything.
- **No new dependency.** This phase needs nothing the boilerplate doesn't ship.
  If one seems necessary, stop and ask.
- **The rate limiter lives behind one small function** so a shared store can
  replace it later. In-memory is fine for now.
- Nothing here needs a secret or an environment variable. If one appears,
  something has gone wrong.
- No database, no accounts, no cookies. The typed email is kept in page state
  only. Don't log full emails.
- Every input has a label, the status line is announced to screen readers, focus
  is always visible, and the whole flow works by keyboard alone.
- It has to hold up at 375px wide.

## Acceptance check

1. Look up each fake participant, including one typed in capitals and one with
   spaces around it. Each unlocks with the right values, and the status line
   reads correctly for a leader, a member, and a team of one.
2. Look up an email that isn't registered. The generic message appears and the
   form stays locked. In the network tab, compare that response with a hit: same
   status code, and the hit contains no email field.
3. View the page source and watch the network tab on load. The registration
   list appears nowhere.
4. After unlocking, try to type in name, team and team ID and fail. Idea title
   and GitHub accept input, the `@` disappears, and the idea stops at 60
   characters.
5. Edit the email after unlocking. The form locks again.
6. Send eleven lookups inside a minute. The eleventh gets the wait message, and
   a minute later lookups work again.
7. Use the page with the keyboard only, then with a screen reader. Every control
   is reachable, focus is visible, and the status changes are announced.
8. Narrow the window to 375px. Nothing scrolls sideways and the layout stacks.
9. Change the event name in the config file only. It changes everywhere it
   appears, with no other file edited.
10. `npm run build` and `npm run lint` pass, and the console is clean.

## Not in this phase

Drawing the pass. 3D mascots. The mascot and style pickers, size tabs,
downloads and caption. Real registration data. A database. Check-in QR codes.