import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const realtimeVisitorsUrl = "https://datafa.st/api/v1/analytics/realtime?fields=visitors";
const unavailableHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
};
const successHeaders = {
  "Cache-Control": "public, max-age=15, s-maxage=60",
  "CDN-Cache-Control": "public, s-maxage=60",
};

type DataFastRealtimeResponse = {
  status?: string;
  data?: Array<{ visitors?: number }>;
};

type DataFastEnv = CloudflareEnv & {
  DATAFAST_API_KEY?: string;
};

function defaultCache(): Cache | null {
  if (typeof caches === "undefined") return null;
  const cloudflareCaches = caches as CacheStorage & { readonly default: Cache };
  return cloudflareCaches.default;
}

export async function GET(request: Request) {
  const { env, ctx } = await getCloudflareContext({ async: true });
  const values = env as DataFastEnv;

  if (!values.DATAFAST_API_KEY) {
    return Response.json({ error: "Realtime visitors are unavailable." }, { status: 503, headers: unavailableHeaders });
  }

  try {
    const cache = defaultCache();
    const cacheKey = new Request(new URL("/api/realtime-visitors", request.url), { method: "GET" });
    const cached = await cache?.match(cacheKey);
    if (cached) return cached;

    const rateLimit = await env.REALTIME_VISITORS_RATE_LIMITER.limit({ key: "datafast-realtime" });
    if (!rateLimit.success) {
      return Response.json(
        { error: "Realtime visitors are temporarily unavailable." },
        { status: 429, headers: { ...unavailableHeaders, "Retry-After": "60" } },
      );
    }

    const response = await fetch(realtimeVisitorsUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${values.DATAFAST_API_KEY}`,
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return Response.json({ error: "Realtime visitors are unavailable." }, { status: 502, headers: unavailableHeaders });
    }

    const payload = await response.json() as DataFastRealtimeResponse;
    const count = payload.data?.[0]?.visitors;
    if (payload.status !== "success" || !Number.isFinite(count) || count === undefined || count < 0) {
      return Response.json({ error: "Realtime visitors are unavailable." }, { status: 502, headers: unavailableHeaders });
    }

    const result = Response.json({ count }, { headers: successHeaders });
    if (cache) ctx.waitUntil(cache.put(cacheKey, result.clone()));
    return result;
  } catch {
    return Response.json({ error: "Realtime visitors are unavailable." }, { status: 502, headers: unavailableHeaders });
  }
}
