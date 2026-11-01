# Handoff · Phase 0b · Step 5 · 2026-11-01 · written by Claude Sonnet 5.5

commit: see the branch head; this handoff is committed with the work it describes
supersedes: docs/overlay/handoffs/phase-0b-step-4.md

## Where we are

Branch `overlay/phase-0b-step-5` · worktree `/home/verox/src/t3code-phase-0` · based on `origin/overlay/main` `6169024ecf` plus one inbox-only commit (`8fd48a9684`). All four authorized paid requests ran and the developer's Usage-page CSV attributes each of them (reconciliation in the spike). The verdict is `go`, scoped to Haiku 5.5 and Sonnet 5.5 thread turns without tools and `claude -p` text generation on `Claude Credit`; the developer confirms admission of the in-T3 credit steps (open question). One Haiku residual of 2,382 input and 44 output tokens in hour 14 is unexplained. Phase 0b is not declared passed here; only the review does that. PR: [#24](https://github.com/VeroxAUS/t3code/pull/24) into `overlay/main`, open. Never merge.

## Done, verified

- Requested PR opened: `git push -u origin HEAD` then `gh pr create --repo VeroxAUS/t3code --base overlay/main --head overlay/phase-0b-step-5` → [PR #24](https://github.com/VeroxAUS/t3code/pull/24); never merged.
- Gate: `git fetch origin`, `git rev-parse HEAD origin/overlay/main` and the step-4 handoff, Open questions `- none` → step-4 PR #23 merged, branch descends from it.
- Vendor references refreshed 2026-10-31 from the [credits page](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers), [pricing](https://platform.claude.com/docs/en/about-claude/pricing) and [Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing) → Haiku 5.5 $0.10/$0.50 and Sonnet 5.5 $2/$10 per MTok, batch exactly half; Agent SDK credit-covered, Claude Code not. Only the credits page was read in full.
- Authorization: developer authorized the exact four-request sequence (Sonnet included) and ran the batch themselves; readings were developer-supplied (no browser tool in this session).
- Request 1, Haiku 5.5 thread turn at 14:06Z → `t3_thread_launch`/`wait`/`read` through the Codex-switched coordinator, then read-only SQL on `orchestration_events` and the credit-directory native transcript: instance `claudeAgent_claude_credit`, tokens 2 uncached / 13,066 read / 8,900 write / 15 out, arithmetic about US$0.00125, transcript only under `~/.claude_credit`.
- Request 2, Sonnet 5.5 turn at 14:08Z → same method: 2 / 13,066 / 8,077 / 15, arithmetic about US$0.02165; Billing & payments balance fell US$99.98 to US$99.95 (dashboard 99.99 to 99.96) by 14:09Z.
- Request 3, title regeneration at 15:05Z → `t3_thread_update` `regenerate_title`, SQL for the metadata events (sequence 3142, 3160) and the `claude -p` transcript under `~/.claude_credit/projects/-tmp-t3code-claude-title-*`: 2 / 1,104 / 3,821 / 374, one response, arithmetic about US$0.00068. T3 persists no usage for this path.
- Request 4, Haiku batch at 16:08Z → developer-run `/tmp/phase0b-step5/batch_probe.py submit` then `retrieve`: batch `msgbatch_01Q2Yhq4YbYw6F69CjJB3Hyd` succeeded in 95 seconds, `service_tier` `batch`, 25 in / 14 out, arithmetic US$0.00000475, exactly half the standard-rate arithmetic. The discount is verified in the rate table and response tier, not measured as a charge.
- Usage-page reconciliation (developer-supplied CSV, 4 rows) → hour/model/tier rows match requests 2, 3 and 4 exactly and request 1 plus an unexplained 2,382 in / 44 out Haiku residual (about US$0.00026); all under workspace and key `t3-overlay`; row arithmetic about US$0.0238 total, US$0.0232 by 14:09Z against a displayed fall of 3 cents. The developer states nothing else used the key.
- No launch or title event caused incidental paid text generation: no title event after 14:00Z before request 3; explicit titles and no `generateTitle` on every launch.
- Max window: the 5-hour session read 1 percent at 16:05Z after 0 percent at 15:07Z. The developer attributes it to this Claude Code session, which runs on the Max subscription (transcript: 37 calls since 14:00Z). It is **not evidence either way** about `Claude Credit` and the spike says so.
- Acceptance tests: `cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts` → 22 passed; `cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts` → 5 passed. No fixture file changed.
- Root check: `vp run check:changed origin/overlay/main` → pass for the docs-only change (format passes; code and dependency checks skip).
- Server: the isolated dev server was started by this thread from the worktree and stopped with `kill -- -13021` after confirming both port owners had this worktree's cwd and group; the live Windows listener on 3774 was not touched.
- Sync inspection (read only): `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` → still only manual [run 40822950375](https://github.com/VeroxAUS/t3code/actions/runs/40822950375). Ticket #4927935 is answered (schedule registered; native delivery may be delayed or dropped); the external-scheduler route is developer-approved. Scheduler selection, credential setup and native-cron disposition remain for the next design round. No setting, secret or dispatch was touched.

## Not done / deferred

- The 2,382 in / 44 out Haiku residual in hour 14: cause unverified (plausibly runtime-internal auxiliary calls not in the transcript), not separable between requests 1 and 2.
- Exact per-request credit decrement: no source exists at this granularity; funding is inferred from consistency.
- Process environment of the spawned credit-instance `claude` was not read; isolation rests on transcript locations.
- Inherited and unresolved, not deferred by the developer: step 3's required unattempted permission probes (Claude plan write enforcement eight, Codex approval-required/plan four, Codex full-access/plan two); native Antigravity plan-mode selection; positive setup-script execution; step 1's live cumulative/reset/steering/interrupted/reasoning/subagent behavior, OpenCode 2 and other ACP live coverage; step 2's concurrent rebuild, process-kill continuation and power-loss durability; step 4's read-only enforcement, provider-turn cwd, remote-only candidate, submodule, relay/client and hostile-setup coverage.

## Decisions made and why

- No new developer decision and no `decisions.md` change. Decision 30 would have kept the gate closed on inconclusive billing; the Usage rows resolved attribution. The spike records `go` as the investigation result, scoped as stated; the developer's acceptance of that admission is the open question below, and `decisions.md` records developer-accepted changes only.
- The complete handoff is `phase-0b-complete.md`; its review Next line stands, but the review will find the step 3 permission coverage unresolved unless the developer acts first.

## Gotchas discovered

- The coordinator thread `8bb7473a-f5c0-4b5e-87b0-17d717454e45` was on the subscription Claude instance (Sonnet), which would have charged the Max window with every wait and read; it was switched to Codex GPT-6.1 Sol high before the schedule. Verify a coordinator's instance in `orchestration_v2_projection_threads` before using the Max window as a signal.
- `/tmp/t3-permission-probes` (the coordinator's project root) vanishes at reboot and blocks sends with "workspace folder no longer exists"; recreate it as an empty Git folder.
- A UI-created thread auto-generates its title on the text-generation setting (`Claude Credit` Haiku), an unplanned paid request; MCP `t3_thread_launch` with an explicit `title` and no `generateTitle` does not. Initial title generation requires a `titleSeed` (`Orchestrator.ts`).
- The Usage page is UTC with hourly buckets and lags a few hours; the Cost page is two-decimal and daily; Billing & payments (promotional credit) and the dashboard (Organization credits) differ by a cent. Record both with UTC times.
- The investigating session's own subscription usage confounds the 5-hour Max window. A future billing probe needs a quiet subscription or a different signal.
- The batch script is outside the repository (`/tmp/phase0b-step5/batch_probe.py`): key from the environment only, `submit` and `retrieve <id>` modes, no polling. Phase 1's digest script should be written and tested separately.

## Developer actions

- Re-enable `Claude Credit` text generation in the live install if you want it; it uses the same key and was disabled only for the probes.
- Resolve step 3's permission coverage with probes or an explicit written deferral before the Phase 0b review.
- Sync: repeat the `gh run list` command above at the next daily slot and record any real scheduled run. Scheduler selection and any dispatch remain yours.
- Review/merge the step-5 PR when satisfied; the agent never merges.

## Open questions for the developer

- Do you accept the scoped `go` (Haiku 5.5 and Sonnet 5.5 thread turns without tools, and `claude -p` text generation, on `Claude Credit`) as admitting the _credit_ steps in Phases 1 to 3?
  Recommended: yes — every request was attributed to the key in the Console, the balance fell consistently, and no other funding source exists; the unexplained 2,382-token Haiku residual is about US$0.00026 and is a ledger unknown to design for, not a billing blocker.

Next: Run docs/overlay/prompts/_review.md for phase 0b with handoff docs/overlay/handoffs/phase-0b-complete.md — on GPT-6 Astra high if Claude executed the phase, or Claude Opus 5.5 High if Codex executed it; for mixed execution, review the other vendor's changes per 10 section 1
