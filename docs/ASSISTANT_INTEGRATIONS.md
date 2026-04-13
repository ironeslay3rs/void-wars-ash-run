# Assistants, GitHub, and Vercel — how access actually works

## The short version

- **Large models don’t have their own GitHub or Vercel accounts.** Anything that “uses GitHub” or “deploys to Vercel” does so **with credentials you already approved** somewhere (browser OAuth, personal access token, or CI secrets).
- **In this chat / Cursor:** Unless you’ve connected an integration (GitHub app, MCP server, etc.) or we run **CLI commands on your machine** (`git`, `vercel`) that use **your** logged-in session, the assistant only sees **what’s in the workspace** and what those commands print.

So: **connect once in the product you use** (Cursor, Claude app, GitHub Actions secrets). After that, tools can call APIs **as you** — not as a shared model user.

---

## What runs where

| Mechanism | Who’s authenticated | Typical use |
|-----------|----------------------|-------------|
| **GitHub Actions** (this repo) | **`VERCEL_*` / repo secrets** you set | `npm run check`, optional `vercel` deploy job — [`.github/DEPLOY_SECRETS.md`](../.github/DEPLOY_SECRETS.md) |
| **Vercel ↔ GitHub App** | You authorize in **Vercel’s UI** | Auto preview/production builds — [`VERCEL_GITHUB.md`](./VERCEL_GITHUB.md) |
| **Vercel CLI on your PC** | **`vercel login`** in your profile | Local `npx vercel` — [`VERCEL_GITHUB.md`](./VERCEL_GITHUB.md) § CLI |
| **Cursor / IDE Git** | **Your** Git credential helper / SSH | Push, pull, sometimes PR UI |
| **MCP “GitHub” server** | **PAT or OAuth** you configure in Cursor | Issues, PRs, API calls from the assistant — **you** create the token and scope it |

---

## Concrete setup steps (optional)

### A — Let CI deploy to Vercel (already documented)

1. Vercel: [Account → Tokens](https://vercel.com/account/tokens) → create token.  
2. Vercel: Project **Settings → General** → copy **Org ID** and **Project ID** (or use `.vercel/project.json` after `vercel link`).  
3. GitHub repo: **Settings → Secrets and variables → Actions** → add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.  
4. Read [`.github/DEPLOY_SECRETS.md`](../.github/DEPLOY_SECRETS.md) and choose Path A vs B in [`VERCEL_GITHUB.md`](./VERCEL_GITHUB.md) so you don’t double-deploy.

### B — Let an assistant use GitHub’s API (MCP / integrations)

1. GitHub: **Settings → Developer settings → Personal access tokens** (fine-grained or classic).  
2. Scopes: only what you need (e.g. `repo` for private repos, `pull_requests`, `issues`).  
3. Paste into **your** Cursor MCP / integration settings — not into chat.  
4. Rotate or revoke the token if it leaks.

### C — Local git push from the IDE / terminal

1. **SSH key** or **Git Credential Manager** — standard GitHub docs.  
2. The assistant can run `git push` **in your environment**; success still depends on **your** auth, not the model’s.

---

## Security habits

- **Never** commit tokens. This repo gitignores `.vercel/`; GitHub Actions uses **secrets**, not files in the tree.  
- Prefer **fine-grained PATs** with minimal scope and expiry.  
- Treat “the assistant opened a PR” as “**your token** opened a PR through the tool you configured.”

---

## See also

- [`WORKFLOW.md`](./WORKFLOW.md) — daily loop and checks.  
- [`VERCEL_GITHUB.md`](./VERCEL_GITHUB.md) — deploy paths and troubleshooting.
