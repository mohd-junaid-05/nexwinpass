# CLAUDE.md

@AGENTS.md

The file above holds the shared rules for every agent. This file adds only what is specific to Claude Code.

## Read order

1. `AGENTS.md` (imported above)
2. `project-doc.md` for the goal, features, privacy rules and acceptance criteria
3. The current phase file, for example `docs/phases/phase-1.md`
4. `reverse-engineering.md`, only for research tasks

If two files disagree, the phase file wins over `project-doc.md`, and `AGENTS.md` rules on safety and copying always win.

## How to work

- **Work one phase at a time.** Build only what the current phase file lists under Build. Anything under "Not in this phase" stays unbuilt, even if it looks easy.
- **Plan before editing.** For each phase, use plan mode first. Write a short plan covering which files you will create or change, then wait for approval before editing.
- **Check the repo before assuming.** Read `package.json`, the existing folder structure and the language the boilerplate uses (JavaScript or TypeScript) before creating files. Match what is there.
- **Verify, don't claim.** After building, run `npm run build` and `npm run lint`, run the dev server, then go through the phase's Acceptance check item by item. Report each item as pass, fail or untested. Never say "done" for an item you did not run.
- **Be honest about gaps.** If something could not be tested here (for example clipboard behavior or a screen reader), say so plainly.
- **Keep changes small.** One feature per commit-sized change, with a one-line summary of what changed.

## When to stop and ask

- A task needs a new dependency.
- The phase file and `project-doc.md` conflict.
- A requirement is ambiguous in a way that would change the design.
- Research would require breaking a rule in `reverse-engineering.md`.

## Research with REA

- REA is registered as an MCP server (see `reverse-engineering.md`, section 2). Confirm its tools are available before starting research.
- Only study targets listed in the Target register. Observe and write findings, never copy code or assets, never replay or modify requests, never submit forms on the target.
- Write findings to `docs/re/`, tag every claim `[observed]`, `[inferred]` or `[unknown]`, and build only from the spec.

## Commands

```
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Do not

- Edit `AGENTS.md`, `project-doc.md`, a phase file or this file unless asked. Suggest the change instead.
- Commit `.env` files, real participant data or anything from `node_modules` or `.next`.
- Leave debug logging of emails or other personal data in the code.