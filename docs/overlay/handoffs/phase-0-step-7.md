# Handoff · Phase 0 · Step 7 · 2026-10-29 · written by Claude Sonnet 5.5 / Medium

commit: c0d8f4c8ee38e628cbde6ecdec44971bbd6c0809
supersedes: docs/overlay/handoffs/phase-0-step-6.md
status: n/a

## Where we are

branch `overlay/phase-0-step-7` · worktree `/home/verox/src/t3code-phase-0` · PR: https://github.com/VeroxAUS/t3code/pull/9

## Done, verified

- Gate: step-6 handoff exists, `status: n/a`; its one open question is answered (keep the wider handoff rule) — proof: `Read docs/overlay/handoffs/phase-0-step-6.md`
- Ported the usage strip: `git checkout origin/usage-strip -- UsageStrip.tsx ChatComposer.tsx`. The branch's two commits touch only those two files; the `ChatComposer.tsx` diff against this branch is the import and one `<UsageStrip environmentId={environmentId} />` above `ComposerBanner.Dock` — proof: `git diff --stat v0.1.3..origin/usage-strip` -> 2 files, +106
- `// overlay:` markers on the import, the JSX line and the `UsageStrip.tsx` header; two manifest lines in `docs/overlay/CHANGES.md` — proof: `node scripts/overlay-check.ts --base origin/overlay/main` -> `overlay-check: pass`
- Lint fixes to the port: dropped `useMemo` (`no-manual-memo`, React Compiler) and gave the 30 s clock-tick effect a `react-effect-budget` disable with a reason; stripped a UTF-8 BOM from the file — proof: `vp run check:changed` -> pass for format, lint, knip 1/2 and 2/2, graphql, typecheck (37 packages), test (7 files)

## Not done / deferred

- Dev-run evidence with the `Replay (dev)` provider. AGENTS.md says not to launch browsers or dev servers for verification without the developer's agreement, and a log line cannot show a rendered strip. See Open questions.

## Decisions made and why

- Checked out the two files instead of cherry-picking; the second commit only edits `UsageStrip.tsx`, so the result is the same.
- Kept `UsageStrip.tsx` in `components/chat/`, as the prompt says.

## Gotchas discovered

- The prompt's `_preamble.md` path is `docs/overlay/prompts/_preamble.md`, not under `phase-0/`.
- The port was not lint-clean against current main: `no-manual-memo` and `react-effect-budget` both fail on it.

## Developer actions

- none

## Open questions for the developer

- OK to run one dev pass (`setsid vp run dev`, `Replay (dev)` provider, one browser screenshot) to confirm the strip renders? I did not do it without your say-so.
- For the Phase 1 design round (`03-cost-ledger-and-pressure.md`): the strip computes remaining % (`window.remainingPercent`), the low-quota threshold (`LOW_REMAINING_PERCENT = 20`) and time to next reset itself, from `@t3tools/shared/usageLimits`. The pressure signal will own remaining %, pace and thresholds; left as is, not refactored. It also reads only the primary environment's config.

## Next

Run docs/overlay/prompts/phase-0/step-8.md with handoff docs/overlay/handoffs/phase-0-step-7.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high
