# Black Market Survivor — GSD (game spec document)

## Pitch

Browser survival prototype: manage **health**, **hunger**, **stress**, **credits**, and **scrap** day by day in a grey-market setting. One screen, local save, no backend.

## Core loop (v0.1)

1. **Actions** — Scavenge, Work, Fight, Rest (change stats, append log).
2. **Shop** — Buy Food, Buy Medicine (credits → survival).
3. **Upgrades** — One-time **installs** bought with credits; permanently tweak action outcomes.
4. **Persistence** — Full `GameState` JSON in `localStorage` (merged on load). Older saves may use legacy `upgrades` instead of `installedUpgrades`; both merge paths are supported.

## Core loop (v0.2)

5. **Fence** — Sell scrap for credits **without advancing the day** (up to 5 scrap per action at 3 cr each; key `7`).
6. **Victory** — Reach **day ≥ 30** with health remaining; run locks like game over with a win screen.

## Core loop (v0.3)

7. **Stress meltdown** — At **100 stress**, automatic **snap**: −10 HP, lose **25% credits** (rounded down), −2 scrap, stress reset to **38**; **two-day** in-game cooldown before another meltdown (`nextMeltdownAllowedAfterDay` in save).
8. **Services** — **Intel** (8 cr, key `8`): rumor line with a % — **flavor only**; fight RNG stays 52% win. **Clinic repair** (48 cr, key `9`, **once per run**): +5 max HP and heal (`bodyRepairUsed`).
9. **Log flavors** — Scavenge / work / fight / rest lines rotate from pools (`src/features/game/logFlavors.ts`).

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
| Log line pools | `src/features/game/logFlavors.ts` |
| Studio hub | `src/app/page.tsx` |
| This prototype | `src/app/survivor/page.tsx` → `<GameScreen />` |
| Void Wars: Ash Run (platform slice) | `src/app/ash-run/page.tsx` |
| Cross-app chrome | `src/components/shell/AppShell.tsx` |

## Out of scope (prototype)

Multiplayer, auth, server saves, full inventory, combat screen, narrative tree beyond the log.

## Next ideas (not implemented)

Arena tickets, named vendors, implants, runes, persistent meta between “runs.”

## Roadmap doc

See `docs/OVERALL_UPGRADE.md` for phased upgrades across Survivor and Ash Run.

## Quality

- **`npm test`** — Vitest: `mergeLoadedState`, `applyGameAction`, `applyStageWin` / folio storage (Node shim for `window` + `localStorage`).

## Ash Run map metadata

Stages may set **`estMinutes`** and **`difficulty`** (`tutorial` | `standard` | `challenge`); the folio map shows a short line via `folioMetaSummary()` in `src/features/ash-run/level/catalog.ts`.
