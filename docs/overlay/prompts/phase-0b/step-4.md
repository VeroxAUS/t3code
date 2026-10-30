# Phase 0b · Step 4 · Candidate workspace isolation

Launch line: `Run docs/overlay/prompts/phase-0b/step-4.md with handoff docs/overlay/handoffs/phase-0b-step-3.md`

Run on: Claude Sonnet 5.5 High or GPT-6.1 Sol high.

Read `docs/overlay/prompts/_preamble.md`. Gate: the Phase 0b step-3 handoff exists; stop for unanswered questions. Use `overlay/phase-0b-step-4` from the current `origin/overlay/main`.

## Read

`docs/overlay/07-roadmap.md` Phase 0b step 4 and exit; `05-delegation-engine.md` Roles and briefs / Pipeline templates; `spikes/permissions-map.md`; `apps/server/src/orchestration-v2/ThreadLaunchService.ts`; the `t3_thread_launch` schema/tool handler; existing workspace-launch tests. Read the schema's structured workspace strategy instead of copying shorthand strings.

## Do

1. In a disposable project, create a base commit and a distinct candidate commit, then dirty tracked files and add untracked/ignored sentinels in the writer checkout. Record SHAs and `git status --short --untracked-files=all`.
2. Use the actual T3 launch path with `workspaceStrategy.type: worktree` and `baseRef: <candidate SHA>`; record launch result and bound thread/worktree. Verify `git rev-parse HEAD` equals the candidate and inspect all sentinels in both checkouts.
3. Separately prove `existing_worktree` attachment retains that worktree's actual state; it does not reset to a requested candidate. Record setup-script-created files separately and prove the writer checkout was not changed by verification.
4. Write `docs/overlay/spikes/candidate-workspace.md` with exact launch inputs, command outputs, supported/unsupported behavior and a verifier recipe pinned to the candidate SHA. No production workspace changes. Missing MCP access needs an explicit developer action, not a shell-only substitute claiming T3 launch proof.
5. Stop only captured processes and clean up only disposable threads/worktrees you created; never the contributor's checkout. Carry the sync open item forward.

## Accept

Root `vp run check:changed origin/overlay/main` passes. Evidence includes launch responses, candidate-versus-HEAD equality, sentinel checks and before/after writer state. Existing-worktree behavior is demonstrated separately from fresh-worktree isolation. Any added test uses the existing package test layer with its exact focused command recorded.

## Handoff

Write `docs/overlay/handoffs/phase-0b-step-4.md` using 10 section 2. Next: `Run docs/overlay/prompts/phase-0b/step-5.md with handoff docs/overlay/handoffs/phase-0b-step-4.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high`.

## Finish

Commit, push and open this thread's PR into `overlay/main` as the preamble's "Branch and PR" section says, then stop. Your launch line is the developer's explicit request for that PR, so AGENTS.md's ask-first rule is already satisfied; do not stop short of it. Never merge.
