# ✍️ Editorial standard

## 🎯 Goal

Help readers decide whether an application fits their workflow. Explain verified capabilities, practical use, audience, and meaningful tradeoffs without repeating marketing copy.

Application descriptions are stored as Markdown. Aim for roughly 300 useful words, but stop sooner when a focused application is already explained clearly. Never pad a description to reach a word count.

## 🔎 Research

1. Read the official website, documentation, changelog, pricing, privacy policy, and platform requirements.
2. Consult independent reviews or substantial first-hand discussions for real-world experience.
3. Verify changing claims such as pricing, availability, licensing, privacy, sync, and system requirements against current official sources.
4. Separate stable behavior from beta, announced, experimental, or discontinued features.

Official sources establish facts. Independent sources provide experience. Paraphrase research and do not copy marketing claims, testimonials, reviews, or user comments.

## 🧱 Description structure

Use this order as a suggested template. Adapt or omit sections, paragraph counts, and list lengths when another structure explains the application more clearly; these are not validation requirements:

1. Two or three untitled opening paragraphs, each no longer than three sentences.
2. `## Features` followed by four to eight verified Markdown bullets.
3. `## Where it fits` with the ideal audience, relationship to alternatives, and a meaningful limitation or tradeoff.
4. `## Privacy and requirements` covering the application's data model, relevant permissions, accounts, platform support, and hardware or service dependencies. Attribute privacy claims to the developer unless independently established.
5. `## Pricing` stating whether the application is free, freemium, a one-time purchase, or subscription-based. Keep exact, rapidly changing prices consistent with the structured pricing fields and make regional or tax variability clear when relevant.

```markdown
[What the app is, the problem it solves, and its distinctive interaction.]

[How its core workflow works in practical situations.]

[The operating model or product idea that separates it from alternatives.]

## Features

- [Verified capability and why it matters]

## Where it fits

[Best audience, alternatives, and primary tradeoff.]

## Privacy and requirements

[Data storage and processing, accounts, permissions, supported macOS versions, hardware requirements, and optional services.]

## Pricing

[Commercial model and concise current pricing context.]
```

Descriptions must contain 40–20,000 characters. Use level-two Markdown headings for sections; raw HTML is skipped by the renderer. These format limits do not replace editorial review.

Structured pricing uses `pricingType` (`free`, `freemium`, or `paid`) and `billingType` (`one_time`, `subscription`, or `null`). Free applications require `null`; freemium and paid applications require a billing type. Public pricing uses `pricingDetails` when present, otherwise the generated classification label. Keep those fields consistent with the description.

Homepage inclusion is separate from publication; an application can remain in the directory without being featured on the homepage.

<a id="deal-verification"></a>

## 🏷️ Deal verification

Deals must reference an existing application manifest. Immediately before merging, verify the discount, code, destination, and availability window against an official source. Use timezone-qualified timestamps and link directly to the offer. Do not infer terms from promotional artwork alone.

Deal manifests belong in `catalog/deals`.
