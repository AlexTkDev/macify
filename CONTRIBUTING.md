# Contributing to Macify

Macify accepts public pull requests only for new macOS application listings. Each pull request must add exactly one new file under [`catalog/apps`](catalog/apps) and change nothing else. You do not need to open an issue first.

For bugs, feature ideas, documentation, code, design, or changes to an existing listing, open an issue instead. These areas are maintained by Macify editors, and unsolicited pull requests for them are not reviewed.

## Add an application

1. Copy [`catalog/examples/application.example.json`](catalog/examples/application.example.json) to `catalog/apps`, then name it with the application's lowercase, hyphenated slug: `catalog/apps/example-app.json`.
2. Complete every field. Use `null` or an empty array only where the example permits it, and leave `relatedAppSlugs` empty for a public submission.
3. Write a factual description following [`docs/EDITORIAL.md`](docs/EDITORIAL.md), including features, fit, privacy and requirements, and pricing.
4. Use direct public HTTPS URLs for the icon and preview. Do not commit image files.
5. Run `npm run catalogue:validate`, then open a pull request with links to authoritative sources.

Automated checks verify completeness and structure, not editorial quality. Macify decides what is accepted, may request changes, and may reject or later remove any listing.

After a pull request is merged, Cloudflare prepares a pending revision. An editor must publish it from the protected dashboard before it appears publicly.

## Open an issue instead

Open an issue to:

- report incorrect or outdated listing information;
- request a correction or removal;
- report a website bug; or
- suggest a product, design, or documentation improvement.

Relationships, featured placement, deals, corrections, removals, and repository changes remain editor-managed. Opening an issue does not guarantee that a change will be accepted or implemented.

## Security and privacy

Do not include secrets, private contact information, account credentials, analytics exports, database backups, or copyrighted image binaries. Report vulnerabilities privately as described in [`SECURITY.md`](SECURITY.md).
