# Handoff · Phase 0b · Step 1 · 2026-10-31 · written by Codex

commit: b315a4f14f603ea066d726611d547e2465049043
supersedes: docs/overlay/handoffs/phase-0b-design.md

## Where we are

Branch `overlay/phase-0b-step-1` · worktree `/home/verox/src/t3code-phase-0`. Step 1 investigation and pure arithmetic complete; Phase 0b is not complete. PR pending creation into `overlay/main`; never merge from this thread. The branch already contained ten developer commits after the design merge, touching README, inbox and the shadow-window playbook; preserved unchanged.

## Done, verified

- Gate/base: `git fetch origin`, `git merge-base --is-ancestor origin/overlay/main HEAD`, `gh pr view 19 --repo VeroxAUS/t3code --json state,mergeCommit` → pass; design merged at `c906bc048a3d98f8866300b6797ee03b5e6a7971`. Spike baseline `014ad21ed446f53b12827ff72eb8b41a101adc05`.
- Pure `packages/routing/src/costs.ts` and `costs.test.ts`: disjoint cache buckets, inclusive reasoning, latest cumulative snapshots/corrections, partial/unavailable/unknown rates, invalid counters and overflow. `cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts` → 22 pass. Test first failed for missing costs.ts; hand-computed USD vectors use explicitly synthetic pinned rates, including live and historical token counts. No T3 imports or live pricing.
- Existing normalizers: `cd apps/server && ../../node_modules/.bin/vp test run src/provider/TurnTokenUsage.test.ts` → 5 pass. Source/fixture evidence for OpenCode 2 and shared ACP is labelled separately from live captures; no upstream adapter changed.
- Isolated live path: `setsid vp run dev --no-seed > /tmp/phase-0b-step-1-dev.log 2>&1 &` → ports 14513/6473, T3 home `<worktree>/.t3`, environment `98a5b07c-6a93-476f-975e-5fd69980b76d`. Developer signed in and started a GPT-6.1 Sol High coordinating thread; its persisted `orchestrator_capabilities`, three `t3_thread_launch` calls and thread reads prove the T3 path. All three child runs completed with `TOKEN_PROBE_OK`, no agent tools/subagents. Read-only SQLite/native-transcript commands and exact token-only extracts are in `docs/overlay/spikes/token-semantics.md`.
- Actual server inventory, read selectively from `.t3/caches/{claudeAgent,codex,antigravity}.json`: Claude `claudeAgent` / `claude-haiku-5-5`, runtime 2.1.312, auth `Claude Max`; Codex `codex` / `gpt-6-luna`, runtime 0.166.0, auth `chatgpt`; Antigravity `antigravity` / `gemini-3.8-flash-low`, runtime 1.3.0, auth `oauth-personal`. All ready/authenticated; Google AI Pro entitlement remains developer-reported.
- Live correlation: read `orchestration_events` sequences 148/189 and provider-turn projections → Claude native uncached 2 + read 12941 + write 13674 = inclusive input 26617, output 15; Codex native inclusive input 21097, read 11648, write 0, output 8; reasoning 0 for both. Native transcript counters match stored usage. Antigravity completed event 252 has no turn-token usage; context events 248/253/257 have used 14090, max 1048576. This is unavailable billable usage, never zero cost.
- `vp run check:changed origin/overlay/main` → format, lint, both knip stages, routing typecheck and 22 focused tests pass. No repo-wide checks, browser/computer use, workflow dispatch or repository-setting mutation. Git subprocess EPERM required escalated validation.
- Server lifecycle: captured process-group PID 64511; `kill -- -64511` → stopped after every probe and coordinator completed, shutdown reconciliation zero active work. Isolated credentials/state remain for later steps. No live install state was written or server started against it.
- Read-only sync inspection once: `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` → only successful manual [run 40822950375](https://github.com/VeroxAUS/t3code/actions/runs/40822950375); scheduled evidence remains pending, support ticket **#4927935** carried forward.

## Not done / deferred

- ACP raw native token packet was not retained; only its persisted context projection is observed live, with source explaining the mapping. The live turn demonstrates unsupported billable counters on this adapter path, not a runtime-wide assertion that Google never exposes them.
- Live cumulative/reset/steering behavior, interrupted usage, nonzero reasoning and native-subagent inclusion were not exercised by these tiny turns; source/fixture coverage and explicit limits are in the spike. `hasSubagents: false` proves no aggregate-child billing semantics. OpenCode 2 and other ACP agents remain untested live.
- The developer selected the checkout's `apps/server` project; launch calls used root workspaces there, despite the prepared disposable `/tmp/t3-token-semantics` directory. No child tools/writes occurred. Workspace isolation remains unproven until step 4.
- Durable replay/cursor/transaction behavior belongs to step 2. No ledger, adapter fix, router, permission enforcement or migration was implemented.
- Claude Credit is unnecessary for step 1 and still needs isolated setup before step 5's independent billing probes. No credit tasks, billing-page readings or purchase occurred.
- Scheduled-trigger evidence and support response remain pending; no new dispatch.

## Decisions made and why

- No new developer policy decisions. Keep provider adaptation at the server boundary; the spike's exact normalization proposal is evidence for Phase 1 design, not an accepted change to `docs/overlay/decisions.md`.
- Missing cache buckets stay unknown in the pure function; partial complete-bucket snapshots may have provisional USD, but reconciliation must require both complete and priced. Reasoning is an optional subset of inclusive output.
- Store latest cumulative turn snapshots by replacement; arithmetic tests do not pretend to prove durable idempotency or live billing. Rates in the fixtures are synthetic USD rates, with provenance explicitly separate from observed token counts.

## Gotchas discovered

- Actual event log on this baseline is `orchestration_events`, not the empty `orchestration_v2_events`. Step 2 must use the former with the real event-store/SQL layers. Provider-turn and provider-thread projections live in `orchestration_v2_projection_*` tables.
- Shared ACP terminal turns lack `turnTokenUsage`; context occupancy and optional context cost cannot reconstruct disjoint billable buckets. Do not infer zero spend. Antigravity results do not prove another ACP flavor.
- Native Claude result semantics and session-cumulative `modelUsage` differ. OpenCode native output excludes reasoning, while the normalized output includes it. Codex native totals are thread-wide, normalized terminal totals per turn.
- Package edits and changed-file checks trigger dev watcher restarts, including temporary Vite files. Finish them before installation/sign-in; the developer hit disconnects until edits/checks were paused. Setup completed afterward. Server now stopped, state retained.
- `OpenCode2AdapterV2.ts` moved to `packages/provider-opencode/src/server/adapter.ts`; its tests remain under the old adapter test name. Replay exists as fixture infrastructure here; no standalone Replay adapter was found. Token normalizer tests share `apps/server/src/provider/TurnTokenUsage.test.ts`.
- This CLI had no T3 launch tools; the developer's isolated T3 coordinating thread supplied the real launch path. Future live steps need the same tools and should create a disposable project before launching.

## Developer actions

- Review/merge this step's PR when satisfied; the agent never merges. Before step 2, start the next branch from updated `origin/overlay/main` using the chain's usual workflow.
- Before further live probes: `vp run dev --no-seed` in this checkout restarts its isolated home with retained provider setup. Create/select a disposable project, such as `/tmp/t3-token-semantics`, and use a T3 thread with launch/delegation tools connected to that environment. Do not copy the Windows account assumptions into the probe results.
- Before step 5: configure the separate `Claude Credit` instance in the isolated server per `docs/overlay/10-execution-plan.md` §8.1 and provide fresh isolated billing readings or authorize the browser pass requested by that step. Keep the subscription instance separate.
- Sync: disable/enable was already done; support ticket **#4927935** remains pending. At the next relevant daily slot, run `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url`; record an actual scheduled run URL or support response. If upstream releases a new tag while schedule is broken, manually run `gh workflow run overlay-sync.yml --repo VeroxAUS/t3code --ref overlay/main`; record its URL as manual evidence only. Neither command was dispatched by this thread beyond the one read-only inspection above.

## Open questions for the developer

- none

Next: Run docs/overlay/prompts/phase-0b/step-2.md with handoff docs/overlay/handoffs/phase-0b-step-1.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high
