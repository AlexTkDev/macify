# Database schema

`schema.sql` is the complete schema for a new Macify D1 database. It creates every
table, column, constraint, and index required by the current application in one pass.

Run `npm run db:initialize:local` to initialize an empty local database. Normal local
setup runs this automatically. The initializer verifies the required tables and
current Editor’s Pick column without changing the existing application schema.

Run `npm run db:initialize:production` only when the configured production database is
empty. The command refuses to apply the creation schema over a partially initialized
database.

When the schema changes, update both `schema.sql` and the TypeScript definitions under
`src/db`. An existing populated database must receive the corresponding one-time SQL
change before application code using the new structure is deployed.

`deals.ends_at` is nullable. A deal with no scheduled expiry uses `NULL`; adding or
updating such an offer is a normal data change and requires no schema migration.
