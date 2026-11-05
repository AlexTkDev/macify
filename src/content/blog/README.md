# Blog content

Each published article owns a folder under `posts/<slug>/`.

Required files:

- `index.ts`: the typed listing, routing, image, and SEO definition.
- Article-specific files such as `comparison.ts`, `review.ts`, or `content.ts`.

Add the post definition to `registry.ts`. The blog grid and sitemap consume that registry automatically. Public routes remain in `src/app`; they import their content from the post folder and use the shared metadata and structured-data helpers.

Set `published: false` to unpublish an article. The registry excludes it from listings and the sitemap; its page and image routes must also check `getBlogPost` and return `notFound()` when unavailable.

Use `kind: "comparison"` for multi-app comparisons, `kind: "review"` for a single application review, and `kind: "guide"` for general editorial articles. Reference catalogue applications by slug instead of duplicating their catalogue records.
