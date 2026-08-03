"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FieldError } from "@/components/form-field-error";
import type { EditableApplication, FieldErrors, RelatedApplicationOption } from "@/components/application-form-types";

const maximumRelationships = 12;

export function ApplicationRelationshipsSection({ application, errors, relatedApplications }: {
  application?: EditableApplication;
  errors?: FieldErrors;
  relatedApplications: RelatedApplicationOption[];
}) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set(application?.relatedAppIds ?? []));
  const visibleApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return relatedApplications;
    return relatedApplications.filter(({ name, status }) =>
      `${name} ${status}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query, relatedApplications]);

  function updateSelection(id: string, selected: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <section className="form-section" aria-labelledby="relationships-heading">
      <div className="form-section-copy">
        <h2 id="relationships-heading">Related applications</h2>
        <span>Connections are mutual. Selecting an app here also relates this record from the other direction.</span>
      </div>
      <div className="form-fields">
        <fieldset className="field field-wide related-app-picker">
          <legend>Choose related applications <small>Optional</small></legend>
          {relatedApplications.length > 0 ? (
            <div className="related-app-picker-content">
              <div className="related-app-toolbar">
                <label className="related-app-search">
                  <Search aria-hidden="true" size={16} />
                  <span className="sr-only">Search applications</span>
                  <input
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by application name"
                    type="search"
                    value={query}
                  />
                </label>
                <span className="related-app-count" aria-live="polite">
                  <strong>{selectedIds.size}</strong> of {maximumRelationships} selected
                </span>
              </div>
              {visibleApplications.length > 0 ? (
                <div className="related-app-options">
                  {visibleApplications.map((relatedApplication) => {
                    const selected = selectedIds.has(relatedApplication.id);
                    const disabled = !selected && selectedIds.size >= maximumRelationships;
                    return (
                      <label data-selected={selected} key={relatedApplication.id}>
                        <span>
                          <strong>{relatedApplication.name}</strong>
                          <small>{relatedApplication.status}</small>
                        </span>
                        <input
                          checked={selected}
                          disabled={disabled}
                          name="relatedAppIds"
                          onChange={(event) => updateSelection(relatedApplication.id, event.target.checked)}
                          type="checkbox"
                          value={relatedApplication.id}
                        />
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="related-app-empty">No applications match “{query.trim()}”.</p>
              )}
              <p className="related-app-hint">Relationships work in both directions. Select up to {maximumRelationships} applications.</p>
            </div>
          ) : <p className="related-app-empty">Add another application before creating relationships.</p>}
          <FieldError errors={errors?.relatedAppIds} />
        </fieldset>
      </div>
    </section>
  );
}
