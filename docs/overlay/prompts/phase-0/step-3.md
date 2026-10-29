# Phase 0 · Step 3 · Scaffold packages/routing

Launch line: `Run DOCS/prompts/phase-0/step-3.md with handoff DOCS/handoffs/phase-0-step-2.md`

Run on: Claude Sonnet 5.5 Medium or GPT-6.1 Sol medium.

Read `_preamble.md`. Gate: the step-2 handoff exists.

## Read

`packages/shared/package.json`, its `tsconfig.json`, and one of its test files, as the template; `pnpm-workspace.yaml`; `knip.jsonc`; the `knip:check` script in the root `package.json`; `DOCS/02-architecture.md` section "New code".

## Do

1. Create `packages/routing` as `@t3tools/routing` with the same `package.json` shape (scripts, exports, test config) and `tsconfig` as `packages/shared`.
2. `src/index.ts` exporting one pure placeholder (`decide` that returns its input unchanged) and `src/index.test.ts` with one passing test.
3. `pnpm-workspace.yaml` and `knip.jsonc` already cover `packages/*`; do not edit them. The root `package.json` `knip:check` script enumerates workspaces explicitly: add `--workspace packages/routing` there. The package imports nothing from `@t3tools/*` or Effect; it stays pure.

## Accept

`vp i` is clean; `vp test run packages/routing` passes; `vp run check:changed` passes (it runs knip for changed files; do not run repo-wide knip).

## Handoff

`DOCS/handoffs/phase-0-step-3.md`. Next line: `Run DOCS/prompts/phase-0/step-4.md with handoff DOCS/handoffs/phase-0-step-3.md — on Claude Sonnet 5.5 High or GPT-6.1 Sol high`.
