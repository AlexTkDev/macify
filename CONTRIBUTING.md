# Contributing to Macify

Macify accepts application, correction, and deal contributions through pull requests. Start with the files in [`catalog/examples`](catalog/examples); examples are documentation and are never published as catalogue records.

## Add or update an application

1. Copy [`catalog/examples/application.example.json`](catalog/examples/application.example.json) to `catalog/apps`, then name it with the application's lowercase, hyphenated slug: `catalog/apps/example-app.json`.
2. Include direct HTTPS source URLs for the icon, preview image, and up to eight screenshots. Do not commit image files. Use stable, publicly accessible sources that you are permitted to share.
3. Keep `relatedAppSlugs` reciprocal: if app A names app B, app B must also name app A in the same pull request.
4. Keep descriptions factual and editorial. Follow [`EDITORIAL.md`](EDITORIAL.md).
5. Run `npm run catalogue:validate`.
6. Open a pull request explaining the addition or correction and identifying authoritative sources for claims.

Merging does not publish content immediately. Cloudflare validates and optimizes changed media, then creates a pending revision in Macify's protected editorial dashboard. An administrator reviews and publishes it. Existing live content remains available while an update is pending.

Featured placement is an editorial setting and intentionally does not exist in public manifests. Pull requests cannot change it.

## Add or update a deal

1. Copy [`catalog/examples/deal.example.json`](catalog/examples/deal.example.json) to `catalog/deals`.
2. Name the file with the existing application's slug and use the same value for `appSlug`: `catalog/deals/example-app.json`.
3. Enter the percentage as an integer, the final HTTPS destination URL, and ISO 8601 start and end times with a timezone.
4. Use `null` when no discount code is required, and set `affiliate` accurately.
5. Run `npm run catalogue:validate`.

Deal manifests are maintained separately so an offer can change or expire without rewriting the application's catalogue record. See [`catalog/deals/README.md`](catalog/deals/README.md) for the complete relationship rule.

## Remove an application

Delete its manifest and explain why in the pull request. A merge creates an archive request for editorial review; it does not immediately remove the live page.

## Security and privacy

Do not include secrets, private contact information, account credentials, analytics exports, database backups, or copyrighted image binaries. Report vulnerabilities privately as described in [`SECURITY.md`](SECURITY.md).
