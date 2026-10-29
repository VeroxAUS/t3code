# Overlay thread preamble

Every prompt starts with "Read `_preamble.md`". This is it. It is short on purpose; the rules here are the ones CI and the reviewer check.

## What you are

One thread in a chain building the multi-agent overlay on this T3 Code fork (`VeroxAUS/t3code`, default branch `overlay/main`). You do one step, open its PR, write a handoff, and stop. You continue into the next step only when your prompt explicitly allows it.

## Paths

`DOCS` means `docs/overlay/` if that folder exists, otherwise `docs/multi-agent-harness/`. Phase 0 step 5 moves it.

## Gate

Your launch line names a handoff file. Open it first. If it is missing, stop and tell the developer. Your prompt states which predecessor it accepts:

| Prompt             | Accepts                                                             |
| ------------------ | ------------------------------------------------------------------- |
| a step prompt      | the previous step's handoff, or the design-round handoff for step 1 |
| `_design-round.md` | a review handoff with `status: passed`                              |
| `_review.md`       | a complete handoff, or a fix handoff for a re-review                |
| `_fix.md`          | a review handoff with `status: findings`                            |
| `_final-review.md` | the last phase's review handoff with `status: passed`               |

If the file's `status` or kind does not match what your prompt accepts, stop and tell the developer. Then read the handoff's "Gotchas" and "Open questions": an answered question is a decision you follow; an unanswered one you never guess at. Stop and ask.

## Read, in this order, nothing more

1. `AGENTS.md` in the repo root.
2. Your prompt.
3. The handoff named in your launch line.
4. Only the doc sections your prompt names.

## Rules the reviewer and CI enforce

- Tooling is `vp`. Never bare `pnpm`, never `npx tsc`. Never a repo-wide check (`vp check`, `vp run -r test`); use `vp run check:changed` and `vp test run <files>`. When a prompt says "run the project's tests", that means the command in `DOCS/CHANGES.md` under "Test command" (for this repo: `vp run check:changed` plus `vp test run` on the files you touched), never an ad hoc repo-wide run.
- Tests: `it.effect` on a TestClock; no sleeps, polling, wall-clock or per-test timeouts; drain the effect worker (`OrchestrationEffectWorkerV2` in `apps/server/src/orchestration-v2/EffectWorker.ts`). New non-trivial logic ships with one test at the lowest layer that fails without it.
- Every settings field has a decoding default.
- Never touch `~/.t3/userdata`. Kill only PIDs you captured at spawn. Start a dev server with `setsid vp run dev > /tmp/dev.log 2>&1 &` and stop it with `kill -- -<that PID>`, so the server and web children die with it.
- **Manifest.** `DOCS/CHANGES.md` lists every upstream file the overlay has changed, one line each: path, reason, and whether it carries a `// overlay:` marker. Any file outside the overlay-owned paths is upstream. Add a `// overlay: <reason>` comment on changed lines where the file type allows comments; JSON, YAML without comments and lockfiles get a manifest line only. `scripts/overlay-check.ts` fails a PR whose changed upstream paths and manifest disagree in either direction. Overlay-owned paths: `packages/routing`, `apps/server/src/routing`, `apps/web/src/components/team`, `evals/routing`, `scripts/overlay-check.ts`, `.github/workflows/overlay-*.yml`, `DOCS`.
- Scope is the prompt. Something adjacent looks wrong: write it under "Open questions", do not fix it.
- A file or symbol a prompt or doc names is missing: grep for the symbol or the nearest name, use the real path, record the correction under Gotchas, and continue. Stop only when nothing matches.

## Branch and PR

Before any edit: `git fetch origin`. If you are already on `overlay/phase-N-step-k` and `git merge-base --is-ancestor origin/overlay/main HEAD` succeeds, use it; the developer usually creates it. Otherwise `git switch -c overlay/phase-N-step-k origin/overlay/main`. Never branch from a stale local `overlay/main`.

The developer's launch line is the explicit request to push and open this step's PR, which satisfies AGENTS.md's ask-first rule for this one PR. After committing the handoff: `git push -u origin HEAD`, then one PR into `overlay/main` titled `overlay: phase N step k — <what>`; the body is your handoff's "Done, verified" section. Never merge it; the developer does.

## Finish

Write `DOCS/handoffs/phase-N-step-k.md` from the template in `DOCS/10-execution-plan.md` section 2. It carries state only. Under the title, three metadata lines:

```
commit: <SHA of your last commit on the branch>
supersedes: <the handoff named in your launch line, or none>
status: <passed | findings, review links only>
```

Write every path in the handoff with `DOCS` already resolved (for example `docs/multi-agent-harness/prompts/...`), so the Next line can be pasted as is. Then where we are, done with the proving command and its one-line result (mutations such as a workflow dispatch or a PR creation carry their URL as evidence instead), not done, decisions, gotchas, open questions, and one `Next` line of the form:

```
Next: Run DOCS/prompts/<file> [for phase N] with handoff DOCS/handoffs/<this file> — on <model and effort named in that prompt>
```

Commit the handoff on the branch, push, open the PR as above, and put its URL under Done. Then stop.
