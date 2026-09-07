# 🌱 Contribute to the Macify catalogue

If you develop a Mac application, or know one that is not yet listed and would be useful to other Mac users, you can propose it for the Macify catalogue.

Each contribution must add one new application manifest or one new deal manifest. Do not include code, documentation, design, or changes to an existing listing in the same pull request.

## 🔎 Before you begin

- Check [`catalog/apps`](catalog/apps) to make sure the application is not already listed.
- Make sure the application is available for macOS or provides a meaningful Mac experience.
- Gather current official sources for its features, pricing, platform requirements, privacy practices, and media.
- Use the application's official website and authentic artwork.

## 📦 Submit an application

1. Fork this repository and create a branch for the application.
2. Copy [`catalog/examples/application.example.json`](catalog/examples/application.example.json) into [`catalog/apps`](catalog/apps).
3. Rename the file with the application's lowercase, hyphenated slug. For example, use `catalog/apps/example-app.json` for “Example App.”
4. Complete every field in the manifest. Use `null` or an empty array only where the example permits it, and add existing application slugs to `relatedAppSlugs` when useful. A relationship declared by either application appears on both application pages.
5. Write a factual description using the adaptable template in [`docs/EDITORIAL.md`](docs/EDITORIAL.md). Explain what the application does, its useful features, who it suits, important tradeoffs, privacy and system requirements, and how it is priced.
6. Add unique, direct public HTTPS URLs and descriptive alternative text for one icon, one preview, and up to eight screenshots. Use PNG, JPEG, WebP, or AVIF; ICO is also supported for icons. Keep each source within 10 MiB. Do not add image files to the repository.
7. Run `npm run catalogue:validate` and fix every reported error.
8. Open a pull request. Explain why the application would be valuable to Mac users and include links to the official sources used for the listing.

The pull request must add exactly one new file under `catalog/apps` and change nothing else.

## 🏷️ Add a deal

1. Choose an existing application in [`catalog/apps`](catalog/apps) and check that it does not already have a manifest in [`catalog/deals`](catalog/deals).
2. Copy [`catalog/examples/deal.example.json`](catalog/examples/deal.example.json) to `catalog/deals/<app-slug>.json`. Match `appSlug` and the filename to the existing application slug.
3. Enter the verified integer discount percentage (1–100), the code (or `null` when no code is required), and the official HTTPS offer URL.
4. Set `startsAt` and `endsAt` to the offer's actual availability dates using ISO 8601 timestamps with a timezone. The end must follow the start.
5. Verify the terms against an official source and follow the [deal verification standard](docs/EDITORIAL.md#deal-verification).
6. Run `npm run catalogue:validate`.
7. Open a pull request containing only the new deal manifest and cite the official source confirming the offer. Replace every example value with the actual offer details.

Maintainers handle changes to existing listings.

## ✅ Review and publication

Automated checks confirm that the manifest is complete and correctly structured. A Macify editor then reviews the application, its sources, and the quality of the description. A submission may be edited, returned for changes, or declined, and submitting an application does not guarantee publication.

Merged submissions require editorial approval before publication. An approved deal appears publicly only during its availability window and while its application is published.
