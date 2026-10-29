# Phase 0 · Step 7 · Port the usage strip from the `usage-strip` branch

Launch line: `Run docs/overlay/prompts/phase-0/step-7.md with handoff docs/overlay/handoffs/phase-0-step-6.md`

Run on: Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium.

Read `_preamble.md`. Gate: the step-6 handoff exists.

## Read

`git fetch origin usage-strip fork-main`; `git diff --stat v0.1.3..origin/usage-strip` to see what the branch changed; `apps/web/src/components/chat/UsageStrip.tsx` on that branch and every file the diff wires it into; `docs/overlay/06-cockpit-ui.md` section "Surfaces" (the usage rail).

## Do

1. Bring `UsageStrip.tsx` and its wiring onto this branch (`git checkout origin/usage-strip -- <paths>`, or cherry-pick if the commits are clean and do not touch anything else). Keep it where it lives; it becomes the seed of the team view's usage rail in Phase 5.
2. Wiring edits to upstream files get `// overlay:` markers and manifest lines in `docs/overlay/CHANGES.md`.
3. Where the strip computes anything the pressure signal in `03-cost-ledger-and-pressure.md` will own (remaining %, pace), leave it as is and note it under Open questions for the Phase 1 design round. Do not refactor.

## Accept

`vp run check:changed` passes; the strip renders in a dev run with the `Replay (dev)` provider (a screenshot path or one log line as evidence).

## Handoff

`docs/overlay/handoffs/phase-0-step-7.md`. Next line: `Run docs/overlay/prompts/phase-0/step-8.md with handoff docs/overlay/handoffs/phase-0-step-7.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high`.

## Finish

Commit, push and open this thread's PR into `overlay/main` as the preamble's "Branch and PR" section says, then stop. Your launch line is the developer's explicit request for that PR, so AGENTS.md's ask-first rule is already satisfied; do not stop short of it. Never merge.
