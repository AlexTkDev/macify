# Macify agent instructions

## Product

Macify is a curated macOS application directory. Before changing behavior, public UI, or catalogue copy, read `docs/PRODUCT.md`, `docs/DESIGN.md`, or `docs/EDITORIAL.md` respectively.

The single-administrator dashboard requires server-side authorization on every page, handler, and mutation. Public accounts, saved applications, submissions, payments, and subscriptions are out of scope unless requested.

## Platform

- Next.js App Router runs on Cloudflare Workers through OpenNext.
- Use D1 through the `DB` binding and Drizzle ORM.
- Use the `MEDIA` R2 binding for binaries and D1 for metadata.
- Keep bindings, compatibility settings, and environments in `wrangler.jsonc`.
- Run `npm run cf-typegen` after changing bindings.
- Generate migrations with `npm run db:generate`, then review the SQL.

## Safety

- Default to local commands; `--remote` and deployment commands change Cloudflare resources.
- Never deploy, migrate production, replace remote data, change DNS, create resources, or add secrets without explicit approval.
- Never expose D1 or R2 bindings to browser code.
- Never commit secrets, `.dev.vars`, exports, backups, or Wrangler state.
- Back up D1 before production migrations, bulk synchronization, restoration, or destructive work.
- Validate catalogue manifests, remote image size, MIME type, signature, checksum, and URL safety.

## Quality

- Prefer server components for public content and keep client JavaScript limited to necessary interaction.
- Public application pages require canonical and Open Graph metadata, structured data, semantic headings, and crawlable links.
- Use indexed, bounded D1 queries and avoid request-specific module globals.
- Run typecheck and lint after material TypeScript changes. Use preview for material Workers-runtime changes.

## Design and editorial

- Preserve the direction and accessibility rules in `docs/DESIGN.md`.
- Avoid generic gradients, glass effects, excessive pills, nested cards, low contrast, and decorative motion.
- Follow `docs/EDITORIAL.md`; research each application and verify changing facts.
- Never alter a remote application record without explicit approval.

## Release

Read `docs/RELEASE.md` before deployment. A merge or push to `main` may deploy production through Cloudflare Workers Builds. Never push to `main` without explicit production approval.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
