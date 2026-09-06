# Editorial standard

## Goal

Help readers decide whether an application fits their workflow. Explain verified capabilities, practical use, audience, and meaningful tradeoffs without repeating marketing copy.

Descriptions are stored as Markdown. Aim for roughly 300 useful words, but stop sooner when a focused application is already explained clearly. Never pad a description to reach a word count.

## Research

1. Read the official website, documentation, changelog, pricing, and platform requirements.
2. Consult independent reviews or substantial first-hand discussions for real-world experience.
3. Verify changing claims such as pricing, availability, licensing, privacy, sync, and system requirements against current official sources.
4. Separate stable behavior from beta, announced, experimental, or discontinued features.

Official sources establish facts. Independent sources provide experience. Paraphrase research and do not copy marketing claims, testimonials, reviews, or user comments.

## Description structure

Use this order:

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

## Voice

- Write calmly, directly, and specifically.
- Prefer concrete nouns and verbs.
- Do not repeat the tagline as the opening sentence.
- Avoid hype, unsupported comparisons, padding, and duplicated features.
- State limitations plainly.
- Keep pricing in structured fields unless it is essential to the recommendation.
- Do not speculate about unreleased functionality.

## Publication check

- Facts and changing claims are current.
- The opening has two or three untitled paragraphs.
- `Features` is the first heading and contains verified capabilities.
- `Where it fits` identifies audience and tradeoffs.
- `Privacy and requirements` distinguishes local behavior, cloud behavior, permissions, and developer claims.
- `Pricing` is the final section and agrees with the structured pricing fields.
- No paragraph exceeds three sentences.
- Markdown is valid and contains no raw HTML.
- The record has an authentic icon, a usable preview, focused categories, and a working official link.

Homepage inclusion is separate from publication. Follow [`HOMEPAGE_CURATION.md`](HOMEPAGE_CURATION.md) without unpublishing an otherwise valid catalogue record.
