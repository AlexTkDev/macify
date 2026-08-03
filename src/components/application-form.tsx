"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import {
  createApplication,
  type ApplicationFormState,
  updateApplication,
} from "@/app/dashboard/actions";

const initialState: ApplicationFormState = {};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <span className="field-error">{errors[0]}</span>;
}

type EditableApplication = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  tagline: string;
  summary: string;
  description: string;
  pricingType: "free" | "freemium" | "paid_once" | "subscription" | "open_source" | "enterprise";
  pricingDetails: string | null;
  sourceType: "open_source" | "closed_source";
  sourceUrl: string | null;
  youtubeUrl: string | null;
  minimumMacos: string | null;
  categoryId: string;
  tagsText: string;
  relatedAppIds: string[];
};

type CategoryOption = { id: string; name: string };
type RelatedApplicationOption = {
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
};

function SaveButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button className="button-primary" disabled={pending} type="submit">
      <Save size={16} /> {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Save draft"}
    </button>
  );
}

export function ApplicationForm({
  application,
  categories,
  relatedApplications,
  mode = "create",
}: {
  application?: EditableApplication;
  categories: CategoryOption[];
  relatedApplications: RelatedApplicationOption[];
  mode?: "create" | "edit";
}) {
  const formAction = mode === "edit" ? updateApplication : createApplication;
  const [state, action] = useActionState(formAction, initialState);
  const [name, setName] = useState(application?.name ?? "");
  const [slug, setSlug] = useState(application?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  return (
    <form action={action} className="editor-form">
      {application && <input name="appId" type="hidden" value={application.id} />}
      {state.message && (
        <div className="form-alert" role="alert">
          <span aria-hidden="true">!</span>
          <div>
            <strong>{mode === "edit" ? "Changes not saved" : "Application not saved"}</strong>
            <p>{state.message}</p>
          </div>
        </div>
      )}

      <section className="form-section" aria-labelledby="identity-heading">
        <div className="form-section-copy">
          <h2 id="identity-heading">Identity</h2>
          <span>The information people use to recognize and understand this app.</span>
        </div>
        <div className="form-fields">
          <label className="field field-wide">
            <span>Application name</span>
            <input
              autoComplete="off"
              name="name"
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!slugEdited) setSlug(slugify(nextName));
              }}
              placeholder="Raycast"
              required
              value={name}
            />
            <FieldError errors={state.errors?.name} />
          </label>
          <label className="field">
            <span>Slug</span>
            <input
              autoComplete="off"
              name="slug"
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value);
              }}
              placeholder="raycast"
              required
              value={slug}
            />
            <FieldError errors={state.errors?.slug} />
          </label>
          <label className="field">
            <span>Website</span>
            <input defaultValue={application?.websiteUrl} name="websiteUrl" placeholder="https://example.com" required type="url" />
            <FieldError errors={state.errors?.websiteUrl} />
          </label>
          <label className="field field-wide">
            <span>Tagline</span>
            <input
              maxLength={140}
              defaultValue={application?.tagline}
              name="tagline"
              placeholder="A keyboard-first command center for your Mac."
              required
            />
            <FieldError errors={state.errors?.tagline} />
          </label>
          <label className="field field-wide">
            <span>Brief description</span>
            <textarea
              name="summary"
              defaultValue={application?.summary}
              placeholder="Explain the app’s main job and who will find it useful."
              required
              rows={3}
            />
            <FieldError errors={state.errors?.summary} />
          </label>
          <label className="field field-wide">
            <span>Detailed description <small>Markdown</small></span>
            <textarea
              className="markdown-source"
              defaultValue={application?.description}
              name="description"
              placeholder={"Describe the workflow and features in Markdown.\n\n## Key features\n\n- First feature\n- Second feature"}
              required
              rows={16}
            />
            <small className="field-hint">Stored as plain Markdown and rendered as formatted content on the public page.</small>
            <FieldError errors={state.errors?.description} />
          </label>
        </div>
      </section>

      {mode === "create" && (
        <section className="form-section" aria-labelledby="initial-media-heading">
          <div className="form-section-copy">
            <h2 id="initial-media-heading">Media</h2>
            <span>Add the primary artwork now. You can replace files or add more screenshots after saving.</span>
          </div>
          <div className="form-fields create-media-fields">
            <div className="create-media-card field-wide">
              <div><strong>Application icon</strong><span>Square PNG, JPEG, WebP, or AVIF. Used in listings and the app header.</span></div>
              <label className="file-field"><span>Choose icon</span><input accept="image/png,image/jpeg,image/webp,image/avif" name="iconFile" type="file" /></label>
              <div className="media-source-divider"><span>or fetch from URL</span></div>
              <label className="field create-media-url"><span>Icon URL <small>Optional</small></span><input name="iconUrl" placeholder="https://example.com/icon.png" type="url" /></label>
              <label className="field"><span>Icon alt text <small>Optional</small></span><input name="iconAltText" placeholder="Raycast application icon" /></label>
            </div>
            <div className="create-media-card field-wide">
              <div><strong>Main preview image</strong><span>Wide editorial image displayed on the public application page.</span></div>
              <label className="file-field"><span>Choose preview image</span><input accept="image/png,image/jpeg,image/webp,image/avif" name="previewImageFile" type="file" /></label>
              <div className="media-source-divider"><span>or fetch from URL</span></div>
              <label className="field create-media-url"><span>Preview image URL <small>Optional</small></span><input name="previewImageUrl" placeholder="https://example.com/preview.jpg" type="url" /></label>
              <label className="field"><span>Preview alt text <small>Optional</small></span><input name="previewImageAltText" placeholder="Raycast command interface" /></label>
            </div>
            <div className="create-media-card field-wide">
              <div><strong>Screenshots</strong><span>Select up to 8 product or workflow images. You can add more later.</span></div>
              <label className="file-field"><span>Choose screenshots</span><input accept="image/png,image/jpeg,image/webp,image/avif" multiple name="screenshotFiles" type="file" /></label>
              <div className="media-source-divider"><span>and/or fetch from URLs</span></div>
              <label className="field create-media-url"><span>Screenshot URLs <small>One per line</small></span><textarea name="screenshotUrls" placeholder={"https://example.com/screenshot-1.png\nhttps://example.com/screenshot-2.png"} rows={3} /></label>
            </div>
            <small className="field-hint field-wide">Optional for drafts. Maximum 10 MB per file and 40 MB combined.</small>
            <FieldError errors={state.errors?.media} />
          </div>
        </section>
      )}

      <section className="form-section" aria-labelledby="classification-heading">
        <div className="form-section-copy">
          <h2 id="classification-heading">Classification</h2>
          <span>A primary category and focused tags make discovery and related-app matching reliable.</span>
        </div>
        <div className="form-fields">
          <label className="field field-wide">
            <span>Primary category</span>
            <select defaultValue={application?.categoryId ?? ""} name="categoryId" required>
              <option disabled value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <FieldError errors={state.errors?.categoryId} />
          </label>
          <label className="field field-wide">
            <span>Tags <small>Optional, up to 12</small></span>
            <input
              defaultValue={application?.tagsText ?? ""}
              name="tagsText"
              placeholder="launcher, automation, keyboard-first"
            />
            <small className="field-hint">Separate tags with commas. Reuse simple nouns and short phrases.</small>
            <FieldError errors={state.errors?.tagsText} />
          </label>
        </div>
      </section>

      <section className="form-section" aria-labelledby="availability-heading">
        <div className="form-section-copy">
          <h2 id="availability-heading">Availability</h2>
          <span>Pricing, source model, compatibility, and supporting links.</span>
        </div>
        <div className="form-fields">
          <label className="field">
            <span>Pricing model</span>
            <select defaultValue={application?.pricingType ?? "free"} name="pricingType">
              <option value="free">Free</option>
              <option value="freemium">Free with paid upgrade</option>
              <option value="paid_once">Paid once</option>
              <option value="subscription">Subscription</option>
              <option value="open_source">Open source</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <FieldError errors={state.errors?.pricingType} />
          </label>
          <label className="field">
            <span>Source model</span>
            <select defaultValue={application?.sourceType ?? "closed_source"} name="sourceType">
              <option value="closed_source">Closed source</option>
              <option value="open_source">Open source</option>
            </select>
            <FieldError errors={state.errors?.sourceType} />
          </label>
          <label className="field field-wide">
            <span>Pricing details <small>Optional</small></span>
            <input defaultValue={application?.pricingDetails ?? ""} name="pricingDetails" placeholder="$29 once, or free for personal use" />
            <FieldError errors={state.errors?.pricingDetails} />
          </label>
          <label className="field">
            <span>Minimum macOS <small>Optional</small></span>
            <input defaultValue={application?.minimumMacos ?? ""} name="minimumMacos" placeholder="macOS 13 Ventura" />
            <FieldError errors={state.errors?.minimumMacos} />
          </label>
          <label className="field">
            <span>Source repository <small>Optional</small></span>
            <input defaultValue={application?.sourceUrl ?? ""} name="sourceUrl" placeholder="https://github.com/…" type="url" />
            <FieldError errors={state.errors?.sourceUrl} />
          </label>
          <label className="field field-wide">
            <span>YouTube demo <small>Optional</small></span>
            <input defaultValue={application?.youtubeUrl ?? ""} name="youtubeUrl" placeholder="https://www.youtube.com/watch?v=…" type="url" />
            <small className="field-hint">Macify links to YouTube instead of loading a third-party player automatically.</small>
            <FieldError errors={state.errors?.youtubeUrl} />
          </label>
        </div>
      </section>

      <section className="form-section" aria-labelledby="relationships-heading">
        <div className="form-section-copy">
          <h2 id="relationships-heading">Related applications</h2>
          <span>Connections are mutual. Selecting an app here also relates this record from the other direction.</span>
        </div>
        <div className="form-fields">
          <fieldset className="field field-wide related-app-picker">
            <legend>Choose up to 12 applications <small>Optional</small></legend>
            {relatedApplications.length > 0 ? (
              <div className="related-app-options">
                {relatedApplications.map((relatedApplication) => (
                  <label key={relatedApplication.id}>
                    <input
                      defaultChecked={application?.relatedAppIds.includes(relatedApplication.id)}
                      name="relatedAppIds"
                      type="checkbox"
                      value={relatedApplication.id}
                    />
                    <span><strong>{relatedApplication.name}</strong><small>{relatedApplication.status}</small></span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="related-app-empty">Add another application before creating relationships.</p>
            )}
            <FieldError errors={state.errors?.relatedAppIds} />
          </fieldset>
        </div>
      </section>

      <div className="form-footer">
        <p>{mode === "edit" ? "Saving does not publish the record." : "The application and selected media will be saved together as a draft."}</p>
        <div>
          <Link className="button-secondary" href="/dashboard">
            <ArrowLeft size={16} /> Cancel
          </Link>
          <SaveButton mode={mode} />
        </div>
      </div>
    </form>
  );
}
