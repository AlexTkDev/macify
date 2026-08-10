import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const staging = process.argv.includes("--confirm-staging-replacement");
const production = process.argv.includes("--confirm-production-replacement");
if (staging === production) throw new Error("Pass exactly one explicit staging or production replacement confirmation flag.");
const targetEnv = production ? "production" : "staging";
const targetLabel = production ? "Production" : "Staging";
const targetBucket = production ? "macify-production-media" : "macify-staging-media";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");
const workDirectory = await mkdtemp(path.join(tmpdir(), "macify-staging-replace-"));
const backupPath = path.join(tmpdir(), `macify-${targetEnv}-backup-${new Date().toISOString().replaceAll(":", "-")}.sql`);
const tables = ["apps", "tags", "app_tags", "media_assets", "app_relationships", "import_jobs", "import_rows", "redirects"];

function run(args, { json = false } = {}) {
  const result = spawnSync(wrangler, args, { cwd: root, encoding: "utf8", env: process.env });
  if (result.status !== 0) throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
  return json ? JSON.parse(result.stdout) : result.stdout;
}

function query(command, remote) {
  const args = ["d1", "execute", "DB", remote ? "--remote" : "--local"];
  if (remote) args.push("--env", targetEnv);
  args.push("--command", command, "--json");
  return run(args, { json: true })[0]?.results ?? [];
}

function quotedTable(insert) {
  return insert.match(/^INSERT INTO "([^"]+)"/)?.[1] ?? null;
}

try {
  console.log(`Backing up ${targetEnv} D1...`);
  run(["d1", "export", "DB", "--remote", "--env", targetEnv, "--output", backupPath, "--skip-confirmation"]);

  const localExport = path.join(workDirectory, "local-content.sql");
  run(["d1", "export", "DB", "--local", "--no-schema", ...tables.flatMap((table) => ["--table", table]), "--output", localExport, "--skip-confirmation"]);
  const exportedLines = (await readFile(localExport, "utf8")).split("\n").filter((line) => line.startsWith("INSERT INTO "));
  const insertsByTable = new Map(tables.map((table) => [table, []]));
  for (const line of exportedLines) {
    const table = quotedTable(line);
    if (table && insertsByTable.has(table)) insertsByTable.get(table).push(line);
  }

  const localMedia = query("SELECT storage_key, mime_type, checksum FROM media_assets ORDER BY storage_key;", false);
  const stagingMedia = query("SELECT storage_key FROM media_assets ORDER BY storage_key;", true);
  const localKeys = new Set(localMedia.map(({ storage_key }) => storage_key));
  const obsoleteKeys = stagingMedia.map(({ storage_key }) => storage_key).filter((key) => !localKeys.has(key));

  console.log(`Uploading ${localMedia.length} canonical media objects to ${targetEnv} R2...`);
  let uploaded = 0;
  for (const media of localMedia) {
    const localFile = path.join(workDirectory, `${uploaded}.asset`);
    run(["r2", "object", "get", `macify-local-media/${media.storage_key}`, "--local", "--file", localFile]);
    run([
      "r2", "object", "put", `${targetBucket}/${media.storage_key}`, "--remote", "--file", localFile,
      "--content-type", media.mime_type, "--cache-control", "public, max-age=31536000, immutable", "--force",
    ]);
    uploaded += 1;
    if (uploaded % 20 === 0 || uploaded === localMedia.length) console.log(`Uploaded ${uploaded}/${localMedia.length}.`);
  }

  const replacementPath = path.join(workDirectory, "replace-content.sql");
  const deleteOrder = ["import_rows", "import_jobs", "app_relationships", "app_tags", "media_assets", "redirects", "tags", "apps"];
  const replacement = [
    "PRAGMA defer_foreign_keys=TRUE;",
    ...deleteOrder.map((table) => `DELETE FROM "${table}";`),
    ...tables.flatMap((table) => insertsByTable.get(table)),
    "",
  ].join("\n");
  await writeFile(replacementPath, replacement);

  console.log(`Replacing ${targetEnv} D1 catalogue tables...`);
  run(["d1", "execute", "DB", "--remote", "--env", targetEnv, "--file", replacementPath, "--yes"]);

  const remoteCounts = query("SELECT (SELECT COUNT(*) FROM apps) AS apps, (SELECT COUNT(*) FROM media_assets) AS media, (SELECT COUNT(*) FROM tags) AS tags;", true)[0];
  const localCounts = query("SELECT (SELECT COUNT(*) FROM apps) AS apps, (SELECT COUNT(*) FROM media_assets) AS media, (SELECT COUNT(*) FROM tags) AS tags;", false)[0];
  if (JSON.stringify(remoteCounts) !== JSON.stringify(localCounts)) {
    throw new Error(`${targetLabel} count verification failed. Local ${JSON.stringify(localCounts)}, remote ${JSON.stringify(remoteCounts)}.`);
  }
  const remoteMedia = query("SELECT storage_key, checksum FROM media_assets ORDER BY storage_key;", true);
  const localFingerprints = localMedia.map(({ storage_key, checksum }) => ({ storage_key, checksum }));
  if (JSON.stringify(remoteMedia) !== JSON.stringify(localFingerprints)) throw new Error(`${targetLabel} media fingerprint verification failed.`);

  console.log(`Deleting ${obsoleteKeys.length} obsolete ${targetEnv} R2 objects...`);
  for (const key of obsoleteKeys) run(["r2", "object", "delete", `${targetBucket}/${key}`, "--remote", "--force"]);
  console.log(`${targetLabel} replacement complete. Backup: ${backupPath}`);
} finally {
  await rm(workDirectory, { recursive: true, force: true });
}
