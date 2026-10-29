# Phase 0 · Step 2 · No upstream auto-update, no upstream analytics

Launch line: `Run DOCS/prompts/phase-0/step-2.md with handoff DOCS/handoffs/phase-0-step-1.md`

Run on: Claude Sonnet 5.5 High or GPT-6.1 Sol high.

Read `_preamble.md`. Gate: the step-1 handoff exists.

## Read

`docs/internals/server-updates.md`, `docs/internals/product-analytics.md`, `docs/user/updating.md`, `docs/user/telemetry.md`. Then only these code regions: the `T3CODE_DISABLE_AUTO_UPDATE` handling in `apps/desktop/src/updates/DesktopUpdates.ts` (around the function that reads `app-update.yml`; `setFeedURL` is only used in mock mode) and its wrapper `apps/desktop/src/electron/ElectronUpdater.ts`; the `T3CODE_TELEMETRY_ENABLED` default in `apps/server/src/telemetry/AnalyticsService.ts` (PostHog, default enabled); and `apps/server/src/cloud/selfUpdate.ts` for the server's npm self-update. Both kill-switches already exist; this step flips their defaults for overlay builds, it does not build new ones.

## Do

1. Updater: make overlay builds default to auto-update **off**. Smallest form: a single build-time constant (for example `OVERLAY_BUILD = true` set by the desktop build config) that `DesktopUpdates.ts` treats like `T3CODE_DISABLE_AUTO_UPDATE`, with the env var still able to re-enable it. The manual "check for updates" path says updates are managed by the overlay rather than failing silently. Pointing the feed at a fork release feed is a later decision; note it under Open questions.
2. Server self-update (`selfUpdate.ts`): confirm it cannot replace an overlay server with the upstream npm package; if it can, gate it the same way.
3. Analytics: make `T3CODE_TELEMETRY_ENABLED` default **false** in overlay builds, re-enabled by the env var for now; step 4 wires it to `overlay.telemetry.optIn`. Say so in the handoff.
4. Mark every edited upstream line with `// overlay: <reason>` and list the files in `DOCS/CHANGES.md` (create the file if step 5 has not run yet).
5. Run `overlay-sync.yml` once by `workflow_dispatch` (`gh workflow run`) if the developer has not already, and record the run's result and URL in the handoff.

## Accept

A unit test beside the updater entry point proves it returns early under the overlay default (dev builds may never reach the updater, so a dev-run log is not proof). A unit test beside `AnalyticsService.ts` proves no event is sent under the overlay default. Tests beside the touched code pass with `vp test run <files>`.

## Handoff

`DOCS/handoffs/phase-0-step-2.md`. Next line: `Run DOCS/prompts/phase-0/step-3.md with handoff DOCS/handoffs/phase-0-step-2.md — on Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium`.
