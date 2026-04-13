# Vercel + GitHub workflow

This repo is a **Next.js** app. Use **GitHub for source + CI** and **Vercel for hosting** (preview + production).

## Choose one deploy path (recommended)

| Path | What deploys | When to use |
|------|----------------|-------------|
| **A — Vercel GitHub App only** | Vercel builds on every push/PR | Simplest: import repo in [Vercel](https://vercel.com/new), no Actions secrets. |
| **B — GitHub Actions only** | Our workflow runs `vercel pull` → `build` → `deploy --prebuilt` after `npm run check` passes | You want **deploy only if CI is green**, or one pipeline to rule them all. Requires [three secrets](../.github/DEPLOY_SECRETS.md). **Turn off** duplicate auto-deploys in Vercel → Project → Git. |
| **C — Both** | Two builds per event | Easy to duplicate production deploys — **avoid** unless you know why. |

---

## 1. Connect the repo to Vercel

1. Sign in at [vercel.com](https://vercel.com) (GitHub SSO is fine).
2. **Add New Project** → **Import** your `black-market-survivor` GitHub repository.
3. Vercel detects **Next.js** — leave defaults:
   - **Framework Preset:** Next.js  
   - **Build Command:** `next build` (or rely on default)  
   - **Output:** Next.js default  
4. **Deploy.** The first production deployment completes from `main`.

## 2. What happens on each Git event

| Event | GitHub Actions `check` job | Optional `vercel` job (Path B) | Vercel App alone (Path A) |
|--------|---------------------------|--------------------------------|---------------------------|
| **Pull request** | `npm run check` | Preview deploy after green CI | Preview deploy |
| **Push to `main`** | `npm run check` | Production deploy after green CI | Production deploy |

Run **`npm run check` locally** before pushing. With **Path B**, a failing `check` **blocks** deploy — tests must pass before Vercel receives a build.

### Path B: enable Actions → Vercel

1. Add secrets: see [`.github/DEPLOY_SECRETS.md`](../.github/DEPLOY_SECRETS.md).
2. In Vercel, **disable** redundant Git-triggered production builds if you only want the Actions pipeline (or leave Path A and **do not** add secrets).

## 3. Branch protection (recommended)

In **GitHub** → **Settings** → **Branches** → add a rule for `main`:

- Require **status checks** to pass before merging — select **CI** / `check` (and optionally **Deploy to Vercel** if you use Path B).
- Optionally require pull requests before merging.

## 4. Environment variables

- This game is **local-first** (no required API keys for core play).
- If you add secrets later: **Vercel Dashboard** → Project → **Settings** → **Environment Variables** — set per **Production** / **Preview** / **Development**.

## 5. CLI (optional)

Install [Vercel CLI](https://vercel.com/docs/cli) for manual previews or logs:

```bash
npm i -g vercel
vercel login
vercel link   # once per clone
vercel        # preview deploy from cwd
```

Production: `vercel --prod` (only if you are not relying solely on Git pushes).

## 6. Troubleshooting

- **Build works locally but fails on Vercel:** Check Node version — we use **20** (see `.nvmrc`). Set **Environment Variable** `NODE_VERSION=20` in Vercel if needed, or add `engines` in `package.json` (already present).
- **Wrong project linked:** `vercel link` in the repo root or re-import the repo in the dashboard.
