import { createHash } from "node:crypto";
import path from "node:path";

import sharp from "sharp";

import approvedRemoteImageHostnameValues from "../../config/approved-remote-image-hostnames.json" with { type: "json" };

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_APPLICATION_MEDIA_BYTES = 40 * 1024 * 1024;

const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const approvedRemoteImageHostnames = new Set(approvedRemoteImageHostnameValues);

function bytesStartWith(bytes, signature, offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

export function matchesFileSignature(bytes, mimeType) {
  switch (mimeType) {
    case "image/png":
      return bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/jpeg":
      return bytesStartWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/webp":
      return bytesStartWith(bytes, [0x52, 0x49, 0x46, 0x46])
        && bytesStartWith(bytes, [0x57, 0x45, 0x42, 0x50], 8);
    case "image/avif":
      return bytesStartWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)
        && ["avif", "avis"].includes(new TextDecoder().decode(bytes.slice(8, 12)));
    default:
      return false;
  }
}

export function safeFileName(name) {
  const normalized = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return normalized || "asset";
}

function blockedRemoteHostname(hostname) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    normalized === "localhost"
    || normalized.endsWith(".localhost")
    || normalized.endsWith(".local")
    || normalized.includes(":")
  ) return true;
  const octets = normalized.split(".").map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return false;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168);
}

export function parseRemoteImageUrl(value) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:"
      || !hostname
      || url.username
      || url.password
      || blockedRemoteHostname(hostname)
      || !approvedRemoteImageHostnames.has(hostname)
    ) return null;
    return url;
  } catch {
    return null;
  }
}

async function readResponseWithLimit(response) {
  if (!response.body) throw new Error("The remote server returned an empty response.");
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_UPLOAD_BYTES) {
      await reader.cancel();
      throw new Error("The remote image is larger than the 10 MB limit.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function fetchRemoteImage(value) {
  let url = parseRemoteImageUrl(value);
  if (!url) throw new Error("Use an approved public HTTPS image URL.");
  const sourceUrl = url.toString();

  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg" },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("The image URL redirects too many times.");
      url = parseRemoteImageUrl(new URL(location, url).toString());
      if (!url) throw new Error("The image URL redirects to a blocked location.");
      continue;
    }
    if (!response.ok) throw new Error(`The image server returned HTTP ${response.status}.`);
    const mimeType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ?? "";
    if (!allowedImageTypes.has(mimeType)) {
      throw new Error("The URL does not return a supported PNG, JPEG, WebP, or AVIF image.");
    }
    if (Number(response.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES) {
      throw new Error("The remote image is larger than the 10 MB limit.");
    }
    const bytes = await readResponseWithLimit(response);
    if (!matchesFileSignature(bytes, mimeType)) {
      throw new Error("The downloaded content does not match its image type.");
    }
    return {
      bytes,
      mimeType,
      fileName: decodeURIComponent(path.basename(url.pathname) || "remote-image"),
      sourceUrl,
    };
  }
  throw new Error("The remote image could not be downloaded.");
}

function webpFileName(fileName) {
  const base = fileName.replace(/\.[^.]+$/, "").replace(/-+$/, "") || "image";
  return `${base}.webp`;
}

export async function prepareLocalMedia(appId, role, sourceUrl, altText) {
  const source = await fetchRemoteImage(sourceUrl);
  const pipeline = sharp(source.bytes, { animated: false }).rotate();
  const metadata = await pipeline.metadata();
  const transformed = await pipeline.clone().webp({ quality: role === "icon" ? 92 : 88 }).toBuffer({ resolveWithObject: true });
  const useWebp = transformed.data.byteLength < source.bytes.byteLength;
  const bytes = new Uint8Array(useWebp ? transformed.data : source.bytes);
  const mimeType = useWebp ? "image/webp" : source.mimeType;
  const fileName = useWebp ? webpFileName(source.fileName) : source.fileName;
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const oriented = metadata.autoOrient ?? metadata;

  return {
    id: `local-media-${createHash("sha256").update(`${appId}:${role}:${sourceUrl}`).digest("hex").slice(0, 24)}`,
    role,
    bytes,
    checksum,
    storageKey: `apps/${appId}/${role}/${checksum.slice(0, 16)}-${safeFileName(fileName)}`,
    mimeType,
    byteSize: bytes.byteLength,
    width: useWebp ? transformed.info.width : (oriented.width ?? null),
    height: useWebp ? transformed.info.height : (oriented.height ?? null),
    sourceUrl,
    altText: altText.trim().slice(0, 300) || null,
  };
}
