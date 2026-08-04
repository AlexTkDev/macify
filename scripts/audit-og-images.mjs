import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { excludedAppSlugs, iconOverrides, previewImageOverrides } from "../data/media-overrides.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const datasetPaths = ["data/initial-apps.json", "data/expanded-apps.json", "data/additional-apps.json"];
const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const headers = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 MacifyCatalog/1.0",
};

function detectedImageType(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (bytes.subarray(4, 8).toString() === "ftyp" && ["avif", "avis"].includes(bytes.subarray(8, 12).toString())) return "image/avif";
  return null;
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return result;
}

function decodeHtml(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&#38;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
}

function absolute(value, base) {
  if (!value || value.startsWith("data:")) return null;
  try { return new URL(decodeHtml(value), base).href; } catch { return null; }
}

async function usableImage(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, {
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg", "User-Agent": headers["User-Agent"] },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    const size = Number(response.headers.get("content-length") || 0);
    if (!response.ok || size > 10 * 1024 * 1024) {
      await response.body?.cancel();
      return null;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const type = detectedImageType(bytes);
    if (!type || !acceptedTypes.has(type) || bytes.byteLength > 10 * 1024 * 1024) return null;
    return response.url;
  } catch {
    return null;
  }
}

async function inspect(app) {
  let finalUrl = app.websiteUrl;
  let html = "";
  let pageStatus = "unavailable";
  try {
    const response = await fetch(app.websiteUrl, { headers, redirect: "follow", signal: AbortSignal.timeout(20_000) });
    pageStatus = `http_${response.status}`;
    if (response.ok) {
      finalUrl = response.url;
      html = await response.text();
      pageStatus = "available";
    }
  } catch { /* Preserve existing media when the official page cannot be inspected. */ }

  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const candidates = [];
  for (const tag of tags) {
    const key = (tag.property || tag.name || "").toLowerCase();
    if (key === "og:image" || key === "og:image:url" || key === "og:image:secure_url") {
      candidates.push({ kind: "official_og", url: absolute(tag.content, finalUrl) });
    }
  }
  for (const tag of tags) {
    const key = (tag.property || tag.name || "").toLowerCase();
    if (key === "twitter:image" || key === "twitter:image:src") {
      candidates.push({ kind: "official_twitter", url: absolute(tag.content, finalUrl) });
    }
  }

  let discovered = null;
  for (const candidate of candidates) {
    const url = await usableImage(candidate.url);
    if (url) {
      discovered = { ...candidate, url };
      break;
    }
  }

  const explicitPreview = await usableImage(previewImageOverrides[app.slug]);
  const selectedPreview = explicitPreview || discovered?.url || app.previewImageUrl;
  const previewSource = explicitPreview ? "explicit_override" : discovered?.kind || "existing_fallback";
  const explicitIcon = await usableImage(iconOverrides[app.slug]);

  return {
    app: {
      ...app,
      relatedAppSlugs: String(app.relatedAppSlugs || "")
        .split(",")
        .map((slug) => slug.trim())
        .filter((slug) => slug && !excludedAppSlugs.has(slug))
        .join(","),
      ...(explicitIcon ? { iconUrl: explicitIcon } : {}),
      previewImageUrl: selectedPreview,
    },
    audit: {
      slug: app.slug,
      websiteUrl: app.websiteUrl,
      inspectedUrl: finalUrl,
      pageStatus,
      previewSource,
      previewImageUrl: selectedPreview,
      iconOverride: explicitIcon || null,
    },
  };
}

const audit = [];
for (const relativePath of datasetPaths) {
  const filePath = path.join(root, relativePath);
  const original = await readFile(filePath, "utf8");
  const apps = JSON.parse(original).filter((app) => !excludedAppSlugs.has(app.slug));
  const results = [];
  for (let index = 0; index < apps.length; index += 6) {
    const batch = apps.slice(index, index + 6);
    process.stdout.write(`[${relativePath}] ${Math.min(index + batch.length, apps.length)}/${apps.length}\r`);
    results.push(...await Promise.all(batch.map(inspect)));
  }
  process.stdout.write("\n");
  const indent = original.startsWith("[\n") ? 2 : 0;
  await writeFile(filePath, `${JSON.stringify(results.map((result) => result.app), null, indent)}\n`);
  audit.push(...results.map((result) => result.audit));
}

await writeFile(path.join(root, "data/og-image-audit.json"), `${JSON.stringify(audit, null, 2)}\n`);
const counts = Object.groupBy(audit, (item) => item.previewSource);
console.log(`Audited ${audit.length} applications.`);
for (const [source, items] of Object.entries(counts)) console.log(`${source}: ${items.length}`);
