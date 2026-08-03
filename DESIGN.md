---
name: Macify Product Interface
description: A precise, Mac-native editorial system for a curated application directory and its management workspace.
colors:
  background: "oklch(1 0 0)"
  surface: "oklch(0.975 0.004 90)"
  surface-strong: "oklch(0.944 0.007 90)"
  foreground: "oklch(0.19 0.014 65)"
  foreground-soft: "oklch(0.46 0.012 65)"
  line: "oklch(0.9 0.008 90)"
  primary: "oklch(0.47 0.13 75)"
  primary-soft: "oklch(0.94 0.055 91)"
  accent: "oklch(0.29 0.07 326)"
  success: "oklch(0.48 0.11 150)"
typography:
  display: "-apple-system, BlinkMacSystemFont, SF Pro Display, Helvetica Neue, Arial, sans-serif"
  body: "-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, Arial, sans-serif"
radius:
  small: "7px"
  medium: "12px"
spacing:
  base: "4px"
  content-width: "1240px"
---

# 1. Creative North Star

Macify should feel like opening an exceptionally maintained Mac utility: immediate, legible, calm, and trustworthy. The public directory is editorial rather than promotional. The dashboard is an instrument panel rather than a generic SaaS shell.

The signature composition is the **Mac shelf**: one editorial recommendation paired with a compact application index. It combines the visual confidence of a magazine selection with the scan speed of Finder list view. Application icons and screenshots supply most of the visual color; Macify supplies order.

# 2. Design Principles

1. **Utility before ornament.** Search, category, price, compatibility, licensing, and source context appear before decorative content.
2. **Restraint communicates trust.** Use white space, rules, typography, and tonal surfaces. Avoid gradients, translucent glass, decorative glow, and nested card stacks.
3. **Mac-native, independently branded.** Borrow the clarity and density users expect from macOS without reproducing Apple interfaces or assets.
4. **Editorial hierarchy is visible.** Distinguish verified facts, publisher claims, and Macify opinion through labels and placement.
5. **Media owns the color.** Application artwork remains prominent against a mostly neutral interface. Honey amber is reserved for selection and action; aubergine supports occasional editorial campaigns.
6. **Dense does not mean cramped.** Tables and metadata remain compact while preserving 40px minimum interactive targets and clear grouping.

# 3. Tokens

## Color

- `background` is pure white and is the default page and panel color.
- `surface` is the dashboard canvas, hover state, and subtle grouping tone.
- `surface-strong` is reserved for selected table controls and secondary states.
- `foreground` carries all primary text and structural marks.
- `foreground-soft` carries descriptions and secondary metadata.
- `line` and `line-strong` provide hierarchy without shadows.
- `primary` is a dark burnished amber that preserves white-text contrast. Use for the single primary action, selected state, and verified editorial emphasis.
- `primary-soft` supports selected navigation, featured content, and draft badges.
- `accent` is deep aubergine and is reserved for occasional editorial campaigns.
- `success` communicates connected or published states and must always be paired with text or an icon.

All new colors must be authored in OKLCH. Do not introduce hex, RGB, or HSL tokens.

## Typography

Use the system font stack so Macify feels fast and native without downloading a web font. Display headings use the system display face with tight tracking and controlled negative letter spacing. Body copy uses the text face at comfortable line lengths. Avoid uppercase except for short functional labels and kickers.

Recommended scale: 11, 12, 13, 14, 15, 17, 21, 30, 39, and fluid 44–78px. Use weight and spacing before adding new sizes.

## Spacing and shape

Use a 4px base grid. Primary component gaps generally use 8, 12, 16, 24, 32, 48, or 72px. Public content is capped at 1240px with a 24px desktop gutter and 15px mobile gutter.

Use 7px for controls and 12px for grouped panels. Application icons use the squircle-like `23%` radius expected of Mac artwork. Pills are permitted only for categories, statuses, and compact filters.

## Elevation

Borders and tonal changes are the default means of separation. Shadows are limited to elevated search focus and application artwork. Never apply a shadow to every card or dashboard panel.

# 4. Component Language

## Navigation

The public header keeps the brand at the left and inline search at the right. It avoids extra navigation so application discovery remains the primary task. The dashboard uses a fixed-width white sidebar over a soft canvas; the selected destination is a honey-tinted row.

## Search

The header search returns published applications inline as the user types. It searches application names, taglines, descriptions, categories, and tags without sending the user to a separate search page. Enhanced keyboard search navigation is deferred. Focus is represented by a high-contrast amber outline and never by color alone.

## Application presentation

Use three related densities:

- **Feature:** large icon, name, concise pitch, three factual attributes, and one primary action.
- **Index row:** 52px icon, name, one-line tagline, category, and price.
- **Table row:** 40px icon, name, category, pricing, source, and publication state.

Related applications use the index-row language. A relationship can be stored once and queried from either direction; users should never see duplicate reciprocal entries.

## Buttons and controls

Use one filled primary button per local action group. Secondary buttons are white with a clear border. Text actions are used for low-risk navigation. Icon-only buttons require an accessible name and a minimum 30px visual box inside a 40px target where possible.

## Data tables

Tables use uppercase 10px column labels, 68px data rows, and horizontal scrolling within the panel on narrow screens. Hover uses `surface`; selection uses `primary-soft`. Empty states must explain what is missing and offer one next action.

# 5. Layout Patterns

## Public directory

The page follows a quiet sequence: header with inline search, a concise discovery statement, a shuffleable application grid, and footer. Application cards prioritize artwork and automatically sourced metadata over interface copy. Individual application pages should place identity and key facts first, followed by detailed description, pricing and source facts, alternatives, related apps, and editorial context.

## Editorial dashboard

Desktop uses a 228px sidebar and a fluid main workspace. Status summaries appear in a single four-column strip rather than independent statistic cards. Tables and forms sit in bordered white panels. On mobile the sidebar collapses to the brand header, actions stack, status cells become a single column, and tables scroll only inside their panel.

## Forms and imports

Application editing should group fields as identity, editorial content, availability and pricing, media, classification, relationships, and SEO. Imports follow upload, map, validate, review, and commit. Validation errors remain attached to their row and can be exported for correction.

# 6. Accessibility and Content

Target WCAG 2.2 AA. Preserve semantic landmarks, table headings, labels, visible focus, 200% zoom, reduced-motion support, and meaningful source order. Never encode draft, published, free, paid, open-source, or compatibility status with color alone.

Editorial content uses short sentences and specific facts. Taglines explain the outcome, not the marketing claim. Pricing separates access tier from billing method. Images require factual alt text; decorative icon marks use hidden semantics.
