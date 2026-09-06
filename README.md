<div align="center">
  <img src="src/app/icon.svg" alt="Macify" width="88" height="88">
  <h1>Macify</h1>
  <p><strong>Mac apps worth making room for.</strong></p>
  <p>A cheerful, hand picked directory of useful macOS apps.</p>
  <p>
    <a href="https://macify.app"><kbd>🌈&nbsp; Browse apps</kbd></a>&nbsp;
    <a href="CONTRIBUTING.md"><kbd>🌱&nbsp; Suggest an app</kbd></a>&nbsp;
    <a href="https://github.com/Beingpax/macify/issues/new/choose"><kbd>💬&nbsp; Share feedback</kbd></a>
  </p>
</div>

## Find your next favourite Mac app

Macify is for the little apps that make a Mac feel like yours. Search for a specific tool, wander through a category, or take the surprise route and see where you land.

Each listing gives you the useful bits before you install: what the app does, who it suits, what it costs, and the tradeoffs worth knowing. No crowded download pages or copy pasted praise.

| Start here | What you will find |
| --- | --- |
| [Browse all apps](https://macify.app) | The full collection, ready to search |
| [Explore categories](https://macify.app/categories) | Apps grouped by the job they help with |
| [Surprise me](https://macify.app/surprise) | One unexpected pick from the directory |

## Know a good one?

Made a Mac app you are proud of? Found a small gem more people should know about? We would love to see it.

Read the [contribution guide](CONTRIBUTING.md) before opening a pull request. Each public contribution can introduce one new application. If a listing needs a correction, or you have an idea for Macify itself, [open an issue](https://github.com/Beingpax/macify/issues/new/choose).

Found something useful here? A star helps more Mac people stumble across the collection. Fork the repository whenever you are ready to add your pick.

## Make it run locally

Macify uses Next.js and TypeScript on Cloudflare Workers. Reviewed listings live in D1, while application artwork lives in R2.

To run it locally:

```bash
npm install
cp .dev.vars.example .dev.vars
npm run cf-typegen
npm run db:migrate:local
npm run dev
```

The development server checks and syncs the local catalogue when it starts. To refresh catalogue changes while it is already running, use `npm run catalogue:sync:local`.

Before changing product behavior, interface design, or catalogue copy, read [`docs/PRODUCT.md`](docs/PRODUCT.md), [`docs/DESIGN.md`](docs/DESIGN.md), and [`docs/EDITORIAL.md`](docs/EDITORIAL.md). Operational and release details live in [`docs/OPERATIONS.md`](docs/OPERATIONS.md) and [`docs/RELEASE.md`](docs/RELEASE.md).

Before submitting changes, run the checks that match your work:

```bash
npm run typecheck
npm run lint
npm run db:check
```
