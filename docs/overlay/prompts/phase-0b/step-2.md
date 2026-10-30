# Phase 0b · Step 2 · Replay durability

Launch line: `Run docs/overlay/prompts/phase-0b/step-2.md with handoff docs/overlay/handoffs/phase-0b-step-1.md`

Run on: Claude Sonnet 5.5 High or GPT-6.1 Sol high.

Read `docs/overlay/prompts/_preamble.md`. Gate: the Phase 0b step-1 handoff exists; stop for unanswered questions. Use `overlay/phase-0b-step-2` from the current `origin/overlay/main`.

## Read

`docs/overlay/07-roadmap.md` Phase 0b step 2 and exit; `03-cost-ledger-and-pressure.md` A; `spikes/token-semantics.md`; `docs/internals/effect-services.md`; `.repos/effect-smol/LLMS.md`; `apps/server/src/orchestration-v2/EventStore.ts`, `EventSink.ts`, `ProviderEventIngestor.ts`; `apps/server/src/persistence/OrchestrationEventStore.ts` and its test layers.

## Do

1. Trace actual persisted provider-turn events and app-thread/run links. Establish a restart-stable key for strong and weak native identities; do not invent an in-memory ordinal that resets on restart.
2. Add only `apps/server/src/routing/ReplayDurability.spike.test.ts` and necessary test fixtures/helpers under that overlay directory. Use real SQL/event-store test layers and test-only ledger/cursor tables, not a Map imitation. No production service, migration or subscription.
3. Prove cumulative replacement, duplicate delivery, late correction, partial-to-complete usage, restart mid-turn and rebuilt totals equal live. Inject failure between row upsert and cursor write; rollback must preserve both, replay must apply the event once. Restart with persisted state, not a new empty database.
4. Use TestClock/Deferred/Queue or drain the effect worker for milestones; no sleep, polling or per-test timeout. Follow repo-local test commands.
5. Write `docs/overlay/spikes/replay-durability.md`: executable proof, stored identity fields, cursor transaction boundary, source/event-retention gaps and implications for 03/04. Missing reconstructable usage is a finding, not permission to invent tokens. Carry the sync open item forward.

## Accept

`cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts` and root `vp run check:changed origin/overlay/main` pass. Include a controlled failing run with the cursor/upsert atomicity deliberately broken, then restore the passing prototype. No production runtime change.

## Handoff

Write `docs/overlay/handoffs/phase-0b-step-2.md` using 10 section 2. Next: `Run docs/overlay/prompts/phase-0b/step-3.md with handoff docs/overlay/handoffs/phase-0b-step-2.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high`.

## Finish

Commit, push and open this thread's PR into `overlay/main` as the preamble's "Branch and PR" section says, then stop. Your launch line is the developer's explicit request for that PR, so AGENTS.md's ask-first rule is already satisfied; do not stop short of it. Never merge.
