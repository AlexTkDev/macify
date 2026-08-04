import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { excludedAppSlugs } from "../data/media-overrides.mjs";
import { optimizeLocalImage } from "./lib/optimize-local-image.mjs";

if (!process.argv.includes("--local")) throw new Error("Pass --local to update local D1 and R2. This script never updates remote environments.");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");
const datasets = await Promise.all(
  ["initial-apps.json", "expanded-apps.json", "additional-apps.json"]
    .map(async (name) => JSON.parse(await readFile(path.join(root, "data", name), "utf8"))),
);
const desiredApps = datasets.flat().filter((app) => !excludedAppSlugs.has(app.slug));
const wranglerConfig = JSON.parse(await readFile(path.join(root, "wrangler.jsonc"), "utf8"));
const localMediaBucket = wranglerConfig.r2_buckets?.find((bucket) => bucket.binding === "MEDIA")?.bucket_name;
if (!localMediaBucket) throw new Error("The local MEDIA binding must define a bucket_name in wrangler.jsonc.");

const workDirectory = await mkdtemp(path.join(tmpdir(), "macify-media-sync-"));
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const extensions = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/avif": "avif" };

function runWrangler(args, { json = false } = {}) {
  const result = spawnSync(wrangler, args, { cwd: root, encoding: "utf8", env: process.env });
  if (result.status !== 0) throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
  return json ? JSON.parse(result.stdout) : result.stdout;
}

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function safeFileName(value) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "asset";
}

function detectedImageType(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (bytes.subarray(4, 8).toString() === "ftyp" && ["avif", "avis"].includes(bytes.subarray(8, 12).toString())) return "image/avif";
  return null;
}

async function download(app, role, sourceUrl) {
  const response = await fetch(sourceUrl, {
    headers: { Accept: "image/avif,image/webp,image/png,image/jpeg" },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${app.name} ${role} returned HTTP ${response.status}.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error(`${app.name} ${role} is larger than 10 MB.`);
  const mimeType = detectedImageType(bytes);
  if (!mimeType || !allowedTypes.has(mimeType)) throw new Error(`${app.name} ${role} is not a supported image.`);
  const optimized = await optimizeLocalImage(bytes, role);
  const storedBytes = optimized.bytes;
  const storedMimeType = optimized.mimeType || mimeType;
  const id = randomUUID();
  const checksum = createHash("sha256").update(storedBytes).digest("hex");
  const sourceName = decodeURIComponent(new URL(response.url).pathname.split("/").pop() || `${role}.${extensions[mimeType]}`);
  const storedName = optimized.optimized ? sourceName.replace(/\.[^.]+$/, "") + ".webp" : sourceName;
  const storageKey = ["apps", app.id, role, `${checksum.slice(0, 16)}-${id}-${safeFileName(storedName)}`].join("/");
  const localPath = path.join(workDirectory, `${id}.${extensions[storedMimeType]}`);
  await writeFile(localPath, storedBytes);
  return {
    id,
    appId: app.id,
    role,
    sourceUrl,
    mimeType: storedMimeType,
    bytes: storedBytes,
    checksum,
    storageKey,
    localPath,
    width: optimized.width,
    height: optimized.height,
  };
}

const query = runWrangler([
  "d1", "execute", "DB", "--local", "--json", "--command",
  "SELECT a.id, a.slug, a.name, m.id AS media_id, m.role, m.storage_key, m.source_url, m.created_at FROM apps a LEFT JOIN media_assets m ON m.app_id = a.id WHERE a.deleted_at IS NULL ORDER BY m.created_at DESC;",
], { json: true });
const rows = query[0]?.results || [];
const appRows = new Map();
const mediaByAppRole = new Map();
for (const row of rows) {
  appRows.set(row.slug, { id: row.id, slug: row.slug, name: row.name });
  if (!row.media_id) continue;
  const key = `${row.slug}:${row.role}`;
  if (!mediaByAppRole.has(key)) mediaByAppRole.set(key, []);
  mediaByAppRole.get(key).push(row);
}

const uploads = [];
const removals = [];
const statements = [];
try {
  for (const desired of desiredApps) {
    const existingApp = appRows.get(desired.slug);
    if (!existingApp) continue;
    const app = { ...desired, ...existingApp };
    for (const [role, sourceUrl] of [["icon", desired.iconUrl], ["preview_image", desired.previewImageUrl]]) {
      if (!sourceUrl) continue;
      const existing = mediaByAppRole.get(`${app.slug}:${role}`) || [];
      const matching = existing.find((asset) => asset.source_url === sourceUrl);
      if (matching) {
        for (const asset of existing.filter((item) => item.media_id !== matching.media_id)) {
          statements.push(`DELETE FROM media_assets WHERE id = ${sql(asset.media_id)};`);
          removals.push(asset.storage_key);
        }
        continue;
      }

      const asset = await download(app, role, sourceUrl);
      runWrangler([
        "r2", "object", "put", `${localMediaBucket}/${asset.storageKey}`, "--local", "--file", asset.localPath,
        "--content-type", asset.mimeType, "--cache-control", "public, max-age=31536000, immutable",
      ]);
      uploads.push(asset);
      statements.push(`DELETE FROM media_assets WHERE app_id = ${sql(app.id)} AND role = ${sql(role)};`);
      statements.push(`INSERT INTO media_assets (id, app_id, role, storage_key, mime_type, byte_size, width, height, checksum, source_url, alt_text, created_at) VALUES (${sql(asset.id)}, ${sql(app.id)}, ${sql(role)}, ${sql(asset.storageKey)}, ${sql(asset.mimeType)}, ${asset.bytes.byteLength}, ${asset.width ?? "NULL"}, ${asset.height ?? "NULL"}, ${sql(asset.checksum)}, ${sql(sourceUrl)}, ${sql(`${app.name} ${role === "icon" ? "application icon" : "application preview"}`)}, ${Date.now()});`);
      removals.push(...existing.map((item) => item.storage_key));
    }
  }

  const now = Date.now();
  for (const slug of excludedAppSlugs) {
    statements.push(`UPDATE apps SET status = 'archived', deleted_at = ${now}, updated_at = ${now} WHERE slug = ${sql(slug)} AND deleted_at IS NULL;`);
  }
  if (statements.length) {
    const sqlPath = path.join(workDirectory, "sync.sql");
    await writeFile(sqlPath, `${statements.join("\n")}\n`);
    runWrangler(["d1", "execute", "DB", "--local", "--file", sqlPath, "--yes"]);
  }
  for (const key of new Set(removals)) {
    runWrangler(["r2", "object", "delete", `${localMediaBucket}/${key}`, "--local"]);
  }
  console.log(`Updated ${uploads.length} local media assets and processed ${excludedAppSlugs.size} excluded app slugs.`);
} catch (error) {
  for (const asset of uploads.reverse()) {
    try { runWrangler(["r2", "object", "delete", `${localMediaBucket}/${asset.storageKey}`, "--local"]); } catch { /* Best-effort rollback. */ }
  }
  throw error;
} finally {
  await rm(workDirectory, { recursive: true, force: true });
}
