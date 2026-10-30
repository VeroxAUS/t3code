# Replay durability spike

Baseline: `a4a1f62aa91dee03c089026303020ce8c445f191` (`origin/overlay/main`, merge of step 1, PR #20). Investigation: 2026-10-31. Executable proof: `apps/server/src/routing/ReplayDurability.spike.test.ts`. This is a test-only SQL prototype, not a ledger service, migration, subscription or provider recovery implementation.

## Persisted evidence and identity

`orchestration-v2/EventStore.ts` delegates to `persistence/OrchestrationEventStore.ts`. The log is **`orchestration_events`**, filtered to `aggregate_kind = 'thread'` and `application_event_version = 2`. `sequence` is global, `stream_id` is the app thread, `event_id` identifies one persisted event, `payload_json` contains the full provider-turn snapshot, and `metadata_json` retains optional `runId`, `nodeId`, `driver`, `providerInstanceId` and `rawEventId`. `EventSink.ts` commits events, projections and command/outbox state together before publishing. Analytics' in-memory completion dedupe in `ProviderEventIngestor.ts` is not a durable source or cursor.

Read-only examination of step 1's isolated `.t3/userdata/statev2.sqlite` found these events for the same stored turn ID within each capture:

| Capture         | Persisted turn events                                                    | Billable reconstruction                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude          | 136 running/weak; 143 and 147 running/**strong**; 148 completed/**weak** | Only 148 has `turnTokenUsage`: complete, input 26617, read 12941, write 13674, output 15, reasoning 0. Streaming snapshots have `tokenUsage`, a different context contract. |
| Codex           | 184 and 188 running/strong; 189 completed/strong                         | Only 189 has `turnTokenUsage`: complete, input 21097, read 11648, write 0, output 8, reasoning 0. Event 188 has context `tokenUsage`.                                       |
| Antigravity/ACP | 246 running/weak; 252 completed/weak                                     | Neither has billable usage. Thread events 248/253/257 have context occupancy 14090/1048576, which cannot supply billable buckets.                                           |

These reuse step 1's captures, not fresh provider calls. Runtime versions remain the captured Claude 2.1.312, Codex 0.166.0 and Antigravity 1.3.0; provider provenance and token-only native comparisons are in [token-semantics.md](token-semantics.md). No server or browser was started for this step.

The event envelope's `threadId` and `runId` agree with persisted `run.created`/`run.updated`. The turn's `runAttemptId` links to `run-attempt.created`/`updated`, whose `runId` agrees with that envelope. Its `providerThreadId` links to `provider-thread.updated`, whose `appThreadId` agrees with the envelope. In all three captures, every matching attempt's `providerTurnId` is **null**; that reverse pointer cannot be required for attribution. Contracts permit null `runAttemptId` and absent event `runId`, notably for native children, so arbitrary historical turns are not guaranteed an attributable app run.

Reproduce the identity/link examination without printing native IDs or prompts, from the repository root:

```bash
python3 - <<'PY'
import json, pathlib, sqlite3
p = pathlib.Path('.t3/userdata/statev2.sqlite').resolve()
db = sqlite3.connect(p.as_uri() + '?mode=ro', uri=True)
for terminal in (148, 189, 252):
    thread, metadata, payload = db.execute('''
        SELECT stream_id, metadata_json, payload_json
        FROM orchestration_events WHERE sequence = ?
    ''', (terminal,)).fetchone()
    meta, turn = json.loads(metadata), json.loads(payload)
    events = [(s, k, json.loads(v)) for s, k, v in db.execute('''
        SELECT sequence, event_type, payload_json FROM orchestration_events
        WHERE stream_id = ? ORDER BY sequence
    ''', (thread,))]
    turns = [(s, v['status'], (v.get('nativeTurnRef') or {}).get('strength'),
              v.get('turnTokenUsage'), 'tokenUsage' in v)
             for s, k, v in events if k == 'provider-turn.updated' and v['id'] == turn['id']]
    attempts = [v for _, k, v in events if k.startswith('run-attempt.')
                and v['id'] == turn['runAttemptId']]
    runs = [v for _, k, v in events if k in ('run.created', 'run.updated')
            and v['id'] == meta['runId']]
    threads = [v for _, k, v in events if k == 'provider-thread.updated'
               and v['id'] == turn['providerThreadId']]
    assert attempts and runs and threads
    assert all(v['runId'] == meta['runId'] for v in attempts)
    assert all(v['threadId'] == thread for v in runs)
    assert all(v['appThreadId'] == thread for v in threads)
    print(terminal, turns, 'attempt back-pointers null:',
          all(v['providerTurnId'] is None for v in attempts))
PY
```

The replay key demonstrated here is **`(event.threadId, turn.providerThreadId, turn.id)`**, for strong, weak and missing native refs. All three fields are already persisted; no counter is allocated during replay. `run_id` and `attempt_id` are attribution fields, not required key components. A missing run remains null. `ProviderTurnStartService.ts` derives new turn ordinals from persisted projection turns; a replay consumer must not replace them with a process-local counter. `packages/provider-core/src/server/IdAllocator.ts` derives provider-turn IDs, and the adapters retain the context's provider-turn ID while updating its native ref.

The prototype stores the native ref (driver, native ID, strength and optional fingerprint/ordinal) as evidence, plus ordinal, provider instance/driver, run/attempt, source event ID and sequence. Strong native IDs need provider-session/thread and instance scope; the test intentionally uses the same turn/native ID in two provider threads without collapsing them. Weak Claude message cursors can change, and the observed weak→strong→weak transition makes per-snapshot native-ref strength unsuitable for choosing a changing primary key. Codex also has a source path that starts with a null native ref before discovering a strong one. Neither discovery nor a weak cursor change creates another ledger row.

This establishes replay identity for the **same persisted event history**. It does not deduplicate a later historical import that assigns a different stored provider-turn ID to the same native work. Strong-native alias reconciliation across imports, conflicting identities and missing-run attribution need a Phase 1 decision; this spike does not guess at them. Multiple native turns can belong to one attempt (see `latestProviderTurnForAttempt`), so neither `runId` nor attempt alone is a turn key.

## Executable proof and transaction boundary

```bash
cd apps/server
../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts
# 5 passed
```

The tests use the real `EventStore.layer`, `OrchestrationEventStore` encoding/decoding and `Sqlite.layerMemory`/`layerFromPath` with repository migrations. Only `spike_ledger` and `spike_cursor` are additional tables. Fixtures are synthetic contract-shaped events, including app run, attempt and provider-thread links; they contain no real prompts, accounts or credentials. They are durability proof, not live billing evidence.

| Case                                                                      | Assertion                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cumulative replacement                                                    | Partial 100 → complete 150 → separately persisted duplicate 150 → late correction 120 leaves one row and total 120, output 8, read 20, write 10, reasoning 2. Reasoning stays a subset, not an extra output charge.                                                                                                                                           |
| Duplicate delivery                                                        | Delivering the same sequence returns false and leaves row and cursor unchanged; redelivering an older 150 snapshot after correction cannot restore it. A new sequence carrying identical cumulative usage replaces rather than adds.                                                                                                                          |
| Identity                                                                  | Weak→strong→weak ref changes, null→strong discovery, equal ordinals on different attempts, and equal native IDs in different provider threads preserve four separate turns totaling 500 input.                                                                                                                                                                |
| Unknown versus zero                                                       | ACP's completed turn and context observation leave null usage; explicit unavailable usage remains unavailable; a complete snapshot missing cache buckets remains unknown for accounting; explicit measured zero remains zero. Four rows, three unknown, known-input subtotal 100. This subtotal is not a complete spend total.                                |
| Restart and rollback, both Claude-shaped weak and Codex-shaped strong IDs | Close the first SQL/event-store scope with partial 100 and cursor 4; open the same file and verify every row and link. Append event 5, inject failure after replacement but before cursor update, assert the old row **and** cursor remain. Close again, reopen and replay event 5 once: complete 150, one row, cursor 5. Duplicate reapplication is a no-op. |
| Rebuild equals sequential live application                                | Clear only test ledger/cursor state and replay the retained log; compare all rows, all token totals, statuses and cursor exactly. This runs for correction/duplicates, mixed identities, missing usage/zero and both file-restart cases.                                                                                                                      |

`apply` reads the singleton cursor, ignores already-consumed sequences, replaces the turn snapshot and advances the cursor inside **one `sql.withTransaction`**. A non-turn agent event advances the same cursor without creating a ledger row. Gaps in global sequences are valid (other application event types share the log). Replay reads ordered agent events after the cursor through a captured high-water sequence. An undecodable event fails rather than opting into the client-only skip-unknown behavior.

The input must be serialized in source sequence order. A global cursor cannot safely consume an arbitrary newer event before an older one. No production subscriber, concurrent live/rebuild queue or admission transaction is implemented or claimed. A production rebuild must serialize with live application and preserve events arriving after its high-water mark. No sleeps, polling, per-test timeouts or effect-worker milestones are needed: these tests directly await SQL operations and scope finalizers on `it.effect`'s TestClock.

Controlled negative experiment: temporarily change `return yield* sql.withTransaction(transaction)` in `apply` to `return yield* transaction`, run the same focused command, then restore the wrapper. The recorded run (`/tmp/phase-0b-step-2-nonatomic.log`, local scratch only) exited 1: the injected failure left **input 150, complete, row sequence 5**, while **cursor stayed 4**; the expected state was partial 100, row sequence 4 and cursor 4. Both file-restart rollback assertions failed (2 failed, 3 passed). The restored prototype passes all 5 cases. This proves the failure assertion detects a separately committed upsert, rather than merely checking an error was thrown.

These are orderly service/connection restarts against persisted SQLite, including a transactional failure; they do not prove native provider continuation after a process kill or power-loss durability. `Sqlite.ts` uses WAL with `synchronous = NORMAL`: app-process crashes retain committed data, but OS/power failures can roll back post-checkpoint commits. The ledger cursor and rows must remain in the same database/transaction so that rollback affects them together.

## Retention gaps and implications for 03/04

- The current `ProjectionMaintenance.compactEventStore` retains provider-turn, provider-thread, run and attempt events; its superseded entity rules cover messages/nodes/turn-items and selected thread state. It deletes some imported V1 history. `OrchestrationEventStore` only replays V2 agent rows; an old/imported history without normalized usage cannot acquire it through a rebuild. The latest provider-turn projection alone cannot recreate an event sequence or intermediate corrections.
- The retained log reconstructs normalized usage **that was emitted and committed**. Terminal Claude/Codex captures qualify. A crash before their final `turnTokenUsage` event can leave only context `tokenUsage` or missing usage. Codex's native thread-total baseline and Claude's active segment accumulation are adapter state, not reconstructed by this prototype. Restarting a consumer cannot recover counters that the adapter never persisted. Keep the result incomplete/unavailable; do not infer tokens from context, text, wall time or an interrupted status.
- ACP context occupancy and optional context cost cannot reconstruct disjoint billable turn usage. Antigravity remains unavailable on the observed adapter path. OpenCode 2 has source/fixture token semantics in step 1, but no fresh live or restart probe here; shared ACP does not establish all ACP flavors. Cursor, Grok and other adapters are outside this step's live scope. Native-subagent inclusion is still unproven.
- For **03 A rules 1/4**, the demonstrated stored-turn key avoids a new ordinal allocator and ref-strength changes; retain native identity for later reconciliation. Replacement plus a transactional cursor is supported by SQL proof, subject to ordered delivery and retained source events. The proposed production key and alias policy remain design work, not an accepted change to `decisions.md`.
- For **03 A rules 3/5/6**, rates/model resolution, immutable rate versions, root-lineage rollups and native-child attribution are outside this durability prototype. Preserve missing counters and attribution explicitly. Raw adapter `usageStatus: complete` is insufficient when cache buckets or prices are missing. A turn's last snapshot can correct totals downward; never impose monotonic token totals.
- For **04 Budgets**, reconcile a reservation only after usage is attributable, complete **and priced**. Missing ACP usage, pre-terminal loss, absent cache counters, unknown rates or unresolved native-child scope do not mean free work or permission to release a reservation. Replay idempotency does not prove native billing completeness, admission control or pressure/window accounting. These implications await the Phase 1 design round.

Root validation: `vp run check:changed origin/overlay/main` passes format, lint, both knip stages, GraphQL generation check, affected typechecks and the five focused cases. No production runtime file, migration, contract, UI or upstream manifest entry changed.

## Operational carryover

Read-only `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` still returned only successful manual [run 40822950375](https://github.com/VeroxAUS/t3code/actions/runs/40822950375), created 2026-10-29T05:21:44Z. Scheduled-trigger evidence and support ticket **#4927935** remain open. No dispatch or repository-setting change was made.
