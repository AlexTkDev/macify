# Submission page

`submission-page.tsx` renders the GitHub submission link, agent instructions section, FAQ, and closing application links. The page has one layout; there is no variant selector.

`submission-controls.tsx` copies the generic prompt from `src/lib/shared/submission.ts`. If clipboard access fails, it shows a selected, read-only text area for manual copying. The full prompt is also available in a disclosure and as Markdown at `/submit/instructions`.

Agent marks are decorative. There is no tool picker or website input; the copied prompt asks the agent to request the official website first. The contributor reviews the completed listing before the agent opens a pull request.

The contribution guide, prompt, FAQ, and editorial policy specify an initial review window of 12–48 hours. Public contributions add one new application, one new deal, or a matching new application-and-deal pair. Merging creates a pending editorial revision; publication requires the owner's approval.

The closing links point to Dayflow, Droppy, and OpenUsage. They have accessible names and hover/focus feedback. Dayflow and Droppy artwork was sourced from their catalogue image URLs:

- Dayflow: https://ph-files.imgix.net/24859d62-e633-433e-af4a-f029bf391e82.png?auto=format
- Droppy: https://getdroppy.app/assets/brand/droppy-icon-default-512.webp?v=20260908

OpenUsage artwork is shared with the existing application assets. Agent mark sources and licensing are documented in `public/submission/agents/SOURCES.md` and its adjacent license. Marks remain their owners' property.
