<div align="center">
  <img src="src/app/icon.svg" alt="Macify" width="88" height="88">
  <h1>The best Black Friday deals for macOS apps in 2026</h1>
  <p>
    <a href="https://macify.app"><kbd>⌘&nbsp; Browse apps</kbd></a>&nbsp;
    <a href="https://macify.app/deals"><kbd>🏷️&nbsp; Browse deals</kbd></a>&nbsp;
    <a href="CONTRIBUTING.md#submit-a-deal"><kbd>🌱&nbsp; Suggest a deal</kbd></a>&nbsp;
    <a href="https://github.com/Beingpax/macify/issues/new/choose"><kbd>💬&nbsp; Share feedback</kbd></a>
  </p>
</div>

| App | Discount | Code | Dates (2026) |
| --- | --- | --- | --- |
| [Chronoid](https://macify.app/apps/chronoid) | 50% off | `BLACKFRIDAY26` | Nov 4–Dec 3 |
| [Compresto](https://macify.app/apps/compressx) | 40% off | `BFCM26` | From Nov 2; end date not announced |
| [TextSniper](https://macify.app/apps/textsniper) | 75% off | `BFIM2026` | Nov 27–Dec 4 |
| [VoiceInk](https://macify.app/apps/voiceink) | 40% off | `BFVI2640` | Nov 9–Dec 5 |

## 🌱 Got a deal for us?

You can suggest a deal for your own app or one you found elsewhere. You do not need to be the developer.

### Add a deal for an existing app

Check [`catalog/apps`](catalog/apps) and [`catalog/deals`](catalog/deals), then copy the [deal template](catalog/examples/deal.example.json) to `catalog/deals/<app-slug>.json`. Include the discount, code (or `null`), official offer URL, and start and end dates. See [how to submit a deal](CONTRIBUTING.md#submit-a-deal) for the exact format and pull request steps.

### Add a new app

Copy the [app template](catalog/examples/application.example.json) to `catalog/apps/<app-slug>.json`. If the app has a deal, also add `catalog/deals/<app-slug>.json` from the deal template. Use the same slug in both files and submit them together. See [how to submit an app](CONTRIBUTING.md#submit-an-app) and [how to submit its deal](CONTRIBUTING.md#submit-a-deal).

Include a link that confirms the offer and explain restrictions such as eligible plans, new customers, or regions. If a published deal is wrong or expired, [open a correction issue](https://github.com/Beingpax/macify/issues/new?template=listing-correction.yml).

## 🛠️ Make it run locally

Macify uses Next.js and TypeScript, deployed on Cloudflare Workers.

Local development requires Node.js 22. To get started:

```bash
npm install
npm run cf-typegen
npm run db:initialize:local
npm run dev
```

The development server prepares the local catalogue when it starts. Use `npm run setup` to refresh local data and artwork.

Before submitting changes, run the checks that match your work:

```bash
npm run typecheck
npm run lint
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/app/` | Next.js routes, route handlers, layouts, and metadata files. A `page.tsx` stays in the folder matching its URL. |
| `src/components/` | UI grouped by feature (`home`, `deals`, `surprise`, `application-detail`, `dashboard`) or shared site use (`site`, `forms`). |
| `src/lib/` | Server and shared logic grouped by domain: catalogue, directory, deals, media, dashboard, auth, analytics, and shared helpers. |
| `src/styles/public/` | Public styles grouped into layout, page, and responsive layers. `src/styles/dashboard/` contains editor styles. |
| `src/content/blog/posts/` | Editorial content grouped by article slug. |
| `catalog/` | Application and deal manifests, examples, and schemas. |
| `database/` | Database schema documentation. |
| `scripts/` | Local setup, catalogue maintenance, and script tests. |
| `public/` | Assets served by stable URLs, including app icons and preview images. |

Next.js reserves names such as `page.tsx`, `route.ts`, `layout.tsx`, `robots.ts`, `sitemap.ts`, and `manifest.ts`. They remain in `src/app/` at the route or root where Next.js discovers them.

## License

Original Macify software code is available under the [MIT License](LICENSE). Files carrying their own license remain under that license.

The Macify name and brand marks, editorial writing and catalogue descriptions, and images or artwork are not licensed by the MIT code license. App names, icons, screenshots, and other third-party material belong to their respective owners. Their presence in this repository does not grant permission to reuse them.
