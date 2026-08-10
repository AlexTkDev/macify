# Release workflow

Macify uses proportional release checks. The amount of validation should match the risk of the change rather than forcing every edit through the same process.

## GitHub-driven production deployment

The intended production path is Cloudflare Workers Builds connected to `Beingpax/macify`:

- Existing Worker: `macify`
- Production branch: `main`
- Root directory: `/`
- Build command: `npm run ci:check`
- Deploy command: `npm run deploy`
- Non-production branch builds: disabled initially

Once the connection is active, merging or directly pushing to `main` authorizes and triggers a production deployment. Do not push to `main` until the change has the required approval and validation. Feature branches and pull requests remain review surfaces and must not deploy production.

Connect the existing Worker in Cloudflare under **Workers & Pages → macify → Settings → Builds → Connect**. Authorize the GitHub account, select `Beingpax/macify`, enter the settings above, and save. Cloudflare creates and retains the build token; runtime secrets remain configured on the Worker and must not be copied into GitHub.

After connecting, merge a harmless documentation-only commit to `main`, confirm a successful build in the Worker’s build history, and verify the production URL. Only then treat GitHub as the authoritative deployment path. Keep `npm run deploy` available for an explicitly approved emergency deployment or rollback.

## Low-risk direct production changes

An isolated change may skip staging and deploy directly to production when all of the following are true:

- It only changes CSS, static wording, or similarly presentation-only code.
- It does not change shared behavior, application data, database schema, authentication, authorization, imports, media processing, routing, metadata, bindings, secrets, DNS, or Cloudflare configuration.
- Its effect is obvious from the diff and easy to reverse.
- The user explicitly requests or approves a direct production deployment.

For these changes, use lightweight validation only:

1. Inspect the focused diff.
2. Run the narrow relevant check, normally `npm run typecheck`, `npm run lint`, or a CSS/UI detector when applicable. Skip checks that cannot exercise the changed surface.
3. Merge the approved change to `main` for automatic deployment, or use `npm run deploy` only for an explicitly approved manual release.
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
5. Merge the approved change to `main` for automatic production deployment. Use `npm run deploy` only when a manual release is explicitly required.
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
Read [`OPERATIONS.md`](OPERATIONS.md) before production migrations, bulk imports, catalogue replacement, or recovery. Record a Time Travel bookmark and verified SQL export before those operations.
