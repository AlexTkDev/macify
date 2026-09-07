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

## Description structure

Use this order:

1. Two or three untitled opening paragraphs of no more than three sentences each: purpose, workflow, and distinction.
2. `## Features` with four to eight verified bullets.
3. `## Where it fits`: audience, alternatives, and one meaningful limitation.
4. `## Privacy and requirements`: data handling, accounts, permissions, platform support, and dependencies. Attribute developer claims.
5. `## Pricing`: free, freemium, one-time purchase, or subscription. Match structured pricing fields and note regional variability when relevant.

Homepage inclusion is separate from publication. Follow [`HOMEPAGE_CURATION.md`](HOMEPAGE_CURATION.md) without unpublishing an otherwise valid catalogue record.

## Deal verification

Deals must reference an existing application manifest. Immediately before merging, verify the discount, code, destination, and availability window against an official source. Use timezone-qualified timestamps and link directly to the offer. Do not infer terms from promotional artwork alone.

Deal manifests belong in `catalog/deals`.
