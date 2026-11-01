# Handoff · Phase 0b · Fix · 2026-11-02 · written by Claude Opus 5.5 High

commit: 6816a7f9bc
supersedes: docs/overlay/handoffs/phase-0b-review-astra.md

## Where we are

Branch `overlay/phase-0b-fix` · worktree `/home/verox/src/t3code-phase-0`. This thread covers both review files: `phase-0b-review-astra.md` findings 1–4 and `phase-0b-review.md` findings 2–7. All ten are fixed and none is disputed. `phase-0b-review.md` finding 1 was already resolved in repository settings, and this thread only re-read it. The recorded developer answers were followed: both outstanding probes ran, and the scoped credit `go` is unchanged. A review still has to pass before Phase 0b ends.

## Done, verified

### `phase-0b-review-astra.md`

1. **Fixed: Codex `workspaceWrite` launch context** (`permissions-map.md`, decision 32, inbox). The script now records both directories and allocates fresh paths. `cd <start-dir> && python3 -I codex_cwd_probe.py`, run from the worktree and from `/home/verox`, → the home-subfolder write gave exit 1, unchanged from the worktree and exit 0, changed from home. The other eight operations were identical. The conclusion is now a direct `command/exec` observation that depends on launch context. No paid request was made.
2. **Fixed: exit criteria** (`phase-0b-complete.md`). The required-probe row, the credit acceptance statements and the coverage section are reconciled, and required omissions are separated from optional limits. Proof: the probes under review findings 2 and 3 below, and `phase-0b-step-5.md` `Answer: yes`. Decision 32's scope is not broadened.
3. **Fixed: batch reproduction** (`api-credit.md`). The spike now has a self-contained `submit`/`status`/`results` recipe, with submitting marked as billed. All three modes run against a local stub through `PROBE_API_BASE` → expected method, path, `anthropic-version: 2023-06-01` and body. No API request was sent, so there was no spend and no new billing evidence.
4. **Fixed: 03 A rule 1 disposition** (`phase-0b-complete.md`). It now rests on the null-native and null-run source paths, with the prototype key as the tested alternative pending Phase 1. Proof: `CodexAdapterV2.ts:6125-6165` and `:2500`.

### `phase-0b-review.md`

2. **Fixed: Antigravity native mode** (`permissions-map.md`). `node antigravity_modes.ts <repo> <repo>/.t3/userdata` (`initialize` and `session/new` only, no prompt) → 1.3.0 advertises `default`, `auto_edit` and `yolo` as modes and as the `mode` config option. It advertises no `plan` or `architect`, and no `collaboration_mode` option exists. T3 `plan` therefore selects no native mode and raises no error; reclassified as unsupported natively and prompt-only.
3. **Fixed: effective setup script** (`candidate-workspace.md`). Fresh and `existing_worktree` launches on idle threads with `projectSettingsOverrides[<project>].defaultProjectScripts` set → the fresh worktree is at the candidate SHA, all 6 tracked files byte-match, and the only extras are `setup-created.txt` and `setup-ignored.txt`. Its terminal log ends in the setup sentinel with exit 0. Setup also ran in the attached checkout and added the same two files, with no sentinel. The writer's digest `fb925202…` is identical before, after and after cleanup. Zero runs, zero provider spend.
4. **Fixed: step 4 reproducibility** (`candidate-workspace.md`). The fixture and capture script and the MCP helper are in the spike, and the dead bundle step is replaced. These exact scripts produced finding 3's evidence.
5. **Fixed: step 3 archive** (`permissions-map.md`). `ls /tmp/phase0b-step3-evidence-20261031` → absent, and one sentence now says the committed tables, digests and SQL are the durable record.
6. **Fixed: identity evidence** (`replay-durability.md`, `phase-0b-step-2.md`, test). The sentence and gotcha now cite the two real source paths, and read-only SQL → 229 of 229 live Codex turn events have strong refs. The fixture's two attempts now share one run. `cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts` → 5 passed. With the old fixture and the new assertion → 1 failed, `expected 1 to equal 2`.
7. **Fixed: reconciliation rule** (`token-semantics.md`). It now states the third condition, resolved native-subagent scope, for Phase 1. Per the finding, `costs.ts` is unchanged.

### Checks

- `vp run check:changed origin/overlay/main` → pass: format, lint, both knip stages, graphql, typecheck of 3 packages, and 1 test file.
- `cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts` → 22 passed.
- `node scripts/overlay-check.ts --base origin/overlay/main` → pass. No upstream path changed, so no manifest line was due.
- `gh api repos/VeroxAUS/t3code/branches/overlay%2Fmain/protection --jq '{required_status_checks:(.required_status_checks // "ABSENT")}'` → `strict: true`, `checks: [{context: "overlay-check", app_id: 15368}]`. This records review finding 1's resolution; this thread changed no settings.
- Isolated state after the probes: no probe server or `agy_acp_server` process remains, `settings.json` matches its original SHA-256 `099757f6…`, and events up to 3904 match the pre-probe backup by count and maximum sequence.
- PR: https://github.com/VeroxAUS/t3code/pull/27, open and not merged. CI completion is not claimed.

## Not done / deferred

- Decision 32's plan-write cells stay deferred as the developer decided.
- Optional coverage limits stay limits, listed in `phase-0b-complete.md`. No paid probe was repeated.

## Decisions

- No new developer decision. Decision 32's text is corrected only where review finding 1 named it, and its deferral is unchanged.
- The fixture was tightened rather than only re-described, because a one-line change gives the prototype key a case that rule 1's fallback would collapse. It is labelled synthetic: no live data shows that shape.
- At the developer's request, the inbox's role-enforcement line also carries the Antigravity and `existing_worktree` setup results, so the Phase 1/2 design round sees them. No finding named this.
- The batch recipe uses `anthropic-version: 2023-06-01`, the value on the cited vendor page. The original script's value was not recorded.

## Gotchas

- Review finding 6 cites `runGoalCommand` at `:6159`. That line is in `completeGoalCommandTurn` (`:6125`); `runGoalCommand` is at `:6348`. The docs cite the real names.
- `t3 thread start` requires a message, which would start a paid turn, so idle launches use the spike's MCP helper. It signs in the way `t3 thread` does and revokes its session on exit.
- `setsid vp run …` in a background job does not leave a usable `$!`. Stop the server through the port owner's process group, after checking `/proc/<pid>/cwd`.
- Helper scripts outside the repository need `ln -s <repo>/apps/server/node_modules node_modules` beside them for `effect` to resolve.
- The probes left two terminal logs under `.t3/userdata/logs/terminals/`, one Antigravity session in the isolated profile, and three deleted records (events 3907–3914) in the isolated database. Nothing touched `~/.t3/userdata`.

## Developer actions

- Review and merge this PR when satisfied; the agent never merges.
- No new settings action is owed. The external scheduler remains the existing developer-owned carryover: ticket #4927935 is answered, and no scheduled run has been recorded.

## Open questions for the developer

- Three historical lines are stale but no finding names them, so they were left: `phase-0b-step-5.md:26` (`workspaceWrite` “wrote outside the cwd”), `phase-0b-step-4.md:40` (bundle recovery path), and `commit: see the branch head` in `phase-0b-complete.md` and `phase-0b-step-5.md`. Should they be corrected?
  Recommended: leave them — they are step records that the corrected spikes and this handoff supersede, and the re-review can name them if it disagrees.

Next: Run docs/overlay/prompts/_review.md for phase 0b with handoff docs/overlay/handoffs/phase-0b-fix.md — on GPT-6 Astra medium
