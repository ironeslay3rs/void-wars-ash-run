# GitHub Actions → Vercel (optional deploy job)

The **Deploy to Vercel** job in `.github/workflows/ci.yml` runs **after** the `check` job passes. It is **skipped** until you add these **repository secrets**:

| Secret | Where to get it |
|--------|------------------|
| `VERCEL_TOKEN` | [Vercel → Account → Tokens](https://vercel.com/account/tokens) → Create |
| `VERCEL_ORG_ID` | Project **Settings → General** → *Team / Personal* ID, or run `vercel link` locally and read `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Same **General** page → *Project ID*, or `.vercel/project.json` → `projectId` |

**GitHub:** Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

**Do not** commit tokens. `.vercel/` is gitignored.

If these secrets are **absent**, only CI runs (lint/test/build) — safe for forks and new clones.

## Avoid double deploys

If the Vercel **GitHub App** already deploys every push, either:

- Leave secrets unset (CLI deploy job stays skipped), **or**
- Disable automatic Git deployments in **Vercel → Project → Settings → Git** and rely on Actions only.

Running **both** without care can produce two production builds per push.
