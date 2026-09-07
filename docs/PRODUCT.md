# 🧭 Product

## 🎯 Purpose

Macify helps people find useful macOS applications without relying on promotional listicles or cluttered download directories. GitHub manifests hold app listing information; editors review merged revisions and control placement through a protected dashboard.

## 🌐 Public experience

The public website provides:

- a curated homepage;
- published application pages;
- category-based discovery;
- inline search across names, taglines, descriptions, and categories;
- related applications and a random-app route;
- a GitHub contribution path for proposing new applications and verified deals;
- a public deals page showing active offers, with an empty state when none are available;
- canonical metadata, structured data, sitemap, robots rules, and social cards.

The homepage headline is “Mac apps worth making room for.” Its supporting copy is “A curated list of the most useful macOS applications.”

Each application page presents the official identity, tagline, pricing, relevant categories, source status when open source, editorial description, media, optional demo, official website, and related applications.

## 🗃️ Editorial dashboard

The dashboard supports GitHub revision review and publication, featured placement, time-bounded deals, application inspection, and a read-only R2 media inventory. Listing content and relationships are changed through GitHub manifests and applied to D1 after review. Separate controls update publication visibility and featured status in D1; unpublishing retains the record and media, clears featured status, and hides public listings. Republishing an existing record does not approve its pending GitHub revision. The dashboard uses single-administrator authentication, signed sessions, and persistent login throttling. Every dashboard route and mutation requires server-side authorization.

## 🧩 Content model

An application record includes:

- name, slug, website, and tagline;
- researched Markdown description;
- free, freemium, or paid access classification;
- one-time or subscription billing where applicable;
- source status;
- one to 12 focused categories;
- optional YouTube URL;
- related-application links displayed bidirectionally when declared by either application;
- one icon, one main preview, and optional screenshots.

App listing information is stored as one public JSON manifest per application. Merged changes become pending D1 revisions and require dashboard approval. Existing published content remains live until its replacement is approved. Featured state is editorial metadata stored in D1. Deals are submitted through `catalog/deals` manifests and require review before publication.

Markdown is rendered with `react-markdown` and `remark-gfm`, with raw HTML skipped. The application description renderer splits content at level-two headings; an initial heading matching the tagline, “What it does”, or “What [application name] does” is folded into the introduction.

Catalogue synchronization failures remain visible until a later successful synchronization for the same file resolves them or an administrator dismisses them. Resolved and dismissed failures remain in review history for auditability.

Each catalogue update reconciles every current application and deal manifest with the review system. Previously reviewed manifests are ignored by content hash, while a manifest that was missed or failed is queued or retried. A newer revision supersedes an older pending revision for the same path. Deleted and renamed manifests still create explicit removal revisions. Parsing and ingestion failures are isolated per file so one broken manifest cannot prevent valid records from reaching review.

## 🖼️ Media

Binary media is stored in private R2 objects; D1 stores metadata and storage keys. URL ingestion is size-limited and signature-validated, and requires a supported image MIME header. If that header names the wrong supported image format, byte detection can correct it; unsupported MIME headers are rejected. Cloudflare Images optimization is attempted; original bytes are retained if the binding is unavailable, transformation fails, or the output is no smaller. Media is served through Macify-controlled routes. Remote ingestion rejects private networks, unsafe redirects, invalid formats, and oversized responses.

Public manifests contain HTTPS source URLs and alternative text, not image binaries. Icons support PNG, JPEG, WebP, AVIF, and ICO; previews and screenshots support PNG, JPEG, WebP, and AVIF. Each source has a 10 MiB limit. ICO icons are decoded before optimization. Local synchronization uses Sharp and local R2 storage. During ingestion, unchanged source URLs reuse existing R2 objects; changed sources are validated and optimized before a revision can be reviewed.

The homepage has one static 1200×630 social image. Each application has a generated social card using its preview and the line `App Name — tagline | Macify`.

## 🚧 Boundaries

Macify does not currently provide public accounts, saved applications, payments, subscriptions, an in-site submission form, or multi-user editorial roles. Audio and application binaries are not stored.

## 🧠 Principles

- Lead with utility and verifiable information.
- Keep editorial judgment independent and specific.
- Feel Mac-native without copying Apple or the Mac App Store.
- Let authentic application media carry most of the visual color.
- Keep the catalogue maintainable, accessible, and fast.

## 🗺️ Code structure

- [`src/app/`](../src/app) defines public pages, the editor login, dashboard routes, and API handlers.
- [`src/components/`](../src/components) holds shared public and dashboard interfaces; [`src/styles/`](../src/styles) holds their styles and design tokens.
- [`src/lib/`](../src/lib) contains directory queries, analytics, authentication, catalogue ingestion, revision handling, pricing, and media processing.
- [`src/db/schema.ts`](../src/db/schema.ts) defines the Drizzle schema; [`src/db/client.ts`](../src/db/client.ts) creates database access from the request’s Cloudflare bindings.
- [`catalog/`](../catalog) contains application and deal manifests, examples, and JSON schemas.
- [`scripts/`](../scripts) provides validation, local setup, synchronization, migration handling, and non-build tests.
- [`migrations/`](../migrations) contains ordered SQL and Drizzle metadata.
- [`.github/workflows/`](../.github/workflows) separates application checks from catalogue validation and synchronization.
