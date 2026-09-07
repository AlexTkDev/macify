import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../../", import.meta.url));
const aliases = JSON.parse(readFileSync(new URL("../lib/migration-filename-aliases.json", import.meta.url), "utf8"));
const files = readdirSync(path.join(root, "migrations")).filter((name) => name.endsWith(".sql")).sort();
const env = { ...process.env, CI: "true", NO_D1_WARNING: "true" };

test("fresh databases and legacy filenames converge without replaying applied SQL", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "macify-migration-test-"));
  const run = (command, args) => execFileSync(command, args, { cwd: root, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const wrangler = (storage, args) => run(path.join(root, "node_modules/.bin/wrangler"), ["d1", "execute", "DB", "--local", "--persist-to", storage, ...args, "--json"]);
  const query = (storage, sql) => JSON.parse(wrangler(storage, ["--command", sql])).flatMap((result) => result.results);
  const apply = (storage) => run(process.execPath, ["scripts/apply-database-migrations.mjs", "--local", "--persist-to", storage]);
  try {
    const fresh = path.join(directory, "fresh");
    apply(fresh);
    assert.deepEqual(query(fresh, "SELECT name FROM d1_migrations ORDER BY name").map((row) => row.name), files);

    const legacy = path.join(directory, "legacy");
    const originalName = Object.fromEntries(Object.entries(aliases).map(([oldName, newName]) => [newName, oldName]));
    const seed = path.join(directory, "seed.sql");
    writeFileSync(seed, files.map((name) => readFileSync(path.join(root, "migrations", name), "utf8")).join("\n") + `
CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);
${files.map((name) => `INSERT INTO d1_migrations(name) VALUES ('${originalName[name] ?? name}');`).join("\n")}
INSERT INTO d1_migrations(name) VALUES ('0001_seed_categories.sql');
INSERT INTO apps(id,slug,name,website_url,tagline,description,pricing_type,source_type)
VALUES ('sentinel','sentinel','Preserved','https://example.com','Demo','Demo','free','closed_source');
`);
    wrangler(legacy, ["--file", seed, "--yes"]);
    const output = apply(legacy);
    assert.match(output, /Database backup saved to/);
    const expectedHistory = [...files, "0001_seed_categories.sql"].sort();
    assert.deepEqual(query(legacy, "SELECT name FROM d1_migrations ORDER BY name").map((row) => row.name), expectedHistory);
    assert.deepEqual(query(legacy, "SELECT name FROM apps WHERE id = 'sentinel'"), [{ name: "Preserved" }]);
    assert.doesNotMatch(apply(legacy), /Updated \d+ migration filenames/);
    // A database reconciled by the earlier checkout may have the descriptive seed name.
    query(legacy, "UPDATE d1_migrations SET name = '0001_seed_original_categories.sql' WHERE name = '0001_seed_categories.sql'");
    assert.doesNotMatch(apply(legacy), /Updated \d+ migration filenames/);
    assert.deepEqual(query(legacy, "SELECT name FROM apps WHERE id = 'sentinel'"), [{ name: "Preserved" }]);

    // Conflicting history must stop before applying or changing anything.
    const [oldName] = Object.keys(aliases);
    query(legacy, `INSERT INTO d1_migrations(name) VALUES ('${oldName}')`);
    assert.throws(() => apply(legacy), /Conflicting migration history/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
