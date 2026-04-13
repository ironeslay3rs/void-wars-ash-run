# Development workflow

Single source for how we ship changes in this repo. **CI matches `npm run check`** — run it locally before you push.

**Session-to-session memory** lives in [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) ([`project-memory.md`](./project-memory.md) alias): **Living state**, **Fence**, work log, next plan, **inputs**, queue — **read at start**, **update after each batch** (see ritual + **`.cursor/rules/gsd-autonomous.mdc`** Step 7).

**How assistants relate to GitHub/Vercel** (OAuth, tokens, CI — no magic model account): [`ASSISTANT_INTEGRATIONS.md`](./ASSISTANT_INTEGRATIONS.md).

## Daily loop

1. `npm run dev` — Next.js app at `/`, `/survivor`, `/ash-run`.
2. Before commit / push: **`npm run check`** (`eslint` → `vitest` → `next build`).
3. Prefer small commits with [Conventional Commits](https://www.conventionalcommits.org/) style: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Environment

- **Node:** 20+ (see `.nvmrc`). CI uses Node 20.

## Lore vault (`lore-canon/`)

The **Evolution: Void Wars** IP (books 1–7, master canon, per-game rules) lives in **`lore-canon/`**.

| What | Where |
|------|--------|
| IP overview, locations, schools | `lore-canon/01 Master Canon/` |
| Book texts & extractions | `lore-canon/02 Books/` |
| **Ash Run** locked rules | `lore-canon/03 Games/Void Wars Ash Run/Locked Rules/Core Rules.md` |
| Media separation (books vs games) | `lore-canon/99 Core Rules/03 - Media Separation Rules.md` |
| Bridge note for coders | `lore-canon/GAME_BRIDGE.md` |

**In-game** taglines and safe paraphrases live in **`src/lib/canon-lore.ts`** — do not paste manuscript prose into components.

## Ash Run folio slice (vertical)

When adding or changing a playable folio, touch these in one slice when possible:

| Area | Files / actions |
|------|------------------|
| Level | `src/features/ash-run/level/folio-*.ts`, `create*Level()` |
| Catalog | `catalog.ts`: `FOLIO_STAGE_ORDER`, `FOLIO_STAGES`, `createLevelForId`, `introBeatForLevel`, `folioLockHint` if roadmap teaser |
| Boss | `enemy.ts` miniboss factory, `miniboss-registry.ts`, `hud.ts` title |
| Progress | `folioProgress.test.ts` (unlock + repair), `catalog.test.ts` |
| Copy | Hub `src/app/page.tsx`, `WorldMap.tsx`, `docs/OVERALL_UPGRADE.md`, `src/lib/canon-lore.ts` if saga-wide tone shifts |

**Invariant:** main floor solid should stay `x === 0` and span nearly full width so `create-initial-game-state` finds the floor (see `create-initial-state.ts`).

## Git / CI

- **Branches:** `main` is default; open PRs for non-trivial work when collaborating.
- **CI** (GitHub Actions): runs on push/PR to `main` / `master` — same as `npm run check`. Manual re-run: **Actions** → **CI** → **Run workflow**.

## Deploy: Vercel + GitHub

- **Hosting:** connect this repo in the [Vercel dashboard](https://vercel.com) — Vercel builds **preview** deployments for PRs and **production** for `main` (default).
- **CI-gated deploy (optional):** the **`vercel`** job in `.github/workflows/ci.yml` runs **after** `check` passes when the three secrets in [`.github/DEPLOY_SECRETS.md`](../.github/DEPLOY_SECRETS.md) are set — do **not** use the same time as the Vercel GitHub App without disabling one (see [`VERCEL_GITHUB.md`](./VERCEL_GITHUB.md)).
- **Full steps & branch protection:** [`VERCEL_GITHUB.md`](./VERCEL_GITHUB.md).

## Optional: GitLab

If you mirror to GitLab: reference issues with `#<id>` in commits/MRs when applicable; keep MRs focused (see team GitLab workflow rules in Cursor).
