# 03 · Cost ledger and usage pressure

Everything downstream (router, budgets, team view) needs two signals that T3 does not have yet: **what did this thread cost** and **how close is each provider to a wall**.

## A. Cost ledger

### What exists

- `OrchestrationV2ProviderTurn.tokenUsage` and `turnTokenUsage` arrive on `provider-turn.updated`; the ingestor reads `turnTokenUsage` (`usageStatus`, `usageScope: "main_agent"`, `hasSubagents`).
- `OrchestrationV2ProviderThread.contextUsage` arrives on `provider-thread.updated`; only ACP fills its optional `cost`.
- `ProviderEventIngestor.ts` persists provider-turn updates, then forwards terminal usage to analytics (`ProviderTurnAnalytics.record`, event `provider.turn.completed`) with an in-memory completion dedupe. The analytics callback is not a replay source.
- Rates: `UsageService` fetches LiteLLM's `model_prices_and_context_window.json` (24h TTL, cached at `<stateDir>/usage-model-rates.json`), `usagePricing.ts` parses it, `ServerSettings.usagePriceOverrides` and `usageModelAliases` override it.
- Historical usage buckets are keyed by day/hour/provider/model/source path, **not** by thread or run.

### Spec

`apps/server/src/routing/CostLedger.ts`, an Effect service subscribed to the orchestration event stream (same pattern as `PullRequestSyncReactor` and `UsageLimitRecoveryWorker`). The numbered rules below are proposed ledger invariants. Phase 0b’s token-semantics and replay-durability spikes must establish the actual stored event fields, durable identity and provider coverage before Phase 1 implements them. Antigravity/Google AI Pro is in live scope; missing ACP token buckets must remain unavailable, never zero spend inferred from context usage.

1. **Durable turn identity.** A row is keyed by `(threadId, runId, providerTurnRef)`, where `providerTurnRef` is the native turn id when the provider's identity capability is `strong` and `(runId, turn ordinal)` otherwise. Providers re-emit cumulative totals per turn, so the upsert _replaces_ the row's token buckets with the latest cumulative values; a duplicate or re-delivered event is harmless.
2. **Disjoint buckets.** T3's token contract (`packages/contracts/src/providerRuntime.ts`) defines input as including cache reads and cache writes, and output as including reasoning. Store `uncachedInput = input - cacheRead - cacheWrite`, `cacheRead`, `cacheWrite`, and `output` (reasoning inside it, never priced twice):
   ```ts
   usd =
     uncachedInput * r.input +
     cacheRead * r.cacheRead +
     cacheWrite * r.cacheWrite +
     output * r.output;
   ```
   Per-provider fixtures with hand-computed expected costs are the test; where a provider's contract differs, the spike records it and an adapter-specific normaliser produces the same buckets.
3. **Price at read time.** Rows store tokens and a `rateVersion` (hash of the LiteLLM table plus overrides when the turn was first seen). USD is computed from the pinned rates on read, so a later price change does not rewrite history; `routing.repriceLedger` recomputes under current rates on request. Unknown model: `priced: false`, `usdEquivalent: null`, tokens still counted (mirrors the Usage page's `costSource`).
4. **Cursor.** The ledger stores the last applied event sequence; row upsert and cursor advance commit in one transaction. Restart resumes from the cursor. `routing.rebuildLedger` resets the cursor and replays the persisted event log; live events arriving during a rebuild queue behind it and apply in order.
5. **Completeness.** `turnTokenUsage.usageStatus` partial or unavailable → `complete: false`; the row is excluded from budget reconciliation until complete. Claude reports native subagent tokens inside the main turn (`hasSubagents`) → `includesNativeSubagents: true`; Codex reports per thread. Never estimate from transcript text.
6. **Rollups** by `rootThreadId` (`OrchestrationV2AppThreadLineage.rootThreadId`) are computed by query, not stored.
7. RPC `routing.getThreadCosts({ threadIds | rootThreadId, environmentId })` → rows plus a rollup `{ usdEquivalent, priced, complete, tokens, byModel[] }`. Bounded to 500 rows per call.
8. **Display currency.** Rates and rows are USD because the LiteLLM table is. Everything a person reads or types is in `overlay.ledger.display.currency` (default `AUD`) converted at `overlay.ledger.display.usdRate`, a fixed rate the developer sets and updates by hand (no FX lookup; decoding default 1.5). That covers cost chips, rollups, the shadow report, budget inputs and alerts, the credit balance band and the `budget_exceeded` sentence; each shows the currency code once (`A$4.20 API-equiv`). Tests and fixtures stay USD. The rollup carries both values so no caller converts twice.

Tests (`CostLedger.test.ts`, drained effect worker, no sleeps): crash mid-turn then restart; duplicate delivery; late correction of a cumulative total; partial then complete usage; rate change then reprice; rebuild equals live.

### Where it shows

- Sidebar thread row: a muted `$0.42` chip after the status pill (web `sidebar/SidebarThreadRow.tsx`, mobile `threadListV2.ts`).
- Lineage rows (`ThreadLineageWorkflowRow.tsx`): cost per child.
- Team view cards: cost so far, budget bar.
- PR link card: "Agent spend on this PR: $3.10 API-equivalent" once a thread links a PR.

### Tests (one layer, lowest that fails)

- `costs.test.ts` in the pure package: pricing arithmetic incl. cache split, unpriced model, alias mapping.
- `CostLedger.test.ts`: cumulative-to-delta handling, restart replay idempotency, rollup by root. Drain the effect worker; no sleeps (repo rule).

## B. Pressure

### What exists

`packages/contracts/src/providerUsageLimits.ts`:

```ts
ServerProviderUsageWindow { id, kind: "session"|"weekly"|"monthly"|"other", label,
                            usedPercent (0–100), resetsAt?, windowDurationMins? }
ServerProviderUsageLimits { checkedAt, windows[], credentialFingerprint?, resetCredits?,
                            externalUsage?, unavailable?: { reason: "unsupported"|"probeFailed" } }
```

Each `ServerProvider.usageLimits` is refreshed every `providerHealthRefreshInterval` (default 5 min), on settings change, and on live pushes (Codex `account/rateLimits/updated`, Claude rate-limit events). CLIProxyAPI hubs add pooled accounts via `UsageLimitSources`. `packages/shared/src/usageLimits.ts` already has `remainingPercent`, `elapsedShare`, `paceOf → "ahead"|"on"|"under"`.

Per-provider facts that shape the signal (verified 2026-10-29):

- Claude Pro/Max: shared 5-hour and weekly windows across all models, plus a separate weekly Fable window and model-family messages ("You've hit your Opus limit"). Switching Opus→Sonnet does **not** help a session-limited account; it only escapes a family cap. Usage credits (overage) bill at API rates up to a monthly cap you set. While on credits, Claude Code drops the main-conversation cache TTL from 1h to 5m.
- Codex: Plus has 5-hour + weekly; Pro has weekly only. Fast mode burns 2.5×, Ultrafast 8×. Codex's own protocol exposes `RateLimitSnapshot { primary, secondary, credits, individual_limit, spend_control_reached }`; T3's `CodexRateLimitSnapshot` keeps only `primary`, `secondary` and `credits`, and falls back to position only when `windowDurationMins` is absent. Match windows by duration (300 vs 10080 min) wherever it is present.
- Cursor: one weekly pool for Cursor-owned models; third-party models bill from prepaid credit from the first request. Pricing page restructured very recently; re-verify before encoding tiers.
- Antigravity: 5-hour refresh on Pro/Ultra, weekly otherwise; usage tracks agent work, not prompt count.
- Usage endpoints 429 aggressively. Claude Code itself shows last-known bars for up to 60 min.

### Spec

`packages/routing/pressure.ts` (pure) + `apps/server/src/routing/Pressure.ts` (adapter, hysteresis state).

```ts
type WindowRead = {
  id;
  kind;
  usedPercent;
  resetsAt?: number;
  durationMins?: number;
  family?: string;
};
type ProviderPressure = {
  band: "green" | "amber" | "red" | "exhausted" | "unknown";
  limiting: WindowRead | null; // the window that set the band
  remainingPercent: number | null;
  minutesToReset: number | null;
  pace: "ahead" | "on" | "under" | null;
  projectedExhaustAt: number | null; // from burn rate
  familyBands?: Record<string, Band>; // e.g. { opus: "red", sonnet: "green" }
  staleMinutes: number; // since checkedAt
};

export function pressureOf(input: {
  windows: WindowRead[];
  checkedAt: number;
  now: number;
  lastErrorClass: string | null;
  lastErrorAt: number | null; // e.g. "usage_limit" from T3's thread error state
  prev?: ProviderPressure; // for hysteresis
}): ProviderPressure;
```

Rules:

0. **Precedence.** A known `usage_limit` error whose reset time has not passed makes the provider `exhausted` regardless of how stale the usage read is. Otherwise a stale or unavailable read makes it `unknown`. Only then is a band computed from the windows.
1. **Most constrained account-wide window wins.** Account-wide means `five_hour`, `seven_day`, Codex primary and secondary, OpenCode `go_*`; family windows never set the provider band. For each window compute `remaining = 100 - used` and, when `resetsAt` and duration are known, `elapsedShare` and `pace`. Burn rate = used / elapsed; `projectedExhaustAt = now + (remaining / burnRate) * duration`.
2. **Bands:**
   - `exhausted`: remaining ≤ 0, or provider last error class `usage_limit` (T3 already tracks `lastErrorClass`).
   - `red`: remaining < 20, **or** `projectedExhaustAt` is before `resetsAt` and remaining < 40.
   - `amber`: remaining < 50, or pace `ahead`.
   - `green`: otherwise.
   - `unknown`: `unavailable`, or `staleMinutes > 60`. Unknown is treated as green for routing but shown as grey, and it never overrides a known exhaustion (rule 0); never block on a usage read (T3 rule: usage calls fail open).
3. **Family windows** (Claude `seven_day_opus` etc.) set `familyBands` and apply only to models in that family. The router treats a red family band as "this family is red, the provider isn't".
4. **Hysteresis.** A band only moves up (worse) immediately. It moves down (better) only after two consecutive refreshes below the threshold minus 5 points, or on a reset timestamp passing. Prevents flapping around 50%.
5. **Pooled accounts.** When several accounts of one driver are visible (multi-env, hubs), pressure is computed per account; the provider's band is the **best** account's band and the router's alternative list names that account's instance, since T3 can target a specific `providerInstanceId`.

### Where it shows

- Push on the existing `serverConfig` stream (next to `usageLimitSources`) as `pressure: Record<instanceId, ProviderPressure>`.
- Composer model picker: coloured dot per provider, tooltip "weekly 71% used, on pace, resets Thu 09:00".
- Team view usage rail: one gauge per provider with band colour and projected exhaustion.
- `orchestrator_capabilities` response (hook 3): the agent sees the same bands so it can explain its own choices to the user.

### Tests

Pure table-driven cases in `pressure.test.ts`: window at 85% with 1h left → red; 45% and `under` pace → green; stale 90 min → unknown; family red/provider green; hysteresis down-transition needs two reads; exhausted from `usage_limit` error.
