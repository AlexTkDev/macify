import { NextResponse } from "next/server";
import { getPublishedApplicationSlugs } from "@/lib/apps-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const applications = await getPublishedApplicationSlugs();

  if (applications.length === 0) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const randomValue = new Uint32Array(1);
  crypto.getRandomValues(randomValue);
  const application = applications[randomValue[0] % applications.length];

  return NextResponse.redirect(new URL(`/apps/${application.slug}`, request.url));
}
