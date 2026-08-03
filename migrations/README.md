# Database migrations

This directory contains the ordered SQL history for Macify's Cloudflare D1 database.

## What belongs here

- Numbered `.sql` files are immutable database changes applied by Wrangler.
- `meta/` contains Drizzle Kit's generated schema snapshots and migration journal.
- `README.md` documents the contract; Wrangler ignores non-SQL files.

The TypeScript source of truth is `src/db/schema.ts`. Drizzle Kit compares that schema with the latest snapshot in `meta/` and generates the next SQL file. Wrangler applies the SQL files to local, staging, or production D1 and records completed filenames in D1's `d1_migrations` table.

## Workflow

1. Change `src/db/schema.ts`.
2. Run `npm run db:generate`.
3. Review the generated SQL and snapshot.
4. Run `npm run db:check`.
5. Apply locally with `npm run db:migrate:local`.
6. Test the application.
7. Apply to staging before production.

Never edit an already-applied SQL migration. Add a new migration instead. Commit generated SQL and `meta/` files together. Do not place database exports, user data, secrets, or local Wrangler state in this directory.

## Existing history

- `0000`: initial tables and indexes.
- `0001`: required category reference data.
- `0002`: optional YouTube URL on applications.
- `0003`: rename stored media roles from OG image to preview image.
- `0004`: synchronize Drizzle metadata after the manually authored `0002` migration.
