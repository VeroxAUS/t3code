# Overlay change manifest

Every upstream file the overlay has changed, one line each: path, reason, and whether it carries a `// overlay:` marker. `scripts/overlay-check.ts` (step 6) fails a PR whose changed upstream paths and this list disagree. Files under the overlay-owned paths (see `prompts/_preamble.md`) need no line.

## Test command

- `vp run check:changed` before every push.
- `vp test run <files you touched>` while iterating, run from the package directory with the repo-local binary (`<repo>/node_modules/.bin/vp`); see the step-2 handoff gotchas.
- Never a repo-wide check.

## Changed upstream files

- `packages/shared/src/overlayBuild.ts` — new `OVERLAY_BUILD` constant that overlay defaults key off; whole file is overlay code, header comment is the marker. Marker: yes
- `packages/shared/package.json` — export `./overlayBuild`. Marker: no (JSON)
- `apps/desktop/src/app/DesktopConfig.ts` — `disableAutoUpdate` keeps unset distinct from false so the env var can re-enable updates. Marker: yes
- `apps/desktop/src/updates/DesktopUpdates.ts` — overlay builds default auto-update off; the disabled reason says updates are managed by the overlay. Marker: yes
- `apps/desktop/src/updates/DesktopUpdates.test.ts` — test for the overlay default. Marker: yes
- `apps/desktop/src/updates/updatesTestHarness.ts` — existing cases opt back in with `T3CODE_DISABLE_AUTO_UPDATE=false`. Marker: yes
- `apps/server/src/cloud/selfUpdate.ts` — refuse server self-update from the default (upstream) release feed. Marker: yes
- `apps/server/src/cloud/selfUpdate.test.ts` — harness points at a fork feed by default; test for the guard. Marker: yes
- `apps/server/src/telemetry/AnalyticsService.ts` — `T3CODE_TELEMETRY_ENABLED` outranks `overlay.telemetry.optIn`, which defaults to false. Marker: yes
- `apps/server/src/telemetry/AnalyticsService.test.ts` — tests for the opt-in default, opt-in, and the env override. Marker: yes
- `package.json` — `knip:check` lists `--workspace packages/routing`. Marker: no (JSON)
- `pnpm-lock.yaml` — lockfile entry for the new `@t3tools/routing` workspace. Marker: no (lockfile)
- `packages/contracts/src/settings.ts` — `overlay` key on `ServerSettings`, `ServerSettingsPatch`, `PROJECT_SCOPED_SERVER_SETTING_KEYS` and `ProjectSettingsOverrides`; project overrides accept only `routing`, `budgets` and `cockpit`. Marker: yes
- `packages/contracts/src/settings.test.ts` — overlay decoding defaults, patch round-trip, and project override drops `telemetry` and `limits`. Marker: yes
- `packages/shared/src/projectSettings.ts` — `resolveProjectSettings` deep-merges `overlay` instead of replacing it. Marker: yes
- `packages/shared/src/projectSettings.test.ts` — nested overlay override keeps the other keys. Marker: yes
- `apps/server/src/server.ts` — `AnalyticsService.layer` is provided the settings layer. Marker: yes
