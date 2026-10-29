# Final review brief: UI

Launch line: `Run docs/overlay/review-briefs/ui.md with handoff docs/overlay/handoffs/final-review-plan.md`

Run on: Claude Fable 5.1 Extra High. Default mode; you edit only `docs/overlay/handoffs/`. You fix nothing.

Read `docs/overlay/prompts/_preamble.md`. Gate: the named handoff exists and says `status: in-progress`.

## Question

Does the cockpit add a streaming firehose, miss a render budget, or leave a one-way door?

## Read

- `apps/web/src/components/team/` (overlay) and the sidebar and thread-view hooks that mount it
- `apps/mobile` team surfaces and `packages/client-runtime` shared selectors
- `apps/web` command palette and keybinding registrations for the team view

Plus `docs/overlay/CHANGES.md` and the design doc the code cites. Where a path above does not exist yet, find its current location with grep and say so.

## Invariants to check, with evidence

- No new per-event websocket stream: the team view reads existing projections or one coarse snapshot, throttled.
- No continuously repainting animation; lists are virtualized or bounded.
- `AGENTS.md` "Hit every surface": entry points, web/desktop/mobile, remote and tunnel modes, and reverse states (every way in has a way out and a way to see it).
- `overlay.cockpit.teamView` off hides every entry point, including the palette and keybinding.

Run the relevant tests yourself with `vp test run <files>`. Never run a repo-wide check.

## Write

`docs/overlay/handoffs/final-review-ui.md` with `commit:`, then `status: passed` or `status: findings`, then findings as `{file, line, severity high|medium|low, claim, evidence, suggested fix}`, then one `Next` line pointing back to `docs/overlay/handoffs/final-review-plan.md`.
