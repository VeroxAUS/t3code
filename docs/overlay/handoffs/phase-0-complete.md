# Handoff · Phase 0 · Complete · 2026-10-29 · written by Claude Sonnet 5.5 / High

commit: 0f0c6e548870ff3df2d77263f3888390cec75694
supersedes: docs/overlay/handoffs/phase-0-step-8.md
status: n/a

## Where we are

branch `overlay/phase-0-step-8` · worktree `/home/verox/src/t3code-phase-0` · PR: https://github.com/VeroxAUS/t3code/pull/10 · every step PR (1 to 9) is merged except this one.

## Done, verified

Exit criteria from `docs/overlay/07-roadmap.md` Phase 0. A line without a command or URL is marked open.

- Sync job green by `workflow_dispatch` — proof: `gh run list --workflow overlay-sync.yml` -> `completed success ... workflow_dispatch 40822950375 41s` (https://github.com/VeroxAUS/t3code/actions/runs/40822950375; green with nothing to merge, so no sync PR exists). The scheduled run is the reviewer's to check.
- `overlay-check` green on a code PR — proof: `gh pr checks 7` -> `overlay-check  pass  1m45s` (https://github.com/VeroxAUS/t3code/actions/runs/40827112941, PR https://github.com/VeroxAUS/t3code/pull/7)
- `overlay-check` red on a deliberate PR without a handoff — proof: PR https://github.com/VeroxAUS/t3code/pull/8 failed with `This diff changes files outside docs/overlay but adds or changes none under docs/overlay/handoffs/` (https://github.com/VeroxAUS/t3code/actions/runs/40827331774)
- `overlay-check` is the required status on `overlay/main` — proof: developer ran the PUT from the step-6 handoff; response `required_status_checks.checks` -> `[{"app_id": 15368,"context": "overlay-check"}]`
- Settings round-trip and nested-override tests — proof: `cd packages/contracts && <repo>/node_modules/.bin/vp test run src/settings.test.ts` -> `Tests  30 passed (30)` (step 5); `cd packages/shared && <repo>/node_modules/.bin/vp test run src/projectSettings.test.ts` -> `Tests  21 passed (21)` (step 4)
- Dev server runs in WSL2 — proof: step 0 `vp run dev` -> `serverPort=14513 webPort=6473`, `curl http://localhost:6473/` -> `200`; step 4 repeated it on the seeded database with the `overlay` schema -> `GET /.well-known/t3/environment` -> `200`
- Overlay builds do not auto-update from upstream — proof: `cd apps/desktop && <repo>/node_modules/.bin/vp test run src/updates` -> `Tests  63 passed (63)` and `cd apps/server && <repo>/node_modules/.bin/vp test run src/cloud/selfUpdate.test.ts` -> `Tests  13 passed (13)` (step 2)
- Overlay builds send no analytics unless opted in — proof: `cd apps/server && <repo>/node_modules/.bin/vp test run src/telemetry` -> `Test Files  4 passed (4)  Tests  24 passed (24)` (step 4)
- Usage strip ported with manifest lines and markers — proof: `node scripts/overlay-check.ts --base origin/overlay/main` -> `overlay-check: pass` (step 7); PR https://github.com/VeroxAUS/t3code/pull/9
- **Open:** the usage strip _renders_. Step 7 did not run the dev pass (the developer answered "Yes, run the dev pass" after that thread ended, and no screenshot or log line is on record). The installer workflow checks `grep -rlq 'data-usage-strip' apps/web/dist`, which proves the markup is in the bundle, not that it renders.
- `overlay-release.yml` added — proof: YAML parsed with the `yaml` package from `apps/server` -> jobs `version`, `build`, `publish`; triggers `workflow_dispatch` (required `version` input) and tags `overlay-v*`; no schedule. `fork-sync.yml` is absent from `overlay/main` — proof: `git ls-tree --name-only origin/overlay/main .github/workflows/fork-sync.yml | wc -l` -> `0`; it exists on `origin/fork-main`.
- **Open:** draft release with an installer artifact. The workflow has never run. Developer action below; record the URL here before the review starts.

## Promoted ideas

- [x] #17 per-project policy — `overlay` is in `PROJECT_SCOPED_SERVER_SETTING_KEYS` and `ProjectSettingsOverrides` (narrowed to `routing`, `budgets`, `cockpit`) and `resolveProjectSettings` deep-merges it — proof: the two settings test commands above
- [ ] #26 `textGenerationModelSelection` set to Haiku 5.5 — a setting in the developer's own `settings.json`, no code. `~/.t3/userdata` does not exist on this WSL2 machine, so I could not check it and did not write to it. The developer sets it (Settings, text generation model) and records the result here.

## Not done / deferred

- Usage strip render check, #26 and the draft release above.
- Dev-run evidence was deliberately not collected in this step: the prompt does not ask for it and AGENTS.md reserves browser passes for the primary agent after an explicit request.

## Decisions made and why

- Release workflow splits into `version`, `build`, `publish` jobs so the version is validated once and the Windows job holds no write permission. The old `fork-sync.yml` did this through its sync job.
- Release tag is `overlay-v<version>`, targeting the dispatched commit. Version is the pushed tag minus `overlay-v`, or the dispatch input; there is no default because `apps/desktop/package.json` (0.1.2) does not track the upstream base tag (v0.1.3).
- No manifest line: no upstream file changed in this step.

## Gotchas discovered

- `OVERLAY_BUILD` is a constant `true` (`packages/shared/src/overlayBuild.ts`), not a build flag, so the installer build needs nothing extra.
- The old workflow's `Check the update feed points at this fork` step only grepped `latest.yml` for the version; it was kept under a name that says so. Updates stay off in overlay builds (step 2), so a published draft does not feed any installed app until the developer re-enables them.

## Developer actions

- After this PR merges, dispatch the release workflow and record the draft release URL in the Open line above:

  ```
  gh workflow run overlay-release.yml --ref overlay/main -f version=0.1.3-overlay.1
  ```

  Then `gh run watch <id>` and `gh release list` -> the draft `overlay-v0.1.3-overlay.1` with `T3-Code-*.exe`, its blockmap and `latest.yml`. Edit this file and the review checks it.

- Set `textGenerationModelSelection` to Haiku 5.5 in your own settings (#26) and note it above.
- Answer the usage-strip dev pass question below.

## Open questions for the developer

- The step-7 thread was told to run one dev pass (`Replay (dev)` provider, one screenshot). It had already stopped. Should a thread do it now (a fresh `fix` thread, or this one on your word), or will you look at the strip yourself and record it above?
  Answer: Neither now. Let the Phase 0 review flag the missing evidence; its fix thread runs the dev pass and records the screenshot.

## Next

Next: Run docs/overlay/prompts/_review.md for phase 0 with handoff docs/overlay/handoffs/phase-0-complete.md — on GPT-6.1 Sol low, or Claude Opus 5.5 Low if Codex wrote this phase
