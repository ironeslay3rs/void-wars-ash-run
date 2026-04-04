# Black Market Survivor — GSD (game spec document)

## Pitch

Browser survival prototype: manage **health**, **hunger**, **stress**, **credits**, and **scrap** day by day in a grey-market setting. One screen, local save, no backend.

## Core loop (v0.1)

1. **Actions** — Scavenge, Work, Fight, Rest (change stats, append log).
2. **Shop** — Buy Food, Buy Medicine (credits → survival).
3. **Upgrades** — One-time **installs** bought with credits; permanently tweak action outcomes.
4. **Persistence** — Full `GameState` JSON in `localStorage` (merged on load so older saves without `upgrades` still work).

## Upgrades (installed gear)

| ID | Name | Cost | Effect |
|----|------|------|--------|
| `scavenger_rig` | Scavenger rig | 55 cr | Scavenge finds more scrap (better roll range). |
| `brawler_wraps` | Brawler wraps | 70 cr | Taking a fight loss hurts less (−damage floor). |
| `nerve_patch` | Nerve patch | 65 cr | Rest shaves extra stress off. |

Rules: each upgrade can be bought **once**. Insufficient credits or duplicate purchase → log message only.

## Architecture

| Area | Location |
|------|-----------|
| Types | `src/features/game/gameTypes.ts` |
| Initial state | `src/features/game/initialGameState.ts` |
| Pure state transitions + catalog constants | `src/features/game/gameActions.ts` |
| Math / save parsing helpers | `src/features/game/gameUtils.ts` |
| React state + `localStorage` | `src/features/game/useGameEngine.ts` |
| Screen composition | `src/features/game/GameScreen.tsx` |
| Presentational UI | `src/components/game/*` |
| Route | `src/app/page.tsx` → `<GameScreen />` |

## Out of scope (prototype)

Multiplayer, auth, server saves, full inventory, combat screen, narrative tree beyond the log.

## Next ideas (not implemented)

Arena tickets, named vendors, implants, runes, persistent meta between “runs.”
