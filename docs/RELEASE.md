# 🚀 Release workflow

Macify deploys directly to production. Validation must match the risk of the change.

## 🛤️ Production path

Cloudflare Workers Builds should use:

- Worker: `macify`
- Branch: `main`
- Build command: `npm run ci:check`
- Deploy command: `npm run deploy`

A merge or direct push to `main` is a production deployment action. Do not push to `main` without explicit production approval. Use feature branches and pull requests for ordinary review. Do not run a second manual deployment after a successful GitHub-triggered deployment.

## ✅ Validation

For an isolated copy, CSS, or static asset change:

1. Inspect the focused diff.
2. Run only the relevant lightweight check.
3. Deploy after approval.
4. Verify the affected production route once.

For behavior, authentication, data, schema, catalogue synchronization, media, routing, metadata, bindings, dependencies, or broad interface changes:

1. Validate locally with the relevant checks and workflows.
2. Create a production backup before any risky data operation.
3. Review the complete diff and rollback path.
4. Apply reviewed D1 migrations before code that depends on them.
5. Configure the Worker `CATALOG_SYNC_SECRET` and `CATALOG_REPOSITORY`, plus GitHub's `CATALOG_SYNC_SECRET` and `CATALOG_SYNC_URL` secrets.
6. Deploy only with explicit production approval.
7. Verify the affected production workflows immediately.

Use `npm run preview` for material Workers-runtime changes. Run `npm run typecheck` and `npm run lint` after material TypeScript changes.

## 🛡️ Remote safety

- Commands are local unless they use `--remote` or deploy.
- Never deploy, migrate production, replace data, create resources, change DNS, or add secrets without explicit approval.
- Never commit `.dev.vars`, credentials, exports, backups, or Wrangler state.
- Read [`migrations/README.md`](../migrations/README.md) before schema changes.
- Read [`OPERATIONS.md`](OPERATIONS.md) before migrations, bulk synchronization, restoration, or recovery.

## ⌨️ Commands

- Local migrations: `npm run db:migrate:local`
- Production migrations: `npm run db:migrate:production`
- Manual production deployment: `npm run deploy`
