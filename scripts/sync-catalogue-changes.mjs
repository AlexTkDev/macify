#!/usr/bin/env node

import { createHmac } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";

const [baseSha, commitSha] = process.argv.slice(2);
const endpoint = process.env.CATALOG_SYNC_URL;
const secret = process.env.CATALOG_SYNC_SECRET;
const repository = process.env.GITHUB_REPOSITORY;
const staleSchemaRetryDelayMs = 15_000;
const staleSchemaRetryLimit = 40;
if (!baseSha || !commitSha || !endpoint || !secret || !repository) {
  throw new Error("Usage: sync-catalogue-changes.mjs <base-sha> <commit-sha> with CATALOG_SYNC_URL, CATALOG_SYNC_SECRET, and GITHUB_REPOSITORY set.");
}

const changes = execFileSync("git", ["diff", "--name-status", "--find-renames", baseSha, commitSha, "--", "catalog/apps", "catalog/deals"], { encoding: "utf8" })
  .trim().split("\n").filter(Boolean);
const deletedPaths = new Set();
for (const line of changes) {
  const [status, ...paths] = line.split("\t");
  if (status.startsWith("D") && paths[0]?.endsWith(".json")) deletedPaths.add(paths[0]);
  if (status.startsWith("R") && paths[0]?.endsWith(".json")) deletedPaths.add(paths[0]);
}

const manifestPaths = [];
for (const directory of ["catalog/apps", "catalog/deals"]) {
  const files = await readdir(directory, { withFileTypes: true });
  for (const file of files) {
    if (file.isFile() && file.name.endsWith(".json")) manifestPaths.push(`${directory}/${file.name}`);
  }
}
manifestPaths.sort();

const items = [
  ...[...deletedPaths].sort().map((path) => ({ changeType: "delete", path })),
  ...manifestPaths.map((path) => ({ changeType: "upsert", path })),
];

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isStaleSchemaResponse(status, body) {
  return status === 422
    && body.includes("Manifest validation failed")
    && body.includes("Unrecognized keys")
    && (body.includes("isFeatured") || body.includes("isEditorsPick"));
}

async function sendSyncItem(syncItem, commitSha) {
  const body = JSON.stringify({ repository, commitSha, items: [syncItem] });
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  for (let attempt = 1; attempt <= staleSchemaRetryLimit; attempt += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", "x-macify-signature": signature },
      body,
    });
    const responseBody = await response.text();
    if (response.ok) return JSON.parse(responseBody);
    if (!isStaleSchemaResponse(response.status, responseBody) || attempt === staleSchemaRetryLimit) {
      throw new Error(`HTTP ${response.status}: ${responseBody.slice(0, 2_000)}`);
    }

    console.log(`Production catalogue schema is not ready yet; retrying in ${staleSchemaRetryDelayMs / 1_000} seconds (${attempt}/${staleSchemaRetryLimit}).`);
    await sleep(staleSchemaRetryDelayMs);
  }

  throw new Error("Catalogue synchronization exhausted its schema compatibility retries.");
}

let failed = 0;
for (const item of items) {
  try {
    let syncItem = item;
    if (item.changeType === "upsert") {
      try {
        syncItem = { ...item, manifest: JSON.parse(await readFile(item.path, "utf8")) };
      } catch (error) {
        syncItem = {
          ...item,
          manifest: null,
          sourceError: `JSON parsing failed: ${error instanceof Error ? error.message : "Invalid JSON."}`,
        };
      }
    }
    const payload = await sendSyncItem(syncItem, commitSha);
    const result = payload.results?.[0]?.result;
    if (result?.ignored) console.log(`Checked ${item.path}: ${result.reason}`);
    else if (result?.duplicate) console.log(`Checked ${item.path}: revision already recorded.`);
    else console.log(`Queued ${item.path} for editorial review.`);
  } catch (error) {
    failed += 1;
    console.error(`${item.path}: ${error instanceof Error ? error.message : "Catalogue synchronization failed."}`);
  }
}

if (failed > 0) {
  console.error(`Catalogue synchronization completed with ${failed} failure(s) and ${items.length - failed} success(es).`);
  process.exitCode = 1;
} else {
  console.log(`Catalogue reconciliation checked ${items.length} manifest(s).`);
}
