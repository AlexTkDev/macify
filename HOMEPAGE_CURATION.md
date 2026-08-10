# Homepage curation

The homepage is an editorial selection, not the complete catalogue. Search, tags, and application pages cover the wider published directory.

## Source of truth

`HOMEPAGE_CURATED_SLUGS` in [`src/lib/directory-search-data.ts`](src/lib/directory-search-data.ts) contains the approved pool. Homepage requests select up to 30 eligible applications from that list.

An eligible application must be published, not deleted, and have:

- an authentic icon;
- a usable wide preview;
- a concise name and tagline.

Missing media should be fixed in the record. Do not fill the homepage with unapproved catalogue entries. Removing a slug from the pool does not unpublish or delete the application.

## Changing the pool

1. Confirm the exact catalogue slug and publication state.
2. Verify the icon, preview, name, and tagline.
3. Add or remove the unique slug in `HOMEPAGE_CURATED_SLUGS`.
4. Run the relevant TypeScript and lint checks.
5. Confirm the rendered homepage contains only approved eligible entries.

If fewer than 30 approved applications are eligible, show the eligible subset rather than using catalogue-wide fallback entries.
