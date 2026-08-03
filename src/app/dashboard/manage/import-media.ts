import { prepareMediaSource, type PreparedMedia } from "@/lib/media-upload";
import { splitList, type NormalizedImport } from "@/app/dashboard/manage/import-schema";

export async function prepareImportedMedia(appId: string, data: NormalizedImport, images: ImagesBinding | undefined) {
  const selections: Array<{
    role: "icon" | "preview_image" | "screenshot";
    url: string;
    altText: string;
  }> = [];
  if (data.iconUrl) {
    selections.push({ role: "icon", url: data.iconUrl, altText: data.iconAltText });
  }
  if (data.previewImageUrl) {
    selections.push({
      role: "preview_image",
      url: data.previewImageUrl,
      altText: data.previewImageAltText,
    });
  }
  for (const url of splitList(data.screenshotUrls)) {
    selections.push({ role: "screenshot", url, altText: "" });
  }
  const media: PreparedMedia[] = [];
  for (const selection of selections) {
    const result = await prepareMediaSource(
      appId,
      selection.role,
      null,
      selection.url,
      selection.altText,
      images,
    );
    if (!result.ok) return { ok: false, error: `${selection.role}: ${result.error}` } as const;
    media.push(result.media);
  }
  if (media.reduce((sum, asset) => sum + asset.byteSize, 0) > 40 * 1024 * 1024) {
    return {
      ok: false,
      error: "Combined media is larger than the 40 MB per-application limit.",
    } as const;
  }
  return { ok: true, media } as const;
}
