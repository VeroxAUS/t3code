# Final review brief: Pressure correctness

Launch line: `Run docs/overlay/review-briefs/pressure-correctness.md with handoff docs/overlay/handoffs/final-review-plan.md`

Run on: Claude Fable 5.1 Extra High. Default mode; you edit only `docs/overlay/handoffs/`. You fix nothing.

Read `docs/overlay/prompts/_preamble.md`. Gate: the named handoff exists and says `status: in-progress`.

## Question

Is the window mapping right per provider, and are stale and unavailable states and hysteresis handled?

## Read

- `apps/server/src/provider/codexUsageLimits.ts`, `claudeUsageLimits.ts`, `antigravityUsageLimits.ts` and their tests and fixtures
- `apps/server/src/provider/ProviderUsageLimitsIngestion.ts`
- `packages/routing/` pressure computation (overlay)

Plus `docs/overlay/CHANGES.md` and the design doc the code cites. Where a path above does not exist yet, find its current location with grep and say so.

## Invariants to check, with evidence

- Each provider's 5-hour and weekly windows map to the right band inputs, checked against the fixtures in the `*UsageLimits.test.ts` files.
- Stale and unavailable readings degrade to a stated band instead of reading as green.
- Hysteresis prevents flapping at a band edge; thresholds and the clock are injected, not read from wall time.
- No overage or credit assumption: exhausted means wait or another provider.

Run the relevant tests yourself with `vp test run <files>`. Never run a repo-wide check.

## Write

`docs/overlay/handoffs/final-review-pressure-correctness.md` with `commit:`, then `status: passed` or `status: findings`, then findings as `{file, line, severity high|medium|low, claim, evidence, suggested fix}`, then one `Next` line pointing back to `docs/overlay/handoffs/final-review-plan.md`.
