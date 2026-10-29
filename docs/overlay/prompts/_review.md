# Review of Phase N

Launch line: `Run DOCS/prompts/_review.md for phase N with handoff DOCS/handoffs/phase-N-complete.md`

Run on: the "review" column of `DOCS/10-execution-plan.md` section 1 for this phase, on the vendor that did not write it. Default mode; you edit only `DOCS/handoffs/`. You fix nothing.

Read `_preamble.md`. Gate: the named handoff exists (a complete handoff for a first review, a fix handoff for a re-review).

## Read

`DOCS/07-roadmap.md` Phase N (steps, exit criteria, promoted ideas), the design docs it cites, `DOCS/CHANGES.md`, every `DOCS/handoffs/phase-N-*.md`, and the diff of every PR they name. For phase `final`: read `DOCS/review-briefs/` and `DOCS/handoffs/final-*.md` instead of a roadmap phase, re-run only the briefs that had findings, and write `final-review-2.md`.

## Check, with evidence

- Each exit criterion in the roadmap, by running its command yourself.
- Every "Done, verified" line: re-run repeatable checks yourself; for mutations (a workflow dispatch, a PR, a protection change) inspect the evidence URL instead of repeating them; a Done line with neither a command nor evidence is a finding.
- `// overlay:` markers in the tree match `DOCS/CHANGES.md` in both directions.
- New non-trivial logic has a test at one layer; tests follow the repo's rules (no sleeps or polling, no wall-clock, drained effect worker).
- Repo rules: no repo-wide checks were run, settings fields have decoding defaults, UI changes hit every surface listed in `AGENTS.md`.
- Each promoted idea for this phase is implemented or deferred with a written reason.
- Instruction-text or tool-description changes have an eval case that was run, with the output in a handoff.
- Anything in the Fable final-round briefs (`DOCS/review-briefs/`) that this phase touches: privilege ceilings, replay idempotency, budget bypass paths, cache safety, settings migration.

## Write

`DOCS/handoffs/phase-N-review.md` (`-2`, `-3` for re-reviews) with a `status: passed` or `status: findings` line under the title, then findings as `{file, line, severity high|medium|low, claim, evidence, suggested fix}`, then one `Next` line:

- passed, phases 0 to 5 (phase order 0, 0b, 1, 2, 3, 4, 5, 6): `Next: Run DOCS/prompts/_design-round.md for phase <next in order> with handoff DOCS/handoffs/<this file> — on <model and effort>`
- passed, phase 6: `Next: Run DOCS/prompts/_final-review.md with handoff DOCS/handoffs/<this file>`
- findings: `Next: Run DOCS/prompts/_fix.md for phase N with handoff DOCS/handoffs/<this file> — on <execute model and effort>`

A re-review after a fix uses this same prompt with the fix handoff, one effort level lower, and writes `phase-N-review-2.md`.
