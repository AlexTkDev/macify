# Production operations

Remote writes, restoration, resource changes, catalogue replacement, and deployment require explicit approval.

## Protect D1

Before a production migration, bulk synchronization, restoration, or destructive operation:

1. Record a D1 Time Travel bookmark.
2. Export the production database to a private location.
3. Verify the export and record its SHA-256 checksum.
4. Record the timestamp, migration version, change, export path, and checksum.

```bash
npx wrangler d1 time-travel info macify-production-database --env production
npx wrangler d1 export macify-production-database --remote --env production --output=/secure/private/path/macify-production.sql
shasum -a 256 /secure/private/path/macify-production.sql
```

Never commit exports or backups. Encrypt and restrict retained copies.

## Recovery

- Recent mistake: restore from the last known-good UTC Time Travel point.
- Older or portable recovery: test a verified SQL export in a disposable database first.
- Uncertain corruption: stop writes, preserve current state, and investigate outside production.

A Time Travel restore overwrites D1 and interrupts queries. Record a pre-restore bookmark so it can be reversed. Production restoration always requires explicit approval.

After recovery, verify migrations, counts, administrator login, search, media delivery, one application page, and a reversible featured-placement change. Test deal review with a disposable revision, not a published offer.

## Catalogue synchronization

Configure:

- `CATALOG_SYNC_SECRET`: matching Worker and GitHub Actions secrets
- `CATALOG_SYNC_URL`: GitHub Actions secret containing the full `/api/internal/catalogue-sync` URL
- `CATALOG_REPOSITORY`: Worker variable containing the exact `owner/repository`

Protect `main` with pull requests, code-owner approval, the `Catalogue / validate` check, stale-approval dismissal, and blocks on force pushes and deletion. Keep workflow permissions read-only unless a specific step requires more.

Each changed application or deal manifest creates a pending revision. Dashboard publication applies that exact revision to D1; deals cannot be edited there. Changed application media is validated, optimized, and stored in R2 before review. Never use synchronization for bulk production replacement.

## Monitoring

- Monitor Worker exceptions, sustained 5xx responses, failed D1 operations, and abnormal authentication failures.
- Use an external uptime check for the homepage and one application page.
- Configure Cloudflare usage and billing notifications.
- Do not log credentials, cookies, sessions, synchronized content bodies, or private data.
