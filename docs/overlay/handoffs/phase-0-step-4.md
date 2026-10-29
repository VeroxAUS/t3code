# Handoff · Phase 0 · Step 4 · 2026-10-29 · written by Claude Sonnet 5.5 / High

commit: 7fe6d4e84aee303c3b14a3466df65d603b4de0a7
supersedes: docs/multi-agent-harness/handoffs/phase-0-step-3.md
status: n/a

## Where we are

branch `overlay/phase-0-step-4` · worktree `/home/verox/src/t3code-phase-0` · PR: see the PR for this branch · CI not yet run

## Done, verified

- Gate: step-3 handoff exists, `status: n/a`, no open questions — proof: `Read docs/multi-agent-harness/handoffs/phase-0-step-3.md`
- `overlay` key on `ServerSettings` and `ServerSettingsPatch` with the specified defaults (`routing`, `budgets`, `limits`, `cockpit`, `telemetry`), every field with a decoding default — proof: `cd packages/contracts && <repo>/node_modules/.bin/vp test run src/settings.test.ts` -> `Test Files  1 passed (1)  Tests  29 passed (29)`, including old file without `overlay`, empty overlay, empty groups (all decode to the defaults), partial group keeps the rest of its defaults, and a `routing.mode` patch round-trips (unknown mode and unknown `onExceed` are rejected)
- `overlay` added to `PROJECT_SCOPED_SERVER_SETTING_KEYS` and `ProjectSettingsOverrides` together (the `satisfies` clause holds) — proof: `vp run check:changed` -> `pass` typecheck (37 packages)
- `resolveProjectSettings` deep-merges `overlay`; a project override of `routing.mode` and `budgets.perChildUsd` keeps the global `budgets.perRootThreadUsd`, `cockpit` and `limits`, and other projects see the global value — proof: `cd packages/shared && <repo>/node_modules/.bin/vp test run src/projectSettings.test.ts` -> `Test Files  1 passed (1)  Tests  21 passed (21)`
- Analytics reads `overlay.telemetry.optIn`; an explicit `T3CODE_TELEMETRY_ENABLED` outranks it; unreadable settings fail closed — proof: `cd apps/server && <repo>/node_modules/.bin/vp test run src/telemetry` -> `Test Files  4 passed (4)  Tests  24 passed (24)`, including "does not send batch requests under the overlay default", "sends batch requests once overlay.telemetry.optIn is true" and "lets T3CODE_TELEMETRY_ENABLED=false outrank overlay.telemetry.optIn"
- Changed-files check — proof: `vp run check:changed` -> `pass` for unused patches, format, lint, knip 1/2 and 2/2, graphql, typecheck (37 packages), test (6 files, 101 tests)
- Dev server starts against the seeded database with the new schema — proof: `vp run dev` log -> `Listening on http://127.0.0.1:14513`, zero lines matching `error|fail|settings`, `GET /.well-known/t3/environment` -> `200`; stopped by the PID group that owned ports 14513 and 6473 (cwd confirmed as this worktree), both ports closed afterwards
- Manifest gained five lines (`settings.ts`, `settings.test.ts`, `projectSettings.ts`, `projectSettings.test.ts`, `server.ts`) and two rewritten telemetry lines in `docs/multi-agent-harness/CHANGES.md`

## Not done / deferred

- Reading `overlay` back through an authenticated settings API on the running dev server: I only confirmed startup and the unauthenticated environment endpoint. Decoding of an old `settings.json` (the worktree's has no `overlay`) is proven by the contracts tests, not by a runtime read.
- Fuller routing fields (`tiers`, `matrix`, `pins`, …) and `budgets.windowReserve` / `alerts`: Phase 2 and later, as instructed.

## Decisions made and why

- Project override and patch share one schema, `OverlaySettingsPatch`, in which every group and field is optional. A project override of `overlay.routing.mode` is therefore expressible and `resolveProjectSettings` merges it over the global value with `deepMerge`.
- Telemetry precedence: `T3CODE_TELEMETRY_ENABLED` (if set) > `overlay.telemetry.optIn`. This keeps the step-2 escape hatch and makes the setting the default source. `OVERLAY_BUILD` is no longer imported by `AnalyticsService.ts`.
- `AnalyticsService.layer` now requires `ServerSettingsService`; `server.ts` provides the existing `layerServerSettings` instance (same memoized layer as the rest of the server).
- Numeric validation: USD values `>= 0`, counts and minutes integers `>= 1`, `maxDepth` integer `>= 0`. The prompt gave only defaults; these are the smallest bounds that reject nonsense.

## Gotchas discovered

- The prompt says to add the deep merge "beside the `providerInstances` special case" in `resolveProjectSettings`. There is none there: `providerInstances` is not in `PROJECT_SCOPED_SERVER_SETTING_KEYS` and is read through `resolveProjectProviderInstanceEnabled`. The `overlay` branch sits inside the key loop where the value is assigned instead.
- `vp run typecheck` and `vp run check:changed` both typecheck all 37 packages once `packages/contracts` changes; that is the dependents rule, not a repo-wide run by choice.
- `setsid vp run dev &` returns a PID that is not the process group leader; `$!` was gone when I tried `kill -- -$!`. I killed the group of the PIDs that owned my two ports (`ss -H -ltnp`, cwd checked).

## Developer actions

- None.

## Open questions for the developer

- `overlay` is project-scoped as a whole, as specified, so a project can override `overlay.telemetry.optIn` and `overlay.limits.maxConcurrentChildren`, which are machine-wide. Analytics reads the global value, so a project-level `telemetry.optIn` is accepted and ignored. Should step 5+ narrow the project override schema to `routing`, `budgets` and `cockpit`?
  Answer: Yes, narrow it in this step's PR. Project overrides for `overlay` accept only `routing`, `budgets` and `cockpit`; `telemetry` and `limits` are global only. Keep the deep merge for the three project keys. Add one test row proving a project override cannot change `telemetry.optIn` or `limits.maxConcurrentChildren`. Record it under Decisions.

## Next

Run docs/multi-agent-harness/prompts/phase-0/step-5.md with handoff docs/multi-agent-harness/handoffs/phase-0-step-4.md — on Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium
