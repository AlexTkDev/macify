"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

function cleanCategory(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function CategoryInput({ initialValue = "", options }: { initialValue?: string; options: string[] }) {
  const [categories, setCategories] = useState(() => initialValue.split(",").map(cleanCategory).filter(Boolean).slice(0, 12));
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => {
    const selected = new Set(categories.map((category) => category.toLowerCase()));
    const needle = query.trim().toLowerCase();
    return options.filter((option) => !selected.has(option.toLowerCase()) && (!needle || option.toLowerCase().includes(needle))).slice(0, 6);
  }, [options, query, categories]);

  function addCategory(value: string) {
    const category = cleanCategory(value);
    if (category.length < 2 || categories.length >= 12 || categories.some((current) => current.toLowerCase() === category.toLowerCase())) return;
    setCategories((current) => [...current, category]);
    setQuery("");
  }

  return (
    <div className="category-input">
      <input name="categoriesText" type="hidden" value={categories.join(", ")} />
      {categories.length > 0 && (
        <div className="category-input-values" aria-label="Selected categories">
          {categories.map((category) => (
            <span key={category}>{category}<button aria-label={`Remove ${category}`} onClick={() => setCategories((current) => current.filter((item) => item !== category))} type="button"><X size={12} /></button></span>
          ))}
        </div>
      )}
      <div className="category-input-control">
        <input
          aria-label="Add a category"
          autoComplete="off"
          disabled={categories.length >= 12}
          onBlur={() => window.setTimeout(() => setOpen(false), 100)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addCategory(query); }
            if (event.key === "Backspace" && !query && categories.length) setCategories((current) => current.slice(0, -1));
          }}
          placeholder={categories.length >= 12 ? "12 categories selected" : "Search or create a category"}
          value={query}
        />
        {query.trim().length >= 2 && <button aria-label={`Add ${query.trim()}`} onClick={() => addCategory(query)} type="button"><Plus size={14} /></button>}
      </div>
      {open && categories.length < 12 && (query || suggestions.length > 0) && (
        <div className="category-input-suggestions" role="listbox" aria-label="Category suggestions">
          {suggestions.map((option) => <button aria-selected="false" key={option} onClick={() => addCategory(option)} role="option" type="button">{option}</button>)}
          {query.trim().length >= 2 && !options.some((option) => option.toLowerCase() === query.trim().toLowerCase()) && <button aria-selected="false" className="category-input-create" onClick={() => addCategory(query)} role="option" type="button"><Plus size={13} /> Create “{cleanCategory(query)}”</button>}
        </div>
      )}
      <small>{categories.length}/12 selected. Existing categories are suggested; new categories are created when you save.</small>
    </div>
  );
}
