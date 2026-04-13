<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project memory (required)

**One file = memory + next plan + inputs.** Canonical: **`docs/PROJECT_MEMORY.md`** (alias pointer: **`docs/project-memory.md`**).

| Pillar | In the file |
|--------|-------------|
| **Memory** | Snapshot, **Living state**, **Fence**, Work log (newest on top) |
| **Next** | Next implementation plan, Current implementation queue |
| **Inputs** | Inputs & decisions table, Open questions |

- **Before** substantive work: read that file (at least Snapshot, Living state, Fence, next plan, queue, latest log, inputs).
- **After each batch** (or session end): **update** it — Living state, Fence, Work log, Last refreshed, and any changes to plan, queue, Snapshot, or inputs. See **`.cursor/rules/gsd-autonomous.mdc`** Step 7 and **`.cursor/skills/project-memory/SKILL.md`**.

## Project workflow

- **Verify before claiming done:** run **`npm run check`** (lint + tests + production build). CI runs the same command after `npm ci`.
- **Ash Run folios:** follow the checklist in `docs/WORKFLOW.md` (catalog, level, miniboss, tests, hub copy).
- **Node:** use Node 20+ (`.nvmrc`).
- **Lore:** vault at **`lore-canon/`**; player-facing paraphrases in **`src/lib/canon-lore.ts`**. Follow **`.cursor/rules/workflow-and-lore.mdc`**.
- **GitHub / Vercel from chat:** assistants use **your** credentials (CLI login, MCP tokens, or Actions secrets) — see **`docs/ASSISTANT_INTEGRATIONS.md`**.
