# Contribute to the Macify catalogue

Each pull request may add one new application manifest. Use an issue for code, documentation, design, or changes to an existing record.

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

Deals are not currently available in production, so deal submissions are not being accepted. The repository retains supporting implementation and local preview fixtures for future development.

Maintainers handle changes to existing listings.

## Review and publication

Automated checks validate the manifest structure. Editors verify sources and content before publication; submission does not guarantee inclusion.
