# Macify agent instructions

## Product

Macify is a curated macOS application directory. Read `docs/PRODUCT.md` before changing behavior, `docs/DESIGN.md` before changing the public interface, and `docs/EDITORIAL.md` before editing catalogue copy.

The protected dashboard uses single-administrator authentication. Preserve server-side authorization on every dashboard page, handler, and mutation. Public accounts, saved applications, in-site submissions, payments, and subscriptions are outside the current scope unless explicitly requested.

## Platform

- Next.js App Router runs on Cloudflare Workers through OpenNext.
- Use D1 through the `DB` binding and Drizzle ORM.
- Use R2 through the `MEDIA` binding; store binary media in R2 and metadata in D1.
- Keep bindings, compatibility settings, and environments in `wrangler.jsonc`.
- Run `npm run cf-typegen` after changing bindings.
- Generate migrations with `npm run db:generate` and review their SQL.

## Safety

- Local commands are the default. `--remote` and deployment commands can change Cloudflare resources.
- Never deploy, migrate production, replace remote data, change DNS, create resources, or add secrets without explicit approval.
- Never expose D1 or R2 bindings to browser code.
- Never commit secrets, `.dev.vars`, exports, backups, or Wrangler state.
- Back up D1 before production migrations, bulk catalogue synchronization, restoration, or destructive operations.
- Validate catalogue manifests, remote image size, detected MIME type, file signature, and URL safety. Compute checksums for stored media and preserve R2 integrity metadata.

## Shared checkout and branches

- Work directly on `main`. Do not create or switch branches unless explicitly requested.
- Tasks share this checkout. Preserve their tracked and untracked changes and coordinate Git operations.

## Quality

- Prefer server components for public content and keep client JavaScript limited to necessary interaction.
- Public application pages require canonical metadata, Open Graph data, structured data, semantic headings, and crawlable links.
- Use indexed, bounded D1 queries and avoid request-specific module globals.
- Run typecheck and lint after material TypeScript changes. Preview performs a build; run it only when the user explicitly authorizes a build. Never run builds merely for verification without that authorization.

## Design and editorial

- Preserve the direction and accessibility rules in `docs/DESIGN.md`.
- Avoid generic gradients, glass effects, excessive pills, nested cards, low contrast, and decorative motion.
- Follow `docs/EDITORIAL.md`; research each application independently and verify changing facts.
- Never alter a remote application record without explicit approval.

## Release

Read `docs/RELEASE.md` before deployment. A merge or push to `main` may deploy production through Cloudflare Workers Builds. Never push to `main` without explicit production approval.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
