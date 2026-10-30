# Phase 0b · Step 1 · Token semantics

Launch line: `Run docs/overlay/prompts/phase-0b/step-1.md with handoff docs/overlay/handoffs/phase-0b-design.md`

Run on: Claude Sonnet 5.5 High or GPT-6.1 Sol high.

Read `docs/overlay/prompts/_preamble.md`. Gate: the Phase 0b design handoff exists and its design PR is merged; stop for unanswered questions. Use `overlay/phase-0b-step-1` from the current `origin/overlay/main`.

## Read

`docs/overlay/07-roadmap.md` Phase 0b (scope, step 1 and exit); `03-cost-ledger-and-pressure.md` A; `decisions.md`; `packages/contracts/src/providerRuntime.ts` token schemas; the usage normalizers in Claude/Codex adapters, `packages/provider-acp/src/server/adapter.ts` and `apps/server/src/orchestration-v2/Adapters/AntigravityAdapterV2.ts`; `apps/server/src/usage/usagePricing.ts`; existing routing tests; `docs/user/providers-antigravity.md`.

## Do

1. Record checkout SHA, runtime versions and the exact instance/model/auth kind for Claude subscription, Codex and Antigravity/Google AI Pro. Missing setup is a developer action; do not silently substitute an API key, provider or Replay.
2. Collect step 1's live captures and available Replay/OpenCode 2/ACP fixtures per the roadmap. Correlate native usage with persisted normalized turn usage; label evidence provenance and any unsupported counters. Do not wait for step 5's independent billing captures.
3. Add pure `packages/routing/src/costs.ts` and `costs.test.ts`: disjoint cache buckets, reasoning counted once, cumulative snapshots, partial/unavailable and inconsistent counters, with hand-computed USD fixtures and pinned rates. Keep provider adaptation at a documented boundary; no T3 imports or live pricing calls.
4. Write `docs/overlay/spikes/token-semantics.md`: commands/results, per-provider field semantics, native-subagent scope, exact normalization proposal and limits. Record source-only providers as untested live. Do not fix upstream adapters in this spike.
5. Carry scheduled-sync status and support ticket #4927935 forward; inspect the read-only run-list command in the roadmap once, without dispatching.

## Accept

`cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts` and `vp run check:changed origin/overlay/main` from the repo root pass. Live Claude, Codex and Antigravity evidence exists, or the missing coverage remains explicitly incomplete for developer disposition. Fixtures prove arithmetic without pretending to prove live billing.

## Handoff

Write `docs/overlay/handoffs/phase-0b-step-1.md` using 10 section 2. Next: `Run docs/overlay/prompts/phase-0b/step-2.md with handoff docs/overlay/handoffs/phase-0b-step-1.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high`.

## Finish

Commit, push and open this thread's PR into `overlay/main` as the preamble's "Branch and PR" section says, then stop. Your launch line is the developer's explicit request for that PR, so AGENTS.md's ask-first rule is already satisfied; do not stop short of it. Never merge.
