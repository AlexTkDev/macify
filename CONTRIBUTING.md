# 🌱 Contribute to the Macify catalogue

Application and deal submissions are welcome. Each pull request may add one new application or deal manifest. Use an issue for code, documentation, design, or changes to an existing record.

## 🔎 Before you begin

- Check that the application is not already in [`catalog/apps`](catalog/apps).
- Confirm it is built for macOS or offers a meaningful Mac experience.
- Gather current official sources for features, pricing, requirements, privacy, and media.
- Follow the [editorial standard](docs/EDITORIAL.md).

## 📦 Add an application

1. Fork this repository and create a branch for the application.
2. Copy [`catalog/examples/application.example.json`](catalog/examples/application.example.json) to `catalog/apps/<slug>.json` using a lowercase, hyphenated slug.
3. Complete every field. Add existing application slugs to `relatedAppSlugs` when useful; a relationship declared by either application appears on both application pages.
4. Write a factual description covering purpose, features, audience, tradeoffs, privacy, requirements, and pricing. The editorial structure is a flexible template rather than a required heading layout.
5. Use direct public HTTPS URLs for authentic icons and screenshots. Do not commit image files.
6. Run `npm run catalogue:validate`.
7. Open a pull request containing only the new manifest and cite the official sources used.

## 🏷️ Add a deal

1. Choose an existing application in [`catalog/apps`](catalog/apps) and check that it does not already have a manifest in [`catalog/deals`](catalog/deals).
2. Copy [`catalog/examples/deal.example.json`](catalog/examples/deal.example.json) to `catalog/deals/<app-slug>.json`. Match `appSlug` and the filename to the existing application slug.
3. Enter the verified discount percentage, the code (or `null` when no code is required), and the official HTTPS offer URL.
4. Set `startsAt` and `endsAt` to the offer's actual availability dates using ISO 8601 timestamps with a timezone. The end must follow the start.
5. Verify the terms against an official source and follow the [deal verification standard](docs/EDITORIAL.md#deal-verification).
6. Run `npm run catalogue:validate`.
7. Open a pull request containing only the new deal manifest and cite the official source confirming the offer. Replace every example value with the actual offer details.

Maintainers handle changes to existing listings.

## ✅ Review and publication

Automated checks validate the manifest structure. Editors verify sources and content before publication; submission does not guarantee inclusion.
