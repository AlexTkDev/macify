# Editorial standard

## Goal

Help readers decide whether an application fits their workflow. Explain verified capabilities, practical use, audience, and tradeoffs without repeating marketing copy.

Descriptions are Markdown. Aim for about 300 useful words, but never pad a focused application.

## Research

1. Read the official website, documentation, changelog, pricing, privacy policy, and requirements.
2. Use independent reviews or substantial first-hand discussions for experience and tradeoffs.
3. Recheck changing facts such as pricing, availability, licensing, privacy, and platform support.
4. Distinguish stable features from beta, announced, experimental, or discontinued work.

Official sources establish facts. Independent sources provide experience. Paraphrase research and do not copy marketing claims, testimonials, reviews, or user comments.

## Suggested description template

This structure is a reusable starting point, not a validation requirement. Adapt or omit sections when another shape explains the application more clearly:

1. A concise opening covering purpose, workflow, and distinction.
2. `## Features` with focused, verified capabilities.
3. `## Where it fits`: audience, alternatives, and one meaningful limitation.
4. `## Privacy and requirements`: data handling, accounts, permissions, platform support, and dependencies. Attribute developer claims.
5. `## Pricing`: free, freemium, one-time purchase, or subscription. Match structured pricing fields and note regional variability when relevant.

Descriptions may use different headings, paragraph counts, and list lengths. They must remain factual, readable, and complete enough to help someone judge fit, important limitations, privacy, requirements, and cost.

Homepage inclusion is separate from publication. Follow [`HOMEPAGE_CURATION.md`](HOMEPAGE_CURATION.md) without unpublishing an otherwise valid catalogue record.

## Deal verification

Deals must reference an existing application manifest. Immediately before merging, verify the discount, code, destination, and availability window against an official source. Use timezone-qualified timestamps and link directly to the offer. Do not infer terms from promotional artwork alone.

Deal manifests belong in `catalog/deals`.
