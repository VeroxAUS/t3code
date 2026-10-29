# Final review brief: Event sourcing

Launch line: `Run docs/overlay/review-briefs/event-sourcing.md with handoff docs/overlay/handoffs/final-review-plan.md`

Run on: Claude Fable 5.1 Extra High. Default mode; you edit only `docs/overlay/handoffs/`. You fix nothing.

Read `docs/overlay/prompts/_preamble.md`. Gate: the named handoff exists and says `status: in-progress`.

## Question

Does `CostLedger` replay idempotently after a crash mid-turn? Does it double-count cumulative usage? Does the decision log survive restart?

## Read

- `apps/server/src/routing/` `CostLedger` and decision-log services (overlay)
- `apps/server/src/orchestration-v2/ProviderEventIngestor.ts` and the overlay `CostLedger.record` hook beside `analytics.record`
- `apps/server/src/orchestration-v2/Orchestrator.ts` and the event sink, for where ledger writes commit
- overlay migrations under `apps/server/src/persistence`

Plus `docs/overlay/CHANGES.md` and the design doc the code cites. Where a path above does not exist yet, find its current location with grep and say so.

## Invariants to check, with evidence

- Replaying the same `provider-turn.updated` events yields the same ledger rows; the key is stable across restarts.
- Providers that report cumulative usage are diffed, not summed.
- Ledger and decision-log writes commit in the same transaction as the event or outbox effect that caused them; no I/O inside the orchestrator decision.
- After a restart the decision log and totals read back unchanged.

Run the relevant tests yourself with `vp test run <files>`. Never run a repo-wide check.

## Write

`docs/overlay/handoffs/final-review-event-sourcing.md` with `commit:`, then `status: passed` or `status: findings`, then findings as `{file, line, severity high|medium|low, claim, evidence, suggested fix}`, then one `Next` line pointing back to `docs/overlay/handoffs/final-review-plan.md`.
