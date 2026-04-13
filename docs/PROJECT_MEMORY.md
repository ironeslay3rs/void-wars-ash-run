# Project memory (living)

**Single source for:** what we did, what we decided, what’s next, and the active checklist — so **humans and agents** stay aligned. **Update this file** at the end of any substantive session (and skim it at the start of the next one).

**Last refreshed:** 2026-04-13

---

## Snapshot (read this first in a new session)

**black-market-survivor** — local-first **Game Studio** hub: **Black Market Survivor** (`/survivor`) and **Void Wars: Ash Run** (`/ash-run`). Ash Run folio spine playable through **Folio XXXVII**; **XXXVIII** is roadmap-only. Survivor: three heist tiers (400 / 250 / 175 cr). Lore: **`lore-canon/`** vault; UI copy in **`src/lib/canon-lore.ts`**. Verify with **`npm run check`**; CI + optional Vercel deploy job — see **`docs/VERCEL_GITHUB.md`**, **`docs/ASSISTANT_INTEGRATIONS.md`**.

### Living state *(update after each batch)*

- **Current focus:** *(e.g. next folio slice, CI, polish)*  
- **Branch / PR:** *(if any)*  
- **Blockers:** *(none or list)*

### Fence *(scope boundary — update after each batch)*

- **In this batch:** *(what we agreed to touch)*  
- **Out of scope / not now:** *(explicit exclusions — mirrors Deferred when useful)*

---

## Work log (append — newest on top)

*Short bullets: date, what changed, optional commit/PR.*

- **2026-04-13** — GSD `gsd-autonomous.mdc` (Step 7 → update memory); **Living state** + **Fence**; `docs/project-memory.md` alias; skill `.cursor/skills/project-memory/SKILL.md`; `AGENTS.md` = memory + next + inputs after each batch.
- **2026-04-06** — Workflow: `npm run check`, CI, Vercel paths, PR template, Dependabot; canon-lore + hub/Survivor/WorldMap; `lore-canon/GAME_BRIDGE.md`.

---

## Next implementation plan

*Ordered priorities. Rewrite when direction shifts.*

1. **Folio XXXVIII playable** — vertical slice: level file, miniboss, `catalog.ts` (order + stages + `createLevelForId` + intro + lock hints), **`folio_xxxix_*` roadmap** teaser, `folioProgress` unlock + repair tests, hub / WorldMap / `OVERALL_UPGRADE.md`.
2. **Optional:** PB input-replay ghost (spec + deterministic log + replay).
3. **Optional:** Survivor custom heist goal or `runMode` enum if presets multiply.
4. **Optional:** Mid-folio checkpoints (design + save contract).

---

## Inputs & decisions

*Capture **your** constraints, answers, and references so the next session doesn’t re-debate.*

| Date | Input / decision | Notes |
|------|-------------------|--------|
| *(add rows)* | | |

**Open questions** *(optional)*

- *(none — add when blocked)*

---

## Current implementation queue

*One active slice — **check off** as you go; **clear** when merged or abandoned.*

- [ ] *(next slice)* Folio XXXVIII: new `folio-*.ts`, miniboss + registry + HUD, catalog + tests + hub copy + `OVERALL_UPGRADE.md`
- [ ] `npm run check` green before merge

---

## Deferred / out of scope (for now)

- Accounts, cloud saves, multiplayer, leaderboards  
- Full music score (beyond light `playSfx`)  
- Full book text in-app (use `lore-canon/` + short paraphrases only)

---

## How to update (ritual)

| When | What to do |
|------|------------|
| **Start** a coding session | Read **Snapshot** + **Next implementation plan** + **Current queue** + latest **Work log** lines. |
| **During** work | Add **Inputs & decisions** rows when the user (or you) fixes a constraint or answers an open question. |
| **End** a session or **after a batch** | Refresh **Living state** + **Fence**, append **Work log**, bump **Last refreshed**, update **Next implementation plan** / **queue** / **Snapshot** / **Inputs** as needed. |

---

*See also:* [`WORKFLOW.md`](./WORKFLOW.md) (technical checklist), [`OVERALL_UPGRADE.md`](./OVERALL_UPGRADE.md) (roadmap narrative).
