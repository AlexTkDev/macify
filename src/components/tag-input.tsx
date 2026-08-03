"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

function cleanTag(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function TagInput({ initialValue = "", options }: { initialValue?: string; options: string[] }) {
  const [tags, setTags] = useState(() => initialValue.split(",").map(cleanTag).filter(Boolean).slice(0, 12));
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => {
    const selected = new Set(tags.map((tag) => tag.toLowerCase()));
    const needle = query.trim().toLowerCase();
    return options.filter((option) => !selected.has(option.toLowerCase()) && (!needle || option.toLowerCase().includes(needle))).slice(0, 6);
  }, [options, query, tags]);

  function addTag(value: string) {
    const tag = cleanTag(value);
    if (tag.length < 2 || tags.length >= 12 || tags.some((current) => current.toLowerCase() === tag.toLowerCase())) return;
    setTags((current) => [...current, tag]);
    setQuery("");
  }

  return (
    <div className="tag-input">
      <input name="tagsText" type="hidden" value={tags.join(", ")} />
      {tags.length > 0 && (
        <div className="tag-input-values" aria-label="Selected tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}<button aria-label={`Remove ${tag}`} onClick={() => setTags((current) => current.filter((item) => item !== tag))} type="button"><X size={12} /></button></span>
          ))}
        </div>
      )}
      <div className="tag-input-control">
        <input
          aria-label="Add a tag"
          autoComplete="off"
          disabled={tags.length >= 12}
          onBlur={() => window.setTimeout(() => setOpen(false), 100)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(query); }
            if (event.key === "Backspace" && !query && tags.length) setTags((current) => current.slice(0, -1));
          }}
          placeholder={tags.length >= 12 ? "12 tags selected" : "Search or create a tag"}
          value={query}
        />
        {query.trim().length >= 2 && <button aria-label={`Add ${query.trim()}`} onClick={() => addTag(query)} type="button"><Plus size={14} /></button>}
      </div>
      {open && tags.length < 12 && (query || suggestions.length > 0) && (
        <div className="tag-input-suggestions" role="listbox" aria-label="Tag suggestions">
          {suggestions.map((option) => <button aria-selected="false" key={option} onClick={() => addTag(option)} role="option" type="button">{option}</button>)}
          {query.trim().length >= 2 && !options.some((option) => option.toLowerCase() === query.trim().toLowerCase()) && <button aria-selected="false" className="tag-input-create" onClick={() => addTag(query)} role="option" type="button"><Plus size={13} /> Create “{cleanTag(query)}”</button>}
        </div>
      )}
      <small>{tags.length}/12 selected. Existing tags are suggested; new tags are created when you save.</small>
    </div>
  );
}
