# 06 · Cockpit UI: team view and friends

T3's sidebar answers "which thread needs me". The team view answers "what is my fleet doing, what is it costing, and where is the wall". It is a new route over existing projections plus the ledger, pressure and decision data from 02–04.

## Surfaces

| Surface          | Route / place                                                                                      | Purpose                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Team view        | `/team` (`apps/web/src/routes/_chat.team.tsx`), palette "Open team view", keybinding `mod+shift+t` | Fleet grid grouped by root ticket; mouse-first GUI                                                                                                |
| Agent drawer     | right pane of team view, opens on card click                                                       | Selected agent: live timeline tail, diff stat, cost, why, inline request controls, action buttons, and the thread's own composer (T3's component) |
| Command dock     | bottom of team view, always visible                                                                | Prompt panel: target chip (new pipeline, new thread, selected agent), tier/model picker, composer with attachments, Send / Steer / Queue          |
| Usage rail       | left/top strip of team view; also a compact strip in the composer                                  | Pressure gauges per provider, projected exhaustion, reserve line                                                                                  |
| Approvals inbox  | panel in team view + palette "Pending requests"                                                    | Every pending approval / question / plan across threads and environments, respondable in place                                                    |
| Why this model   | popover on subagent rows, lineage rows, cards, child thread's first item                           | Decision reasons, alternatives, override actions                                                                                                  |
| Merge queue      | column in team view                                                                                | Candidates, lane state, bounced items                                                                                                             |
| Routing settings | `Settings → Routing`                                                                               | Matrix grid, tiers, arbitrage, mode, shadow report                                                                                                |
| Budgets settings | `Settings → Budgets` (project-scoped)                                                              | Caps, reserve, overage, alerts                                                                                                                    |
| Mobile           | `features/team/TeamScreen.tsx`                                                                     | Cards list reusing `ThreadAgentsSheet` rows; usage widget already exists                                                                          |

## Team view layout

```
┌ Usage rail ───────────────────────────────────────────────────────────────┐
│ Claude  ███████░░ 71% wk · on pace · resets Fri 09:00   [amber]           │
│ Codex   ███░░░░░░ 30% wk · under                         [green]          │
│ Cursor  ██░░░░░░░ 20% · credit $14 left                  [green]          │
└───────────────────────────────────────────────────────────────────────────┘
┌ Filters: env ▾ project ▾ status ▾ role ▾ provider ▾ band ▾   ⌕ search     ┐
├ Ticket #142 Add SSO login     $3.10 / $5.00  ▓▓▓▓▓▓░░░  PR #88 · worktree ┤
│  ┌ plan · design · Opus 5.5 · done 4m · $0.60 ─────────────────────────┐  │
│  ┌ implement · Sonnet 5.5 (standard) · running 12m · $1.90 · ⚠ stalled 9m┐│
│  │  why: role implementation → standard; Claude amber → effort medium   │  │
│  ┌ verify · Haiku 5.5 (cheap, red→cheap) · queued ───────────────────────┐│
│  ┌ review · GPT-6.1 Sol · waiting on implement ─────────────────────────┐ │
├ Ticket #140 Fix flaky upload test   $0.80 / $5.00  ░░  merge queue: #2    ┤
│  …                                                                         │
├ Automations (night shift)  next 02:00 · reserve ok                         ┤
└ Approvals (3)  · plan #142 awaiting you · command approval #139 · question ┘
```

## Agent card

Fields, all from existing projections unless marked new:

- Title, role badge, provider icon, model, tier chip (new, from decision), band dot (new).
- Status pill (`resolveThreadStatusPill`), elapsed, progress text (`RuntimeSubagent.progress`).
- Cost so far (new, ledger) and per-child budget bar (new).
- Worktree/branch, linked PR (existing shell data).
- Pending request indicator (existing pending-request state) with inline respond.
- Stall badge (new, witness).
- Actions: open thread, steer (`t3_thread_send` steer), cancel (`task_cancel`), re-run on frontier (new), pin provider (new).

Grouping: by `rootThreadId` (lineage) within environment; roots sort by "needs me" first (pending requests, stalled, over budget), then by last activity, matching the sidebar's inbox logic (`threadInbox.ts`).

## Data wiring

- Thread shells, subagents, pending requests: existing `packages/client-runtime` selectors (`threadShell.ts`, `state/subagentRuntime.ts`, `state/threadRelationships.ts`, pending-request state).
- Costs: new RPC `routing.getThreadCosts` for the visible roots, polled every 5 s while the view is mounted, cached in a small client store (`teamCostStore.ts`), never streamed.
- Pressure: from the `serverConfig` stream (03).
- Decisions: `routing.getDecisions({ threadIds })` on popover open, not preloaded.
- Approvals inbox: aggregate of per-environment pending requests already present in client-runtime; the inbox is a selector plus a list.

## Behaviour rules

- Mouse first: every action is a visible button, chip or drag target. Shortcuts (`j/k`, `enter`, `r`, `/`, `mod+shift+t`) are accelerators in tooltips and the palette, registered through `apps/server/src/keybindings.ts` (keybinding commands), never the only path.
- Zero layout shift while cards update; cost text uses tabular numbers; status changes animate opacity only (T3's GPU-spike rule).
- Show list prices as "API-equivalent" everywhere, with one tooltip explaining it is not the bill.
- Degraded routing is never silent: a stepped-down card shows a small down-arrow chip; hovering gives the reason.
- Works for remote environments and hubs the same way (all data is per-environment already).

## Charts

Two, built with the house chart components once they exist in the usage page (reuse `usage/` components' palette):

1. Cost per ticket by model, stacked bar, last 7 days.
2. Pressure over time per provider with projected exhaustion dotted, so you can see the wall coming.

## Component map (new files)

```
apps/web/src/components/team/
  TeamView.tsx            grid + filters + grouping
  TeamView.logic.ts       pure: grouping, sorting, filter predicates (unit-tested)
  AgentCard.tsx
  AgentDrawer.tsx         selected agent; embeds the existing thread composer
  CommandDock.tsx         prompt panel; target chip, tier/model picker, composer
  UsageRail.tsx           reuses UsageLimits pace maths
  ApprovalsInbox.tsx
  WhyThisModel.tsx        popover; used by ThreadLineageWorkflowRow and ProviderSubagentBar too
  MergeQueuePanel.tsx
  teamCostStore.ts
apps/web/src/components/settings/RoutingSettings.tsx, BudgetsSettings.tsx
apps/web/src/routes/_chat.team.tsx, _chat.settings.routing.tsx, _chat.settings.budgets.tsx
apps/mobile/src/features/team/TeamScreen.tsx
```

Entries also go in `CommandPalette.tsx`, `SettingsSidebarNav.tsx`, `settingsSearch.ts`, and `apps/server/src/keybindings.ts` (keybinding commands) (AGENTS.md "hit every surface" list).

## Tests

- `TeamView.logic.test.ts`: grouping by root, "needs me" ordering, filters.
- One browser test for the inbox respond flow (`*.browser.test.tsx` with `await using screen = await render(...)`).
- No tests for static card markup (repo rule).
