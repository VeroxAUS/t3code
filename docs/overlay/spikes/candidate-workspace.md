# Phase 0b step 4 · Candidate workspace isolation

Baseline: `a1ec007be82fdc4156be3db73d226d29a62ea083` on `overlay/phase-0b-step-4`, the merged step-3 revision and current `origin/overlay/main` at investigation start. Investigation: 2026-10-31 Australia/Sydney. Documentation only; no production workspace implementation changes.

**A fresh T3 worktree launched from the full candidate SHA contains that candidate, without the writer's dirty files or later commit. Attaching an existing worktree retains its actual HEAD and dirt.** The writer's HEAD, index, statuses, file contents and hashes were unchanged after both probes. No setup files appeared: this instance's effective script selection was empty, despite the scripts stored in the disposable project. Successful setup execution is not claimed.

## Environment and fixture

`git fetch origin`, `git merge-base --is-ancestor origin/overlay/main HEAD` and `git rev-parse HEAD origin/overlay/main` confirmed the baseline and clean step branch. `node --version` and `vp --version` returned Node v26.12.1 and vp 1.4.0. The implementation session has no T3 MCP tools. The developer was given exact requests to relay to the isolated coordinator; no direct provider CLI or shell-created fresh worktree is counted as launch evidence.

The developer restarted the retained isolated home with `vp run dev --no-seed` and reused coordinator `8bb7473a-f5c0-4b5e-87b0-17d717454e45` in project `/tmp/t3-permission-probes`. The investigator started/stopped no server, used no browser/computer and did not access the live T3 install. The two probe threads inherited `full-access/default` and selected `codex/gpt-6-luna`, but remained idle with zero runs and no active provider thread; no provider execution or native cwd claim follows from that selection.

The disposable repository is `/tmp/phase0b-step4-20261031/writer`, with a separately prepared linked checkout at `/tmp/phase0b-step4-20261031/existing`. These are fixture repositories, not checkouts of the contributor's T3 repository. Initial captures and the manifest were saved in `/tmp/phase0b-step4-20261031/evidence`; see Cleanup for their final archive location. Preparation and capture helpers were `/tmp/phase0b-step4-prepare.py` and `/tmp/phase0b-step4-capture.py`; no helpers are added to production code.

`python3 /tmp/phase0b-step4-prepare.py` created a base, candidate, then a later writer commit, before dirtying the writer. `git -C /tmp/phase0b-step4-20261031/writer log --all --oneline --decorate` returned:

```text
921fe73 (candidate) probe: candidate
721b565 (existing-probe) probe: base
c96e6e1 (HEAD -> writer) probe: writer advances beyond candidate
```

| Identity                      | Full commit SHA                            |
| ----------------------------- | ------------------------------------------ |
| Base / existing checkout HEAD | `721b565e645ead2fdb6f75f15dd35ede822018aa` |
| Requested candidate           | `921fe73a6d7173e4d57614718a95084dc8b663b3` |
| Writer HEAD                   | `c96e6e133476e25b71771c45662bd91713a05a0f` |

The base tracks `.gitignore`, `setup.cjs`, `t3.json`, `tracked.txt` and `staged.txt`. The candidate changes `tracked.txt` from `base:tracked\n` to `candidate:tracked\n` and adds `candidate-only.txt` containing `candidate:only\n`. The later writer commit adds `writer-commit-only.txt` containing `writer:later-commit\n`. Here and below `\n` denotes one newline.

Initial snapshots were captured with:

```bash
python3 /tmp/phase0b-step4-capture.py writer-before /tmp/phase0b-step4-20261031/writer
python3 /tmp/phase0b-step4-capture.py existing-before /tmp/phase0b-step4-20261031/existing
```

The helper records `git rev-parse HEAD`, `git ls-files --stage`, both status commands below, and every non-`.git` file's exact contents and SHA-256 hash. It creates captures exclusively, so an accidental rerun cannot overwrite a baseline.

Writer `git status --short --untracked-files=all`:

```text
M  staged.txt
 M tracked.txt
?? writer-untracked.txt
```

Adding `--ignored` also reports `!! writer-ignored.txt`. These files contain `writer:staged\n`, `writer:unstaged\n`, `writer:untracked\n` and `writer:ignored\n`, respectively. The staged file is deliberately in the index, unlike the unstaged edit.

Existing checkout `git status --short --untracked-files=all`:

```text
 M tracked.txt
?? existing-untracked.txt
```

Adding `--ignored` also reports `!! existing-ignored.txt`. Their contents are `existing:unstaged\n`, `existing:untracked\n` and `existing:ignored\n`. Its HEAD is the base, deliberately different from both the intended candidate and writer HEAD. Before launch neither checkout contains either setup output.

## Exact launch requests

The coordinator registered this fixture project with `t3_project_create`:

```json
{
  "title": "Phase 0b step 4 candidate workspace probe",
  "workspaceRoot": "/tmp/phase0b-step4-20261031/writer",
  "scripts": [
    {
      "id": "candidate-probe-setup",
      "name": "Candidate probe setup",
      "command": "node setup.cjs",
      "icon": "configure",
      "runOnWorktreeCreate": true
    }
  ]
}
```

Response: project ID `mcp:f2b9d617-2b0b-43be-8f66-22719695ac25`, workspace root exactly as requested, and the requested script stored in `scripts`. Persisted `project.created` event: sequence 2405.

The fresh `t3_thread_launch` request is:

```json
{
  "projectId": "mcp:f2b9d617-2b0b-43be-8f66-22719695ac25",
  "title": "p0b4-fresh-candidate",
  "modelSelection": { "instanceId": "codex", "model": "gpt-6-luna" },
  "workspaceStrategy": {
    "type": "worktree",
    "baseRef": "921fe73a6d7173e4d57614718a95084dc8b663b3",
    "branch": "p0b4-fresh-candidate",
    "startFromOrigin": false
  }
}
```

The separate attachment request is:

```json
{
  "projectId": "mcp:f2b9d617-2b0b-43be-8f66-22719695ac25",
  "title": "p0b4-existing-attachment",
  "modelSelection": { "instanceId": "codex", "model": "gpt-6-luna" },
  "workspaceStrategy": {
    "type": "existing_worktree",
    "worktreePath": "/tmp/phase0b-step4-20261031/existing",
    "branch": "existing-probe"
  }
}
```

Both omit `message` and `attachments`, requesting idle threads. No provider turn is necessary to exercise workspace preparation. The intended candidate for comparison is still the SHA above; it is not supplied to `existing_worktree`, whose schema has no `baseRef`. Adding an unsupported field would not be a supported request to reset the checkout.

## Live responses and independent verification

The fresh launch returned:

```json
{
  "threadId": "mcp:b8417040-d8cb-48ce-85f9-af3a5d98d7f2",
  "link": "[p0b4-fresh-candidate](t3-thread://v1/mcp:b8417040-d8cb-48ce-85f9-af3a5d98d7f2)",
  "projectId": "mcp:f2b9d617-2b0b-43be-8f66-22719695ac25",
  "modelSelection": { "instanceId": "codex", "model": "gpt-6-luna" },
  "runId": null,
  "status": null
}
```

The existing-worktree launch returned:

```json
{
  "threadId": "mcp:daec640e-9e18-4201-ac42-42da581eeb47",
  "link": "[p0b4-existing-attachment](t3-thread://v1/mcp:daec640e-9e18-4201-ac42-42da581eeb47)",
  "projectId": "mcp:f2b9d617-2b0b-43be-8f66-22719695ac25",
  "modelSelection": { "instanceId": "codex", "model": "gpt-6-luna" },
  "runId": null,
  "status": null
}
```

`t3_thread_read` with `view: "activity"`, `limit: 20`, `maxCharsPerItem: 8000`, `runLimit: 1` confirmed the bindings below; both responses had `status: "idle"`, `runCount: 0`, `pendingRequestCount: 0`, empty `recentRuns` and empty `items`.

| Probe               | Bound branch           | Bound worktree path                                                        |
| ------------------- | ---------------------- | -------------------------------------------------------------------------- |
| Fresh candidate     | `p0b4-fresh-candidate` | `/home/verox/src/t3code-phase-0/.t3/worktrees/writer/p0b4-fresh-candidate` |
| Existing attachment | `existing-probe`       | `/tmp/phase0b-step4-20261031/existing`                                     |

Raw tool calls/results and shell output were saved to `evidence/coordinator.json`. Independent read-only SQL extraction from this checkout's `.t3/userdata/statev2.sqlite` correlated completed `t3-code.t3_thread_launch` items at `orchestration_events` sequences **2421** and **2559** with those exact inputs/responses and the coordinator ID above. The thread projections agreed with both bindings and recorded no active provider thread; the run and runtime-request tables had zero rows for either probe thread. No launch was retried.

The coordinator ran:

```bash
python3 /tmp/phase0b-step4-capture.py fresh-after /home/verox/src/t3code-phase-0/.t3/worktrees/writer/p0b4-fresh-candidate
python3 /tmp/phase0b-step4-capture.py writer-after-fresh /tmp/phase0b-step4-20261031/writer
python3 /tmp/phase0b-step4-capture.py existing-after /tmp/phase0b-step4-20261031/existing
python3 /tmp/phase0b-step4-capture.py writer-after-existing /tmp/phase0b-step4-20261031/writer
```

Both writer commands exited 0 with `PASS: writer HEAD, index, statuses, file contents and hashes unchanged`. The fresh/existing capture commands saved their complete snapshots but exited 1 on an investigator-added assertion requiring two setup files (`AssertionError: set()`). That assertion assumed project registration made the script effective; it did not indicate a candidate-tree or writer-preservation failure. The original failures and snapshots were retained, without rerunning launches, resetting sentinels or manually creating setup files.

The serialized writer-before, writer-after-fresh, writer-after-existing and final writer-after-record-deletion snapshots all have SHA-256 `588b34e74b7b1861c715dcb5fd86a662270467b9fbea1d05aa49d33b009c4786`.

`python3 /tmp/phase0b-step4-verify.py` then independently compared the saved snapshots with each current checkout, compared every candidate file against Git objects, checked both cached and working-tree diffs against the candidate, verified the script-selection settings and correlated the raw tool calls with persisted events. It exited 0 and saved `evidence/verification.json`:

```text
result: PASS
candidateSha: 921fe73a6d7173e4d57614718a95084dc8b663b3
freshHead:    921fe73a6d7173e4d57614718a95084dc8b663b3
existingHead: 721b565e645ead2fdb6f75f15dd35ede822018aa
writerHead:   c96e6e133476e25b71771c45662bd91713a05a0f
freshTrackedFilesMatched: 6
freshExtras: []
existingCompletelyUnchanged: true
writerUnchangedAfterBothAndCurrently: true
setupFilesObserved: []
```

`git rev-parse HEAD` in each checkout returned the corresponding full SHA above. Fresh `git status --short --untracked-files=all` and its `--ignored` variant both returned empty output; the writer and existing checkout returned exactly their respective before outputs recorded earlier. The complete sentinel comparison was:

| File / state             | Writer after both launches | Fresh candidate        | Existing after attachment |
| ------------------------ | -------------------------- | ---------------------- | ------------------------- |
| `tracked.txt`            | `writer:unstaged\n`        | `candidate:tracked\n`  | `existing:unstaged\n`     |
| `staged.txt`             | `writer:staged\n`, staged  | `base:staged\n`, clean | `base:staged\n`, clean    |
| `candidate-only.txt`     | `candidate:only\n`         | `candidate:only\n`     | absent                    |
| `writer-commit-only.txt` | `writer:later-commit\n`    | absent                 | absent                    |
| `writer-untracked.txt`   | `writer:untracked\n`       | absent                 | absent                    |
| `writer-ignored.txt`     | `writer:ignored\n`         | absent                 | absent                    |
| `existing-untracked.txt` | absent                     | absent                 | `existing:untracked\n`    |
| `existing-ignored.txt`   | absent                     | absent                 | `existing:ignored\n`      |
| `setup-created.txt`      | absent                     | absent                 | absent                    |
| `setup-ignored.txt`      | absent                     | absent                 | absent                    |

## Setup effects

The tracked `setup.cjs` contains this program (formatting normalized):

```js
const fs = require("node:fs");
for (const file of ["setup-created.txt", "setup-ignored.txt"])
  fs.writeFileSync(file, "setup:" + process.cwd() + "\n");
console.log("candidate-probe-setup:" + process.cwd());
```

The committed `.gitignore` ignores `writer-ignored.txt`, `existing-ignored.txt` and `setup-ignored.txt`. It does not ignore `setup-created.txt`. If executed, this script would produce one untracked and one ignored output with a checkout-specific cwd in their contents. The same setup command is present in the fixture's tracked `t3.json` and the explicit project registration. Neither output appeared in any checkout; no script was run manually to manufacture positive evidence.

Selective, read-only extraction from the isolated `settings.json` found `projectSettingsFolded: true`, an omitted `defaultProjectScripts` field (decoded default `[]`), and no `projectSettingsOverrides[<probe projectId>].defaultProjectScripts`. [resolveProjectScripts](../../../packages/shared/src/projectScripts.ts) returns the default scripts in this folded state, ignoring the project's stored `scripts` when no project override exists. [ProjectSetupScriptRunner](../../../apps/server/src/project/ProjectSetupScriptRunner.ts) uses that resolver and returns `no-script` when none is selected. **Inference from source plus captured settings:** the effective setup stage was skipped. The MCP thread read exposes no setup-stage result, so idle status alone was not used as proof of setup completion. Stored project scripts are not evidence that those scripts executed.

This investigation did not change the environment settings or fix that adjacent project-script behavior. Positive setup execution and output provenance remain untested; the demonstrated launch results have zero setup-created files to separate from Git content. For a future verifier whose effective script list is nonempty, capture script completion and inspect its outputs independently before accepting a candidate-tree comparison.

## Source contract and limits

- [Workspace strategy schema](../../../packages/contracts/src/orchestrationV2.ts) is a structured union. `worktree` requires `baseRef`, with optional `branch` and `startFromOrigin`. `existing_worktree` requires `worktreePath`, with optional `branch`; it offers no candidate/reset operation.
- [MCP tool](../../../apps/server/src/mcp/toolkits/project/tools.ts) documents that uncommitted edits are not copied and that `root` means the project checkout. [Its handler](../../../apps/server/src/mcp/toolkits/project/handlers.ts) checks that an attachment path belongs to the project's Git worktrees and validates a fresh worktree's base before accepting a launch.
- [ThreadLaunchService](../../../apps/server/src/orchestration-v2/ThreadLaunchService.ts) creates a fresh worktree from `baseRef`, or uses the supplied existing path without creating/resetting it. Workspace preparation is asynchronous; a launch response must be followed by a thread read and filesystem verification. Setup scripts can run for either kind of attached workspace. A branch label is not an assertion that HEAD equals the intended candidate.
- A candidate checkout separates worktree contents; linked worktrees still share Git objects, refs and repository configuration. It is not a write sandbox. Setup scripts or a provider with filesystem access may still change other paths. Step 3's permission limitations remain in force.
- These probes cover a local disposable Git repository and the actual launch/attach path, with idle Codex-selected threads. They do not establish provider cwd during a running turn, other provider adapters, remote-only candidates, submodules, network/relay/client behavior, hostile setup scripts, async setup failures or enforcement of a read-only verifier role. No frontend, protocol or provider implementation is changed.

## Verifier recipe pinned to the candidate

1. Record the immutable candidate SHA and writer's before state. For this fixture the SHA is `921fe73a6d7173e4d57614718a95084dc8b663b3`; before cleanup, `git -C /tmp/phase0b-step4-20261031/writer cat-file -t 921fe73a6d7173e4d57614718a95084dc8b663b3` must print `commit`. After cleanup, recover the exact commits with `git clone /tmp/phase0b-step4-evidence-20261031/candidate-workspace.bundle <new-disposable-writer>`; the dirty states are retained as snapshots, not committed in the bundle. Register the new path as a new project and use the newly returned project ID. Use a new evidence directory; do not overwrite these snapshots or attach a verifier to the writer.
2. Use the fresh `t3_thread_launch` JSON above with the registered disposable project ID, the full SHA in `baseRef`, `startFromOrigin: false`, and a branch unique to that probe. Capture the entire response. Use `t3_thread_read` for the returned ID and record its actual `worktreePath` and branch. Inspect the effective script list: for these captured settings it was empty. When a setup script is selected, establish its completion before accepting files or starting a verifier turn. An idle thread's `runId: null` does not itself establish setup completion.
3. Set `verifier_path` only to that returned path, then check:

   ```bash
   candidate_sha=921fe73a6d7173e4d57614718a95084dc8b663b3
   test "$(git -C "$verifier_path" rev-parse HEAD)" = "$candidate_sha"
   git -C "$verifier_path" diff --exit-code "$candidate_sha" --
   git -C "$verifier_path" status --short --untracked-files=all --ignored
   ```

   For the observed empty script selection, require empty status and no extra files, including no setup outputs. If the probe's setup script is deliberately made effective in a separate investigation, only its two declared outputs may be added: `?? setup-created.txt` and `!! setup-ignored.txt`, both containing exactly `setup:<actual verifier path>\n`. `tracked.txt` must contain `candidate:tracked\n`; `staged.txt` must contain `base:staged\n`; `candidate-only.txt` must exist; all writer/existing-only sentinels must be absent. Compare every tracked file's bytes against `git show <candidate>:<path>` and also check `git diff --cached --exit-code "$candidate_sha" --` for index changes.

4. Run the verification commands in the bound checkout, keep generated artifacts separate from candidate source changes, and record the actual SHA again with the results. Do not treat checkout isolation as a read-only enforcement guarantee. The fixture's acceptance commands are the SHA, tracked-tree and sentinel checks; a real project's verifier also receives that project's specified test command.
5. Capture the writer again. Compare HEAD, index, both statuses, file contents and hashes against the before capture. For this fixture the helpers produce JSON files directly comparable with `cmp`; any difference fails the writer-preservation check. Separately run the `existing_worktree` probe and report its actual HEAD and retained dirt. It has no candidate-reset input and is not an alternative to step 2.
6. Save launch responses, bound paths and setup evidence before deleting the disposable threads/project and removing only the linked worktrees created by the probe. Preserve captures outside those worktrees. Never reset or clean the writer or the contributor checkout to make the comparison pass.

## Focused checks

Existing package tests, no new tests:

```bash
cd apps/server
../../node_modules/.bin/vp test run src/orchestration-v2/ThreadLaunchService.test.ts src/mcp/toolkits/project/handlers.test.ts -t 'launches from|a launch binds only|a launch into a new worktree'
```

Result: 2 files passed, 4 tests passed, 40 outside-filter cases skipped. These cover fetched commit/base selection, attachment path validation and invalid-base rejection at the existing service/handler test layers. They are supporting checks, not a substitute for the required live SHA/sentinel evidence.

Root acceptance: `vp run check:changed origin/overlay/main` → pass for the two overlay documentation files; format passes and code/dependency checks skip appropriately. An initial sandbox `spawnSync git EPERM` required an escalated rerun. No production code, test or dependency changed; no repo-wide checks.

## Cleanup and operational carryover

After evidence capture, the coordinator read the disposable project and its complete thread list, confirmed exactly the two idle threads above with no runs/pending requests, and called:

```json
{
  "projectId": "mcp:f2b9d617-2b0b-43be-8f66-22719695ac25",
  "force": true
}
```

Tool: `t3_project_delete`. Response: the same project ID and workspace root, with `deletedAt: "2026-10-31T05:45:48.567Z"`. Its service cascaded deletion to the two disposable threads. Read-only SQL confirmed `thread.deleted` events **2784**, **2785** and `project.deleted` event **2786**, and non-null deletion timestamps on exactly those rows. Raw preflight and delete calls/results are retained in `cleanup.json`.

`python3 /tmp/phase0b-step4-cleanup.py` first checked those deletion records, zero probe runs/runtime requests and the precise three-entry fixture worktree list, then recaptured the writer unchanged after T3 record deletion. It ran:

```bash
git -C /tmp/phase0b-step4-20261031/writer bundle create /tmp/phase0b-step4-20261031/evidence/candidate-workspace.bundle --all
git -C /tmp/phase0b-step4-20261031/writer bundle verify /tmp/phase0b-step4-20261031/evidence/candidate-workspace.bundle
git -C /tmp/phase0b-step4-20261031/writer worktree remove /home/verox/src/t3code-phase-0/.t3/worktrees/writer/p0b4-fresh-candidate
git -C /tmp/phase0b-step4-20261031/writer worktree remove --force /tmp/phase0b-step4-20261031/existing
```

Result: bundle verified with complete history, fresh worktree removed, dirty fixture attachment removed after its contents were captured, and the fixture's worktree list contained only its disposable writer. The helper then archived the evidence and removed that fixture repository. It did not reset or clean the writer to make a preservation assertion pass. Both linked checkout paths and `/tmp/phase0b-step4-20261031` are now absent. The contributor's checkout, developer-owned coordinator/project, server and prior-step histories remain intact. No process was started or stopped by the implementation session.

Final local archive: **`/tmp/phase0b-step4-evidence-20261031`**. It contains the original snapshots (including the two failed setup assertions' captures), raw coordinator and cleanup calls, independent verification, the verified Git bundle, preparation/capture/verification/cleanup helpers, final writer comparison and `sha256.json`. It is outside the contributor repository and may be lost on reboot; the committed evidence above is the durable record. The original helper commands describe the pre-cleanup capture and are not expected to rerun against deleted resources.

Post-archive validation loaded `sha256.json` and compared each listed file with `hashlib.sha256(path.read_bytes()).hexdigest()` → **17 archived files match**, and both deleted checkout paths and the fixture root were absent.

Sync inspection: `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` still returned only successful manual [run 40822950375](https://github.com/VeroxAUS/t3code/actions/runs/40822950375), created 2026-10-29T05:21:44Z. Scheduled execution and support ticket **#4927935** remain pending; no workflow/settings mutation or dispatch was performed by this implementation session.
