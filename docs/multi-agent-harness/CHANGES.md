# Overlay change manifest

Every upstream file the overlay has changed, one line each: path, reason, and whether it carries a `// overlay:` marker. `scripts/overlay-check.ts` (step 6) fails a PR whose changed upstream paths and this list disagree. Files under the overlay-owned paths (see `prompts/_preamble.md`) need no line.

## Test command

`vp run check:changed` plus `vp test run <files you touched>`, run from the package directory with the repo-local binary (`<repo>/node_modules/.bin/vp`); see the step-2 handoff gotchas.

## Changed upstream files

- `packages/shared/src/overlayBuild.ts` — new `OVERLAY_BUILD` constant that overlay defaults key off; whole file is overlay code, header comment is the marker. Marker: yes
- `packages/shared/package.json` — export `./overlayBuild`. Marker: no (JSON)
- `apps/desktop/src/app/DesktopConfig.ts` — `disableAutoUpdate` keeps unset distinct from false so the env var can re-enable updates. Marker: yes
- `apps/desktop/src/updates/DesktopUpdates.ts` — overlay builds default auto-update off; the disabled reason says updates are managed by the overlay. Marker: yes
- `apps/desktop/src/updates/DesktopUpdates.test.ts` — test for the overlay default. Marker: yes
- `apps/desktop/src/updates/updatesTestHarness.ts` — existing cases opt back in with `T3CODE_DISABLE_AUTO_UPDATE=false`. Marker: yes
- `apps/server/src/cloud/selfUpdate.ts` — refuse server self-update from the default (upstream) release feed. Marker: yes
- `apps/server/src/cloud/selfUpdate.test.ts` — harness points at a fork feed by default; test for the guard. Marker: yes
- `apps/server/src/telemetry/AnalyticsService.ts` — `T3CODE_TELEMETRY_ENABLED` defaults to false in overlay builds. Marker: yes
- `apps/server/src/telemetry/AnalyticsService.test.ts` — test that no event is sent under the overlay default. Marker: yes
