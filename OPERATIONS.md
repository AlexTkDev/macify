# Production operations

This runbook covers production data protection, monitoring, and the remaining operational work for Macify. Commands that include `--remote`, restore data, or change Cloudflare configuration require explicit approval.

## D1 backup and recovery

Macify uses two recovery layers:

1. **D1 Time Travel** is the first response to an accidental edit, destructive query, or failed migration. It provides point-in-time recovery on supported production D1 databases and is managed by Cloudflare.
2. **Full SQL exports** provide longer-lived, portable backups outside the live database. Exports contain production data, must never be committed, and should be encrypted at rest with access restricted to the administrator.

### Backup policy

- Before every production migration, bulk import, catalogue replacement, or destructive operation, record the current Time Travel bookmark and create a full SQL export.
- Create an automated daily production export for long-term recovery, retain 30 daily and 12 monthly copies, and store them in a private backup location separate from the live D1 database.
- Record the timestamp, database/environment, migration version, file size, and checksum for every export.
- Test recovery into a disposable non-production D1 database at least quarterly. A backup is not considered reliable until a restore has been verified.
- Never overwrite production merely to test a backup.

### Before a risky production change

```bash
npx wrangler d1 time-travel info macify-production-database --env production
npx wrangler d1 export macify-production-database --remote --env production --output=/secure/private/path/macify-production-YYYY-MM-DDTHHMMSSZ.sql
shasum -a 256 /secure/private/path/macify-production-YYYY-MM-DDTHHMMSSZ.sql
```

Keep the bookmark, export path, checksum, and change description in the release record. Confirm the export is non-empty and readable before continuing.

### Recovery decision

- **Recent accidental change:** identify the last known-good UTC timestamp, inspect its bookmark with `d1 time-travel info`, then use Time Travel restore.
- **Older incident or portability recovery:** provision a disposable D1 database, apply the matching committed migrations if needed, import the selected SQL export, and validate counts and critical records before deciding whether production should be replaced.
- **Uncertain corruption:** stop writes first, preserve a current export and bookmark, investigate on a disposable database, and only then choose a recovery point.

Time Travel restore overwrites the database in place and cancels in-flight queries. Record the pre-restore bookmark returned by Wrangler so the restore can be undone. Never run a production restore without explicit approval.

### Recovery verification

After recovery, verify migration state, application/media/tag/relationship counts, administrator login, one published application page, media delivery, search, and a reversible dashboard edit. Document the incident, recovery point, validation results, and any lost-write window.

## Monitoring and alerts

Workers Logs are enabled with sampling in `wrangler.jsonc`. Before the custom domain launch:

- Confirm production invocation logs and uncaught exceptions are visible.
- Alert on sustained 5xx errors, Worker exceptions, failed D1 operations, and abnormal authentication failures.
- Add an external uptime check for the homepage and one application page after the domain is connected.
- Configure Cloudflare usage and billing notifications.
- Avoid logging passwords, cookies, session values, imported content, or other sensitive data.

Start with Cloudflare-native logs and alerts. Add a third-party service only if longer retention, incident paging, or richer error traces become necessary.

## Remaining product safeguards

- **Dashboard search, filtering, and pagination — medium priority:** prevents slow, unwieldy full-catalogue screens as the directory grows. Use server-side indexed queries, bounded page sizes, stable sorting, and URL-based filters.
- **Media-import rate limiting — high before broader dashboard access:** limits accidental loops and abuse of outbound bandwidth, image processing, and storage. Keep strict URL validation and add per-administrator/IP quotas with clear retry errors.
- **Accessibility verification — high before public launch:** perform keyboard-only, focus-order, screen-reader, contrast, zoom, reduced-motion, form-error, and responsive checks against WCAG 2.2 AA.
- **Editorial verification — ongoing and required before publishing records:** verify product facts against official sources, distinguish fact from opinion, check pricing/date freshness, links, media rights, and spelling. Use a second review for high-impact or sponsored content.

The custom domain can be connected later; it does not block implementing database protection or operational readiness.
