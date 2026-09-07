# 🗄️ Database migrations

These ordered SQL files upgrade both local and production databases. Their numbers
preserve execution order; their names describe the change. Older steps can describe
features that a later step removes.

Migration 0001 seeded the original category tables and has been retired. Migration
0006 removes those tables. Existing 0001 entries in applied migration history must
be preserved.

| File | Purpose |
| --- | --- |
| [0000_create_initial_directory_schema.sql](0000_create_initial_directory_schema.sql) | Create the original app, media, taxonomy, relationship, import, and redirect tables. |
| [0002_add_youtube_url.sql](0002_add_youtube_url.sql) | Add an optional YouTube demo URL to applications. |
| [0003_rename_media_role_to_preview_image.sql](0003_rename_media_role_to_preview_image.sql) | Rename the stored media role from og_image to preview_image. |
| [0004_sync_youtube_url_schema_snapshot.sql](0004_sync_youtube_url_schema_snapshot.sql) | Record the YouTube column in Drizzle history; SQL intentionally changes nothing. |
| [0005_normalize_pricing_and_remove_legacy_app_fields.sql](0005_normalize_pricing_and_remove_legacy_app_fields.sql) | Normalize pricing and billing, and remove summary, source URL, and minimum macOS fields. |
| [0006_drop_original_category_tables.sql](0006_drop_original_category_tables.sql) | Drop the original category tables before replacing tags with categories. |
| [0007_add_admin_login_attempt_tracking.sql](0007_add_admin_login_attempt_tracking.sql) | Store login attempts and expiry times for admin authentication throttling. |
| [0008_replace_tags_with_categories.sql](0008_replace_tags_with_categories.sql) | Rename tags to categories and rebuild their application associations. |
| [0009_add_catalogue_revisions_deals_and_featured_apps.sql](0009_add_catalogue_revisions_deals_and_featured_apps.sql) | Add catalogue review history, deals, and featured application fields. |
| [0010_remove_processor_compatibility_fields.sql](0010_remove_processor_compatibility_fields.sql) | Remove Apple Silicon and Intel compatibility fields. |
| [0011_remove_legacy_imports_redirects_and_metadata.sql](0011_remove_legacy_imports_redirects_and_metadata.sql) | Remove legacy imports, redirects, and unused app, relationship, and media metadata. |

## 📦 Supporting files

`meta/_journal.json` records Drizzle's ordered migration tags. The nine
`meta/NNNN_snapshot.json` files (0000, 0004 through 0011) record schema states used
by Drizzle to generate changes. Keep those conventional filenames: Drizzle manages
them. SQL-only historical changes do not each have their own snapshot.

`../drizzle.config.ts` connects the current TypeScript schema to this directory.
`../scripts/apply-database-migrations.mjs` applies migrations and reconciles historical
filenames using `../scripts/lib/migration-filename-aliases.json`.

## 🔄 Local development

Run `npm run db:migrate:local` to apply pending migrations locally. Local setup and `npm run dev` use the same migration wrapper.

D1 tracks migration filenames. Use the npm command so historical names are reconciled before pending SQL is applied. Do not rename or replay previously applied migrations, or apply migrations from an older checkout after filename reconciliation.

## 🛠️ Generating changes

Use `npm run db:generate -- --name describe_the_database_change`, then review the SQL.
Run `npm run db:check` to check Drizzle's history. Do not rename generated snapshot files
or remove historical SQL just because a later migration supersedes it.
