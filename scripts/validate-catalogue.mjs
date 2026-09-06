import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appsDirectory = path.join(root, "catalog", "apps");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedPricing = new Set(["free", "freemium", "paid"]);
const allowedBilling = new Set(["one_time", "subscription"]);
const allowedSource = new Set(["open_source", "closed_source"]);

function isHttpUrl(value, httpsOnly = false) {
  if (typeof value !== "string" || value.length > 2_000) return false;
  try {
    const url = new URL(value);
    if (url.username || url.password) return false;
    if (httpsOnly ? url.protocol !== "https:" : !["http:", "https:"].includes(url.protocol)) return false;
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.includes(":")) return false;
    const octets = hostname.split(".").map(Number);
    if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
    const [a, b] = octets;
    return !(a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168));
  } catch {
    return false;
  }
}

function validateMedia(value, label, issues) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issues.push(`${label} must be an object.`);
    return;
  }
  for (const key of Object.keys(value)) if (!["sourceUrl", "altText"].includes(key)) issues.push(`${label}.${key} is not allowed.`);
  if (!isHttpUrl(value.sourceUrl, true)) issues.push(`${label}.sourceUrl must be a public HTTPS URL.`);
  if (typeof value.altText !== "string" || value.altText.trim().length < 3 || value.altText.length > 300) {
    issues.push(`${label}.altText must contain 3 to 300 characters.`);
  }
}

function validateManifest(manifest, expectedSlug) {
  const issues = [];
  const allowedKeys = new Set(["$schema", "schemaVersion", "name", "slug", "websiteUrl", "tagline", "description", "pricingType", "billingType", "pricingDetails", "sourceType", "youtubeUrl", "categories", "relatedAppSlugs", "media"]);
  for (const key of Object.keys(manifest)) if (!allowedKeys.has(key)) issues.push(`${key} is not an allowed manifest field.`);
  const text = (key, min, max) => {
    const value = manifest[key];
    if (typeof value !== "string" || value.trim().length < min || value.length > max) issues.push(`${key} must contain ${min} to ${max} characters.`);
  };
  if (manifest.schemaVersion !== 1) issues.push("schemaVersion must be 1.");
  text("name", 2, 80);
  text("slug", 2, 90);
  text("tagline", 10, 140);
  text("description", 40, 20_000);
  if (!slugPattern.test(manifest.slug ?? "")) issues.push("slug must use lowercase letters, numbers, and hyphens.");
  if (manifest.slug !== expectedSlug) issues.push(`slug must match the filename (${expectedSlug}).`);
  if (!isHttpUrl(manifest.websiteUrl, true)) issues.push("websiteUrl must be an HTTPS URL without credentials.");
  if (!allowedPricing.has(manifest.pricingType)) issues.push("pricingType must be free, freemium, or paid.");
  if (manifest.pricingType === "free" && manifest.billingType != null) issues.push("Free applications must use a null billingType.");
  if (manifest.pricingType !== "free" && !allowedBilling.has(manifest.billingType)) issues.push("Paid and freemium applications require a billingType.");
  if (manifest.pricingDetails != null && (typeof manifest.pricingDetails !== "string" || manifest.pricingDetails.length > 240)) issues.push("pricingDetails must be null or no more than 240 characters.");
  if (!allowedSource.has(manifest.sourceType)) issues.push("sourceType must be open_source or closed_source.");
  if (manifest.youtubeUrl != null && !isHttpUrl(manifest.youtubeUrl, true)) issues.push("youtubeUrl must be null or a public HTTPS URL.");
  for (const [key, limit, minimum] of [["categories", 12, 1], ["relatedAppSlugs", 12, 0]]) {
    const values = manifest[key];
    if (!Array.isArray(values) || values.length < minimum || values.length > limit || values.some((item) => typeof item !== "string" || !slugPattern.test(item))) {
      issues.push(`${key} must contain ${minimum} to ${limit} valid slugs.`);
    } else if (new Set(values).size !== values.length) {
      issues.push(`${key} cannot contain duplicates.`);
    }
  }
  if (manifest.relatedAppSlugs?.includes(manifest.slug)) issues.push("An application cannot relate to itself.");
  if (!manifest.media || typeof manifest.media !== "object") {
    issues.push("media is required.");
  } else {
    for (const key of Object.keys(manifest.media)) if (!["icon", "preview", "screenshots"].includes(key)) issues.push(`media.${key} is not allowed.`);
    validateMedia(manifest.media.icon, "media.icon", issues);
    validateMedia(manifest.media.preview, "media.preview", issues);
    if (!Array.isArray(manifest.media.screenshots) || manifest.media.screenshots.length > 8) {
      issues.push("media.screenshots must be an array containing no more than 8 items.");
    } else {
      manifest.media.screenshots.forEach((item, index) => validateMedia(item, `media.screenshots[${index}]`, issues));
      const mediaUrls = [manifest.media.icon?.sourceUrl, manifest.media.preview?.sourceUrl, ...manifest.media.screenshots.map(({ sourceUrl }) => sourceUrl)];
      if (new Set(mediaUrls).size !== mediaUrls.length) issues.push("Every media source URL must be unique within an application.");
    }
  }
  return issues;
}

const files = (await readdir(appsDirectory)).filter((file) => file.endsWith(".json")).sort();
if (files.length === 0) throw new Error("The catalogue contains no application manifests.");
const manifests = [];
let failed = false;
for (const file of files) {
  let manifest;
  try {
    manifest = JSON.parse(await readFile(path.join(appsDirectory, file), "utf8"));
  } catch (error) {
    console.error(`${file}: ${error instanceof Error ? error.message : "invalid JSON"}`);
    failed = true;
    continue;
  }
  const issues = validateManifest(manifest, file.slice(0, -5));
  for (const issue of issues) console.error(`${file}: ${issue}`);
  failed ||= issues.length > 0;
  manifests.push({ file, manifest });
}

const bySlug = new Map(manifests.map(({ manifest }) => [manifest.slug, manifest]));
const websites = new Map();
for (const { file, manifest } of manifests) {
  const normalizedWebsite = String(manifest.websiteUrl ?? "").replace(/\/$/, "").toLowerCase();
  if (websites.has(normalizedWebsite)) {
    console.error(`${file}: websiteUrl duplicates ${websites.get(normalizedWebsite)}.`);
    failed = true;
  } else {
    websites.set(normalizedWebsite, file);
  }
  for (const relatedSlug of manifest.relatedAppSlugs ?? []) {
    if (!bySlug.has(relatedSlug)) {
      console.error(`${file}: related application ${relatedSlug} does not exist.`);
      failed = true;
    } else if (!bySlug.get(relatedSlug).relatedAppSlugs?.includes(manifest.slug)) {
      console.error(`${file}: relationship with ${relatedSlug} must be declared in both application manifests.`);
      failed = true;
    }
  }
}

if (failed) process.exitCode = 1;
else console.log(`Validated ${manifests.length} application manifests.`);
