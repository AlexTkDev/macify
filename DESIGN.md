---
name: Macify playful sample tray
description: A bright, tactile directory that treats excellent Mac apps like collectible design objects.
---

# North star

The approved homepage composition is [`.impeccable/mocks/home-c.png`](.impeccable/mocks/home-c.png). The approved detail composition is [`.impeccable/mocks/app-detail.png`](.impeccable/mocks/app-detail.png), with mobile translations in `home-mobile.png` and `app-detail-mobile.png`.

Macify is a playful studio table, not an App Store clone and not a SaaS card grid. Real application icons interrupt oversized language and become physical-looking objects. Preview artwork supplies product context. Bright cobalt, orange, yellow, mint, and pale periwinkle create rhythm against a cool white canvas. The result should feel energetic and designed while remaining extremely easy to scan.

# Component grammar

- Public display type uses Urbanist at heavy weights, a tight but readable line height, and no tracking tighter than `-0.055em`.
- App icons keep their authentic artwork, 22% corner radius, and one soft depth shadow.
- Corners are gently rounded, never uniformly pill-shaped. Buttons use compact rectangles; tags are text with small colored shapes.
- Public pages avoid card chrome. Hierarchy comes from scale, color fields, whitespace, and artwork.
- Preview images and screenshots always use intrinsic dimensions: `width: 100%`, `height: auto`, no forced crop, fixed height, letterbox, or decorative padding.
- Motion is reserved for the Surprise refresh and direct hover feedback. Reduced-motion preferences remove both.

# Homepage

The hero is a two-column composition on desktop. The left side carries “Mac apps worth making room for.” with three real app icons woven into the words. The right side carries one naturally proportioned preview and a compact overlapping identity label. The supporting sentence is “An accurate list of the most useful macOS applications.”

The second fold shows exactly ten apps in a five-by-two sample wall. Color fields create the visual rhythm; each sample still exposes its name. On mobile the wall becomes a clean two-column scan of icon, name, and short tagline. “Surprise me” is the only secondary action and replaces the ten items with a new random selection.

# Application page

The application hero contains an oversized icon, name, official tagline, concise price, up to four tags, an open-source label only when true, and one cobalt “Official website” action. Category is never public. Playful paper shapes may occupy the spare desktop column, but disappear before they compete with content.

The preview follows the identity and keeps its natural aspect ratio. The editorial body begins with a large lead paragraph. The redundant tagline heading and “What it does” section are removed at render time. “What you can do” and “Where it fits” become clear story columns; Markdown lists retain visible markers. Related apps form a loose icon shelf instead of repeating homepage tiles.

# Responsive behavior

At tablet width the hero drops decorative shapes and prioritizes identity. At phone width, search collapses to an icon until focused, the homepage stacks, the application identity centers, the website action becomes full width, and related apps become a horizontal shelf. No headline or app name may clip between 320px and desktop widths.

# Implementation inventory

| Visible ingredient | Medium | Commitment |
| --- | --- | --- |
| Oversized hero language | Semantic HTML + CSS | Three explicit lines with icon interruptions |
| Application icons | Existing project media | Authentic artwork, never generated substitutes |
| Featured and detail previews | Existing project media | Natural ratio and no crop |
| Sample-wall color rhythm | CSS | Ten fields, five columns desktop, open list mobile |
| Detail paper objects | CSS geometry | Decorative only; hidden on smaller screens |
| Search | Existing React component + API | Inline results with icon, name, tagline |
| Surprise interaction | Existing React state + CSS | Ten new apps, one restrained refresh transition |
| Core text and controls | Semantic HTML | Never rasterized from the comps |

# Dashboard boundary

The public visual language does not remove editorial capability. The dashboard may continue to show category, publication state, media roles, pricing structure, and source status because those fields are operational rather than promotional.
