import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { excludedAppSlugs } from "../data/media-overrides.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = path.join(root, "data", "editorial-descriptions.mjs");
let source = await readFile(filePath, "utf8");
let removed = 0;

function entryPattern(slug) {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("^  (?:" + escaped + "|'" + escaped + "'|\"" + escaped + "\"): `", "m");
}

for (const slug of excludedAppSlugs) {
  const match = entryPattern(slug).exec(source);
  if (!match || match.index === undefined) continue;
  const nextEntry = /\n\n  (?:[a-z0-9-]+|'[a-z0-9-]+'|"[a-z0-9-]+"): `/g;
  nextEntry.lastIndex = match.index + match[0].length;
  const next = nextEntry.exec(source);
  const objectEnd = source.indexOf("\n};", match.index);
  const end = next?.index ?? objectEnd;
  if (end < 0) throw new Error(`Could not find the end of editorial entry '${slug}'.`);
  source = `${source.slice(0, match.index)}${source.slice(end + (next ? 2 : 0))}`;
  removed += 1;
}

await writeFile(filePath, source);
console.log(`Pruned ${removed} excluded editorial descriptions.`);
