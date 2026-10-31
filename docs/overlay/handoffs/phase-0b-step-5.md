# Handoff · Phase 0b · Step 5 · 2026-10-31 · written by Claude Sonnet 5.5

commit: see the branch head; this handoff is committed with the work it describes
supersedes: docs/overlay/handoffs/phase-0b-step-4.md

## Where we are

Branch `overlay/phase-0b-step-5` · worktree `/home/verox/src/t3code-phase-0` · based on `origin/overlay/main` `6169024ecf` plus one inbox-only commit (`8fd48a9684`). All four authorized paid requests ran. **One input is still outstanding:** the developer's Usage-page hourly rows (workspace `t3-overlay`, model split, 2026-10-31 14:00 to 17:00Z) that would attribute each request. Until then the billing verdict is `no-go: inconclusive` with the gate closed, which is what decision 30 requires; the spike says what would move it. Phase 0b is not complete and nothing here declares it passed. PR: [#24](https://github.com/VeroxAUS/t3code/pull/24) into `overlay/main`, open. Never merge.

## Done, verified

- Requested PR opened: `git push -u origin HEAD` then `gh pr create --repo VeroxAUS/t3code --base overlay/main --head overlay/phase-0b-step-5` → [PR #24](https://github.com/VeroxAUS/t3code/pull/24); never merged.
- Gate: `git fetch origin`, `git rev-parse HEAD origin/overlay/main` and the step-4 handoff, Open questions `- none` → step-4 PR #23 merged, branch descends from it.
- Vendor references refreshed 2026-10-31 from the [credits page](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers), [pricing](https://platform.claude.com/docs/en/about-claude/pricing) and [Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing) → Haiku 5.5 $0.10/$0.50 and Sonnet 5.5 $2/$10 per MTok, batch exactly half; Agent SDK credit-covered, Claude Code not. Only the credits page was read in full.
- Authorization: developer authorized the exact four-request sequence (Sonnet included) and ran the batch themselves; readings were developer-supplied (no browser tool in this session).
- Request 1, Haiku 5.5 thread turn at 14:06Z → `t3_thread_launch`/`wait`/`read` through the Codex-switched coordinator, then read-only SQL on `orchestration_events` and the credit-directory native transcript: instance `claudeAgent_claude_credit`, tokens 2 uncached / 13,066 read / 8,900 write / 15 out, arithmetic about US$0.00125, transcript only under `~/.claude_credit`.
- Request 2, Sonnet 5.5 turn at 14:08Z → same method: 2 / 13,066 / 8,077 / 15, arithmetic about US$0.02165; Billing & payments balance fell US$99.98 to US$99.95 (dashboard 99.99 to 99.96) by 14:09Z.
- Request 3, title regeneration at 15:05Z → `t3_thread_update` `regenerate_title`, SQL for the metadata events (sequence 3142, 3160) and the `claude -p` transcript under `~/.claude_credit/projects/-tmp-t3code-claude-title-*`: 2 / 1,104 / 3,821 / 374, one response, arithmetic about US$0.00068. T3 persists no usage for this path.
- Request 4, Haiku batch at 16:08Z → developer-run `/tmp/phase0b-step5/batch_probe.py submit` then `retrieve`: batch `msgbatch_01Q2Yhq4YbYw6F69CjJB3Hyd` succeeded in 95 seconds, `service_tier` `batch`, 25 in / 14 out, arithmetic US$0.00000475, exactly half the standard-rate arithmetic. The discount is verified in the rate table and response tier, not measured as a charge.
- No launch or title event caused incidental paid text generation: no title event after 14:00Z before request 3; explicit titles and no `generateTitle` on every launch.
- Max window: the 5-hour session read 1 percent at 16:05Z after 0 percent at 15:07Z. The developer attributes it to this Claude Code session, which runs on the Max subscription (transcript: 37 calls since 14:00Z). It is **not evidence either way** about `Claude Credit` and the spike says so.
- Acceptance tests: `cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts` → 22 passed; `cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts` → 5 passed. No fixture file changed.
- Root check: `vp run check:changed origin/overlay/main` → pass for the docs-only change (format passes; code and dependency checks skip).
- Server: the isolated dev server was started by this thread from the worktree and stopped with `kill -- -13021` after confirming both port owners had this worktree's cwd and group; the live Windows listener on 3774 was not touched.
- Sync inspection (read only): `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` → still only manual [run 40822950375](https://github.com/VeroxAUS/t3code/actions/runs/40822950375). Ticket #4927935 is answered (schedule registered; native delivery may be delayed or dropped); the external-scheduler route is developer-approved. Scheduler selection, credential setup and native-cron disposition remain for the next design round. No setting, secret or dispatch was touched.

## Not done / deferred

- Per-request attribution from the Usage page, and therefore a `go`: awaiting the developer's hourly rows. The funding source of the batch also awaits them.
- Process environment of the spawned credit-instance `claude` was not read; isolation rests on transcript locations.
- Inherited and unresolved, not deferred by the developer: step 3's required unattempted permission probes (Claude plan write enforcement eight, Codex approval-required/plan four, Codex full-access/plan two); native Antigravity plan-mode selection; positive setup-script execution; step 1's live cumulative/reset/steering/interrupted/reasoning/subagent behavior, OpenCode 2 and other ACP live coverage; step 2's concurrent rebuild, process-kill continuation and power-loss durability; step 4's read-only enforcement, provider-turn cwd, remote-only candidate, submodule, relay/client and hostile-setup coverage.

## Decisions made and why

- No new developer decision and no `decisions.md` change. Inconclusive billing is `no-go: inconclusive` per decision 30. The spike states the condition under which the developer could take the `go` decision in the Phase 1 design round; I do not take it.
- The complete handoff is `phase-0b-complete.md`; it carries the review Next line only after the Usage rows are added or the developer defers them.

## Gotchas discovered

- The coordinator thread `8bb7473a-f5c0-4b5e-87b0-17d717454e45` was on the subscription Claude instance (Sonnet), which would have charged the Max window with every wait and read; it was switched to Codex GPT-6.1 Sol high before the schedule. Verify a coordinator's instance in `orchestration_v2_projection_threads` before using the Max window as a signal.
- `/tmp/t3-permission-probes` (the coordinator's project root) vanishes at reboot and blocks sends with "workspace folder no longer exists"; recreate it as an empty Git folder.
- A UI-created thread auto-generates its title on the text-generation setting (`Claude Credit` Haiku), an unplanned paid request; MCP `t3_thread_launch` with an explicit `title` and no `generateTitle` does not. Initial title generation requires a `titleSeed` (`Orchestrator.ts`).
- The Usage page is UTC with hourly buckets and lags a few hours; the Cost page is two-decimal and daily; Billing & payments (promotional credit) and the dashboard (Organization credits) differ by a cent. Record both with UTC times.
- The investigating session's own subscription usage confounds the 5-hour Max window. A future billing probe needs a quiet subscription or a different signal.
- The batch script is outside the repository (`/tmp/phase0b-step5/batch_probe.py`): key from the environment only, `submit` and `retrieve <id>` modes, no polling. Phase 1's digest script should be written and tested separately.

## Developer actions

- Send the Usage-page hourly rows for workspace `t3-overlay`, 2026-10-31 14:00 to 17:00Z, split by model (text or CSV export), and say whether anything else used the key in that window. Keep the live install's `Claude Credit` text generation disabled until you have taken them, then re-enable it if you want it. The next thread commits them to the spike and finishes the verdict.
- Resolve step 3's permission coverage with probes or an explicit written deferral before the Phase 0b review.
- Sync: repeat the `gh run list` command above at the next daily slot and record any real scheduled run. Scheduler selection and any dispatch remain yours.
- Review/merge the step-5 PR when satisfied; the agent never merges.

## Open questions for the developer

- none

Next: Resume docs/overlay/prompts/phase-0b/step-5.md with handoff docs/overlay/handoffs/phase-0b-step-5.md once the Usage rows are supplied — on Claude Sonnet 5.5 High or GPT-6.1 Sol high
