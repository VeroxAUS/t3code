# 02 · Architecture

## Layers

```
┌──────────────────────────────────────────────────────────────────────┐
│ Cockpit UI (web/desktop/mobile)                                      │
│  Team view · Lineage · Usage gauges · Budgets · Approvals inbox      │
│  "Why this model" · Merge queue · Routing settings                   │
├──────────────────────────────────────────────────────────────────────┤
│ Delegation engine (server)                                           │
│  Roles & briefs · Pipeline templates · Fan-out caps · Stall witness  │
│  Verification/review loops · Merge queue · Best-of-N judge           │
├──────────────────────────────────────────────────────────────────────┤
│ Router (pure package + server service)                               │
│  tier(role, complexity) × pressure(provider) → provider/model/effort │
│  Degrade ladder · Budgets · Decision log · Shadow mode               │
├──────────────────────────────────────────────────────────────────────┤
│ Telemetry (server)                                                   │
│  Cost ledger per run/thread/root · Pressure from usage windows       │
│  Rate table (LiteLLM + overrides) · Outcome signals (tests, review)  │
├──────────────────────────────────────────────────────────────────────┤
│ T3 Code V2 orchestration (upstream, untouched where possible)        │
│  Orchestrator · ThreadManagementService · ThreadLaunchService        │
│  Provider adapters · Capability flags · Lineage · Handoff · Limits   │
└──────────────────────────────────────────────────────────────────────┘
```

## Hook points in upstream (the hook patches; the manifest in `CHANGES.md` is the full inventory)

Checked against the Phase 0b design checkout on 2026-10-30: all eight files/symbols exist; only hook 8 is already implemented. Other rows describe planned changes, not existing overlay markers. Paths relative to the fork root. Rows name files and symbols, not line numbers, which move; the `// overlay:` markers listed in `docs/overlay/CHANGES.md` are the source of truth, reconciled by `scripts/overlay-check.ts` on every PR.

| #   | File                                                                                                                                    | Today                                                                                                                     | Overlay change                                                                                                                                                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `apps/server/src/mcp/OrchestratorMcpService.ts` → `resolveTarget`                                                                       | Resolves provider instance, model, options for `delegate_task` and `create_threads`; validates; no rewrite                | Insert one imported call: `target = yield* applyTargetPolicy({ kind: "delegate", parent, requested: input.target, role, tier, providers })` before validation. The function lives in the overlay, so the patch is one line. In shadow mode it only logs.            |
| 2   | `apps/server/src/orchestration-v2/ThreadLaunchService.ts` → `launch`                                                                    | Shared launch path for `t3_thread_launch`, composer "new thread", scheduled tasks                                         | Same `applyTargetPolicy({ kind: "launch", ... })` call. Covers the paths `resolveTarget` misses.                                                                                                                                                                    |
| 3   | `apps/server/src/mcp/OrchestratorMcpService.ts` → `capabilities`                                                                        | Returns providers, models, modes; no usage                                                                                | Append `usage: { band, windows, resetsAt }` per provider and `routing: { defaultTiers, pressure }` so an agent can self-route and explain.                                                                                                                          |
| 4   | `packages/provider-core/src/server/orchestrationInstructions.ts`                                                                        | Three sections of delegation rules injected into every provider session                                                   | Add one ≤4,000-byte section: ask by `role` + `tier`, decomposition rules, budget etiquette (text in `05-delegation-engine.md`).                                                                                                                                     |
| 5   | `apps/server/src/orchestration-v2/ProviderEventIngestor.ts` (`analytics.record(...)`; the property builder is near the top of the file) | Persists provider-turn updates; terminal usage reaches analytics after the write, with in-memory deduplication            | Phase 0b step 2 proves replay from persisted events; Phase 1 adds a ledger projection with transactional cursor. Do not use the terminal-only analytics callback as the durable source.                                                                             |
| 6   | `apps/server/src/orchestration-v2/ThreadManagementService.ts` → `assertDispatchTargetEnabled`                                           | Refuses disabled provider for `message.dispatch` and `delegated_task.request`                                             | Sibling check `assertWithinBudget` → new failure code `budget_exceeded`.                                                                                                                                                                                            |
| 7   | `packages/contracts/src/orchestratorMcp.ts`                                                                                             | `OrchestratorMcpDelegateTaskInput.role` (type `OrchestratorMcpTaskRole`), `target`; `OrchestratorMcpFailure` has 16 codes | Add optional `tier`, `budgetUsd`, `maxChildren`; add `routing` to capabilities result; add `budget_exceeded` to `OrchestratorMcpFailure` codes.                                                                                                                     |
| 8   | `packages/contracts/src/settings.ts`                                                                                                    | `ServerSettings`, `ServerSettingsPatch`, project-scoped keys                                                              | Add one namespaced key `overlay: { routing, budgets, limits, cockpit, telemetry }` (schemas in `04-router.md`); add `overlay` to `PROJECT_SCOPED_SERVER_SETTING_KEYS` (done in Phase 0 step 4; a project override accepts only `routing`, `budgets` and `cockpit`). |

Native subagents spawned inside Claude Code or Codex bypass `delegate_task`. Two adapter-level knobs cover them, both set at session start so they never break a warm cache:

| Adapter                                                        | Knob                                                                                                                       | How T3 passes it                                              |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts` | `CLAUDE_CODE_SUBAGENT_MODEL=haiku` as a default only (never `_FORCE`), only while the band is red                          | env on the SDK query; T3 already merges instance env          |
| `apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts`  | `-c agents.default_subagent_model=gpt-6-luna -c agents.default_subagent_reasoning_effort=low`, default only, red band only | same `-c` override mechanism T3 uses to inject the MCP server |

That is hook #9 and #10 if you count them; both are additive lines in the adapters' launch-option builders.

## New code

```
packages/routing/                 pure TS, no T3 imports, 100% unit-tested
  src/pressure.ts                 windows → band, burn rate, time-to-reset
  src/policy.ts                   tier matrix, degrade ladder, hysteresis
  src/decide.ts                   decide(input) → Decision { target, effort, reasons[], alternatives[] }
  src/budget.ts                   budget arithmetic, thresholds, forecasts
  src/pipelines.ts                pipeline templates (data) and role briefs
  src/costs.ts                    tokens × rates → usd, cache-aware

apps/server/src/routing/
  RoutingService.ts               Effect service; loads settings + providers + pressure; calls decide(); writes decision log
  CostLedger.ts                   projection: provider-turn.updated → cost rows; SQLite table thread_costs
  Pressure.ts                     adapter from ServerProvider.usageLimits to packages/routing inputs; hysteresis state
  BudgetGuard.ts                  assertWithinBudget; alerts at 75/90/100
  DecisionLog.ts                  table routing_decisions (threadId, runId, requested, applied, reasons, mode)
  Witness.ts                      stall detection for delegated children

apps/web/src/components/team/     TeamView, AgentCard, UsageRail, ApprovalsInbox, WhyThisModel, MergeQueuePanel
apps/web/src/components/settings/RoutingSettings.tsx, BudgetsSettings.tsx
apps/web/src/routes/_chat.team.tsx, _chat.settings.routing.tsx, _chat.settings.budgets.tsx
apps/mobile/src/features/team/    TeamScreen reusing ThreadAgentsSheet rows

evals/routing/                    replayed delegations; grader = expected tier/provider band
```

## Data model additions

```ts
// contracts
type RoutingTier = "cheap" | "standard" | "frontier" | "apex"; // apex is opt-in only; policy never chooses it
type PressureBand = "green" | "amber" | "red" | "exhausted" | "unknown";

// OrchestratorMcpTaskRole = implementation | research | review | design | test | general (exists upstream)
type RoutingDecision = {
  id: string;
  threadId: ThreadId; // the thread being created/launched
  parentThreadId: ThreadId | null;
  kind: "delegate" | "launch" | "scheduled" | "native_subagent_env";
  role: OrchestratorMcpTaskRole | null;
  requestedTier: RoutingTier | null;
  requested: { instanceId?: string; model?: string; effort?: string } | null;
  applied: { instanceId: string; model: string; effort?: string };
  band: Record<ProviderInstanceId, PressureBand>;
  reasons: string[]; // human sentences, shown in UI
  alternatives: Array<{ instanceId: string; model: string; why: string }>;
  mode: "shadow" | "enforce";
  createdAt: string;
};

type ThreadCost = {
  threadId: ThreadId;
  rootThreadId: ThreadId;
  runId: RunId | null;
  provider: string;
  model: string;
  input: number;
  cachedInput: number;
  cacheWrite: number;
  output: number;
  reasoning: number;
  usdEquivalent: number | null; // null when unpriced; list price, never the subscription bill
  priced: boolean;
  complete: boolean;
  includesNativeSubagents: boolean;
  rateVersion: string;
  windowShare?: number; // advisory estimate only; the account window includes other sessions
  updatedAt: string;
};

type Budget = {
  scope: { kind: "thread" | "root" | "project" | "environment" };
  usdEquivalent?: number; // admission cap on landed + reserved, API-equivalent
  reservedPerChildUsd?: number; // reserved at dispatch, replaced by landed cost when the ledger row completes
  maxConcurrentChildren?: number;
  maxChildrenLifetime?: number;
  maxAttemptsPerStep?: number;
  maxDepth?: number;
  maxElapsedMinutesPerChild?: number;
  windowReserve?: { weeklyPercent: number; sessionPercent: number }; // advisory; gates automations by band
  onExceed: "warn" | "block_new_children" | "stop";
};
```

## Flow of one delegated task after the overlay

```
agent calls delegate_task { task, role:"research", tier:"cheap" }
  → OrchestratorMcpService.delegateTask
  → resolveTarget
      → RoutingService.decide                      (hook 1)
          reads: settings.routing, providers[].usageLimits → Pressure.bands,
                 ledger.spendSoFar(root), budgets, parent model/options
          returns: applied target + effort + reasons; logs RoutingDecision
      → validation continues on the applied target
  → BudgetGuard.assertWithinBudget(root)           (hook 6)
  → ThreadManagementService.dispatch(delegated_task.request)
  → Orchestrator creates child thread + run       (upstream, unchanged)
  → child adapter session starts with native-subagent env from decision (hook 9/10)
  → persisted provider-turn updates → CostLedger  (hook 5; replay source proven in Phase 0b)
  → team view shows card: role, tier, model, band, cost, budget bar, "why"
  → Witness watches progress; BudgetGuard raises alerts at thresholds
  → task completes → subagent_result transfer      (upstream, unchanged)
  → outcome signals (tests passed? review findings?) attached to decision for later tuning
```

## Performance rules we inherit

T3's AGENTS.md is explicit about websocket payload and render cost. So:

- The ledger and decision log are **server-side projections** read through two new RPCs (`routing.getThreadCosts`, `routing.getDecisions`) with bounded pages. No new streaming firehose; the team view subscribes to the existing thread projection and polls cost every few seconds only while open.
- Pressure bands change on provider refresh (5 min) or a live rate-limit push and are pushed on the existing `serverConfig` stream next to `usageLimitSources`.
- Team view renders from `threadShell` + `subagentRuntime` selectors that already exist in `packages/client-runtime`; it adds a cost map, not a new store.
