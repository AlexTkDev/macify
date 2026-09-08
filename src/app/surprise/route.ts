import { NextResponse } from "next/server";
import { getPublishedApplicationSlugs } from "@/lib/published-app-data";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
};

function getCurrentApplicationSlug(request: Request) {
  const referrer = request.headers.get("referer");
  if (!referrer) return null;

  try {
    const requestUrl = new URL(request.url);
    const referrerUrl = new URL(referrer);
    if (referrerUrl.origin !== requestUrl.origin) return null;

    const match = referrerUrl.pathname.match(/^\/apps\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const applications = await getPublishedApplicationSlugs();

  if (applications.length === 0) {
    return NextResponse.redirect(new URL("/", request.url), { headers: noStoreHeaders });
  }

  const currentSlug = getCurrentApplicationSlug(request);
  const choices = applications.length > 1
    ? applications.filter((application) => application.slug !== currentSlug)
    : applications;
  const randomValue = new Uint32Array(1);
  crypto.getRandomValues(randomValue);
  const application = choices[randomValue[0] % choices.length];

  return NextResponse.redirect(new URL(`/apps/${application.slug}`, request.url), {
    headers: noStoreHeaders,
  });
}
