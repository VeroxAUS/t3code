# Final review round (Fable 5.1 Extra High)

Launch line: `Run DOCS/prompts/_final-review.md with handoff DOCS/handoffs/<the Phase 6 review handoff named in its Next line>`

Run on: Claude Fable 5.1 Extra High. Default mode; you edit only `DOCS/handoffs/` and, at the very end, one line in `DOCS/decisions.md`. You fix nothing.

Read `_preamble.md`. Gate: the named handoff is a Phase 6 review with `status: passed`.

## Gate, continued

Stop and tell the developer which of these failed:

1. For every phase in the roadmap's phase order, the review handoff named by that phase's chain (follow the `supersedes:` lines) has `status: passed`.
2. `DOCS/decisions.md` holds a line `overlay build in daily use since <date>` and that date is at least 14 days ago.

## Do

1. Write `DOCS/handoffs/final-review-plan.md` first: the commit SHA of `overlay/main` under review, the list of the eight briefs in `DOCS/review-briefs/`, and `status: in-progress`.
2. Run the first brief yourself. For each other brief, start a fresh thread with `Run DOCS/review-briefs/<brief>.md with handoff DOCS/handoffs/final-review-plan.md` on Fable 5.1 Extra High. Every brief thread writes `DOCS/handoffs/final-review-<brief>.md` with `commit:`, `status: passed` or `status: findings`, and findings as `{file, line, severity, claim, evidence, suggested fix}`.
3. When all eight brief handoffs exist, write `DOCS/handoffs/final-review.md`: status per brief, the union of findings, `status: passed` only if every brief passed, and one Next line.

## Next lines

- any findings: `Next: Run DOCS/prompts/_fix.md for phase final with handoff DOCS/handoffs/final-review.md — on Claude Sonnet 5.5 High`. For phase `final`, `_fix.md` reads the briefs and the final-review handoffs instead of a roadmap phase, and its handoff's Next line is `Run DOCS/prompts/_review.md for phase final with handoff DOCS/handoffs/final-fix.md — on Claude Fable 5.1 High`, which re-runs only the briefs that had findings and writes `final-review-2.md`.
- all passed: append `final review passed <date> at <SHA>` to `DOCS/decisions.md` and write `Next: none. The harness is ready to use on another repo.`
