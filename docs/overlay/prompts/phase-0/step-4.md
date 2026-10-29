# Phase 0 · Step 4 · The `overlay` settings key

Launch line: `Run DOCS/prompts/phase-0/step-4.md with handoff DOCS/handoffs/phase-0-step-3.md`

Run on: Claude Sonnet 5.5 High or GPT-6.1 Sol high.

Read `_preamble.md`. Gate: the step-3 handoff exists.

## Read

`packages/contracts/src/settings.ts`: `ServerSettings`, `ServerSettingsPatch`, `PROJECT_SCOPED_SERVER_SETTING_KEYS`, `ProjectSettingsOverrides`, and the existing settings test table; `packages/shared/src/projectSettings.ts` (`resolveProjectSettings`); `DOCS/04-router.md` sections "Settings schema" and "Budgets".

## Do

1. Add one key `overlay` to `ServerSettings` and `ServerSettingsPatch` with decoding defaults:
   - `routing: { enabled: false, mode: "off" }` where mode is `"off" | "shadow" | "enforce"`
   - `budgets: { perRootThreadUsd: 5, perChildUsd: 1.5, maxConcurrentChildrenPerRoot: 3, maxChildrenLifetimePerRoot: 12, maxAttemptsPerStep: 2, maxDepth: 2, maxElapsedMinutesPerChild: 60, onExceed: "block_new_children" }` where onExceed is `"warn" | "block_new_children" | "stop"`
   - `limits: { maxConcurrentChildren: 6 }`
   - `cockpit: { teamView: false }`
   - `telemetry: { optIn: false }`
     The fuller routing fields arrive in Phase 2; do not add them now.
2. Add `overlay` to `PROJECT_SCOPED_SERVER_SETTING_KEYS` and `ProjectSettingsOverrides` (they are tied by a `satisfies` clause; change both together). `resolveProjectSettings` replaces the whole setting for every key except `providerInstances` (see the comment above `ProjectSettingsOverrides`), so a project override of `overlay.routing.mode` would wipe `budgets`, `limits` and `cockpit`. Add a deep merge for `overlay` beside the `providerInstances` special case, with a test row in `projectSettings.test.ts` proving a nested override keeps the other keys.
3. Extend the existing `it.each` tables in `settings.test.ts` (the "keeps cleanup disabled for existing installations" case is the precedent for old files): an old `settings.json` without `overlay` decodes to the defaults; a patch of `overlay.routing.mode` round-trips.
4. If step 2 used an environment flag for analytics, wire it to `overlay.telemetry.optIn` now. Mark edited lines `// overlay:`; list the files in `DOCS/CHANGES.md`. No UI.

## Accept

`vp test run packages/contracts/src/settings.test.ts packages/shared/src/projectSettings.test.ts` passes; `vp run check:changed` passes; the dev server starts against the seeded database and loads settings.

## Handoff

`DOCS/handoffs/phase-0-step-4.md`. Next line: `Run DOCS/prompts/phase-0/step-5.md with handoff DOCS/handoffs/phase-0-step-4.md — on Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium`.
