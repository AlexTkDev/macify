#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseLocalOptions } from "./lib/local-options.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const initializeScript = path.join(root, "scripts", "initialize-database.mjs");
const syncScript = path.join(root, "scripts", "sync-local-catalogue.mjs");
const { fast, persistenceArguments } = parseLocalOptions(process.argv.slice(2), { allowFast: true });
execFileSync(process.execPath, [initializeScript, "--local", ...persistenceArguments], {
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
