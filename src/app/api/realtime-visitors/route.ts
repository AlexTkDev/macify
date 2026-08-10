import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const realtimeVisitorsUrl = "https://datafa.st/api/v1/analytics/realtime?fields=visitors";
const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
};

type DataFastRealtimeResponse = {
  status?: string;
  data?: Array<{ visitors?: number }>;
};

type DataFastEnv = CloudflareEnv & {
  DATAFAST_API_KEY?: string;
};

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const values = env as DataFastEnv;

  if (!values.DATAFAST_API_KEY) {
    return Response.json({ error: "Realtime visitors are unavailable." }, { status: 503, headers: noStoreHeaders });
  }

  try {
    const response = await fetch(realtimeVisitorsUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${values.DATAFAST_API_KEY}`,
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return Response.json({ error: "Realtime visitors are unavailable." }, { status: 502, headers: noStoreHeaders });
    }

    const payload = await response.json() as DataFastRealtimeResponse;
    const count = payload.data?.[0]?.visitors;
    if (payload.status !== "success" || !Number.isFinite(count) || count === undefined || count < 0) {
      return Response.json({ error: "Realtime visitors are unavailable." }, { status: 502, headers: noStoreHeaders });
    }

    return Response.json({ count }, { headers: noStoreHeaders });
  } catch {
    return Response.json({ error: "Realtime visitors are unavailable." }, { status: 502, headers: noStoreHeaders });
  }
}
