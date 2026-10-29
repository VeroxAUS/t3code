# Handoff · Phase 0 · Review · 2026-10-29 · written by Codex

status: findings

commit: 1c8b306fa0b63a878e42cd590dd8503749aace1a
supersedes: docs/overlay/handoffs/phase-0-complete.md

## Findings

1. {file: `.github/workflows/overlay-release.yml`, line: 62, severity: high, claim: The installer workflow fails before building, so the draft-release exit criterion is unmet., evidence: `gh run view 40830883262 --json conclusion,jobs,url` reports checkout failed and draft release skipped; `gh run view 40830883262 --log-failed` reports `No url found for submodule path '.repos/alchemy-effect/submodules/distilled' in .gitmodules` during checkout's credential-removal traversal. `gh release list` has no overlay release. Run: https://github.com/VeroxAUS/t3code/actions/runs/40830883262., suggested fix: Remove the failing checkout credential override as proposed in the complete handoff, then have the developer dispatch the merged workflow and record a successful draft release URL and its installer assets.}

2. {file: `docs/overlay/handoffs/phase-0-complete.md`, line: 24, severity: medium, claim: The usage-strip render exit criterion has no runtime evidence., evidence: Both the step-7 and complete handoffs explicitly say no render pass was completed. The complete handoff's answered question directs this review to flag the gap and the fix thread to run the pass. A bundle grep cannot establish rendering; `UsageStrip` returns null when no pools exist., suggested fix: In the fix thread, complete the approved integrated dev pass with representative quota data, record a screenshot showing the strip and the exercised environment/provider, and update the handoff.}

3. {file: `docs/overlay/handoffs/phase-0-complete.md`, line: 15, severity: medium, claim: Scheduled sync has not yet been verified as required by the Phase 0 review., evidence: `gh run list --workflow overlay-sync.yml --json databaseId,event,conclusion,url` returns only successful workflow_dispatch run 40822950375 and no schedule event. The default branch is correctly overlay/main and the workflow declares cron `17 3 * * *`; this is missing evidence, not proof of broken scheduling., suggested fix: After the next scheduled execution, inspect and record its URL, event and conclusion; investigate workflow enablement only if it does not run. Do not substitute another manual dispatch for scheduled evidence.}

4. {file: `scripts/overlay-check.ts`, line: 110, severity: medium, claim: Deletion-only code PRs bypass the required handoff rule., evidence: `changedPaths` uses `--diff-filter=ACMRT`, and the same filtered paths feed `handoffRuleBroken`. A temporary git repository reproduction committed only deletion of code.ts: actual diff `D code.ts`, returned paths `[]`, `handoffRuleBroken: false`. The developer explicitly requires a handoff for any change outside docs/overlay, including overlay-owned code., suggested fix: Include deletions in the path list used for the handoff rule; keep any manifest-specific deletion filtering separate. Add a focused regression using the existing temporary-repository test pattern that fails for a deletion-only PR without a handoff.}

## Done, verified

- Review PR: https://github.com/VeroxAUS/t3code/pull/11 into overlay/main; implementation unchanged.

- Read all Phase 0 handoffs, roadmap Phase 0, cited fork/architecture guidance, manifest, relevant final-review briefs, and the named PR diffs (6–10, including deliberate red PR 8). Reviewed the cumulative code diff from v0.1.3 for the earlier steps. No implementation fixes made.
- From each owning package, ran `/home/verox/src/t3code-phase-0/node_modules/.bin/vp test run <paths>`: contracts `src/settings.test.ts` → 30 passed; shared `src/projectSettings.test.ts` → 21 passed; desktop `src/updates` → 63 passed; server `src/telemetry src/cloud` → 22 files / 190 tests passed; scripts `overlay-check.test.ts` → 6 passed; routing `src` → 1 passed. Server and scripts fixtures initially hit sandbox EPERM; their authorized reruns passed.
- `node scripts/overlay-check.ts --base v0.1.3` → pass, 20 upstream overlay files reconciled. Compared `rg -l '// overlay:'` outside docs with the manifest: all 17 marked paths match; remaining three entries are package JSON files and the lockfile. Current tree markers and manifest agree.
- `gh pr checks 7` → overlay-check pass; `gh pr checks 8` → overlay-check fail. Inspected the named successful manual sync run and failed release run rather than dispatching either.
- `gh api repos/VeroxAUS/t3code/branches/overlay%2Fmain/protection` → required overlay-check (app 15368), PR required, admins enforced, force pushes and deletions disabled. `gh repo view --json defaultBranchRef` → overlay/main.
- Settings tests prove old-file defaults, nested project merge and exclusion of global telemetry/limits. New settings fields have decoding defaults. Promoted #17 is implemented; #26 is recorded as set to Haiku 5.5 by the developer in the complete handoff's action result, despite its stale unchecked checklist item.
- No provider instruction/tool-description runtime text changed; eval requirement does not apply to the planning prompts. No adapter/session, privilege-ceiling, ledger/replay or budget enforcement code changed in Phase 0. No database migrations were added. Upstream round-trip preservation of unknown settings is not established by the Phase 0 tests and remains a final settings-migration review concern.
- Surface review: strip is mounted in ChatComposer, covering web and desktop; mobile has no port in this phase's explicit strip-port scope. No mutation entry points, RPC contracts or provider adapters changed. Primary-environment-only quota display is an explicit accepted limitation in the step-7 handoff. No browser or computer-use verification performed, following the complete handoff's latest answer.
- `uname -r` → WSL2; `node --version` → v26.12.1; `vp --version` → v1.4.0. Historical dev-server HTTP 200 evidence is in steps 0/4; not rerun because the latest handoff defers the integrated dev pass to the fix thread. Install was not repeated. No repo-wide checks were run in this review; prior changed-check results are historical evidence rather than independently reconstructed executions.

- Review validation: `vp run check:changed` compared against origin/main and passed lint, both knip checks, GraphQL, affected typechecks and 7 test files / 108 tests; its initial format failure was corrected with `vp fmt docs/overlay/handoffs/phase-0-review.md`. The final check uses origin/overlay/main as the appropriate review base.

## Developer actions

- After the release fix merges, run `gh workflow run overlay-release.yml --ref overlay/main -f version=0.1.3-overlay.1` and record the successful run and draft release with installer assets. This review did not dispatch or publish anything.
- Record the next actual scheduled sync run URL and result.

Next: Run docs/overlay/prompts/_fix.md for phase 0 with handoff docs/overlay/handoffs/phase-0-review.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high
