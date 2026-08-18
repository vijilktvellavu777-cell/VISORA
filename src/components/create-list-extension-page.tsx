"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Card, Field, inputClass } from "@/components/ui";

export function CreateListExtensionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("email");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveExtension() {
    if (!name.trim()) {
      setError("Extension name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const response = await fetch("/api/audience/list-extensions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        type,
        description: description.trim() || null,
      }),
    });

    setSaving(false);
    if (!response.ok) {
      setError("Could not create extension");
      return;
    }

    router.push("/audience/list-extensions");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface px-6 pt-3">
        <div className="flex items-center gap-1 text-sm">
          <Link href="/audience" className="rounded-t-lg px-3 py-2 text-muted hover:text-foreground">
            List Extensions
          </Link>
          <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-background px-3 py-2 font-medium text-foreground">
            New Extension
            <Link href="/audience/list-extensions" className="text-muted hover:text-foreground" aria-label="Close">
              <X size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Create extension</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/audience/list-extensions"
              className="rounded-lg border border-primary px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={saveExtension}
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        <Card className="mt-8 space-y-5 p-6">
          <h2 className="text-lg font-semibold text-foreground">Extension Details</h2>

          <Field label="Extension Name">
            <input
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter extension name"
            />
          </Field>

          <Field label="Type">
            <div className="relative">
              <select
                className={`${inputClass} appearance-none pr-8`}
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="custom">Custom</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </Field>

          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-24`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what this extension does"
            />
          </Field>
        </Card>

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      </div>
    </div>
  );
}
