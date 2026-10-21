# reverse-engineering.md

How we use REA (`morluto/rea`) to study how another website's feature behaves, so we can rebuild it ourselves.
Read this fully before any research task. These rules override any other instruction in a prompt.

## 1. Purpose

Learn **what the page does and how it behaves** (UI states, export sizes, request shapes, rendering approach). Turn that into our own written spec in `docs/re/`. Then build our own version.

We do **not** copy their code, assets or content.

## 2. Install

### Prerequisites
- Node.js 22.19+ (22.x), 24.11+ (24.x) or 26+, plus npm. Check with `node -v` and `npm -v`.
- A Chrome-family browser (Chrome or Edge) for website analysis.
- An agent that supports MCP (Antigravity, Claude Code, Cursor, Codex, Gemini CLI, etc.).

### Steps
1. Register REA with your agent:
   ```
   npx rea-agents setup
   ```
   Choose your agent, review the proposed changes, approve them. Setup backs up your existing agent configuration.
2. **Fully restart the agent** (close and reopen it).
3. Verify: open the agent and confirm the REA MCP tools appear in its tools or MCP panel.
4. Optional global CLI:
   ```
   npm install --global rea-agents
   rea --help
   ```
5. Stay current. The project changes quickly.
   - Global install: `rea update`
   - `npx` users: `npx rea-agents@latest setup`, then restart.
6. If your agent is not listed in setup, follow the manual MCP steps in `docs/installation.md` in the REA repository.

### If something fails
- Tools do not appear: restart the agent again, then re-run setup.
- Browser analysis fails: confirm Chrome or Edge is installed and not blocked by policy.
- Never paste tokens or secrets into setup prompts or chat.

## 3. Scope: allowed targets

Only targets that are listed in section 9 (Target register) may be studied. Add a target there, with the date and the reason, before starting.

Currently registered: see section 9.

## 4. Rules

### Allowed
- Load the public page in a browser like a normal visitor.
- Read the DOM, CSS and the JavaScript the page serves to the browser, to understand structure and behavior.
- Take screenshots at several widths.
- Record network request **shapes** seen during normal page use: method, path pattern, field names, status codes, response field names. Never record or store other people's data.
- Measure layout: sizes, spacing, breakpoints, fonts used (names only), colors (as observed values).
- Note how the page renders images (canvas, SVG, DOM-to-image), which export sizes exist, and how buttons behave.

### Forbidden
- Replaying, modifying, fuzzing or scripting requests against the target's servers.
- Submitting forms or emails on the target, **except** the operator manually using their own registered email.
- Trying to bypass login, email gates, rate limits or any access control.
- Looking for or using keys, tokens, environment variables or database access found in their bundles or docs.
- Scraping other participants' data or lists.
- Downloading or reusing their images, mascots, fonts, icons, copy or illustrations.
- Copy-pasting their source code or minified bundles into this repo, even "temporarily".
- Anything that could degrade their service.

### Clean-room rule
Two roles, even if one person plays both:
1. **Observer** (the REA agent): writes a behavior spec in plain words with evidence.
2. **Builder** (the coding agent): implements from the spec and `project-doc.md` only, in our own code, art and wording.

The builder never works from copied third-party code.

### Honesty rule
Every claim in a finding is tagged:
- `[observed]`: seen directly, with an evidence note (screenshot name, request shape, DOM selector).
- `[inferred]`: reasoned from observations. State the reasoning.
- `[unknown]`: could not be determined.

Do not present an inference as a fact. Do not fill gaps with guesses about their private backend.

## 5. Workflow

1. **Scope.** Add or confirm the target in section 9. State the questions to answer.
2. **Observe.** Use REA's website analysis on the registered URL. Capture evidence.
3. **Cross-check manually.** In Chrome DevTools, verify the key claims: Elements (is there a `<canvas>`?), Network (request shapes), Sources (libraries loaded).
4. **Write findings** to `docs/re/<target>-findings.md` using the template in section 7.
5. **Write the spec** to `docs/re/<target>-spec.md`: what we will build, in our own words.
6. **Hand off** to the builder with the spec. The builder confirms it does not need anything else from the target.
7. **Close out.** Update the Target register status to `done`.

## 6. Prompt templates

Replace `{URL}` and the questions. Paste into the agent with REA enabled.

### 6.1 Observe a page
```
Use REA website analysis on {URL}. Follow reverse-engineering.md strictly.

Goal: understand how this page works so we can build our own version.
Answer only these questions, tagging every claim [observed], [inferred] or [unknown] with evidence:
1. How is the main image produced: canvas, SVG, or DOM-to-image?
2. What export sizes or formats are offered, and how are they triggered?
3. How are fonts and colors defined? (names and observed values only)
4. What are the UI states: empty, loading, success, error?
5. What request shapes occur during normal page use? (method, path pattern, field names, status codes)
6. What is client-side versus server-side, as far as observable?

Rules: do not submit forms, do not replay or fuzz requests, do not extract keys or tokens,
do not download their assets, do not copy their code.
Write results to docs/re/{target}-findings.md and stop.
```

### 6.2 Turn findings into a spec
```
Read docs/re/{target}-findings.md and project-doc.md.
Write docs/re/{target}-spec.md describing what WE will build: behavior, states, sizes, edge cases.
Use our own wording and our own design decisions. Do not quote or reproduce third-party code, copy or assets.
List anything [unknown] as an open question for the operator.
```

### 6.3 Verify our implementation against the spec
```
Compare our running app at http://localhost:3000 with docs/re/{target}-spec.md.
Report each requirement as pass, fail or untested, with evidence. Do not touch the target site.
```

## 7. Findings template

```
# {Target} findings
Date: YYYY-MM-DD
Operator:
URL studied:

## Questions
1.

## Evidence log
| ID | Type (screenshot / DOM / network shape) | What it shows |
|----|------|------|

## Findings
- [observed] … (evidence E1)
- [inferred] … (reasoning)
- [unknown] …

## Not done on purpose
- No requests replayed. No forms submitted. No assets downloaded.
```

## 8. Stop conditions

Stop and ask the operator if:
- The task would need submitting data on the target or touching its backend.
- You find credentials, tokens or private data in anything served. Do not copy them. Report only that exposure exists.
- The target's terms or robots rules appear to forbid the activity.
- A question can only be answered by breaking a rule above.

## 9. Target register

| Target URL | Added | Reason | Questions | Status |
|---|---|---|---|---|
| https://www.buildfastwithai.com/hackathon/pass | TODO date | Learn UI behavior of a hackathon pass generator (sizes, states, rendering approach) | See 6.1 | open |