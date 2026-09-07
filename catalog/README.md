# 🗂️ Macify catalogue

This directory is the GitHub source for Macify's app listing information:

- [`apps/`](apps) contains one application manifest per application.
- [`deals/`](deals) contains verified offers for existing applications.
- [`examples/deal.example.json`](examples/deal.example.json) is the deal contribution template.
- [`schema/deal.schema.json`](schema/deal.schema.json) documents the deal format.
- [`examples/application.example.json`](examples/application.example.json) is the contribution template.
- [`schema/application.schema.json`](schema/application.schema.json) documents the manifest format.

GitHub stores the source record; D1 stores pending and published copies used by the website. Merging a valid manifest creates a pending revision, not a public listing. Editors approve application and deal revisions in the dashboard. Listing corrections and relationships come from GitHub manifests; publication visibility and featured status have separate dashboard controls.

Run `npm run catalogue:validate` before submitting a manifest.

To propose an application or deal, read [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

## 🔎 Validation and publication

[`scripts/validate-catalogue.mjs`](../scripts/validate-catalogue.mjs) checks local manifests, references, and contribution examples. Runtime ingestion validates applications with [`src/lib/catalogue-manifest.ts`](../src/lib/catalogue-manifest.ts) and deals with [`src/lib/deal-manifest.ts`](../src/lib/deal-manifest.ts). Keep these validators and the JSON schemas aligned when changing the format.

The Catalogue workflow sends manifests to `/api/internal/catalogue-sync`. It queues changes for review rather than publishing them. Local development uses [`scripts/sync-local-catalogue.mjs`](../scripts/sync-local-catalogue.mjs) to populate published records and local media directly, without the production review step.
