# 12 · Team view UI/UX

A partial visual reference, not a tested interaction design, is at `mockups/team-view.html` (open it in a browser; it reads T3's theme variables through aliases with a dark fallback).

## The idea in one line

**Inbox + Fleet, mouse-first.** It is a GUI you click, type into and drag within; keyboard shortcuts are accelerators, never the only path. The inbox is what needs you (approvals, questions, plan sign-offs, review triage, stalled, over budget). The fleet is everything else, and it stays calm. Success means running six agents and never missing a question, never wondering what something costs, never wondering why it chose a model.

## References worth stealing from

- Factory "Mission Control": orchestrator / workers / validators as a tree with per-role models.
- Antigravity Agent Manager: an inbox of finished summaries, not a wall of logs.
- GitHub Copilot app "My Work": sessions, PRs and automations in one list.
- Cursor Agents Window: worktree per agent, local and cloud side by side.
- Claude Code `claude agents`: one screen of background sessions.
- Linear: density, keyboard-first, calm colour, exceptions glow.
- Paperclip: budgets and spend attribution visible on the board.

## Layout

Desktop (≥1200px), four areas:

- **Rail** (left, 240px): pressure gauge per provider (band colour, used %, pace, reset time, projected exhaustion), budget summary for the selected project, filters (environment, project, status, role, provider, band), density toggle, links to the routing and budget settings.
- **Board** (centre): default grouping by ticket (root thread) with a header row (title, PR chip, rollup cost against budget, worktree, actions) and agent cards beneath. Toggle to swimlanes: Needs you · Working · Queued · Review · Landing · Done. The "Needs you" lane is always first and always visible. The merge queue is a strip under the board.
- **Drawer** (right, 380px, opens on click): the selected agent. Live tail of its timeline (last 20 items, from the existing projection), diff stat, cost and budget, "why this model" with alternatives, a pending request with inline Allow / Deny / reply controls, action buttons (open thread, steer, cancel, re-run on frontier, pin provider), and **the thread's own composer** embedded at the bottom. It is T3's existing composer component, so attachments, context references, slash commands and model picking all work; you reply, steer or queue a message without leaving the hub.
- **Command dock** (bottom, always visible): the prompt panel for the hub itself. A target chip (New pipeline, New thread, or the selected agent), a tier or model picker, the composer text box with attachments, and Send / Steer / Queue buttons. `/pipeline feature` here starts a ticket; with a card selected, typing steers that agent.

Narrow web (728px): the rail becomes a top strip of gauges, the drawer becomes a bottom sheet, the command dock stays at the bottom. Mobile: inbox list first, fleet list second, composer in the thread sheet; reuses `ThreadAgentsSheet` rows.

The mockup in `mockups/team-view.html` shows the board area at the narrow width only; rail, drawer and command dock are not in it.

## Visual language

- **Theme tokens only.** T3 lets users import VS Code and OpenVSX themes; every colour comes from the theme variables (`--card`, `--border`, `--primary`, `--success`, `--warning`, `--destructive`, `--chart-1..6`). The contrast helper in `appearanceContrast.ts` guards text on tinted surfaces.
- **Tier pills** on `--chart-*` colours: cheap, standard, frontier, apex. Same colours in the router settings grid so the vocabulary is learned once.
- **Band dots**: success / warning / destructive / muted for green / amber / red / unknown. A down-arrow chip marks a stepped-down decision.
- **Cards**: provider glyph + model name, role badge, status pill (existing `resolveThreadStatusPill`), elapsed, progress line, cost in tabular numerals, a 2px budget bar as the card's bottom edge.
- **Attention states**: needs-you = primary-coloured left border and an inbox entry; stalled = warning ring pulsing on opacity only (T3's GPU rule); over budget = destructive bar; offline environment = dimmed with a reconnect affordance.
- **Motion**: 120–150 ms opacity and transform only; respects `prefers-reduced-motion`.
- **Numbers**: cost shown in the display currency (AUD, `A$`) as "API-equiv" with one tooltip explaining it is not the bill and names the fixed USD rate; windows shown as "% used · resets Fri 09:00".

## Interactions

- **Every action is a visible control.** Cards open on click. Questions have a reply box inline. Approvals are Allow and Deny buttons. Steer, cancel, pin, re-run are buttons on the card hover bar and in the drawer. Filters are chips. Nothing is reachable only by keyboard.
- **Keyboard accelerators**, shown in tooltips and the command palette, for people who want them: `mod+shift+t` opens the team view, `j`/`k` move, `enter` opens the drawer, `r` focuses the reply box, `/` focuses the filter, `⌘K` opens the palette. Registered in `apps/server/src/keybindings.ts` (keybinding commands).
- **Drag** a card onto the command dock's target chip to address it; drag an attachment onto a card to send it to that thread.
- **Multi-select** with `shift+click` or a drag-marquee for cancel and pin.
- **Empty state:** "No agents running" with a Start a pipeline button that fills the command dock with `/pipeline feature`.

## Live feel without new load

Status and progress come from the thread projection stream that already exists. Cost polls every 5 s while mounted. The rail's tokens-per-minute sparkline is computed client-side from ledger deltas. Pressure arrives on the `serverConfig` stream when providers refresh (5 min) or a live rate-limit push lands. No new websocket subscriptions.

## Anti-patterns to avoid

Dashboards of numbers with no action attached; red everywhere; modal approval dialogs that block the board; auto-scrolling logs on the main view; charts on the board (they live on the usage page and one rail sparkline); hiding stepped-down routing.

## Accessibility

Focus rings on every card and action, the inbox count as an ARIA live region, colour never the only signal (band dots carry a letter on hover, tier pills carry text), minimum 44px touch targets on mobile.

## Build notes for Phase 5

Start from the mockup's structure, not its CSS. Use the house components (sidebar rows, status pills, usage limit bars) so the view inherits themes and keybinding conventions. The logic file (`TeamView.logic.ts`: grouping, ordering, filters) is written and tested before any component.
