import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { appTagAssignments, tagTaxonomy } from "../data/tag-taxonomy.mjs";

if (!process.argv.includes("--local")) throw new Error("Pass --local to update local D1. This script never updates remote environments.");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");

function runWrangler(args, { json = false } = {}) {
  const result = spawnSync(wrangler, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, WRANGLER_LOG_PATH: path.join(tmpdir(), "macify-wrangler.log") },
  });
  if (result.status !== 0) throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
  return json ? JSON.parse(result.stdout) : result.stdout;
}

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const tagSlugs = new Set(tagTaxonomy.map(({ slug }) => slug));
if (tagSlugs.size !== tagTaxonomy.length) throw new Error("The curated taxonomy contains duplicate tag slugs.");

for (const [appSlug, assignedTags] of Object.entries(appTagAssignments)) {
  if (assignedTags.length > 3) throw new Error(`${appSlug} has more than three assigned tags.`);
  for (const tagSlug of assignedTags) {
    if (!tagSlugs.has(tagSlug)) throw new Error(`${appSlug} references unknown tag '${tagSlug}'.`);
  }
}

const query = runWrangler([
  "d1", "execute", "DB", "--local", "--json", "--command",
  "SELECT slug FROM apps WHERE deleted_at IS NULL ORDER BY slug;",
], { json: true });
const activeSlugs = new Set((query[0]?.results ?? []).map(({ slug }) => slug));
const mappedSlugs = new Set(Object.keys(appTagAssignments));
const missing = [...activeSlugs].filter((slug) => !mappedSlugs.has(slug));
const stale = [...mappedSlugs].filter((slug) => !activeSlugs.has(slug));
if (missing.length || stale.length) {
  throw new Error([
    missing.length ? `Active apps without assignments: ${missing.join(", ")}` : "",
    stale.length ? `Assignments without active apps: ${stale.join(", ")}` : "",
  ].filter(Boolean).join("\n"));
}

const now = Date.now();
const statements = ["DELETE FROM app_tags;", "DELETE FROM tags;"];
for (const tag of tagTaxonomy) {
  statements.push(`INSERT INTO tags (id, slug, name, created_at) VALUES (${sql(`tag-${tag.slug}`)}, ${sql(tag.slug)}, ${sql(tag.name)}, ${now});`);
}
for (const [appSlug, assignedTags] of Object.entries(appTagAssignments)) {
  for (const tagSlug of assignedTags) {
    statements.push(`INSERT INTO app_tags (app_id, tag_id) SELECT a.id, t.id FROM apps a CROSS JOIN tags t WHERE a.slug = ${sql(appSlug)} AND a.deleted_at IS NULL AND t.slug = ${sql(tagSlug)};`);
  }
}

const directory = await mkdtemp(path.join(tmpdir(), "macify-tags-"));
try {
  const sqlPath = path.join(directory, "tags.sql");
  await writeFile(sqlPath, `${statements.join("\n")}\n`);
  runWrangler(["d1", "execute", "DB", "--local", "--file", sqlPath, "--yes"]);
  console.log(`Synchronized ${tagTaxonomy.length} tags and ${Object.values(appTagAssignments).flat().length} local app assignments.`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
