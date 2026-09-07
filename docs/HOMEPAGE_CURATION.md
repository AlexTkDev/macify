# 🏠 Homepage curation

The homepage combines curated fallback selections with Hot, Trending, and Latest views. Search, categories, and application pages cover the wider published directory.

## 📍 Source of truth

`HOMEPAGE_CURATED_SLUGS` in [`src/lib/directory-search-data.ts`](../src/lib/directory-search-data.ts) contains the curated fallback pool. Hot and Trending use analytics-ranked published applications when available, then fill remaining places from this pool, up to 30 entries. Latest selects up to 30 published applications by creation date, newest first.

The queries select published, non-deleted applications. Editorially, each selection should also have:

- an authentic icon;
- a usable wide preview;
- a concise name and tagline.

Media completeness is an editorial requirement, not a filter in the directory query; missing icons or previews can still be returned as null. Missing media should be fixed in the record. Keep curated fallback entries in this approved pool; analytics-ranked and Latest entries are selected independently. Removing a slug from the pool does not unpublish or delete the application.

## 🔄 Changing the pool

1. Confirm the exact catalogue slug and publication state.
2. Verify the icon, preview, name, and tagline.
3. Add or remove the unique slug in `HOMEPAGE_CURATED_SLUGS`.
4. Run the relevant TypeScript and lint checks.
5. Confirm the curated fallback contains only approved eligible entries, and check Hot, Trending, and Latest independently.

If fewer than 30 curated applications are eligible, use that subset for the curated fallback rather than adding arbitrary catalogue entries.

## 🖼️ Hero and featured status

`getHomepageHeroData` in the same module selects Dayflow, CleanShot X, Swish, and Droppy independently of analytics and the curated fallback pool. Only published, non-deleted records are returned. The dashboard’s featured flag is separate metadata; it does not add a slug to this hero selection or override the directory’s ranking queries.
