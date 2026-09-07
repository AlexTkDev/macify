# 🗂️ Macify catalogue

This directory is the GitHub source for Macify's app listing information:

- [`apps/`](apps) contains one application manifest per application.
- [`deals/`](deals) contains verified offers for existing applications.
- [`examples/deal.example.json`](examples/deal.example.json) is the deal contribution template.
- [`schema/deal.schema.json`](schema/deal.schema.json) documents the deal format.
- [`examples/application.example.json`](examples/application.example.json) is the contribution template.
- [`schema/application.schema.json`](schema/application.schema.json) documents the manifest format.

GitHub stores the source record; D1 stores pending and published copies used by the website. Merging a valid manifest creates a pending revision, not a public listing. Macify editors control publication, relationships, placement, deals, corrections, and removal.

Run `npm run catalogue:validate` before submitting a manifest.

To propose an application or deal, read [`../CONTRIBUTING.md`](../CONTRIBUTING.md).
