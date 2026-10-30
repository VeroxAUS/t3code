# Phase 0b · Step 3 · Provider permission map

Launch line: `Run docs/overlay/prompts/phase-0b/step-3.md with handoff docs/overlay/handoffs/phase-0b-step-2.md`

Run on: Claude Sonnet 5.5 High or GPT-6.1 Sol high.

Read `docs/overlay/prompts/_preamble.md`. Gate: the Phase 0b step-2 handoff exists; stop for unanswered questions. Use `overlay/phase-0b-step-3` from the current `origin/overlay/main`.

## Read

`docs/overlay/07-roadmap.md` Phase 0b scope, step 3 and exit; `05-delegation-engine.md` Roles and briefs; prior spike docs; `apps/server/src/mcp/OrchestratorMcpService.ts` mode clamps; `apps/server/src/orchestration-v2/DispatchModeLimit.ts`; Claude/Codex/Antigravity adapter permission builders and shared ACP handling; `packages/contracts/src/providerPolicy.ts` mode schemas.

## Do

1. Use isolated dev state and a disposable project with sentinel files. Record SHA, runtime versions, instance/model/auth kind and requested/effective modes. Claude, Codex and Antigravity/Google AI Pro are required live; OpenCode is optional if enabled.
2. Run the roadmap's permission matrix through T3 child launches: plan and approval-required are different axes. Test reads, direct file edits, shell writes and supported combinations. Explicitly record unsupported mode requests and any downgrade.
3. Capture approval prompts and deny/allow outcomes; inspect actual file hashes/content after each probe. Probe writes only in disposable sentinel paths. Refusal in agent text is not runtime enforcement; any unattempted action stays untested.
4. Write `docs/overlay/spikes/permissions-map.md` with commands, outcomes and an evidence-backed classification per action/provider: runtime-enforced, approval-gated, prompt-only, unsupported or untested. Propose role restrictions for 05 without shipping new enforcement or weakening upstream permissions.
5. Ask before browser/computer use; if T3 tools or account setup are unavailable, record the exact developer action and keep required evidence incomplete. Clean up only resources you created. Carry the sync open item forward.

## Accept

Root `vp run check:changed origin/overlay/main` passes. The spike includes reproducible launch inputs, observed approval behavior and before/after file-state commands for each required provider. No role is called read-only solely because its mode is named plan. If fixture/test code changed, run its focused package-local test and record the exact command.

## Handoff

Write `docs/overlay/handoffs/phase-0b-step-3.md` using 10 section 2. Next: `Run docs/overlay/prompts/phase-0b/step-4.md with handoff docs/overlay/handoffs/phase-0b-step-3.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high`.

## Finish

Commit, push and open this thread's PR into `overlay/main` as the preamble's "Branch and PR" section says, then stop. Your launch line is the developer's explicit request for that PR, so AGENTS.md's ask-first rule is already satisfied; do not stop short of it. Never merge.
