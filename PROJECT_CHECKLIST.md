# Macify Project Checklist

Last code audit: August 9, 2026

Macify.app is a curated directory of useful macOS applications. This checklist records the implemented foundation and the work remaining before a production launch.

## Product decisions

- [x] Product name: Macify
- [x] Website: Macify.app
- [x] Public product type: curated macOS application directory
- [x] Phase 1 prioritizes the dashboard, public UI, database, media, and editorial workflow
- [x] Public visitor accounts, saved apps, and payments are deferred to a later phase
- [x] Editorial dashboard access protection remains a Phase 1 launch requirement
- [x] Detailed descriptions are stored as plain Markdown and rendered safely for public visitors
- [x] Application audio is outside the product scope
- [x] Application pages may link to an optional YouTube demo
- [x] Related-application relationships are mutual
- [ ] Confirm whether the existing Free, Freemium, and Paid terminology should change; no Premium tier is currently implemented

## Technical foundation

- [x] Next.js, React, and TypeScript application
- [x] Cloudflare Workers/OpenNext deployment configuration
- [x] Cloudflare D1 relational database binding
- [x] Cloudflare R2 media storage binding
- [x] Drizzle ORM schema and versioned SQL migrations
- [x] Local Cloudflare development environment
- [x] Committed migration history through migration `0007`
- [x] Generated Cloudflare binding types
- [x] Structured migration directory and migration documentation
- [x] Verify the active local D1 has applied migration `0007`
- [x] Complete staging and production D1/R2 resource identifiers in Wrangler configuration
- [x] Apply migrations through `0007` to staging D1
- [x] Apply migrations through `0007` to production D1
- [x] Deploy the current Worker to staging and complete database and authentication smoke tests
- [x] Replace staging catalogue and R2 media with the canonical local dataset and verify parity
- [x] Audit every published staging app page, tag page, and referenced media route
- [x] Replace production catalogue and R2 media with the verified canonical dataset
- [x] Deploy the approved release to the production Workers URL and complete full smoke tests
- [ ] Connect and verify the Macify.app custom domain

## Application content model

- [x] Application name
- [x] Automatically suggested, editable slug
- [x] Official website URL
- [x] Tagline
- [x] Detailed Markdown description
- [x] One to three curated tags with normalization
- [x] Open-source status stored internally
- [x] Closed-source status omitted from the public UI
- [x] Optional YouTube demo URL
- [x] Up to 12 related applications
- [x] Removed the brief-description field
- [x] Removed the minimum macOS field
- [x] Removed the source-repository field
- [x] Current pricing schema separates access tier from billing method
- [ ] Finalize pricing terminology before changing the current Free, Freemium, and Paid schema

## Dashboard and editorial workflow

- [x] Dashboard shell and application listing
- [x] Create application form
- [x] Edit application form
- [x] Draft and publication controls
- [x] Tag management
- [x] Media management
- [x] Import history and row-level validation review
- [x] Tag autocomplete using existing tags
- [x] Inline creation of new tags when an application is saved
- [x] Related-application selector
- [x] Required icon and main-preview checks before publishing
- [x] Add single-administrator login, signed sessions, logout, and server-side authorization checks
- [x] Add persistent failed-login throttling in D1
- [x] Configure administrator credentials and session secret in staging
- [x] Configure administrator credentials and a separate session secret in production
- [ ] Add an audit log for editorial changes
- [ ] Add pagination and filtering for a large application catalog
- [ ] Add a reliable application search experience to the dashboard

## Media pipeline

- [x] Application icon upload from a local file
- [x] Application icon import from a public HTTPS URL
- [x] Main preview upload from a local file
- [x] Main preview import from a public HTTPS URL
- [x] Multiple screenshot uploads
- [x] Screenshot URL imports
- [x] Live file and URL previews in create and edit workflows
- [x] Media copied into R2 only when the application is saved
- [x] Original remote source URL recorded as metadata
- [x] Public pages load Macify-controlled R2 copies instead of hotlinking sources
- [x] Remote image timeout, redirect, type, signature, and size validation
- [x] Private-network and localhost URL protection
- [x] R2 cleanup when a related D1 write fails
- [x] Maximum 10 MB per image and 40 MB combined during application creation
- [x] Extract and store image width and height when Cloudflare Images is available
- [ ] Add icon and preview aspect-ratio warnings
- [ ] Decide whether production image transformations and responsive variants are needed
- [ ] Add rate limiting to URL-based media import before exposing the dashboard publicly

## CSV and JSON import/export

- [x] CSV import
- [x] JSON import
- [x] Validation before committing rows
- [x] Duplicate detection using slug and official website URL
- [x] Safe default behavior that skips duplicates without overwriting existing data
- [x] Icon URL and alt-text import/export
- [x] Main preview URL and alt-text import/export
- [x] Multiple screenshot URL import/export
- [x] Related application slug import/export
- [x] Tag import/export
- [x] Imported media uses the same secure R2 pipeline as manually added media
- [x] Failed media imports fail the affected row instead of creating an incomplete record
- [ ] Add update/merge conflict handling only when the product needs bulk updates
- [ ] Add downloadable example CSV and JSON templates
- [ ] Move very large media imports to a background queue or workflow if synchronous imports become slow

## Public directory

- [x] Public directory homepage
- [x] Published application pages
- [x] Tag-based application discovery
- [x] Application icons and main previews
- [x] Screenshot gallery
- [x] Safe GitHub Flavored Markdown rendering
- [x] Pricing display
- [x] Open-source label shown only when applicable
- [x] YouTube demo link
- [x] Related applications
- [x] Local source datasets and scripts for preparing and seeding catalogue records
- [x] Inline public search across published application names, taglines, and tags
- [x] Underlying bounded directory queries for description, pricing, billing, source, and pagination filters
- [ ] Decide whether to expose the broader directory filters in the public interface
- [ ] Complete factual and editorial review of local catalogue records before production publication
- [ ] Review all public responsive breakpoints with production media
- [x] Keyboard navigation for inline search results, including arrows, Home, End, Enter, and Escape
- [ ] Complete screen-reader QA

## SEO and sharing

- [x] Per-application metadata
- [x] Canonical application URLs
- [x] SoftwareApplication structured data
- [x] Generated application-specific Open Graph cards
- [x] Main preview image kept separate from social-sharing artwork
- [x] Application metadata
- [x] Add dynamic sitemap generation for public applications and tags
- [x] Add robots rules that exclude dashboard and API routes
- [x] Verify sitemap and environment-specific robots behavior in staging
- [ ] Connect Google Search Console and Bing Webmaster Tools after deployment
- [ ] Run production Core Web Vitals and crawlability audits

## Reliability, security, and operations

- [x] TypeScript checks
- [x] ESLint checks
- [x] Document Cloudflare Workers Builds settings for GitHub-driven production deployment
- [ ] Connect the existing `macify` Worker to `Beingpax/macify` and verify a `main` branch deployment
- [x] Production Next.js build verification
- [x] Drizzle migration consistency checks
- [x] Explicit R2 failure cleanup in write operations
- [ ] Add automated unit and integration tests for critical actions
- [ ] Add end-to-end tests for create, edit, publish, and import workflows
- [ ] Verify production logging and configure the alerts defined in `OPERATIONS.md`
- [ ] Configure Cloudflare usage and billing notifications
- [x] Document D1 backup/export and recovery procedures in `OPERATIONS.md`
- [ ] Automate encrypted daily D1 exports with documented retention
- [ ] Complete and record a quarterly D1 recovery drill in a disposable database
- [ ] Establish R2 retention and orphan-cleanup procedures
- [ ] Add Turnstile or equivalent protection to future public submission forms

## Later phases

- [ ] User accounts
- [ ] Authentication and account recovery
- [ ] Saved or favorited applications
- [ ] User-submitted application workflow
- [ ] Payments and subscriptions, if required by the final business model
- [ ] Administrative roles and permissions
