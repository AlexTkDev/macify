import { prepareMediaSource, type MediaRole, type PreparedMedia } from "@/lib/media-upload";

export async function prepareCreateMedia(formData: FormData, appId: string, images: ImagesBinding | undefined) {
  const selections: Array<{ role: MediaRole; file: File | null; url: string; altText: string }> = [];
  const addSelection = (
    role: MediaRole,
    value: FormDataEntryValue | null,
    url: string,
    altText: string,
  ) => {
    const file = value instanceof File && value.size > 0 ? value : null;
    if (file || url.trim()) selections.push({ role, file, url: url.trim(), altText });
  };

  addSelection("icon", formData.get("iconFile"), String(formData.get("iconUrl") ?? ""), String(formData.get("iconAltText") ?? ""));
  addSelection("preview_image", formData.get("previewImageFile"), String(formData.get("previewImageUrl") ?? ""), String(formData.get("previewImageAltText") ?? ""));
  const screenshots = formData.getAll("screenshotFiles").filter(
    (value): value is File => value instanceof File && value.size > 0,
  );
  const screenshotUrls = String(formData.get("screenshotUrls") ?? "")
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
  if (screenshots.length + screenshotUrls.length > 8) {
    return { ok: false, error: "Choose no more than 8 screenshots at a time." } as const;
  }
  for (const screenshot of screenshots) addSelection("screenshot", screenshot, "", "");
  for (const url of screenshotUrls) addSelection("screenshot", null, url, "");

  const prepared: PreparedMedia[] = [];
  for (const selection of selections) {
    const result = await prepareMediaSource(appId, selection.role, selection.file, selection.url, selection.altText, images);
    if (!result.ok) return result;
    prepared.push(result.media);
  }
  const totalBytes = prepared.reduce((sum, media) => sum + media.byteSize, 0);
  if (totalBytes > 40 * 1024 * 1024) {
    return { ok: false, error: "The combined media upload must be 40 MB or smaller." } as const;
  }
  return { ok: true, media: prepared } as const;
}
