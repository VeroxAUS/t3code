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
