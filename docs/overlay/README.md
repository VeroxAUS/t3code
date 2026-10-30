# T3 Code fork → multi-agent cockpit: design set

Date: 2026-10-29. Target repo: `VeroxAUS/t3code` (fork of `pingdotgg/t3code`).

## Verdict in one paragraph

Keep T3 Code as the base. It already has the expensive parts: ten provider adapters plus the ACP registry, a cross-provider `delegate_task` with durable child threads, lineage and context handoff, worktrees, scheduled tasks and webhooks, a usage page that reads every provider's 5-hour and weekly windows, and a mobile/remote relay. Nothing open source has all of that; Paperclip has budgets but is a web-only "AI company" board, Emdash has no orchestration layer, Vibe Kanban is sunsetting, and building on ACP alone would mean re-writing the adapters because ACP carries no cost or subagent primitives. What T3 lacks is exactly the layer you want: a per-thread cost ledger, a usage-pressure signal, a routing policy, budgets, a delegation engine with roles and pipelines, and a team view. All of those are additive. Build them as a thin overlay so the fork can keep merging upstream's release tags.

## State of the fork today

| Fact                               | Value                                                                                                                                                                   | Why it matters                                                                                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fork `main`                        | mirror of upstream (0 ahead, 10 behind at 125b619 on 2026-10-29)                                                                                                        | stays a mirror                                                                                                                                                                                                                        |
| Fork `fork-main` and `usage-strip` | orphan branch rebuilt from the v0.1.3 tag with a release-tag sync script, a Windows installer workflow (release `v0.1.3-strip.2` published) and a usage strip component | Not the overlay base (no shared history with upstream). Its schedule goes inert once `overlay/main` is the default branch; the strip and the installer workflow are ported in Phase 0 steps 7 and 8; the branch is kept as an archive |
| Overlay base                       | `overlay/main` created from the upstream `v0.1.3` tag commit; sync merges each new upstream release tag, not nightly `main`                                             | Fewer breaking merges; hook line numbers were measured at 125b619, one day past the tag, so markers rule                                                                                                                              |
| Upstream cadence                   | several nightlies per day, v0.1.3 stable 2026-10-27, V1→V2 orchestration migration done                                                                                 | Overlay must touch few upstream files                                                                                                                                                                                                 |
| Upstream stance                    | "mostly not accepting contributions" beyond small fixes; delegation policy hook request #25949 closed                                                                   | Plan to carry the policy layer yourself                                                                                                                                                                                               |
| Routing today                      | none. The model manifest doc says "no routing or cheaper-model rules"                                                                                                   | Router is new code                                                                                                                                                                                                                    |
| Cost attribution today             | none per thread or run. Usage page buckets by day/provider/model from transcripts                                                                                       | Ledger is new code                                                                                                                                                                                                                    |
| Budgets/caps today                 | none                                                                                                                                                                    | New code                                                                                                                                                                                                                              |
| Team view today                    | sidebar sections + per-thread Lineage panel; mobile has ThreadAgentsSheet                                                                                               | Team view is new UI over existing projections                                                                                                                                                                                         |

## What to read, in order

1. `01-base-decision.md` — why T3, what we never rebuild, fork strategy, exit hedge.
2. `02-architecture.md` — target layers, exact hook points with file paths, new packages, data model.
3. `03-cost-ledger-and-pressure.md` — per-thread cost and the usage-pressure signal that drives everything.
4. `04-router.md` — the usage- and cost-aware routing policy, degrade ladder, config, explainability, eval.
5. `05-delegation-engine.md` — roles, decomposition rules, pipeline templates, verification/review loops, merge queue, best-of-N.
6. `06-cockpit-ui.md` — the team view / mission control spec.
7. `07-roadmap.md` — phases, steps, file touch lists, tests, effort.
8. `08-idea-backlog.md` — 38 ideas rated by value and cost.
9. `09-risks.md` — implementation risks; accepted answers live in decisions.md and unresolved choices under their phase in 07-roadmap.md.
10. `10-execution-plan.md` — model and effort per phase, the handoff chain, the Phase 0 launch, the Fable review round, how rounds work.
11. `11-single-machine-and-cloud.md` — running on one machine, when a VM is worth it, cloud options.
12. `12-ui-ux.md` — the team view hub design; mockup in `mockups/team-view.html`.

When Phase 2 is finished: `shadow-window-playbook.md` — what to run and do during the 14-day shadow window.

Thread prompts live in `prompts/`: `_preamble.md` (every thread reads it first), `_design-round.md`, `_review.md`, `_fix.md`, `_ask.md` (a question thread outside the chain; edits only `inbox.md`), and the numbered prompts under `phase-0/` and `phase-0b/`. Later phases' step prompts are written by each phase's design round. Start any thread with one line: `Run <prompt file> [for phase N] with handoff <handoff file>`. Phase 0 starts with `Run docs/multi-agent-harness/prompts/phase-0/step-0.md with handoff none` on Sonnet 5.5 Medium.

## Assumptions these docs make

- Spend is subscriptions: Claude Max 5x today (recommended upgrade: Max 20x) and ChatGPT Plus for Codex (5-hour + weekly windows). API keys are secondary, with one exception: the Max plan's monthly API credit (US$100 on 5x, US$200 on 20x, expiring each cycle) carries the cheap tier through one `Claude Credit` provider instance (decisions.md 18, Phase 0b spike 5). So "cost" means window consumption first, API-equivalent dollars second. There is no overage: paid overflow is switched off at the provider accounts and T3 has no paid fallback.
- One developer plus agents, one machine (i7-13700K, 32 GB, RTX 4080, Windows 11) for now, developing inside WSL2 because upstream's own Windows test workflow says nothing in the suite passes on Windows yet; a VM as a second T3 environment later if always-on automations are wanted.
- Quality floor: implementation work stays on at least a Sonnet-5.5-class model (Sonnet 5.5, GPT-6.1 Sol) unless you explicitly opt a task down. Confirmed by the user 2026-10-29. Cheap tiers are for reading, searching, summarising, classifying and narrow mechanical edits.
- Numbers quoted for pricing and benchmarks were verified on 2026-10-29 against vendor pages where possible; the router must read live rates from the LiteLLM table T3 already fetches, never from constants.

## Headline design choices

- **Route at boundaries, never mid-thread.** Every `delegate_task` starts a fresh child thread with no shared cache, so it is the ideal routing point. Existing threads switch model only at compaction or on explicit user action.
- **Pressure is a band, not a number.** Green / amber / red / exhausted per provider, computed from the most constrained window and burn rate vs time-to-reset, with hysteresis.
- **Degrade in this order:** lower effort → cheaper tier for new subagents → send new threads to another provider's green window → switch an existing thread at a boundary → queue until reset or allow capped overage.
- **Roles, not models, in agent prompts.** Agents ask for `role` and `tier`; the server resolves provider, model and effort. Agents never hardcode a model again.
- **Single writer per file set; readers fan out.** Verification and review run in fresh contexts on a tier at least as strong as the implementer, preferably another vendor when its window is green.
- **Every automatic decision is visible and overridable.** A "why this model" record sits on every delegated row and the team view.
