# Release workflow

Macify uses proportional release checks. The amount of validation should match the risk of the change rather than forcing every edit through the same process.

## Low-risk direct production changes

An isolated change may skip staging and deploy directly to production when all of the following are true:

- It only changes CSS, static wording, or similarly presentation-only code.
- It does not change shared behavior, application data, database schema, authentication, authorization, imports, media processing, routing, metadata, bindings, secrets, DNS, or Cloudflare configuration.
- Its effect is obvious from the diff and easy to reverse.
- The user explicitly requests or approves a direct production deployment.

For these changes, use lightweight validation only:

1. Inspect the focused diff.
2. Run the narrow relevant check, normally `npm run typecheck`, `npm run lint`, or a CSS/UI detector when applicable. Skip checks that cannot exercise the changed surface.
3. Deploy with `npm run deploy` after approval.
4. Verify the affected production route and asset once.

A small CSS or copy adjustment does not require a staging deployment, exhaustive route audit, catalogue synchronization, full regression suite, or repeated production checks unless the change reveals a wider problem.

## Changes that require staging

Use local validation, staging, and then production for changes involving any of the following:

- Application behavior, client interactions, server actions, or route handlers.
- Authentication, authorization, sessions, cookies, security, or rate limiting.
- D1 schema or migrations, R2 media, imports, exports, or catalogue synchronization.
- Bindings, secrets, Workers/OpenNext configuration, environment behavior, DNS, or custom domains.
- Shared responsive systems or broad visual changes affecting multiple surfaces.
- Dependency upgrades, performance work, accessibility behavior, or changes with uncertain impact.

The normal sequence is:

1. Validate locally in proportion to the change.
2. Back up remote data before destructive or replacement operations.
3. Deploy to staging with `npm run deploy:staging`.
4. Verify only the relevant staging workflows; use exhaustive audits for release-wide or data-wide changes.
5. Deploy to production with `npm run deploy` after explicit approval.
6. Verify the affected production workflows and retain rollback information.

## Editorial content

Routine application descriptions, tags, pricing, media, and publication changes may be made directly through the protected production dashboard after launch. Use staging for bulk replacements, imports, schema-dependent editorial changes, or risky media operations.

## Remote safety

- Commands are local unless they explicitly use `--remote` or deploy.
- Never deploy, migrate a remote database, change DNS, create resources, or add secrets without explicit approval for that step.
- Keep local, staging, and production D1/R2 resources separate.
- Never commit `.dev.vars`, credentials, database exports, Wrangler state, or temporary backups.
- Prefer staging when classification is uncertain.

## Database and catalogue commands

- Local migrations: `npm run db:migrate:local`
- Staging migrations: `npm run db:migrate:staging`
- Production migrations: `npm run db:migrate:production`
- Replace staging from canonical local data: `npm run staging:replace-from-local`
- Replace production from canonical local data: `npm run production:replace-from-local`

Read [`migrations/README.md`](migrations/README.md) before changing schema or migration history.
