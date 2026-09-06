# Deals

Deal manifests are separate from application manifests. Add at most one current or upcoming deal for an application and name the file with the application slug:

```text
catalog/apps/example-app.json
catalog/deals/example-app.json
```

The `appSlug` inside the deal must also match that filename. This readable GitHub reference is resolved to the application's internal D1 ID during synchronization.

Start with [`../examples/deal.example.json`](../examples/deal.example.json). Use the exact percentage offered, set `code` to `null` when no code is needed, and provide the final HTTPS destination. Set `affiliate` accurately so Macify can apply the correct disclosure and link semantics.

Deal dates must be ISO 8601 timestamps with a timezone. Expired deals remain in Git history but are not shown publicly. Deal changes require the same review process as application changes.
