# Ask: a question thread about the overlay

Launch line: `Run DOCS/prompts/_ask.md` followed by the question in the same message. One topic per thread; when the topic changes, start a new one.

Run on: Claude Opus 5.5 medium · Codex GPT-6 Astra medium, whichever window is greener. Sonnet 5.5 · GPT-6.1 Sol for "where is this in the code" lookups.

Read `_preamble.md` for paths and the test and tooling rules only. The gate, "Branch and PR" and "Finish" sections do not apply: this thread is not a link in the chain. No handoff, no branch, no PR.

## Read

`DOCS/README.md`, then only the doc sections and code the question needs. Read `DOCS/decisions.md` and the newest handoff under `DOCS/handoffs/` before answering anything about current state.

## Do

Answer the question. Reproduce a bug if asked, with the commands you ran and their output. Cite files as `path:line`. Say plainly when the docs and the code disagree, and when something is not decided.

You edit nothing except `DOCS/inbox.md`. When an answer implies a change to a design doc, a prompt, a setting or code, do not make it: append one line to `DOCS/inbox.md` as `- YYYY-MM-DD: <the change, one sentence> (from: <the question, a few words>)` and tell the developer it is queued for the next design round. Commit that line on the current branch with the message `inbox: <few words>`; do not push.

## Stop

Stop when the question is answered. If the developer's next message is a new topic, say "new thread for that" and stop.
