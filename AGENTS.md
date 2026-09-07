# Macify agent instructions

## Product

Macify is a curated macOS application directory. Before changing behavior, public UI, or catalogue copy, read `docs/PRODUCT.md`, `docs/DESIGN.md`, or `docs/EDITORIAL.md` respectively.

Preserve authorization on protected features and do not expand product scope unless requested.

## Safety

- Default to local commands. Production or remote changes require explicit approval.
- Never commit credentials, local environment files, exports, backups, or tool state.
- Preserve server-side authorization and validate all external input.
- Back up persistent data before migrations, restoration, or destructive work.

## Shared checkout and branches

- Work directly on `main`. Do not create or switch to another branch unless the user explicitly requests it.
- Tasks share this checkout. Coordinate Git operations with other active tasks and preserve their tracked and untracked changes.

## Quality

- Prefer server components for public content and keep client JavaScript limited to necessary interaction.
- Public application pages require canonical and Open Graph metadata, structured data, semantic headings, and crawlable links.
- Keep data access bounded and avoid request-specific module globals.
- Run typecheck and lint after material TypeScript changes. Use preview for material Workers-runtime changes.

## Design and editorial

- Preserve the direction and accessibility rules in `docs/DESIGN.md`.
- Avoid generic gradients, glass effects, excessive pills, nested cards, low contrast, and decorative motion.
- Follow `docs/EDITORIAL.md`; research each application and verify changing facts.
- Never alter a remote application record without explicit approval.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
