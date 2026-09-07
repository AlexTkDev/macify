# Macify catalogue

GitHub is the content source; D1 stores pending revisions and published state.

- [`apps/`](apps): one manifest per application
- [`deals/`](deals): one optional, time-bounded deal per application
- [`examples/`](examples): contribution templates
- [`schema/`](schema): JSON schemas

Merging a valid manifest creates a pending revision. Editors may publish or reject it in the dashboard, but listing and deal content can only be changed in GitHub. Featured placement remains dashboard-only.

Each deal filename and `appSlug` must match an application manifest. Deleting a deal manifest creates a removal revision; publishing it removes only the deal.

See [`CONTRIBUTING.md`](../CONTRIBUTING.md).
