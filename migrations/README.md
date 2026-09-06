# 🗄️ Database migrations

This directory contains the ordered SQL changes used to create and update Macify's Cloudflare D1 database.

## 📦 Contents

- Numbered `.sql` files are immutable database changes applied by Wrangler.
- `meta/` contains Drizzle schema snapshots and the migration journal.
- `src/db/schema.ts` is the TypeScript schema source.

Wrangler records applied filenames in D1's `d1_migrations` table and runs only migrations that have not been applied.

## 🔄 Workflow

1. Change the relevant file in `src/db/`.
2. Run `npm run db:generate`.
3. Review the generated SQL and metadata.
4. Run `npm run db:check`.
5. Apply locally with `npm run db:migrate:local` and verify the application.
6. Back up production and apply with `npm run db:migrate:production` after explicit approval.

Never edit or remove an applied migration. Add a new migration instead. Commit generated SQL and metadata together. Do not store exports, live data, secrets, or Wrangler state here.
