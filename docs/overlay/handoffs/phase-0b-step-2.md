# Handoff · Phase 0b · Step 2 · 2026-10-31 · written by Codex

commit: 8253ec10c01a2948816da8bcfd787d189d699c3d
supersedes: docs/overlay/handoffs/phase-0b-step-1.md

## Where we are

Branch `overlay/phase-0b-step-2` · worktree `/home/verox/src/t3code-phase-0`. Replay-durability investigation complete; Phase 0b remains incomplete. Implementation commit above; this handoff is committed afterward. [PR #21](https://github.com/VeroxAUS/t3code/pull/21) into `overlay/main` is open; local checks pass, CI completion is not claimed. Never merge from this thread.

## Done, verified

- Pushed the step branch and opened [PR #21](https://github.com/VeroxAUS/t3code/pull/21) into `overlay/main`; not merged. Evidence: `gh pr view 21 --repo VeroxAUS/t3code --json url,state,baseRefName,headRefName,statusCheckRollup` → OPEN, correct step head and integration base; CI completion remains unclaimed.
- Gate/base: `git fetch origin`, `git merge-base --is-ancestor origin/overlay/main HEAD`, `git rev-parse HEAD origin/overlay/main`, `gh pr view 20 --repo VeroxAUS/t3code --json state,mergeCommit` → clean existing step-2 branch at current `origin/overlay/main`, `a4a1f62aa91dee03c089026303020ce8c445f191`; step 1 merged at that SHA, no unanswered handoff questions.
- Added only `apps/server/src/routing/ReplayDurability.spike.test.ts`, `docs/overlay/spikes/replay-durability.md` and this handoff. `git diff --name-only origin/overlay/main` → overlay-owned paths only; no production runtime, migration, subscription, contract, UI or manifest change.
- Actual stored events and app-thread/run/attempt links traced read-only in the isolated `.t3/userdata/statev2.sqlite`. Proof: the Python command in `docs/overlay/spikes/replay-durability.md` → captures 148/189/252 agree with run and provider-thread links; attempt back-pointers are null. Claude refs change weak→strong→weak within one stored turn ID; normalized billable usage is only present at terminal events 148/189, absent from ACP 252.
- Real event-store/SQL prototype: `cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts` → 5 pass. Covers cumulative replacement, separately persisted duplicate snapshots, same/older-sequence redelivery, downward late correction, partial→complete, weak/strong/missing native refs, native-ID scoping, unavailable versus measured zero, and rebuilt rows/totals/cursor equal sequential live application.
- Persisted restart and transactional rollback: the same focused command → separate weak Claude-shaped and strong Codex-shaped cases close/reopen the same SQLite file twice, retain run/attempt/provider-thread attribution, roll back an injected failure between row upsert and cursor write, then replay the committed event once. No empty-database restart imitation, Map ledger, sleeps, polling or per-test timeout.
- Controlled negative: temporarily replace `return yield* sql.withTransaction(transaction)` in `apply` with `return yield* transaction`; the same focused command → exit 1, **2 failed / 3 passed**, both rollback assertions detect row input 150/sequence 5 with cursor still 4 instead of the preserved input 100/sequence 4. Restored wrapper → 5 pass. Local transcript `/tmp/phase-0b-step-2-nonatomic.log`; committed spike gives exact reproduction and failure values.
- `vp run check:changed origin/overlay/main` → format, lint, both knip stages, GraphQL check, affected server/scripts/evals typechecks and all 5 focused cases pass. Git subprocess EPERM required escalated execution. No repo-wide checks, browser/computer use or dev server.
- Read-only sync check: `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` → only successful manual [run 40822950375](https://github.com/VeroxAUS/t3code/actions/runs/40822950375). Scheduled evidence and support ticket **#4927935** remain pending; no dispatch/settings mutation.

## Not done / deferred

- Production ledger/key policy, strong-native alias reconciliation across historical reimports, missing-run/native-child attribution, rate/model pinning, pricing and root rollups belong to Phase 1 design/implementation. No developer policy decision was added to `docs/overlay/decisions.md`.
- Concurrent live/rebuild queuing, provider continuation after an actual process kill and OS/power-loss durability are not proved by orderly SQL/service-scope restarts. Inputs to this prototype are serialized in event sequence order.
- A terminal usage event never emitted/committed cannot be reconstructed. Streaming context snapshots, missing ACP billable buckets and partial/missing counters remain unknown; native-subagent inclusion and provider normalization across a runtime restart remain unproven. No fresh live provider calls were needed for this SQL spike.
- Step 1's untested live cumulative/reset/steering/interrupted/reasoning/subagent behaviors, OpenCode 2 and other ACP live coverage remain limited as recorded there. Step 3 permissions, step 4 workspace isolation and step 5 independent Claude Credit/batch billing remain outstanding.

## Decisions made and why

- No new developer policy decisions. The test prototype keys `(event.threadId, turn.providerThreadId, turn.id)` for all native-ref strengths and stores native identity/run/attempt/ordinal as evidence. This uses persisted identity and survives observed ref-strength changes; it is a finding for 03 A rule 1, not an accepted production schema change.
- Latest cumulative snapshots replace prior values, including lower corrections; upsert/cursor commit together. Missing usage stays null/unavailable and complete-but-missing-cache snapshots stay unknown for accounting. `known_input` is explicitly a subtotal, not complete spend.
- Implications for 03/04: require attributable, complete and priced usage before reservation reconciliation; missing usage cannot be free work. Native-child scope, rates and retained source history still constrain any rebuild claim.

## Gotchas discovered

- Actual log remains `orchestration_events`, V2 thread rows, not `orchestration_v2_events`. Global sequences can have gaps; consume ordered agent events after the cursor without requiring consecutive numbers.
- Claude capability is weak, yet live running snapshots have strong refs before reverting to weak at completion. Do not select a new row key from each snapshot's ref strength or changing message cursor. Codex can start with a null native ref before discovering a strong one.
- `runAttempt.providerTurnId` is null in all three live captures. Use the turn's `runAttemptId` and event envelope's `runId`; do not require the reverse pointer. Multiple native turns can share an attempt; arbitrary historical/native turns can lack run attribution.
- Current event compaction retains provider-turn/provider-thread/run/attempt events, but skips/deletes some legacy history. A replay cannot recreate normalized usage never committed, and a provider-turn projection alone is not the event log. `Sqlite.ts` uses WAL/NORMAL, not a power-loss guarantee.
- SQL fixtures are synthetic, not fresh provider/billing evidence. Captured runtime versions are inherited from step 1: Claude 2.1.312, Codex 0.166.0, Antigravity 1.3.0. The isolated server remained stopped; retained provider state was only read.
- `IdAllocatorV2` lives in `packages/provider-core/src/server/IdAllocator.ts`. The new `apps/server/src/routing` directory is overlay-owned, so no upstream marker/CHANGES.md entry is needed.

## Developer actions

- Review/merge this step's PR when satisfied; the agent never merges. Start step 3 from updated `origin/overlay/main` after merging.
- Before step 3 live probes, restart the retained isolated home with `vp run dev --no-seed`, select/create a disposable project, and use a T3 thread with actual launch/delegation tools connected to it. Step 1's coordinator selected this checkout's `apps/server` project; disposable workspace isolation is still unproved. Supply provider sign-in/setup if needed; no plain-CLI substitute proves the T3 path.
- Before step 5, configure the separate Claude Credit instance using `docs/overlay/10-execution-plan.md` §8.1 and supply fresh isolated billing readings or the browser authorization required by that step. Subscription and credit instances stay separate.
- Sync: disable/enable was already done; support ticket **#4927935** remains pending. At the next relevant daily slot, run `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url`; record an actual scheduled run URL or support response. If upstream releases a new tag while scheduling is broken, the developer can run `gh workflow run overlay-sync.yml --repo VeroxAUS/t3code --ref overlay/main` and record its URL as manual evidence only. This thread did not dispatch it.

## Open questions for the developer

- none

Next: Run docs/overlay/prompts/phase-0b/step-3.md with handoff docs/overlay/handoffs/phase-0b-step-2.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high
