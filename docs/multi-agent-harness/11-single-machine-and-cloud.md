# 11 · One machine, and when the cloud is worth it

Hardware: i7-13700K (8P + 8E cores, 24 threads), 32 GB RAM, RTX 4080 16 GB, Windows 11.

## Will the proposal run on one machine?

Yes. Everything multi-environment in the design (pooled accounts, environment links, cross-machine routing, idea #23) is optional and off by default. One T3 environment is the normal case; the docs mention more because T3 supports it, not because the design needs it.

## What actually consumes the box

Rough figures from experience, not measured on this machine. T3 ships a resource monitor (`native/resource-monitor`, `docs/internals/resource-telemetry.md`); use it in Phase 1 to replace these with real numbers.

| Component                                | RAM                                                                                               | CPU                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| T3 server (Node)                         | 300–500 MB                                                                                        | low                |
| Electron desktop                         | 0.5–1 GB                                                                                          | low                |
| Claude Code session (Node + MCP servers) | 300–700 MB each; finished delegates keep process + MCP servers for 30 min (upstream issue #26413) | bursts             |
| Codex session (Rust)                     | 100–300 MB each                                                                                   | bursts             |
| Dev server or test run per worktree      | 0.5–1 GB; vitest and tsc-rs are CPU-bound                                                         | high while running |
| pnpm worktrees                           | hardlinked store, disk-light                                                                      | install bursts     |

Budget: four writers + two readers + two test runs ≈ 8–12 GB. Comfortable. Eight concurrent children all running suites would push RAM and make every step 20–50% slower from CPU and disk contention. That is the only real "performance loss" of one machine, and the roadmap's caps avoid it.

Ranking of bottlenecks: subscription windows (identical on any number of machines) → provider rate limits → CPU and disk during parallel test runs → RAM. A second machine does not add quota unless it has a second subscription.

## Settings for this box

- `overlay.budgets.maxConcurrentChildrenPerRoot: 3`, `maxChildrenLifetimePerRoot: 12`, and the global `overlay.limits.maxConcurrentChildren: 6` (added in Phase 0 step 4).
- Test runs serialised through the merge lane; writers run their own suite once before handing over, not continuously.
- Everything under WSL2 on the NVMe; Defender does not scan the WSL filesystem by default, so no exclusions are needed unless the repo is on `/mnt/c`, which it should not be.
- Let T3's worktree cleanup remove finished worktrees so their dev servers die.
- The GPU is idle unless you run local models. 16 GB VRAM runs a ~14B-class quantised model for titles, summaries and handoff text (idea #24) through OpenCode + Ollama. Parked, not needed now.

## Windows toolchain

T3 ships Windows desktop builds, so the packaged app runs natively. The dev toolchain does not: upstream's `.github/workflows/windows-tests.yml` is manual-only and its header says nothing in the suite passes on Windows yet, `scripts/check-changed.ts` spawns `vp` without a shell, and AGENTS.md assumes Linux tools. Decision: develop inside WSL2 from day one. Keep the repo in the WSL filesystem (not `/mnt/c`, or every install and test is slow), install Node 26.12.1, pnpm 12.14.0 and `vite-plus` at the catalog version there, and install and log in the `claude` and `codex` CLIs inside WSL2 so the server running there can drive them. Day to day, the cockpit is the web client served by that server in a browser on Windows; a packaged Windows desktop build of the fork is produced by `overlay-release.yml` on a GitHub Windows runner (ported from your `fork-main` workflow in Phase 0 step 8); nothing is built on your machine. The repo's `.devcontainer` is the fallback if WSL2 is not possible.

## When to add a machine or the cloud

Reasons that justify it, in order of likelihood:

1. **Always-on**: night-shift sweeps and scheduled automations while your desktop is off or busy.
2. **Isolation**: long sweeps or heavy test matrices without contending with your interactive work.
3. **A second subscription**: then pooled windows become real and the router's arbitrage gets a second account.

Not a reason: raw speed for the default fleet size.

## Cloud options

### A. Your own VM as a second T3 environment (recommended first step)

This is what T3's remote model is for and needs no new code.

1. Provision a Linux VM, 8 vCPU / 32 GB. Approximate prices, unverified today: Hetzner CCX33 or CPX51 about €55–65/month; DigitalOcean 8 vCPU / 32 GB about $170/month; AWS c7a.2xlarge about $0.30/hour on demand, less on spot.
2. Install Node 26, git, pnpm; run `npx t3` headless as a systemd service (docs/user/background-service.md and docs/user/remote-access.md).
3. Tailscale on both machines; no public ports. T3 Connect is the alternative when Tailscale is not possible.
4. Log in `claude` and `codex` on the VM with the same accounts (same windows, no extra quota) or a second account (extra quota).
5. Add the environment in the desktop app; link environments so threads can delegate across machines (the `t3_environment_links` tool and a link request).
6. Per-environment settings: higher `maxConcurrentChildren` on the VM, night-shift scheduled tasks pinned to it, `windowReserve` respected.

Security: Tailscale-only ingress, T3's server-owner auth, secrets through `request_secret`, nothing listening publicly.

### B. Vendor-hosted agent runs

Codex cloud tasks, Cursor cloud agents, Claude Code web sessions, Warp Oz run agents on vendor infrastructure against your GitHub repo. T3 does not drive them today (adapters are local processes), so they sit outside the cockpit: no cost ledger, no routing, no team view. Use them ad hoc for throwaway sweeps. An adapter that watches their PRs is possible later; not in the roadmap.

### C. Devcontainer and Codespaces

The repo has a `.devcontainer`. Codespaces bill per hour, which makes them poor for always-on and fine for a day of isolated work. A self-hosted devcontainer on the VM from option A is the better version of this.

### Not worth it

Kubernetes, autoscaling, multi-region anything. The fleet is single-digit agents gated by subscription windows.
