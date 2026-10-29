# Handoff · Phase 0 · Step 2 · 2026-10-29 · written by Claude Sonnet 5.5 / High

commit: 5b0f6fe8287dff2aae854123dcfcc5aae26d530c
supersedes: docs/multi-agent-harness/handoffs/phase-0-step-1.md
status: n/a

## Where we are

branch `overlay/phase-0-step-2` · worktree `/home/verox/src/t3code-phase-0` · PR: see the PR for this branch (URL added to the PR body, not this file) · CI not yet run

## Done, verified

- Gate: step-1 handoff exists, `status: n/a`, its open questions are answered (branch protection set by developer, auto-merge no, `OVERLAY_SYNC_TOKEN` set) — proof: `Read docs/multi-agent-harness/handoffs/phase-0-step-1.md`
- Updater defaults off in overlay builds, env var can re-enable — proof: `cd apps/desktop && <repo>/node_modules/.bin/vp test run src/updates` -> `Test Files  5 passed (5)  Tests  63 passed (63)`, including the new case "stays disabled and skips update checks under the overlay default" (asserts `checked: false`, status `disabled`, message matches `managed by the overlay`, zero update checks)
- Server self-update cannot replace an overlay server from the upstream feed — proof: `cd apps/server && <repo>/node_modules/.bin/vp test run src/cloud/selfUpdate.test.ts` -> `Tests  13 passed (13)`, including the new case "refuses to update from the upstream feed under the overlay default"
- No analytics event is sent under the overlay default — proof: `cd apps/server && <repo>/node_modules/.bin/vp test run src/telemetry src/cloud` -> `Test Files  22 passed (22)  Tests  188 passed (188)`, including the new case "does not send batch requests under the overlay default", which asserts the capture server saw no request
- Changed-files check — proof: `vp run check:changed` -> `pass` for format, lint, knip, graphql, typecheck (36 packages), test (3 files)
- Manifest created at `docs/multi-agent-harness/CHANGES.md` with 10 files; each edited line carries `// overlay:` except `packages/shared/package.json` — proof: `Read docs/multi-agent-harness/CHANGES.md`

## Not done / deferred

- `overlay-sync.yml` workflow dispatch: `gh workflow run overlay-sync.yml --ref overlay/main` was denied by the permission classifier in this session, so no run exists (`gh run list --workflow overlay-sync.yml` returned nothing beforehand). Run it yourself, or tell me to retry, then add the run URL here or in step 3's handoff.
- Pointing the update feed at a fork release feed: later decision, see Open questions.

## Decisions made and why

- Single constant `OVERLAY_BUILD = true` in `packages/shared/src/overlayBuild.ts` (new export `@t3tools/shared/overlayBuild`). It is `true` in every build of this fork rather than set by the desktop build config: this repo is the overlay, so there is no non-overlay build to protect, and a build-config flag would add a second place to forget.
- Updater: `DesktopConfig.disableAutoUpdate` is now an `Option<boolean>` so "unset" differs from `false`. Overlay disables when unset; `T3CODE_DISABLE_AUTO_UPDATE=false` re-enables; `=true` still disables with the old message. The overlay reason is returned from `getAutoUpdateDisabledReason` after the packaged-build check, so the manual check shows "Updates are managed by the overlay; set T3CODE_DISABLE_AUTO_UPDATE=false to use the upstream feed." instead of failing silently.
- Server self-update: the only upstream-pointing path is the default release feed (`T3CODE_RELEASE_BASE_URL` unset). `selfUpdate.ts` now fails with "Updates are managed by the overlay; set T3CODE_RELEASE_BASE_URL to a fork release feed…" in that case, so setting a fork feed is the opt-in. The desktop-managed path delegates to the desktop updater, which is already off by default.
- Analytics: `T3CODE_TELEMETRY_ENABLED` defaults to `!OVERLAY_BUILD`, i.e. **false**; setting the env var to `true` re-enables it for now. Step 4 wires this default to `overlay.telemetry.optIn`.
- Existing updater tests opt back in through `T3CODE_DISABLE_AUTO_UPDATE: "false"` in `updatesTestHarness.ts`; existing self-update tests point the harness at `https://releases.example.test` by default.

## Gotchas discovered

- `vp` on PATH (`/run/user/.../fnm_multishells/.../bin/vp`, global vite-plus) resolves `@effect/vitest` against a different vitest and every `@effect/vitest` test file fails with `TypeError: Cannot read properties of undefined (reading 'config')`, even untouched ones. Use the repo-local binary `<repo>/node_modules/.bin/vp` (run from the package directory); `vp run check:changed` already worked. Not a regression from this step.
- `vp test run apps/...` from the repo root runs the wrong config; run from the package directory.
- `selfUpdate.test.ts` times out (120s each) rather than failing fast when the guard blocks a happy-path case; a failing guard shows as slow tests.
- The Effect language service turns "multiple `Effect.provide` in a chain" into a typecheck failure; merge layers with `Layer.merge`.
- The prompt names `apps/desktop/src/electron/ElectronUpdater.ts`; it needed no change since the early return lives in `DesktopUpdates.ts`.

## Open questions for the developer

- Allow `gh workflow run overlay-sync.yml --ref overlay/main` (the call was denied)? Or run it yourself and paste the run URL; step 3 can record it.
- Which release feed should overlay desktop and server updates use later (fork GitHub releases via `app-update.yml` / `T3CODE_RELEASE_BASE_URL`)? Until decided, both are off.
- `T3CODE_DISABLE_AUTO_UPDATE=false` on an overlay build re-enables updates from whatever feed `app-update.yml` names, which is upstream's. Intended as an escape hatch for now; should it be removed once a fork feed exists?

## Next

Run docs/multi-agent-harness/prompts/phase-0/step-3.md with handoff docs/multi-agent-harness/handoffs/phase-0-step-2.md — on Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium
