# Handoff · Phase 0 · Step 1 · 2026-10-29 · written by Claude Sonnet 5.5 / Medium

commit: 8498658091fc111ab8150a3167af5c9ed989ff6d
supersedes: docs/multi-agent-harness/handoffs/phase-0-step-0.md
status: n/a

## Where we are

branch `overlay/phase-0-step-1` · worktree `/home/verox/src/t3code-phase-0` · PR: see the PR for this branch (URL added to the PR body, not this file) · CI not yet run

## Done, verified

- Gate: step-0 handoff exists and reports all five commands passed — proof: `Read docs/multi-agent-harness/handoffs/phase-0-step-0.md` -> "Done, verified" lists install, dev, test, check, toolchain
- Default branch is `overlay/main` — proof: `gh repo view --json defaultBranchRef` -> `{"defaultBranchRef":{"name":"overlay/main"}}`
- `upstream` remote present — proof: `git remote -v` -> `upstream https://github.com/pingdotgg/t3code.git (fetch/push)`
- Branch is on top of `origin/overlay/main` — proof: `git merge-base --is-ancestor origin/overlay/main HEAD` -> exit 0
- `.github/workflows/overlay-sync.yml` added (schedule `17 3 * * *` + `workflow_dispatch`) — proof: `actionlint` not installed; YAML parse via `yaml` package from `apps/server` -> `yaml ok`
- Tag filter checked against real upstream tags — proof: `git ls-remote --tags upstream 'v*'` -> release tags are plain `v0.1.3`; `-nightly.*` and `-preview.*` also match `v*`

## Not done / deferred

- Branch protection on `overlay/main`: the `gh api -X PUT .../branches/overlay/main/protection` call was denied by the permission classifier in this session, so nothing was changed. `gh api .../protection` earlier returned 404 "Branch not protected", so the branch is currently unprotected. Settings are under Open questions.
- Workflow dispatch run: happens after this PR merges (step 2 asks for the run URL).
- `OVERLAY_SYNC_TOKEN` secret not checked or created; I cannot see or create the developer's PAT.

## Decisions made and why

- The newest-tag search uses `^v[0-9]+\.[0-9]+\.[0-9]+$`, not bare `v*`: upstream pushes `-nightly.*` and `-preview.*` tags that match `v*`, and 01-base-decision says the overlay tracks release tags only.
- Runner is `ubuntu-latest`: the repo's `blacksmith-*` runners do not exist on this fork.
- Job order: merge, push and PR first, then `setup-ci-deps`, `vp run check:changed` and `vp test run packages/routing` (skipped while `packages/routing` is absent), so a red check does not lose the sync PR.
- `DOCS/CHANGES.md` does not exist yet; the conflict issue body falls back to "none" for manifest lines when no `CHANGES.md` is found under `docs/overlay` or `docs/multi-agent-harness`. The sync handoff goes to `docs/overlay/handoffs` once that folder exists (step 5 moves it), else `docs/multi-agent-harness/handoffs`.
- If `overlay/sync` already contains the tag (open PR, rerun), the job skips the merge and only refreshes the PR.

## Gotchas discovered

- Scheduled workflows stay disabled on a fork until Actions are enabled in the fork settings (Actions tab -> enable).
- Anything done with `GITHUB_TOKEN` triggers no other workflows, which is why `OVERLAY_SYNC_TOKEN` (PAT) is required; the job fails with an explicit message without it and has no direct-push fallback.
- Mirror `main` with: `git fetch upstream && git push origin upstream/main:main`. Never force-push `main`.
- The workflow file lives under `.github/workflows/overlay-*.yml`, an overlay-owned path, so it needs no manifest line.

## Open questions for the developer

- Branch protection for `overlay/main` (Settings -> Branches -> add rule, or rerun the API call with permission): branch name pattern `overlay/main`; "Require a pull request before merging" on, approvals 0 for a solo repo; "Allow force pushes" off; "Allow deletions" off; do **not** add required status checks until `overlay-check` reports (step 6). Should I rerun the `gh api` call if you allow it?
- Enable auto-merge on the fork (Settings -> General -> "Allow auto-merge") so passing sync PRs land without a click? Without a required check on `overlay/main` auto-merge would merge immediately, so it only makes sense after step 6.
- Is `OVERLAY_SYNC_TOKEN` (fine-grained PAT: contents, pull requests, issues write) already set as a repo secret?

## Next

Run docs/multi-agent-harness/prompts/phase-0/step-2.md with handoff docs/multi-agent-harness/handoffs/phase-0-step-1.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high
