import { FieldError } from "@/components/form-field-error";
import type { EditableApplication, FieldErrors } from "@/components/application-form-types";

export function ApplicationIdentitySection({
  application,
  errors,
  name,
  setName,
  setSlug,
  setSlugEdited,
  slug,
  slugEdited,
}: {
  application?: EditableApplication;
  errors?: FieldErrors;
  name: string;
  setName: (value: string) => void;
  setSlug: (value: string) => void;
  setSlugEdited: (value: boolean) => void;
  slug: string;
  slugEdited: boolean;
}) {
  const slugify = (value: string) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
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
          <FieldError errors={errors?.name} />
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
          <FieldError errors={errors?.slug} />
        </label>
        <label className="field">
          <span>Website</span>
          <input defaultValue={application?.websiteUrl} name="websiteUrl" placeholder="https://example.com" required type="url" />
          <FieldError errors={errors?.websiteUrl} />
        </label>
        <label className="field field-wide">
          <span>Tagline</span>
          <input maxLength={140} defaultValue={application?.tagline} name="tagline" placeholder="A keyboard-first command center for your Mac." required />
          <FieldError errors={errors?.tagline} />
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
          <FieldError errors={errors?.description} />
        </label>
      </div>
    </section>
  );
}
