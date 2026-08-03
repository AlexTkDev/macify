import { FieldError } from "@/components/form-field-error";
import { TagInput } from "@/components/tag-input";
import type { CategoryOption, EditableApplication, FieldErrors } from "@/components/application-form-types";

export function ApplicationClassificationSection({ application, categories, errors, tags }: {
  application?: EditableApplication;
  categories: CategoryOption[];
  errors?: FieldErrors;
  tags: string[];
}) {
  return (
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
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <FieldError errors={errors?.categoryId} />
        </label>
        <div className="field field-wide">
          <span>Tags <small>Optional, up to 12</small></span>
          <TagInput initialValue={application?.tagsText ?? ""} options={tags} />
          <FieldError errors={errors?.tagsText} />
        </div>
      </div>
    </section>
  );
}
