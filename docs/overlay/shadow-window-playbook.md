# Shadow window playbook

What to do during the 14-day shadow window so the Phase 3 gate gets 200 useful decisions with every role represented (`07-roadmap.md:96`). Written 2026-10-30 from an `_ask.md` thread.

**Not decided yet:** the phase reorder and the counting rules below are queued in `inbox.md` for a design round. If that round decides differently, its decisions win and this file gets updated.

## Now

Nothing changes. Keep following the Phase 0b chain.

## When Phase 2 is finished

1. Turn on shadow mode: `Settings → Routing`, mode `shadow`. The router only records what it would have picked; work still runs on the models you choose.
2. Note the date. The 14 days start here, as long as Phase 2 step 8 (outcome capture) is in.
3. Start Phase 5, if the reorder to 0, 0b, 1, 2, 5, 3, 4, 6 was accepted.

## During the window

Follow Phase 5 like any other phase: design round, each step's prompt in order, then review. The Phase 5 design round should put the `delegate_task` instruction into its step prompts, so you don't paste anything there.

For a bug or annoyance you notice along the way, start a separate thread with this at the top, then the task:

> Use `delegate_task` with an explicit role for every child. Have one child research if needed, one implement, one test, and one review.
>
> The sidebar cost chip shows the wrong total after a thread is forked. Find out why and fix it.

Skip the line for tiny jobs one agent can finish alone. Don't split work just to raise the count, because padding makes the report less useful.

`/pipeline` doesn't exist until Phase 4, so this is done by hand.

## Day 7 check

Look at the decision log in `Settings → Routing`. Aim for about 100 decisions, including a few `design` ones. If you're behind, top up from this list and keep going past day 14 if needed:

- More fixes from daily use
- The review checklists below
- Read-only research to prepare for Phases 3 and 4
- Upstream release merges, when one comes out
- Small cleanups: flaky tests, lint, docs
- Testing what Antigravity is good at
- Tasks from other projects

Keep about 10 small tasks with a clear pass or fail aside for the canary.

## Running a review checklist

The briefs in `review-briefs/` were written for the final review. Their launch line won't work during the window, and running them here doesn't replace that review.

| Brief                  | Run it during the window?                            |
| ---------------------- | ---------------------------------------------------- |
| `pressure-correctness` | Yes                                                  |
| `event-sourcing`       | Yes                                                  |
| `settings-migration`   | Yes                                                  |
| `privilege`            | Yes, for what exists so far                          |
| `cache-safety`         | Yes, for what exists so far                          |
| `ui`                   | Once Phase 5 is mostly built                         |
| `budget-bypass`        | No, the budget guard doesn't exist until Phase 3     |
| `windows-paths`        | No, it's mainly about Phase 4's merge queue, witness |

Start a new thread on Opus 5.5 Medium or GPT-6 Astra medium and paste this, changing the brief name:

> Use `delegate_task` with `role: "review"` for one child, and have it do this:
>
> Read `docs/overlay/review-briefs/pressure-correctness.md` and use its Question, Read and Invariants sections as your checklist. Ignore its launch line, Run on, Gate and Write sections, because this is not the final review. Check the code as it exists now and skip anything not built yet, saying which. Edit nothing and write no handoff. Report findings as file, line, severity, claim and evidence.

For anything real it finds, start a normal fix thread with the prompt line and paste the finding in as the task.

## When the window ends

1. Once you have at least 14 days, at least 200 decisions and every role represented, read the shadow report and adjust the routing settings.
2. Add this line to `decisions.md`: `shadow report reviewed, matrix tuned`.
3. Run the canary: 20 real tasks you approve, run on the models the router picks. It passes when the cheap tier's retry rate is at most 1.5× the standard tier's and no quality-floor violation occurred.
4. Phase 3's design round can then start. With the reorder, finish Phase 5 first.

## Before the window

Decide where the task list lives. GitHub issues are off on the fork, though decision 6 makes them the control plane. To turn them on:

`gh repo edit VeroxAUS/t3code --enable-issues`
