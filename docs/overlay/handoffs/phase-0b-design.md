# Handoff · Phase 0b · Design · 2026-10-30 · written by Codex

commit: 19ec515eec9e54f4222a20af4cc0dffe1036009d
supersedes: docs/overlay/handoffs/phase-0-review-3.md

## Where we are

Branch `overlay/phase-0b-design` · worktree `/home/verox/src/t3code-phase-0`. Design round only; no spike has run and Phase 0b is not complete. The developer reviews the prompts in this PR before step 1.

## Done, verified

- Design PR: https://github.com/VeroxAUS/t3code/pull/19 into `overlay/main`; opened, not merged.
- Gate/base: `git fetch origin && git merge-base --is-ancestor origin/overlay/main HEAD` → pass; integration base `24a51ee3c6130aa9f31ad0d297908cf2d3e81ec0`. Kept the developer-named branch and its two existing commits. The named Phase 0 review has `status: passed`; its action result records disable/enable and support ticket #4927935.
- Read all Phase 0 handoffs, phase scope/promoted table, backlog, inbox, decisions, 02/03/04/05 and execution plan, and the Phase 0 prompt models. `rg --files docs/overlay/spikes` → no spike markdown yet.
- Five prompts in `docs/overlay/prompts/phase-0b/`, one per roadmap step, each 31 lines with execute model/effort, gate, commands, successor and required Finish paragraph. Step 5 writes the complete handoff and starts the other-vendor review.
- Structure/source verification: `python3 /tmp/check-phase-0b-design.py` → pass: five prompts under 50 lines, five numbered steps, chain/Finish/model checks, eight hook symbols, 20 manifest paths/17 markers, six Phase 6 deferrals, #37 promotion, cleared inbox and markdown-only scope. The checker is temporary verification tooling, not a repository artifact.
- Antigravity route: `gh api graphql` reading upstream discussion 23268 → the reply points to Google's personal-subscription ACP clarification; `apps/server/src/orchestration-v2/Adapters/AntigravityAdapterV2.ts` imports the shared ACP adapter, and `docs/user/providers-antigravity.md` names Google's official runtime. Discussion: https://github.com/pingdotgg/t3code/discussions/23268. This establishes the planned capture path, not account eligibility or measured token behavior; the linked Google forum page could not be fetched directly here.
- `rg -n '09-risks-and-open-questions' docs/overlay --glob '!**/handoffs/**'` → no live references. Renamed the risk-only document to `docs/overlay/09-risks.md`; README now points to it. Accepted answers moved to decisions; remaining choices sit under their owning roadmap phase. Historical handoffs were not rewritten.
- Sync inspection: `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` → only successful manual run 40822950375; no scheduled run. Evidence: https://github.com/VeroxAUS/t3code/actions/runs/40822950375.
- Changed-file validation: `vp run check:changed origin/overlay/main` → pass (format; code checks skipped for docs-only changes); escalated rerun after sandbox Git subprocess EPERM. No repo-wide checks, live provider turns, browser sessions or production changes.

## Not done / deferred

- All five spikes are execution work for the next threads; this PR contains docs only.
- Antigravity/Google AI Pro setup and model availability have not been inspected live. The developer explicitly included that provider now; do not substitute a Gemini API-key route.
- Scheduled-trigger evidence remains pending under decision 16 and ticket #4927935. A real upstream-tag sync PR also remains future live-path evidence.
- #14, #23, #24, #27, #34 and #35 were individually deferred to Phase 6, with conditions recorded in decisions and the roadmap.

## Decisions made and why

- Decisions 17–20 preserve the inbox's ownership rule and previously accepted credit, dashboard and AUD answers; no unresolved choice is promoted to an accepted answer.
- Decisions 21–29 record the individual backlog calls, WIP commit/push rule, #37 promotion and live Claude/Codex/Antigravity scope with a separate Claude Credit billing instance.
- Decision 30 keeps inconclusive billing at `no-go` without repeated spending, while distinguishing negative findings from required probes never run. Decision 31 records the risk-document rename.
- The five-step prompts make those decisions executable: step 1 has independent subscription captures; step 5 adds billing captures. Replay remains synthetic. The durability test must use persisted events/SQL, and permission conclusions require observed file-state evidence. Deterministic evals and repricing are local computations, not credit tasks.

## Gotchas discovered

- The hook files/symbols still exist; hook 8 is implemented, the other hook rows are planned. The ingestor's terminal analytics callback runs after persistence with an in-memory dedupe; it cannot be the ledger's durable replay source. Step 2 must establish that source.
- `interactionMode` and `runtimeMode` are different axes; their schemas are in `packages/contracts/src/providerPolicy.ts`. A mode clamp is not proof of a read-only shell.
- The shared ACP adapter is `packages/provider-acp/src/server/adapter.ts`; Antigravity has its own flavor. Its result does not cover every ACP agent.
- Live T3-path probes need a T3 session connected to isolated development state with the launch/delegation tools. A plain CLI without them cannot provide that evidence.
- Interrupted design rounds resume via a WIP handoff on the same branch and revalidate the original passed review; they do not create step branches or final design PRs.
- Git metadata is outside the writable sandbox for this linked worktree; fetch/commit/push may require escalation.

## Developer actions

- Review and merge the design PR when satisfied; this thread never merges. Then launch step 1 using the Next line.
- Before step 1's live capture, make the Antigravity/Google AI Pro instance available through the official runtime and personal Google sign-in, using `docs/user/providers-antigravity.md`. Record instance/model/runtime identifiers without credentials. Account activation or purchase, if needed, is yours.
- Before step 5, provide isolated before/after credit/Max-window readings or authorize a browser pass; retain the separate `Claude Credit` configuration recorded in decision 15.
- Sync: disable/enable was already done on 2026-10-30; support ticket **#4927935** is filed. After the next daily slot, run `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` and record the actual schedule URL/result or support response. Until resolved, manually dispatch `gh workflow run overlay-sync.yml --repo VeroxAUS/t3code --ref overlay/main` when upstream releases a new tag. Do not treat that manual run as scheduled evidence.

## Open questions for the developer

- none

Next: Run docs/overlay/prompts/phase-0b/step-1.md with handoff docs/overlay/handoffs/phase-0b-design.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high
