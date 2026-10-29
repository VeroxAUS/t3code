# Fix findings for Phase N

Launch line: `Run DOCS/prompts/_fix.md for phase N with handoff DOCS/handoffs/<the review handoff named in its Next line>`

Run on: the "execute" column of `DOCS/10-execution-plan.md` section 1 for this phase.

Read `_preamble.md`. Gate: the named review handoff exists and has `status: findings`.

## Do

Work through the findings in severity order on branch `overlay/phase-N-fix` (`-2`, `-3` for later rounds; `overlay/final-fix` for phase `final`, whose findings live in `DOCS/handoffs/final-review*.md` and whose handoff is `final-fix.md`). For each: fix it or, if you believe it is wrong, write why under "Open questions" and leave it. A fix to logic gets a test that fails without it. Do not touch anything a finding does not name.

## Finish

Commit, push and open this thread's PR into `overlay/main` as the preamble's "Branch and PR" section says, then stop. Your launch line is the developer's explicit request for that PR, so AGENTS.md's ask-first rule is already satisfied; do not stop short of it. Never merge.

One PR titled `overlay: phase N fixes`. Write `DOCS/handoffs/phase-N-fix.md` (`-2`, `-3` for later rounds) listing each finding as fixed (with the proving command) or disputed, then one `Next` line. A fix never ends a phase; only a passed review does:

`Next: Run DOCS/prompts/_review.md for phase N with handoff DOCS/handoffs/<this file> — on <same reviewer, one effort level lower>`
