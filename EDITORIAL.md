# Macify Editorial Standard

## Purpose

Every application description should help a reader decide whether the app belongs in their workflow. It must explain the product through verified facts, realistic use, and honest tradeoffs rather than repeating a landing page or padding a short feature list.

Descriptions are stored as Markdown in the application's `description` field. Write at least 150 words, but do not impose a maximum. Stop when the reader has enough useful context to make a decision.

## Homepage curation

Homepage inclusion is a separate editorial decision from catalogue publication. Follow [`HOMEPAGE_CURATION.md`](HOMEPAGE_CURATION.md) when adding or removing applications from the approved homepage pool, validating required media, or recording a curation decision. Do not unpublish an otherwise valid catalogue record merely to remove it from the homepage.

## Required research

Research every application independently before writing.

1. Read the official website, documentation or manual, changelog, pricing page, and platform requirements when available.
2. Read at least two independent reviews or user discussions. Include Reddit when it contains substantial first-hand experience.
3. Identify repeated workflows, appreciated details, limitations, reliability concerns, and reasons people keep or stop using the app.
4. Verify changing facts such as price, supported macOS versions, sync, licensing, privacy, and availability against a current official source.
5. Distinguish stable features from beta, experimental, announced, or discontinued features.

Official sources establish product facts. Independent sources reveal how the product feels in practice. User comments are experience, not authoritative specifications.

Paraphrase all research. Do not copy marketing claims, testimonials, Reddit comments, or review prose. Public descriptions should not contain citations unless a link is directly useful to the reader; keep a record of research sources in the work summary instead.

## Required structure

Use this order for every application.

### 1. Three untitled opening paragraphs

No heading appears above these paragraphs.

- Paragraph one defines the app, the problem it solves, and the interaction that makes it distinct. Do not repeat the tagline.
- Paragraph two explains the core workflow with concrete situations in which someone would use it.
- Paragraph three explains the product philosophy, note model, operating model, or practical value that separates it from alternatives.

Each paragraph must contain no more than three sentences. Two clear sentences are preferable when they carry the same information.

### 2. Features

The first heading must be exactly:

```markdown
## Features
```

Follow it with a Markdown list of verified capabilities. Use four to eight items when the product supports that much useful detail.

- Explain what each feature does or why it matters; do not merely name it.
- Group closely related capabilities into one item.
- Keep each item focused on one workflow or outcome.
- Include access methods, modes, integrations, privacy, storage, export, or automation only when they materially affect use.
- Do not mix limitations, recommendations, or marketing judgments into the feature list.

### 3. Where it fits

Use this exact heading:

```markdown
## Where it fits
```

Keep this section concise, normally one or two short paragraphs. Name the best audience, explain whether the app replaces or complements familiar alternatives, and state meaningful limitations or tradeoffs.

No paragraph may contain more than three sentences. Avoid vague conclusions such as “great for everyone” or “worth checking out.”

## Markdown template

```markdown
[Paragraph one: define the app, problem, and distinctive interaction.]

[Paragraph two: explain the core workflow through concrete situations.]

[Paragraph three: explain the product philosophy or practical value.]

## Features

- [Verified capability and why it matters]
- [Verified capability and why it matters]
- [Verified capability and why it matters]
- [Verified capability and why it matters]

## Where it fits

[Ideal user, relationship to alternatives, and the primary tradeoff.]
```

## Voice and editing rules

- Write in calm, direct, specific language for macOS users.
- Prefer concrete nouns and verbs. Explain what happens when the user invokes a feature.
- Keep every paragraph to three sentences or fewer throughout the description.
- Use the app's name naturally, but avoid beginning every paragraph or bullet with it.
- Avoid hype, superlatives, unsupported performance claims, and copied slogans.
- Avoid describing a feature twice in different sections.
- State limitations plainly without turning the copy into a review score or complaint.
- Do not speculate about unreleased features. Label beta functionality when it is important enough to mention.
- Keep pricing details in the structured pricing fields unless price is essential to understanding the recommendation.
- Do not add a title for the opening prose. `Features` must be the first heading.

## Agent workflow

1. Locate the application's current record and canonical source data.
2. Research official and independent sources according to this standard.
3. Draft the three untitled opening paragraphs.
4. Build the verified feature list from current official documentation.
5. Write a concise `Where it fits` section using repeated real-world patterns from independent sources.
6. Check every changing claim against an official source again.
7. Check paragraph sentence counts, Markdown structure, repetition, and factual consistency.
8. Update the canonical source representation as well as the requested local record. Do not change remote D1 data without explicit approval.
9. Report the sources consulted and identify any beta or uncertain claims.

## Publication checklist

- The description contains at least 150 useful words and has no artificial maximum.
- Exactly three untitled paragraphs appear before the first heading.
- `## Features` is the first heading and is followed by a real Markdown list.
- Every feature is verified and explains practical value.
- `## Where it fits` is concise and includes an honest tradeoff.
- No paragraph contains more than three sentences.
- The tagline is not repeated as the opening sentence.
- Stable and beta capabilities are clearly distinguished.
- Price, platform, sync, privacy, and licensing claims are current.
- The copy contains no padding, copied marketing language, or unsupported praise.
