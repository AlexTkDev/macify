import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { mediaUrl } from "@/components/public-app-card";
import { getPublishedApplicationBySlug } from "@/lib/apps-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

function titleFontSize(title: string) {
  if (title.length > 180) return 20;
  if (title.length > 120) return 24;
  if (title.length > 80) return 30;
  return 42;
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const application = await getPublishedApplicationBySlug(slug);
  if (!application) notFound();
  const preview = application.media.find(({ role }) => role === "preview_image");
  const title = `${application.name} — ${application.tagline} | Macify`;
  const previewSource = preview
    ? new URL(`${mediaUrl(preview.storageKey)}?width=1200`, "https://macify.app").toString()
    : null;

  return new ImageResponse(
    <div
      style={{
        background: "#ffffff",
        color: "#20111f",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          height: 132,
          padding: "0 56px",
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: titleFontSize(title),
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 1,
            width: "100%",
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          background: "#f6f4f5",
          display: "flex",
          flex: 1,
          justifyContent: "center",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {previewSource ? (
          <img
            alt=""
            height={498}
            src={previewSource}
            style={{ height: "100%", objectFit: "contain", width: "100%" }}
            width={1200}
          />
        ) : null}
      </div>
    </div>,
    size,
  );
}
