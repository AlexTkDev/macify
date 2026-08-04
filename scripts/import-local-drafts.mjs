import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { editorialDescriptions } from "../data/editorial-descriptions.mjs";
import { optimizeLocalImage } from "./lib/optimize-local-image.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");
const datasetArgument = process.argv.find((argument) => argument.startsWith("--dataset="))?.slice("--dataset=".length);
const datasetPath = datasetArgument
  ? path.resolve(root, datasetArgument)
  : path.join(root, "data", "initial-apps.json");
const wranglerConfig = JSON.parse(await readFile(path.join(root, "wrangler.jsonc"), "utf8"));
const localMediaBucket = wranglerConfig.r2_buckets?.find((bucket) => bucket.binding === "MEDIA")?.bucket_name;
if (!localMediaBucket) throw new Error("The local MEDIA binding must define a lowercase bucket_name in wrangler.jsonc.");
const workDirectory = await mkdtemp(path.join(tmpdir(), "macify-drafts-"));
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const extensions = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/avif": "avif" };

function runWrangler(args, { json = false } = {}) {
  const result = spawnSync(wrangler, args, { cwd: root, encoding: "utf8", env: process.env });
  if (result.status !== 0) {
    throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n").trim() || `Wrangler exited with status ${result.status}.`);
  }
  return json ? JSON.parse(result.stdout) : result.stdout;
}

function sql(value) {
  if (value === null || value === undefined || value === "") return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function safeFileName(value) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "asset";
}

function hasValidSignature(bytes, mimeType) {
  if (mimeType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (mimeType === "image/avif") return bytes.subarray(4, 8).toString() === "ftyp" && ["avif", "avis"].includes(bytes.subarray(8, 12).toString());
  return false;
}

async function prepareAsset(app, role, sourceUrl, altText) {
  const response = await fetch(sourceUrl, {
    headers: { Accept: "image/avif,image/webp,image/png,image/jpeg" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`${app.name} ${role} returned HTTP ${response.status}.`);
  const mimeType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ?? "";
  if (!allowedTypes.has(mimeType)) throw new Error(`${app.name} ${role} returned unsupported type ${mimeType || "unknown"}.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error(`${app.name} ${role} is larger than 10 MB.`);
  if (!hasValidSignature(bytes, mimeType)) throw new Error(`${app.name} ${role} does not match its declared image type.`);
  const optimized = await optimizeLocalImage(bytes, role);
  const storedBytes = optimized.bytes;
  const storedMimeType = optimized.mimeType || mimeType;
  const checksum = createHash("sha256").update(storedBytes).digest("hex");
  const id = randomUUID();
  const sourceName = decodeURIComponent(new URL(response.url).pathname.split("/").pop() || `${role}.${extensions[mimeType]}`);
  const fileName = `${id}.${extensions[storedMimeType]}`;
  const localPath = path.join(workDirectory, fileName);
  const storedName = optimized.optimized ? sourceName.replace(/\.[^.]+$/, "") + ".webp" : sourceName;
  const storageKey = ["apps", app.id, role, `${checksum.slice(0, 16)}-${id}-${safeFileName(storedName)}`].join("/");
  await writeFile(localPath, storedBytes);
  return {
    id,
    appId: app.id,
    role,
    sourceUrl,
    altText,
    mimeType: storedMimeType,
    checksum,
    byteSize: storedBytes.byteLength,
    width: optimized.width,
    height: optimized.height,
    localPath,
    storageKey,
  };
}

function parseLists(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

const uploadedKeys = [];
try {
  const dataset = JSON.parse(await readFile(datasetPath, "utf8")).map((application) => ({
    ...application,
    description: editorialDescriptions[application.slug] ?? application.description,
  }));
  const lookupResponse = runWrangler([
    "d1", "execute", "DB", "--local", "--json", "--command",
    "SELECT 'app' AS kind, id, slug FROM apps WHERE deleted_at IS NULL UNION ALL SELECT 'category' AS kind, id, slug FROM categories;",
  ], { json: true });
  const lookupRows = lookupResponse[0]?.results ?? [];
  const existingApps = new Map(lookupRows.filter((row) => row.kind === "app").map((row) => [row.slug, row.id]));
  const categoryIds = new Map(lookupRows.filter((row) => row.kind === "category").map((row) => [row.slug, row.id]));
  const pending = dataset.filter((app) => !existingApps.has(app.slug));
  if (pending.length === 0) {
    console.log("All applications in this dataset already exist; nothing to import.");
    process.exit(0);
  }

  for (const app of pending) {
    if (!categoryIds.has(app.category)) throw new Error(`Unknown category '${app.category}' for ${app.name}.`);
    app.id = randomUUID();
  }
  const preparedApps = await Promise.allSettled(pending.map(async (app) => ({
    app,
    assets: await Promise.all([
      prepareAsset(app, "icon", app.iconUrl, app.iconAltText),
      prepareAsset(app, "preview_image", app.previewImageUrl, app.previewImageAltText),
    ]),
  })));
  const preparationErrors = preparedApps.filter((result) => result.status === "rejected").map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));
  if (preparationErrors.length) throw new Error(`Media validation failed:\n- ${preparationErrors.join("\n- ")}`);
  for (const result of preparedApps) {
    if (result.status !== "fulfilled") continue;
    result.value.app.assets = result.value.assets;
    existingApps.set(result.value.app.slug, result.value.app.id);
  }

  for (const app of pending) {
    for (const asset of app.assets) {
      runWrangler([
        "r2", "object", "put", `${localMediaBucket}/${asset.storageKey}`, "--local", "--file", asset.localPath,
        "--content-type", asset.mimeType, "--cache-control", "public, max-age=31536000, immutable",
      ]);
      uploadedKeys.push(asset.storageKey);
    }
  }

  const now = Date.now();
  const statements = [];
  for (const app of pending) {
    const status = app.status === "published" ? "published" : "draft";
    const publishedAt = status === "published" ? now : null;
    statements.push(`INSERT INTO apps (id, slug, name, website_url, tagline, description, pricing_type, billing_type, pricing_details, source_type, youtube_url, status, published_at, created_at, updated_at) VALUES (${sql(app.id)}, ${sql(app.slug)}, ${sql(app.name)}, ${sql(app.websiteUrl)}, ${sql(app.tagline)}, ${sql(app.description)}, ${sql(app.pricingType)}, ${sql(app.billingType)}, ${sql(app.pricingDetails)}, ${sql(app.sourceType)}, ${sql(app.youtubeUrl)}, ${sql(status)}, ${sql(publishedAt)}, ${now}, ${now});`);
    statements.push(`INSERT INTO app_categories (app_id, category_id, is_primary) VALUES (${sql(app.id)}, ${sql(categoryIds.get(app.category))}, 1);`);
    for (const name of parseLists(app.tags)) {
      const tagSlug = slugify(name);
      statements.push(`INSERT INTO tags (id, slug, name, created_at) VALUES (${sql(`tag-${tagSlug}`)}, ${sql(tagSlug)}, ${sql(name)}, ${now}) ON CONFLICT(slug) DO UPDATE SET name = excluded.name;`);
      statements.push(`INSERT OR IGNORE INTO app_tags (app_id, tag_id) SELECT ${sql(app.id)}, id FROM tags WHERE slug = ${sql(tagSlug)};`);
    }
    for (const asset of app.assets) {
      statements.push(`INSERT INTO media_assets (id, app_id, role, storage_key, mime_type, byte_size, width, height, checksum, source_url, alt_text, created_at) VALUES (${sql(asset.id)}, ${sql(app.id)}, ${sql(asset.role)}, ${sql(asset.storageKey)}, ${sql(asset.mimeType)}, ${asset.byteSize}, ${asset.width ?? "NULL"}, ${asset.height ?? "NULL"}, ${sql(asset.checksum)}, ${sql(asset.sourceUrl)}, ${sql(asset.altText)}, ${now});`);
    }
  }

  const relationships = new Set();
  for (const app of pending) {
    for (const targetSlug of parseLists(app.relatedAppSlugs)) {
      const targetId = existingApps.get(targetSlug);
      if (!targetId || targetId === app.id) continue;
      const [sourceId, targetAppId] = [app.id, targetId].sort();
      const key = `${sourceId}:${targetAppId}`;
      if (relationships.has(key)) continue;
      relationships.add(key);
      statements.push(`INSERT OR IGNORE INTO app_relationships (id, source_app_id, target_app_id, relationship_type, confidence, origin, reviewed_at, created_at) VALUES (${sql(randomUUID())}, ${sql(sourceId)}, ${sql(targetAppId)}, 'related', 1, 'initial-dataset', ${now}, ${now});`);
    }
  }

  const sqlPath = path.join(workDirectory, "initial-drafts.sql");
  await writeFile(sqlPath, `${statements.join("\n")}\n`);
  runWrangler(["d1", "execute", "DB", "--local", "--file", sqlPath, "--yes"]);
  console.log(`Imported ${pending.length} applications with ${uploadedKeys.length} media objects.`);
} catch (error) {
  for (const key of uploadedKeys.reverse()) {
    try { runWrangler(["r2", "object", "delete", `${localMediaBucket}/${key}`, "--local"]); } catch { /* Best-effort rollback. */ }
  }
  throw error;
} finally {
  await rm(workDirectory, { recursive: true, force: true });
}
