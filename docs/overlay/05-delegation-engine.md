# 05 · Delegation engine: roles, decomposition, pipelines, verification, merging

The router decides _who_. The delegation engine decides _whether_, _into what pieces_, _with what brief_, and _how the pieces come back together_. Most of it is data (templates and briefs) plus the injected instructions; the server code is caps, a witness, and a merge queue.

## Evidence that shapes the rules

- Multi-agent costs 3–10× tokens (Anthropic 2026), ~15× for research swarms, ~7× for Claude agent teams in plan mode. Only three justifications hold: context pollution, real parallelism, specialisation.
- Decompose **by context, not by role**. Planner/implementer/tester/reviewer splits on the same files produced a "telephone game". Keep a feature and its tests in one agent. Good seams: independent research paths, components with clean API contracts, black-box test runners.
- Writes stay single-threaded per file set (Cognition; Gemini CLI and Codex docs warn the same). Cross-agent PR pairs conflict 41.7% vs 19.8% same-agent (arXiv 2607.04697). Worktrees prevent clobbering, not semantic conflicts.
- A fresh-context verifier catches ~2 bugs per PR, ~58% severe (Devin Review). Verifiers "declare early victory"; demand the full suite and negative tests. Cap fix loops at 3.
- Over-delegation is the common failure (50 subagents for a trivial query; Opus 5 "delegates more readily"). Augment's rule: parallelise only units over ~2 minutes of agent work.
- Anthropic's 16-agent C compiler: lock-file claims on a shared task list, worktree per agent, frequent merges handled by the agents, and the whole thing stalls when every agent hits one monolithic blocker. "The verifier must be nearly perfect."

## Decomposition rules (what the injected instructions and the pipeline runner both enforce)

Split a task into delegates only when **all** of these hold:

1. A real constraint exists: the parent's context would fill with reading it doesn't need to keep, or the units are independent, or a specialist brief changes the outcome.
2. Units separate by file or module ownership with a stated interface.
3. Each unit has its own check (tests, a lint target, a reproducible command).
4. Each unit is worth more than a couple of minutes of agent work.

Keep one agent when phases are sequential on the same files, components are coupled, state is shared, or the job is a handful of tool calls. Never split a feature from its tests. Prefer read-only fan-out before any write fan-out. Depth 1 for workers by brief (a worker may not delegate unless its brief says so); the hard cap is `overlay.budgets.maxDepth`, default 2. Concurrency 3–5 for a ticket, up to ~16 only for scripted same-shape sweeps.

Server-side caps (BudgetGuard), each separate because they bound different things: `maxConcurrentChildrenPerRoot` (3), `maxChildrenLifetimePerRoot` (12; a feature pipeline uses four plus retries), `maxAttemptsPerStep` (2), `maxDepth` (2), the global `overlay.limits.maxConcurrentChildren` (6), `maxTurnsPerChild` where the provider supports it (Claude `maxTurns` via subagent options), and `maxElapsedMinutesPerChild` (60) enforced by interrupt.

## Roles and briefs

`delegate_task.role` exists today but only reaches the child as a one-line instruction. The engine gives each role a default tier/effort (04), a restriction with a named enforcement, and a brief template. Briefs live as markdown in the repo at `.t3/roles/<role>.md` (project-overridable) with built-in defaults in `packages/routing/pipelines.ts`. Precedence everywhere: user choices and the quality floor, then what the provider can actually enforce, then pressure.

T3 clamps a child’s requested interaction mode through `interactionModeRank` in `OrchestratorMcpService.ts`; that establishes a mode ceiling, not proof that shell writes are impossible. Phase 0b tests Claude, Codex and Antigravity/Google AI Pro and records the runtime-enforced, approval-gated and prompt-only capabilities in `spikes/permissions-map.md`. Treat read-only claims below as conditional on that evidence. Runtime approval modes are not a read-only sandbox.

| Role           | Default tier                           | Restriction and enforcement                                                                                                                                                                   | Brief essentials                                                                                                                                                    |
| -------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| research       | cheap                                  | `interactionMode: plan` (enforced where the map says read-only; otherwise prompt-level)                                                                                                       | Return references and a ≤300-word summary, never transcripts. Stop at the question asked.                                                                           |
| design / plan  | frontier                               | `interactionMode: plan`                                                                                                                                                                       | Output: spec with acceptance checks, an **owned-file list**, and the base SHA. No edits.                                                                            |
| implementation | standard                               | inherit (≤ parent); own worktree from the project's integration branch                                                                                                                        | Own the listed files plus their tests. Run the project's test command before reporting. Report changed files, the candidate SHA, commands run, open questions.      |
| test / verify  | standard (cheap when red)              | throwaway checkout of the candidate SHA (`t3_thread_launch`, `workspaceStrategy: worktree`, `baseRef: <candidateSha>`); prompt-level "no source edits"; whatever it writes there is discarded | Receives diff + acceptance criteria only, not the build history. Run the project's test command and the negative cases. Report pass/fail with evidence; do not fix. |
| review         | ≥ implementer, other vendor when green | `interactionMode: plan` in a checkout at the candidate SHA                                                                                                                                    | Structured findings `{file, line, severity, claim, evidence}`; max 10; no style nits unless asked.                                                                  |
| general        | inherit                                | inherit                                                                                                                                                                                       | Today's behaviour.                                                                                                                                                  |

"The project's test command" is the one recorded for the project (T3 project scripts; for the fork itself `vp run check:changed` plus `vp test run` on touched files); never an ad hoc repo-wide run.

Each brief ends with the budget etiquette line: "Your budget is $X API-equivalent / N minutes. If you cannot finish within it, stop and report what remains." Task budgets at the API level (`task_budget`) are not available inside Claude Code, so this stays a prompt plus the server-side admission guard.

## Pipeline templates

A pipeline is data: ordered steps, each with role, tier request, workspace strategy, inputs from previous steps, and a gate. The runner is the **parent agent itself**, following a template injected as its first message; the server does not grow a workflow engine. This keeps the engine inside what T3's `delegate_task`/`t3_thread_wait`/`task_status` already do and keeps every step visible as a child thread in Lineage and the team view.

`feature` (default for a ticket):

```
1 plan       role=design   tier=frontier  mode=plan     ws=root (read-only)
             gate: user approves plan + owned-file list            [checkpoint 1]
2 implement  role=implementation tier=standard  ws=worktree(baseRef=<project integration branch>) → records baseSha, candidateSha, worktreePath
             brief: spec + owned files + baseSha; feature + tests in one agent
3 verify     role=test     tier=standard  ws=new worktree at candidateSha; runs the project's test command
             gate: passes; else back to 2 with findings (new candidateSha), ≤ maxAttemptsPerStep
4 review     role=review   tier≥implementer, prefer other vendor; plan mode in a checkout at candidateSha
             gate: user triages findings; writer fixes; re-verify     [checkpoint 2]
5 merge      merge queue validates the reviewed candidateSha against the current target: rebase → project test command → git merge-tree → merge/PR
```

Every step writes `baseSha`, `candidateSha` and `worktreePath` into the pipeline record and passes them in the next brief; a verifier or reviewer never attaches to the writer's live worktree.

`bugfix`: 1 reproduce (standard, implementation role, own worktree: write a failing test) → 2 fix (standard, same worktree) → 3 verify → 4 review-light (standard) → 5 merge.

`research`: N read-only researchers (cheap) in parallel → 1 synthesis (standard) → no writes.

`sweep` (lint/test-flake/doc updates): shard by file list → N cheap implementers in separate worktrees → verify each → merge queue; `retryUp: true` re-runs failures at standard. Runs best during "night shift" when windows reset (see 08).

`design` (what should we build next; no code writes): 1 three cheap read-only researchers in parallel, one each over the codebase and recent upstream changes, the backlog plus `decisions.md` plus the last phase's handoffs, and the ledger or shadow report for what is actually costing time or windows → 2 one frontier synthesis in plan mode that writes `docs/overlay/proposals/<date>-<slug>.md`: ranked ideas, each with the day-to-day change, evidence, cost in steps and upstream files, dependencies, and a ready-to-paste `/pipeline feature` line → one PR of markdown; the developer reviews in the thread and promotes ideas into `08-idea-backlog.md` or pastes a feature line. The per-phase design round covers one phase; `design` is on demand and covers the whole project.

`best-of-n` (ambiguous UI/algorithm): `create_threads` ×N with identical prompt in N worktrees (`t3_thread_launch workspaceStrategy=worktree`), mixed providers; judge = review role at frontier tier with the rubric "correctness, then simplicity; ignore style and cost"; loser worktrees are cleaned up by T3's worktree cleanup. Cursor 2.2 and Superset "race agents" shipped this shape.

The command is `/pipeline <template> <request>`. Everything after the template name is the request and goes into the first step's brief verbatim; a bare `#123` in it makes the runner fetch that GitHub issue's title and body as the request. The request needs the user-visible outcome, what "done" means (a behaviour, test or screen), and any constraint the planner cannot infer; a title alone works but usually costs one rejected plan at checkpoint 1. `design` takes an optional focus (`/pipeline design cost`, `/pipeline design the team view`) and defaults to the whole project; `sweep` takes the file list or glob; `best-of-n` takes `n=<count>` before the request. A template name that does not exist is an error, not a prompt.

Templates are invoked from the composer (`/pipeline feature`), the command palette, a GitHub webhook (label `agent:ready` → scheduled-task webhook → `t3_thread_launch` with the template), or by an agent through a new `pipeline_start` MCP tool that just expands the template into the prompt.

## Injected instruction changes (hook 4)

Add one section (≤4,000 bytes, Codex truncates larger entries) to `T3_CODE_ORCHESTRATION_SECTIONS`:

```
## T3 Code delegation policy

- Ask for a `role` and a `tier` (`cheap`|`standard`|`frontier`) in `delegate_task`; omit `target.model` unless the user named one. T3 picks the provider, model and effort from usage pressure and budgets and tells you why in the result's `routing.reasons`. Relay a stepped-down choice to the user in one line.
- Delegate only when the work is independent, owned by a distinct file set, has its own check, and is more than a couple of minutes. Feature and its tests stay in one delegate. Read-only fan-out (research, verify, review) before any write fan-out. One writer per file set, each in its own worktree.
- Verifiers and reviewers get the diff and the acceptance criteria, not your history. Three fix loops at most; then report.
- `orchestrator_capabilities` now reports each provider's usage `band`. When the band is `red`, keep research, verify and summarise children `cheap`; implementation and review children keep their tier and go through `delegate_task`; avoid Workflow, agent teams and `ultracode`. When `exhausted`, use another provider or stop and tell the user; there is no overage.
- A `budget_exceeded` result means the root budget is spent: finish with what exists and ask the user before more delegates.
```

The three existing sections stay as they are.

## Witness (stall detection)

`apps/server/src/routing/Witness.ts`: for every running delegated child, track last tool call, last file change (from checkpoint capture) and last assistant text. If none for `stallMinutes` (default 10; 30 for plan mode), mark the child `stalled`, notify the parent through the existing delegated-question path ("child X made no progress for 10 min; `task_cancel` or `t3_thread_send` a nudge"), and show an amber badge in the team view. After `stallMinutes × 2`, with `onStall: "cancel"`, cancel it. Claude Code's workflows do the same with 5 stall restarts; Gas Town calls it the Witness.

## Merge queue

Worktrees already exist per launched thread. What's missing is a **serialised landing lane**:

1. Candidate = child worktree whose verify step passed.
2. Lane runs one at a time per project: `git fetch`, rebase onto target, run the project's test command (from project scripts), `git merge-tree --write-tree` against target to detect conflicts without touching the index, then fast-forward merge or open/update the PR (T3's source-control packages already create PRs and link them to threads).
3. Conflict or failure → bounce back to the writer thread with the rebase output (`t3_thread_send`), never let an unattended agent resolve a conflict against another agent's branch.
4. Batching with bisection (Gas Town's Refinery) is a later step; one-at-a-time is enough for ≤5 writers.

Implementation: `apps/server/src/routing/MergeQueue.ts` as a reactor on `subagent_result` events plus a project-level queue; UI column in the team view; MCP tool `merge_queue_enqueue` for agents.

## Task board

Decision (2026-10-29): GitHub issues are the control plane. Do not build storage. Use the issue tracker (OpenAI's Symphony spec): a label `agent:ready` means claimable. A claim is **shared and atomic enough for one developer**: the runner reads the issue, proceeds only if it has no assignee, assigns itself, and adds the label `agent:claimed` with the root thread link and an expiry (24h, refreshed by the witness while the pipeline runs). Two runners racing within the same second is possible and acceptable at this scale; the loser sees the assignee on its next read and backs off. Release on merge or expiry. Webhook deliveries are deduplicated by delivery id (T3's `webhookDedupe.ts`). No lock files in worktrees: a file inside one checkout is invisible to another and proves nothing. A local-only mode can use `.t3/tasks/*.md` files, which Beads and Gas Town prove is enough.

## Native subagents vs T3 delegates

Keep the upstream rule: a child on the same provider/model with no special settings that finishes in-turn uses the provider's native tool; everything else is `delegate_task`. The engine adds: when the band is amber or worse, native subagents inherit the session-start env defaults (cheap tier), and the instructions tell the agent to prefer `delegate_task` for anything that should be visible in the team view (verify, review, implementation).

## Human checkpoints

Two by default (plan approval, review triage), both delivered as T3 pending requests so they land in the approvals inbox, in notifications, and on mobile. A project setting can drop checkpoint 1 for `bugfix` and `sweep`.
