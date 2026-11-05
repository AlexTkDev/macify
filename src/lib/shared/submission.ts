export const submissionRepository = "https://github.com/Beingpax/macify";
export const submissionRawRepository =
  "https://raw.githubusercontent.com/Beingpax/macify/main";
export const submissionTemplateUrl = `${submissionRepository}/blob/main/catalog/examples/application.example.json`;
export const submissionGitHubUrl = `${submissionRepository}/new/main/catalog/apps`;

export const submissionRequirements = [
  {
    title: "Available for 30+ days",
    description:
      "Publicly released for at least 30 days, with a working download.",
  },
  {
    title: "A thoughtful Mac experience",
    description:
      "Built for macOS, or a meaningful, well-supported experience on the Mac.",
  },
  {
    title: "Reliable and maintained",
    description:
      "Works on every macOS version you claim to support, with no unresolved critical problems.",
  },
  {
    title: "Clear, current information",
    description:
      "Public details about pricing, privacy, support, and downloads.",
  },
] as const;

export const submissionExclusions = [
  "Low-effort, hastily coded, or generic applications.",
  "Close copies without meaningful original work.",
  "Unfinished interfaces, copied templates, or unreliable core features.",
  "Misleading claims, hidden pricing, malware, impersonation, or rights violations.",
] as const;

export const submissionTools = [
  {
    id: "claude",
    name: "Claude Code",
    hint: "Paste into Claude Code in your terminal. It can prepare the file and use GitHub CLI if available.",
  },
  {
    id: "cursor",
    name: "Cursor",
    hint: "Open Agent in Cursor and paste these instructions. Give it access to your fork of the repository.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    hint: "Paste into a chat with web access. It can prepare your listing; opening a pull request needs connected GitHub tools.",
  },
  {
    id: "other",
    name: "Other agent",
    hint: "Paste into an agent with web access. It can prepare a listing and submit it if GitHub tools are available.",
  },
] as const;

export type SubmissionTool = (typeof submissionTools)[number]["id"];
export type SubmissionVariation =
  "editorial" | "bento" | "agent" | "mint" | "letter";

export function createSubmissionPrompt(tool: SubmissionTool, website?: string) {
  const toolContext = {
    claude:
      "Use Claude Code to prepare the contribution in a local checkout of my fork.",
    cursor:
      "Use Cursor Agent to prepare the contribution in my fork's workspace. Read the repository instructions before editing.",
    chatgpt:
      "Prepare the contribution in this ChatGPT conversation using web access and any available GitHub tools.",
    other:
      "Prepare the contribution using the web and repository tools available to you.",
  }[tool];
  const context =
    tool === "claude" || tool === "cursor"
      ? "Work in a fork of Beingpax/macify. Use GitHub CLI if it is installed and authenticated; otherwise prepare the file and explain the remaining GitHub steps."
      : "Use web access to read the sources below. If authenticated GitHub tools are available, work in my fork. Otherwise return the complete application JSON and instructions for opening the pull request manually. Do not claim to have submitted anything unless you have a real pull request URL.";

  return `Help me submit ${website ? `the Mac app at ${website}` : "a Mac app"} to Macify.

${toolContext}
${context}

Ask me these questions first and wait for my answers before you read sources, write files, or prepare anything:
${website ? "" : "- The app's official website.\n"}- Am I submitting the app listing only, or the listing plus a current deal (a Black Friday or other announced discount)?
- If I want a deal: the discount, the promo code (or none), the official offer URL, and the start date and any end date with their timezone, or no scheduled expiry (endsAt: null). Also any eligibility limits, such as new customers only, specific plans, or specific regions.

If I want the listing only, skip every deal instruction below and add no deal file. If I do want a deal, verify my answers against an official source and tell me about anything that does not match.

Read these first:
- Contribution guide: ${submissionRawRepository}/CONTRIBUTING.md
- App template: ${submissionRawRepository}/catalog/examples/application.example.json
- App schema: ${submissionRawRepository}/catalog/schema/application.schema.json
- Catalogue overview: ${submissionRawRepository}/catalog/README.md
- Optional deal template: ${submissionRawRepository}/catalog/examples/deal.example.json
- Deal schema: ${submissionRawRepository}/catalog/schema/deal.schema.json
- Existing apps (including category slugs in each manifest): ${submissionRepository}/tree/main/catalog/apps
- Published categories: https://macify.app/categories
- Validation rules: ${submissionRawRepository}/scripts/validate-catalogue.mjs
- Pull request checklist: ${submissionRawRepository}/.github/pull_request_template.md

If repository sources return 403 or 404, ask me for access or the missing files before preparing a listing. Do not invent a template or bypass access controls.

1. Check that the app is not already listed and has been publicly available for at least 30 days. Verify its Mac support, maintenance, pricing, privacy, support, and downloads using current official sources. Ask me about anything you cannot verify; do not invent facts or infer a release date.
2. Copy the complete application template to catalog/apps/<app-slug>.json. The lowercase, hyphenated slug must match the filename. Preserve "$schema": "../schema/application.schema.json" and "schemaVersion": 1. Include every required field, use null only where allowed, and do not add unknown fields. Write a factual Markdown description covering the app's purpose, features, audience, tradeoffs, privacy, requirements, and pricing. Prefer relevant category slugs already used in catalog/apps; categories are slug arrays, not a separate catalogue file or a fixed enum. If no existing category fits, ask me before proposing a new slug.
3. Verify the official HTTPS website URL even if my input was a bare domain or HTTP URL. Check duplicates by slug, app name, and website. Use public, direct HTTPS image URLs for authentic artwork, with distinct URLs for the required icon and preview. media.screenshots is required but may be empty; otherwise supply up to eight screenshots with unique URLs. Each media item needs altText (3–300 characters). Images must be downloadable in a supported image format and no larger than 10 MB. Do not commit image files. Omit isFeatured and isEditorsPick, or set both to false.
4. Use pricingType free, freemium, or paid. Free apps require billingType null; paid and freemium apps require one_time or subscription. Use sourceType open_source or closed_source. Set youtubeUrl to null if there is no verified video. Omit relatedAppSlugs or use an empty array unless there are relevant existing app slugs; do not include duplicates or the app itself.
5. With a local checkout and a supported Node.js version (CI uses Node 22), run node scripts/validate-catalogue.mjs (equivalent to npm run catalogue:validate). This validator has no package dependencies and checks the entire catalogue and contributor examples. Fix issues introduced by the new files, and report unrelated failures without changing other files. Report the actual command result or logs; never claim validation ran if you only have web/GitHub tools. Passing the JSON schema alone is insufficient because the validator adds cross-field, filename, duplicate, relationship, and media checks.
6. Show me the completed listing, any accompanying deal, and official source links. After I approve, open a pull request against Beingpax/macify main containing only the newly added app JSON file, plus its matching deal JSON if I asked for a deal in your first question. For that deal, follow the deal template and keep the discount, code (or null), official URL, a timezone-qualified start date and end date (or endsAt: null for no scheduled expiry), and eligibility exactly as the official source states them. Use the same slug for both files and do not replace an existing deal; request a listing correction instead. Use the repository pull request checklist, explain why the app belongs, include official sources and the validation result, and return the real pull request URL. Do not change any other repository files. If GitHub tools are unavailable, give me the complete JSON and manual submission steps.

A merged pull request is synchronized into a pending editorial revision. It is not automatically published; the owner must review and publish the listing, then any accompanying deal.

Expect an initial review in 12–48 hours. The site owner makes the final editorial decision; submission does not guarantee publication.`;
}

export const submissionInstructions = `# Submit a Mac app to Macify

Macify accepts app proposals through GitHub pull requests. There is no submission API or MCP connection required.

Repository: ${submissionRepository}
Contribution guide: ${submissionRawRepository}/CONTRIBUTING.md
Template: ${submissionRawRepository}/catalog/examples/application.example.json
Schema: ${submissionRawRepository}/catalog/schema/application.schema.json

## Eligibility

${submissionRequirements.map((item) => `- ${item.title}: ${item.description}`).join("\n")}

We look for a clear purpose, original work, reliable behavior, thoughtful interaction design, and a coherent interface.

We do not accept:
${submissionExclusions.map((item) => `- ${item}`).join("\n")}

## Instructions for an agent

${createSubmissionPrompt("other")}

## Editorial review

Expect an initial review in 12–48 hours. Macify may request corrections or stronger evidence. The site owner may accept, edit, defer, or decline a submission. Publication is not guaranteed. Featured and Editor's Pick status are assigned by the site owner.
Editorial policy: https://macify.app/editorial-policy
`;
