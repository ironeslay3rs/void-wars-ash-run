# Games ↔ this vault

This folder is the **Evolution: Void Wars** lore vault (books, master canon, per-game rules).

## Black Market Survivor (this repo)

- Application code: repository root (`src/`, `docs/`).
- **Ash Run** mode follows: `03 Games/Void Wars Ash Run/Locked Rules/Core Rules.md`.
- In-game canon **taglines** are paraphrased in `src/lib/canon-lore.ts` — not full book text.

## When editing canon

- Locked canon notes belong in the paths described in `99 Core Rules/00 - How This Vault Works.md`.
- After changing master canon, consider updating `src/lib/canon-lore.ts` or `folioCanonFocus` copy in code if player-facing text should track it.
