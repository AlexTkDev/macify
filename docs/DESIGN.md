---
name: Macify playful app directory
description: A bright, precise directory led by authentic Mac application artwork.
---

# 🎨 Design

## 🧭 Direction

Macify combines oversized editorial language with authentic application artwork on a clean white canvas. It should feel playful and Mac-aware without resembling the Mac App Store or a generic SaaS interface.

Approved references:

- Homepage: [`.impeccable/mocks/home-c.png`](../.impeccable/mocks/home-c.png)
- Homepage mobile: [`.impeccable/mocks/home-mobile.png`](../.impeccable/mocks/home-mobile.png)
- Application page: [`.impeccable/mocks/app-detail.png`](../.impeccable/mocks/app-detail.png)
- Application mobile: [`.impeccable/mocks/app-detail-mobile.png`](../.impeccable/mocks/app-detail-mobile.png)

## 🧩 Visual system

- Use Caprasimo for large display copy and Urbanist for interface text. Caveat is reserved for restrained handwritten accents.
- Use pure white as the public background. Cobalt, orange, yellow, mint, pale periwinkle, honey amber, and deep aubergine provide controlled emphasis.
- Use project OKLCH tokens for authored interface colors.
- Keep authentic app icons at a 22% corner radius with one soft depth shadow.
- Let hierarchy come from scale, whitespace, color fields, and media rather than card chrome.
- Use compact rectangular controls. Reserve pills for true status or category semantics.
- Avoid gradients, glass effects, nested cards, low-contrast copy, decorative motion, and Apple imitation.

## 🏠 Homepage

The desktop hero is a two-column composition. The left side carries “Mac apps worth making room for.” in three authored rows with real app icons woven into the words. The supporting sentence remains separate. The right side uses one naturally proportioned application preview and a compact identity label.

The directory uses wide previews with the authentic icon, name, and short tagline beneath. It uses three columns on wide screens, two on tablets, and one on phones. Pricing and classification stay off this quick-browsing surface. Featured applications carry a “Featured” label.

## 🖥️ Application page

The hero centers “Meet”, the app icon, and the application name on the first line, followed by the official tagline with a restrained amber underline. A concise fact row contains pricing, up to 12 categories, and an open-source label only when true.

Previews keep their natural proportions. Editorial content uses one readable article column. Related applications appear as a loose icon shelf.

## ⌨️ Interaction and responsiveness

- Search results, forms, navigation, and controls must work by keyboard.
- Navigation presents Home, Deals, Categories, and Surprise me, followed by Submit app linking to GitHub. Deals remains visible when no offers are active.
- Motion is limited to direct feedback and removed when reduced motion is requested.
- No headline or application name may clip between 320 px and desktop widths.
- Public pages share consistent responsive gutters and target WCAG 2.2 AA.
