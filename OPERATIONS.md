# Production operations

Remote commands, restoration, catalogue replacement, resource changes, and deployment require explicit approval.

## D1 protection

Before a production migration, bulk import, catalogue replacement, or destructive operation:

1. Record a D1 Time Travel bookmark.
2. Export the production database to a private location.
3. Verify the export is non-empty and record its SHA-256 checksum.
4. Keep the timestamp, migration version, change description, path, and checksum together.

```bash
npx wrangler d1 time-travel info macify-production-database --env production
npx wrangler d1 export macify-production-database --remote --env production --output=/secure/private/path/macify-production.sql
shasum -a 256 /secure/private/path/macify-production.sql
```

Never commit exports or backups. Encrypt retained backups and restrict access.

## Recovery

- For a recent accidental change, identify the last known-good UTC timestamp and use D1 Time Travel.
- For older or portable recovery, restore a verified SQL export into a disposable database first.
- For uncertain corruption, stop writes, preserve the current state, and investigate outside production.

A Time Travel restore overwrites the database and interrupts active queries. Record the pre-restore bookmark so the restore can be reversed. Never restore production without explicit approval.

After recovery, verify migration state, record counts, administrator login, search, media delivery, one application page, and one reversible dashboard edit.

## Catalogue replacement

`npm run production:replace-from-local` replaces production catalogue tables and synchronized R2 media from the local canonical dataset. It creates a D1 export first, but it is still destructive and requires explicit approval, a verified backup, and post-operation checks.

## Monitoring

- Monitor Worker exceptions, sustained 5xx responses, failed D1 operations, and abnormal authentication failures.
- Use an external uptime check for the homepage and one application page.
- Configure Cloudflare usage and billing notifications.
- Never log credentials, cookies, session values, imported content, or private data.
