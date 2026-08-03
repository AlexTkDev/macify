# Product

## Register

product

## Users

Macify serves macOS users who want reliable software recommendations without searching through promotional listicles, abandoned projects, or low-quality app stores. It also serves editors who research, classify, compare, and publish application records through an internal dashboard.

The primary public task is finding a useful Mac application quickly. The primary editorial task is turning a URL or import file into an accurate, reviewable application record.

## Product Purpose

Macify.app is a curated directory of the best useful macOS applications. It organizes application details, pricing, licensing, platforms, media, categories, alternatives, and editorial context into fast, searchable pages.

Phase 1 delivers the public directory, management dashboard, structured database, media pipeline, imports and exports, search, and technical SEO. Public accounts, authentication, saved applications, payments, and subscriptions are intentionally deferred.

Success means visitors can identify a trustworthy application in a few minutes, public pages load quickly worldwide, search engines can understand every application page, and editors can maintain the directory without manually editing code or database rows.

## Editorial Content Model

Each application record contains its identity, official website, tagline, detailed description, classification, pricing, source model, tags, optional YouTube demo, and mutually related applications.

Pricing is recorded in two parts. The access tier is free, freemium, or paid. Freemium and paid applications also record whether payment is one-time or subscription-based. Editors can add literal pricing details when the simple classification is not enough.

Source status is retained internally. Public pages display an Open source fact only when applicable; closed-source applications do not display a source label. Repository URLs and minimum macOS versions are outside the current content model.

Detailed descriptions are authored and stored as plain Markdown. The dashboard intentionally provides a normal textarea without a rich-text editor, formatting toolbar, or preview. Public application pages render the Markdown as semantic HTML with GitHub Flavored Markdown support for headings, lists, links, emphasis, tables, task lists, strikethrough, blockquotes, and code. Raw HTML from Markdown is never executed.

Application media consists of one icon, one main preview image, and multiple screenshots stored in Cloudflare R2 and referenced from the database. The preview image is the wide editorial visual shown within the public application page; it is not used as the social-sharing image. Media can be attached during initial creation or later editing, and its R2 paths use the permanent application ID generated during submission. Audio is outside the product scope.

Every uploaded or remotely imported image passes through Cloudflare Images before it is written to R2. The pipeline preserves the original pixel dimensions, removes unnecessary encoding overhead, and prefers high-quality WebP when that produces a smaller file. If conversion would increase the byte size, Macify keeps the original. D1 records the delivered format, optimized byte size, width, height, and checksum. Existing unmeasured assets can be optimized safely in small batches from the media dashboard.

Tags use autocomplete against the existing taxonomy while allowing editors to create a missing tag inline. New tags are normalized and created when the application is saved.

Editors can provide media as a local file or a public HTTPS image URL. URL imports are downloaded, validated, copied into R2, and recorded with their original source URL; public pages never hotlink third-party media. Remote fetches reject local or private destinations, unsafe redirects, unsupported formats, mismatched file signatures, and files over the editorial size limit.

Every public application page has a generated Macify social-sharing card containing that application’s name. This consistent card is used for Open Graph and X/Twitter metadata independently of the uploaded preview image.

Related-application links are mutual: connecting application A to application B also makes A available from B. Editors choose these relationships explicitly, while the public page only displays published related records.

## Brand Personality

Curated, precise, Mac-native.

The voice is calm and specific. It explains what an application does, who it suits, what it costs, and how it differs from alternatives. It avoids exaggerated claims and treats editorial judgment as a responsibility.

## Anti-references

- Generic SaaS gradients and glowing purple-blue interfaces.
- Glass-heavy dashboards that reduce contrast or obscure hierarchy.
- Excessively rounded cards nested inside other cards.
- Advertising-cluttered download directories and SEO listicle pages.
- Visual copies of Apple, Toolfolio, Details, Setapp, or the Mac App Store.
- Low-contrast gray text and decorative motion that delays the task.

## Design Principles

1. **Lead with utility.** Search, categories, pricing, and download context must be visible before editorial decoration.
2. **Make curation legible.** Explain why an application is listed and distinguish verified facts from editorial opinion.
3. **Feel native without imitation.** Use familiar macOS clarity, density, and interaction patterns while maintaining an independent Macify identity.
4. **Let application media do the color work.** The interface remains restrained so icons, screenshots, and preview images stay recognizable.
5. **Design for maintenance.** Public patterns and dashboard controls share a small, consistent vocabulary that editors and future contributors can learn quickly.

## Accessibility & Inclusion

Target WCAG 2.2 AA. All core workflows must support keyboard navigation, visible focus, semantic landmarks, descriptive labels, readable contrast, zoom to 200%, reduced motion, and non-color status indicators. Touch targets must remain usable on mobile, and dense application metadata must reflow without horizontal page scrolling.
