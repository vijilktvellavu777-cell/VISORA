"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Card, Field, PageHeader, inputClass } from "@/components/ui";
import type { GeneralSettings } from "@/lib/general-settings";
import {
  COUNTRY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  INDUSTRY_OPTIONS,
  LANGUAGE_OPTIONS,
  TIME_ZONE_OPTIONS,
} from "@/lib/general-settings";

const selectClass = `${inputClass} appearance-none bg-surface`;

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-6 space-y-4">{children}</div>
    </Card>
  );
}

export function GeneralSettingsPage({ initial }: { initial: GeneralSettings }) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<GeneralSettings>(initial);
  const [paused, setPaused] = useState(initial.paused);
  const [saving, setSaving] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveSettings() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/settings/general", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not save settings.");
      return;
    }

    const data = (await response.json()) as GeneralSettings;
    setForm(data);
    setMessage("General settings saved.");
    router.refresh();
  }

  async function togglePause() {
    setPauseLoading(true);
    setError(null);
    setMessage(null);

    const nextPaused = !paused;
    const response = await fetch("/api/settings/general/pause", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paused: nextPaused }),
    });

    setPauseLoading(false);
    if (!response.ok) {
      setError("Could not update workspace pause state.");
      return;
    }

    const data = (await response.json()) as GeneralSettings;
    setPaused(data.paused);
    setForm((prev) => ({ ...prev, paused: data.paused }));
    setMessage(data.paused ? "Workspace paused." : "Workspace resumed.");
    router.refresh();
  }

  async function deleteWorkspace() {
    setDeleteLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/settings/general/workspace", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmName: deleteConfirm }),
    });

    setDeleteLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not delete workspace.");
      return;
    }

    window.location.href = "/";
  }

  function onLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 512_000) {
      setError("Logo must be smaller than 512 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("logoUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-full bg-background">
      <PageHeader
        title="General"
        subtitle="Organization profile, branding, localization, and workspace controls."
        action={
          <Button type="button" onClick={saveSettings}>
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

        <SettingsSection
          title="Organization Information"
          description="How your organization appears across Visora."
        >
          <Field label="Organization Name">
            <input
              className={inputClass}
              value={form.organizationName}
              onChange={(event) => update("organizationName", event.target.value)}
              placeholder="VISORA"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Website">
              <input
                className={inputClass}
                type="url"
                value={form.website}
                onChange={(event) => update("website", event.target.value)}
                placeholder="https://example.com"
              />
            </Field>
            <Field label="Industry">
              <select
                className={selectClass}
                value={form.industry}
                onChange={(event) => update("industry", event.target.value)}
              >
                <option value="">Select industry</option>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Country">
              <select
                className={selectClass}
                value={form.country}
                onChange={(event) => update("country", event.target.value)}
              >
                <option value="">Select country</option>
                {COUNTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Time Zone">
              <select
                className={selectClass}
                value={form.organizationTimeZone}
                onChange={(event) => update("organizationTimeZone", event.target.value)}
              >
                {TIME_ZONE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection title="Branding" description="Visual identity used in messages and the workspace.">
          <Field label="Logo">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logoUrl} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-muted">None</span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  className={inputClass}
                  value={form.logoUrl.startsWith("data:") ? "" : form.logoUrl}
                  onChange={(event) => update("logoUrl", event.target.value)}
                  placeholder="https://cdn.example.com/logo.png"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground hover:bg-background"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    Upload image
                  </button>
                  {form.logoUrl ? (
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-foreground"
                      onClick={() => update("logoUrl", "")}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={onLogoFileChange}
                />
              </div>
            </div>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Brand Name">
              <input
                className={inputClass}
                value={form.brandName}
                onChange={(event) => update("brandName", event.target.value)}
                placeholder="VISORA"
              />
            </Field>
            <Field label="Primary Color">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(event) => update("primaryColor", event.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-surface p-1"
                />
                <input
                  className={inputClass}
                  value={form.primaryColor}
                  onChange={(event) => update("primaryColor", event.target.value)}
                  placeholder="#6d5efc"
                />
              </div>
            </Field>
          </div>
          <Field label="Default Sender Name">
            <input
              className={inputClass}
              value={form.defaultSenderName}
              onChange={(event) => update("defaultSenderName", event.target.value)}
              placeholder="VISORA Team"
            />
          </Field>
        </SettingsSection>

        <SettingsSection title="Localization" description="Defaults for language, time, and dates.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Default Language">
              <select
                className={selectClass}
                value={form.defaultLanguage}
                onChange={(event) => update("defaultLanguage", event.target.value)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Default Time Zone">
              <select
                className={selectClass}
                value={form.defaultTimeZone}
                onChange={(event) => update("defaultTimeZone", event.target.value)}
              >
                {TIME_ZONE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Date Format">
            <select
              className={selectClass}
              value={form.dateFormat}
              onChange={(event) => update("dateFormat", event.target.value)}
            >
              {DATE_FORMAT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </SettingsSection>

        <Card className="border-warning/40 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-warning" size={20} />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
              <p className="mt-1 text-sm text-muted">
                Pause sending and campaigns, or permanently remove this workspace and its data.
              </p>

              {paused ? (
                <p className="mt-3 text-sm font-medium text-warning">This workspace is currently paused.</p>
              ) : null}

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border px-4 py-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">Pause Workspace</div>
                    <p className="mt-0.5 text-sm text-muted">
                      Temporarily disable campaigns and message sending for this workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={pauseLoading}
                    onClick={togglePause}
                    className="shrink-0 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground hover:bg-background disabled:opacity-60"
                  >
                    {pauseLoading ? "Updating…" : paused ? "Resume workspace" : "Pause workspace"}
                  </button>
                </div>

                <div className="rounded-lg border border-warning/30 px-4 py-4">
                  <div className="text-sm font-medium text-foreground">Delete Workspace</div>
                  <p className="mt-0.5 text-sm text-muted">
                    Permanently delete this workspace, including audience, campaigns, and content.
                  </p>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      className="mt-4 rounded-lg border border-warning/50 bg-warning/10 px-3.5 py-2 text-sm font-medium text-warning hover:bg-warning/15"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete workspace
                    </button>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <Field label={`Type "${form.organizationName}" to confirm`}>
                        <input
                          className={inputClass}
                          value={deleteConfirm}
                          onChange={(event) => setDeleteConfirm(event.target.value)}
                          placeholder={form.organizationName}
                        />
                      </Field>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={deleteLoading || deleteConfirm.trim() !== form.organizationName.trim()}
                          onClick={deleteWorkspace}
                          className="rounded-lg bg-warning px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {deleteLoading ? "Deleting…" : "Permanently delete"}
                        </button>
                        <button
                          type="button"
                          className="rounded-lg px-3.5 py-2 text-sm text-muted hover:text-foreground"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirm("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
