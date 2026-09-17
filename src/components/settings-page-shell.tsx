"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, PageHeader } from "@/components/ui";
import type { SettingsPageKey } from "@/lib/settings-pages/types";

export function SettingsPageShell({
  pageKey,
  title,
  subtitle,
  initial,
  children,
}: {
  pageKey: SettingsPageKey;
  title: string;
  subtitle: string;
  initial: Record<string, unknown>;
  children: (
    form: Record<string, unknown>,
    setForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
  ) => React.ReactNode;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown>>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const { apiKeys: _omit, ...payload } = form;

    const response = await fetch(`/api/settings/pages/${pageKey}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not save settings.");
      return;
    }

    const data = (await response.json()) as Record<string, unknown>;
    setForm(data);
    setMessage("Settings saved.");
    router.refresh();
  }

  return (
    <div className="min-h-full bg-background">
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Button type="button" onClick={save}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />
      <div className="mx-auto max-w-3xl space-y-6 p-8">
        {message ? (
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </div>
        ) : null}
        {children(form, setForm)}
      </div>
    </div>
  );
}

export function getObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function getArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

export function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function getBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function getNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

export function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item : String(item)));
}

export function setNestedForm(
  setForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
  key: string,
  updater: (current: Record<string, unknown>) => Record<string, unknown>,
) {
  setForm((prev) => ({
    ...prev,
    [key]: updater(getObject(prev[key])),
  }));
}
