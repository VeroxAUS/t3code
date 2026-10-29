# Phase 0 · Step 6 · overlay-check

Launch line: `Run docs/overlay/prompts/phase-0/step-6.md with handoff docs/overlay/handoffs/phase-0-step-5.md`

Run on: Claude Sonnet 5.5 High or GPT-6.1 Sol high.

Read `_preamble.md`. Gate: the step-5 handoff exists.

## Read

`scripts/check-changed.ts` as the template for a repo script; `.github/workflows/overlay-sync.yml` from step 1; `docs/overlay/10-execution-plan.md` section 2 (the overlay-check bullet) and `07-roadmap.md` Phase 0 exit criteria.

## Do

1. `scripts/overlay-check.ts`, Node, no new dependencies:
   - with `--base <ref>`: list the changed paths outside the overlay-owned paths (`packages/routing`, `apps/server/src/routing`, `apps/web/src/components/team`, `evals/routing`, `scripts/overlay-check.ts`, `.github/workflows/overlay-*.yml`, `docs/overlay`); fail if any is missing from the manifest `docs/overlay/CHANGES.md`, or the manifest names a path the repo does not contain; for files that can carry comments, warn when the manifest says `marker: yes` and no `// overlay:` line exists;
   - with `--base <ref>`, fail if the diff changes any upstream path and adds or changes no file under `docs/overlay/handoffs/` (the tag sync writes `sync-<tag>.md`, so sync PRs pass);
   - run `vp test run packages/routing`.
     Unit-test the first two behaviours with small fixtures. `scripts/` is the workspace `@t3tools/scripts`; add `scripts/overlay-check.ts` to the `scripts.entry` list in `knip.jsonc` (precedent: `setup-worktree.ts`) or knip goes red.
2. `.github/workflows/overlay-check.yml` on `pull_request` targeting `overlay/main`, running the script with `--base origin/overlay/main`. Call the same script from `overlay-sync.yml` after its merge step with `--base origin/overlay/main` too; the sync handoff satisfies the handoff rule and upstream's own files are not overlay changes, so the manifest check must ignore paths the merge brought in unchanged relative to upstream (compare against the upstream merge base, not only the PR base).
3. Now that the check reports, make `overlay-check` a required status check on `overlay/main` (`gh api`, or list the setting for the developer under Open questions). The sync PRs from step 1 satisfy it because the PAT triggers `pull_request` workflows and they carry a sync handoff; confirm that in the handoff.

## Accept

Script tests pass; this step's PR shows `overlay-check` green; a deliberate test PR that touches `packages/routing` without a handoff goes red (describe it in the handoff, then close it).

## Handoff

`docs/overlay/handoffs/phase-0-step-6.md`. Next line: `Run docs/overlay/prompts/phase-0/step-7.md with handoff docs/overlay/handoffs/phase-0-step-6.md — on Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium`.
