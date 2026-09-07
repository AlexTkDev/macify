#!/usr/bin/env node

import { createHmac } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const [baseSha, commitSha] = process.argv.slice(2);
const endpoint = process.env.CATALOG_SYNC_URL;
const secret = process.env.CATALOG_SYNC_SECRET;
const repository = process.env.GITHUB_REPOSITORY;
if (!baseSha || !commitSha || !endpoint || !secret || !repository) {
  throw new Error("Usage: sync-catalogue-changes.mjs <base-sha> <commit-sha> with CATALOG_SYNC_URL, CATALOG_SYNC_SECRET, and GITHUB_REPOSITORY set.");
}

const changes = execFileSync("git", ["diff", "--name-status", "--find-renames", baseSha, commitSha, "--", "catalog/apps", "catalog/deals"], { encoding: "utf8" })
  .trim().split("\n").filter(Boolean);
const items = [];
for (const line of changes) {
  const [status, ...paths] = line.split("\t");
  const path = paths.at(-1);
  if (!path?.endsWith(".json")) continue;
  if (status.startsWith("D")) items.push({ changeType: "delete", path });
  if (!status.startsWith("D")) {
    items.push({ changeType: "upsert", path, manifest: JSON.parse(await readFile(path, "utf8")) });
  }
}

if (items.length === 0) {
  console.log("No catalogue manifest changes to synchronize.");
  process.exit(0);
}

for (const item of items) {
  const body = JSON.stringify({ repository, commitSha, items: [item] });
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", "x-macify-signature": signature },
    body,
  });
  if (!response.ok) {
    const details = (await response.text()).slice(0, 2_000);
    throw new Error(`Catalogue synchronization failed (${response.status}): ${details}`);
  }
}
console.log(`Synchronized ${items.length} catalogue change(s) as pending editorial revisions.`);
