# Handoff · Phase 0 · Step 6 · 2026-10-29 · written by Claude Sonnet 5.5 / High

commit: d0a0367db02df2c803038803042c19f3c74a1b54
supersedes: docs/overlay/handoffs/phase-0-step-5.md
status: n/a

## Where we are

branch `overlay/phase-0-step-6` · worktree `/home/verox/src/t3code-phase-0` · PR: https://github.com/VeroxAUS/t3code/pull/7 · `overlay-check` green on it

## Done, verified

- Gate: step-5 handoff exists, `status: n/a`, no open questions — proof: `Read docs/overlay/handoffs/phase-0-step-5.md`
- `scripts/overlay-check.ts` (Node, no new dependencies): with `--base <ref>` it lists changed paths outside the overlay-owned paths, fails when one is missing from `docs/overlay/CHANGES.md` or the manifest names a path the repo lacks, warns when a `Marker: yes` JS/TS entry has no `// overlay:` line, applies the handoff rule, and always runs `vp test run packages/routing` — proof: `node scripts/overlay-check.ts --base origin/overlay/main` on this branch -> 1 overlay change (`knip.jsonc`), manifest ok, routing `Tests  1 passed (1)`
- Paths a sync merge brought in unchanged are ignored: the script finds the newest `vX.Y.Z` tag in `HEAD`'s history and drops changed paths whose content equals that tag — proof: `scripts/overlay-check.test.ts` builds a temp repo (base, upstream tag, overlay edit, merge) and asserts only the overlay-edited file is left
- Unit tests: `cd scripts && <repo>/node_modules/.bin/vp test run overlay-check.test.ts` -> `Tests  6 passed (6)` (owned-path matching, manifest parsing, both reconcile directions, marker warning, handoff rule, upstream-tag filtering)
- `knip.jsonc` lists `overlay-check.ts` in `scripts.entry`; manifest line added to `CHANGES.md` — proof: `vp run check:changed` -> `pass` for format, lint, knip 1/2 and 2/2, graphql, typecheck (37 packages), test (7 files, 108 tests)
- `.github/workflows/overlay-check.yml`: `pull_request` into `overlay/main`; fetches upstream tags, installs deps, runs the script with `--base origin/overlay/main`. The job is named `overlay-check`, so the required-check context is `overlay-check` — proof: `gh pr checks 7` -> `overlay-check  pass  1m45s` (https://github.com/VeroxAUS/t3code/actions/runs/40827112941)
- `overlay-sync.yml`: the final "Test routing package" step now runs the same script after the handoff step, so the sync handoff is in the diff — proof: workflow diff only; not run live (no dispatch, see Developer actions)
- Deliberate red test: PR https://github.com/VeroxAUS/t3code/pull/8 (this branch minus its handoff, plus a `packages/routing/src/index.ts` edit) -> `overlay-check` failed with `This diff changes files outside docs/overlay but adds or changes none under docs/overlay/handoffs/` (run https://github.com/VeroxAUS/t3code/actions/runs/40827331774). PR closed, remote branch and worktree removed.
- Sync PRs satisfy the check: `sync-<tag>.md` sits under `docs/overlay/handoffs/`; upstream's own files are filtered by the tag comparison; `OVERLAY_SYNC_TOKEN` is a PAT, so its PR triggers `pull_request` workflows. The tag filtering is covered by the temp-repo test; no real sync PR has run yet.

## Not done / deferred

- Branch protection is not changed (developer action below).
- The sync path is untested live; the first real sync PR is the proof.
- Deleted upstream files are not checked (`--diff-filter=ACMRT`): a deletion needs no manifest line and does not trip the stale-line rule.
- The marker warning is limited to JS/TS-family files; `knip.jsonc` (JSONC) and other comment styles are not checked.

## Decisions made and why

- Handoff rule widened. The Do bullet says "changes any upstream path", but the Accept test (a PR touching `packages/routing`, an overlay-owned path, must go red) and the enforcement table in `10-execution-plan.md` (`apps/**` or `packages/**`) need more. The rule is now: any changed file outside `docs/overlay/` needs a file added or changed under `docs/overlay/handoffs/`; docs-only PRs pass. I updated the matching sentence in `10-execution-plan.md`.
- `scripts/overlay-check.test.ts` added to the overlay-owned paths (script and `_preamble.md`), since it is new overlay code and not an upstream file.
- Upstream baseline is the newest plain release tag merged into `HEAD`, so the PR workflow fetches upstream tags (they are not on the fork).
- `--base` absent: only the routing tests run.

## Gotchas discovered

- `pull_request` checks out the PR merge commit; the three-dot diff `origin/overlay/main...HEAD` against it is the PR's own changes.
- A test PR into `overlay/main` only runs `overlay-check` if the workflow file is in its history, so the red test branched from this branch, not from `overlay/main`.
- `vp fmt` rewrote the new files once; the tests and lint rules need `// @effect-diagnostics nodeBuiltinImport:off` and a `NodeURL` namespace import for `node:url`.

## Developer actions

- After this PR merges, make `overlay-check` required. `PUT` replaces all protection settings, so compare first with `gh api repos/VeroxAUS/t3code/branches/overlay%2Fmain/protection` and add anything else it shows to the body:

  ```
  gh api -X PUT repos/VeroxAUS/t3code/branches/overlay%2Fmain/protection --input - <<'JSON'
  {
    "required_status_checks": { "strict": false, "checks": [{ "context": "overlay-check" }] },
    "enforce_admins": true,
    "required_pull_request_reviews": { "required_approving_review_count": 0 },
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }
  JSON
  ```

  Record the response's `required_status_checks.checks` in the step-7 thread.

## Open questions for the developer

- Is the widened handoff rule (any file outside `docs/overlay/`) what you want, or should overlay-owned-only PRs pass without one? The Accept test requires the wider reading.

## Next

Run docs/overlay/prompts/phase-0/step-7.md with handoff docs/overlay/handoffs/phase-0-step-6.md — on Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium
