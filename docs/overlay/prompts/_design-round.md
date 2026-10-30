# Design round for Phase N

Launch line: `Run DOCS/prompts/_design-round.md for phase N with handoff DOCS/handoffs/<the review handoff named in its Next line>`

Run on: the "plan" column of `DOCS/10-execution-plan.md` section 1 for phase N. Default mode, but you edit only files under `DOCS/`. No code. Use the developer-named design branch, normally `overlay/phase-N-design`, after fetching origin and verifying the integration base; do not create a step branch. For WIP resumes, preserve the existing branch and report any base drift.

Read `_preamble.md`. Gate: the named handoff is the review of the previous phase in the roadmap's phase order (0, 0b, 1, 2, 3, 4, 5, 6) and has `status: passed`. A same-phase WIP handoff is accepted only through the Interrupted design rounds rule below.

## Read

`DOCS/07-roadmap.md` (Phase N and the "Promoted from the backlog" table), `DOCS/08-idea-backlog.md`, `DOCS/inbox.md` (questions queued by `_ask.md` threads; each becomes a doc edit, a deferral or a drop, recorded in `decisions.md`, and the line is removed), the design docs that phase cites, `DOCS/decisions.md`, every handoff of the previous phase, unresolved decisions under this phase in the roadmap, `DOCS/spikes/*.md` when they exist, and `DOCS/prompts/phase-0/` as the model for step prompts.

## Do, with the developer in the loop

1. Walk the phase doc with the developer. Argue. Where the design changed since it was written (upstream drift, what the previous phase found, what shadow mode showed), edit the doc. Append each change to `DOCS/decisions.md` with the date and the reason.
2. Fold this phase's promoted ideas into the numbered step list in `07-roadmap.md`, each as its own step, or record a deferral with a reason.
3. Backlog review, one idea at a time, never as a list to approve. Take every row of `08-idea-backlog.md` whose Phase column names this phase or "later" and that is not already promoted. For each, give the developer a short brief: what it would change for them day to day, the evidence that it helps (what the previous phase or shadow mode showed, or "none yet"), the cost in steps and upstream files touched, and what breaks or gets harder if it is skipped; then your recommendation with the reason. Wait for the developer's call: promote (it becomes a numbered step and a row in the promoted table), defer (to a named phase, with the reason), or drop (the row stays in 08 with a "dropped" note). Record every call in `DOCS/decisions.md`. Already-promoted rows get the same brief if the developer asks for one.
4. Check the hook table in `02-architecture.md` against this checkout: the files and markers, not line numbers. Fix what moved.
5. Write one step prompt per numbered step at `DOCS/prompts/phase-N/step-k.md`, the same shape as the Phase 0 prompts: title, "Run on" model and effort from `10-execution-plan.md` section 1, read list, do list, acceptance with commands, handoff pointer. Under fifty lines each; point at doc sections rather than restating them. The last step's prompt also writes `handoffs/phase-N-complete.md` and points at `_review.md`.
6. Apply any phase gate from the roadmap (Phase 3: the shadow-mode gate) and stop if it is not met.

## Interrupted design rounds

If a usage window cuts this round short, commit and push the current docs on this same branch, including a clearly labelled WIP handoff at `DOCS/handoffs/phase-N-design-wip.md` (number subsequent WIP snapshots instead of overwriting one named by a launch line). Record the branch, last described commit, original passed-review handoff, completed edits and checks, accepted decisions, remaining backlog rows, and the exact pending question with its brief. Do not treat a recommendation or elapsed time as an answer. Do not open the final design PR or write a completion claim.

Resume with: `Run DOCS/prompts/_design-round.md for phase N with handoff DOCS/handoffs/phase-N-design-wip.md; resume branch <branch> — on <plan model and effort from 10 §1>`. A WIP handoff is accepted only for resuming this same phase and branch, and must name the original previous-phase review with `status: passed`; recheck that original gate. Fetch origin, inspect branch/diff, preserve accepted answers, and continue from the pending item. Do not restart the design or create a step branch. A fresh thread on the other vendor uses the plan column's frontier model. The final design handoff supersedes the latest WIP handoff and also names the original review.

## Finish

Commit, push and open this thread's PR into `overlay/main` as the preamble's "Branch and PR" section says, then stop. Your launch line is the developer's explicit request for that PR, so AGENTS.md's ask-first rule is already satisfied; do not stop short of it. Never merge. Every step prompt you write ends with a `## Finish` section containing this paragraph word for word.

One markdown-only PR titled `overlay: phase N design round`. The developer approves the prompts in that PR. Write `DOCS/handoffs/phase-N-design.md` with:

```
Next: Run DOCS/prompts/phase-N/step-1.md with handoff DOCS/handoffs/phase-N-design.md — on <model and effort>
```
