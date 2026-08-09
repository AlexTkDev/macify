# Macify

Macify.app is a curated directory of useful macOS applications. This repository contains the public directory, the editorial dashboard, and the Cloudflare-native data and media layer.

## Stack

- Next.js App Router and React
- Cloudflare Workers through the OpenNext adapter
- Cloudflare D1 and Drizzle ORM
- Cloudflare R2 for application media and import files
- Tailwind CSS plus project design tokens

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.dev.vars.example` to `.dev.vars`.
3. Generate Cloudflare binding types with `npm run cf-typegen`.
4. Apply the committed migrations locally with `npm run db:migrate:local`.
5. Optionally seed a local catalogue with one of the `db:seed:*` scripts.
6. Start Next.js with `npm run dev`.

Run `npm run db:generate` only after intentionally changing the Drizzle schema. Review the generated SQL and metadata before applying the new migration.

`npm run preview` builds the OpenNext Worker and runs it in the Workers runtime. The deployment scripts target configured Cloudflare environments; they do not replace the need to provision and identify the intended staging and production D1 databases and R2 buckets.

## Repository structure

```text
src/app/          Next.js routes, layouts, route handlers, and server actions
src/components/   Shared interface components
src/db/           Drizzle schema and D1 client
src/lib/          Shared queries, validation, media delivery, and utilities
migrations/       Ordered D1 SQL migrations and Drizzle metadata
public/           Static assets and response-header configuration
```

Configuration stays at the project root because Next.js, TypeScript, Drizzle Kit, and Wrangler discover their configuration files there. Product and design documentation also stays at the root so contributors and interface tooling can find it immediately.

See [`migrations/README.md`](migrations/README.md) before changing the database schema. The migration directory is committed because it is the reproducible history used to build every D1 environment; it does not contain live database data.

## Current status

The local application includes the public directory, application and tag pages, inline search, editorial CRUD workflows, publication controls, tag and relationship management, R2 media ingestion, Cloudflare Images optimization, CSV/JSON imports and exports, generated social cards, sitemap generation, and robots rules.

Before production launch, the editorial dashboard must be access-controlled, staging and production D1/R2 bindings must be completed, remote migrations and deployment must be validated in staging, and the catalogue needs final editorial and accessibility review. See [`PROJECT_CHECKLIST.md`](PROJECT_CHECKLIST.md) for the code-audited status.

## Safety

- Never commit `.dev.vars`, API keys, or production exports.
- Review generated migrations before applying them remotely.
- Run `npm run db:check` before committing schema changes.
- Use the staging environment before production.
- Public pages never access D1 or R2 directly from the browser.
