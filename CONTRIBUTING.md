# 🌱 Contribute to the Macify catalogue

If you develop a Mac application, or know one that is not yet listed and would be useful to other Mac users, you can propose it for the Macify catalogue.

Each contribution must add one new application manifest or one new deal manifest. Do not include code, documentation, design, or changes to an existing record in the same pull request.

## 🔎 Before you begin

- Check [`catalog/apps`](catalog/apps) to make sure the application is not already listed.
- Make sure the application is available for macOS or provides a meaningful Mac experience.
- Gather current official sources for its features, pricing, platform requirements, privacy practices, and media.
- Use the application's official website and authentic artwork.

## 📦 Submit an application

1. Fork this repository and create a branch for the application.
2. Copy [`catalog/examples/application.example.json`](catalog/examples/application.example.json) into [`catalog/apps`](catalog/apps).
3. Rename the file with the application's lowercase, hyphenated slug. For example, use `catalog/apps/example-app.json` for “Example App.”
4. Complete every field in the manifest. Use `null` or an empty array only where the example permits it, and leave `relatedAppSlugs` empty.
5. Write a factual description that follows [`docs/EDITORIAL.md`](docs/EDITORIAL.md). Explain what the application does, its useful features, who it suits, important tradeoffs, privacy and system requirements, and how it is priced.
6. Add direct public HTTPS URLs for the icon, preview, and any screenshots. Do not add image files to the repository.
7. Run `npm run catalogue:validate` and fix every reported error.
8. Open a pull request. Explain why the application would be valuable to Mac users and include links to the official sources used for the listing.

The pull request must add exactly one new file under `catalog/apps` and change nothing else.

## 🏷️ Submit a deal

1. Confirm the application already exists in [`catalog/apps`](catalog/apps).
2. Copy [`catalog/examples/deal.example.json`](catalog/examples/deal.example.json) into [`catalog/deals`](catalog/deals).
3. Rename the file to match the application slug and use that same value for `appSlug`.
4. Verify the exact discount, redemption code, destination URL, start time, and end time against an official source. Use explicit ISO 8601 timestamps with a timezone.
5. Run `npm run catalogue:validate`, then open a pull request containing only that one new deal manifest.

Deal edits and removals are made by repository maintainers through later GitHub changes. The dashboard never edits deal content.

## ✅ Review and publication

Automated checks confirm that the manifest is complete and correctly structured. A Macify editor then reviews the application, its sources, and the quality of the description. A submission may be edited, returned for changes, or declined, and submitting an application does not guarantee publication.

After a pull request is merged, Macify creates a pending catalogue revision. An editor must approve and publish that exact revision before an application becomes public or a deal becomes published catalogue state.
