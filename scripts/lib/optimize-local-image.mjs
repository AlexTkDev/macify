import sharp from "sharp";

export async function optimizeLocalImage(bytes, role) {
  try {
    const image = sharp(bytes, { animated: false, failOn: "error" });
    const metadata = await image.metadata();
    const optimizedBytes = await image
      .webp({ quality: role === "icon" ? 92 : 88, effort: 5 })
      .toBuffer();
    if (optimizedBytes.byteLength >= bytes.byteLength) {
      return {
        bytes,
        mimeType: null,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        optimized: false,
        skipped: false,
      };
    }
    return {
      bytes: optimizedBytes,
      mimeType: "image/webp",
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      optimized: true,
      skipped: false,
    };
  } catch {
    return { bytes, mimeType: null, width: null, height: null, optimized: false, skipped: true };
  }
}
