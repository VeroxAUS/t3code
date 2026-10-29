# Final review brief: Privilege

Launch line: `Run docs/overlay/review-briefs/privilege.md with handoff docs/overlay/handoffs/final-review-plan.md`

Run on: Claude Fable 5.1 Extra High. Default mode; you edit only `docs/overlay/handoffs/`. You fix nothing.

Read `docs/overlay/prompts/_preamble.md`. Gate: the named handoff exists and says `status: in-progress`.

## Question

Can any routing or budget path let a child run with broader runtime or interaction mode than its parent?

## Read

- `apps/server/src/mcp/OrchestratorMcpService.ts`: `interactionModeRank` and the clamp that uses it, `resolveTarget`, and the overlay `applyTargetPolicy` call placed in it
- `apps/server/src/orchestration-v2/DispatchModeLimit.ts` and its callers
- `apps/server/src/orchestration-v2/ThreadLaunchService.ts` `launch` and the overlay call in it
- `apps/server/src/routing/` (overlay) wherever a target, runtime mode or interaction mode is chosen

Plus `docs/overlay/CHANGES.md` and the design doc the code cites. Where a path above does not exist yet, find its current location with grep and say so.

## Invariants to check, with evidence

- A child's runtime mode and interaction mode are never above its parent's, whatever tier, role or fallback the router picks.
- A degrade-ladder fallback or a pinned target cannot widen the mode.
- `t3_thread_launch`, scheduled tasks and `create_threads` get the same ceiling as `delegate_task`.
- Shadow mode changes nothing but logs.

Run the relevant tests yourself with `vp test run <files>`. Never run a repo-wide check.

## Write

`docs/overlay/handoffs/final-review-privilege.md` with `commit:`, then `status: passed` or `status: findings`, then findings as `{file, line, severity high|medium|low, claim, evidence, suggested fix}`, then one `Next` line pointing back to `docs/overlay/handoffs/final-review-plan.md`.
