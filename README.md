# market-maker-ai

Next.js App Router marketing site for [marketmaker.ai](https://marketmaker.ai), built with Tailwind CSS and shadcn/ui. The app lives at the **repository root** so [v0](https://v0.app) Git Import and Vercel can detect Next.js without a subdirectory or monorepo root-directory setting.

## Open in v0

1. Install the [Vercel GitHub App](https://github.com/apps/vercel) with access to this repository (required for Git Import).
2. In [v0](https://v0.app), open **Git Import** and paste:

   `https://github.com/tayden-b/market-maker-ai`

3. Leave the **root directory** as `/` (or empty). Do not nest this app under `apps/`.
4. Create a new Vercel project (or link an existing one) and start from `main`. v0 will cut a working branch such as `v0/main-…` and open PRs back into `main`.

You can also import from a new chat attachment menu: **Git Import → paste URL → Import**.

## Local development

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

```bash
pnpm build
```

## Stack

| Piece | Location |
| --- | --- |
| Next.js App Router | `app/` |
| Page composition | `app/page.tsx` |
| UI sections | `components/marketmaker/` |
| shadcn/ui | `components/ui/` + `components.json` |
| Utilities | `lib/utils.ts` |

This is a single Next.js app (not a Turborepo). `package.json`, `next.config.mjs`, `tsconfig.json`, and `app/` are all at `/` so v0’s preview (`next dev` / `next build`) resolves them without extra config.
