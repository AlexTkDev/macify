import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#f7f7f5",
        color: "#20111f",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "68px 84px",
        textAlign: "center",
        width: "100%",
      }}
    >
      <div style={{ color: "#1457ff", display: "flex", fontSize: 24, fontWeight: 750, marginBottom: 34 }}>
        Macify · Dictation
      </div>
      <div style={{ display: "flex", fontSize: 82, fontWeight: 850, letterSpacing: "-0.045em", lineHeight: 0.98, maxWidth: 980 }}>
        Best dictation apps for Mac.
      </div>
      <div style={{ color: "#555b66", display: "flex", fontSize: 28, lineHeight: 1.4, marginTop: 36, maxWidth: 850 }}>
        Six apps compared by price, privacy, offline support, and everyday use.
      </div>
    </div>,
    size,
  );
}
