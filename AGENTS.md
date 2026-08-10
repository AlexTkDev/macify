# Macify agent instructions

## Product

Macify is a curated macOS application directory. Read `PRODUCT.md` before changing behavior, `DESIGN.md` before changing the public interface, and `EDITORIAL.md` before editing catalogue copy.

The protected dashboard uses single-administrator authentication. Preserve server-side authorization on every dashboard page, handler, and mutation. Public accounts, saved applications, submissions, payments, and subscriptions are outside the current scope unless explicitly requested.

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
- Back up D1 before production migrations, imports, catalogue replacement, or destructive operations.
- Validate imported files, size, MIME type, signature, checksum, and remote URL safety.

## Quality

- Prefer server components for public content and keep client JavaScript limited to necessary interaction.
- Public application pages require canonical metadata, Open Graph data, structured data, semantic headings, and crawlable links.
- Use indexed, bounded D1 queries and avoid request-specific module globals.
- Run typecheck and lint after material TypeScript changes. Use preview for material Workers-runtime changes.

## Design and editorial

- Preserve the direction and accessibility rules in `DESIGN.md`.
- Avoid generic gradients, glass effects, excessive pills, nested cards, low contrast, and decorative motion.
- Follow `EDITORIAL.md`; research each application independently and verify changing facts.
- Never alter a remote application record without explicit approval.

## Release

Read `RELEASE.md` before deployment. A merge or push to `main` may deploy production through Cloudflare Workers Builds. Never push to `main` without explicit production approval.
