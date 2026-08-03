import { ImageSourcePicker } from "@/components/image-source-picker";
import { FieldError } from "@/components/form-field-error";
import type { FieldErrors } from "@/components/application-form-types";

export function ApplicationMediaSection({ errors }: { errors?: FieldErrors }) {
  return (
    <section className="form-section" aria-labelledby="initial-media-heading">
      <div className="form-section-copy">
        <h2 id="initial-media-heading">Media</h2>
        <span>Add the primary artwork now. You can replace files or add more screenshots after saving.</span>
      </div>
      <div className="form-fields create-media-fields">
        <div className="create-media-card field-wide">
          <div><strong>Application icon</strong><span>Square PNG, JPEG, WebP, or AVIF. Used in listings and the app header.</span></div>
          <ImageSourcePicker
            accept="image/png,image/jpeg,image/webp,image/avif"
            fileLabel="Choose icon"
            fileName="iconFile"
            previewAlt="Application icon preview"
            previewShape="icon"
            urlLabel="Icon URL"
            urlName="iconUrl"
            urlPlaceholder="https://example.com/icon.png"
          />
          <label className="field"><span>Icon alt text <small>Optional</small></span><input name="iconAltText" placeholder="Raycast application icon" /></label>
        </div>
        <div className="create-media-card field-wide">
          <div><strong>Main preview image</strong><span>Wide editorial image displayed on the public application page.</span></div>
          <ImageSourcePicker
            accept="image/png,image/jpeg,image/webp,image/avif"
            fileLabel="Choose preview image"
            fileName="previewImageFile"
            previewAlt="Main preview image"
            urlLabel="Preview image URL"
            urlName="previewImageUrl"
            urlPlaceholder="https://example.com/preview.jpg"
          />
          <label className="field"><span>Preview alt text <small>Optional</small></span><input name="previewImageAltText" placeholder="Raycast command interface" /></label>
        </div>
        <div className="create-media-card field-wide">
          <div><strong>Screenshots</strong><span>Select up to 8 product or workflow images. You can add more later.</span></div>
          <label className="file-field"><span>Choose screenshots</span><input accept="image/png,image/jpeg,image/webp,image/avif" multiple name="screenshotFiles" type="file" /></label>
          <div className="media-source-divider"><span>and/or fetch from URLs</span></div>
          <label className="field create-media-url">
            <span>Screenshot URLs <small>One per line</small></span>
            <textarea name="screenshotUrls" placeholder={"https://example.com/screenshot-1.png\nhttps://example.com/screenshot-2.png"} rows={3} />
          </label>
        </div>
        <small className="field-hint field-wide">Optional for drafts. Maximum 10 MB per file and 40 MB combined.</small>
        <FieldError errors={errors?.media} />
      </div>
    </section>
  );
}
