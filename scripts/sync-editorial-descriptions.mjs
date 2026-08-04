import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { editorialDescriptions } from "../data/editorial-descriptions.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");
const localOnly = process.argv.includes("--local");

if (!localOnly) throw new Error("Pass --local to update the local D1 database. This script never updates remote environments.");

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const statements = Object.entries(editorialDescriptions)
  .map(([slug, description]) => `UPDATE apps SET description = ${sql(description)}, updated_at = unixepoch() * 1000 WHERE slug = ${sql(slug)};`)
  .join("\n");

const directory = await mkdtemp(path.join(tmpdir(), "macify-editorial-"));
const file = path.join(directory, "descriptions.sql");

try {
  await writeFile(file, `${statements}\n`);
  const result = spawnSync(wrangler, ["d1", "execute", "DB", "--local", "--file", file, "--yes"], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
  console.log(`Updated ${Object.keys(editorialDescriptions).length} local editorial descriptions.`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
