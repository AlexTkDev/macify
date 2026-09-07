#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogueDirectory = path.join(root, "catalog", "apps");
const dealsDirectory = path.join(root, "catalog", "deals");
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");
const backupDirectory = path.join(root, ".wrangler", "backups");
const backupPath = path.join(backupDirectory, "catalogue-local-before-sync.sql");
const now = Date.now();

function runWrangler(arguments_, options = {}) {
  return execFileSync(wrangler, arguments_, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, NO_D1_WARNING: "true" },
    ...options,
  });
}

function query(sql) {
  const payload = JSON.parse(runWrangler(["d1", "execute", "DB", "--local", "--command", sql, "--json"]));
  const result = payload[0];
  if (!result?.success || !Array.isArray(result.results)) throw new Error("Local D1 query failed.");
  return result.results;
}

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function stableId(prefix, value) {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function categoryName(slug, existingNames) {
  const existing = existingNames.get(slug);
  if (existing) return existing;
  if (slug === "ai") return "AI";
  return slug.split("-").map((word, index) => index === 0
    ? `${word.charAt(0).toUpperCase()}${word.slice(1)}`
    : word).join(" ");
}

execFileSync(process.execPath, [path.join(root, "scripts", "validate-catalogue.mjs")], {
  cwd: root,
  stdio: "inherit",
});

const manifests = readdirSync(catalogueDirectory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(readFileSync(path.join(catalogueDirectory, file), "utf8")));
const dealManifests = readdirSync(dealsDirectory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(readFileSync(path.join(dealsDirectory, file), "utf8")));

const existingApps = query("SELECT id, slug FROM apps");
const appIds = new Map(existingApps.map(({ id, slug }) => [slug, id]));
for (const manifest of manifests) {
  if (!appIds.has(manifest.slug)) appIds.set(manifest.slug, stableId("local-app", manifest.slug));
}

const existingCategories = query("SELECT slug, name FROM categories");
const categoryNames = new Map(existingCategories.map(({ slug, name }) => [slug, name]));
const statements = ["PRAGMA foreign_keys = ON;"];

for (const manifest of manifests) {
  const appId = appIds.get(manifest.slug);
  statements.push(`INSERT INTO apps (
    id, slug, name, website_url, tagline, description, pricing_type, billing_type,
    pricing_details, source_type, youtube_url, status, is_featured, published_at,
    created_at, updated_at, deleted_at
  ) VALUES (
    ${sql(appId)}, ${sql(manifest.slug)}, ${sql(manifest.name)}, ${sql(manifest.websiteUrl)},
    ${sql(manifest.tagline)}, ${sql(manifest.description)}, ${sql(manifest.pricingType)},
    ${sql(manifest.billingType)}, ${sql(manifest.pricingDetails)}, ${sql(manifest.sourceType)},
    ${sql(manifest.youtubeUrl)}, 'published', 0, ${now}, ${now}, ${now}, NULL
  ) ON CONFLICT(slug) DO UPDATE SET
    name = excluded.name,
    website_url = excluded.website_url,
    tagline = excluded.tagline,
    description = excluded.description,
    pricing_type = excluded.pricing_type,
    billing_type = excluded.billing_type,
    pricing_details = excluded.pricing_details,
    source_type = excluded.source_type,
    youtube_url = excluded.youtube_url,
    status = 'published',
    deleted_at = NULL,
    published_at = coalesce(apps.published_at, excluded.published_at),
    updated_at = excluded.updated_at;`);
}

const dealAppIds = dealManifests.map(({ appSlug }) => appIds.get(appSlug));
statements.push(dealAppIds.length > 0
  ? `DELETE FROM deals WHERE app_id NOT IN (${dealAppIds.map(sql).join(", ")});`
  : "DELETE FROM deals;");
for (const deal of dealManifests) {
  const appId = appIds.get(deal.appSlug);
  statements.push(`INSERT INTO deals (
    id, app_id, discount_percent, code, url, starts_at, ends_at, created_at, updated_at
  ) VALUES (
    ${sql(stableId("local-deal", deal.appSlug))}, ${sql(appId)}, ${sql(deal.discountPercent)},
    ${sql(deal.code)}, ${sql(deal.url)}, ${Date.parse(deal.startsAt)}, ${Date.parse(deal.endsAt)}, ${now}, ${now}
  ) ON CONFLICT(app_id) DO UPDATE SET
    discount_percent = excluded.discount_percent,
    code = excluded.code,
    url = excluded.url,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    updated_at = excluded.updated_at;`);
}

const manifestSlugs = manifests.map(({ slug }) => slug);
statements.push(`UPDATE apps SET status = 'archived', updated_at = ${now}
  WHERE status = 'published' AND deleted_at IS NULL AND slug NOT IN (${manifestSlugs.map(sql).join(", ")});`);

const allCategories = [...new Set(manifests.flatMap(({ categories }) => categories))].sort();
for (const slug of allCategories) {
  statements.push(`INSERT INTO categories (id, slug, name, created_at)
    VALUES (${sql(`category-${slug}`)}, ${sql(slug)}, ${sql(categoryName(slug, categoryNames))}, ${now})
    ON CONFLICT(slug) DO UPDATE SET name = excluded.name;`);
}

const manifestAppIds = manifests.map(({ slug }) => appIds.get(slug));
for (const appId of manifestAppIds) {
  statements.push(`DELETE FROM app_categories WHERE app_id = ${sql(appId)};`);
}
for (const manifest of manifests) {
  const appId = appIds.get(manifest.slug);
  for (const categorySlug of manifest.categories) {
    statements.push(`INSERT INTO app_categories (app_id, category_id)
      SELECT ${sql(appId)}, id FROM categories WHERE slug = ${sql(categorySlug)};`);
  }
}

const manifestIdList = manifestAppIds.map(sql).join(", ");
statements.push(`DELETE FROM app_relationships
  WHERE source_app_id IN (${manifestIdList}) OR target_app_id IN (${manifestIdList});`);

const relationshipPairs = new Set();
for (const manifest of manifests) {
  for (const relatedSlug of manifest.relatedAppSlugs) {
    const pair = [appIds.get(manifest.slug), appIds.get(relatedSlug)].sort();
    relationshipPairs.add(pair.join(":"));
  }
}
for (const pair of [...relationshipPairs].sort()) {
  const [sourceAppId, targetAppId] = pair.split(":");
  statements.push(`INSERT INTO app_relationships (id, source_app_id, target_app_id, created_at)
    VALUES (${sql(stableId("local-relation", pair))}, ${sql(sourceAppId)}, ${sql(targetAppId)}, ${now});`);
}

for (const manifest of manifests) {
  const appId = appIds.get(manifest.slug);
  const media = [
    { role: "icon", ...manifest.media.icon },
    { role: "preview_image", ...manifest.media.preview },
    ...manifest.media.screenshots.map((item) => ({ role: "screenshot", ...item })),
  ];
  for (const item of media) {
    statements.push(`UPDATE media_assets SET alt_text = ${sql(item.altText)}
      WHERE app_id = ${sql(appId)} AND role = ${sql(item.role)} AND source_url = ${sql(item.sourceUrl)};`);
  }
}

mkdirSync(backupDirectory, { recursive: true });
rmSync(backupPath, { force: true });
runWrangler(["d1", "export", "DB", "--local", "--output", backupPath, "--skip-confirmation"]);

const temporaryDirectory = mkdtempSync(path.join(tmpdir(), "macify-catalogue-"));
const sqlPath = path.join(temporaryDirectory, "sync.sql");
try {
  writeFileSync(sqlPath, `${statements.join("\n")}\n`);
  runWrangler(["d1", "execute", "DB", "--local", "--file", sqlPath, "--yes"]);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

const summary = query(`SELECT
  count(*) AS published,
  sum(instr(description, '## Privacy and requirements') > 0) AS with_privacy,
  sum(instr(description, '## Pricing') > 0) AS with_pricing
  FROM apps WHERE status = 'published' AND deleted_at IS NULL`)[0];
const dealSummary = query("SELECT count(*) AS count FROM deals")[0];

if (Number(summary.published) !== manifests.length
  || Number(summary.with_privacy) !== manifests.length
  || Number(summary.with_pricing) !== manifests.length
  || Number(dealSummary.count) !== dealManifests.length) {
  throw new Error(`Local catalogue verification failed: ${JSON.stringify(summary)}`);
}

console.log(`Synchronized ${manifests.length} application and ${dealManifests.length} deal manifest(s) into local D1.`);
console.log(`Backup: ${path.relative(root, backupPath)}`);
