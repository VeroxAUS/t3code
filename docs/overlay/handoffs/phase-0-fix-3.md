# Handoff · Phase 0 · Fix 3 · 2026-10-30 · written by Claude Opus 5.5 / Medium

commit: 318de71f2f
supersedes: docs/overlay/handoffs/phase-0-fix-2.md

## Where we are

Review 2's only finding (no `schedule` run of `overlay-sync.yml`) is still open and now looks like a GitHub-side scheduling fault, not a defect in the workflow. Part 1 (PR #16, merged 2026-10-30 04:46 UTC) added a temporary `*/10 * * * *` cron to prove the schedule; part 2 (this PR) removes it. No scheduled run appeared in between.

## Done, verified

- Part 1: https://github.com/VeroxAUS/t3code/pull/16, merged 04:46 UTC.
- No scheduled run, ever: `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` at 2026-10-30 06:37 UTC returns only manual run 40822950375 (`workflow_dispatch`, success). That misses the 03:17 UTC daily slot and about eleven 10-minute slots after part 1 merged.
- The workflow is valid and registered: the YAML on `overlay/main` parses to `schedule: [17 3 * * *, */10 * * * *]` plus `workflow_dispatch`; workflow 400205618 is `active`; no "workflow file issue" run exists.
- Repository settings cannot explain it: public, not archived; Actions enabled, all actions allowed; default branch `overlay/main`; `OVERLAY_SYNC_TOKEN` present; `githubstatus.com` reports Actions operational. Upstream's scheduled workflows (Release, Mobile Android APK) fire on `overlay/main` from 2026-10-29 10:58 UTC, which is when scheduled runs on the fork begin, so schedules work for every workflow except this one.
- Temporary cron removed; only `17 3 * * *` remains.

## Not done / deferred

- A scheduled run of `overlay-sync.yml`. The job itself is proven by the manual run.

## Gotchas discovered

- `overlay-sync.yml` was on `overlay/main` (2026-10-29 04:44 UTC) before scheduled runs on the fork began (10:58 UTC, presumably the default-branch switch). Its schedule was likely never registered, and a later cron change pushed to the default branch did not register it either.

## Developer actions

- If not already done: `gh workflow disable overlay-sync.yml --repo VeroxAUS/t3code`, then `gh workflow enable overlay-sync.yml --repo VeroxAUS/t3code`; record whether the next 03:17 UTC run appears.
- Open a GitHub support ticket: schedule on `.github/workflows/overlay-sync.yml` never fires while other scheduled workflows on the same default branch do. Record the ticket number here.

## Open questions for the developer

- Does the missing scheduled run still block Phase 0?
  Recommended: No — record in `decisions.md` that the manual run proves the sync job and that scheduled-trigger evidence carries into Phase 0b as an open item with the support ticket, so the re-review can pass; the cost of the fault is late upstream syncs, which a manual dispatch covers.

Next: Run docs/overlay/prompts/_review.md for phase 0 with handoff docs/overlay/handoffs/phase-0-fix-3.md — on GPT-6.1 Sol minimal
