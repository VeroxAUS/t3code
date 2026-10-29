# 09 · Risks and open questions

## Risks

| Risk                                                           | Likelihood                   | Impact | Mitigation                                                                                                                                     |
| -------------------------------------------------------------- | ---------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Upstream drift breaks the overlay                              | High (several nightlies/day) | Medium | Touch budget of ~11 files with markers; nightly merge job; flags default off; pure `packages/routing` has no T3 imports                        |
| Usage endpoints change or 429                                  | High                         | Medium | Fail open to `unknown`; keep last good read 60 min; match windows by duration; T3 already handles most of this                                 |
| Cheaper model costs more per completed task                    | Medium                       | High   | Implementation floor at standard; shadow report measures cost per completed task; escalation on failure                                        |
| Cache loss or preserved-thinking 400s from a mid-thread switch | Medium                       | High   | Route only at boundaries; switches go through T3 handoff (fresh provider thread)                                                               |
| Claude shared windows make Opus→Sonnet pointless               | Certain                      | Medium | Pressure treats session/weekly as provider-wide; only family caps are escaped by model change; arbitrage to another provider is the real lever |
| Over-delegation by frontier models                             | High                         | Medium | Decomposition rules in instructions; caps on children/depth; eval cases in `mcp-tool-use`                                                      |
| Cross-vendor review in the wrong direction lowers quality      | Medium                       | Medium | Reviewer tier ≥ implementer enforced in `decide`                                                                                               |
| Budget semantics confuse (API-equivalent vs bill)              | High                         | Low    | Label everywhere; alerts say "planning cap"                                                                                                    |
| Merge conflicts between parallel writers                       | High when >3 writers         | Medium | Single writer per file set; owned-file manifests; serialised merge lane; never unattended conflict resolution                                  |
| Cursor pricing shape changed recently                          | Medium                       | Low    | Treat Cursor as "credit balance" pressure only until re-verified                                                                               |
| Codex Pro has no 5-hour window; Plus does                      | Certain                      | Low    | Pressure reads whatever windows exist; no assumptions by plan                                                                                  |
| Team view adds websocket load                                  | Low                          | Medium | Poll cost RPC only while mounted; pressure on existing stream; no new firehose                                                                 |
| Eval cost                                                      | Low                          | Low    | Deterministic policy cases in CI; paid replays only when a classifier is added                                                                 |
| Native Windows development                                     | Certain                      | High   | Unsupported upstream (`windows-tests.yml` says nothing passes yet); develop in WSL2, package the desktop app on Windows per release only       |
| Budget races and native-subagent bypass                        | Certain without reservations | Medium | Admission control reserves per launch at dispatch; native subagents land in the ledger and block later admissions; window share stays advisory |
| Provider-side overage billing                                  | Medium                       | Medium | T3 cannot prevent it; extra usage and credits are switched off at the Claude and ChatGPT accounts (start step 1)                               |
| Project override wipes nested `overlay` keys                   | Certain without the fix      | Medium | Phase 0 step 4 adds a deep merge for `overlay` in `resolveProjectSettings` with a test row                                                     |

## Answers recorded 2026-10-29

1. Plans: Claude Max 5x + ChatGPT Plus today; upgrade under consideration. Recommendation: Max 20x + Plus (Claude carries the bulk of consumption; Codex is reviewer and arbitrage target). Upgrade Codex to Pro only if the shadow report shows Codex red for hours each week.
2. Sonnet 5.5 / GPT-6.1 Sol are acceptable default writers; Opus for plan and review.
3. No overage at all (revised 2026-10-29): usage credits and Codex credits are switched off at the provider accounts; T3 has no paid fallback; exhausted means wait or another provider.
4. Exhausted threads ask; never auto-switch.
5. Docs move to `docs/overlay/` in the fork (Phase 0 step 5).
6. Control plane: GitHub issues; local files only for private work.
7. Upstreaming: overlay first; offer the two tiny hooks upstream after a month of stable merges; never block a phase on it.
8. `overlay/main` is the fork's default branch (2026-10-29).
9. A Phase 0b of four contract spikes (token semantics, replay durability, permissions map, candidate workspaces) runs before Phase 1 (2026-10-29).
10. `overlay/main` is based on the upstream `v0.1.3` tag and the sync merges upstream release tags, not nightly `main` (2026-10-29).
11. `fork-main` and `usage-strip` are archived, untouched; the usage strip and the Windows installer workflow are ported in Phase 0 steps 7 and 8; the old `fork-sync.yml` goes inert when `overlay/main` becomes the default branch (2026-10-29).
12. Single machine only, no cloud VM: an always-on 32 GB VM costs about A$250/month after Hetzner's June 2026 price rise. Scheduled automations and night shifts run only while the PC is awake, so Phase 6 designs for missed and late runs (2026-10-29).
13. Upstream's `ci.yml` and `mobile-fingerprint-check.yml` are disabled on the fork: they need upstream's Blacksmith runners and queue forever. PR CI is `overlay-check` (Phase 0 step 6) plus each thread's local `vp run check:changed`. Repository settings and workflow dispatches are developer actions, never agent actions (2026-10-29).
14. The Max plan's monthly Claude API credit (US$100 on 5x, US$200 on 20x since 2026-10-07) is the cheap tier's first home: text generation from day one, the nightly digest by GitHub Actions cron, routing evals in Phase 2, and read-only Sonnet 5.5 fan-out in Phase 3, all through one `Claude Credit` provider instance with an API key. Writers stay on the subscription. Phase 0b spike 5 must first prove T3-launched turns bill as Agent SDK, not Claude Code. OpenCode's free models stay a fallback: time-limited, undocumented rate limits, some train on prompts. Max 20x is not justified by the credit alone; upgrade when the ledger shows the credit running out before the cycle ends (2026-10-29).
15. Build the plan as written through Phase 5 and run on the team view for a while before expanding. The team view stays a pure dashboard: every number comes from server RPCs and streams the sidebar, thread view and mobile also read, every action is an existing operation, and deleting the route must break nothing. A standalone client over the same RPC contract (the mobile app is the precedent) stays an option, decided only after a month of use; T3 keeps owning threads, providers, worktrees and the relay (2026-10-29).

## Original questions

1. **Which subscriptions, which tiers?** Claude Max 5× or 20×? ChatGPT Plus or Pro (changes whether a 5-hour window exists)? Cursor plan? Antigravity? This sets the default `windowReserve` and which providers count for arbitrage.
2. **Quality floor for implementation.** Is Sonnet 5.5 / GPT-6.1 Sol acceptable as the default writer, with Opus only for plan and review? The docs assume yes.
3. **Overage.** Are Claude usage credits and Codex credits enabled, and what monthly cap would you accept?
4. **Auto-switch on exhaustion.** Should an exhausted thread auto-continue on another vendor with a handoff, or always ask first? Docs default to ask.
5. **Where should the design set live?** It is in this worktree (`t3-status-line-badge`) because that is where this thread runs; it belongs in the fork under `docs/overlay/`.
6. **Control plane.** GitHub issues as the task board, or local `.t3/tasks` files for private work?
7. **Upstreaming.** Try to upstream the target-policy hook and the capabilities usage band (small, generic), or stay fully overlay to avoid the review cycle?

## Things checked and found false or missing

- "FleetView" exists nowhere in upstream T3 docs, releases or code; only the tool names in this harness mention it. Do not plan around it.
- Claude Code has no `auto` model alias; `opusplan`, `best`, `default` exist.
- `task_budget` is an API feature and is not available inside Claude Code; budgets are prompt plus server guard.
- T3 has no "Agents" panel on web; mobile has `ThreadAgentsSheet`. Web shows delegated work in `ProviderSubagentBar`, timeline rows and the Lineage panel.
- `loadBalancingEnabled` in client settings balances **environments**, not models.
