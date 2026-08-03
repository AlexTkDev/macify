import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET() {
  const { env } = getCloudflareContext();
  const database = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();

  return Response.json({
    service: "macify",
    environment: env.APP_ENV,
    database: database?.ok === 1 ? "ready" : "unavailable",
  });
}

