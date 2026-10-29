# Handoff · Phase 0 · Fix · 2026-10-29 · written by Claude Sonnet 5.5 / High

commit: 7808873d82a0da13d26113960a7c0f5f9cc4f5c2
supersedes: docs/overlay/handoffs/phase-0-review.md
status: n/a

## Where we are

branch `overlay/phase-0-fix` · worktree `/home/verox/src/t3code-phase-0` · PR: https://github.com/VeroxAUS/t3code/pull/12 · two of four findings fixed in code, two need the developer or time.

## Done, verified

- Finding 1 (release workflow checkout) — fixed: removed `persist-credentials: false` from the build job's checkout in `.github/workflows/overlay-release.yml`, per the cause recorded in the complete handoff. Proof: `git diff .github/workflows/overlay-release.yml` -> the two-line `with:` block removed; `vp run check:changed` -> format, lint and typecheck pass. The draft release itself is not proven until the developer re-dispatches (Developer actions).
- Finding 4 (deletion-only PRs bypass the handoff rule) — fixed: `changedPaths` in `scripts/overlay-check.ts` now lists deletions and feeds `handoffRuleBroken`; the new `presentPaths` keeps the `--diff-filter=ACMRT` list for the manifest reconciliation. Proof: new test "lists deleted paths so a deletion-only diff still needs a handoff"; `cd scripts && <repo>/node_modules/.bin/vp test run overlay-check.test.ts` -> `Tests  7 passed (7)`; with the filter restored on `changedPaths` the same command -> `1 failed | 6 passed` (`expected [] to deeply equal [ 'code.ts' ]`).
- `vp run check:changed` -> all pass, `test (7 files)` 109 tests.

## Not done / deferred

- Finding 2 (usage-strip render evidence) — not done. The Browser panel tools (`preview_open`, `preview_snapshot`) are not available in this thread, and `test-t3-app` says to stop and explain rather than switch to another automation system. No dev server was started and no screenshot exists. The step 7 and complete handoffs' "Open" line stays open.
- Finding 3 (scheduled sync evidence) — not fixable by a thread: `gh run list --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` at 2026-10-29 06:58 UTC -> only `workflow_dispatch` run 40822950375. The next `17 3 * * *` execution is 2026-10-30 03:17 UTC.

## Decisions made and why

- Split `changedPaths` (all changes, for the handoff rule) from `presentPaths` (no deletions, for the manifest), as the finding suggested. Deleting an upstream file still needs no manifest line, since nothing is left to name.
- `overlay-check.ts` and its test are overlay-owned, so no `CHANGES.md` line.

## Gotchas discovered

- The test-t3-app skill needs the Browser panel tools; a fix thread started from the terminal CLI does not have them.

## Developer actions

- After this PR merges: `gh workflow run overlay-release.yml --ref overlay/main -f version=0.1.3-overlay.1`, then `gh run watch <id>` and `gh release list`. Record the run URL and the draft `overlay-v0.1.3-overlay.1` with `T3-Code-*.exe`, its blockmap and `latest.yml` in the re-review.
  Result: installer run https://github.com/VeroxAUS/t3code/actions/runs/40833226635 succeeded
  Result: draft release overlay-v0.1.3-overlay.1 with T3-Code-0.1.3-overlay.1-x64.exe, .blockmap and latest.yml: https://github.com/VeroxAUS/t3code/releases/tag/untagged-5ecdc6ba2719b0a3a79a
- After 2026-10-30 03:17 UTC: `gh run list --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url`; record the run with `event: schedule`. Do not dispatch another manual run in its place. If none appears, check that the workflow is enabled.
- Usage-strip render pass (finding 2): either run it from a T3 Code session that has the Browser panel (seeded `vp run dev`, a provider with quota data such as `Replay (dev)`, one screenshot of the strip), or look at the strip yourself and record the environment, provider and screenshot here.
  Result: usage strip renders with the Replay (dev) provider; screenshot at C:\Users\Thomas\status.png

## Open questions for the developer

- Who runs the usage-strip render pass, given this thread had no Browser panel? The re-review cannot clear finding 2 without it.
  Answer: The developer runs the render pass by hand before the re-review and records the result and screenshot path under Developer actions.

## Next

Next: Run docs/overlay/prompts/_review.md for phase 0 with handoff docs/overlay/handoffs/phase-0-fix.md — on GPT-6.1 Sol minimal
