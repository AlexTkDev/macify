<div align="center">
  <img src="src/app/icon.svg" alt="Macify" width="88" height="88">
  <h1>Macify</h1>
  <p><strong>Mac apps worth making room for.</strong></p>
  <p>A curated directory of useful macOS software.</p>
  <p>
    <a href="https://macify.app"><kbd>⌘&nbsp; Browse apps</kbd></a>&nbsp;
    <a href="CONTRIBUTING.md"><kbd>🌱&nbsp; Suggest an app</kbd></a>&nbsp;
    <a href="https://github.com/Beingpax/macify/issues/new/choose"><kbd>💬&nbsp; Share feedback</kbd></a>
  </p>
</div>

## About

Macify helps people discover useful Mac applications through a curated homepage, search, categories, and detailed editorial listings. It includes free and paid software built for macOS.

GitHub manifests are the source for application and deal content. Approved revisions are published to Cloudflare D1, while optimized application artwork is stored in R2.

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md) to propose one new application or verified deal. Use [GitHub Issues](https://github.com/Beingpax/macify/issues/new/choose) for corrections, bugs, or product ideas.

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars
npm run cf-typegen
npm run db:migrate:local
npm run dev
```

`npm run dev` validates and synchronizes the local catalogue before starting. Use `npm run catalogue:sync:local` to refresh it separately.

## Project guides

- [Product](docs/PRODUCT.md)
- [Design](docs/DESIGN.md)
- [Editorial](docs/EDITORIAL.md)
- [Homepage curation](docs/HOMEPAGE_CURATION.md)
- [Operations](docs/OPERATIONS.md)
- [Release](docs/RELEASE.md)

```bash
npm run typecheck
npm run lint
npm run db:check
```
