# Product

## Purpose

Macify is a curated directory that helps people discover useful macOS applications without promotional clutter.

## Public experience

The public website provides:

- curated homepage and published application pages;
- category discovery, search, related applications, and a random-app route;
- GitHub contribution flow;
- canonical metadata, structured data, sitemap, robots rules, and social cards.

The homepage headline is “Mac apps worth making room for.” Its supporting copy is “A curated list of the most useful macOS applications.”

Application pages include identity, tagline, pricing, categories, source status when open source, editorial copy, media, optional demo, official website, and related applications.

## Content model

An application record includes:

- name, slug, website, and tagline;
- researched Markdown description;
- access and billing classification;
- source status;
- one to 12 focused categories;
- optional YouTube URL;
- related-application links that display bidirectionally when declared by either application;
- one icon, one main preview, and optional screenshots.

The data model and public interface include preliminary support for verified, time-bounded deals. When no verified offer is active, the deals page presents an explicit empty state. Homepage inclusion is an independent editorial decision and does not affect whether an application remains listed.

Catalogue synchronization failures remain visible until a later successful synchronization for the same file resolves them or an administrator dismisses them. Resolved and dismissed failures remain in review history for auditability.

Each catalogue update reconciles every current application and deal manifest with the review system. Previously reviewed manifests are ignored by content hash, while a manifest that was missed or failed is queued or retried. A newer revision supersedes an older pending revision for the same path. Deleted and renamed manifests still create explicit removal revisions. Parsing and ingestion failures are isolated per file so one broken manifest cannot prevent valid records from reaching review.

## Media

Listings use authentic application icons, previews, and optional screenshots. Media must come from official public sources and include useful alternative text.

Social sharing images reflect the application identity and tagline.

## Boundaries

Macify does not currently provide public accounts, saved applications, payments, subscriptions, an in-site submission form, or multi-user editorial roles. Audio and application binaries are not stored.

## Principles

- Lead with utility and verifiable information.
- Keep editorial judgment independent and specific.
- Feel Mac-native without copying Apple or the Mac App Store.
- Let authentic application media carry most of the visual color.
- Keep the catalogue maintainable, accessible, and fast.
