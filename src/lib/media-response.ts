import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { apps, mediaAssets } from "@/db/schema";

function parseRangeHeader(value: string | null): R2Range | undefined {
  if (!value?.startsWith("bytes=") || value.includes(",")) return undefined;
  const [startValue, endValue] = value.slice(6).split("-", 2);

  if (startValue === "") {
    const suffix = Number(endValue);
    return Number.isSafeInteger(suffix) && suffix > 0 ? { suffix } : undefined;
  }

  const offset = Number(startValue);
  if (!Number.isSafeInteger(offset) || offset < 0) return undefined;
  if (endValue === "") return { offset };

  const end = Number(endValue);
  if (!Number.isSafeInteger(end) || end < offset) return undefined;
  return { offset, length: end - offset + 1 };
}

export async function serveMedia(
  request: Request,
  segments: string[],
  visibility: "dashboard" | "published",
) {
  const key = segments.join("/");

  if (!key.startsWith("apps/") || key.length > 600) {
    return new Response("Not found", { status: 404 });
  }

  if (visibility === "published") {
    const database = await getDatabase();
    const publishedAsset = await database
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .innerJoin(apps, eq(apps.id, mediaAssets.appId))
      .where(
        and(
          eq(mediaAssets.storageKey, key),
          eq(apps.status, "published"),
          sql`${mediaAssets.role} <> 'audio'`,
        ),
      )
      .limit(1);

    if (!publishedAsset[0]) return new Response("Not found", { status: 404 });
  }

  const { env } = getCloudflareContext();
  const requestedRange = parseRangeHeader(request.headers.get("range"));
  const object = requestedRange
    ? await env.MEDIA.get(key, { range: requestedRange })
    : await env.MEDIA.get(key);
  if (object === null) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  const metadata = object.httpMetadata;
  if (metadata?.contentType) headers.set("Content-Type", metadata.contentType);
  if (metadata?.contentLanguage) headers.set("Content-Language", metadata.contentLanguage);
  if (metadata?.contentDisposition) headers.set("Content-Disposition", metadata.contentDisposition);
  if (metadata?.contentEncoding) headers.set("Content-Encoding", metadata.contentEncoding);
  if (metadata?.cacheExpiry) headers.set("Expires", metadata.cacheExpiry.toUTCString());
  headers.set("Accept-Ranges", "bytes");
  headers.set("ETag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Security-Policy", "default-src 'none'");
  headers.set(
    "Cache-Control",
    visibility === "published"
      ? "public, max-age=3600, s-maxage=86400"
      : "private, no-store",
  );

  let status = 200;
  if (requestedRange && object.range && "offset" in object.range) {
    const offset = object.range.offset ?? 0;
    const length = object.range.length ?? object.size - offset;
    headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set("Content-Length", String(length));
    status = 206;
  } else {
    headers.set("Content-Length", String(object.size));
  }

  return new Response(object.body, { status, headers });
}
