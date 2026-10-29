# 07 · Roadmap and implementation steps

Effort is for one developer driving agents through T3 itself, including tests and merges. Each phase ships behind a flag and is usable on its own. Phase order is 0, 0b, 1, 2, 3, 4, 5, 6. Order matters: nothing after Phase 1 is testable without the ledger and pressure signal. A phase is complete only when its review handoff records `status: passed` (`10-execution-plan.md` §2); the design round that opens the next phase folds that phase's promoted ideas (table at the end) into its numbered steps and writes that phase's step prompts under `prompts/phase-N/`. Phase 0's step prompts are already in `prompts/phase-0/`.

## Phase 0 · Fork hygiene (3–5 days)

Step prompts for this phase are in `prompts/phase-0/`; the developer pre-step that puts the docs into the fork is in `10-execution-plan.md` section 3.

Steps 0. Validate the dev toolchain inside WSL2 (`vp i`, `vp run dev`, one test run, `vp run check:changed`). Native Windows is unsupported upstream: `windows-tests.yml` is manual-only and says nothing in the suite passes on Windows yet, and `scripts/check-changed.ts` spawns `vp` without a shell.

1. `overlay/main` (from the upstream `v0.1.3` tag) is the fork's default branch (the developer set it; scheduled workflows run only from the default branch); `main` mirrors `upstream/main`. Protect `overlay/main` now with PR required and no force-push; the required `overlay-check` status is added in step 6, when the check exists, or every earlier PR would be blocked. Add `.github/workflows/overlay-sync.yml` (nightly + `workflow_dispatch`): find the newest upstream `v*` tag not yet an ancestor of `overlay/main`; if none, exit green; otherwise **merge** the tag into `overlay/sync` (append to the existing branch when its PR is still open; never reset or force-push), write a `docs/overlay/handoffs/sync-<tag>.md` handoff on it, and open or update a PR into `overlay/main` using the `OVERLAY_SYNC_TOKEN` PAT so the PR's required checks run; open an issue with the conflict list on failure; fail loudly without the token. No direct-push fallback.
2. Flip the defaults of the existing kill-switches so overlay builds neither auto-update from upstream (`T3CODE_DISABLE_AUTO_UPDATE` in `apps/desktop/src/updates/DesktopUpdates.ts`) nor report analytics (`T3CODE_TELEMETRY_ENABLED` in `apps/server/src/telemetry/AnalyticsService.ts`) unless opted in.
3. Add `packages/routing` (`@t3tools/routing`, one passing test, no T3 imports). `pnpm-workspace.yaml` and `knip.jsonc` already glob `packages/*`; the root `knip:check` script enumerates workspaces and needs `--workspace packages/routing`.
4. Add the single namespaced `overlay` key to `ServerSettings` + `ServerSettingsPatch` with decoding defaults (`routing.enabled: false`, `routing.mode: "off"`, budget defaults, `limits.maxConcurrentChildren: 6`, `cockpit.teamView: false`); add `overlay` to `PROJECT_SCOPED_SERVER_SETTING_KEYS` and `ProjectSettingsOverrides`, and give it a deep merge in `resolveProjectSettings` (today every key except `providerInstances` replaces the whole setting, which would wipe `budgets` when a project overrides `routing.mode`); one settings test row for an old file without the key, one for the nested override.
5. `docs/overlay/` in the fork: move this document set there plus `CHANGES.md`, `decisions.md`, `handoffs/` and `review-briefs/` (the eight final-round briefs). `prompts/` and `mockups/` move with the docs. Markers, not line numbers, are the source of truth for the hook table.
6. `scripts/overlay-check.ts` + `.github/workflows/overlay-check.yml`: the PR's changed upstream paths reconcile with the manifest `CHANGES.md` in both directions; PRs that change upstream paths carry a handoff file; routing tests pass. Make it the required status check on `overlay/main` (moved here from step 1). Actions enabled on the fork.
7. Port the usage strip from the archived `usage-strip` branch as overlay code with manifest lines; it seeds the team view's usage rail.
8. Port the Windows installer build from `fork-main`'s workflow as `.github/workflows/overlay-release.yml` (`workflow_dispatch` and `overlay-v*` tags, windows runner, draft release; no sync or keepalive steps); then write the phase-complete handoff.

Promoted ideas: #17 per-project policy (step 4 adds `overlay` to the project-scoped keys); #26 set `textGenerationModelSelection` (titles, triage) to Haiku 5.5 in your settings (a setting, no code).

Exit: sync job green once by `workflow_dispatch` (green with nothing to merge, or its PR green on `overlay-check`; the scheduled run is checked by the Phase 0 review); `overlay-release.yml` produces a draft release with an installer artifact; the usage strip renders; `overlay-check` green on a code PR and red on a deliberate PR without a handoff; settings round-trip and nested-override tests pass; dev server runs in WSL2; overlay builds neither auto-update from upstream nor report analytics.

## Phase 0b · Contract spikes (3–4 days)

Four short investigations against the pinned upstream revision, each producing a doc under `docs/overlay/spikes/` with command evidence and, where useful, a fixture or test. They settle the assumptions Phases 1 to 4 rest on, so the Phase 1 design round edits 03, 04 and 05 from facts rather than guesses. Step prompts are written by the Phase 0b design round.

Steps

1. Token semantics. For each adapter in use (Claude, Codex, OpenCode 2, ACP), capture one real turn's `turnTokenUsage` (the Replay provider plus one Haiku and one Luna turn) and record which fields are inclusive of which (`packages/contracts/src/providerRuntime.ts` defines input as including cache reads and writes, output as including reasoning). Write the disjoint-bucket function in `packages/routing/src/costs.ts` with per-provider fixtures and hand-computed expected USD. Output: `spikes/token-semantics.md`.
2. Replay durability. In a test only, prototype the ledger's durable turn identity, idempotent cumulative upsert and transactional cursor against the event store; prove crash mid-turn, duplicate delivery and late correction. Output: `spikes/replay-durability.md`.
3. Permissions. For Claude and Codex (and OpenCode if enabled), run a child under `interactionMode: plan` and under `approval-required`; record what is blocked, what prompts, and what is unrestricted, including writes through shell commands. Output: `spikes/permissions-map.md`, the capability map the role briefs cite.
4. Candidate workspaces. Prove `t3_thread_launch` with `workspaceStrategy: worktree` at a specific commit (`baseRef` = SHA) and `existing_worktree` attach; record the verifier recipe and what untracked state each carries. Output: `spikes/candidate-workspace.md`.

Exit: four spike docs with command evidence; `decisions.md` records which assumptions in 03, 04 and 05 changed; the Phase 1 design round reads them.

## Phase 1 · Cost ledger + pressure (1.5–2 weeks)

Steps

1. `packages/routing/src/costs.ts` + tests: pricing arithmetic over the parsed LiteLLM table shape used by `usagePricing.ts`.
2. `apps/server/src/routing/CostLedger.ts`: subscribe to the event stream; store token buckets per durable turn identity as an idempotent cumulative upsert; advance the cursor in the same transaction; pin a `rateVersion` per turn and price at read time (spec in 03); migration in `apps/server/src/persistence`; rollup by root by query. Hook 5 in `ProviderEventIngestor.ts`.
3. RPC `routing.getThreadCosts` in `packages/contracts/src/rpc.ts` + handler in `ws.ts` (follow `server.getUsageSummary`).
4. `packages/routing/src/pressure.ts` + table tests; `apps/server/src/routing/Pressure.ts` adapter with hysteresis state; push `pressure` on the `serverConfig` stream.
5. Hook 3: `capabilities` appends `usage.band` per provider.
6. UI: cost chip in `SidebarThreadRow.tsx` and `ThreadLineageWorkflowRow.tsx`; band dot in the model picker; mobile thread list chip.

7. RPC `routing.rebuildLedger` (reset the cursor and replay from the persisted event log; live events queue behind the replay) and `routing.repriceLedger`, with tests for crash mid-turn, duplicate delivery, late correction, partial then complete usage, a rate change then reprice, and rebuild equals live.
8. Promoted ideas for this phase (table at the end), one PR each.

Tests: `costs.test.ts`, `CostLedger.test.ts` (replay idempotency, rebuild equality), `pressure.test.ts`.
Exit: open any thread tree and see API-equivalent cost per child; providers show bands that match the Limits tab; rebuild produces identical totals.

## Phase 2 · Router in shadow mode (1.5–2 weeks)

Steps

1. `packages/routing/src/policy.ts`, `decide.ts`, `budget.ts` + exhaustive unit tests (matrix × bands × roles, arbitrage, pins, floors, hysteresis interplay, and a case proving `decide` never emits `xhigh`, `max`, `ultracode` or `ultrathink`).
2. `apps/server/src/routing/RoutingService.ts` + `DecisionLog.ts` (table `routing_decisions`, RPC `routing.getDecisions`).
3. Hook 1 in `resolveTarget` and hook 2 in `ThreadLaunchService.launch`: call `decide`, **log only**, apply the requested target.
4. Contracts: `DelegateTaskInput.tier`, `budgetUsd`; `DelegateTaskResult.routing` (reasons, applied); `budget_exceeded` failure code (unused yet).
5. `Settings → Routing` page: mode selector, matrix grid, tiers, live pressure strip, shadow report ("would have changed N of M decisions; projected API-equivalent delta").
6. `evals/routing` with deterministic cases.
7. Hook 4: add the delegation-policy instruction section (05) but keep the "omit target.model" line out until Phase 3.
8. Outcome capture (moved here from Phase 6 so the Phase 3 gate has evidence): attach verify pass/fail, review finding counts, merge result and final cost to each decision.
9. Promoted ideas for this phase (table at the end), one PR each.

Exit: every `delegate_task`, `create_threads`, launch and scheduled launch writes a decision; the shadow report page renders; `evals/routing` deterministic cases pass in CI.
Gate for Phase 3 (checked by its design-round prompt): the decision log holds at least 14 days **and** 200 decisions with every role represented; `decisions.md` holds a developer-signed "shadow report reviewed, matrix tuned" line (the shadow report reprices the requested model's actual tokens at the alternative's rates and is labelled an estimate, not measured cost per completed task); and the canary passed: 20 delegations, approved by the developer, executed on the router's choice with real runs, compared with their shadow prediction on cost per completed task and retry rate, passing when the cheap tier's retry rate is at most 1.5× the standard tier's and no quality-floor violation occurred.

## Phase 3 · Enforce + degrade ladder + budgets (2–3 weeks)

Steps

1. Flip `routing.mode` to `enforce` behind the flag; `resolveTarget` validates the **applied** target; `t3_thread_launch` and scheduled launches apply too.
2. Hooks 9/10: native subagent _defaults_ for Claude (`CLAUDE_CODE_SUBAGENT_MODEL`, never `_FORCE`) and Codex (`-c agents.default_subagent_model`, `default_subagent_reasoning_effort`), set at session start only while the band is red; the injected instructions route implementation and review children through `delegate_task` so the quality floor holds.
3. `BudgetGuard.ts` + hook 6 (`assertWithinBudget`): admission control with a reservation per launch (`perChildUsd` reserved at dispatch, replaced by landed cost when the ledger row completes) → `budget_exceeded`; alerts via the notification path (server `NotificationMailbox.ts`, web `ThreadNotificationCoordinator`) and mobile push; `windowReserve` gates automations by pressure band only. Extend `overlay.budgets` with `windowReserve` and `alerts` (decoding defaults). There is no overage setting.
4. Exhausted band → pending request offering a boundary switch with handoff or waiting for the reset; no automatic switch exists; unanswered, `UsageLimitRecoveryWorker` snoozes and resumes at reset as today.
5. UI: `WhyThisModel.tsx` popover on subagent rows and lineage rows; stepped-down chip; "Re-run on frontier" and "Pin" actions (pins stored in settings).
6. Update the injected instruction: ask by role + tier, omit model unless user-named.
7. `Settings → Budgets` page.

8. Promoted ideas for this phase (table at the end), one PR each.

Tests: `BudgetGuard.test.ts`, `RoutingService.test.ts` (enforce vs shadow, pins, floors), adapter tests for env injection (extend existing `ClaudeAdapterV2.test.ts` / `CodexAdapterV2.test.ts` rows), one `mcp-tool-use` eval case per new instruction line (repo rule: eval cases for instruction changes).

Exit: with Claude forced to red in a test environment, new delegates land on cheap/other provider with visible reasons; budget stops new children at the cap; an exhausted thread raises a question and does not switch.

## Phase 4 · Delegation engine (3–4 weeks)

Steps

1. `packages/routing/src/pipelines.ts`: templates (`feature`, `bugfix`, `research`, `sweep`, `best-of-n`) and role briefs; `.t3/roles/*.md` override loader (server, project-scoped); a persisted `pipeline_runs` record (root thread, template, current step, base SHA, candidate SHA, worktree path, approvals, attempts per step) updated by the templates through a small MCP tool. It is a record the invariants are checked against, not a workflow engine.
2. Role defaults applied in `decide` (tier, effort, runtime ceiling) and brief injected into the child's first message (extend the existing role-instruction path in `delegateTask`).
3. `/pipeline <name>` composer command + palette entry: expands the template into the root prompt. MCP `pipeline_start` tool that does the same for agents. Webhook recipe: GitHub label → scheduled-task webhook → `t3_thread_launch` with the template (docs only; the plumbing exists).
4. `Witness.ts`: stall detection, parent notification via the delegated-question path, amber badge, optional cancel; settings `overlay.witness: { stallMinutes, onStall }` with decoding defaults.
5. Server caps, each separate: `maxConcurrentChildrenPerRoot`, `maxChildrenLifetimePerRoot`, `maxAttemptsPerStep`, `maxDepth`, the global `overlay.limits.maxConcurrentChildren`, `maxTurnsPerChild` where the provider supports it, and `maxElapsedMinutesPerChild` with interrupt.
6. `MergeQueue.ts`: serialised lane (rebase → test → `merge-tree` → merge/PR), bounce on conflict; MCP `merge_queue_enqueue`; reactor on `subagent_result`.
7. Best-of-N: template that uses `create_threads`/`t3_thread_launch` with worktrees plus a judge delegate; cleanup through existing worktree removal.

8. Promoted ideas for this phase (table at the end), one PR each.
9. Template eval in `evals/routing`: five runs of the `feature` template on Sonnet 5.5 against a fixture repo, plus scenario runs for restart mid-pipeline, cancellation, duplicate completion delivery, a rejected approval and a verify failure. Invariants are checked against the `pipeline_runs` record: no merge without a passed verify and a reviewed candidate SHA, no skipped approval, correct behaviour in every scenario. Ordering adherence (steps appear as child threads in order, verifier receives no parent history) is the statistical part.

Tests: template expansion snapshots, witness state machine, merge queue with a fixture repo (`it.live`, subprocess fixture rule), caps.

Exit: `/pipeline feature` on a real ticket runs plan → implement → verify → review → merge with two human checkpoints and every step visible as a child thread; invariants hold in 5 of 5 runs and every scenario; ordering adherence 4 of 5.

## Phase 5 · Team view (2–3 weeks)

Steps

1. `TeamView.logic.ts` (grouping, ordering, filters) + tests.
2. `TeamView.tsx`, `AgentCard.tsx`, `AgentDrawer.tsx` (embeds the existing thread composer), `CommandDock.tsx` (target chip, tier/model picker, composer, Send / Steer / Queue), `UsageRail.tsx`, `ApprovalsInbox.tsx`, `MergeQueuePanel.tsx`, `teamCostStore.ts`; route, palette, keybinding, settings nav. Mouse-first; shortcuts are accelerators only.
3. Mobile `TeamScreen.tsx` from `ThreadAgentsSheet` rows; widget unchanged.
4. Two charts on the usage page section of the team view.
5. Performance pass per `docs/internals/performance-regressions.md`: render metrics script, websocket payload check.

6. Promoted ideas for this phase (table at the end), one PR each.

Exit: a fleet of 10 threads on one environment renders under the repo's render budget (`vp run report:renders`); respond to an approval from the inbox; mobile parity only if you use the mobile app.

## Phase 6 · Automations and learning (ongoing, 1–2 weeks to seed)

Steps

1. Routine templates as scheduled tasks: nightly `sweep` at cheap tier gated by `windowReserve`; PR babysitter (existing watch) with re-verify; dependency bump pipeline.
2. Outcome analysis (capture itself moved to Phase 2): cost per completed task by tier and role from the captured outcomes.
3. Shadow report v2: cost per completed task by tier and role; recommend matrix changes.
4. Optional: a cheap complexity classifier (Haiku) producing `complexity` for the parent to pass along; keep advisory, measure with `evals/routing` replay cases before trusting it.
5. Promoted ideas for this phase (table at the end), one PR each.

Exit: one night-shift sweep has run unattended inside the window reserve; a post-mortem page exists for a real ticket.

## Touch list summary (upstream files patched)

`OrchestratorMcpService.ts` (resolveTarget, capabilities, delegateTask role brief) · `ThreadLaunchService.ts` · `ThreadManagementService.ts` · `ProviderEventIngestor.ts` · `orchestrationInstructions.ts` · `ClaudeAdapterV2.ts` · `CodexAdapterV2.ts` · `contracts/orchestratorMcp.ts` · `contracts/settings.ts` · `contracts/rpc.ts` · `ws.ts`. The manifest in `CHANGES.md` is the inventory, not this list: it will also hold UI registration files (sidebar, lineage rows, model picker, settings navigation and search, keybindings, mobile), the root `package.json` scripts, knip configuration and build flags, and some of those cannot carry a marker. There is no numeric promise; the review checks the manifest against the diff, and the Phase 1 design round records a measured diff budget from Phase 0's actual numbers.

## Deliberately left out, why, and what to do instead

| Left out                             | Why                                                                                                                                                                                                                                                                                                                                                                                                    | Instead                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A server-side workflow engine        | T3 already has `delegate_task`, `task_status`, `t3_thread_wait` and a durable child-thread lifecycle, and the providers have their own (Claude Workflow tool and agent teams, Codex subagents). A second state machine would have to stay consistent with the event-sourced orchestrator on every upstream change, and upstream's own ethos is "the smallest model that makes behaviour unsurprising". | Pipeline templates are prompts the parent agent follows; the server adds only small reactors (witness, caps, merge queue). If templates prove unreliable, add a thin step-runner reactor that emits the next `delegate_task` when a child completes, still through existing commands. A two-week addition, not a rewrite. |
| A learned router before outcome data | RouteLLM-style routers need thousands of labelled samples; without them a learned router degrades quality silently, and the literature says complexity prediction is the weak link.                                                                                                                                                                                                                    | Rule matrix plus shadow report plus a decision log that records outcomes. After about a thousand decisions, evaluate a classifier offline against replay cases in `evals/routing`; promote it only if it beats the matrix on cost per completed task.                                                                     |
| Editing transcripts to save tokens   | On 5.5-generation models, editing earlier turns invalidates thinking blocks (accounts created after 2026-08-31 get a 400) and always breaks the cache.                                                                                                                                                                                                                                                 | Switch at boundaries through T3's handoff (fresh provider thread with a summary), rely on the providers' own compaction, keep children's briefs small so there is less to trim.                                                                                                                                           |
| Replacing T3's Usage page            | It already does history, custom prices and pooled limits well, and upstream keeps improving it.                                                                                                                                                                                                                                                                                                        | The team view links to it and adds only the rail gauges and two charts.                                                                                                                                                                                                                                                   |
| Multi-machine routing (idea #23)     | One machine for now; it adds nothing without a second subscription.                                                                                                                                                                                                                                                                                                                                    | Revisit when a VM becomes a second environment (`11-single-machine-and-cloud.md`).                                                                                                                                                                                                                                        |

## Promoted from the backlog, with steps

| Phase | Idea                                      | Steps                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | #22 burn forecast                         | `pressure.ts` computes `projectedExhaustAt`; show it in the rail gauge tooltip and the composer band dot; push a notification when the projection crosses the reset time.                                                                                                                                                                                                                                           |
| 2     | #33 plan-on-frontier, execute-on-standard | Matrix keys on `interactionMode`: `plan` rows resolve to frontier, `default` rows to the role's tier, so `delegate_task` with `interactionMode: "plan"` lands on Opus or Astra automatically.                                                                                                                                                                                                                       |
| 2     | #36 routing eval replays                  | Shadow decisions export to `evals/routing/cases/replay.ndjson` with a `label` column the developer fills in; grader compares tier.                                                                                                                                                                                                                                                                                  |
| 3     | #28 ultracode guard                       | Prompt-level: the injected instructions (05) tell agents not to start `ultracode`, Workflow or agent-team runs when the band is red, and the native-subagent env defaults make any that start cheap; these never pass through `decide`.                                                                                                                                                                             |
| 3     | #18 provider cooldown                     | `RoutingService` keeps a 5-minute cooldown per instance after two consecutive 429/5xx on launch; cooled instances are skipped by arbitrage.                                                                                                                                                                                                                                                                         |
| 3     | #25 cheap handoff summaries               | Handoff summary generation uses the cheap tier through T3's summarisation-provider hook; measured against the 16k token cap.                                                                                                                                                                                                                                                                                        |
| 3     | #30 budget push alerts                    | `BudgetGuard` thresholds 75/90/100 raise notifications through the notification path (server `NotificationMailbox.ts`, web `ThreadNotificationCoordinator`) and the mobile push path.                                                                                                                                                                                                                               |
| 3     | #32 pins                                  | `overlay.routing.pins[rootThreadId]`; "Pin provider" action on cards and lineage rows; `decide` honours pins before arbitrage.                                                                                                                                                                                                                                                                                      |
| 4     | #5 verification-gated cascade             | Pipeline step option `retryUp: true`: on verify failure the step re-runs once at the next tier; recorded in the decision log as an escalation.                                                                                                                                                                                                                                                                      |
| 4     | #15 owned-file manifests                  | Plan step emits `ownedFiles[]`; the writer brief includes it; the witness flags edits outside it; the merge lane runs `git merge-tree` against the target before testing.                                                                                                                                                                                                                                           |
| 4     | #29 role-scoped permissions               | `research`, `design` and `review` run with `interactionMode: plan` where the Phase 0b permissions map says it is read-only for that provider; `test` runs in a throwaway checkout of the candidate SHA; everything else is prompt-level and labelled so in the brief.                                                                                                                                               |
| 4     | #13 issue control plane                   | Webhook recipe: GitHub label `agent:ready` -> scheduled-task webhook -> `t3_thread_launch` with the `feature` template; claim = assign only when unassigned plus label `agent:claimed` carrying the root thread link and a 24h expiry refreshed by the witness; release on merge or expiry; webhook deliveries deduplicated by delivery id (T3's `webhookDedupe.ts`); prompt-level in the template, no server code. |
| 5     | #16 approvals inbox                       | Selector over per-environment pending requests; inline respond; keyboard `r`.                                                                                                                                                                                                                                                                                                                                       |
| 5     | #19 fleet heatmap                         | Cost per ticket per model, last 7 days, in the team view's usage section.                                                                                                                                                                                                                                                                                                                                           |
| 6     | #2 night shift                            | `sweep` routines scheduled after window resets, gated by `windowReserve`; a project setting lists the sweeps.                                                                                                                                                                                                                                                                                                       |
| 6     | #21 ticket post-mortem                    | A read-only page per root thread: timeline of children, decisions, costs, findings, merge result; exported as markdown into the PR.                                                                                                                                                                                                                                                                                 |
| 6     | #12 reference-returning researchers       | Research brief plus an eval case that fails when a researcher returns more than 300 words or pastes file contents.                                                                                                                                                                                                                                                                                                  |
