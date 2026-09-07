# Contribute to the Macify catalogue

Each pull request may add one new application manifest or one new deal manifest. Use an issue for code, documentation, design, or changes to an existing record.

## Before you begin

- Check that the application is not already in [`catalog/apps`](catalog/apps).
- Confirm it is built for macOS or offers a meaningful Mac experience.
- Gather current official sources for features, pricing, requirements, privacy, and media.
- Follow the [editorial standard](docs/EDITORIAL.md).

## Add an application

1. Fork this repository and create a branch for the application.
2. Copy [`catalog/examples/application.example.json`](catalog/examples/application.example.json) to `catalog/apps/<slug>.json` using a lowercase, hyphenated slug.
3. Complete every field. Keep `relatedAppSlugs` empty and use `null` or an empty array only where allowed.
4. Write a factual description covering purpose, features, audience, tradeoffs, privacy, requirements, and pricing.
5. Use direct public HTTPS URLs for authentic icons and screenshots. Do not commit image files.
6. Run `npm run catalogue:validate`.
7. Open a pull request containing only the new manifest and cite the official sources used.

## Add a deal

1. Confirm the application already exists in [`catalog/apps`](catalog/apps).
2. Copy [`catalog/examples/deal.example.json`](catalog/examples/deal.example.json) to `catalog/deals/<app-slug>.json`.
3. Match the filename and `appSlug` to the application.
4. Verify the discount, code, destination, and availability window from an official source. Include a timezone in both timestamps.
5. Run `npm run catalogue:validate` and open a pull request containing only the deal manifest.

Deal edits and removals are made by repository maintainers through later GitHub changes. The dashboard never edits deal content.

## Review and publication

Checks validate the manifest structure; an editor verifies its sources and content. Merging creates a pending revision, not a public record. An editor must publish that exact revision from the protected dashboard.
