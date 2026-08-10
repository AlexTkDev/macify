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
data/           Canonical catalogue preparation data
scripts/        Editorial, media, import, and operations tools
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

## Safety

- Never commit `.dev.vars`, credentials, exports, backups, or Wrangler state.
- Browser code must not access D1 or R2 bindings directly.
- Remote migrations, deployments, data replacement, DNS, resources, and secrets require explicit approval.
- Back up production D1 before migrations, imports, catalogue replacement, or destructive operations.
