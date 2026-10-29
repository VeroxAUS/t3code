# Handoff · Phase 0 · Step 8 · 2026-10-29 · written by Claude Sonnet 5.5 / High

commit: 0f0c6e548870ff3df2d77263f3888390cec75694
supersedes: docs/overlay/handoffs/phase-0-step-7.md
status: n/a

## Where we are

branch `overlay/phase-0-step-8` · worktree `/home/verox/src/t3code-phase-0` · PR: https://github.com/VeroxAUS/t3code/pull/10

## Done, verified

- Gate: step-7 handoff exists, `status: n/a`; its two open questions are answered (dev pass: yes, leave the strip's own remaining-% maths for Phase 1) — proof: `Read docs/overlay/handoffs/phase-0-step-7.md`
- `.github/workflows/overlay-release.yml`: triggers `workflow_dispatch` (required `version`) and tags `overlay-v*`, no schedule; `windows-latest` job runs install, web typecheck, `dist:desktop:win:x64`, the `data-usage-strip` and `latest.yml` greps, uploads the installer; an ubuntu job creates the draft release — proof: YAML parse via `yaml` from `apps/server` -> jobs `version`, `build`, `publish`. Not run (a dispatch is a developer action).
- Dropped from `fork-sync.yml`: the sync job, `FORK_PUSH_TOKEN`, the keepalive step, the `fork-main` and `usage-strip` push, and the failure-issue job.
- `fork-sync.yml` is absent from `overlay/main` — proof: `git ls-tree --name-only origin/overlay/main .github/workflows/fork-sync.yml | wc -l` -> `0`; `git ls-tree --name-only origin/fork-main .github/workflows/fork-sync.yml` -> `.github/workflows/fork-sync.yml`. `.fork/` is also absent from `overlay/main` (`git ls-tree -r --name-only origin/overlay/main | grep -c '^\.fork/'` -> `0`).
- No manifest line: the only new file is under `.github/workflows/overlay-*.yml`, an overlay-owned path.
- `docs/overlay/handoffs/phase-0-complete.md` written with every exit criterion, its evidence, the promoted-ideas checklist and the review Next line.
- Changed-files check — proof: `vp run check:changed` -> `pass` for unused patches, format, lint, knip 1/2 and 2/2, graphql, typecheck (37 packages), test (7 files, 108 tests); `node scripts/overlay-check.ts --base origin/overlay/main` -> `overlay-check: pass`

## Not done / deferred

- Dispatching `overlay-release.yml` and recording the draft release URL — developer action.
- The usage-strip dev pass — see Open questions.

## Decisions made and why

- Version comes from the tag or a required dispatch input, no default; `apps/desktop/package.json` is 0.1.2 and does not track the base tag.
- Draft release tag is `overlay-v<version>`, targeting the dispatched SHA.

## Gotchas discovered

- `OVERLAY_BUILD` is a constant, not a flag; nothing to pass in the installer build.
- The prompt names `windows-latest`; the old workflow used `windows-2025`. Followed the prompt.
- An unquoted `run: grep -q "version: ..."` is invalid YAML (nested mapping); the step uses a block scalar.
- The old `Check the update feed points at this fork` step only checked the version in `latest.yml`; renamed to say that.
- `gh run view <id> --log` for the sync run returned nothing here, so "nothing to merge" is inferred from there being no sync PR.

## Developer actions

- After this PR merges: `gh workflow run overlay-release.yml --ref overlay/main -f version=0.1.3-overlay.1`, then `gh release list` for the draft. Record the URL under the Open line in `docs/overlay/handoffs/phase-0-complete.md` before the review starts.
- Set `textGenerationModelSelection` to Haiku 5.5 (#26) and note it in the complete handoff.

## Open questions for the developer

- The step-7 dev-pass approval came after that thread ended, so the strip is not seen rendering. Run it in a separate thread (it would need a launch line), or look yourself? Answer decides whether the review sees a screenshot or a note.

## Next

Run docs/overlay/prompts/_review.md for phase 0 with handoff docs/overlay/handoffs/phase-0-complete.md — on GPT-6.1 Sol low, or Claude Opus 5.5 Low if Codex wrote this phase
