# Product

## Purpose

Macify is a curated macOS application directory. GitHub manifests hold application and deal content; a protected dashboard reviews revisions and controls publication and placement.

## Public experience

The public website provides:

- curated homepage and published application pages;
- category discovery, search, related applications, and a random-app route;
- GitHub contribution flow;
- canonical metadata, structured data, sitemap, robots rules, and social cards.

The homepage headline is “Mac apps worth making room for.” Its supporting copy is “A curated list of the most useful macOS applications.”

Application pages include identity, tagline, pricing, categories, source status when open source, editorial copy, media, optional demo, official website, and related applications.

## Dashboard

The single-administrator dashboard reviews and publishes GitHub revisions, controls featured placement, inspects applications, and exposes a read-only R2 inventory. Listing and deal content cannot be authored there. Every route and mutation requires server-side authorization; sessions are signed and login throttling is persistent.

## Content model

An application record includes:

- name, slug, website, and tagline;
- researched Markdown description;
- access and billing classification;
- source status;
- one to 12 focused categories;
- optional YouTube URL;
- mutual related-application links;
- one icon, one main preview, and optional screenshots.

Each application has one public JSON manifest; each optional time-bounded deal has a separate manifest keyed by application slug. Merged changes become pending D1 revisions. Published content stays live until a replacement is approved. Featured state is dashboard-only.

Markdown is rendered as sanitized semantic HTML. Raw HTML is never executed.

## Media

R2 stores private media objects; D1 stores metadata and keys. Ingestion validates URL safety, redirects, size, MIME type, file signatures, and checksums before optimizing through Cloudflare Images. Macify-controlled routes serve the result.

Manifests contain HTTPS source URLs, not binaries. Unchanged sources reuse R2 objects; changed sources are prepared before review.

The homepage has one static 1200×630 social image. Each application has a generated social card using its preview and the line `App Name — tagline | Macify`.

## Boundaries

Macify does not currently provide public accounts, saved applications, payments, subscriptions, an in-site submission form, or multi-user editorial roles. Audio and application binaries are not stored.

## Principles

- Lead with utility and verifiable information.
- Keep editorial judgment independent and specific.
- Feel Mac-native without copying Apple or the Mac App Store.
- Let authentic application media carry most of the visual color.
- Keep the catalogue maintainable, accessible, and fast.
