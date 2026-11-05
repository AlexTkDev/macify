<!--
Public pull requests may add one new app, one new deal, or a matching new app-and-deal pair,
and change nothing else. For bugs, ideas, code, documentation, design, or changes
to an existing listing, open an issue instead.
-->

## Application or deal

Explain what the application or deal offers and why it belongs on Macify.

## Sources

For an application, link official sources for its features, pricing, privacy, requirements, and media. For a deal, link the official offer confirming the discount, code, destination, and availability dates.

## Checklist

- [ ] This pull request adds one new app, one new deal, or matching new `catalog/apps/<slug>.json` and `catalog/deals/<slug>.json` files, and changes nothing else.
- [ ] I followed the [contribution guidelines](../CONTRIBUTING.md), including deal verification when applicable.
- [ ] For an application, `isFeatured` and `isEditorsPick` are `false` or omitted.
- [ ] For an application, I used direct public HTTPS image source URLs and did not commit image binaries.
- [ ] For a deal, I linked official confirmation of its discount, code, dates, and eligibility restrictions.
- [ ] I ran `npm run catalogue:validate` successfully.
