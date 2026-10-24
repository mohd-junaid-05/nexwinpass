# Phase 9 — Certificates (logic and dummy templates)

**Goal.** A participant opens a Certificates tab, enters the email they registered
with, and gets the right certificate or certificates for them: Participation,
Completion, or both, filled with their own name and team details, ready to download.
In this phase everything works end to end on **dummy** certificates. The real
designs arrive in Phase 10, and should need nothing more than dropping in files and
adjusting positions.

Phases 1 to 8 are done: the pass tool, the lookup, the NEXWIN theme and content.
This phase adds a second tab beside the pass and reuses the same lookup approach. It
does not change the passes.

Read `AGENTS.md`, `project-doc.md`, `hackathondata/event.json` and this file. Where
this file is more specific, this file wins.

## Questions for the operator first

Ask these before building. Don't guess the answers.

1. **Who gets the Participation certificate?** Every registered person, or only
   those who did something specific (for example submitted an idea)?
2. **Who gets the Completion certificate?** Presumably teams that made the final
   submission and presented. What is the exact rule, and who provides the list?
3. **Does each team member get their own certificate**, with their own name? (Assumed
   yes.)
4. **Is an email alone enough to download a certificate**, or should the person also
   enter their team ID? See "Who can download what".
5. **Which details appear on the certificates?** Candidates: the person's name, team
   name, team ID, track name, role, the event name and dates, and a certificate ID.

## The data

- Certificate eligibility comes from the organisers, not from the app. Each
  registered person has two flags, participation and completion, supplied in
  `hackathondata/` alongside the registrations, as extra columns or a separate list
  keyed by email.
- This data is private. It never enters the repository, the client bundle, or any
  log.
- For this phase create **dummy data** in a separate sample file with deliberately
  awkward cases: someone eligible for both, someone for participation only, someone
  for neither, a very long name, a name in Devanagari, Telugu and Arabic script, a
  team of one and a team of three.

## Build

- **A second tab.** The page gets two tabs, Pass and Certificates, in the NEXWIN
  theme. The pass tool is unchanged. Switching tabs never loses what the person
  typed.
- **One lookup shared by both tabs.** Finding yourself in either tab unlocks both.
  Changing the email locks both again, as in Phase 1.
- **The same unlock pattern as the pass.** Email field, "Find me" button, Enter
  submits, a status line that reads `✓ Found you — {role} of {team}`, and the same
  generic message when nothing is found.
- **Two certificate cards.** After a person is found, show a Participation card and a
  Completion card. Each shows either a live preview with actions, or a plain,
  kind explanation of why it isn't available, for example "Completion certificates are
  issued to teams that made a final submission." Never a blank space or a broken
  image. Support text for questions comes from the config.
- **Actions on an available certificate:** Download PDF, Download PNG, and Copy
  caption. The caption is a short, ready-to-post line that mentions NEXWIN and Nexus
  Coding Club.
- **A template system.** Each certificate type is described by a template entry in the
  config:
  - the background image and its pixel size;
  - the list of fields to fill. For each: the data it shows, its box (position and
    size), alignment, font, weight, colour, a largest and smallest size, how many
    lines it may use, and whether the text is shown as given or in title case;
  - whether it carries a certificate ID.
  Filling in a template is a pure function of the template and the person's data.
- **Fit the text, always.** Text shrinks to fit its box down to its smallest size, then
  wraps to its allowed lines, then is cut with an ellipsis. A long name never runs off
  the page or collides with another field. Names in other scripts draw correctly.
- **Dummy templates.** Make two obviously fake certificates, one for each type, with
  clear placeholder boxes, so the whole pipeline is exercised. Both carry a
  diagonal "SAMPLE" watermark and are visibly not real. Keep their files separate
  from where the real ones will go.
- **A placement overlay for development.** A debug mode, available only in development,
  draws each field's box over the template. It exists so that in Phase 10 positions can
  be tuned by eye. It must not exist in a production build.
- **PDF and PNG output.** The PNG is the template size. The PDF page matches the
  template's proportions, with the image embedded sharply. Choose and name the PDF
  package and its licence and wait for approval before adding it.
- **Certificate IDs.** If a template shows one, it is a short code the server
  computes from the person's details and a secret, so it can be checked later without
  a database. The same person always gets the same ID per certificate type. The email
  never appears on the certificate.
- **Safe file names**, such as `NEXWIN-participation-{name}.pdf`, reduced to letters,
  digits and dashes, with a neutral fallback if nothing is left.
- **A switch.** A single setting controls whether the Certificates tab appears. It is
  off in production until Phase 10 is finished and on in development and previews.
  Participants on the live page must never see dummy certificates.

## Who can download what

Anyone who knows a participant's registered email could download that person's
certificate, since an email isn't a secret. That is acceptable for participation
certificates, but a completion certificate carries more weight.

- Build an optional **second check** controlled by a setting: the person enters their
  team ID as well as their email. The operator decides, from question 4, whether it is
  on. It is off by default.
- A wrong email or a wrong second value both give the same generic message, never a hint
  of which part was wrong.

## Constraints

- **Eligibility is decided on the server and never trusted from the client.** The page
  asks, and the server answers. If the browser could simply claim "completed", it would
  be.
- **Only the person's own details are returned**, and only what the template needs.
  Never the email, never teammates' names, never the full list. Teammates' names
  stay out unless the operator explicitly approves them, because typing one member's
  email would reveal the rest of the team.
- **A miss and an ineligible person are handled carefully.** An unknown email and a
  wrong second value give the same generic message. A found person who isn't eligible
  for a certificate gets the kind explanation. That difference is intended and doesn't
  reveal anyone else's data.
- **Rate limiting** applies to this lookup in the same way as the pass lookup, and the
  limits are shared so someone can't double their attempts by using both tabs.
- **The name is not editable.** It is exactly what the registration holds. Corrections
  are made in the data, not on the page. The person can't type anything that appears on
  a certificate.
- **The secret fails loudly.** The certificate ID secret is an environment variable that
  is documented in an example file. If it's missing, the app refuses to start rather than
  producing IDs that can't be checked later.
- **Templates are data.** Adding a third certificate type means adding an entry and a
  background, not new drawing code. Phase 10 adds files and edits the config only.
- **Drawing stays a pure function** of template, data and size, with no reading of the page.
  Fonts are bundled and ready before any export, as in earlier phases.
- **Output is exact.** The PNG and the PDF match the preview. Exports wait until fonts and
  the background are ready.
- **No real participant data in the repository or the bundle.** Dummy data only.
- **Dummy certificates are impossible to mistake for real ones**, and cannot be reached in
  production while the switch is off.
- **Accessibility.** Tabs follow the proper tab pattern and work by keyboard. Statuses are
  announced. Every preview has a text description.
- No new dependency except the PDF package, once approved.
- Nothing is uploaded by the app other than the lookup request.

## What changes from earlier phases

- The page has two tabs. The pass tab behaves as before.
- The lookup response gains eligibility flags and the certificate fields, and the lookup is
  shared across the tabs.
- A new secret is introduced for certificate IDs, and a PDF package is added after approval.
- A setting hides the Certificates tab in production.

## Acceptance check

1. The five questions at the top were put to the operator and their answers are written in a
   short note in the repo.
2. With the switch off, a production build shows no Certificates tab, and the certificate
   routes and dummy files can't be reached. With it on, the tab appears.
3. Find the participant with both certificates: both cards show previews with the right name
   and team details. Find a participation-only person: Completion shows the kind
   explanation. Find the person with neither: both explain. Find an unknown email: the
   generic message.
4. Unlock in the Pass tab, then open Certificates: already unlocked. Change the email:
   both tabs lock.
5. Try to make the client claim completion, for example by editing the response in the
   browser tools. The server still decides, and nothing wrong can be downloaded.
6. Inspect the lookup response. It has no email, no teammates' names and no full list. The
   registration data appears nowhere in the page source or the bundle.
7. Use the longest name, and names in Devanagari, Telugu and Arabic script. Each fits its
   box, draws correctly and never collides with another field.
8. Turn on the development overlay. Every field box lines up with its text. Build for
   production: the overlay is gone.
9. Download PNG and PDF for each type. The files open correctly, match the preview, and
   the PDF is sharp when zoomed. File names are safe, including for the odd names.
10. Download the same certificate twice: same certificate ID. A different person gets a
    different one. Remove the secret: the app refuses to start with a clear message.
11. If the second check is turned on, a right email with a wrong team ID gives the same
    generic message as an unknown email.
12. Fire more lookups than the limit across both tabs. The limit applies once, and a minute
    later lookups work again.
13. Use both tabs by keyboard alone and with a screen reader. Tabs, statuses and previews
    are all usable.
14. Check at 375 pixels wide and on desktop. No sideways scrolling, and the cards stack.
15. `npm run build` and `npm run lint` pass, and the console is clean.

## Not in this phase

The real certificate designs and their field positions (Phase 10). A page that lets
someone verify a certificate by its ID. Emailing certificates. A way for participants to
request a name correction. Certificates for judges, mentors or organisers. Adding a
certificate to a LinkedIn profile automatically. Any change to the pass designs.