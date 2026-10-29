# 04 · Router: usage- and cost-aware model selection

## Goal

Given a task's role and requested tier, the parent's model, every provider's pressure band, the root ticket's spend so far, and the budgets in force, pick `providerInstanceId + model + effort` for a **new** thread, and emit the native-subagent defaults for that session. Explain the choice in plain sentences. Never surprise the user silently.

## Why route at thread boundaries only

- Caches are per model (and on older models per effort). Switching an existing thread recomputes the whole prompt at uncached price and, with extended thinking on, can invalidate thinking blocks. Claude Code docs: subagents never share the parent cache; forks do.
- Every `delegate_task`, `create_threads`, `t3_thread_launch`, and scheduled launch starts a fresh provider thread anyway. Routing there costs nothing extra.
- An existing thread changes model only (a) at a compaction boundary, (b) when its provider is `exhausted` and the user accepts the pending "continue on <provider> with a handoff" request, or (c) on explicit user action. Case (b) uses T3's provider-switch context handoff (delta summary, 16k token cap); there is no automatic path.

## Inputs (signals)

| Signal               | Source                                                                                               | Notes                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `role`               | `delegate_task.role` (`implementation`/`research`/`review`/`design`/`test`/`general`), pipeline step | Drives the default tier                                                                                                           |
| `tier` request       | new `delegate_task.tier` (`cheap`/`standard`/`frontier`), pipeline step, user override               | A request, not a command; policy may step it down under pressure, never up, except the review floor (reviewer tier ≥ implementer) |
| `interactionMode`    | parent/child (`plan`/`default`)                                                                      | `plan` → frontier-leaning (Claude Code's `opusplan` idea)                                                                         |
| Parent model/options | `parent.thread.modelSelection`                                                                       | Review tier must be ≥ implementer tier                                                                                            |
| Pressure bands       | `Pressure` service (03)                                                                              | Per provider, per family                                                                                                          |
| Spend so far         | `CostLedger` rollup by root                                                                          | Budgets                                                                                                                           |
| Budgets              | settings (`budgets`), per project/root/thread                                                        | Soft and hard caps                                                                                                                |
| Provider health      | `providerConstraints`, recent 429/5xx                                                                | Cooldown like LiteLLM: skip a provider for 5 min after repeated failures                                                          |
| Model catalog        | `orchestrator_capabilities` providers/models, model manifest profiles (effort descriptors)           | Validates applied target; effort option ids differ per provider                                                                   |
| Complexity hint      | optional, from parent agent (`complexity: "trivial"                                                  | "normal"                                                                                                                          | "hard"`) | Phase 2+: cheap classifier; literature says complexity prediction is the weak link, so keep it advisory |
| Time                 | now, `resetsAt`                                                                                      | Defer non-urgent work to resets (automations only)                                                                                |

## Tiers and the role matrix

Tiers are abstract; the mapping to concrete models is config, read from the catalog at runtime. Defaults (verified pricing per MTok input/output, 2026-10-29; the router reads live rates, these are for intuition):

| Tier               | Claude                  | Codex                                 | Gemini/Antigravity      | Typical price     |
| ------------------ | ----------------------- | ------------------------------------- | ----------------------- | ----------------- |
| cheap              | Haiku 5.5 ($0.10/$0.50) | GPT-6 Luna ($0.10/$0.50)              | 3.8 Flash ($0.75/$3.75) | ~1/40 of frontier |
| standard           | Sonnet 5.5 ($2/$10)     | GPT-6.1 Sol ($2/$10) or Terra ($1/$5) | 3.1 Pro ($2/$12)        | ~1/4              |
| frontier           | Opus 5.5 ($4/$20)       | GPT-6 Astra ($10/$50)                 | —                       | 1                 |
| apex (opt-in only) | Fable 5.1 ($10/$50)     | —                                     | —                       | 2.5               |

Evidence for the tiering (SWE-bench Pro, secondary sources; Terminal-Bench from Anthropic): Opus 5.5 ≈ 90%, Sonnet 5.5 ≈ 81%, Haiku 5.5 ≈ 65%. Anthropic: Haiku 5.5 for "summaries, compaction, classification, DB queries, subagent work"; Sonnet/Opus 5.5 "remain the better choices for complex agentic coding". Codex docs run explore/docs/mapping/small-fix agents on `gpt-6-luna` and reviewers on `gpt-6.1-sol`. Cost per completed task beats cost per token: Sonnet 5 used ~40% more output tokens per task than Sonnet 4.6 and could cost more than Opus 4.8; Haiku at `low` skips checks. So **implementation never defaults below standard**.

Default matrix (`overlay.routing.matrix`), band = the chosen provider's band after arbitrage:

| Role                           | green                                                             | amber                    | red                                        | exhausted                        |
| ------------------------------ | ----------------------------------------------------------------- | ------------------------ | ------------------------------------------ | -------------------------------- |
| research / explore / summarise | cheap, effort low                                                 | cheap, low               | cheap, low                                 | other provider cheap, else queue |
| design / plan (plan mode)      | frontier, high                                                    | frontier, medium         | standard, high                             | other provider standard          |
| implementation                 | standard, medium                                                  | standard, medium         | standard, low _or_ other provider standard | other provider, else queue       |
| test / verify                  | standard, medium                                                  | standard, low            | cheap, medium (tests are checkable)        | other provider                   |
| review                         | ≥ implementer tier, high; prefer other vendor if its band ≤ amber | same tier as implementer | same tier, medium                          | other provider ≥ implementer     |
| general                        | inherit parent                                                    | inherit                  | step down one tier                         | other provider                   |

Effort ids are provider-specific (`low|medium|high|xhigh|max` on Claude 5.5 models with `medium` default; Codex `minimal|low|medium|high|xhigh`). The router maps abstract `low/medium/high` to the model's option descriptor from the manifest and validates with the existing `invalidOptionSelections`. `xhigh`, `max`, `ultracode`, `ultrathink` are never applied automatically.

## Provider arbitrage

When the matrix picks a provider whose band is red or exhausted and another provider with an equivalent tier is green or amber, prefer the other provider **for new threads**. Constraints:

- Only providers the project enables (`isProviderInstanceEnabledForProject`) and that can run child tasks (`orchestrationCapableInstanceIds`).
- Review role: cross-vendor is a feature, not a cost. Direction matters: the reviewer's tier must be ≥ the implementer's. Evidence: Claude reviewing Codex raised pass rate 71.6→89.7%; Codex reviewing Claude lowered it 91.4→82.8% (arXiv 2607.21656); lightweight cross-model reviewers add nothing (arXiv 2610.01471).
- Never move a thread between vendors mid-task for a writer; worktree, tool semantics and hidden state differ.

## Degrade ladder (what "usage gets up there" triggers)

Each step is cheaper and less disruptive than the next. Apply the first that resolves the pressure.

1. **Lower effort** on new children (and, on Claude 5.5 models, per-message effort on existing threads, which keeps the cache).
2. **Cheaper tier for new research, verify and summarise children**: the matrix column shifts for those roles only. The native subagent _default_ model (`CLAUDE_CODE_SUBAGENT_MODEL`, never the `_FORCE` variant; Codex `agents.default_subagent_model`) is set to the cheap model only while the band is red, and the injected instructions say implementation and review children keep their tier and go through `delegate_task`. Precedence everywhere: user choices and the quality floor, then what the provider can enforce, then pressure.
3. **Send new threads to another provider's green window** (arbitrage).
4. **Switch an existing thread at a boundary**: offered as a pending request ("Claude weekly 92% used; continue this thread on Codex GPT-6.1 Sol with a handoff, or wait until Fri 09:00?"). Never automatic; unanswered, T3's recovery worker snoozes the thread until reset.
5. **Ask.** An exhausted thread never auto-switches; it raises a pending request offering "continue on <other provider> with a handoff" or "wait until <reset>" (user decision 2026-10-29). Unanswered, it falls back to T3's recovery worker (snooze, resume at reset). There is no overage: paid overflow is switched off at the provider accounts, so waiting or another provider are the only options.

Guardrails on the ladder: `ultracode`, Workflow and agent-team runs never pass through `delegate_task`, so `decide` cannot refuse them; the injected instructions tell agents not to start them when the band is red (they run 7–15× tokens), and the native-subagent env defaults make any that start cheap. Fast and Ultrafast speed options on launches are refused by `decide` under amber or worse.

## Escalation (cheap first, then up)

For roles with a checkable outcome (test, verify, mechanical fix sweeps), run at the cheap tier and re-run failures one tier up. Anthropic's measured result on coding: re-running failures at higher effort held the pass rate for a little over half the cost. Implement as a pipeline step option (`retryUp: true`, max 1 escalation), not as router magic.

## Budgets

Budgets are **admission control for new work**, not billing control. They decide whether a new child may start; they cannot stop a provider billing a turn already in flight, and they cannot see native subagents that never pass through `delegate_task`. Window share is an estimate, because the account window includes everything else you ran. There is **no overage path** (decision 2026-10-29): usage credits and Codex credits are switched off at the provider accounts, and nothing in T3 routes to a paid fallback.

Config in `overlay.budgets` (project-scoped via `projectSettingsOverrides`):

```ts
type BudgetsSettings = {
  perRootThreadUsd?: number; // default 5; admission cap on landed + reserved
  perChildUsd?: number; // default 1.5; reserved per launch until usage lands
  maxConcurrentChildrenPerRoot?: number; // default 3
  maxChildrenLifetimePerRoot?: number; // default 12
  maxAttemptsPerStep?: number; // default 2
  maxDepth?: number; // default 2
  maxElapsedMinutesPerChild?: number; // default 60; interrupt after
  windowReserve?: { weeklyPercent: number; sessionPercent: number }; // automations only, by pressure band
  onExceed: "warn" | "block_new_children" | "stop"; // default block_new_children; stop also interrupts running children
  alerts: { thresholds: [75, 90, 100]; push: boolean };
};
```

Mechanism:

- **Reservation at dispatch.** `BudgetGuard.assertWithinBudget(root)` (hook 6) admits a child only if `landed + reserved + perChildUsd <= perRootThreadUsd`, then records a reservation keyed by the child thread in the same transaction, so concurrent launches cannot all pass the same check. When the child's ledger row is `complete`, the reservation is replaced by the landed cost. An unpriced model keeps its reservation permanently and is flagged.
- **Overshoot policy.** `block_new_children` never interrupts a running child; it only refuses new admissions. `stop` interrupts running children through `t3_thread_interrupt` and is opt-in.
- **Native subagents** are outside the guard. The ledger still counts them in the root's landed cost once the main turn lands, which can push the root over the cap and block further admissions. That is the intended backstop, shown on the card as "includes native subagents".
- **Window share is advisory.** `windowReserve` gates automations and background children by the provider's pressure band; it is never a per-root accounting claim.
- **Failure code** `budget_exceeded` carries a sentence the agent relays ("Root budget $5.00 reached: $4.20 landed, $1.50 reserved; ask the user to raise it or finish without more delegates").
- **Alerts** at 75/90/100% of the root cap reuse the notification path (server `NotificationMailbox.ts`, web `ThreadNotificationCoordinator`) and mobile push, labelled "planning cap, API-equivalent".

Budgets are API-equivalent dollars on subscriptions; say so in the UI every time. Claude Code's own `--max-budget-usd` has the same semantics and the same surprise on Max plans.

## Decision log and explainability

Every decision writes a `RoutingDecision` (02) with `reasons[]` like:

- "Role research → cheap tier by policy."
- "Claude weekly window 84% used, projected to exhaust Thu 03:00 before reset Fri 09:00 → red → sent to Codex (green)."
- "Parent is Opus 5.5; review tier kept at frontier."
- "Shadow mode: would have chosen Haiku 5.5, applied requested Opus 5.5."

Shown as a "Why this model" popover on subagent rows, lineage rows, team view cards, and as a line in the child thread's first system item. Override actions: "Re-run on frontier", "Pin this ticket to Claude", "Raise budget". Overrides write `overlay.routing.pins[rootThreadId]` so the next decisions respect it.

## Modes

- `off`: today's behaviour.
- `shadow`: decisions are computed and logged, requested targets applied. Run this until the Phase 3 gate (14 days and 200 decisions) to collect a diff ("router would have moved N tasks to cheap; repriced saving X API-equivalent"). The shadow report reprices the tokens the requested model actually used at the alternative's rates; it is an estimate, not measured cost per completed task, because it cannot see the turns or retries the alternative would have needed. The Phase 3 canary, with real alternative executions, is the measurement.
- `enforce`: decisions applied; requests above the policy's ceiling are stepped down with a reason; requests below are honoured (an agent may always ask for cheaper).

## Settings schema

```ts
type RoutingSettings = {
  enabled: boolean;
  mode: "off" | "shadow" | "enforce";
  tiers: Record<
    RoutingTier,
    Array<{ driverKind: string; model: string; effort?: Record<"low" | "medium" | "high", string> }>
  >;
  matrix: Record<
    DelegateRole,
    Record<PressureBand, { tier: RoutingTier; effort: "low" | "medium" | "high" }>
  >;
  arbitrage: { enabled: boolean; reviewPrefersOtherVendor: boolean };
  nativeSubagentDefaults: { enabled: boolean }; // sets CLAUDE_CODE_SUBAGENT_MODEL / codex agents.*
  pins?: Record<RootThreadId, { driverKind?: string; model?: string }>;
  hysteresis: { downPoints: 5; downReads: 2 };
};
```

UI: `Settings → Routing` with the matrix as an editable grid, a live pressure strip, a "what would change now" preview computed by calling `decide()` on the current open threads, and a shadow-mode report.

## Eval harness (`evals/routing`)

Follows the repo's eval shape (`run.ts`, cases as data, grader tested in CI). Two case types:

1. **Deterministic policy cases** (no model calls): windows + role + request → expected tier/provider/reasons. Hundreds, cheap, run in CI as plain tests.
2. **Replay cases**: real `delegate_task` calls captured in shadow mode (task text, role, parent model, bands) with the human-labelled "right tier". Grader = exact tier match plus "never below the quality floor for implementation". Paid only when a complexity classifier is added.

## Pitfalls to design around

1. Cache loss on switch → route at boundaries (above).
2. Cheaper model, more turns → implementation floor at standard; measure cost per completed task in the shadow report, not tokens.
3. Window-mapping bugs → percent vs fraction, positional primary/secondary, null windows, drifting reset times, 429'd endpoints. Match by duration, cache last good read, fail open to `unknown`.
4. Shared vs family buckets on Claude → stepping Opus→Sonnet does not restore a session-limited account; only arbitrage to another provider or waiting does.
5. Effort knobs differ per provider and per model generation; always resolve through the manifest's option descriptors, never a hardcoded string.
6. Preserved thinking: accounts created after 2026-08-31 get 400s on edited history on 5.5-generation models. Any future "prune then continue on a cheaper model" idea must go through T3's handoff (fresh provider thread), never by editing a transcript.
