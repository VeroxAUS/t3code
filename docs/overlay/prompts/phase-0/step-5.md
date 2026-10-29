# Phase 0 · Step 5 · docs/overlay

Launch line: `Run DOCS/prompts/phase-0/step-5.md with handoff DOCS/handoffs/phase-0-step-4.md`

Run on: Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium.

Read `_preamble.md`. Gate: the step-4 handoff exists.

## Read

`DOCS/README.md`; `DOCS/10-execution-plan.md` section 4 (the eight review briefs); `DOCS/09-risks-and-open-questions.md` section "Answers recorded".

## Do

1. `git mv docs/multi-agent-harness docs/overlay` (the developer pre-step put it in this repo). Fix relative links. `prompts/` and `mockups/` move with it.
2. Add `docs/overlay/CHANGES.md`, the manifest: one line per changed upstream file so far (steps 2, 3's root `package.json` edit, and 4) with path, reason and `marker: yes|no`, merging any file step 2 created; plus a `Test command` section naming `vp run check:changed` and `vp test run <files>` for this repo. Add an empty `docs/overlay/spikes/` for Phase 0b. Add `decisions.md` with a dated header and the decisions already recorded under "Answers recorded". Make sure `handoffs/` holds the Phase 0 handoffs written so far; move them if they were written elsewhere.
3. Add `docs/overlay/review-briefs/`: one file per bullet in `10-execution-plan.md` section 4 item 2 (eight files), each a read-only brief in the shape of `prompts/_review.md`, naming the files and invariants to check.
4. Check the hook table in `02-architecture.md` against this checkout: files and marker names, not line numbers. Fix what moved.

## Accept

`vp run check:changed` passes; every relative link in `docs/overlay/README.md` resolves (check with a short script, quote its output).

## Handoff

`docs/overlay/handoffs/phase-0-step-5.md`. From here `DOCS` is `docs/overlay`. Next line: `Run docs/overlay/prompts/phase-0/step-6.md with handoff docs/overlay/handoffs/phase-0-step-5.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high`.
