export type MediaRole = "icon" | "preview_image" | "screenshot";

export type PreparedMedia = {
  id: string;
  role: MediaRole;
  bytes: Uint8Array;
  digest: ArrayBuffer;
  checksum: string;
  storageKey: string;
  mimeType: string;
  fileName: string;
  byteSize: number;
  sourceUrl: string | null;
  altText: string | null;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const allowedTypes: Record<MediaRole, ReadonlySet<string>> = {
  icon: new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]),
  preview_image: new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]),
  screenshot: new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]),
};

function safeFileName(name: string) {
  const normalized = name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
  return normalized || "asset";
}

function bytesStartWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function matchesFileSignature(bytes: Uint8Array, mimeType: string) {
  switch (mimeType) {
    case "image/png": return bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/jpeg": return bytesStartWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/webp": return bytesStartWith(bytes, [0x52, 0x49, 0x46, 0x46]) && bytesStartWith(bytes, [0x57, 0x45, 0x42, 0x50], 8);
    case "image/avif": return bytesStartWith(bytes, [0x66, 0x74, 0x79, 0x70], 4) && ["avif", "avis"].includes(new TextDecoder().decode(bytes.slice(8, 12)));
    default: return false;
  }
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function blockedRemoteHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".local") || normalized.includes(":")) return true;
  const octets = normalized.split(".").map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return false;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function parseRemoteImageUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password || blockedRemoteHostname(url.hostname)) return null;
    return url;
  } catch { return null; }
}

export function isAllowedRemoteImageUrl(value: string) {
  return value === "" || parseRemoteImageUrl(value) !== null;
}

async function readResponseWithLimit(response: Response) {
  if (!response.body) throw new Error("The remote server returned an empty response.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_UPLOAD_BYTES) { await reader.cancel(); throw new Error("The remote image is larger than the 10 MB limit."); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

async function fetchRemoteImage(value: string, role: MediaRole) {
  let url = parseRemoteImageUrl(value);
  if (!url) return { ok: false, error: "Use a public HTTPS image URL." } as const;
  const sourceUrl = url.toString();
  try {
    for (let redirects = 0; redirects <= 3; redirects += 1) {
      const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(12_000), headers: { Accept: "image/avif,image/webp,image/png,image/jpeg" } });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location || redirects === 3) return { ok: false, error: "The image URL redirects too many times." } as const;
        url = parseRemoteImageUrl(new URL(location, url).toString());
        if (!url) return { ok: false, error: "The image URL redirects to a blocked location." } as const;
        continue;
      }
      if (!response.ok) return { ok: false, error: `The image server returned HTTP ${response.status}.` } as const;
      const mimeType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ?? "";
      if (!allowedTypes[role].has(mimeType)) return { ok: false, error: "The URL does not return a supported PNG, JPEG, WebP, or AVIF image." } as const;
      const declaredSize = Number(response.headers.get("content-length") ?? 0);
      if (declaredSize > MAX_UPLOAD_BYTES) return { ok: false, error: "The remote image is larger than the 10 MB limit." } as const;
      const bytes = await readResponseWithLimit(response);
      if (!matchesFileSignature(bytes, mimeType)) return { ok: false, error: "The downloaded content does not match its image type." } as const;
      return { ok: true, bytes, mimeType, fileName: decodeURIComponent(url.pathname.split("/").pop() || "remote-image"), sourceUrl } as const;
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The remote image could not be downloaded." } as const;
  }
  return { ok: false, error: "The remote image could not be downloaded." } as const;
}

export async function prepareMediaSource(appId: string, role: MediaRole, file: File | null, remoteUrl: string, altText: string) {
  if (file && remoteUrl) return { ok: false, error: "Choose a local file or enter an image URL, not both." } as const;
  let source: { bytes: Uint8Array; mimeType: string; fileName: string; sourceUrl: string | null };
  if (remoteUrl) {
    const remote = await fetchRemoteImage(remoteUrl, role);
    if (!remote.ok) return remote;
    source = { bytes: remote.bytes, mimeType: remote.mimeType, fileName: remote.fileName, sourceUrl: remote.sourceUrl };
  } else if (file) {
    if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: `${file.name} is larger than the 10 MB per-file limit.` } as const;
    if (!allowedTypes[role].has(file.type)) return { ok: false, error: `${file.name} is not a supported image type.` } as const;
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesFileSignature(bytes, file.type)) return { ok: false, error: `${file.name} does not match its declared image type.` } as const;
    source = { bytes, mimeType: file.type, fileName: file.name, sourceUrl: null };
  } else return { ok: false, error: "Choose a file or enter an image URL." } as const;

  const digestInput = source.bytes.buffer.slice(source.bytes.byteOffset, source.bytes.byteOffset + source.bytes.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", digestInput);
  const checksum = bytesToHex(new Uint8Array(digest));
  const id = crypto.randomUUID();
  return { ok: true, media: {
    id, role, bytes: source.bytes, digest, checksum,
    storageKey: ["apps", appId, role, `${checksum.slice(0, 16)}-${id}-${safeFileName(source.fileName)}`].join("/"),
    mimeType: source.mimeType, fileName: source.fileName, byteSize: source.bytes.byteLength,
    sourceUrl: source.sourceUrl, altText: altText.trim().slice(0, 300) || null,
  } satisfies PreparedMedia } as const;
}

export async function putPreparedMedia(bucket: R2Bucket, asset: PreparedMedia) {
  await bucket.put(asset.storageKey, asset.bytes, {
    httpMetadata: { contentType: asset.mimeType, contentDisposition: "inline", cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { appId: asset.storageKey.split("/")[1] ?? "", role: asset.role },
    sha256: asset.digest,
  });
}
