# Overall upgrade roadmap

**Last plan refresh:** **Folio XXXVII** playable (`folio-interlude.ts`, **Intervenor**); **Folio XXXVIII** roadmap teaser (`folio_xxxviii_postlude`); prior slice: Survivor **brisk heist** (175 cr), Ash Run **touch strip**, **playSfx** unlock/PB. Sequel chapters still **vary layout before** adding an **11th** drone.

Single source of truth for cross-game and per-mode upgrades. **Status** is tracked here; ship work in vertical slices.

### Priority stack (what “done” means)

1. **Playability — core** — A folio or feature ships when it is **actually good to play**: readable geometry, fair patrol tempo, a gate duel that fits the arena, and honest unlocks. If it isn’t fun and clear under hand, it isn’t done—**no amount of lore saves a bad room**.
2. **Mechanics — middle** — Systems (drone count bands, hazards, PB, linear repair, survivor economy) exist to **serve** that play: legible escalation, skill expression, retention. Mechanics can change; they must not drift into hidden difficulty or fake progression.
3. **Lore — top** — Names, publishing metaphors, boss copy, and intro beats **dress** the mechanics and reward close reading. Lore **amplifies** play; it does **not** replace a playable map node or excuse a teaser masquerading as a stage.

Vertical slices follow this order: **playable level + tests first**, then tighten mechanical edges, then tune voice and card copy.

## Plan at a glance

1. **Ship the folio spine** — playable **I→XXXVII**; **XXXVIII+** as `roadmapOnly` until levels ship; **post–XII chapters** trade **new verbs** (…, bleed trim + signature stitch + gather fold, …) before raising patrol count.
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
- **Folio XIII+ (sequel chapters):** Hold **drone count** at the XII bar when possible; vary **macro layout** so each folio tests a different mistake profile — e.g. **Coda** = trench + stepping + busy floor; **Afterword** = zigzag approach + **dual islands** + **gulf** commit; **Postscript** = **zipper** floor read + **tripartite** patrol blocks + **bridge** timing between desks; **Index** = **vertical spines** + **mezzanine cross-reference** + **shelf-tab** finish; **Appendix** = **ceiling/floor margin clamp** + **twin-spine braid** (floor + ribbon) + **closing squeeze**; **Colophon** = **mirror bias** + **curtain columns** + **narrow seal lane** (printer’s mark); **Epilogue** = **U-void + bridge** + **relay tempo** + **twilight zipper** (last corridor); **Codex** = **center spine** + **facing pages** + **pit thread bridges** + **chronicler strip**; **Afterline** = **attest** side pinches + **hopscotch** islands over pits + **closing tread** teeth; **Vellum** = **shear veil** strips + **fold stack** tiers + **corona wax** clusters; **Endpaper** = **paste ladder** bands + **hinge sash** swing-tiers + **case tuck** pinch; **Flyleaf** = **deckle fray** teeth + **ruled void** grid + **press stamp** bars; **Halftitle** = **strike band** lines + **gutter bias** margin + **lead strip** cadence; **Frontispiece** = **plate frame** + **caption ledge** + **folio split**; **Title page** = **masthead lift** + **byline tread** + **imprint block**; **Copyright** = **statute strip** + **margin column** + **catalog block**; **Dedication** = **center well** + **ornament brackets** + **vow strip**; **Epigraph (XXX)** = **pull quote band** + **attribution rail** + **dash lead**; **Foreword (XXXI)** = **guest frame** + **aside column** + **handshake strip**; **Preface (XXXII)** = **raised thesis plinth** + **method rail** + **promise strip**; **Introduction (XXXIII)** = **threshold lintel** + **ingress bay** + **lede strip**; **Body matter (XXXIV)** = **measure column** + **rag ladder** + **river run**; **Incipit (XXXV)** = **drop cap plinth** + **ornament frieze** + **rubric runway**.
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
| **A–D** | Foundation + both modes | ✅ Hub, survivor economy/win, Ash folio I–XXXVII + XXXVIII teaser, CI, PWA, tests. |
| **C (ongoing)** | Folio spine | Playable chain through XXXVII; roadmap for XXXVIII+; save repair on new chapters. |
| **F** | Ash depth | ✅ XXXVII shipped (interlude **Intervenor**); **PB replay ghost** or **XXXVIII playable** next. |
| **G** | Survivor presets | ✅ Three heist bars (400 / 250 / 175 cr); optional numeric goal later. |
| **H** | Polish | ✅ Controls legend; ✅ unlock/PB SFX; ✅ touch strip; PB replay ghost optional. |
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
| Run starts | Month / sprint; **Iron** (no clinic); **Heist** with **400**, **250**, and **175** cr presets; `hardReset(day, ironman, creditsWinTarget?)`. |
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
| **Folio XVIII playable** | ✅ `folio_xviii_colophon` in `FOLIO_STAGE_ORDER`; `folio-colophon.ts`; HUD **Compositor**; **ten drones** (3+4+3) + mirror imprint + curtain bands + seal channel; unlock after XVII. Saves: repair adds XVIII when XVII was already cleared. |
| **Folio XIX playable** | ✅ `folio_xix_epilogue` in `FOLIO_STAGE_ORDER`; `folio-epilogue.ts`; HUD **Witness**; **ten drones** (3+4+3) + void ring + relay strip + twilight teeth; unlock after XVIII. Saves: repair adds XIX when XVIII was already cleared. |
| **Folio XX playable** | ✅ `folio_xx_codex` in `FOLIO_STAGE_ORDER`; `folio-codex.ts`; HUD **Chronicler**; **ten drones** (3+4+3) + spine/facing pages + thread bridges + strip; unlock after XIX. Saves: repair adds XX when XIX was already cleared. |
| **Folio XXI playable** | ✅ `folio_xxi_afterline` in `FOLIO_STAGE_ORDER`; `folio-afterline.ts`; HUD **Notary**; **ten drones** (3+4+3) + attest corridor + hopscotch relay + closing tread; unlock after XX. Saves: repair adds XXI when XX was already cleared. |
| **Folio XXII playable** | ✅ `folio_xxii_vellum` in `FOLIO_STAGE_ORDER`; `folio-vellum.ts`; HUD **Illuminator**; **ten drones** (3+4+3) + shear veil + fold stack + corona wax; unlock after XXI. Saves: repair adds XXII when XXI was already cleared. |
| **Folio XXIII playable** | ✅ `folio_xxiii_endpaper` in `FOLIO_STAGE_ORDER`; `folio-endpaper.ts`; HUD **Conservator**; **ten drones** (3+4+3) + paste ladder + hinge sash + case tuck; unlock after XXII. Saves: repair adds XXIII when XXII was already cleared. |
| **Folio XXIV playable** | ✅ `folio_xxiv_flyleaf` in `FOLIO_STAGE_ORDER`; `folio-flyleaf.ts`; HUD **Prefacer**; **ten drones** (3+4+3) + deckle fray + ruled void + press stamp; unlock after XXIII. Saves: repair adds XXIV when XXIII was already cleared. |
| **Folio XXV playable** | ✅ `folio_xxv_halftitle` in `FOLIO_STAGE_ORDER`; `folio-halftitle.ts`; HUD **Titler**; **ten drones** (3+4+3) + strike band + gutter bias + lead strip; unlock after XXIV. Saves: repair adds XXV when XXIV was already cleared. |
| **Folio XXVI playable** | ✅ `folio_xxvi_frontispiece` in `FOLIO_STAGE_ORDER`; `folio-frontispiece.ts`; HUD **Engraver**; **ten drones** (3+4+3) + plate frame + caption ledge + folio split; unlock after XXV. Saves: repair adds XXVI when XXV was already cleared. |
| **Folio XXVII playable** | ✅ `folio_xxvii_titlepage` in `FOLIO_STAGE_ORDER`; `folio-titlepage.ts`; HUD **Imprinter**; **ten drones** (3+4+3) + masthead lift + byline tread + imprint block; unlock after XXVI. Saves: repair adds XXVII when XXVI was already cleared. |
| **Folio XXVIII playable** | ✅ `folio_xxviii_copyright` in `FOLIO_STAGE_ORDER`; `folio-copyright.ts`; HUD **Registrar**; **ten drones** (3+4+3) + statute strip + margin column + catalog block; unlock after XXVII. Saves: repair adds XXVIII when XXVII was already cleared. |
| **Folio XXIX playable** | ✅ `folio_xxix_dedication` in `FOLIO_STAGE_ORDER`; `folio-dedication.ts`; HUD **Patron**; **ten drones** (3+4+3) + center well + ornament brackets + vow strip; unlock after XXVIII. Saves: repair adds XXIX when XXVIII was already cleared. |
| **Folio XXX playable** | ✅ `folio_xxx_epigraph` in `FOLIO_STAGE_ORDER`; `folio-epigraph-page.ts`; HUD **Citer**; **ten drones** (3+4+3) + pull quote band + attribution rail + dash lead; unlock after XXIX. Saves: repair adds XXX when XXIX was already cleared. |
| **Folio XXXI playable** | ✅ `folio_xxxi_foreword` in `FOLIO_STAGE_ORDER`; `folio-foreword.ts`; HUD **Interlocutor**; **ten drones** (3+4+3) + guest frame + aside column + handshake strip; unlock after XXX. Saves: repair adds XXXI when XXX was already cleared. |
| **Folio XXXII playable** | ✅ `folio_xxxii_preface` in `FOLIO_STAGE_ORDER`; `folio-preface.ts`; HUD **Scrivener**; **ten drones** (3+4+3) + thesis plinth + method rail + promise strip; unlock after XXXI. Saves: repair adds XXXII when XXXI was already cleared. |
| **Folio XXXIII playable** | ✅ `folio_xxxiii_introduction` in `FOLIO_STAGE_ORDER`; `folio-introduction.ts`; HUD **Usher**; **ten drones** (3+4+3) + threshold lintel + ingress bay + lede strip; unlock after XXXII. Saves: repair adds XXXIII when XXXII was already cleared. |
| **Folio XXXIV playable** | ✅ `folio_xxxiv_body` in `FOLIO_STAGE_ORDER`; `folio-body.ts`; HUD **Galleyman**; **ten drones** (3+4+3) + measure column + rag ladder + river run; unlock after XXXIII. Saves: repair adds XXXIV when XXXIII was already cleared. |
| **Folio XXXV playable** | ✅ `folio_xxxv_incipit` in `FOLIO_STAGE_ORDER`; `folio-incipit.ts`; HUD **Rubricator**; **ten drones** (3+4+3) + drop cap plinth + ornament frieze + rubric runway; unlock after XXXIV. Saves: repair adds XXXV when XXXIV was already cleared. |
| **Folio XXXVI playable** | ✅ `folio_xxxvi_chapter` in `FOLIO_STAGE_ORDER`; `folio-chapter.ts`; HUD **Pager**; **ten drones** + running head / folio break / section ladder read; unlock after XXXV. Saves: repair adds XXXVI when XXXV was already cleared. |
| **Folio XXXVII playable** | ✅ `folio_xxxvii_interlude` in `FOLIO_STAGE_ORDER`; `folio-interlude.ts`; HUD **Intervenor**; **ten drones** + bleed trim / signature stitch / gather fold; unlock after XXXVI. Saves: repair adds XXXVII when XXXVI was already cleared. |
| **Folio XXXVIII on map** | ✅ `folio_xxxviii_postlude` teaser (`roadmapOnly`); lock hint names XXXVII as latest clearable chapter. |
| **Ash Run controls legend** | ✅ `AshRunScene`: **H** toggles panel, **Esc** closes (then map), **Controls (H)** button; pause copy mentions H. |
| **Touch strip** | ✅ Narrow screens: left / jump / right buttons driving `inputRef`. |
| **SFX** | ✅ `playSfx("folio_unlock")` / `playSfx("personal_best")` — short Web Audio tones; no-op if blocked. |
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

**Heist:** `creditsWinTarget` — **400** (`HEIST_CREDITS_TARGET`), **250** (`HEIST_CREDITS_LIGHT`), or **175** (`HEIST_CREDITS_BRISK`); win when credits ≥ target while alive; **day goal still wins** too. Buttons in `RunResetRow`.

Not implemented: “pacifist” score. Optional `runMode` enum later if modes multiply.

## How to use this doc

1. Pick a **phase** and one **vertical slice**.
2. Update the **Phase table** when the slice merges.
3. Keep **save migrations** backward compatible (`mergeLoadedState`, folio `parse`).

## Next slices (priority order)

1. **Ash Run:** **Folio XXXVIII playable** (`folio_xxxviii_postlude` or successor id) — new macro layout; still **no 11th drone** until play data demands it; add **`folio_xxxix_*` roadmap** teaser when the slice lands.
2. **Ash Run:** **input-replay PB ghost** when design + bandwidth allow.
3. **Survivor:** optional numeric heist goal or richer `runMode` if presets become unwieldy.
4. **Polish:** optional mid-folio checkpoints (design decision); fuller SFX / music pass if desired.
