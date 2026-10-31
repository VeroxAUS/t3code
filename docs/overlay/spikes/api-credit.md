# API-credit billing spike (#37)

**Status: paused before any paid request. In-T3 credit routing: `no-go: inconclusive` (gate closed). Batch result: not run.**

Baseline: `8fd48a96846121c5cf8723ee196c4dc24a4ea03e` on `overlay/phase-0b-step-5` (current `origin/overlay/main` is `6169024ecf`, the step-4 merge; the branch adds one inbox-only commit). Preparation date: 2026-10-31. Runtimes: Claude Code 2.1.316 on PATH, 2.1.312 reported by the `Claude Credit` instance cache; Node v26.12.1; vp 1.4.0. No paid Haiku/Sonnet turn, title regeneration or Message Batches request has been made by this step. Nothing below is billing evidence for T3; it is preparation, vendor references and the proposed protocol awaiting developer authorization.

## What this step must decide

Whether turns that T3 launches through the `Claude Credit` instance bill against the Max plan's **Promotional credits** (the Console balance) and not against the Max usage window, and whether a Haiku Message Batches request on the same key does too at the documented discount. Decision 18 states the specific risk: the vendor distinguishes Agent SDK usage (covered) from Claude Code usage (not covered). T3's Claude paths are two different shapes, so each is its own question:

| T3 path                               | Mechanism (source)                                                                                                                                                               | Vendor class it might be billed as |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Thread turns (Haiku, Sonnet)          | `apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts` builds its environment with `makeClaudeEnvironment` (line 11019) and drives the Claude Agent SDK/CLI              | Agent SDK (covered) or Claude Code |
| Title regeneration and other text-gen | `apps/server/src/textGeneration/ClaudeTextGeneration.ts` spawns the `claude` CLI with `-p` and the instance environment (`makeClaudeEnvironment`, line 87; spawn, lines 196-241) | `claude -p` with API key           |
| Batch digest (outside T3)             | Temporary script, `POST /v1/messages/batches` with the same key                                                                                                                  | Claude API (covered)               |

## Vendor references refreshed 2026-10-31

All fetched from the vendor pages named; they are claims by the vendor, not measurements.

- [API credits for Max, Ultra and Team plans](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers): Max includes US$100/month. **Covers** Claude API, Claude Managed Agents, the Claude Agent SDK and the Console playground. **Does not cover** Claude Code or extra usage in the Claude apps. Included credits are spent before purchased credits; they expire at the end of each billing cycle with no rollover; every key and workspace in the linked organization draws on the same balance; a workspace spend limit caps one project. The balance appears under **Promotional credits** on the Console Billing page, with amount and expiry; the Cost page shows spend. When credits cover nothing and the organization holds only them, a Claude Code session is told `Credit balance too low`. Claiming credits "doesn't change your usage limits in Claude or Claude Code".
- [Use the Claude Agent SDK with your Claude plan](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan) and [Monthly API credits](https://support.claude.com/en/articles/17154008-monthly-api-credits-for-max-ultra-and-team-plans) (search-result summary, not fully read): `claude -p` and the Agent SDK run **with an API key from the linked organization** bill as Agent SDK usage and are credit-covered; the same commands signed in with the plan draw on plan limits; runs started by the Claude Code GitHub Action, an IDE extension or the Claude desktop app count as Claude Code usage, which credits do not cover, "even with -p". A June 2026 note says previously announced Agent SDK changes are paused. T3 is none of the named Claude Code surfaces, but that is an inference from the list, not a vendor statement about T3.
- [Pricing](https://platform.claude.com/docs/en/about-claude/pricing) (per million tokens, prompts up to 100,000 tokens for Haiku 5.5):

| Model      | Input | 5m cache write | 1h cache write | Cache read | Output | Batch input | Batch output |
| ---------- | ----: | -------------: | -------------: | ---------: | -----: | ----------: | -----------: |
| Haiku 5.5  | $0.10 |         $0.125 |          $0.20 |      $0.01 |  $0.50 |       $0.05 |        $0.25 |
| Sonnet 5.5 | $2.00 |          $2.50 |          $4.00 |      $0.10 | $10.00 |       $1.00 |        $5.00 |

Haiku 5.5 prompts over 100,000 tokens pay $0.50 input / $2.50 output (prompt length counts cache reads and writes). Sonnet 5.5 cache hits are 0.05x input, hence $0.10. These match `04-router.md:37` for Haiku's standard rate.

- [Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing): "All usage is charged at 50 percent of the standard API prices"; Haiku 5.5 and Sonnet 5.5 are supported; at most 100,000 requests or 256 MB per batch; results are retained 29 days from creation; `processing_status` moves `in_progress` to `ended`; most batches finish within an hour, with a 24-hour window. Discounts stack with prompt caching. The batch rates above are exactly half the standard rates.
- The vendor page does not say whether Batches draw on promotional credits; "Claude API" is covered and the credits page recommends Batches for credit efficiency, which makes eligibility likely but still unmeasured here.

## Isolation checks done without printing credentials

Source and file-presence observations only; no key, token or account detail was read into this transcript.

| Check                                 | Result                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Instance configuration                | `.t3/userdata/settings.json` keys only: instance `claudeAgent_claude_credit`, driver `claudeAgent`, display `Claude Credit`, enabled, `config.homePath` `~/.claude_credit`, one environment entry `ANTHROPIC_API_KEY` marked sensitive with value redacted in settings. Text generation selects this instance, `claude-haiku-5-5`, effort `low`. |
| Key storage                           | The value is a separate 0600 file under `.t3/userdata/secrets/` named for the instance and variable. It was not opened. Its existence and size only.                                                                                                                                                                                             |
| Config-directory separation in source | `provider/Drivers/ClaudeHome.ts` sets `CLAUDE_CONFIG_DIR` from the instance `homePath`; both text generation and `ClaudeAdapterV2` build their process environment from it.                                                                                                                                                                      |
| Credit directory holds no login       | `~/.claude_credit` has no `.credentials.json`; its `.claude.json` has neither an `oauthAccount` nor a `primaryApiKey` entry. The subscription directory `~/.claude` has `.credentials.json` and `~/.claude.json` has `oauthAccount`. Key presence only, values unread.                                                                           |
| Instance health                       | `.t3/caches/claudeAgent_claude_credit.json`: enabled, installed, ready, auth `authenticated`, Haiku 5.5, Sonnet 5.5 and Fable models listed. The cache's `usageLimits` block is the plan-window reader for this instance; its `windows` contents were not examined. `authenticated` here does not show which billing source a request uses.      |
| Live T3 install untouched             | The listener on 3774 belongs to a process whose cwd is on the Windows side; it is the developer's live install and was not touched. No server for this worktree is running, and no probe has opened `~/.t3/userdata`.                                                                                                                            |
| Prior evidence                        | Decision 15 records one title regeneration moving the balance $100.00 to $99.99 (rounded) and leaving the Max strip unchanged. That is one rounded observation of the text-generation path, not per-request attribution, and says nothing about thread turns or Batches.                                                                         |

Not verified: that the subscription instance (`claudeAgent`) cannot see `ANTHROPIC_API_KEY` from the server's base environment, and that the process environment of an actual spawned credit-instance `claude` contains the key. Both should be read from the coordinator's launched turns' provider-session records, or the claim withheld.

## Free baseline readings (developer-supplied, about 2026-10-31T09:40Z, 20:40 AEDT)

No request had been made by this step. Account identifiers are omitted.

| Source                               | Reading                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Console Billing, Promotional credits | US$99.98 available. Decision 15 recorded US$99.99 after one title regeneration on 2026-10-29, so earlier use already moved it.                    |
| claude.ai Max usage                  | Session 2 percent, weekly 0 percent.                                                                                                              |
| Console Cost page                    | Two decimals. Month total US$0.01; today US$0.00.                                                                                                 |
| Console Usage page                   | Hourly buckets exist for 2026-10-29: total tokens in 113,979, out 9,094. Today shows "No data. Recent usage can take a few hours to appear here." |

Second credit reading, about 2026-10-31T13:25Z: Billing & payments shows US$99.98 promotional credit available (primary figure, same wording as the first reading); the console dashboard (`platform.claude.com/dashboard`) shows US$99.99 "Organization credits" (secondary). The pages round or refresh differently by one cent, so a one-cent change on either page is not attribution evidence. Every later reading records both pages with UTC times and uses the same two pages. The isolated T3's cached Max window (subscription instance, checked 2026-10-31T13:16:46Z) shows session 2 percent resetting at 14:00:00Z and weekly 0 percent, matching the manual reading; after 14:00Z the session counter should restart near 0 percent.

Pre-probe baseline at 14:00Z (after the session reset), developer-supplied: Billing & payments US$99.98 promotional credit available; dashboard US$99.99 Organization credits; Max session 0 percent, weekly 0 percent. The coordinator thread runs on Codex GPT-6.1 Sol high (verified from its 13:28Z turn on instance `codex`); its earlier 13:17Z `t3_project_create` turn ran on the subscription Claude instance (Sonnet 5.5 medium) inside the previous session window.

Consequences: the Usage page can attribute by hour, but today's requests will not appear for hours, and the Cost page is two-decimal and daily. The 2026-10-29 token total at Haiku 5.5 rates is at most about US$0.016 (113,979 x $0.10 + 9,094 x $0.50 per million, ignoring cache pricing), consistent with the US$0.01 shown, which suggests the Usage page and Cost page agree to rounding but is not a per-request check. The balance fell by US$0.02 against a US$0.01 monthly cost, so cent rounding differs between the two pages.

## Measurement problem and design of the protocol

The Console balance is a cent-rounded figure. Public cents cannot resolve most single requests here: a Haiku turn with a Claude Code system prompt cost about US$0.003 on the subscription fixture `live-claude-1` (26,617 input of which 13,674 cache write; see `token-semantics.md`), which is under a cent. Rounded balances, delayed reporting or concurrent usage cannot prove each request's billing source. So attribution rests on evidence of different kinds, each recorded separately and never merged into one number:

1. **Max-window readings** (claude.ai Settings, Usage): session and weekly percent before and after each request. A one-percent resolution can only show that the window **did move**, which would be a hard negative; no movement is consistent with credit billing but is not proof for a request this small.
2. **Console Cost and Usage pages**, filtered to workspace `t3-overlay` and the one key: per-day cost and per-model token counts. The Usage page's model and key breakdown gives attribution by model and time, independent of the cent-rounded balance, provided requests are spaced and distinguishable.
3. **Promotional credits balance** before and after the whole run, as corroboration only.
4. **Per-request records on the T3 side**: thread, run, provider-turn IDs, `turnTokenUsage`, model, effort, instance ID, timestamp (UTC), and for the batch the batch ID and the API-reported token usage. API request IDs are recorded from the CLI/SDK result where exposed; none are secrets.

Distinguishability by design: the thread turns use different models (Haiku, then Sonnet). Title regeneration is also Haiku, so it is separated from the Haiku turn by an order and a reading between them, and its request is the only one carrying a distinctive prompt length. The batch is Haiku at the batch rate in its own request with a known token count. If the Usage page cannot separate two same-model requests, they are reported as overlapping and the result stays inconclusive; the protocol is not repeated to force a visible change.

## Proposed probe sequence (not run; each paid step needs explicit developer authorization)

Estimated cost at the rates above, from the fixture's token shape; an upper bound for a tiny turn with a Claude Code system prompt of about 27k tokens and no tools:

| #   | Request                                                                                                                                | Model      | Expected billable tokens (order of magnitude)         | Expected API-equivalent  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------- | ------------------------ |
| 0   | Free readings: Promotional credits, Cost and Usage pages, Max windows                                                                  | none       | none                                                  | US$0                     |
| 1   | One thread turn on `Claude Credit`, prompt `Reply CREDIT_PROBE_OK only; use no tools or subagents.`, no effort override above default  | Haiku 5.5  | about 27k input (mostly cache write), under 50 output | about US$0.003-0.01      |
| 2   | One thread turn, same prompt, fresh thread                                                                                             | Sonnet 5.5 | about 27k input (mostly cache write), under 50 output | about US$0.06-0.12       |
| 3   | One title regeneration on a throwaway thread whose title was set manually, via the configured text-generation setting (Haiku 5.5, low) | Haiku 5.5  | a few thousand input, under 30 output                 | about US$0.001-0.005     |
| 4   | One Haiku Message Batches request, `custom_id` `overlay-credit-probe-1`, prompt `Reply BATCH_PROBE_OK only.`, `max_tokens` 16          | Haiku 5.5  | under 50 input, under 16 output                       | under US$0.0001 at batch |

Authorized by the developer on 2026-10-31 (the sequence above, Sonnet 5.5 included). The Usage page reports in UTC with hourly buckets and a lag of "a few hours", so the schedule is by UTC clock hour, one Haiku request per hour; the Sonnet turn is separable by model filter and shares the first hour. Hour 1: Haiku turn, then Sonnet turn. Hour 2: title regeneration. Hour 3: batch, run by the developer from their own terminal. Each request starts in the first half of its hour. Immediate readings after each request are the Max percentages and the credit balance only; attribution comes from the Usage page's hourly rows for workspace `t3-overlay` by model, read after the lag. Total ceiling about US$0.15 against US$100 promotional credits and a US$90 workspace limit; no purchased credit or payment method is involved. At most one request of each kind; no retries after a result is visible, no escalation if nothing moves, and the sequence stops at the first billing error. The developer disables the `Claude Credit` text-generation setting in their live T3 install for the window, so no other traffic uses the key; any other use of the key is recorded as a limit. Each T3 thread uses a disposable project under `/tmp` with a root workspace, launched through `t3_thread_launch` with an explicit title and no `generateTitle`, so no title generation is triggered by the launches themselves (`Orchestrator.ts` generates an initial title only when a `titleSeed` is set).

Mechanics, constrained by the session: this CLI session exposes no T3 launch tools (as in steps 1-4), so steps 1-3 go through the developer's isolated coordinator, relayed in one labelled block. The batch script reads the key in-process from the instance's secret file, which holds one value, and never prints it; the developer can instead run the script with the key in their own environment through `!`. Either way the transcript and committed evidence keep no key, no authorization header and no account identifiers.

## Probe log

All times UTC, 2026-10-31. Readings are developer-supplied: Billing & payments promotional credit (primary) / dashboard Organization credits (secondary) / Max session / Max weekly.

### Request 1: Haiku 5.5 thread turn (instance `claudeAgent_claude_credit`)

- Launch by the Codex coordinator (`t3_thread_launch`, explicit title, root workspace, `/tmp/t3-credit-probe`, no tools): thread `mcp:49264f54-139b-4b79-9146-411b8d067c8f`, run `run:thread:mcp%3A49264f54-139b-4b79-9146-411b8d067c8f:ordinal:1`, requested 14:06:24.975Z, started 14:06:25.077Z, completed 14:06:28.215Z. Response text `CREDIT_PROBE_OK`.
- Persisted provider turn (database, read-only): complete, `main_agent`, input 21,968, cache read 13,066, cache write 8,900, output 15, reasoning 0, `hasSubagents` false. Provider thread instance `claudeAgent_claude_credit`, driver `claudeAgent`.
- Native transcript, in the **credit** config directory `~/.claude_credit/projects/-tmp-t3-credit-probe/`: model `claude-haiku-5-5`, `service_tier` `standard`, uncached input 2, cache read 13,066, cache write 8,900 all in the 5-minute bucket (1-hour bucket 0), output 15. The same session left no transcript under `~/.claude/projects` for this folder. This shows the turn ran under the credit configuration directory, not the subscription login.
- No title-related event exists after 14:00Z, so the launch triggered no title generation.
- API-equivalent arithmetic (not a measured charge): 2 x $0.10 + 13,066 x $0.01 + 8,900 x $0.125 + 15 x $0.50 per million = about US$0.00125. With a 1-hour write rate it would be about US$0.00192, but the transcript reports a 5-minute write.
- Readings at 14:00Z baseline and at 14:07Z after: US$99.98 / US$99.99 / 0 / 0 and US$99.98 / US$99.99 / 0 / 0. No movement, as expected at this size; this is neither evidence for nor against credit billing.

### Request 2: Sonnet 5.5 thread turn (instance `claudeAgent_claude_credit`)

- Launch by the Codex coordinator: thread `mcp:9fb20c80-2c08-4efb-896e-90a9b863cb2a`, run ordinal 1, requested 14:08:43.415Z, started 14:08:43.465Z, completed 14:08:46.050Z, reply `CREDIT_PROBE_OK`.
- Persisted turn and native transcript (credit config directory) agree: model `claude-sonnet-5-5`, `standard` tier, uncached input 2, cache read 13,066, cache write 8,077 (all 5-minute bucket), output 15. No title-related event after 14:00Z.
- API-equivalent arithmetic (not a measured charge): 2 x $2 + 13,066 x $0.10 + 8,077 x $2.50 + 15 x $10 per million = about US$0.02165. Cumulative with request 1 since the 14:00Z baseline: about US$0.02290.
- Readings at 14:09Z: Billing & payments US$99.95 (baseline 99.98, change -0.03); dashboard US$99.96 (baseline 99.99, change -0.03); Max session 0 percent; weekly 0 percent.
- Reading: the credit balance fell on both pages while the Max window stayed at 0 percent, after requests that ran only under the credit instance and with the live install's `Claude Credit` text generation disabled. A displayed fall of 3 cents against an arithmetic 2.29 cents is within one cent of display quantization (a floored or rounded cent display can turn 2.29 cents into 2 or 3 displayed cents depending on the starting fraction), so it neither confirms the arithmetic nor contradicts it. The Max window not moving at this size is a weak negative on its own. Attribution to request 2 rather than request 1 is not claimed: the 14:07Z reading after request 1 alone showed no change, and the later fall is cumulative. Hourly Usage-page rows are still needed to separate the two by model.

## Results

| Item                                  | Result                                 |
| ------------------------------------- | -------------------------------------- |
| Free readings before any paid request | not taken in this session (see limits) |
| Haiku 5.5 thread turn                 | not run                                |
| Sonnet 5.5 thread turn                | not run                                |
| Title regeneration                    | not run                                |
| Haiku Message Batches request         | not run                                |
| Batch discount versus same-model rate | documented 50 percent, not measured    |
| Agent SDK versus Claude Code class    | unresolved; vendor text only           |
| Max-window effect                     | not measured                           |

**In-T3 credit routing: `no-go: inconclusive`.** Under decision 30 the gate stays closed until the billing source is established. Phases 1 to 3 credit steps stay out of scope. This is not a finding that credit billing fails, and no probe has been repeated or escalated. The external digest's batch evidence is also pending and independent of this verdict.

## Limits and coverage gaps

- No browser or computer-use tool exists in this session, so the developer's browser authorization could not be exercised; billing-page readings must come from the developer or a session with such a tool.
- No T3 launch tools here; probe turns depend on the isolated coordinator.
- Cent-rounded balances; unknown dashboard latency; the Usage page's granularity is unmeasured.
- Vendor eligibility text for `claude -p` came from search summaries of the support articles; only the Platform credits page was read in full.
- Tool-using turns, long contexts, Fable, subagents and non-Claude instances are out of scope.
- Token fixtures from the paid turns (step 1 fixtures) would be captured only if the turns run.

## Reproduction (reads only)

```sh
cd /home/verox/src/t3code-phase-0
git rev-parse HEAD
python3 -I - <<'EOF'
import json, os
s = json.load(open('.t3/userdata/settings.json'))
i = s['providerInstances']['claudeAgent_claude_credit']
print(i['driver'], i['displayName'], i['enabled'], i['config'], [e['name'] for e in i['environment']])
print(s['textGenerationModelSelection'])
for d in ('~/.claude_credit', '~/.claude'):
    print(d, os.path.exists(os.path.expanduser(d + '/.credentials.json')))
EOF
```
