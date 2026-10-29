# Phase 0 · Step 8 · Port the Windows installer workflow; write the phase-complete handoff

Launch line: `Run docs/overlay/prompts/phase-0/step-8.md with handoff docs/overlay/handoffs/phase-0-step-7.md`

Run on: Claude Sonnet 5.5 High or GPT-6.1 Sol high.

Read `_preamble.md`. Gate: the step-7 handoff exists.

## Read

On the archived branch: `git show origin/fork-main:.fork/sync.sh` and `git show origin/fork-main:.github/workflows/fork-sync.yml`; `.github/workflows/overlay-sync.yml` from step 1; `docs/overlay/11-single-machine-and-cloud.md` section "Windows toolchain"; `docs/overlay/07-roadmap.md` Phase 0 exit criteria.

## Do

1. Create `.github/workflows/overlay-release.yml`: triggers `workflow_dispatch` and push of tags matching `overlay-v*`. Reuse `fork-sync.yml`'s installer build steps on a `windows-latest` runner and its draft-release publishing; drop its sync and keepalive steps, which `overlay-sync.yml` now owns. No schedule.
2. Confirm `fork-sync.yml` is absent from `overlay/main` (it lives on `fork-main`, and schedules run only from the default branch, so it is already inert). Record the command and result under Done.
3. Manifest lines for anything upstream you touched; the step-2 build flag may be reused for the installer build.
4. Write `docs/overlay/handoffs/phase-0-complete.md` as `10-execution-plan.md` section 2 describes: every Phase 0 exit criterion with its command or evidence URL (sync dispatch run and PR, `overlay-check` green and red cases, settings tests, dev server in WSL2, updater and analytics defaults, usage strip, installer draft release), the promoted-ideas checklist (#17 and #26), and the Next line:
   `Next: Run docs/overlay/prompts/_review.md for phase 0 with handoff docs/overlay/handoffs/phase-0-complete.md — on GPT-6.1 Sol low, or Claude Opus 5.5 Low if Codex wrote this phase`

## Accept

`vp run check:changed` passes. The dispatch of `overlay-release.yml` is a developer action after this PR merges (`gh workflow run overlay-release.yml --ref overlay/main`); the developer records the draft release URL in the complete handoff before the review starts, and the review checks it.

## Handoff

`docs/overlay/handoffs/phase-0-step-8.md` for this step, plus the complete handoff above. The complete handoff's Next line starts the review.
