import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "data", "initial-apps.json");
const destinationPath = path.join(root, "data", "initial-apps.csv");
const headers = [
  "name",
  "slug",
  "websiteUrl",
  "tagline",
  "description",
  "pricingType",
  "billingType",
  "pricingDetails",
  "sourceType",
  "youtubeUrl",
  "categories",
  "iconUrl",
  "iconAltText",
  "previewImageUrl",
  "previewImageAltText",
  "screenshotUrls",
  "relatedAppSlugs",
  "status",
];

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

const records = JSON.parse(await readFile(sourcePath, "utf8"));
const rows = records.map((record) => headers.map((header) => csvCell(header === "status" ? "draft" : record[header])).join(","));
await writeFile(destinationPath, `${headers.map(csvCell).join(",")}\n${rows.join("\n")}\n`);
console.log(`Generated ${path.relative(root, destinationPath)} with ${records.length} records.`);
