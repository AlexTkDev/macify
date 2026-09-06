# Macify

Macify is a curated directory of useful macOS applications. The repository contains the public website, a protected editorial dashboard, and the Cloudflare data and media services that support them.

## Stack

- Next.js App Router, React, and TypeScript
- Cloudflare Workers through OpenNext
- Cloudflare D1 with Drizzle ORM
- Cloudflare R2 and Cloudflare Images

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars
npm run cf-typegen
npm run db:migrate:local
npm run dev
```

Optional catalogue seed commands are listed in `package.json`. Use `npm run preview` when a change needs verification in the Workers runtime.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run db:check
```

Run `db:check` when the schema or migrations change. Review every generated migration before applying it.

## Project structure

```text
src/app/        Routes, layouts, handlers, and server actions
src/components/ Shared interface components
src/db/         D1 client and Drizzle schema
src/lib/        Queries, validation, media, and utilities
migrations/     Ordered D1 migrations and Drizzle metadata
catalog/apps/   Public, one-file-per-application catalogue manifests
catalog/deals/  Separate deal manifests linked by application slug
catalog/examples/ Contributor-ready application and deal examples
catalog/schema/ Application and deal schemas
scripts/        Catalogue validation and GitHub synchronization tools
public/         Static public assets
```

## Documentation

- [`PRODUCT.md`](PRODUCT.md): product behavior and scope
- [`DESIGN.md`](DESIGN.md): public interface direction
- [`EDITORIAL.md`](EDITORIAL.md): research and writing standard
- [`HOMEPAGE_CURATION.md`](HOMEPAGE_CURATION.md): homepage selection rules
- [`migrations/README.md`](migrations/README.md): database change workflow
- [`OPERATIONS.md`](OPERATIONS.md): production data protection and recovery
- [`RELEASE.md`](RELEASE.md): validation and production deployment
- [`CONTRIBUTING.md`](CONTRIBUTING.md): public catalogue contribution workflow
- [`SECURITY.md`](SECURITY.md): private vulnerability reporting

## Catalogue workflow

GitHub is the canonical source for contributed application content, while Cloudflare remains the serving layer. Pull requests validate one JSON manifest per application. After a merge, an authenticated workflow sends only changed manifests to the Worker. The Worker validates the manifest, safely downloads and optimizes changed remote images into R2, and stores a pending revision in D1. An administrator must publish that exact revision from the dashboard; a pending or failed update never replaces the live application.

Featured placement remains a dashboard-only D1 setting. Deal manifests live separately from application manifests and link to them through the application slug.

## Deferred public features

The public blog and application-submission entry points are intentionally hidden from the site header. They remain future features; the current navigation promotes **Surprise me** as its primary action.

## Trending applications

The homepage offers **Hot**, **Trending**, and **Latest** rankings. Hot uses unique DataFast visitors over seven days; Trending compares the latest three-day window with the preceding three days; Latest uses publication time. The server reads DataFast through the `DATAFAST_API_KEY` secret, caches analytics for one hour, and never exposes the key to browser code. Local development and analytics failures fall back to the curated 30-application directory.

## Safety

- Never commit `.dev.vars`, credentials, exports, backups, or Wrangler state.
- Browser code must not access D1 or R2 bindings directly.
- Remote migrations, deployments, data replacement, DNS, resources, and secrets require explicit approval.
- Back up production D1 before migrations, bulk synchronization, or destructive operations.
