import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { editorialDescriptions } from "../data/editorial-descriptions.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const datasets = ["data/initial-apps.json", "data/expanded-apps.json", "data/additional-apps.json"];
const applications = (await Promise.all(datasets.map(async (file) => JSON.parse(await readFile(path.join(root, file), "utf8"))))).flat();
const expectedSlugs = new Set(applications.map(({ slug }) => slug));
const issues = [];

function sentenceCount(paragraph) {
  return paragraph.split(/[.!?]+(?:\s|$)/).map((sentence) => sentence.trim()).filter(Boolean).length;
}

for (const [slug, description] of Object.entries(editorialDescriptions)) {
  if (!expectedSlugs.has(slug)) issues.push(`${slug}: no matching application record`);
  const parts = description.trim().split(/(?=^##\s+)/m);
  const lead = parts.shift() ?? "";
  const leadParagraphs = lead.split(/\n\s*\n/).filter(Boolean);
  if (leadParagraphs.length !== 3) issues.push(`${slug}: expected 3 untitled opening paragraphs, found ${leadParagraphs.length}`);
  for (const paragraph of leadParagraphs) if (sentenceCount(paragraph) > 3) issues.push(`${slug}: opening paragraph has more than 3 sentences`);
  if (!parts[0]?.startsWith("## Features\n")) issues.push(`${slug}: first heading must be ## Features`);
  if (!parts[1]?.startsWith("## Where it fits\n")) issues.push(`${slug}: second heading must be ## Where it fits`);
  const features = parts[0]?.replace(/^## Features\n+/, "").split("\n").filter((line) => line.startsWith("- ")) ?? [];
  if (features.length < 4 || features.length > 8) issues.push(`${slug}: expected 4–8 feature bullets, found ${features.length}`);
  const fit = parts[1]?.replace(/^## Where it fits\n+/, "") ?? "";
  for (const paragraph of fit.split(/\n\s*\n/).filter(Boolean)) if (sentenceCount(paragraph) > 3) issues.push(`${slug}: Where it fits paragraph has more than 3 sentences`);
  if (description.trim().split(/\s+/).length < 150) issues.push(`${slug}: description is under 150 words`);
}

for (const slug of expectedSlugs) if (!editorialDescriptions[slug]) issues.push(`${slug}: missing editorial description`);

console.log(`Editorial descriptions: ${Object.keys(editorialDescriptions).length}/${expectedSlugs.size}`);
if (issues.length) {
  console.log(issues.map((issue) => `- ${issue}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("All descriptions satisfy the editorial standard.");
}
