"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Field, inputClass } from "@/components/ui";
import { LINK_TABLE_TYPES } from "@/lib/link-table";

type Props = {
  className?: string;
  onOpenChange?: (open: boolean) => void;
};

export function CreateNewLinkTableDropdown({ className = "", onOpenChange }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>(LINK_TABLE_TYPES[0].value);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onOpenChange]);

  function setPanelOpen(value: boolean) {
    setOpen(value);
    onOpenChange?.(value);
  }

  function resetForm() {
    setName("");
    setType(LINK_TABLE_TYPES[0].value);
    setDescription("");
    setError(null);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/content/link-table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, description }),
    });
    const json = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(typeof json.error === "string" ? json.error : "Could not create link table.");
      return;
    }

    resetForm();
    setPanelOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setPanelOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Create new link table
        <ChevronDown size={16} className={open ? "rotate-180 transition" : "transition"} />
      </button>

      {open ? (
        <form
          onSubmit={handleCreate}
          className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-border bg-surface p-4 shadow-lg"
        >
          <div className="space-y-3">
            <Field label="Link table name">
              <input
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Summer campaign links"
                autoFocus
              />
            </Field>
            <Field label="Type">
              <select
                className={inputClass}
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                {LINK_TABLE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-[88px] resize-y`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional notes for this link table"
              />
            </Field>
            {error ? <p className="text-sm text-error">{error}</p> : null}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create link table"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
