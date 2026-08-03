import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPublishedApplicationBySlug } from "@/lib/apps-data";

export const alt = "Macify application share image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const application = await getPublishedApplicationBySlug(slug);
  if (!application) notFound();

  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#f3f5f6",
        color: "#171b1e",
        display: "flex",
        height: "100%",
        padding: "48px",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "2px solid #c4cbd0",
          borderRadius: 28,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 56px",
          width: "100%",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em" }}>
          <span style={{ alignItems: "center", background: "#171b1e", borderRadius: 14, color: "#ffffff", display: "flex", height: 48, justifyContent: "center", marginRight: 18, width: 48 }}>M</span>
          Macify
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#42647d", fontSize: 24, letterSpacing: "0.08em", marginBottom: 18, textTransform: "uppercase" }}>
            Useful macOS application
          </div>
          <div style={{ fontSize: application.name.length > 24 ? 72 : 92, fontWeight: 750, letterSpacing: "-0.055em", lineHeight: 0.94 }}>
            {application.name}
          </div>
        </div>
        <div style={{ alignItems: "center", display: "flex", fontSize: 24, justifyContent: "space-between" }}>
          <span style={{ color: "#69747c" }}>{application.tagline}</span>
          <span style={{ marginLeft: 36, whiteSpace: "nowrap" }}>macify.app</span>
        </div>
      </div>
    </div>,
    size,
  );
}
