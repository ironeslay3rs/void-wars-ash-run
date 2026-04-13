# black-market-survivor

**Evolution: Void Wars** — local-first **Game Studio** hub with **Black Market Survivor** (`/survivor`) and **Void Wars: Ash Run** (`/ash-run`).

- **Workflow:** `npm run check` (lint, tests, build) — see [`docs/WORKFLOW.md`](docs/WORKFLOW.md).
- **Memory & next plan:** [`docs/PROJECT_MEMORY.md`](docs/PROJECT_MEMORY.md) ([`project-memory.md`](docs/project-memory.md)) — **Living state**, **Fence**, work log, queue, **inputs**; update **after each batch** (see `AGENTS.md`, `gsd-autonomous` rule).
- **Deploy:** Vercel + GitHub — import the repo in Vercel for preview/production builds; see [`docs/VERCEL_GITHUB.md`](docs/VERCEL_GITHUB.md).
- **Assistants & credentials** (MCP, CLI, CI): [`docs/ASSISTANT_INTEGRATIONS.md`](docs/ASSISTANT_INTEGRATIONS.md).
- **Lore & books:** [`lore-canon/`](lore-canon/) (master canon, seven-book saga, per-game locked rules). Player-facing taglines: [`src/lib/canon-lore.ts`](src/lib/canon-lore.ts).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
