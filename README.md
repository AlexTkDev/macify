# Macify

Macify is a curated directory of useful macOS applications. GitHub holds the source app manifests; Cloudflare D1 serves reviewed listings, and R2 stores their media. A protected dashboard gives Macify final control over publication, placement, deals, and removal.

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

`npm run dev` validates `catalog/apps` and synchronizes the manifests into local D1 before Next.js starts. Run `npm run catalogue:sync:local` to refresh an already-running development server. This command is local-only, preserves dashboard-managed featured state and existing media, and never writes to production.

Use `npm run preview` when a change needs verification in the Workers runtime.

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
docs/           Product, design, editorial, operations, and release guidance
catalog/apps/   Public, one-file-per-application catalogue manifests
catalog/examples/ Contributor-ready application example
catalog/schema/ Application manifest schema
scripts/        Catalogue validation and GitHub synchronization tools
public/         Static public assets
```

## Documentation

- [`docs/PRODUCT.md`](docs/PRODUCT.md): product behavior and scope
- [`docs/DESIGN.md`](docs/DESIGN.md): public interface direction
- [`docs/EDITORIAL.md`](docs/EDITORIAL.md): research and writing standard
- [`docs/HOMEPAGE_CURATION.md`](docs/HOMEPAGE_CURATION.md): homepage selection rules
- [`migrations/README.md`](migrations/README.md): database change workflow
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md): production data protection and recovery
- [`docs/RELEASE.md`](docs/RELEASE.md): validation and production deployment
- [`CONTRIBUTING.md`](CONTRIBUTING.md): public catalogue contribution workflow
- [`SECURITY.md`](SECURITY.md): private vulnerability reporting

## Application workflow

Public pull requests may add one complete application manifest under `catalog/apps`. Automated checks validate its structure and sources, but Macify editors decide whether it meets the directory's standard.

No issue is required for a new application. For corrections, bugs, feature ideas, code, design, or documentation changes, open an issue instead; those changes remain maintainer-managed.

After merge, the workflow sends the manifest to Cloudflare. Media is validated and stored in R2, while the proposed listing becomes a pending D1 revision. It becomes public only after an editor publishes it from the dashboard. Corrections, relationships, featured placement, deals, and removals remain editor-managed.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) to propose an application.

## Deferred public features

The public blog and application-submission entry points are intentionally hidden from the site header. They remain future features; the current navigation promotes **Surprise me** as its primary action.

## Trending applications

The homepage offers **Hot**, **Trending**, and **Latest** rankings. Hot uses unique DataFast visitors over seven days; Trending compares the latest three-day window with the preceding three days; Latest uses publication time. The server reads DataFast through the `DATAFAST_API_KEY` secret, caches analytics for one hour, and never exposes the key to browser code. Local development and analytics failures fall back to the curated 30-application directory.

## Safety

- Never commit `.dev.vars`, credentials, exports, backups, or Wrangler state.
- Browser code must not access D1 or R2 bindings directly.
- Remote migrations, deployments, data replacement, DNS, resources, and secrets require explicit approval.
- Back up production D1 before migrations, bulk synchronization, or destructive operations.
