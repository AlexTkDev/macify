#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");
const syncScript = path.join(root, "scripts", "sync-local-catalogue.mjs");
const allowedArguments = new Set(["--fast", "--persist-to"]);

let fast = false;
let persistPath;
for (let index = 0; index < process.argv.slice(2).length; index += 1) {
  const argument = process.argv.slice(2)[index];
  if (!allowedArguments.has(argument)) throw new Error(`Unknown setup argument: ${argument}`);
  if (argument === "--fast") fast = true;
  if (argument === "--persist-to") {
    persistPath = process.argv.slice(2)[index + 1];
    if (!persistPath || persistPath.startsWith("--")) throw new Error("--persist-to requires a directory.");
    index += 1;
  }
}

const persistenceArguments = persistPath ? ["--persist-to", path.resolve(persistPath)] : [];
execFileSync(wrangler, ["d1", "migrations", "apply", "DB", "--local", ...persistenceArguments], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, CI: "true", NO_D1_WARNING: "true" },
});

execFileSync(process.execPath, [
  syncScript,
  ...(fast ? ["--fast"] : []),
  ...persistenceArguments,
], {
  cwd: root,
  stdio: "inherit",
});
