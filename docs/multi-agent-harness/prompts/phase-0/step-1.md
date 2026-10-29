# Phase 0 · Step 1 · Branches and the nightly sync job

Launch line: `Run DOCS/prompts/phase-0/step-1.md with handoff DOCS/handoffs/phase-0-step-0.md`

Run on: Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium.

Read `_preamble.md`. Gate: the step-0 handoff exists and reports all five commands passed.

## Read

`DOCS/01-base-decision.md` section "Fork strategy"; `package.json` `engines` and `packageManager`; `.github/actions/setup-ci-deps` and one existing workflow under `.github/workflows/` for the repo's CI conventions.

## Do

1. Confirm with `gh repo view --json defaultBranchRef` that the fork's default branch is `overlay/main` (the developer set it). If it is not, stop: scheduled workflows run only from the default branch.
2. `git remote add upstream https://github.com/pingdotgg/t3code.git` if missing. `main` mirrors `upstream/main`; never force-push `main`. Write the mirror command (`git fetch upstream && git push origin upstream/main:main`) into the handoff.
3. Branch protection for `overlay/main`: require a PR and forbid force-pushes. Do **not** add a required status check yet; `overlay-check` does not exist until step 6, and a required check that never reports blocks every PR. Try `gh api`; otherwise list the exact settings under Open questions.
4. Add `.github/workflows/overlay-sync.yml`: triggers `schedule` (nightly) and `workflow_dispatch`. It requires the secret `OVERLAY_SYNC_TOKEN` (a fine-grained PAT with contents, pull requests and issues write); if the secret is absent it fails with a clear message. There is no fallback that pushes to `overlay/main` directly. Steps:
   - check out `overlay/main` with full history and the token; `git fetch upstream --tags`; pick the newest upstream tag matching `v*` that is not an ancestor of `overlay/main` (`git merge-base --is-ancestor`); if there is none, exit green with a log line;
   - if a branch `overlay/sync` exists with an open PR, check it out and `git merge --no-edit <tag>` into it (append; never reset or force-push); otherwise create `overlay/sync` from `overlay/main` and merge the tag into it;
   - on conflict: `git merge --abort`, create or update an issue titled `overlay sync conflict` listing the conflicting files and the manifest lines in `DOCS/CHANGES.md` that name them, exit 1;
   - on success: write `DOCS/handoffs/sync-<tag>.md` on the branch (`commit:`, the tag merged, files touched, "no overlay conflict"), commit it, push `overlay/sync`, and open or update a PR into `overlay/main` titled `overlay sync <tag>`. The PAT makes the PR's `pull_request` workflows run, and the sync handoff satisfies the handoff rule of `overlay-check`;
   - also run `vp i`, `vp run check:changed` and `vp test run packages/routing` (guarded by `test -d packages/routing` until step 3 creates it) inside the job as a first signal.
     Node and pnpm versions from `package.json`; use the repo's `setup-ci-deps` action.
5. Under Gotchas in the handoff: scheduled workflows stay disabled on a fork until Actions are enabled in the fork settings; anything done with `GITHUB_TOKEN` triggers no other workflows, which is why the PAT is required. Under Open questions: whether to enable auto-merge on the fork so passing sync PRs land without a click.

## Accept

The workflow file passes `actionlint` if available, otherwise a YAML parse. After this PR merges, the developer or the step-2 thread dispatches it once by hand and records the run URL and, if a newer tag existed, the resulting PR URL; step 2's prompt asks for that. The archived `fork-sync.yml` on `fork-main` needs no change: schedules run only from the default branch.

## Handoff

`DOCS/handoffs/phase-0-step-1.md`. Next line: `Run DOCS/prompts/phase-0/step-2.md with handoff DOCS/handoffs/phase-0-step-1.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high`.
