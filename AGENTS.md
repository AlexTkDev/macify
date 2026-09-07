# Macify agent instructions

## Product

Macify is a curated macOS application directory.

Preserve server-side authorization and existing product boundaries.

## Safety

- Local commands are the default. `--remote` and deployment commands can change Cloudflare resources.
- Never deploy, migrate production, replace remote data, change DNS, create resources, or add secrets without explicit approval.
- Never commit credentials, local environment files, backups, or tool state.
- Back up persistent data before destructive changes.
- Validate external input and preserve media validation.

## Shared checkout and branches

- Work directly on `main`. Do not create or switch branches unless explicitly requested.
- Tasks share this checkout. Preserve their tracked and untracked changes and coordinate Git operations.

## Quality

- Prefer server components for public content and keep client JavaScript limited to necessary interaction.
- Public application pages require canonical metadata, Open Graph data, structured data, semantic headings, and crawlable links.
- Use indexed, bounded D1 queries and avoid request-specific module globals.
- Run typecheck and lint after material TypeScript changes. Preview performs a build; run it only when the user explicitly authorizes a build. Never run builds merely for verification without that authorization.

## Design and editorial

- Preserve the established design direction and accessibility requirements.
- Avoid generic gradients, glass effects, excessive pills, nested cards, low contrast, and decorative motion.
- Research each application independently and verify changing facts.
- Never alter a remote application record without explicit approval.
