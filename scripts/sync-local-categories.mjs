import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { appCategoryAssignments, categoryTaxonomy } from "../data/category-taxonomy.mjs";

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

const categorySlugs = new Set(categoryTaxonomy.map(({ slug }) => slug));
if (categorySlugs.size !== categoryTaxonomy.length) throw new Error("The curated taxonomy contains duplicate category slugs.");

for (const [appSlug, assignedCategories] of Object.entries(appCategoryAssignments)) {
  if (assignedCategories.length > 12) throw new Error(`${appSlug} has more than 12 assigned categories.`);
  for (const categorySlug of assignedCategories) {
    if (!categorySlugs.has(categorySlug)) throw new Error(`${appSlug} references unknown category '${categorySlug}'.`);
  }
}

const query = runWrangler([
  "d1", "execute", "DB", "--local", "--json", "--command",
  "SELECT slug FROM apps WHERE deleted_at IS NULL ORDER BY slug;",
], { json: true });
const activeSlugs = new Set((query[0]?.results ?? []).map(({ slug }) => slug));
const mappedSlugs = new Set(Object.keys(appCategoryAssignments));
const missing = [...activeSlugs].filter((slug) => !mappedSlugs.has(slug));
const stale = [...mappedSlugs].filter((slug) => !activeSlugs.has(slug));
if (missing.length || stale.length) {
  throw new Error([
    missing.length ? `Active apps without assignments: ${missing.join(", ")}` : "",
    stale.length ? `Assignments without active apps: ${stale.join(", ")}` : "",
  ].filter(Boolean).join("\n"));
}

const now = Date.now();
const statements = ["DELETE FROM app_categories;", "DELETE FROM categories;"];
for (const category of categoryTaxonomy) {
  statements.push(`INSERT INTO categories (id, slug, name, created_at) VALUES (${sql(`category-${category.slug}`)}, ${sql(category.slug)}, ${sql(category.name)}, ${now});`);
}
for (const [appSlug, assignedCategories] of Object.entries(appCategoryAssignments)) {
  for (const categorySlug of assignedCategories) {
    statements.push(`INSERT INTO app_categories (app_id, category_id) SELECT a.id, t.id FROM apps a CROSS JOIN categories t WHERE a.slug = ${sql(appSlug)} AND a.deleted_at IS NULL AND t.slug = ${sql(categorySlug)};`);
  }
}

const directory = await mkdtemp(path.join(tmpdir(), "macify-categories-"));
try {
  const sqlPath = path.join(directory, "categories.sql");
  await writeFile(sqlPath, `${statements.join("\n")}\n`);
  runWrangler(["d1", "execute", "DB", "--local", "--file", sqlPath, "--yes"]);
  console.log(`Synchronized ${categoryTaxonomy.length} categories and ${Object.values(appCategoryAssignments).flat().length} local app assignments.`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
