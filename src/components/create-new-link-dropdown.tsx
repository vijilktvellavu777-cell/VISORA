"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Field, inputClass } from "@/components/ui";

export function CreateNewLinkDropdown({ className = "" }: { className?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function resetForm() {
    setName("");
    setUrl("");
    setError(null);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/content/link-table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url }),
    });
    const json = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(typeof json.error === "string" ? json.error : "Could not create link.");
      return;
    }

    resetForm();
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Create new link
        <ChevronDown size={16} className={open ? "rotate-180 transition" : "transition"} />
      </button>

      {open ? (
        <form
          onSubmit={handleCreate}
          className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,20rem)] rounded-xl border border-border bg-surface p-4 shadow-lg"
        >
          <div className="space-y-3">
            <Field label="Link name">
              <input
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Summer sale CTA"
                autoFocus
              />
            </Field>
            <Field label="Link URL">
              <input
                className={inputClass}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/sale"
              />
            </Field>
            {error ? <p className="text-sm text-error">{error}</p> : null}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create link"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
