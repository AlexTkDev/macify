import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { optimizeLocalImage } from "./lib/optimize-local-image.mjs";

if (!process.argv.includes("--local")) throw new Error("Pass --local to optimize local R2 media. This script never updates remote environments.");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");
const config = JSON.parse(await readFile(path.join(root, "wrangler.jsonc"), "utf8"));
const bucket = config.r2_buckets?.find((item) => item.binding === "MEDIA")?.bucket_name;
if (!bucket) throw new Error("The local MEDIA binding must define a bucket_name in wrangler.jsonc.");
const workDirectory = await mkdtemp(path.join(tmpdir(), "macify-optimize-media-"));

function runWrangler(args, { json = false } = {}) {
  const result = spawnSync(wrangler, args, { cwd: root, encoding: "utf8", env: process.env });
  if (result.status !== 0) throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
  return json ? JSON.parse(result.stdout) : result.stdout;
}

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const response = runWrangler([
  "d1", "execute", "DB", "--local", "--json", "--command",
  "SELECT id, role, storage_key, mime_type, byte_size FROM media_assets ORDER BY created_at, id;",
], { json: true });
const assets = response[0]?.results || [];
const changed = [];
const statements = [];
let checked = 0;
let bytesSaved = 0;
let skipped = 0;

try {
  for (const asset of assets) {
    const originalPath = path.join(workDirectory, `${asset.id}-original`);
    runWrangler(["r2", "object", "get", `${bucket}/${asset.storage_key}`, "--local", "--file", originalPath]);
    const originalBytes = await readFile(originalPath);
    const result = await optimizeLocalImage(originalBytes, asset.role);
    const storedBytes = result.bytes;
    const mimeType = result.mimeType || asset.mime_type;
    const checksum = createHash("sha256").update(storedBytes).digest("hex");
    if (result.optimized) {
      const optimizedPath = path.join(workDirectory, `${asset.id}-optimized.webp`);
      await writeFile(optimizedPath, storedBytes);
      runWrangler([
        "r2", "object", "put", `${bucket}/${asset.storage_key}`, "--local", "--file", optimizedPath,
        "--content-type", mimeType, "--cache-control", "public, max-age=31536000, immutable",
      ]);
      changed.push({ ...asset, originalPath });
      bytesSaved += originalBytes.byteLength - storedBytes.byteLength;
    }
    if (result.skipped) skipped += 1;
    statements.push(`UPDATE media_assets SET mime_type = ${sql(mimeType)}, byte_size = ${storedBytes.byteLength}, width = ${result.width ?? "NULL"}, height = ${result.height ?? "NULL"}, checksum = ${sql(checksum)} WHERE id = ${sql(asset.id)};`);
    checked += 1;
    if (checked % 20 === 0 || checked === assets.length) console.log(`Checked ${checked}/${assets.length} media assets.`);
  }

  if (statements.length) {
    const sqlPath = path.join(workDirectory, "updates.sql");
    await writeFile(sqlPath, `${statements.join("\n")}\n`);
    runWrangler(["d1", "execute", "DB", "--local", "--file", sqlPath, "--yes"]);
  }
  console.log(`Optimized ${changed.length}/${checked} assets, skipped ${skipped} unsupported assets, and saved ${bytesSaved} bytes locally.`);
} catch (error) {
  for (const asset of changed.reverse()) {
    try {
      runWrangler([
        "r2", "object", "put", `${bucket}/${asset.storage_key}`, "--local", "--file", asset.originalPath,
        "--content-type", asset.mime_type, "--cache-control", "public, max-age=31536000, immutable",
      ]);
    } catch { /* Best-effort restoration. */ }
  }
  throw error;
} finally {
  await rm(workDirectory, { recursive: true, force: true });
}
