#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const aliases = JSON.parse(readFileSync(new URL("./lib/migration-filename-aliases.json", import.meta.url), "utf8"));
const args = process.argv.slice(2);
const target = args.shift();
if (!["--local", "--production"].includes(target)) {
  throw new Error("Choose --local or --production explicitly.");
}
let persistPath;
if (args.length) {
  if (target !== "--local" || args.length !== 2 || args[0] !== "--persist-to" || !args[1] || args[1].startsWith("--")) {
    throw new Error("Only --local accepts --persist-to <directory>.");
  }
  persistPath = path.resolve(args[1]);
}
const scope = target === "--production"
  ? ["--remote", "--env", "production"]
  : ["--local", ...(persistPath ? ["--persist-to", persistPath] : [])];
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");
function run(command, capture = false) {
  return execFileSync(wrangler, command, {
    cwd: root,
    env: { ...process.env, CI: "true", NO_D1_WARNING: "true" },
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
    encoding: "utf8",
  });
}
function query(sql) {
  const results = JSON.parse(run(["d1", "execute", "DB", ...scope, "--command", sql, "--json"], true));
  if (!Array.isArray(results) || results.some((result) => !result.success || !Array.isArray(result.results))) {
    throw new Error("Could not verify migration history; no migrations were applied.");
  }
  return results.flatMap((result) => result.results);
}

// D1 tracks full filenames. Rename history before Wrangler discovers pending SQL.
const hasHistory = query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'd1_migrations'").length > 0;
if (hasHistory) {
  const history = query("SELECT * FROM d1_migrations ORDER BY id");
  const applied = new Set(history.map((row) => row.name));
  const pendingRenames = Object.entries(aliases).filter(([oldName]) => applied.has(oldName));
  for (const [, newName] of pendingRenames) {
    if (applied.has(newName)) throw new Error(`Conflicting migration history for ${newName}; inspect before continuing.`);
  }
  if (pendingRenames.length) {
    const backupRoot = path.join(root, ".wrangler", "migration-backups");
    mkdirSync(backupRoot, { recursive: true, mode: 0o700 });
    const backup = mkdtempSync(path.join(backupRoot, `${target.slice(2)}-`));
    writeFileSync(path.join(backup, "migration-history.json"), JSON.stringify(history, null, 2), { mode: 0o600 });
    if (target === "--production") {
      const output = path.join(backup, "database.sql");
      run(["d1", "export", "DB", ...scope, "--output", output]);
      chmodSync(output, 0o600);
    } else {
      // Preserve SQLite files and WAL together; no Wrangler process is running here.
      const persistence = path.join(persistPath ?? path.join(root, ".wrangler", "state"), "v3");
      cpSync(path.join(persistence, "d1"), path.join(backup, "d1"), { recursive: true, errorOnExist: true });
    }
    console.log(`Database backup saved to ${backup}`);
    const quote = (value) => `'${value.replaceAll("'", "''")}'`;
    const cases = pendingRenames.map(([oldName, newName]) => `WHEN ${quote(oldName)} THEN ${quote(newName)}`).join(" ");
    query(`UPDATE d1_migrations SET name = CASE name ${cases} ELSE name END WHERE name IN (${pendingRenames.map(([oldName]) => quote(oldName)).join(", ")})`);
    const updated = new Set(query("SELECT name FROM d1_migrations").map((row) => row.name));
    if (pendingRenames.some(([oldName, newName]) => updated.has(oldName) || !updated.has(newName))) {
      throw new Error("Migration filename reconciliation failed; no pending migrations were applied.");
    }
    console.log(`Updated ${pendingRenames.length} migration filenames in database history.`);
  }
}
run(["d1", "migrations", "apply", "DB", ...scope]);
