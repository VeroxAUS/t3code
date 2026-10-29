# 10 · Execution plan: models, efforts, handoffs, review round, working style

## 1. Model and effort per phase

Rules behind the table: plan on a frontier model, execute on a standard model (High effort for Effect/event-sourcing code, Medium for pure functions and UI), review on the **other** vendor at a tier at least equal to the executor. Fable 5.1 is reserved; on Claude Max it draws from its own weekly Fable window, so it does not eat the main window. Claude Code effort labels: Low / Medium / High / Extra High / Max. Codex: minimal / low / medium / high / xhigh.

| Phase                          | Plan thread (design round; edits docs only)                                                                 | Execute thread                                                                                                                                                                             | Review thread (other vendor)                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 0 Fork hygiene                 | none; the step prompts are written                                                                          | Claude: Sonnet 5.5 Medium, High for steps 2, 4, 6 and 8 · Codex: GPT-6.1 Sol medium, high for the same steps                                                                               | GPT-6.1 Sol low, or Opus 5.5 Low if Codex wrote it                                                                        |
| 0b Contract spikes             | Opus 5.5 High · Astra high                                                                                  | Sonnet 5.5 High · Sol high (investigations with evidence, not features)                                                                                                                    | Astra high · Opus 5.5 High                                                                                                |
| 1 Ledger + pressure            | Opus 5.5 High · GPT-6 Astra high                                                                            | Sonnet 5.5 High · GPT-6.1 Sol high                                                                                                                                                         | GPT-6 Astra high if Claude wrote it; Opus 5.5 High if Codex wrote it                                                      |
| 2 Router shadow                | Opus 5.5 Medium · Astra medium                                                                              | `packages/routing`: Sonnet 5.5 Medium · Sol medium. Hooks in `OrchestratorMcpService` / `ThreadLaunchService`: Opus 5.5 Medium · Astra medium. Settings UI: Sonnet 5.5 Medium · Sol medium | Astra high · Opus 5.5 High                                                                                                |
| 3 Enforce + budgets + adapters | Opus 5.5 High · Astra high                                                                                  | Adapter env patches: Opus 5.5 High · Astra high (files are 8k+ lines; grep the launch-option builder, read only that). BudgetGuard, exhaustion prompt, UI: Sonnet 5.5 High · Sol high      | Fable 5.1 High on the adapter + guard diff only (privilege and cache sensitive); otherwise Astra xhigh                    |
| 4 Delegation engine            | Opus 5.5 High · Astra high. Role briefs and the injected instruction text are prompt writing: Opus 5.5 High | Templates, witness, caps: Sonnet 5.5 High · Sol high. Merge queue: Opus 5.5 Medium · Astra medium                                                                                          | Astra high · Opus 5.5 High. Evals run on Haiku 5.5, GPT-6 Luna and Sonnet 5.5, the models that will actually be routed to |
| 5 Team view                    | Opus 5.5 High design-system pass (reads `12-ui-ux.md` and the theme tokens) · Astra high                    | Sonnet 5.5 High · Sol high                                                                                                                                                                 | Opus 5.5 Medium visual QA through the preview tools · Astra medium                                                        |
| 6 Automations + learning       | Sonnet 5.5 Medium · Sol medium                                                                              | same                                                                                                                                                                                       | Sol low                                                                                                                   |
| Final review                   | —                                                                                                           | —                                                                                                                                                                                          | Fable 5.1 Extra High, scoped briefs (section 4)                                                                           |

Pick the vendor by whichever window is green at the time; the table gives both sides so you never wait on a reset. Never use Extra High or Max for execution: the measured gain is small and the token cost is large.

## 2. Handoff chain (what makes the plan actually happen)

A phase is a fixed chain of threads. Each thread is launched with one line naming a reviewed prompt file and the previous handoff; the prompt carries the work, the handoff carries state, and every prompt opens with a gate that checks that handoff. No link can be skipped without editing a file the reviewer reads.

```
design round -> step 1 -> step 2 ... -> phase complete -> review -> fix (if findings) -> re-review -> ... -> phase passed
```

| Link           | Thread                                                                  | Mode                                       | Writes                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design round   | frontier model (the "plan" column in §1), `prompts/_design-round.md`    | default mode, edits only `docs/overlay/**` | updated phase doc; a `decisions.md` entry; this phase's step prompts under `prompts/phase-N/`; `handoffs/phase-N-design.md` whose Next line launches step 1    |
| Step k         | execute model, `prompts/phase-N/step-k.md`                              | per step                                   | the PR; `handoffs/phase-N-step-k.md` whose Next line launches step k+1                                                                                         |
| Phase complete | the last step's thread                                                  | —                                          | `handoffs/phase-N-complete.md`: each exit criterion with the command that proves it, the promoted-ideas checklist, Next line = `_review.md` for phase N        |
| Review         | other-vendor reviewer (the "review" column in §1), `prompts/_review.md` | default mode; edits only `DOCS/handoffs/`  | `handoffs/phase-N-review.md` with `status: passed` or `status: findings`, the findings, Next line = `_fix.md`, or `_design-round.md` for phase N+1 when passed |
| Fix            | execute model, `prompts/_fix.md`                                        | default                                    | the PR; `handoffs/phase-N-fix.md`, Next line = `_review.md` again with the fix handoff; only a review can end a phase                                          |
| Re-review      | same reviewer, one effort level lower, `prompts/_review.md`             | default mode; edits only `DOCS/handoffs/`  | `handoffs/phase-N-review-2.md`, `status: passed`, or back to fix                                                                                               |

Rules

- **One numbered step per thread.** A thread may take a second step only when the first touched under about fifty lines. This replaces the earlier "60% context" rule, which an agent cannot observe reliably.
- **Every prompt opens with a gate** (in `prompts/_preamble.md`): open the handoff named in the launch line; if it is missing, or its kind or `status` is not what that prompt accepts (the table in the preamble), stop and tell the developer. Launch lines always name the exact file, so no thread guesses which handoff is "newest"; every handoff names its predecessor in `supersedes:` and the commit it describes in `commit:`.
- **Every step prompt names its model and effort** ("Run on") from the table in §1, and the handoff's Next line echoes it, so the recommendation is carried, not remembered.
- **"Done, verified" lines carry the command and its one-line result.** A reviewer who finds a Done line without a command marks the phase `findings`.
- **The review brief always checks:** the phase's exit criteria in `07-roadmap.md`, that phase's promoted-ideas rows, `CHANGES.md` against the `// overlay:` markers, tests at one layer for new logic, repo rules (no sleeps or polling in tests, no repo-wide checks, decoding defaults on settings), and the eval runs the repo requires for instruction-text changes.
- **`scripts/overlay-check.ts` (Phase 0 step 6) runs on every PR and in the nightly sync.** It fails when the PR's changed upstream paths (anything outside the overlay-owned paths) and the manifest `docs/overlay/CHANGES.md` disagree in either direction, when a PR that changes upstream paths carries no file under `docs/overlay/handoffs/` (the tag sync writes `sync-<tag>.md`, so sync PRs pass), or when `vp test run packages/routing` fails. It is a required check on `overlay/main`.
- **Gates that need time, not code.** Phase 3 opens only when `decisions.md` holds a developer-signed line "shadow report reviewed, matrix tuned", the decision log holds at least 14 days **and** 200 decisions with every role represented, and the Phase 3 canary in `07-roadmap.md` has passed. The final review (`prompts/_final-review.md`) opens only when the newest `phase-N-review*.md` of every phase has `status: passed` and `decisions.md` holds "overlay build in daily use since <date>" at least two weeks old.

Handoff template (every link; state only, no prompt text)

```
# Handoff · Phase N · <link> · YYYY-MM-DD · written by <model/effort>
commit: <SHA of the last commit this handoff describes>
supersedes: <handoff named in the launch line, or none>
status: passed | findings          (review links only)

## Where we are
branch · worktree path · last commit · PR link · CI state

## Done, verified
- <item> — proof: <command> -> <one-line result>

## Not done / deferred
- <item> — why

## Decisions made and why
- <decision> (also appended to docs/overlay/decisions.md)

## Gotchas discovered
- <thing the next thread must know>

## Open questions for the developer
- <question> — what changes depending on the answer

## Next
Run DOCS/prompts/<file> [for phase N] with handoff DOCS/handoffs/<this file> — on <model and effort>
```

## 3. Prompts: written once, reviewed once, launched with one line

Prompts live in `DOCS/prompts/` (`DOCS` is `docs/overlay/` once Phase 0 step 5 has run, `docs/multi-agent-harness/` before):

- `_preamble.md`: every thread reads it first. The gate, the read order, the repo rules CI enforces, branch and PR naming, how to finish.
- `_design-round.md`, `_review.md`, `_fix.md`: generic, parameterised by phase number.
- `phase-0/step-0.md` to `step-6.md`: written now, because Phase 0 is plumbing. Later phases' step prompts are written by that phase's design round in a markdown-only PR you approve, because they depend on what earlier phases find (the Windows toolchain, the real package layout, what shadow mode shows, upstream drift).

A thread is started with one line in the composer:

```
Run docs/multi-agent-harness/prompts/phase-0/step-0.md with handoff none
Run docs/overlay/prompts/phase-1/step-3.md with handoff docs/overlay/handoffs/phase-1-step-2.md
Run docs/overlay/prompts/_review.md for phase 1 with handoff docs/overlay/handoffs/phase-1-complete.md
```

The prompt carries the work; the handoff carries state. Both are in the repo, diffable, and reviewed before they run. Phase order is 0, 0b, 1, 2, 3, 4, 5, 6; `_review.md` hands off to the next phase in that order. Step prompts stay under about fifty lines and point at doc sections instead of restating them, so the design docs remain the single spec.

Developer pre-step, before any thread: copy `docs/multi-agent-harness/` (including `prompts/` and `mockups/`) into the fork's checkout at the same path, on a branch `overlay/main` created from `main`, and commit it. Without this, `DOCS` resolves to nothing and no handoff can be committed. The developer start steps (section 8) list the exact commands, including the WSL2 setup.

Phase 0 launch, on Claude Sonnet 5.5 Medium (or GPT-6.1 Sol medium), in a new worktree of the fork on `overlay/main`:

```
Run docs/multi-agent-harness/prompts/phase-0/step-0.md with handoff none
```

The step prompts name the model and effort for each following step; steps 2, 4, 6 and 8 run at High because they touch update code, the settings schema, CI and the release workflow. `overlay/main` is based on the upstream `v0.1.3` tag; line numbers in the hook table were measured at `125b619`, one day past that tag, so the markers and the grep rule govern.

## 4. Final review round (Fable 5.1 Extra High)

Agreed, with four conditions; without them the round finds style issues instead of the bugs you care about.

1. **Per-phase reviews first.** Each phase already ends with an other-vendor review. Fable gets the residual, not the whole tree.
2. **Scoped briefs, one thread each**, launched by `prompts/_final-review.md`, in default mode editing only `DOCS/handoffs/`, each naming files and the invariants to check:
   - Privilege: can any routing or budget path let a child run with broader runtime or interaction mode than its parent? (the interaction-mode clamp (`interactionModeRank` in `OrchestratorMcpService.ts`, or `apps/server/src/mcp/delegatedTaskModes.ts` where present; grep), `DispatchModeLimit`, the hook in `resolveTarget`, `ThreadLaunchService`.)
   - Event sourcing: does `CostLedger` replay idempotently after a crash mid-turn? Does it double-count cumulative usage? Does the decision log survive restart?
   - Budget bypass: `create_threads`, `t3_thread_launch`, scheduled tasks, native subagents, remote delegation. Which paths skip `assertWithinBudget`?
   - Cache safety: does any path change a running thread's model or top-level effort? Are native-subagent env defaults set only at session start?
   - Settings and migration: an upstream build reading an overlay `settings.json` and the reverse; a `statev2.sqlite` with overlay tables opened by upstream.
   - Pressure correctness: window mapping per provider against the fixtures in `codexUsageLimits.ts` and `claudeUsageLimits.ts`; stale and unavailable handling; hysteresis.
   - UI: no new streaming firehose; team view render budget; keyboard paths and reverse states (AGENTS.md "hit every surface").
   - Windows paths and PowerShell in anything that shells out (merge queue, witness).
3. **Findings, not fixes.** Fable writes `{file, line, severity, claim, evidence, suggested fix}`. Sonnet 5.5 High or Opus 5.5 Medium applies fixes; Fable at High re-reviews only the fix diff.
4. **Then dogfood.** Two weeks of the harness building itself with routing in shadow, then enforce, before you trust it on another repo. A review lowers the bug count; shadow mode and dogfooding find the bugs that depend on real provider behaviour.

Extra High is the right level. Max buys little over it on review work and runs much longer per turn.

## 5. Gotchas for implementing threads (all phases)

- Tooling is `vp` (vite-plus), not bare `pnpm` or `npx tsc`; typecheck is tsc-rs. Node 26 and pnpm 12 are pinned.
- Worktrees keep their state in a gitignored `.t3` under the worktree; dev ports derive from the worktree path; the first `vp run dev` seeds a copy of the real database when it is under 500 MiB.
- Tests: `it.effect` runs on a TestClock; no sleeps, polling or wall-clock; drain the effect worker (`OrchestrationEffectWorkerV2`, defined in `apps/server/src/orchestration-v2/EffectWorker.ts`). Lint rules enforce this and fail CI.
- Side effects run after the command commits. A reactor that reads a projection in the same tick as the command sees the old state.
- `OrchestratorMcpService.ts` is ~3,100 lines and changes often upstream. The hook must be one imported call (`applyTargetPolicy(...)` from the overlay), never inline logic, so the patch stays a line.
- Codex truncates injected instruction entries over 4,000 bytes.
- Provider adapters are enormous (`ClaudeAdapterV2.ts` ~11k lines, `CodexAdapterV2.ts` ~7.7k). Grep for the launch-option builder and MCP injection, read only that region.
- Effort option ids come from the model manifest's `optionDescriptors`; never hardcode `"xhigh"`.
- Every settings field needs a decoding default or old `settings.json` files fail to load.
- Real provider turns cost window share. Use the `Replay (dev)` provider for UI work and Haiku / Luna for real-provider tests.
- Development happens inside WSL2, with the repo in the WSL filesystem (not `/mnt/c`), because native Windows is unsupported upstream. The provider CLIs (`claude`, `codex`) are installed and logged in inside WSL2 as well. Shell-outs use `@t3tools/shared/shell` (`resolveSpawnCommand`) so a later native Windows build still works.

## 6. Working style: rounds, not a one-shot spec

The overlay is on the order of 8–15k lines across the whole roadmap, not a 500k codebase, and the process is built for changing your mind:

- **Design round before each phase.** A frontier-model thread allowed to edit only `docs/overlay/**` walks the phase's doc with you; you argue; it edits the doc (not code), folds that phase's promoted ideas into numbered steps, writes that phase's step prompts under `prompts/phase-N/` for you to approve in the same PR, and appends to `decisions.md`. Thirty minutes, one PR of markdown. It is a link in the chain (§2), so it cannot be skipped by accident.
- **Steps are small.** One PR per numbered step, typically a few hundred lines. You review at that grain, or ask the review thread to.
- **Handoffs are the conversation.** Open questions in handoff files are where you steer; answer inline and the next thread picks it up. T3's steer and queue let you redirect a running thread mid-step.
- **Forks for alternatives.** Fork a thread at a decision point and let two designs run; merge-back brings the winner's delta home.
- **Shadow mode is a feedback loop.** The router runs two weeks without acting; you read what it would have done and change the matrix before it touches anything.
- **Docs are living.** `docs/overlay/` is edited in the same PRs as the code it describes; the hook table's files and markers are re-verified each phase; `decisions.md` records what changed and why.
- **Dogfooding from Phase 2.** The harness builds the harness; every annoyance becomes a backlog item in the same repo. The final-review gate requires a `decisions.md` line "overlay build in daily use since <date>" at least two weeks old, so this is checked, not hoped for.

## 7. Enforcement map

Every promise in this document set, where it is stated, and the mechanism that makes it happen. "Prompt-level" means only an instruction enforces it; those rows name the backstop.

| Promise                                             | Stated in     | Mechanism                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Other-vendor review after every phase               | 10 §1         | Review is a link in the chain; the next phase's design-round prompt opens with a gate on `phase-N-review.md` having `status: passed`                                                                                                                                                                                             |
| Design round before every phase                     | 10 §6         | Link in the chain; the review handoff's Next line launches `_design-round.md`                                                                                                                                                                                                                                                    |
| One PR per step, a handoff per PR                   | 10 §2         | `overlay-check.yml` fails a PR that touches `apps/**` or `packages/**` without a handoff file                                                                                                                                                                                                                                    |
| Every upstream change is inventoried                | 01, 02        | `scripts/overlay-check.ts` reconciles the PR's changed upstream paths with the manifest `CHANGES.md` in both directions on every PR and nightly; markers are advisory where comments are possible                                                                                                                                |
| Promoted ideas get built                            | 07            | Design round folds them into numbered steps; phase-complete handoff has a checklist; review brief checks each row                                                                                                                                                                                                                |
| Exit criteria are met                               | 07            | Review brief re-runs every Done-line command and checks each criterion                                                                                                                                                                                                                                                           |
| Shadow evidence before enforce                      | 04, 07        | Phase 3 design-round gate: `decisions.md` line, 14 days and 200 decisions with every role represented, outcome capture from Phase 2, and a passed canary with real alternative executions                                                                                                                                        |
| Budgets bound new work                              | 04            | Admission control: reservation per launch at dispatch, reconciliation when usage lands, `budget_exceeded`; window share advisory; no overage path exists                                                                                                                                                                         |
| Read-only roles                                     | 05            | `interactionMode: plan` where the Phase 0b permissions map says it is read-only for that provider; verifiers run in a throwaway checkout of the candidate SHA; everything else is prompt-level and labelled so                                                                                                                   |
| Native subagents respect the floor                  | 04, 05        | Only the native default model is set, never the force variant, only under red; implementation and review children go through `delegate_task`                                                                                                                                                                                     |
| Evals for instruction-text changes                  | repo rule, 05 | Review brief requires the eval case and its run output in a handoff; Phase 4 exit requires template adherence 4 of 5 runs                                                                                                                                                                                                        |
| Model and effort per phase                          | 10 §1         | "Run on" line in every step prompt, echoed in the handoff's Next line                                                                                                                                                                                                                                                            |
| Done lines are evidence                             | 10 §2         | Repeatable checks carry the command and result and are re-run by the reviewer; mutations (dispatch, PR, protection) carry their URL and are inspected, not re-run                                                                                                                                                                |
| Prompts are reviewed before they run                | 10 §3         | Step prompts live in `prompts/phase-N/`; Phase 0's are written now, later phases' by the design round in a markdown-only PR you approve; handoffs carry state only, so no agent authors its successor's instructions                                                                                                             |
| Fable final round is scoped                         | 10 §4         | Eight brief files in `docs/overlay/review-briefs/` created in Phase 0; `prompts/_final-review.md` gates on every phase's newest review being passed and the dogfood line                                                                                                                                                         |
| `decide` never emits top efforts                    | 04            | Unit case in Phase 2 step 1                                                                                                                                                                                                                                                                                                      |
| Ultracode and agent teams avoided under red         | 04, 05        | Prompt-level in the injected instructions plus native-subagent env defaults; they never pass through `decide`                                                                                                                                                                                                                    |
| Dogfooding before trust                             | 10 §6         | `_final-review.md` gates on the "daily use since" line being two weeks old                                                                                                                                                                                                                                                       |
| Ledger rebuildable from events                      | 03            | Phase 1 step: `routing.rebuildLedger` RPC with a replay test                                                                                                                                                                                                                                                                     |
| Hook line numbers stay useful                       | 02            | Markers, not line numbers, are the source of truth; verified by the check script                                                                                                                                                                                                                                                 |
| Tag sync runs and is checked                        | 01            | `overlay/main` is the default branch so the schedule fires; the job merges only new upstream release tags; it needs the `OVERLAY_SYNC_TOKEN` PAT and fails loudly without it; it opens a PR with a `sync-<tag>.md` handoff, so `overlay-check` runs and passes on it; an existing sync branch is appended to, never force-pushed |
| Upstream the two hooks after a month                | 01            | Developer action; optional T3 scheduled task 30 days after Phase 3 that opens a thread to draft the PR                                                                                                                                                                                                                           |
| Verifiers get only diff + criteria; three fix loops | 05            | Prompt-level, in the role briefs; backstopped by `maxAttemptsPerStep` and `maxChildrenLifetimePerRoot` and an eval case added in Phase 4                                                                                                                                                                                         |
| Agents ask by role and tier, not model              | 05            | Prompt-level in shadow mode; server-enforced in enforce mode (`decide` steps down anything above the policy ceiling)                                                                                                                                                                                                             |
| Threads ask on exhaustion, never auto-switch        | 04            | Exhaustion raises a pending request; no automatic switch code path exists; Phase 3 test row                                                                                                                                                                                                                                      |

## 8. Developer start steps (before any thread runs)

Nothing here needs a model. Allow an afternoon. Each step says what the tool is, why it is needed, the exact commands, and what usually goes wrong. `fork-main` and `usage-strip` are not touched; Phase 0 steps 7 and 8 port their useful pieces.

### 1. Plans and overage (browser, 10 minutes)

- Decide the plan upgrade (Max 20x recommended).
- **Claude:** claude.ai → your profile → Settings → Billing (or Usage). Find "Extra usage" / "Usage credits" and make sure it is **off** with no prepaid balance. This is the only thing that stops Claude from billing past your window.
- **ChatGPT:** chatgpt.com → Settings → Subscription. Buy no Codex credits; if an auto-reload or auto-purchase option exists, turn it off.
- Optional: in T3 Code, Settings → the text-generation model setting (titles and triage) → Haiku 5.5 (promoted idea #26).

### 2. WSL2: a real Linux inside Windows (30 minutes, one reboot)

**What it is.** WSL2 runs Ubuntu Linux as a lightweight VM inside Windows 11, with its own filesystem and shell. The fork's toolchain only works on Linux (upstream's own Windows tests do not pass), so all development happens in this Ubuntu.

**Install it.** Open PowerShell **as Administrator** (right-click the Start button → Terminal (Admin)) and run:

```powershell
wsl --install -d Ubuntu
```

Reboot when it asks. After the reboot an Ubuntu window opens and asks for a Linux username and password (lowercase username, any password; you will type it for `sudo`). From here on, every command runs **inside that Ubuntu window** (or Windows Terminal with the Ubuntu profile), not in PowerShell.

If `wsl --install` complains about virtualization, enable "Intel VT-x" / "Virtualization Technology" in the BIOS and run it again.

**Base packages.** `apt` is Ubuntu's package manager; `sudo` runs a command as administrator.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git build-essential curl unzip
```

**Git identity** (used for every commit the threads make):

```bash
git config --global user.name "VeroxAUS"
git config --global user.email "<the email on your GitHub account>"
```

**Node.js 26.12.1 via fnm.** Node runs the T3 server and all the tooling; the fork pins exactly 26.12.1. `fnm` (Fast Node Manager) installs and switches Node versions.

```bash
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc
fnm install 26.12.1
fnm default 26.12.1
node --version        # must print v26.12.1
```

**pnpm 12.14.0 via npm.** pnpm is the package manager the repo uses instead of npm. Do not use corepack: Node 25 and later no longer ship it, and a half-installed corepack shim fails with `Cannot find module .../corepack/pnpm/.../pnpm.cjs`. Install pnpm with npm instead; inside the repo, pnpm reads `packageManager` from package.json and uses that version on its own.

```bash
sudo rm -f /usr/bin/pnpm /usr/bin/pnpx                                     # corepack shims from Ubuntu's apt nodejs, if any
rm -f "$(dirname "$(which node)")"/pnpm "$(dirname "$(which node)")"/pnpx   # corepack shims next to fnm's node, if any
npm install -g pnpm@12.14.0
hash -r
which pnpm            # anything but /usr/bin is right (fnm shows a path under /run/user/.../fnm_multishells/)
pnpm --version        # must print 12.14.0
```

`vp` (vite-plus, the repo's task runner) is installed in step 4, after the clone, because its exact version is read from the repo.

**Memory for WSL2 (optional, recommended on 32 GB).** WSL2 takes up to half your RAM by default. To allow 20 GB, create the file `C:\Users\Thomas\.wslconfig` in Windows (Notepad is fine) with:

```
[wsl2]
memory=20GB
```

then in PowerShell run `wsl --shutdown` and reopen Ubuntu.

**Where files live.** Keep the repo in the Linux home directory (`~/src/...`), never under `/mnt/c/...` (that is your Windows C: drive seen from Linux; it works, but every install and test is several times slower). From Windows you can browse the Linux files at `\\wsl$\Ubuntu\home\<username>\src`, and VS Code's "WSL" extension opens them directly.

### 3. GitHub CLI and the two agent CLIs, inside Ubuntu (15 minutes)

**GitHub CLI (`gh`)** lets the threads open PRs, read issues and set repository settings from the terminal.

```bash
sudo apt install -y gh
gh auth login
```

Choose: GitHub.com → HTTPS → Yes, authenticate Git with your GitHub credentials → Login with a web browser; copy the one-time code, press Enter, paste it on the page that opens in Windows. If `apt` offers an old `gh`, follow the Linux install page at github.com/cli/cli.

**Claude Code** (Anthropic's agent CLI). The threads for Claude-side steps run in it.

```bash
npm install -g @anthropic-ai/claude-code
claude
```

On first run type `/login` and follow the browser link; pick the Claude Max account. Then `/exit`. If the install command has changed, the Claude Code docs install page wins.

**Codex** (OpenAI's agent CLI). The threads for Codex-side steps and the Phase 0 review run in it.

```bash
npm install -g @openai/codex
codex login
```

Follow the browser link; pick the ChatGPT account. The Windows installs of these CLIs do not help: the server and the threads live in Ubuntu.

### 4. Clone the fork and mirror `main` (10 minutes)

```bash
mkdir -p ~/src && cd ~/src
git clone https://github.com/VeroxAUS/t3code
cd t3code
git config core.autocrlf false
git remote add upstream https://github.com/pingdotgg/t3code.git
git fetch upstream --tags
git push origin upstream/main:main
```

What that does: `upstream` is Theo's repository; `origin` is your fork. The last command makes your fork's `main` identical to upstream's `main` (a fast-forward; the fork's `main` was a plain mirror on 2026-10-29). If GitHub rejects the push as non-fast-forward, stop and say so; do not force it.

Now install `vp` at the version the repo pins:

```bash
grep -n "vite-plus" pnpm-workspace.yaml      # the catalog line, e.g. `vite-plus: 1.4.0`; ignore the `catalog:` references
npm install -g vite-plus@<that version>
vp --version                                 # prints vp v<version>; "Local vite-plus: Not found" is expected until the next command
```

Then install the repo's dependencies and run the standard check once, so the toolchain is proven before any thread touches it (first install takes a few minutes):

```bash
vp i
vp run check:changed
```

### 5. Create `overlay/main` on the `v0.1.3` tag and add the design set (5 minutes)

```bash
git switch -c overlay/main v0.1.3
cp -r /mnt/c/Users/Thomas/.t3/worktrees/t3-status-line-badge/t3-32e74cd9/docs/multi-agent-harness docs/multi-agent-harness
git add docs
git commit -m "docs: multi-agent harness overlay design set"
git push -u origin overlay/main
```

`v0.1.3` is upstream's release tag from 2026-10-27, which you fetched in step 4. `/mnt/c/...` is this Windows worktree seen from Ubuntu.

### 6. Repository settings on GitHub (browser, 15 minutes)

All under github.com/VeroxAUS/t3code → **Settings**.

1. **General → Default branch:** switch from `main` to `overlay/main`. Scheduled workflows run only from the default branch; this also makes the old `fork-sync.yml` on `fork-main` inert.
2. **Actions → General:** "Allow all actions and reusable workflows". Under "Workflow permissions" choose "Read and write permissions".
3. **The sync token.** The nightly sync job must open pull requests that trigger CI, which the default Actions token cannot do. Create a fine-grained personal access token: github.com/settings/personal-access-tokens → Generate new token → name `overlay-sync` → Repository access: only `VeroxAUS/t3code` → Repository permissions: Contents **read and write**, Pull requests **read and write**, Issues **read and write**, Workflows **read and write** (needed because upstream tags change workflow files) → Generate, copy it once. Then: repo Settings → Secrets and variables → Actions → New repository secret → name `OVERLAY_SYNC_TOKEN`, paste the token.
4. **General → Pull Requests:** optionally tick "Allow auto-merge" so passing sync PRs land without a click.

Branch protection is set by the step-1 thread (PR required, no force-push) and the step-6 thread (required check), both through `gh api`.

### 7. First worktree and first thread (5 minutes)

A git worktree is a second checkout of the same repository in another folder, on its own branch, so threads never edit the main clone.

```bash
cd ~/src/t3code
git worktree add -b overlay/phase-0-step-0 ../t3code-phase-0 overlay/main
cd ../t3code-phase-0
claude
```

Inside Claude Code: type `/model` and pick Sonnet 5.5; type `/effort medium`. Then paste the launch line exactly:

```
Run docs/multi-agent-harness/prompts/phase-0/step-0.md with handoff none
```

Codex alternative for any step: `codex --model gpt-6.1-sol -c model_reasoning_effort=medium` in the same worktree, then paste the same line.

For steps that edit files (1 onward), start Claude Code with `claude --permission-mode acceptEdits` so it does not ask before every file write; shell commands still ask.

Phases 0, 0b and 1 run in these plain CLIs inside Ubuntu. From Phase 2 the fork's own server runs in Ubuntu and the chain is driven from the T3 cockpit (dogfooding).

### 8. After each thread (repeat for every step)

```bash
cd ~/src/t3code-phase-0
cat docs/multi-agent-harness/handoffs/phase-0-step-0.md    # docs/overlay/handoffs/... from step 5 onward
```

Read it. Answer any "Open questions" by editing that file inline and committing on the thread's branch (`git add -A && git commit -m "handoff: answers" && git push`). Merge the PR once its checks are green:

```bash
gh pr list
gh pr merge <number> --merge --delete-branch
```

Use `--merge` (a merge commit), not squash: handoffs record branch commit SHAs, and squashing would make them unfindable. Then start the next step on a fresh branch from the updated integration branch:

```bash
git fetch origin
git switch -c overlay/phase-0-step-1 origin/overlay/main
claude --permission-mode acceptEdits      # or codex, whichever vendor is green
```

Paste the handoff's `Next` line. The prompt names the floor model and effort; going up a tier is always fine, going down never.

### 9. Phase 0 review, then the spikes

When `docs/overlay/handoffs/phase-0-complete.md` exists (step 8 writes it):

```bash
cd ~/src/t3code-phase-0
git fetch origin && git switch -c overlay/phase-0-review origin/overlay/main
codex --model gpt-6.1-sol -c model_reasoning_effort=low
```

Paste the complete handoff's `Next` line. A passed review hands you the Phase 0b design-round launch line; run it on Opus 5.5 High (`claude`, `/model opus`, `/effort high`). Phase 0b's four contract spikes settle token semantics, replay durability, real role permissions and candidate workspaces before the Phase 1 design round writes any Phase 1 prompt.
