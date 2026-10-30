# Phase 0b · Step 5 · API-credit billing and phase completion

Launch line: `Run docs/overlay/prompts/phase-0b/step-5.md with handoff docs/overlay/handoffs/phase-0b-step-4.md`

Run on: Claude Sonnet 5.5 High or GPT-6.1 Sol high.

Read `docs/overlay/prompts/_preamble.md`. Gate: the Phase 0b step-4 handoff exists; stop for unanswered questions. Use `overlay/phase-0b-step-5` from the current `origin/overlay/main`.

## Read

`docs/overlay/07-roadmap.md` Phase 0b scope, step 5 and exit, and #37 in the promoted table; `10-execution-plan.md` sections 2 and 8.1; `decisions.md` 15 and this design round; all four prior spike docs and Phase 0b handoffs; the configured Claude adapter/text-generation paths; current official billing and Message Batches documentation.

## Do

1. Follow the roadmap's isolated billing protocol on `Claude Credit`: Haiku turn, Sonnet turn, title regeneration, then a separately identified Haiku batch through a temporary script. Preserve subscription credentials and settings; read no secret into the transcript or committed evidence.
2. Obtain developer-supplied billing/Max-window readings or explicit browser authorization. Record per-request attribution, usage, rate/date, precise charge where available, before/after balances and window readings. Separate measured charge from API-equivalent arithmetic; verify the batch discount. Rounded balances or overlapping work cannot prove each request's billing source.
3. Write `docs/overlay/spikes/api-credit.md` with in-T3 `go`/`no-go`, separate batch result, evidence and limits. Unresolved billing is inconclusive with the gate closed, not a success. No automatic spend escalation. Reuse the captures as token fixtures if useful; run any changed fixture tests.
4. Write an assumption-disposition table for 03/04/05 with evidence and unresolved choices; record developer-accepted changes in `decisions.md`. Do not implement future credit budgets, routing or digest here. Retain negative results without claiming missing required probes were performed.
5. Write `docs/overlay/handoffs/phase-0b-complete.md`: each exit criterion with command/result, coverage gaps or explicit developer deferrals, #37 checklist, billing gate and sync schedule URL/result or pending ticket #4927935. Link all five spike docs and follow the review pointer below.

## Accept

Root `vp run check:changed origin/overlay/main` passes; `cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts` and `cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts` pass. Five spike docs and the complete handoff exist. Required evidence is present or clearly unresolved; only the phase review declares passed.

## Handoff

Write `docs/overlay/handoffs/phase-0b-step-5.md` and the complete handoff. Both point to: `Next: Run docs/overlay/prompts/_review.md for phase 0b with handoff docs/overlay/handoffs/phase-0b-complete.md — on GPT-6 Astra high if Claude executed the phase, or Claude Opus 5.5 High if Codex executed it; for mixed execution, review the other vendor's changes per 10 section 1`.

## Finish

Commit, push and open this thread's PR into `overlay/main` as the preamble's "Branch and PR" section says, then stop. Your launch line is the developer's explicit request for that PR, so AGENTS.md's ask-first rule is already satisfied; do not stop short of it. Never merge.
