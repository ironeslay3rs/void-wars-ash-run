# Overall upgrade roadmap

**Last plan refresh:** **Folio XVII** playable (`folio-appendix.ts`, **Binder**) — **ten drones**, **margin clamp + double-spine braid + squeeze** (3+4+3); **Folio XVIII** teaser (`folio_xviii_colophon`); sequel chapters still **vary layout before** adding an **11th** drone.

Single source of truth for cross-game and per-mode upgrades. **Status** is tracked here; ship work in vertical slices.

## Plan at a glance

1. **Ship the folio spine** — playable **I→XVII**; **XVIII+** as `roadmapOnly` until levels ship; **post–XII chapters** trade **new verbs** (trench, gulf, zipper + desks, stacks + catwalk, margins + braid, …) before raising patrol count.
2. **Polish runs** — in-game PB pace vs stored best (done); optional later: deterministic input replay ghost (skill expression + retry hook).
3. **Keep survivor deep but local** — sprint/month, **iron**, meltdown, services; **heist** as alternate win vector; optional `runMode` enum if presets multiply.
4. **Stay integration-light** — no accounts in this repo; CI + Vitest guard regressions.

## Game design framework

### Design pillars

| Pillar | Ash Run (folio) | Black Market Survivor |
|--------|-----------------|------------------------|
| **Readable challenge** | Geometry and patrols are meant to be *read* (E / perception) before committed movement. | Actions have clear credit/day/stress tradeoffs; meltdown is telegraphed. |
| **Honest escalation** | Longer folios, more drones, wider arenas—not hidden stat inflation. | Iron removes a safety valve; heist adds a second win condition without invalidating the day goal. |
| **Local mastery** | PB vs clock rewards repeat play without requiring servers. | Same: local runs, merge-friendly saves. |

### Core loops

- **Ash Run — outer loop:** Map → pick unlocked folio → one life clear (or fail) → unlock next / chase PB on cleared stages.
- **Ash Run — inner loop:** Read floor → platform → gate → miniboss duel on authored arena → exit. Boss HP stays in a **fixed band** (`LAB_SENTINEL_MAX_HP`) so difficulty comes from **space and tempo**, not sponges.
- **Survivor — outer loop:** Day loop with jobs, shop, crisis; victory by day target and/or heist credits.
- **Survivor — inner loop:** Risk fight vs safe work; spend on relief vs save for upgrades; fence as **no-day** economy valve.

### Difficulty & pacing (folio spine)

- **Folio I–II:** Onboard controls and reading; shorter Training yard as explicit low-stakes step.
- **Folio III–XII:** Challenge band; each chapter adds **one more patrol drone** on the gauntlet (III→XII: 2→10) so escalation is legible.
- **Folio XIII+ (sequel chapters):** Hold **drone count** at the XII bar when possible; vary **macro layout** so each folio tests a different mistake profile — e.g. **Coda** = trench + stepping + busy floor; **Afterword** = zigzag approach + **dual islands** + **gulf** commit; **Postscript** = **zipper** floor read + **tripartite** patrol blocks + **bridge** timing between desks; **Index** = **vertical spines** + **mezzanine cross-reference** + **shelf-tab** finish; **Appendix** = **ceiling/floor margin clamp** + **twin-spine braid** (floor + ribbon) + **closing squeeze**.
- **Miniboss identity:** Unique patrol box + HUD title per chapter reinforces “this arena belongs to this antagonist.”
- **Soft cap:** Do not add an **11th** patrol drone until playtests prove XII’s bar is solved; prefer layout and hazard choreography first.

### Progression & retention

- **Linear unlocks** reduce choice paralysis; first clear of stage *N* opens *N+1* (repair fixes old saves when new chapters ship).
- **Roadmap teasers** set expectation (“latest clearable folio is X”) without fake interactivity.
- **PB delta on HUD** supports speedrun-style engagement without ghost tech.

### Risk register (mitigations)

| Risk | Mitigation |
|------|------------|
| Map feels like a wall of cards | Metadata (`estMinutes`, difficulty band) + lock hints name the **previous** folio. |
| Late folios too long for one sitting | Card copy is an estimate; future: chapter checkpoints as design option (not yet a hard requirement). |
| Survivor mode explosion | Prefer `creditsWinTarget` presets over many bespoke modes until `runMode` is justified. |

## Big plan — phases (what “done” looks like)

| Phase | Theme | Target outcome |
|-------|--------|----------------|
| **A–D** | Foundation + both modes | ✅ Hub, survivor economy/win, Ash folio I–XVII + XVIII teaser, CI, PWA, tests. |
| **C (ongoing)** | Folio spine | Playable chain through XVII; roadmap for XVIII+; save repair on new chapters. |
| **F** | Ash depth | ✅ XVII shipped (appendix braid); **XVIII playable** or **controls legend / PB ghost** next. |
| **G** | Survivor presets | Multiple heist bars ✅; optional third preset or numeric goal later. |
| **H** | Polish | PB replay ghost, controls legend, audio pass, touch-friendly Ash Run if needed. |
| **E** | Product asks only | Accounts, cloud saves, multiplayer, leaderboards. |

## Vision

- **One repo, two modes**: grey-market survival (`/survivor`) and action folio (`/ash-run`), unified discovery at `/`.
- **Local-first**: no backend required; saves stay merge-friendly when fields are added.
- **Readable systems**: pure reducers for survivor sim; fixed-step sim for Ash Run.
- **Verified core**: Vitest covers merge rules, key survivor transitions, and folio unlock persistence (with a small `window` shim in tests).
- **Shared chrome**: design tokens in `globals.css` (`--studio-*`) for hub + shell; Ash Run keeps its stage palette inside the canvas/UI.

---

## Phase A — Foundation ✅

| Item | Outcome |
|------|---------|
| Hub | `/` lists both games with clear entry points. |
| Shared chrome | `AppShell` top nav (Studio / Survivor / Ash Run). |
| Survivor route | Game at `/survivor`. |
| Economy | **Fence**: sell scrap, no day (key `7`). |
| Win | **Victory** when **day ≥ victory target** (default **30**; **15** sprint) with health. |
| Docs | `gsd.md` route table; this file. |

## Phase B — Survivor v0.2 ✅

| Item | Outcome |
|------|---------|
| Stress crisis | **Meltdown** at 100 stress + 2-day cooldown (`nextMeltdownAllowedAfterDay`). |
| Services | **Intel** (8 cr), **Clinic repair** (48 cr, once) — disabled on **iron** runs (`ironman`). |
| Run starts | Month / sprint; **Iron** (no clinic); **Heist** with **400** and **250** cr presets; `hardReset(day, ironman, creditsWinTarget?)`. |
| Log variety | `logFlavors.ts` pools. |
| Design tokens | `--studio-*` in `globals.css`; shell + hub. |

## Phase C — Ash Run (folio)

| Item | Status |
|------|--------|
| **Chapter metadata on map** | ✅ `estMinutes`, `difficulty`, `folioMetaSummary()` on world cards. |
| **Folio III playable** | ✅ `folio_iii_vault` in `FOLIO_STAGE_ORDER`; `folio-vault.ts`; boss gate uses `createMinibossForLevel` (vault warden vs lab sentinel). |
| **Folio IV playable** | ✅ `folio_iv_fracture` in `FOLIO_STAGE_ORDER`; `folio-fracture.ts`; `createFractureHeraldMiniboss`; HUD **Herald**. Older saves: `loadFolioProgress` repairs missing next-stage unlocks after a clear. |
| **PB pace hint** | ✅ HUD shows `PB` line + `vs PB` delta when a stored best exists. |
| **Folio V playable** | ✅ `folio_v_reckoning` in `FOLIO_STAGE_ORDER`; `folio-reckoning.ts`; **Arbiter** miniboss; unlock after IV. |
| **Folio VI playable** | ✅ `folio_vi_closure` in `FOLIO_STAGE_ORDER`; `folio-closure.ts`; HUD **Magistrate**; unlock after V. |
| **Folio VII playable** | ✅ `folio_vii_exile` in `FOLIO_STAGE_ORDER`; `folio-exile.ts`; HUD **Gatekeeper**; unlock after VI. Saves: repair adds VII unlock when VI was already cleared. |
| **Folio VIII playable** | ✅ `folio_viii_horizon` in `FOLIO_STAGE_ORDER`; `folio-horizon.ts`; HUD **Sovereign**; six drones; unlock after VII. Saves: repair adds VIII when VII was already cleared. |
| **Folio IX playable** | ✅ `folio_ix_echo` in `FOLIO_STAGE_ORDER`; `folio-echo.ts`; HUD **Custodian**; seven drones; unlock after VIII. Saves: repair adds IX when VIII was already cleared. |
| **Folio X playable** | ✅ `folio_x_verge` in `FOLIO_STAGE_ORDER`; `folio-verge.ts`; HUD **Harbinger**; eight drones; unlock after IX. Saves: repair adds X when IX was already cleared. |
| **Folio XI playable** | ✅ `folio_xi_zenith` in `FOLIO_STAGE_ORDER`; `folio-zenith.ts`; HUD **Exarch**; nine drones; unlock after X. Saves: repair adds XI when X was already cleared. |
| **Folio XII playable** | ✅ `folio_xii_terminus` in `FOLIO_STAGE_ORDER`; `folio-terminus.ts`; HUD **Adjudicator**; ten drones; unlock after XI. Saves: repair adds XII when XI was already cleared. |
| **Folio XIII playable** | ✅ `folio_xiii_coda` in `FOLIO_STAGE_ORDER`; `folio-coda.ts`; HUD **Curator**; **ten drones** in **two clusters** with **trench + stepping read**; busier boss arena. Unlock after XII. Saves: repair adds XIII when XII was already cleared. |
| **Folio XIV playable** | ✅ `folio_xiv_afterword` in `FOLIO_STAGE_ORDER`; `folio-afterword.ts`; HUD **Scribe**; **ten drones** on **dual islands** separated by a **gulf**; zigzag intro hazards. Unlock after XIII. Saves: repair adds XIV when XIII was already cleared. |
| **Folio XV playable** | ✅ `folio_xv_postscript` in `FOLIO_STAGE_ORDER`; `folio-postscript.ts`; HUD **Archivist**; **ten drones** (3+4+3) + zipper opener + hazard gaps / micro-bridges between blocks; unlock after XIV. Saves: repair adds XV when XIV was already cleared. |
| **Folio XVI playable** | ✅ `folio_xvi_index` in `FOLIO_STAGE_ORDER`; `folio-index.ts`; HUD **Steward**; **ten drones** (3+3+4) + spine hazards + mezzanine band + tab shelves; unlock after XV. Saves: repair adds XVI when XV was already cleared. |
| **Folio XVII playable** | ✅ `folio_xvii_appendix` in `FOLIO_STAGE_ORDER`; `folio-appendix.ts`; HUD **Binder**; **ten drones** (3+4+3) + margin clamp + double-spine braid + squeeze; unlock after XVI. Saves: repair adds XVII when XVI was already cleared. |
| **Folio XVIII on map** | ✅ `folio_xviii_colophon` teaser (`roadmapOnly`); lock hint points players to XVII as latest playable. |
| Local PB ghost | ⏳ Full input replay + checksum (deferred). |

## Phase D — Cross-cutting

| Item | Status |
|------|--------|
| **Vitest** | ✅ `npm test` — `gameUtils`, `gameActions`, `folioProgress` (storage shim). |
| PWA manifest | ✅ `public/manifest.webmanifest` + `metadata.manifest` in root layout. |
| CI | ✅ `.github/workflows/ci.yml` — `lint`, `test`, `build` on push/PR to `main`/`master`. |

## Phase E — Out of scope until product asks

Multiplayer, accounts, cloud saves, full narrative tree, live leaderboards.

---

## Optional goal modes (Survivor)

**Implemented:** **30-day month** vs **15-day sprint** via `victoryTargetDay` and footer / game-over **New run** buttons.

**Iron:** `ironman` — clinic disabled (UI, key 9, action).

**Heist:** `creditsWinTarget` — **400** (`HEIST_CREDITS_TARGET`) or **250** (`HEIST_CREDITS_LIGHT`); win when credits ≥ target while alive; **day goal still wins** too. Buttons in `RunResetRow`.

Not implemented: “pacifist” score. Optional `runMode` enum later if modes multiply.

## How to use this doc

1. Pick a **phase** and one **vertical slice**.
2. Update the **Phase table** when the slice merges.
3. Keep **save migrations** backward compatible (`mergeLoadedState`, folio `parse`).

## Next slices (priority order)

1. **Ash Run:** **Folio XVIII playable** — new **macro verb** (distinct from prior sequel chapters); still **no 11th drone** until play data demands it.
2. **Cross-cutting:** **controls legend** (Ash Run) — lowers skill floor as the spine grows.
3. **Ash Run:** **input-replay PB ghost** when design + bandwidth allow.
4. **Survivor:** optional third heist tier or numeric input; richer `runMode` if presets become unwieldy.
