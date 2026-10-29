# Final review brief: Windows paths and PowerShell

Launch line: `Run docs/overlay/review-briefs/windows-paths.md with handoff docs/overlay/handoffs/final-review-plan.md`

Run on: Claude Fable 5.1 Extra High. Default mode; you edit only `docs/overlay/handoffs/`. You fix nothing.

Read `docs/overlay/prompts/_preamble.md`. Gate: the named handoff exists and says `status: in-progress`.

## Question

Does anything that shells out break on Windows paths or PowerShell?

## Read

- merge queue, witness and verification code under `apps/server/src/routing/` and `packages/routing/` (overlay)
- `.github/workflows/overlay-*.yml` and `scripts/overlay-check.ts`
- every `spawn`, `exec` or git invocation added by the overlay

Plus `docs/overlay/CHANGES.md` and the design doc the code cites. Where a path above does not exist yet, find its current location with grep and say so.

## Invariants to check, with evidence

- Paths are built with `node:path` and compared normalised; no hard-coded `/` or POSIX-only temp dirs.
- Commands avoid bash-only syntax, quoting is argument-array based, and PowerShell is not assumed to be bash.
- Git refs and worktree paths with spaces, drive letters or long paths work.
- Line endings in generated files and fixtures do not change hashes.

Run the relevant tests yourself with `vp test run <files>`. Never run a repo-wide check.

## Write

`docs/overlay/handoffs/final-review-windows-paths.md` with `commit:`, then `status: passed` or `status: findings`, then findings as `{file, line, severity high|medium|low, claim, evidence, suggested fix}`, then one `Next` line pointing back to `docs/overlay/handoffs/final-review-plan.md`.
