# Homepage curation

## Purpose

The homepage is an editorial selection, not a catalogue-wide listing. It should expose a deliberately maintained group of useful applications while search, tag pages, and application pages continue to cover the wider published catalogue.

## Current behavior

- The approved homepage pool contains 32 application slugs.
- Each homepage request randomly selects 30 applications from that pool.
- An application must be published and not deleted before it can appear.
- No application outside the approved pool may be used as a fallback.
- Removing an application from the homepage pool does not unpublish or delete its catalogue record.
- Homepage curation does not change inline search, tag pages, the hero selection, or the Surprise Me route.

The canonical pool is `HOMEPAGE_CURATED_SLUGS` in [`src/lib/directory-search-data.ts`](src/lib/directory-search-data.ts). The code list is the source of truth; counts in documentation must be updated whenever that list changes.

## Media requirements

Every approved application should have:

- one authentic application icon;
- one usable wide preview image;
- a concise public name and tagline;
- a published, non-deleted record.

The homepage presents preview images at one consistent aspect ratio and uses the icon fallback only when a preview is unavailable. Missing media should be corrected in the application record instead of replacing the application with an unapproved catalogue entry.

## Changing the pool

1. Resolve the requested application to its exact catalogue slug.
2. Confirm that the record is published, not deleted, and has the required media.
3. Add or remove the slug in `HOMEPAGE_CURATED_SLUGS`.
4. Keep every slug unique. Do not add aliases or duplicate records.
5. Update the documented pool count in this file and [`PRODUCT.md`](PRODUCT.md).
6. Append a dated entry to the decision log below, including additions, removals, exclusions, and any clarified spoken names.
7. Run the relevant TypeScript and lint checks.
8. Verify that the rendered homepage contains 30 entries and that each entry belongs to the approved pool.

When the approved pool contains more than 30 published applications, selection remains random within the pool. If fewer than 30 approved applications are eligible, the homepage should return the eligible subset rather than silently filling from the full catalogue.

## Decision log

| Date | Decision |
| --- | --- |
| 2026-08-10 | Replaced catalogue-wide homepage sampling with a curated pool of 34 applications. The homepage continued to select 30 entries randomly from the approved pool. MacWhisper was explicitly excluded, and the spoken name “Yax Mind” was resolved to Xmind. |
| 2026-08-10 | Removed Dato and Cold Turkey Blocker from homepage eligibility. BetterTouchTool remained approved. The pool changed from 34 to 32 applications. |

