# Contributing to Macify

Macify accepts application additions and corrections through pull requests. Each application has one JSON manifest in [`catalog/apps`](catalog/apps), validated against [`catalog/schema/application.schema.json`](catalog/schema/application.schema.json).

## Add or update an application

1. Copy an existing manifest and name it with the application's lowercase, hyphenated slug: `catalog/apps/example-app.json`.
2. Include direct HTTPS source URLs for the icon, preview image, and up to eight screenshots. Do not commit image files. Use stable, publicly accessible sources that you are permitted to share.
3. Keep `relatedAppSlugs` reciprocal: if app A names app B, app B must also name app A in the same pull request.
4. Keep descriptions factual and editorial. Follow [`EDITORIAL.md`](EDITORIAL.md).
5. Run `npm run catalogue:validate`.
6. Open a pull request explaining the addition or correction and identifying authoritative sources for claims.

Merging does not publish content immediately. Cloudflare validates and optimizes changed media, then creates a pending revision in Macify's protected editorial dashboard. An administrator reviews and publishes it. Existing live content remains available while an update is pending.

Featured placement and deals are editorial settings and intentionally do not exist in public manifests. Pull requests cannot change them.

## Remove an application

Delete its manifest and explain why in the pull request. A merge creates an archive request for editorial review; it does not immediately remove the live page.

## Security and privacy

Do not include secrets, private contact information, account credentials, analytics exports, database backups, or copyrighted image binaries. Report vulnerabilities privately as described in [`SECURITY.md`](SECURITY.md).
