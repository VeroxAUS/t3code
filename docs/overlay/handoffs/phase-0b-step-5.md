# Handoff · Phase 0b · Step 5 · 2026-10-31 · written by Claude Sonnet 5.5 (WIP, paused at paid-probe authorization)

commit: see the branch head; this handoff is committed with the work it describes
supersedes: docs/overlay/handoffs/phase-0b-step-4.md

## Where we are

Branch `overlay/phase-0b-step-5` · worktree `/home/verox/src/t3code-phase-0` · based on `origin/overlay/main` `6169024ecf` plus one inbox-only commit (`8fd48a9684`). **Step 5 is not complete.** Preparation and the non-billing deliverables are written; no paid request has been made, so the billing result is `no-go: inconclusive` with the gate closed and the batch result is not run. Phase 0b is not complete and nothing here declares it passed. No PR is open: the launch line authorizes one, but it is held until the paid-probe boundary is resolved so the PR does not present a pending spike as delivered. Never merge.

## Done, verified

- Gate: `git fetch origin`, `git rev-parse HEAD origin/overlay/main` and the step-4 handoff, Open questions `- none` → step-4 PR #23 merged, branch descends from it, no unanswered predecessor question.
- Vendor references refreshed 2026-10-31 from the [credits page](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers), [pricing](https://platform.claude.com/docs/en/about-claude/pricing) and [Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing) → Haiku 5.5 $0.10/$0.50, Sonnet 5.5 $2/$10 per MTok; batch rates exactly half ($0.05/$0.25, $1/$5); Agent SDK and Claude API credit-covered, Claude Code not; Batches not explicitly named. Only the credits page was read in full; support-article wording is from search summaries.
- Isolation preparation without opening any secret: settings key inspection, file presence, `ClaudeHome.ts`/`ClaudeTextGeneration.ts`/`ClaudeAdapterV2.ts` source → instance `claudeAgent_claude_credit` uses `CLAUDE_CONFIG_DIR=~/.claude_credit`, the key is a separate 0600 file, the credit directory has no login, the subscription directory does. Details and unverified items are in the spike.
- Deliverables written: `docs/overlay/spikes/api-credit.md` (protocol, exact proposed probe sequence, result table all "not run", verdict) and `docs/overlay/handoffs/phase-0b-complete.md` (WIP draft: exit criteria, assumption-disposition table, gaps, #37 checklist, sync carryover).
- Acceptance tests: `cd packages/routing && ../../node_modules/.bin/vp test run src/costs.test.ts` → 22 passed; `cd apps/server && ../../node_modules/.bin/vp test run src/routing/ReplayDurability.spike.test.ts` → 5 passed. No fixture file changed.
- Sync inspection (read only): `gh run list --repo VeroxAUS/t3code --workflow overlay-sync.yml --json databaseId,event,conclusion,createdAt,url` → still only manual [run 40822950375](https://github.com/VeroxAUS/t3code/actions/runs/40822950375), 2026-10-29T05:21:44Z. Ticket #4927935 is answered: schedule registered, native delivery may be delayed or dropped; the external-scheduler route is developer-approved. No scheduled run exists. Scheduler choice, credential setup and native-cron disposition belong to the next design round. No repository setting, secret or dispatch was touched, and no scheduler configured.
- Root check: `vp run check:changed origin/overlay/main` → pass for the four-file docs change after `vp fmt` on the three new files (format passes; code and dependency checks skip as no code changed).

## Not done / deferred

- All four paid probes (Haiku turn, Sonnet turn, title regeneration, Haiku batch) and the free readings: the developer's browser authorization could not be used because this session has no browser or computer-use tool, and paid requests require explicit authorization of the exact sequence, which is proposed in the spike and in this thread's final message.
- No T3 launch tools in this session; the thread turns need the isolated coordinator and a dev server for this worktree, which is not running (the listener on port 3774 is the developer's live Windows install and was not touched).
- Whether `claude -p` text generation and Agent SDK thread turns bill as credit-covered usage, the Max-window effect, per-request attribution and the batch discount: unmeasured. Decision 15's single rounded title observation is the only prior evidence.
- Inherited and unresolved, not deferred by the developer: step 3's required unattempted permission probes (Claude plan write enforcement eight, Codex approval-required/plan four, Codex full-access/plan two); native Antigravity plan-mode selection; positive setup-script execution; step 1's live cumulative/reset/steering/interrupted/reasoning/subagent behavior, OpenCode 2 and other ACP live coverage; step 2's concurrent rebuild, process-kill continuation and power-loss durability; step 4's read-only enforcement, provider-turn cwd, remote-only candidate, submodule, relay/client and hostile-setup coverage. These do not block step 5 and remain open for the Phase 0b review.

## Decisions made and why

- No new developer decision and no `decisions.md` change. Inconclusive billing is recorded as `no-go: inconclusive` per decision 30; a paused protocol is not a billing result.
- The complete handoff is written now as a labelled WIP so the assumption-disposition table and gap list are not lost, but its Next line is a resume, not the review launch.

## Gotchas discovered

- The credits page lists Claude Code as not covered and Agent SDK as covered; T3's text generation spawns `claude -p` and its thread turns use the Claude adapter. Which class each bills as is exactly the open question; do not assume either.
- Sandbox: the primary working directory shifted during the session; use absolute paths. The earlier scratchpad directory went away, so nothing was staged under `/tmp`.
- The Claude CLI on PATH is 2.1.316 while the instances' cache reports 2.1.312; record the version the server actually spawns in the probe turns.
- A `claude_credit` string appears in five events of this worktree's isolated database from 2026-10-30, before the instance existed here; they were not analyzed and must not be used as billing evidence.

## Developer actions

- Authorize, amend or refuse the exact probe sequence in `docs/overlay/spikes/api-credit.md` ("Proposed probe sequence"). No paid request happens before an explicit yes.
- Supply the free readings (Promotional credits, Console Cost and Usage pages filtered to workspace `t3-overlay`, claude.ai Max session and weekly percent) before and after, or run this step in a session that has a browser tool and say so. Keep screenshots free of account names and emails.
- Start the isolated server for the thread turns, if authorized: `setsid vp run dev --no-seed > /tmp/dev.log 2>&1 &` from this worktree, then relay the coordinator block (to be written after authorization).
- Sync: at the next daily slot repeat the `gh run list` command above and record any real scheduled run. Scheduler selection and any dispatch remain yours.
- Resolve the step 3 permission coverage with probes or an explicit written deferral before the Phase 0b review.

## Open questions for the developer

- Do you authorize the four-request probe sequence in the spike, with Sonnet 5.5 included (ceiling about US$0.15)?
  Recommended: yes, as written — a single request of each kind is the minimum that can attribute billing, and the ceiling is under 0.2 percent of the credit.
- Should the batch script read the key in-process from the instance secret file, or will you run it with the key in your own environment?
  Recommended: you run it through `!` with your environment — the key then never enters my process or transcript.
- Will you supply the readings by hand, or start a session with a browser tool for this step?
  Recommended: by hand, as two short before/after text snippets — it needs no browser authorization and no screenshots.

Next: Resume docs/overlay/prompts/phase-0b/step-5.md with handoff docs/overlay/handoffs/phase-0b-step-5.md after answering the open questions — on Claude Sonnet 5.5 High or GPT-6.1 Sol high
