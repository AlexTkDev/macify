# Database migrations

This directory contains ordered SQL changes for Macify's D1 database.

## Contents

- Numbered `.sql` files are immutable database changes applied by Wrangler.
- `meta/` contains Drizzle schema snapshots and the migration journal.
- [`src/db/schema.ts`](../src/db/schema.ts) exports the TypeScript schema.

Wrangler records applied filenames in D1's `d1_migrations` table and runs only migrations that have not been applied.

## Workflow

1. Change the relevant file in `src/db/`.
2. Run `npm run db:generate`.
3. Review the generated SQL and metadata.
4. Run `npm run db:check`.
5. Apply locally with `npm run db:migrate:local` and verify the affected behavior.
6. After explicit approval, back up production and run `npm run db:migrate:production`.

Never edit or remove an applied migration. Commit each new migration with its generated metadata. Do not store exports, live data, secrets, or Wrangler state here.
