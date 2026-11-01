# Handoff · Phase 0b · Review (Codex steps 1-4) · 2026-11-02 · written by Claude Opus 5.5 High

commit: c0bbf284bc
supersedes: docs/overlay/handoffs/phase-0b-complete.md
status: findings

## Where we are

Branch `overlay/phase-0b-review` · worktree `/home/verox/src/t3code-phase-0`. Mixed-execution review on the developer's instruction: this thread covers only Codex's PRs #20, #21, #22 and #23, at their merge commits. GPT-6 Astra reviews PR #24 and the phase-wide exit criteria in a second thread. This status covers this scope only; Phase 0b is not passed until both threads have passed. How one status covers both reviews is undefined (inbox, 2026-11-01).

The spike conclusions in steps 1-4 hold up. The findings are one disabled enforcement gate, two required observations with no developer deferral, and evidence that can no longer be reproduced.

## Findings

1. {file: `docs/overlay/10-execution-plan.md`, line: 45, severity: high, claim: `overlay-check` is documented as a required check on `overlay/main` but is not required now, and PR #23 merged without it., evidence: `gh api repos/VeroxAUS/t3code/branches/overlay%2Fmain/protection --jq '{keys:keys, rsc:(.required_status_checks // "ABSENT")}'` → `rsc: "ABSENT"`, while `phase-0-review.md:26` recorded it as required. `gh api repos/VeroxAUS/t3code/commits/<sha>/check-runs` shows no `overlay-check` on any of PR #23's six commits. Its timeline shows close/reopen twice, then the merge at 2026-10-31T06:05:30Z. No entry in `decisions.md` records the change, and the API does not show when or by whom it changed. PR #23 itself did no harm: `git diff --name-only 6be477f2d7 a531b20bc4` has no path outside the overlay-owned set, and PR #24 ran `overlay-check` successfully., suggested fix: Developer action below. It cannot be done by a fix thread.}
2. {file: `docs/overlay/spikes/permissions-map.md`, line: 194, severity: medium, claim: Step 3 does not record Antigravity's effective mode for `interactionMode: plan`, which the roadmap requires, and decision 32 does not defer it., evidence: The spike says native selection "remains unverified". `packages/provider-acp/src/server/adapter.ts:6766-6795` calls `setMode` or `setConfigOption` only when `plan`/`architect` is advertised and otherwise continues with no error, so a silent no-op is possible and neither outcome is observed. `grep -rlE "set_mode|currentModeId|availableModes|setSessionMode" .t3/userdata/logs/provider` → no match. Decision 32 names only Claude and Codex cells. The Antigravity plan cells did reach accepted, declined and unprompted writes, so the behavioural classification stands; only the native mode is missing., suggested fix: Run a model-free ACP `session/new` probe on the isolated server, record `availableModes` and mode-category config options, and reclassify. If the developer prefers, they defer it explicitly instead (open question).}
3. {file: `docs/overlay/spikes/candidate-workspace.md`, line: 209, severity: medium, claim: Step 4's required setup-script evidence was never observed, because the probe's script was never effective, and no deferral covers it., evidence: The roadmap and step 4 item 3 require setup effects recorded separately from Git copying. The fixture stored its script on the project, but `packages/shared/src/projectScripts.ts:15-17` ignores stored scripts when `projectSettingsFolded` is true and no override exists. I confirmed `.t3/userdata/settings.json` has `projectSettingsFolded: true` with no `defaultProjectScripts` or overrides. The recipe's setup branch at line 232 is therefore untested, and real verifier checkouts need setup to run. The spike reports this honestly as untested., suggested fix: Repeat the fresh and `existing_worktree` launches on idle threads with `projectSettingsOverrides[<probe project>].defaultProjectScripts` set on the isolated server, then record outputs and completion. No provider spend is needed. The alternative is an explicit developer deferral (open question).}
4. {file: `docs/overlay/spikes/candidate-workspace.md`, line: 13, severity: medium, claim: Step 4's fixture and verification cannot be reproduced from the repository, though the roadmap asks for reproducible commands., evidence: `/tmp/phase0b-step4-{prepare,capture,verify,cleanup}.py` were never committed and `ls /tmp/phase0b-step4-evidence-20261031` → no such file. The bundle recovery in recipe step 1 (line 221) is now dead, and the PASS output, the 17 archive hashes and writer digest `588b34e7…` cannot be recomputed. Line 275 anticipated this loss. The launches, bindings, idle state and deletions do survive in `orchestration_events` (see Checked)., suggested fix: Put a self-contained fixture and capture script in the spike as `permissions-map.md` does (a fenced script, not a repository helper) and replace the bundle step with it. Finding 3's re-probe can produce this.}
5. {file: `docs/overlay/spikes/permissions-map.md`, line: 140, severity: low, claim: Step 3's file-state command and the handoff's `verify-capture.py` point at an archive that no longer exists., evidence: `ls /tmp/phase0b-step3-evidence-20261031` → no such file. I recomputed all 20 snapshot digests from the committed baseline formula and final-content table and all match, which proves the tables agree with the digests but not the original bytes. Decisions and native modes verify independently (see Checked)., suggested fix: Add one sentence that the archive is gone, and that the committed tables, digests and SQL are the durable record.}
6. {file: `docs/overlay/spikes/replay-durability.md`, line: 58, severity: low, claim: The identity evidence is weaker than stated in two places, though the proposed key itself holds., evidence: (a) Line 58 and `handoffs/phase-0b-step-2.md:38` say Codex has a source path that starts null and then discovers a strong ref. The only `nativeTurnRef: null` I found is `runGoalCommand` (`CodexAdapterV2.ts:6159`), which stays null through completion under the synthetic `goal-command:` ID, and all 229 live Codex turn events have strong refs. (b) The "equal ordinals on different attempts" fixture (`ReplayDurability.spike.test.ts:355-376`) also changes `runId`, so it does not separate the proposed key from 03 rule 1's `(runId, ordinal)` fallback. Live data has 0 duplicate `(run, ordinal)` pairs and 0 null-run turns across 54 turns. The better evidence is `runGoalCommand`'s null ref under a strong capability, and native subagent turns with `projectionRunId: null` (`CodexAdapterV2.ts:2495-2510`)., suggested fix: Correct the sentence and handoff gotcha to cite those two paths, and either give the fixture one shared run or describe it accurately.}
7. {file: `docs/overlay/spikes/token-semantics.md`, line: 85, severity: low, claim: The stated reconciliation rule admits turns whose native-subagent scope is unresolved., evidence: The spike says reconciliation must require `complete` and `priced`. `TurnUsageSnapshot` in `packages/routing/src/costs.ts:1-8` omits `hasSubagents`, so a `hasSubagents: true` turn returns `complete: true`. `replay-durability.md:96` says unresolved native-child scope must not release a reservation, and the two spikes disagree. All 50 live usage rows have `hasSubagents: false`, so nothing has mispriced., suggested fix: State the third condition in the spike for Phase 1 to carry. No change to `costs.ts` is needed in this phase.}

## Checked, with evidence

Repeatable checks I re-ran myself:

- `cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts` → 22 passed. I re-derived the five hand-computed USD vectors by hand and they match.
- `cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts` → 5 passed.
- `vp test run src/provider/TurnTokenUsage.test.ts` → 5 passed. The step 3 focused command → 4 passed, 32 skipped. The step 4 focused command → 4 passed, 40 skipped.
- Step 2's controlled negative, on a temporary copy of the test with `withTransaction` removed (copy deleted, tree clean) → 2 failed, 3 passed, with input 150 against the expected 100. This matches the spike.
- `node scripts/overlay-check.ts --base origin/overlay/main` → pass.
- `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` → only manual run 40822950375, as carried. I dispatched nothing.

Read-only queries on the worktree's isolated `.t3/userdata/statev2.sqlite` (`immutable=1`; the live install was not touched):

- Step 1: events 148, 189, 248, 252, 253 and 257 match the spike. Native Claude and Codex transcripts match the persisted counters (2/12941/13674/15 and 21097/11648/0/8). The `multi_turn` fixture extracts match.
- Step 2: the identity table reproduces, including the Claude weak→strong→weak flip and null attempt back-pointers. No turn has usage followed by a usage-free event, and none has an event after its first terminal status.
- Key stability: across 54 turn keys, 0 have more than one attempt, run or ordinal, and 11 have more than one native ID. That confirms the key must not include the native ref. ID sources are restart-stable: Claude `turn:<attemptId>`, ACP `<session>:turn:<persisted ordinal>`, Codex native ID.
- Step 3: all 10 launch inputs, persisted modes and start sequences match. The 23 decisions match cell by cell. Native Codex `turn_context` matches all three rows of the spike's table.
- Step 4: launches 2421 and 2559, project scripts, zero runs, deletions 2784-2786 and the `full-access/default` thread modes all match.

Source claims checked: Claude and Codex normalizers, OpenCode's reasoning addition, ACP having no `turnTokenUsage`, the Claude, Codex and Antigravity mode mappings, `resolveProjectScripts`, Sqlite WAL/NORMAL, compaction excluding provider-turn, thread, run and attempt events, and the ingestor's in-memory dedupe. All hold.

Prompt checklist:

- Markers: `// overlay:` files equal the manifest's `Marker: yes` lines in both directions. PRs #20-#23 changed no upstream path, so no manifest line was due.
- Tests: `costs.ts` and the prototype both have tests. No sleeps, polling, wall-clock or per-test timeouts.
- Repo rules: no settings fields, UI, instruction text or tool descriptions changed, so the decoding-default, surface and eval checks do not apply. The handoffs report no repo-wide checks; I cannot prove that from artifacts.
- Promoted ideas: #37 is the phase's only row and belongs to step 5, in the second thread's scope.
- Fable briefs: replay idempotency and key stability are as above, in a prototype only. The privilege ceiling is exercised by the step 3 tests. Cache safety and settings migration are untouched. Budget bypass: see finding 7.

## Not reviewed

PR #24, the step 5 supplement to `permissions-map.md`, `api-credit.md`, `phase-0b-complete.md`'s tables, and the phase-wide exit criteria.

For the second thread, not findings of this review:

- The `Contradicted` row for 03 rule 1 cites the null back-pointer and the Claude ref flip. Rule 1 uses neither (it keys on capability, not per-snapshot strength). See finding 6 for better evidence.
- The exit table's "Met with one explicit deferral" should be read with findings 2 and 3.
- `phase-0b-complete.md` and `phase-0b-step-5.md` have `commit: see the branch head` instead of a SHA.

## Developer actions

- Restore the required check on `overlay/main`. Read the current settings first because `PUT` replaces them all: `gh api repos/VeroxAUS/t3code/branches/overlay%2Fmain/protection`. Then reuse the `PUT` in `docs/overlay/handoffs/phase-0-step-6.md:45-60`, carrying over everything else that read shows. Record `required_status_checks.checks` in the fix thread.
- Merge this PR when satisfied; the agent never merges.

## Open questions for the developer

- Was removing `overlay-check` from the required checks on `overlay/main` deliberate?
  Recommended: treat it as unintended and restore it — no decision records it, and the inbox's 2026-10-31 recovery item says the check should stay required.
  Answer: the developer believes it was dropped because of a problem with the check during a docs-only step, and it should be required as normal. A re-read on 2026-11-02 after this answer still returned `required_status_checks` absent, so the restore below is still owed.
- Finding 2: probe Antigravity's advertised modes, or defer it?
  Recommended: probe — it needs no model turn, and the Phase 1/2 role decision needs to know whether T3 plan is a native mode on Antigravity.
  Answer: probe.
- Finding 3: run the setup-script probe, or defer it?
  Recommended: probe — it costs no provider spend, and Phase 4's verifier depends on setup running in candidate checkouts.
  Answer: probe.

Next: Run docs/overlay/prompts/_fix.md for phase 0b with handoff docs/overlay/handoffs/phase-0b-review.md — on GPT-6.1 Sol high
