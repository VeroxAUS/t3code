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
