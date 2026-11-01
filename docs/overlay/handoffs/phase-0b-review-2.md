# Handoff · Phase 0b · Re-review · 2026-11-02 · Codex

status: passed
commit: 7cfc9589aad06d340b4ac487867c8829b00d13ce
supersedes: docs/overlay/handoffs/phase-0b-fix.md

## Where we are

Branch `overlay/phase-0b-review-2`. Reviewed the merged fix [PR #27](https://github.com/VeroxAUS/t3code/pull/27) and the findings in both `phase-0b-review.md` and `phase-0b-review-astra.md`. Phase 0b passes at the commit above. This closes both reviews; it does not certify the future production ledger, router or role enforcement.

## Findings

None remaining in the reviewed fixes. The developer answered yes to leaving the historical step records unchanged; their corrected spikes and fix handoff supersede them.

## Done, verified

- `git fetch origin`, `gh pr view 27 --json state,mergeCommit,files,statusCheckRollup,url` and `git diff 7cfc9589^1 7cfc9589` establish the reviewed baseline. PR #27 is merged; its [overlay-check](https://github.com/VeroxAUS/t3code/actions/runs/41313916488/job/124869863944) succeeded. The fix changes documentation and the synthetic identity fixture, not production behavior.
- `gh api repos/VeroxAUS/t3code/branches/overlay%2Fmain/protection --jq '.required_status_checks'` returns `strict: true`, `overlay-check`, app ID 15368. First review finding 1 remains resolved. No repository settings changed here.
- Extracted the committed Codex Python probe to `/tmp/p0b-review2/codex_probe.py`; `python3 -I /tmp/p0b-review2/codex_probe.py` from the worktree and from `/home/verox` reproduces all nine operations in each context on codex-cli 0.166.0. `workspaceWrite` refuses the home-subfolder write from the worktree and permits it from home; `readOnly` refuses both writes and `dangerFullAccess` permits both. File hashes agree. Fresh targets/config directories were cleaned by the script. This closes Astra finding 1 without inferring a T3 confinement guarantee.
- Extracted and ran `node /tmp/p0b-review2/antigravity_modes.ts /home/verox/src/t3code-phase-0 /home/verox/src/t3code-phase-0/.t3/userdata`: Antigravity 1.3.0, protocol 2, advertises only `default`, `auto_edit`, `yolo` in both mode channels, with six model choices and no collaboration-mode option. The adapter at `packages/provider-acp/src/server/adapter.ts:6766` selects neither a native plan mode nor config value. First review finding 2 closes. No prompt/model turn was sent. The initial sandbox browser-suppression check failed; the escalated repeat succeeded without browser use.
- Reproduced the candidate fixture and MCP helper from the committed fences in `candidate-workspace.md`, against a new empty home `/tmp/p0b-review2/home`. Started `vp run dev:server --no-seed --home-dir /tmp/p0b-review2/home`, created a disposable project, stopped the server, set its effective `defaultProjectScripts` override, restarted, and launched fresh and existing-worktree idle threads with the documented JSON shapes. Candidate `ecdb06ccec0d857250e4c3dc504e39a23e1451b8` is the fresh checkout HEAD. All six tracked files byte-match candidate objects; index and worktree diffs against the candidate are empty. Only setup's two declared files appear. Both checkouts contain the expected setup output with their own paths; the fresh terminal log ends in a setup sentinel with exit 0, while the attachment log has no completion sentinel. Zero `run.created` events. The writer's before/after capture digest is identical: `6d0d4a96ed0b18dae5b1320c0b6923b05cb993282b9d2d1ec4a9b9254a71e82a`. First review findings 3 and 4 close.
- Setup cleanup used `t3_project_delete` on project `mcp:01fbf29d-73cf-4c97-aaef-33c2f33361f1`, then removed only its two fixture worktrees. Stopped the captured server groups 97602 and 98392. No provider spend or browser use. Review artifacts remain outside the repository under `/tmp/p0b-review2`; the existing isolated settings were not modified by this setup reproduction.
- The old setup terminal directory is now empty, so historical terminal bytes were not independently verified; the fresh reproduction above supplies the repeatable check. Read-only SQL independently confirms the fix's launch/binding/deletion events 3907–3914. The existing settings SHA-256 is still `099757f6137c39c08b0c8caa9fc805471c7aca7bf213b19edee93ebead301b00`. The permission spike explicitly acknowledges its missing historical archive, closing first review finding 5.
- Ran the replay spike's committed read-only SQL: events 148/189/252 reproduce the Claude weak/strong/weak sequence, strong Codex refs and unavailable ACP billable usage; attempt back-pointers remain null. Inspected `completeGoalCommandTurn` and the native-child `projectionRunId: null` path in `CodexAdapterV2.ts`. The corrected disposition now uses these actual exceptions. The synthetic fixture shares one run across two attempts and asserts two retained rows. First review finding 6 and Astra finding 4 close.
- `cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts` → 5 passed; `cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts` → 22 passed. Separate `TurnTokenUsage.test.ts` → 5 passed. The documented mode and workspace filters across their four service/handler files → 8 passed, 72 outside-filter cases skipped. The first combined invocation also skipped the five token tests due to its filter; those were then run separately.
- Extracted `batch_probe.py` and executed submit/status/results with `urllib.request.urlopen` replaced by an in-process stub: all three use the expected method/path and `anthropic-version: 2023-06-01`; submit carries the recorded request shape and max_tokens 16. No API request or spend. The self-contained recipe closes Astra finding 3. Historical billing remains the developer-supplied Console evidence assessed in the previous review, not a newly repeated purchase or measured charge.
- `token-semantics.md` now requires complete, priced and resolved native-subagent scope for reconciliation, consistent with the durability spike. First review finding 7 closes without changing the arithmetic function or pretending it enforces a budget.
- `vp run check:changed d998e4e66e` → pass for all 11 fix files: format, lint, both knip stages, GraphQL, three affected package typechecks and the changed test file. `node scripts/overlay-check.ts --base origin/overlay/main` → pass, 23 routing tests. `git grep -l '// overlay:'` reconciles all 17 upstream marker files with the manifest; overlay-check source/test fixture strings and documentation are excluded from upstream markers. No upstream path was changed by the fix.

## Phase exit and scope

All five spikes have commands, results, baselines/versions and explicit limits. The corrected required-probe and credit rows agree with the observed probes and the developer's accepted scoped `go`; Astra finding 2 closes. The sole required deferral remains decision 32's named plan-write cells. Optional live coverage, stronger durability guarantees and hostile/async setup remain limits, not claims of proof.

Promoted idea #37 has its thread, title and separate batch investigation. Its accepted `go` remains limited to the exercised tool-less Haiku/Sonnet turns and text generation at low effort; the unexplained Haiku residual and unmeasured Max-window effect remain recorded. No billing eligibility, rates or paid behavior were newly asserted by this review.

The 03/04/05 assumption-disposition table now carries the identity exceptions, setup effects and permission limits into Phase 1. Fable event-sourcing and privilege concerns have focused prototype/ceiling tests here; production budget enforcement, cache policy and settings migration are not implemented by this phase. No settings schema, frontend entry point/client, wire contract, model-facing product instruction or tool description changed, so no new decoding-default, surface or eval requirement applies. No repo-wide check ran in this review; the handoffs report none in execution.

`gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,url` still shows only successful manual run 40822950375. Ticket #4927935 and the approved external-scheduler route remain the developer-owned carryover; no scheduled success or dispatch is claimed.

## Developer actions

Review and merge this review PR when satisfied. This agent never merges. Phase 1 design must resolve the carried ledger identity, unknown usage, role enforcement and scheduler choices before implementation.

## Open questions

- none

Next: Run docs/overlay/prompts/_design-round.md for phase 1 with handoff docs/overlay/handoffs/phase-0b-review-2.md — on GPT-6 Astra high or Claude Opus 5.5 High
