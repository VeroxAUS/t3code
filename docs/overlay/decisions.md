# Decisions

Dated record of decisions the developer has made. One line each; the reasoning lives in the design docs.

## 2026-10-29

1. Plans: Claude Max 5x + ChatGPT Plus today; upgrade under consideration. Recommendation: Max 20x + Plus. Upgrade Codex to Pro only if the shadow report shows Codex red for hours each week.
2. Sonnet 5.5 and GPT-6.1 Sol are the default writers; Opus for plan and review.
3. No overage at all: usage credits and Codex credits are switched off at the provider accounts; exhausted means wait or another provider.
4. Exhausted threads ask; never auto-switch.
5. The design set lives in `docs/overlay/` in the fork (moved in Phase 0 step 5).
6. Control plane: GitHub issues; local files only for private work.
7. Upstreaming: overlay first; offer the two tiny hooks upstream after a month of stable merges; never block a phase on it.
8. `overlay/main` is the fork's default branch.
9. A Phase 0b of four contract spikes (token semantics, replay durability, permissions map, candidate workspaces) runs before Phase 1.
10. `overlay/main` is based on the upstream `v0.1.3` tag; the sync merges upstream release tags, not nightly `main`.
11. `fork-main` and `usage-strip` are archived, untouched; the usage strip and the Windows installer workflow are ported in Phase 0 steps 7 and 8; the old `fork-sync.yml` goes inert when `overlay/main` becomes the default branch.
12. Single machine only, no cloud VM; scheduled automations and night shifts run only while the PC is awake, so Phase 6 designs for missed and late runs.
13. Upstream's `ci.yml` and `mobile-fingerprint-check.yml` are disabled on the fork. PR CI is `overlay-check` (Phase 0 step 6) plus each thread's local `vp run check:changed`. Repository settings and workflow dispatches are developer actions, never agent actions.
14. Project overrides for `overlay` accept only `routing`, `budgets` and `cockpit`; `telemetry` and `limits` are global only (step-4 open question, answered in step 5).
15. Done 2026-10-29, developer: `10-execution-plan.md` §8.1 credit steps 1 to 5. Console org linked to the Max plan; Promotional credits US$100.00; workspace `t3-overlay` with a US$90 spend limit and one single-workspace API key; the same key is the repo secret `OVERLAY_API_KEY`; T3 provider instance `Claude Credit` (binary `claude`, `CLAUDE_CONFIG_DIR=~/.claude_credit`, `ANTHROPIC_API_KEY` Sensitive, never signed in); text generation on `Claude Credit` → Haiku 5.5 Low with the two-line title instructions. Proof: one title regeneration moved the balance $100.00 → $99.99 (rounded) and left the Max usage strip unchanged. Spike 5 still proves full turns. Plan stays Max 5x for now.

## 2026-10-30

16. The missing `overlay-sync.yml` scheduled run no longer blocks Phase 0: manual run https://github.com/VeroxAUS/t3code/actions/runs/40822950375 proves the sync job; the schedule never fires (GitHub-side, see `handoffs/phase-0-fix-3.md`), so scheduled-trigger evidence and the GitHub support ticket carry into Phase 0b as an open item. Until it is fixed, dispatch the sync by hand when upstream tags a release.

17. Question ownership (inbox, 2026-10-30): 09 keeps implementation risks; accepted answers live here; unresolved choices live under their owning phase in 07. Former 09 answers 1–13 duplicate decisions 1–13; answers 14–16 are preserved below as 18–20. Original questions 2–7 were already answered by decisions 2–7; question 1 is settled for Claude/Codex by decision 15, with additional-provider capture scope owned by Phase 0b and routing defaults by Phase 1.
18. Migrated accepted answer from former 09 answer 14: The Max plan's monthly Claude API credit (US$100 on 5x, US$200 on 20x since 2026-10-07) is the cheap tier's first home: text generation from day one, the nightly digest by GitHub Actions cron, routing evals in Phase 2, and read-only Sonnet 5.5 fan-out in Phase 3, all through one `Claude Credit` provider instance with an API key. Writers stay on the subscription. Phase 0b spike 5 must first prove T3-launched turns bill as Agent SDK, not Claude Code. OpenCode's free models stay a fallback: time-limited, undocumented rate limits, some train on prompts. Max 20x is not justified by the credit alone; upgrade when the ledger shows the credit running out before the cycle ends (2026-10-29).
19. Migrated accepted answer from former 09 answer 15: Build the plan as written through Phase 5 and run on the team view for a while before expanding. The team view stays a pure dashboard: every number comes from server RPCs and streams the sidebar, thread view and mobile also read, every action is an existing operation, and deleting the route must break nothing. A standalone client over the same RPC contract (the mobile app is the precedent) stays an option, decided only after a month of use; T3 keeps owning threads, providers, worktrees and the relay (2026-10-29).
20. Migrated accepted answer from former 09 answer 16: Every amount a person sees or types (cost chips, shadow report, budgets, alerts, credit balance) is in AUD at a fixed developer-set USD rate; the ledger stores USD because the price table is USD (03 rule 8) (2026-10-30).
21. Backlog #14: defer merge batching with bisection to Phase 6; Phase 0 provides no batch-landing evidence, and the Phase 4 serial merge lane should be used before adding failure-isolation machinery. Developer answered in the Phase 0b design round.
22. Backlog #23: defer cross-machine routing to Phase 6, conditional on adding another environment; the current single-machine setup has no need or evidence for automatic environment selection. Developer answered in the Phase 0b design round.
23. Interrupted design rounds: commit and push a clearly labelled WIP handoff on the current branch; preserve answered decisions, unfinished work and the exact pending question. A fresh frontier-model thread resumes the same branch without claiming completion or opening the final design PR. Developer accepted WIP commit and push in the Phase 0b design round.
24. Backlog #24: defer the local-model tier to Phase 6, conditional on exhausted credits/windows or offline need; Claude API credit already covers the text-generation use case, so a second runtime has little immediate value. Developer confirmed the overlap and deferral.
25. Backlog #27: defer learned tiering to Phase 6 after at least a month of labelled outcomes; there is no ledger or outcome dataset to train or evaluate it yet. Developer answered in this design round.
26. Backlog #34: defer the API advisor pattern to Phase 6; first establish credit billing and available balance, then measure task quality and savings in T3. Developer answered in this design round.
27. Backlog #35: defer compaction-boundary switching to Phase 6; no evidence yet establishes a reliable trigger or net benefit over explicit handoff and new-thread routing. Developer answered in this design round.
28. Backlog #37: promote into Phase 0b step 5 and the promoted-ideas table, retaining the existing go/no-go gate for later in-T3 credit tasks; no extra spike step. Developer answered in this design round.
29. Live spike scope: include Antigravity/Google AI Pro now alongside Claude and Codex; keep Claude Credit as a separate billing instance for text generation and the planned credit tasks. The developer wants to assess the reported $25/three-month trial for lighter work before later routing phases, avoiding a second integration investigation. This is not a purchase action or a routing-quality conclusion. Replay is synthetic; other OpenCode/ACP instances need explicit live coverage or an untested label.
30. Evidence gate: inconclusive billing is recorded as no-go: inconclusive, keeping later in-T3 credit work out of scope without repeated spending to force a visible balance change. Negative/inconclusive findings can complete an investigation; a required live probe never run remains incomplete unless the developer explicitly defers it. Developer accepted this distinction.
31. Rename the risk-only document to 09-risks.md and update live references; preserve historical handoffs. Developer requested this before closing the Phase 0b design round.
