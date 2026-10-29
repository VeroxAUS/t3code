# Final review brief: Budget bypass

Launch line: `Run docs/overlay/review-briefs/budget-bypass.md with handoff docs/overlay/handoffs/final-review-plan.md`

Run on: Claude Fable 5.1 Extra High. Default mode; you edit only `docs/overlay/handoffs/`. You fix nothing.

Read `docs/overlay/prompts/_preamble.md`. Gate: the named handoff exists and says `status: in-progress`.

## Question

Which paths skip `assertWithinBudget`?

## Read

- `apps/server/src/orchestration-v2/ThreadManagementService.ts` `assertDispatchTargetEnabled` and the overlay `assertWithinBudget` beside it
- `apps/server/src/mcp/OrchestratorMcpService.ts` (`delegate_task`, `create_threads`)
- `apps/server/src/orchestration-v2/ThreadLaunchService.ts` (`t3_thread_launch`, composer, scheduled tasks)
- scheduled task and webhook launch paths, remote and relay delegation, and native subagents spawned inside Claude Code or Codex

Plus `docs/overlay/CHANGES.md` and the design doc the code cites. Where a path above does not exist yet, find its current location with grep and say so.

## Invariants to check, with evidence

- Every command that starts a provider turn on a new or existing thread passes the budget check, or is listed with a written reason.
- `budget_exceeded` is returned, not thrown as a defect, and the caller can tell which limit tripped.
- Per-root, per-child, concurrency, lifetime, attempt, depth and elapsed limits are each enforced on at least one real path.
- `overlay.limits.maxConcurrentChildren` is global and cannot be overridden per project.

Run the relevant tests yourself with `vp test run <files>`. Never run a repo-wide check.

## Write

`docs/overlay/handoffs/final-review-budget-bypass.md` with `commit:`, then `status: passed` or `status: findings`, then findings as `{file, line, severity high|medium|low, claim, evidence, suggested fix}`, then one `Next` line pointing back to `docs/overlay/handoffs/final-review-plan.md`.
