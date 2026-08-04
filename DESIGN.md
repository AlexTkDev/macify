---
name: Macify playful sample tray
description: A bright, tactile directory that treats excellent Mac apps like collectible design objects.
---

# North star

The approved homepage composition is [`.impeccable/mocks/home-c.png`](.impeccable/mocks/home-c.png). The approved detail composition is [`.impeccable/mocks/app-detail.png`](.impeccable/mocks/app-detail.png), with mobile translations in `home-mobile.png` and `app-detail-mobile.png`.

Macify is a playful studio table, not an App Store clone and not a SaaS card grid. Real application icons interrupt oversized language and become physical-looking objects. Preview artwork supplies product context. Bright cobalt, orange, yellow, mint, and pale periwinkle create rhythm against a cool white canvas. The result should feel energetic and designed while remaining extremely easy to scan.

# Component grammar

- The homepage hero uses Caprasimo for a chunky, friendly display voice with soft, playful character. Urbanist remains the body and interface family. Display tracking is never tighter than `-0.04em`.
- App icons keep their authentic artwork, 22% corner radius, and one soft depth shadow.
- Corners are gently rounded, never uniformly pill-shaped. Buttons use compact rectangles; tags are text with small colored shapes.
- Public pages avoid card chrome. Hierarchy comes from scale, color fields, whitespace, and artwork.
- Preview images and screenshots always use intrinsic dimensions: `width: 100%`, `height: auto`, no forced crop, fixed height, letterbox, or decorative padding.
- Motion is reserved for the Surprise refresh and direct hover feedback. Reduced-motion preferences remove both.
- The persistent Surprise Me control stays monochrome and unfilled, using only a restrained shuffle rotation on direct interaction; at narrow widths it reduces to the icon without losing its accessible label.

# Homepage

The hero is a two-column composition on desktop. The left side carries “Mac apps worth making room for.” with three real app icons woven into the words. Its type scale responds to the actual width of the copy column, with explicit minimum and maximum sizes; each authored row stays intact, including “Mac [icon] apps” on the first row. The right side carries one naturally proportioned preview and a compact overlapping identity label. The supporting sentence, “A curated list of the most useful macOS applications.”, remains a separate paragraph with its own scale.

The second fold shows 30 apps in a five-column sample wall. Color fields create the visual rhythm; each sample still exposes its name. On mobile the wall becomes a clean two-column scan of icon, name, and short tagline. “Surprise me” is the only secondary action and replaces the 30 items with a new random selection.

# Application page

The application hero is a centered two-line editorial composition. “Meet”, the authentic app icon, and the application name form the larger first line; the official tagline always forms the second line at roughly two-thirds of the identity scale. Both use independent container-relative `clamp()` scales with explicit minimum and maximum sizes. A restrained amber underline accents the tagline. Concise pricing, up to three tags, and an open-source label only when true form one dot-separated fact row. “Official website” is a quiet text action with an external arrow.

The centered preview follows the identity and keeps its natural aspect ratio. The editorial body is a single, left-aligned article column with ordinary paragraph typography. The redundant tagline heading and generic or app-named “What it does” section are removed at render time. “What you can do” is a normal heading followed by a standard bulleted list; “Where it fits” is the next heading followed by body copy. Related apps form a loose icon shelf instead of repeating homepage tiles.

Tags are clickable discovery links. Their destination pages use one oversized tag-led heading followed by the homepage preview wall, preserving the same color rhythm, natural app imagery, and direct hover feedback without introducing a second filtering interface.

# Responsive behavior

At tablet width the detail headline scales down while preserving the centered identity and fact row. At phone width, search collapses to an icon until focused, the homepage stacks, the application title may wrap after the icon-name introduction, and related apps become a horizontal shelf. No headline or app name may clip between 320px and desktop widths.

# Implementation inventory

| Visible ingredient | Medium | Commitment |
| --- | --- | --- |
| Oversized hero language | Semantic HTML + CSS | Three explicit lines with icon interruptions |
| Application icons | Existing project media | Authentic artwork, never generated substitutes |
| Featured and detail previews | Existing project media | Natural ratio and no crop |
| Sample-wall color rhythm | CSS | Ten fields, five columns desktop, open list mobile |
| Detail identity underline | CSS geometry | Restrained amber hand-drawn accent beneath the tagline |
| Search | Existing React component + API | Inline results with icon, name, tagline |
| Surprise interaction | Existing React state + CSS | Ten new apps, one restrained refresh transition |
| Core text and controls | Semantic HTML | Never rasterized from the comps |

# Dashboard boundary

The public visual language does not remove editorial capability. The dashboard continues to show tags, publication state, media roles, pricing structure, and source status because those fields are operational rather than promotional.
