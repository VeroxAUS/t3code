# Final review brief: Cache safety

Launch line: `Run docs/overlay/review-briefs/cache-safety.md with handoff docs/overlay/handoffs/final-review-plan.md`

Run on: Claude Fable 5.1 Extra High. Default mode; you edit only `docs/overlay/handoffs/`. You fix nothing.

Read `docs/overlay/prompts/_preamble.md`. Gate: the named handoff exists and says `status: in-progress`.

## Question

Does any path change a running thread's model or top-level effort? Are native-subagent env defaults set only at session start?

## Read

- `apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts` and `CodexAdapterV2.ts` launch-option builders
- `apps/server/src/routing/` code that changes a target on a live thread
- `apps/server/src/orchestration-v2/ThreadLaunchService.ts` reuse of existing threads

Plus `docs/overlay/CHANGES.md` and the design doc the code cites. Where a path above does not exist yet, find its current location with grep and say so.

## Invariants to check, with evidence

- Routing decides a model and effort at thread or child creation only; a running thread is never switched.
- `CLAUDE_CODE_SUBAGENT_MODEL` and the Codex `agents.default_subagent_*` overrides are defaults, set at session start, never forced, and only while the band is red.
- The instruction section added to `orchestrationInstructions.ts` is static per session and at most 4,000 bytes.

Run the relevant tests yourself with `vp test run <files>`. Never run a repo-wide check.

## Write

`docs/overlay/handoffs/final-review-cache-safety.md` with `commit:`, then `status: passed` or `status: findings`, then findings as `{file, line, severity high|medium|low, claim, evidence, suggested fix}`, then one `Next` line pointing back to `docs/overlay/handoffs/final-review-plan.md`.
