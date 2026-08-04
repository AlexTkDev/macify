# Macify Agent Instructions

## Product

Macify.app is a curated directory of useful macOS applications. Read `PRODUCT.md` before changing product behavior, `DESIGN.md` before changing the interface, and `EDITORIAL.md` before creating or editing application descriptions or other public editorial copy.

Phase 1 includes the public directory, editorial dashboard, D1 schema, R2 media pipeline, imports and exports, search, and technical SEO. Accounts, authentication, saved apps, payments, and subscriptions belong to Phase 2 unless the user explicitly changes the scope.

## Platform

- Next.js App Router runs on Cloudflare Workers through `@opennextjs/cloudflare`.
- Use D1 through the `DB` binding and Drizzle ORM. Do not call the D1 REST API from runtime code.
- Use R2 through the `MEDIA` binding. Store binary media in R2 and only metadata plus storage keys in D1.
- Keep `nodejs_compat`, the compatibility date, bindings, and environment configuration in `wrangler.jsonc`.
- Regenerate `cloudflare-env.d.ts` with `npm run cf-typegen` after changing bindings.
- Generate migrations with `npm run db:generate`; review SQL before applying it.
- Use the installed Cloudflare, Wrangler, and Workers best-practices skills for platform changes. Consult the official Cloudflare MCP documentation when behavior or syntax may have changed.

## Safety

- Local commands are the default. A command must explicitly use `--remote` or deploy before it can alter Cloudflare resources.
- Never deploy, create remote D1/R2 resources, apply remote migrations, change DNS, or add secrets without the user's explicit approval for that step.
- Never expose D1 or R2 bindings to browser code.
- Never commit secrets, `.dev.vars`, database exports, or Wrangler local state.
- Use staging before production and review Cloudflare cost controls before enabling a public write endpoint.
- Validate imported files, cap upload size, verify MIME type and checksum, and store originals in a private R2 prefix.

## Code quality

- Prefer server components for public content and keep client JavaScript limited to interactions that need it.
- Public app pages must have canonical metadata, Open Graph data, structured data, semantic headings, and crawlable internal links.
- Use indexed D1 queries, pagination, and bounded result sets. Avoid full-table reads in request paths.
- Do not retain mutable request-specific state in module globals. Await promises or pass intentional background work to `waitUntil`.
- Run `npm run typecheck` and `npm run lint` after material TypeScript changes. Use `npm run preview` before an approved deployment.

## Design

- Preserve the curated, precise, Mac-native direction defined in `DESIGN.md`.
- Use OKLCH tokens, pure white as the public background, restrained honey amber for primary/selected states, and deep aubergine only for editorial emphasis.
- Avoid gradients, glass effects, excessive pills, nested cards, low-contrast copy, and decorative motion.
- Target WCAG 2.2 AA and honor reduced motion.

## Editorial content

- Follow `EDITORIAL.md` for research, structure, Markdown formatting, voice, fact verification, and quality checks.
- Research each application independently. Do not generate catalogue descriptions by mechanically expanding taglines or feature fields.
- Treat official documentation as the authority for product facts and independent reviews as evidence of real-world experience.
- Never alter a remote application record unless the user explicitly approves that remote change.
