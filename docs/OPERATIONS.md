# ⚙️ Production operations

Remote commands, restoration, catalogue replacement, resource changes, and deployment always require explicit approval.

## 🛡️ D1 protection

Before a production migration, bulk synchronization, restoration, or destructive operation:

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

## 🛟 Recovery

- For a recent accidental change, identify the last known-good UTC timestamp and use D1 Time Travel.
- For older or portable recovery, restore a verified SQL export into a disposable database first.
- For uncertain corruption, stop writes, preserve the current state, and investigate outside production.

A Time Travel restore overwrites the database and interrupts active queries. Record the pre-restore bookmark so the restore can be reversed. Never restore production without explicit approval.

After recovery, verify migration state, record counts, administrator login, search, media delivery, one application page, and one reversible featured or deal edit.

## 🔄 Catalogue synchronization

Configure `CATALOG_SYNC_SECRET` as both a Worker secret and a GitHub Actions secret. Configure `CATALOG_SYNC_URL` in GitHub Actions with the full `/api/internal/catalogue-sync` URL, and set `CATALOG_REPOSITORY` on the Worker to the exact `owner/repository` value.

Protect `main` in GitHub: require pull requests, at least one code-owner approval, and the `Catalogue / validate` status check; dismiss stale approvals when new commits arrive; block force pushes and branch deletion. Keep workflow permissions read-only except where a future workflow explicitly requires more.

Synchronization is incremental and non-destructive: each changed manifest creates a pending revision. Publishing from the protected dashboard applies the revision to D1. Image source changes are downloaded, validated, optimized, and stored in R2 before review. Never use synchronization as a bulk production replacement mechanism.

The old production replacement script has been removed. Restore only from a verified backup or D1 Time Travel after explicit approval.

## 📡 Monitoring

- Monitor Worker exceptions, sustained 5xx responses, failed D1 operations, and abnormal authentication failures.
- Use an external uptime check for the homepage and one application page.
- Configure Cloudflare usage and billing notifications.
- Never log credentials, cookies, session values, synchronized content bodies, or private data.
