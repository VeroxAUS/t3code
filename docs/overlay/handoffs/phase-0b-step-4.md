# Handoff · Phase 0b · Step 4 · 2026-10-31 · written by GPT-6 / Codex

commit: b784f50751f1cf4d827e5e2e0c0d11836b8c9d8d
supersedes: docs/overlay/handoffs/phase-0b-step-3.md

## Where we are

Branch `overlay/phase-0b-step-4` · worktree `/home/verox/src/t3code-phase-0`. Candidate workspace investigation delivered in `docs/overlay/spikes/candidate-workspace.md`; Phase 0b remains incomplete. The commit above records the spike before this handoff. Local checks pass; PR creation pending, no CI completion claimed. Never merge from this thread.

## Done, verified

- Gate/base: `git fetch origin`, `git merge-base --is-ancestor origin/overlay/main HEAD`, `git rev-parse HEAD origin/overlay/main` → clean existing step-4 branch at `a1ec007be82fdc4156be3db73d226d29a62ea083`, the merged step-3 revision, with no unanswered predecessor questions.
- Disposable fixture: `python3 /tmp/phase0b-step4-prepare.py`, initial capture commands and `git status --short --untracked-files=all` → base `721b565e645ead2fdb6f75f15dd35ede822018aa`, distinct candidate `921fe73a6d7173e4d57614718a95084dc8b663b3`, writer HEAD `c96e6e133476e25b71771c45662bd91713a05a0f`; writer has staged/unstaged edits plus untracked/ignored sentinels. Separate existing worktree starts at the base with its own dirt. Exact bytes, statuses, hashes and launch inputs are in the spike; no contributor checkout was used as a fixture.
- Actual T3 launches: developer-relayed `t3_project_create`, two structured `t3_thread_launch` requests and `t3_thread_read` → project `mcp:f2b9d617-2b0b-43be-8f66-22719695ac25`; fresh thread `mcp:b8417040-d8cb-48ce-85f9-af3a5d98d7f2` bound to `/home/verox/src/t3code-phase-0/.t3/worktrees/writer/p0b4-fresh-candidate`; attachment thread `mcp:daec640e-9e18-4201-ac42-42da581eeb47` bound to `/tmp/phase0b-step4-20261031/existing`. Completed launch events 2421/2559 agree with raw inputs/responses. Both idle, zero runs/requests, no provider execution; no shell-only substitute or launch retry.
- Candidate and attachment behavior: `python3 /tmp/phase0b-step4-verify.py` → PASS; fresh `git rev-parse HEAD` equals the full candidate SHA, all six tracked files and index agree with candidate objects, no extra files/sentinels. Existing attachment retains base HEAD, index and every original dirty/untracked/ignored byte. `existing_worktree` has no `baseRef` field and does not request/reset to a candidate.
- Writer preservation: coordinator's two writer capture commands and final `writer-after-record-deletion` capture → HEAD, index, statuses, all file contents/hashes unchanged. All four serialized writer snapshots have SHA-256 `588b34e74b7b1861c715dcb5fd86a662270467b9fbea1d05aa49d33b009c4786`.
- Setup distinction: selective read of isolated script settings plus `resolveProjectScripts` / `ProjectSetupScriptRunner` → folded settings, empty default scripts and no probe override select no effective setup script, despite the stored project script. Neither setup output exists. Original fresh/existing capture commands saved complete snapshots but failed an investigator assertion expecting those outputs; these failures are preserved. Independent verification validates the observed empty script selection, rather than claiming setup ran or creating outputs manually.
- Existing focused package checks: `cd apps/server && ../../node_modules/.bin/vp test run src/orchestration-v2/ThreadLaunchService.test.ts src/mcp/toolkits/project/handlers.test.ts -t 'launches from|a launch binds only|a launch into a new worktree'` → 4 pass across 2 files, 40 outside-filter cases not run. No new test/code/fixture file added to the repository.
- Root acceptance: `vp run check:changed origin/overlay/main` → pass for both overlay documentation files; format passes, code/dependency checks skip appropriately. Sandbox `spawnSync git EPERM` required an escalated rerun; no repo-wide checks.
- Cleanup: coordinator's guarded `t3_project_delete` with the exact probe project ID and `force: true`, followed by `python3 /tmp/phase0b-step4-cleanup.py` → only those two threads/project deleted (events 2784/2785/2786), fixture worktrees/repository removed after verified Git bundling, writer still unchanged before removal. Archive `/tmp/phase0b-step4-evidence-20261031` holds raw tool calls, snapshots, helpers, verification, cleanup and bundle. `hashlib.sha256` audit against `sha256.json` → all 17 archived files match; both checkout paths and fixture root are absent. Developer-owned coordinator/project/server retained; no implementation-session process started/stopped or browser/computer use.
- Sync inspection: `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` → still only successful manual [run 40822950375](https://github.com/VeroxAUS/t3code/actions/runs/40822950375), created 2026-10-29T05:21:44Z. Scheduled evidence and support ticket **#4927935** remain pending; no workflow/settings mutation or dispatch by this implementation session.

## Not done / deferred

- Positive setup execution/output provenance remains untested. The observed effective script selection was empty; this step proves candidate checkout isolation and existing-worktree retention in that configuration. It does not fix the adjacent difference between stored and effective project scripts.
- No read-only enforcement, provider-turn cwd guarantee, remote-only candidate, submodule, relay/client or hostile-setup coverage. Linked worktrees share Git metadata; checkout separation is not a filesystem sandbox. Step 3's required unattempted permission probes and native Antigravity plan uncertainty remain unresolved; do not infer a developer deferral or Phase 0b pass.
- Step 5's separate Claude Credit billing/batch investigation and other inherited token/durability coverage gaps remain outstanding. This thread does not start step 5 or declare the phase passed.

## Decisions made and why

- No new developer policy decision or `docs/overlay/decisions.md` change. Observed behavior supports a fresh `worktree` pinned to an immutable candidate SHA for verification; `existing_worktree` is attachment, not candidate materialization. The future role/pipeline design still needs to address the permission map's enforcement limits.
- Preserve raw failed setup assertions alongside successful independent candidate/writer checks. Stored scripts, effective script selection, idle thread status and actual file state are different observations; no generated files are attributed to Git or setup without evidence.

## Gotchas discovered

- T3 MCP tools are absent in this implementation session. The developer restarted the isolated instance with `vp run dev --no-seed` and relayed exact blocks to retained coordinator `8bb7473a-f5c0-4b5e-87b0-17d717454e45`, titled `Check T3 Permission Test Tools`. Its project `/tmp/t3-permission-probes` needed recreating after reboot. For future relays, use one fenced block labelled **Copy this entire block to the coordinator**, with human guidance outside it; saved reports can be inspected directly without asking the developer to paste them.
- `t3_thread_launch` accepts structured `workspaceStrategy`, not shorthand. Omitting `message`/`attachments` creates idle threads while workspace preparation still happens asynchronously. `t3_thread_read` exposes bound paths but not setup-stage completion. Check actual HEAD and files; neither launch acknowledgement nor `runId: null` proves completion or isolation.
- With `projectSettingsFolded: true`, stored `project.scripts` do not become effective unless a project override selects them; an absent `defaultProjectScripts` decodes to `[]`. No instance settings were changed to force positive setup evidence. Treat this as a configuration/source finding, not a provider restriction.
- The probe launch paths are now deleted; the raw captures and full candidate Git history are archived at `/tmp/phase0b-step4-evidence-20261031`. Helpers record commands run before cleanup; the old launch project ID is deleted and must not be reused. The spike gives a bundle-based recovery path using a new disposable project. `/tmp` artifacts may be lost at reboot; committed evidence is the durable record.
- Only `docs/overlay/spikes/candidate-workspace.md` and this handoff change. Both are overlay-owned, so no `docs/overlay/CHANGES.md` entry or upstream marker applies. No UI/entry-point/client/provider/contract implementation changes, repo-wide checks or eval text changes. Git metadata outside the linked worktree's writable sandbox requires escalation for commits.

## Developer actions

- Review/merge this step's PR when satisfied; the agent never merges. Launch step 5 from updated `origin/overlay/main` afterward.
- Before Phase 0b review, resolve step 3's required unattempted permission coverage with targeted probes or an explicit developer deferral, preserving untested labels until resolved. Positive setup behavior needs its own correctly configured probe if later work relies on it; no production script-setting fix is authorized here.
- Before step 5, configure the separate Claude Credit instance under `docs/overlay/10-execution-plan.md` §8.1 and supply fresh isolated billing/Max-window readings or the browser authorization that step requires. Preserve subscription instance separation; the isolated coordinator/server can be reused.
- Sync: disable/enable was already performed; ticket **#4927935** remains pending. At the next relevant daily slot run `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` and record a real scheduled-run URL or support response. If a new upstream tag arrives while scheduling remains broken, the developer can run `gh workflow run overlay-sync.yml --repo VeroxAUS/t3code --ref overlay/main`; record it as manual evidence only. No dispatch from this thread.

## Open questions for the developer

- none

Next: Run docs/overlay/prompts/phase-0b/step-5.md with handoff docs/overlay/handoffs/phase-0b-step-4.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high
