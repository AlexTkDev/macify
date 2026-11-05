# 🗂️ Macify catalogue

This directory contains Macify’s application and deal manifests, contribution templates, and schemas:

- [`apps/`](apps) contains one application manifest per application.
- [`deals/`](deals) contains verified offers referencing application manifests in `apps/`.
- [`examples/deal.example.json`](examples/deal.example.json) is the deal contribution template.
- [`schema/deal.schema.json`](schema/deal.schema.json) documents the deal format.
- [`examples/application.example.json`](examples/application.example.json) is the contribution template.
- [`schema/application.schema.json`](schema/application.schema.json) documents the manifest format.

Application and deal manifests are reviewed before publication. Merging a contribution does not guarantee inclusion in the public catalogue.

Application manifests may omit `isFeatured` and `isEditorsPick`; omitted values are treated as `false`. Public submissions may not set either field to `true`. They may also omit `relatedAppSlugs` when there are no related applications. A listing can publish before a named related application, and the relationship appears when both are published.

Run `npm run catalogue:validate` before submitting a manifest.

JSON schemas describe the file structure and pricing rules. The validator also checks filenames, catalogue references, duplicate websites, public HTTPS URLs, trimmed text lengths, related-app restrictions, and unique media source URLs. Runtime ingestion validates manifests again and downloads artwork before creating a pending editorial revision.

Maintainers: update the Black Friday table in the root README by hand when a confirmed offer is added or changed. Public contribution pull requests contain only the new manifest or a matching new application-and-deal pair.

To propose an application or deal, read [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

A deal can accompany a new application in the same pull request. Add `apps/<slug>.json` and `deals/<slug>.json` with the same slug; publish the application before publishing its deal. See the [deal submission guide](../CONTRIBUTING.md#submit-a-deal) for required offer details and Black Friday 2026 submissions.

Deals use `endsAt: null` when there is no scheduled expiry. A dated offer must end after it starts. Offers with no expiry remain active after their start date until removed or updated through editorial review.

Scheduled deals appear once their start time arrives, and dated deals stop appearing after their end time. These checks run when public pages render, including app pages that use cached catalogue data. A `code: null` offer links directly to the developer without showing a copy-code button. Timestamps must contain real calendar dates, seconds, and an explicit timezone.
