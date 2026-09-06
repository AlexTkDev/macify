# Contributing to Macify

Macify accepts pull requests that add useful macOS applications. Public contribution pull requests may add exactly one new file under [`catalog/apps`](catalog/apps) and may not change existing files.

## Add an application

1. Copy [`catalog/examples/application.example.json`](catalog/examples/application.example.json) to `catalog/apps`, then name it with the application's lowercase, hyphenated slug: `catalog/apps/example-app.json`.
2. Complete every field. Use `null` or an empty array only where the example permits it, and leave `relatedAppSlugs` empty for a public submission.
3. Write a factual description following [`EDITORIAL.md`](EDITORIAL.md), including features, fit, privacy and requirements, and pricing.
4. Use direct public HTTPS URLs for the icon and preview. Do not commit image files.
5. Run `npm run catalogue:validate`, then open a pull request with links to authoritative sources.

Automated checks verify completeness and structure, not editorial quality. Macify decides what is accepted, may request changes, and may reject or later remove any listing.

After a pull request is merged, Cloudflare prepares a pending revision. An editor must publish it from the protected dashboard before it appears publicly.

## Repository scope

Corrections, removals, relationships, featured placement, and deals are maintained by Macify editors. Open an issue when an existing listing needs attention.

## Security and privacy

Do not include secrets, private contact information, account credentials, analytics exports, database backups, or copyrighted image binaries. Report vulnerabilities privately as described in [`SECURITY.md`](SECURITY.md).
