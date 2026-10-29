# Design round for Phase N

Launch line: `Run DOCS/prompts/_design-round.md for phase N with handoff DOCS/handoffs/<the review handoff named in its Next line>`

Run on: the "plan" column of `DOCS/10-execution-plan.md` section 1 for phase N. Default mode, but you edit only files under `DOCS/`. No code.

Read `_preamble.md`. Gate: the named handoff is the review of the previous phase in the roadmap's phase order (0, 0b, 1, 2, 3, 4, 5, 6) and has `status: passed`.

## Read

`DOCS/07-roadmap.md` (Phase N and the "Promoted from the backlog" table), the design docs that phase cites, `DOCS/decisions.md`, every handoff of the previous phase, `DOCS/spikes/*.md` when they exist, and `DOCS/prompts/phase-0/` as the model for step prompts.

## Do, with the developer in the loop

1. Walk the phase doc with the developer. Argue. Where the design changed since it was written (upstream drift, what the previous phase found, what shadow mode showed), edit the doc. Append each change to `DOCS/decisions.md` with the date and the reason.
2. Fold this phase's promoted ideas into the numbered step list in `07-roadmap.md`, each as its own step, or record a deferral with a reason.
3. Check the hook table in `02-architecture.md` against this checkout: the files and markers, not line numbers. Fix what moved.
4. Write one step prompt per numbered step at `DOCS/prompts/phase-N/step-k.md`, the same shape as the Phase 0 prompts: title, "Run on" model and effort from `10-execution-plan.md` section 1, read list, do list, acceptance with commands, handoff pointer. Under fifty lines each; point at doc sections rather than restating them. The last step's prompt also writes `handoffs/phase-N-complete.md` and points at `_review.md`.
5. Apply any phase gate from the roadmap (Phase 3: the shadow-mode gate) and stop if it is not met.

## Finish

Commit, push and open this thread's PR into `overlay/main` as the preamble's "Branch and PR" section says, then stop. Your launch line is the developer's explicit request for that PR, so AGENTS.md's ask-first rule is already satisfied; do not stop short of it. Never merge. Every step prompt you write ends with a `## Finish` section containing this paragraph word for word.

One markdown-only PR titled `overlay: phase N design round`. The developer approves the prompts in that PR. Write `DOCS/handoffs/phase-N-design.md` with:

```
Next: Run DOCS/prompts/phase-N/step-1.md with handoff DOCS/handoffs/phase-N-design.md — on <model and effort>
```
