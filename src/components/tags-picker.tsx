"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Tag } from "lucide-react";
import { inputClass } from "@/components/ui";
import { isValidTagName, normalizeTagName } from "@/lib/tags";

type TagsPickerProps = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export function TagsPicker({ value, onChange }: TagsPickerProps) {
  const [open, setOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newTagError, setNewTagError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    fetch("/api/tags")
      .then((response) => (response.ok ? response.json() : { tags: [] }))
      .then((json) => {
        if (cancelled) return;
        const tags = Array.isArray(json.tags)
          ? json.tags.filter((tag: unknown): tag is string => typeof tag === "string")
          : [];
        setAvailableTags(tags);
      })
      .catch(() => {
        if (!cancelled) setAvailableTags([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const allTags = Array.from(new Set([...availableTags, ...value])).sort((a, b) => a.localeCompare(b));

  function toggleTag(tag: string) {
    if (value.includes(tag)) {
      onChange(value.filter((item) => item !== tag));
      return;
    }
    onChange([...value, tag]);
  }

  function addNewTag() {
    const normalized = normalizeTagName(newTag);
    if (!isValidTagName(normalized)) {
      setNewTagError("Enter a tag name up to 64 characters.");
      return;
    }
    if (value.includes(normalized)) {
      setNewTag("");
      setNewTagError(null);
      return;
    }
    onChange([...value, normalized]);
    if (!availableTags.includes(normalized)) {
      setAvailableTags((current) => [...current, normalized].sort((a, b) => a.localeCompare(b)));
    }
    setNewTag("");
    setNewTagError(null);
  }

  return (
    <div ref={ref} className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary"
      >
        <Tag size={14} />
        Tags
        {value.length > 0 ? (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">{value.length}</span>
        ) : null}
        <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
      </button>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="text-primary/70 hover:text-primary"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">Tags</div>
          <div className="max-h-56 overflow-y-auto p-2">
            {loading ? (
              <p className="px-2 py-3 text-sm text-muted">Loading tags…</p>
            ) : allTags.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted">No tags yet. Create one below.</p>
            ) : (
              allTags.map((tag) => {
                const selected = value.includes(tag);
                return (
                  <label
                    key={tag}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-background"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleTag(tag)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className={selected ? "font-medium text-foreground" : "text-foreground"}>{tag}</span>
                  </label>
                );
              })
            )}
          </div>
          <div className="border-t border-border p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Create new tag</div>
            <div className="mt-2 flex gap-2">
              <input
                className={`${inputClass} min-w-0 flex-1`}
                value={newTag}
                placeholder="Tag name"
                onChange={(event) => {
                  setNewTag(event.target.value);
                  if (newTagError) setNewTagError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addNewTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={addNewTag}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
            {newTagError ? <p className="mt-1.5 text-xs text-error">{newTagError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
