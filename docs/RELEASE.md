# Release workflow

Macify deploys directly to production. Validation must match the risk of the change.

## Production path

Cloudflare Workers Builds should use:

- Worker: `macify`
- Branch: `main`
- Build command: `npm run ci:check`
- Deploy command: `npm run deploy`

Merging or pushing to `main` deploys production. It requires explicit approval. Use feature branches and pull requests for normal review, and never repeat a successful GitHub-triggered deployment manually.

## Validation

For isolated copy, CSS, or static assets:

1. Inspect the focused diff.
2. Run the relevant lightweight check.
3. Deploy only after approval.
4. Verify the affected production route once.

For behavior, authentication, data, schema, synchronization, media, routing, metadata, bindings, dependencies, or broad interface changes:

1. Run the relevant local checks.
2. Create a production backup before any risky data operation.
3. Review the complete diff and rollback path.
4. Apply reviewed D1 migrations before code that depends on them.
5. Confirm required Worker variables and GitHub secrets.
6. Deploy after explicit approval and verify affected production workflows immediately.

Use `npm run preview` for material Workers-runtime changes. Run `npm run typecheck` and `npm run lint` after material TypeScript changes.

## Remote safety

- Commands are local unless they use `--remote` or deploy.
- Deployment, production migrations, data replacement, resource creation, DNS changes, and secrets require explicit approval.
- Never commit `.dev.vars`, credentials, exports, backups, or Wrangler state.
- Read [`migrations/README.md`](../migrations/README.md) before schema changes.
- Read [`OPERATIONS.md`](OPERATIONS.md) before migrations, bulk synchronization, restoration, or recovery.

## Commands

- Local migrations: `npm run db:migrate:local`
- Production migrations: `npm run db:migrate:production`
- Manual production deployment: `npm run deploy`
