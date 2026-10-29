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
