# Macify catalogue

Macify keeps contributor-managed catalogue data in JSON:

- [`apps/`](apps) contains one application manifest per application.
- [`deals/`](deals) contains at most one current or upcoming deal per application.
- [`examples/`](examples) contains copyable examples that are never published as catalogue records.
- [`schema/`](schema) contains the machine-readable JSON schemas.

Application and deal filenames use the same stable application slug. For example, `apps/raycast.json` and `deals/raycast.json` belong to the same application. The deal also declares `"appSlug": "raycast"`; validation requires both references to agree.

Read [`../CONTRIBUTING.md`](../CONTRIBUTING.md) before submitting a pull request.
