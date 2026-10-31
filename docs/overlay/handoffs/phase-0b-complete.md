# Handoff · Phase 0b · Complete (WIP, not ready for review) · 2026-10-31 · written by Claude Sonnet 5.5

commit: see the branch head; this handoff is committed with the work it describes
supersedes: docs/overlay/handoffs/phase-0b-step-4.md

**WIP.** Step 5's paid probes have not run, so the billing gate is closed and the batch result is missing. Do not launch the review from this file until the step-5 resume completes it or the developer explicitly defers the probes. The intended review launch is at the end.

## Where we are

Branch `overlay/phase-0b-step-5`. Spike docs: [token-semantics](../spikes/token-semantics.md), [replay-durability](../spikes/replay-durability.md), [permissions-map](../spikes/permissions-map.md), [candidate-workspace](../spikes/candidate-workspace.md), [api-credit](../spikes/api-credit.md). Step handoffs: [1](phase-0b-step-1.md), [2](phase-0b-step-2.md), [3](phase-0b-step-3.md), [4](phase-0b-step-4.md), [5](phase-0b-step-5.md).

## Exit criteria

| Criterion (07-roadmap, Phase 0b)                                           | Command or evidence                                                                                               | Result                                                                                                                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Five spike docs with commands, results, baseline/version and coverage gaps | `ls docs/overlay/spikes`                                                                                          | Five exist; `api-credit.md` carries no results yet                                                                                          |
| Focused tests pass                                                         | `cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts`                                    | 22 passed                                                                                                                                   |
|                                                                            | `cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts`                | 5 passed                                                                                                                                    |
| Root changed-file check                                                    | `vp run check:changed origin/overlay/main`                                                                        | pass (docs only)                                                                                                                            |
| Every required live probe run, or explicitly deferred by the developer     | Step 3 handoff list; step 5 sequence                                                                              | **Not met**: step 3 probes unattempted and undeferred; step 5 probes not run                                                                |
| Inconclusive billing keeps the credit gate closed                          | `api-credit.md` verdict                                                                                           | `no-go: inconclusive`, gate closed                                                                                                          |
| Assumption-disposition table for 03, 04 and 05                             | below                                                                                                             | Written; credit rows unresolved                                                                                                             |
| Scheduled-sync URL or pending ticket carried                               | `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` | Only manual run 40822950375; ticket #4927935 answered, delivery may be dropped; external scheduler approved, not yet selected or configured |

## Assumption disposition (evidence from the spikes; developer decisions are still owed to the Phase 1 design round)

| Doc | Assumption                                                     | Disposition                                               | Evidence / unresolved choice                                                                                                                                                         |
| --- | -------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 03  | A rule 1: row key `(threadId, runId, providerTurnRef)`         | Contradicted                                              | Replay spike: `runAttempt.providerTurnId` is null live, Claude refs flip strong to weak, Codex starts null. Prototype keys `(threadId, providerThreadId, turn.id)`. Phase 1 chooses. |
| 03  | A rule 2: disjoint buckets from inclusive input and output     | Confirmed                                                 | Live Claude and Codex counters reconcile (`2+12941+13674=26617`); OpenCode native output excludes reasoning, normalized includes it. Antigravity has no billable buckets.            |
| 03  | A rule 3: price at read time with pinned `rateVersion`         | Unresolved                                                | `costs.ts` pure arithmetic and fixture rates exist; no live rate or reprice behavior tested. Today's vendor Haiku 5.5 and Sonnet 5.5 rates are recorded in `api-credit.md`.          |
| 03  | A rule 4: transactional cursor, rebuild equals live            | Confirmed in a prototype; partly contradicted for rebuild | Test-only SQL proof of restart, duplicates, late correction and rollback. Compaction deletes some history and uncommitted usage cannot be rebuilt. Concurrent live rebuild untested. |
| 03  | A rule 5: completeness; Claude totals include native subagents | Unresolved                                                | `hasSubagents: false` on tiny turns proves nothing about inclusion; unexercised live. Missing usage stays unknown, not zero.                                                         |
| 03  | Antigravity usage unknown, never inferred from context         | Confirmed                                                 | Live event shows context only, 14090 of 1048576, no turn usage.                                                                                                                      |
| 03  | Credit dollar band and display currency                        | Unresolved                                                | Depends on `api-credit.md`; no billing evidence yet.                                                                                                                                 |
| 04  | Haiku 5.5 cheap-tier rate $0.10/$0.50                          | Confirmed                                                 | Vendor pricing page, 2026-10-31. Antigravity Flash rate in the table is unverified.                                                                                                  |
| 04  | Antigravity is a candidate, not a tier                         | Confirmed                                                 | No billable counters, plan mode unverified; quality and price untested.                                                                                                              |
| 04  | Budgets are admission control; native subagents invisible      | Unresolved                                                | Consistent with step 1, but subagent inclusion unproven live.                                                                                                                        |
| 04  | Cheap tier resolves to `Claude Credit` while green             | Unresolved                                                | Gated by this step's billing result; currently `no-go: inconclusive`.                                                                                                                |
| 04  | `interactionMode: plan` yields read-only roles                 | Contradicted                                              | Permissions map: plan is not a proven read-only guarantee; approval-required gates, does not forbid. Eight Claude and six Codex write probes unattempted.                            |
| 05  | Verifier runs in a throwaway checkout of the candidate SHA     | Confirmed                                                 | Step 4: fresh `worktree` with `baseRef` equals the candidate and inherits no writer files; `existing_worktree` is attachment, not isolation. Positive setup-script path untested.    |
| 05  | Role restrictions at prompt level where not enforceable        | Confirmed                                                 | Permissions map classification; read-only enforcement itself unimplemented by design.                                                                                                |
| 05  | Merge batching with bisection later                            | Deferred                                                  | Decision 21.                                                                                                                                                                         |

## Coverage gaps and deferrals

No developer deferral exists. Open and unresolved are: step 3's unattempted permission probes and native Antigravity plan selection; step 1's untested live behaviors and OpenCode/ACP live coverage; step 2's concurrent rebuild, process-kill and power-loss durability; step 4's enforcement, remote, submodule, relay and hostile-setup coverage and positive setup execution; all of step 5's paid evidence.

## #37 checklist

- [ ] Claude Credit isolated instance verified; static checks done, process environment not yet shown
- [ ] Haiku 5.5 turn attributed
- [ ] Sonnet 5.5 turn attributed
- [ ] Title regeneration attributed
- [ ] Haiku batch submitted, retrieved and discount verified
- [ ] Max-window readings before and after
- [x] Vendor eligibility and rate references refreshed
- [ ] `go` or `no-go` with evidence (currently `no-go: inconclusive`)

## Next

Next: Resume docs/overlay/prompts/phase-0b/step-5.md with handoff docs/overlay/handoffs/phase-0b-step-5.md after answering its open questions — on Claude Sonnet 5.5 High or GPT-6.1 Sol high

When complete and the developer is satisfied, the review launch is: Run docs/overlay/prompts/_review.md for phase 0b with handoff docs/overlay/handoffs/phase-0b-complete.md — on GPT-6 Astra high if Claude executed the phase, or Claude Opus 5.5 High if Codex executed it; for mixed execution, review the other vendor's changes per 10 section 1
