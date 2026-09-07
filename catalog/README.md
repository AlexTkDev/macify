# Macify catalogue

- [`apps/`](apps): one manifest per application
- [`deals/`](deals): reserved deal manifests; deals are not currently available
- [`examples/`](examples): contribution templates
- [`schema/`](schema): JSON schemas

Deal support is incomplete and is not available in production. Local development uses fixtures outside the catalogue to exercise the interface. Do not submit deal manifests until the feature is implemented.

Run `npm run catalogue:validate` before submitting an application change.

See [`CONTRIBUTING.md`](../CONTRIBUTING.md).
