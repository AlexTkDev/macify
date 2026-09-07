# 🗂️ Macify catalogue

This directory is the GitHub source for Macify's application listings and deals:

- [`apps/`](apps) contains one application manifest per application.
- [`deals/`](deals) contains one optional, time-bounded deal manifest per application.
- [`examples/application.example.json`](examples/application.example.json) is the contribution template.
- [`examples/deal.example.json`](examples/deal.example.json) is the deal template.
- [`schema/application.schema.json`](schema/application.schema.json) documents the manifest format.
- [`schema/deal.schema.json`](schema/deal.schema.json) documents the deal format.

GitHub stores the source records; D1 stores pending revisions and the published materialized state used by the website. Merging a valid manifest creates a pending revision, not a public listing or offer. Macify editors publish or reject exact revisions in the dashboard. They cannot author or change listing or deal content there. Featured placement remains a separate dashboard-only decision.

Deal filenames and `appSlug` values must match an application in [`apps/`](apps). Adding or changing `deals/example-app.json` creates a reviewable deal revision; deleting it creates a removal revision. Publishing that removal deletes only the deal, not the application.

To contribute an application or deal, read [`../CONTRIBUTING.md`](../CONTRIBUTING.md).
