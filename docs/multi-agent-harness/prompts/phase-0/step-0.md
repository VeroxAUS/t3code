# Phase 0 · Step 0 · Validate the dev toolchain in WSL2

Launch line: `Run DOCS/prompts/phase-0/step-0.md with handoff none`

Run on: Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium, started from a terminal inside WSL2 in a worktree of the fork on `overlay/main` (the developer start steps in `10-execution-plan.md` section 8 created the checkout, the branch and the toolchain). Any runtime mode; this step edits nothing but its handoff.

Read `_preamble.md`. Gate: none, this is the first link. Instead confirm `git remote -v` shows `VeroxAUS/t3code` and `uname -r` contains `WSL` or `microsoft`; otherwise stop and say so.

## Read

`AGENTS.md` sections "Dev servers" and "Verifying"; `docs/operations/development.md`; `DOCS/11-single-machine-and-cloud.md` section "Windows toolchain".

## Do

1. `node --version`, `pnpm --version`, `vp --version`: they must match `package.json` `engines.node`, `packageManager`, and the `vite-plus:` line of the `catalog:` in `pnpm-workspace.yaml`. Mismatch: stop and report; installing toolchains is the developer's job.
2. `vp i`. Respect the `.t3/setup-*` markers described in AGENTS.md.
3. `vp run dev` in the background; read the ports from the `[dev-runner]` line; confirm the web URL answers (curl, status 200); stop the server by the PID you captured.
4. `vp test run packages/contracts/src/settings.test.ts`.
5. `vp run check:changed` on a clean tree.

If any command fails, record the exact command and error and stop. Do not patch scripts or change the toolchain. Native Windows is not an option (upstream's own Windows test workflow says nothing passes there yet); the fallback is the repo's `.devcontainer`, which is the developer's decision.

## Accept

All five commands succeed inside WSL2; each command and its last output line are quoted in the handoff.

## Handoff

`DOCS/handoffs/phase-0-step-0.md`. Next line: `Run DOCS/prompts/phase-0/step-1.md with handoff DOCS/handoffs/phase-0-step-0.md — on the same model`. If everything passed you may continue into step 1 in this thread; it is small.
