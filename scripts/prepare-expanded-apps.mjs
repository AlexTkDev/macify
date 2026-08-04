import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { excludedAppSlugs, iconOverrides, previewImageOverrides } from "../data/media-overrides.mjs";
import { appTagAssignments, tagNamesForApp } from "../data/tag-taxonomy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceArgument = process.argv.find((argument) => argument.startsWith("--source="))?.slice("--source=".length);
const destinationArgument = process.argv.find((argument) => argument.startsWith("--destination="))?.slice("--destination=".length);
const sourcePath = path.resolve(root, sourceArgument || "data/expanded-apps-source.mjs");
const destination = path.resolve(root, destinationArgument || "data/expanded-apps.json");
const sourceModule = await import(pathToFileURL(sourcePath));
const unfilteredSourceApps = sourceModule.apps ?? sourceModule.expandedApps;
if (!Array.isArray(unfilteredSourceApps)) throw new Error(`No application array exported from ${path.relative(root, sourcePath)}.`);
const sourceApps = unfilteredSourceApps.filter((app) => !excludedAppSlugs.has(app.slug));
for (const app of sourceApps) {
  if (!Object.hasOwn(appTagAssignments, app.slug)) throw new Error(`Missing curated tag assignment for ${app.name} (${app.slug}).`);
}
const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const headers = { Accept: "text/html,application/xhtml+xml", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 MacifyCatalog/1.0" };

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return result;
}

function absolute(value, base) {
  if (!value || value.startsWith("data:")) return null;
  try { return new URL(value, base).href; } catch { return null; }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

async function usableImage(url) {
  try {
    const response = await fetch(url, { headers: { Accept: "image/avif,image/webp,image/png,image/jpeg", "User-Agent": headers["User-Agent"] }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
    const type = response.headers.get("content-type")?.split(";", 1)[0].toLowerCase();
    if (!response.ok || !acceptedTypes.has(type)) return null;
    const size = Number(response.headers.get("content-length") || 0);
    if (size > 10 * 1024 * 1024) return null;
    await response.body?.cancel();
    return response.url;
  } catch { return null; }
}

async function firstUsable(candidates) {
  for (const candidate of unique(candidates)) {
    const usable = await usableImage(candidate);
    if (usable) return usable;
  }
  return null;
}

async function discoverMedia(app) {
  let html = "";
  let finalUrl = app.websiteUrl;
  try {
    const response = await fetch(app.websiteUrl, { headers, redirect: "follow", signal: AbortSignal.timeout(20_000) });
    if (response.ok) {
      finalUrl = response.url;
      html = await response.text();
    }
  } catch { /* Fallbacks below keep catalog preparation deterministic. */ }

  const tags = [...html.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const meta = (key) => tags.filter((tag) => tag.property?.toLowerCase() === key || tag.name?.toLowerCase() === key).map((tag) => absolute(tag.content, finalUrl));
  const linkedIcons = tags
    .filter((tag) => tag.rel?.toLowerCase().split(/\s+/).some((value) => value === "icon" || value === "apple-touch-icon"))
    .sort((a, b) => (b.rel?.includes("apple-touch") ? 1 : 0) - (a.rel?.includes("apple-touch") ? 1 : 0))
    .map((tag) => absolute(tag.href, finalUrl));
  const domain = new URL(finalUrl).hostname;
  const iconUrl = await firstUsable([
    iconOverrides[app.slug],
    app.iconUrl,
    ...linkedIcons,
    absolute("/apple-touch-icon.png", finalUrl),
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`,
  ]);
  const previewImageUrl = await firstUsable([
    previewImageOverrides[app.slug],
    ...meta("og:image"),
    ...meta("twitter:image"),
    app.previewImageUrl,
    `https://image.thum.io/get/width/1200/crop/630/noanimate/${finalUrl}`,
    `https://s.wordpress.com/mshots/v1/${encodeURIComponent(finalUrl)}?w=1200&h=630`,
  ]);
  if (!iconUrl || !previewImageUrl) throw new Error(`Could not find valid media for ${app.name}.`);
  return { iconUrl, previewImageUrl };
}

function description(app) {
  if (app.description) return app.description;
  return [
    app.lead,
    "## What you can do",
    ...app.features.map((feature) => `- ${feature}`),
    "## Where it fits",
    app.fit,
  ].join("\n\n");
}

const prepared = [];
for (const [index, app] of sourceApps.entries()) {
  process.stdout.write(`[${index + 1}/${sourceApps.length}] ${app.name}... `);
  const media = await discoverMedia(app);
  prepared.push({
    ...app,
    tags: tagNamesForApp(app.slug).join(", "),
    relatedAppSlugs: String(app.relatedAppSlugs || "")
      .split(",")
      .map((slug) => slug.trim())
      .filter((slug) => slug && !excludedAppSlugs.has(slug))
      .join(","),
    description: description(app),
    youtubeUrl: "",
    iconUrl: media.iconUrl,
    iconAltText: `${app.name} application icon`,
    previewImageUrl: media.previewImageUrl,
    previewImageAltText: `${app.name} application preview`,
    screenshotUrls: "",
    status: "published",
  });
  console.log("ready");
}

await writeFile(destination, `${JSON.stringify(prepared)}\n`);
console.log(`Prepared ${prepared.length} applications in ${path.relative(root, destination)}.`);
