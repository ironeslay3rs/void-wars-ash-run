---
name: project-memory
description: Read and update docs/PROJECT_MEMORY.md after each work batch — living state, fence, memory, next plan, inputs.
---

# Project memory (partner skill)

Use this skill whenever you finish a **batch** of implementation, planning, or significant investigation in **black-market-survivor**.

## What “memory” means here

One file holds three things agents must keep current:

1. **Memory** — Work log (what we did), Snapshot, Living state.
2. **Next** — Next implementation plan + current implementation queue.
3. **Inputs** — Inputs & decisions table + open questions (user constraints and answers).

Canonical path: **`docs/PROJECT_MEMORY.md`**. Kebab alias (pointer only): **`docs/project-memory.md`**.

## Before a batch

Read **`docs/PROJECT_MEMORY.md`**: Snapshot, **Living state**, **Fence**, Next implementation plan, Current implementation queue, latest Work log lines, Inputs & decisions.

## After a batch (required)

Edit **`docs/PROJECT_MEMORY.md`**:

- **Living state** — focus, branch/PR, blockers.
- **Fence** — in-scope vs out-of-scope for the batch just finished (and the next if agreed).
- **Work log** — append **newest on top** (date + short bullets).
- **Last refreshed** — today’s date.
- **Next implementation plan** / **Current implementation queue** / **Snapshot** — if priorities or product truth changed.
- **Inputs & decisions** — new rows when the user stated constraints, chose between options, or answered an open question.

## Do not

- Leave memory stale after a batch that changed code, plan, or decisions.
- Paste book manuscript text; lore stays in **`lore-canon/`** and short UI strings in **`src/lib/canon-lore.ts`**.

## Related

- **`AGENTS.md`** — project-wide agent rules (includes this ritual).
- **`.cursor/rules/gsd-autonomous.mdc`** — full GSD loop including Step 7.
- **`docs/WORKFLOW.md`** — technical folio / CI checklist.
