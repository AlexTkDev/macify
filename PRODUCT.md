# Product

## Purpose

Macify helps people find useful macOS applications without relying on promotional listicles or cluttered download directories. Editors maintain the catalogue through a protected internal dashboard.

## Public experience

The public website provides:

- a curated homepage;
- published application pages;
- category-based discovery;
- inline search across names, taglines, and categories;
- related applications and a random-app route;
- canonical metadata, structured data, sitemap, robots rules, and social cards.

The homepage headline is “Mac apps worth making room for.” Its supporting copy is “A curated list of the most useful macOS applications.”

Each application page presents the official identity, tagline, pricing, relevant categories, source status when open source, editorial description, media, optional demo, official website, and related applications.

## Editorial dashboard

The dashboard supports application creation and editing, drafts and publication, categories, relationships, media, reviewed imports and exports, and media optimization. It uses single-administrator authentication, signed sessions, and persistent login throttling. Every dashboard route and mutation requires server-side authorization.

## Content model

An application record includes:

- name, slug, website, and tagline;
- researched Markdown description;
- free, freemium, or paid access classification;
- one-time or subscription billing where applicable;
- source status;
- one to three focused categories;
- optional YouTube URL;
- mutual related-application links;
- one icon, one main preview, and optional screenshots.

Markdown is rendered as sanitized semantic HTML. Raw HTML is never executed.

## Media

Binary media is stored in private R2 objects; D1 stores metadata and storage keys. Uploads and URL imports are size-limited, MIME-checked, signature-validated, optimized through Cloudflare Images, and served through Macify-controlled routes. Remote imports reject private networks, unsafe redirects, invalid formats, and oversized responses.

The homepage has one static 1200×630 social image. Each application has a generated social card using its preview and the line `App Name — tagline | Macify`.

## Boundaries

Macify does not currently provide public accounts, saved applications, payments, subscriptions, public submissions, or multi-user editorial roles. Audio and application binaries are not stored.

## Principles

- Lead with utility and verifiable information.
- Keep editorial judgment independent and specific.
- Feel Mac-native without copying Apple or the Mac App Store.
- Let authentic application media carry most of the visual color.
- Keep the catalogue maintainable, accessible, and fast.
