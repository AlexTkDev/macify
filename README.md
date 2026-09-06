# Macify

**Mac apps worth making room for.**

Finding a good Mac app should not mean digging through promotional listicles, abandoned projects, or pages of nearly identical choices. Macify is a carefully curated directory of applications that can make your Mac more useful, personal, and enjoyable.

Search for something specific, browse by category, or move between related applications until you find the right fit. Every listing is written to explain what the app does, who it is for, what it costs, and any tradeoffs worth knowing before you install it.

[Browse Macify →](https://macify.app)

## Add an app

If you make a Mac app—or simply know a great one we have missed—you are welcome to propose it. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request; each public contribution may add one new application.

If an existing listing is incorrect or outdated, please [open an issue](https://github.com/Beingpax/macify/issues/new/choose) instead. The same goes for bugs and ideas about the website.

If Macify helps you discover something useful, give the repository a star. Fork it when you are ready to contribute an application.

## Development

Macify is built with Next.js and TypeScript, runs on Cloudflare Workers, and uses D1 for reviewed listings and R2 for application media.

To run it locally:

```bash
npm install
cp .dev.vars.example .dev.vars
npm run cf-typegen
npm run db:migrate:local
npm run dev
```

The development server validates and syncs the local catalogue before starting. To refresh catalogue changes while it is already running, use `npm run catalogue:sync:local`.

Before changing product behavior, interface design, or catalogue copy, read [`docs/PRODUCT.md`](docs/PRODUCT.md), [`docs/DESIGN.md`](docs/DESIGN.md), and [`docs/EDITORIAL.md`](docs/EDITORIAL.md). Operational and release details live in [`docs/OPERATIONS.md`](docs/OPERATIONS.md) and [`docs/RELEASE.md`](docs/RELEASE.md).

Run the relevant checks before submitting repository changes:

```bash
npm run typecheck
npm run lint
npm run db:check
```
