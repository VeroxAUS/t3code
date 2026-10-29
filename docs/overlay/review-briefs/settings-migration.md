# Final review brief: Settings and migration

Launch line: `Run docs/overlay/review-briefs/settings-migration.md with handoff docs/overlay/handoffs/final-review-plan.md`

Run on: Claude Fable 5.1 Extra High. Default mode; you edit only `docs/overlay/handoffs/`. You fix nothing.

Read `docs/overlay/prompts/_preamble.md`. Gate: the named handoff exists and says `status: in-progress`.

## Question

What happens when an upstream build reads an overlay `settings.json` and the reverse, and when upstream opens a `statev2.sqlite` that has overlay tables?

## Read

- `packages/contracts/src/settings.ts` (`OverlaySettings`, `OverlaySettingsPatch`, `OverlayProjectOverride`, `PROJECT_SCOPED_SERVER_SETTING_KEYS`)
- `packages/shared/src/projectSettings.ts` and `apps/server/src/serverSettings.ts`
- overlay migrations under `apps/server/src/persistence`
- `apps/server/src/telemetry/AnalyticsService.ts`

Plus `docs/overlay/CHANGES.md` and the design doc the code cites. Where a path above does not exist yet, find its current location with grep and say so.

## Invariants to check, with evidence

- Every overlay setting has a decoding default; an old file without `overlay` decodes, and an upstream build ignores the unknown key without rewriting or dropping it.
- Project overrides accept only `routing`, `budgets` and `cockpit`; `telemetry` and `limits` stay global.
- Overlay tables are additive: no upstream table is altered, and upstream opening the database does not fail on unknown migrations.
- Telemetry stays off by default and `T3CODE_TELEMETRY_ENABLED` outranks the setting.

Run the relevant tests yourself with `vp test run <files>`. Never run a repo-wide check.

## Write

`docs/overlay/handoffs/final-review-settings-migration.md` with `commit:`, then `status: passed` or `status: findings`, then findings as `{file, line, severity high|medium|low, claim, evidence, suggested fix}`, then one `Next` line pointing back to `docs/overlay/handoffs/final-review-plan.md`.
