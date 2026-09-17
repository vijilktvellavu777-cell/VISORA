"use client";

import { useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Card, Field, PageHeader, inputClass } from "@/components/ui";
import { useGeneralSettings } from "@/components/general-settings-provider";
import {
  SettingsFormField,
  SettingsInfoBanner,
  SettingsPageChrome,
} from "@/components/settings-page-chrome";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  INDUSTRY_OPTIONS,
  LANGUAGE_OPTIONS,
  TIME_FORMAT_OPTIONS,
  TIME_ZONE_OPTIONS,
  type GeneralSettings,
} from "@/lib/general-settings";
import { getSettingsAreaSectionLabel } from "@/lib/settings-area-sections";
import { formatTimeZoneLabel } from "@/lib/time-zone-labels";

const selectClass = `${inputClass} appearance-none bg-surface`;

function SettingsAlerts() {
  const { message, error } = useGeneralSettings();
  return (
    <>
      {message ? (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {error}
        </div>
      ) : null}
    </>
  );
}

function SaveBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { save, saving } = useGeneralSettings();
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      action={
        <Button type="button" onClick={() => save()}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      }
    />
  );
}

function OrganizationSection() {
  const { form, setForm, save, saving, message, error } = useGeneralSettings();

  function update<K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SettingsPageChrome
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "General", href: "/settings/general" },
        { label: "Organization" },
      ]}
      title="Organization"
      description="Manage your organization details and basic information."
      onSave={() => save()}
      saving={saving}
    >
      {message ? (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {error}
        </div>
      ) : null}
      <Card className="border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Organization Information</h2>
        <p className="mt-1 text-sm text-muted">
          These details will be used across your workspace and communications.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <SettingsFormField label="Organization Name" required>
            <input
              className={inputClass}
              value={form.organizationName}
              onChange={(event) => update("organizationName", event.target.value)}
            />
          </SettingsFormField>
          <SettingsFormField label="Website">
            <input
              className={inputClass}
              type="url"
              value={form.website}
              onChange={(event) => update("website", event.target.value)}
              placeholder="https://visora.world"
            />
          </SettingsFormField>
          <SettingsFormField label="Industry">
            <select
              className={selectClass}
              value={form.industry}
              onChange={(event) => update("industry", event.target.value)}
            >
              <option value="">Select industry</option>
              {INDUSTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "SaaS / Technology" ? "Technology" : option}
                </option>
              ))}
            </select>
          </SettingsFormField>
          <SettingsFormField label="Country">
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
          </SettingsFormField>
          <SettingsFormField label="Time Zone">
            <select
              className={selectClass}
              value={form.organizationTimeZone}
              onChange={(event) => update("organizationTimeZone", event.target.value)}
            >
              {TIME_ZONE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatTimeZoneLabel(option)}
                </option>
              ))}
            </select>
          </SettingsFormField>
          <SettingsFormField label="Default Language">
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
          </SettingsFormField>
          <SettingsFormField label="Organization ID">
            <input className={`${inputClass} bg-background text-muted`} readOnly value={form.organizationId} />
          </SettingsFormField>
        </div>
        <div className="mt-6">
          <SettingsInfoBanner>
            This information will be used in emails, reports, and across your VISORA workspace.
          </SettingsInfoBanner>
        </div>
      </Card>
    </SettingsPageChrome>
  );
}

function BrandingSection() {
  const { form, setForm } = useGeneralSettings();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onImageFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
    key: "logoUrl" | "faviconUrl",
  ) {
    const file = event.target.files?.[0];
    if (!file || file.size > 512_000) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") update(key, reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <SaveBar title="Branding" subtitle="Visual identity for your organization." />
      <div className="p-8">
        <SettingsAlerts />
        <Card className="space-y-4 p-6">
          <Field label="Organization Logo">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
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
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-background"
                  onClick={() => logoInputRef.current?.click()}
                >
                  Upload logo
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => onImageFileChange(event, "logoUrl")}
                />
              </div>
            </div>
          </Field>
          <Field label="Brand Name">
            <input
              className={inputClass}
              value={form.brandName}
              onChange={(event) => update("brandName", event.target.value)}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(event) => update("primaryColor", event.target.value)}
                  className="h-10 w-14 rounded-lg border border-border p-1"
                />
                <input
                  className={inputClass}
                  value={form.primaryColor}
                  onChange={(event) => update("primaryColor", event.target.value)}
                />
              </div>
            </Field>
            <Field label="Secondary Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(event) => update("secondaryColor", event.target.value)}
                  className="h-10 w-14 rounded-lg border border-border p-1"
                />
                <input
                  className={inputClass}
                  value={form.secondaryColor}
                  onChange={(event) => update("secondaryColor", event.target.value)}
                />
              </div>
            </Field>
          </div>
          <Field label="Favicon">
            <div className="flex flex-wrap items-center gap-3">
              <input
                className={inputClass}
                value={form.faviconUrl.startsWith("data:") ? "" : form.faviconUrl}
                onChange={(event) => update("faviconUrl", event.target.value)}
                placeholder="https://cdn.example.com/favicon.ico"
              />
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-background"
                onClick={() => faviconInputRef.current?.click()}
              >
                Upload
              </button>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => onImageFileChange(event, "faviconUrl")}
              />
            </div>
          </Field>
        </Card>
      </div>
    </>
  );
}

function LocalizationSection() {
  const { form, setForm } = useGeneralSettings();

  function update<K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <SaveBar title="Localization" subtitle="Language, time, and regional formats." />
      <div className="p-8">
        <SettingsAlerts />
        <Card className="space-y-4 p-6">
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
          <div className="grid gap-4 md:grid-cols-3">
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
            <Field label="Time Format">
              <select
                className={selectClass}
                value={form.timeFormat}
                onChange={(event) => update("timeFormat", event.target.value)}
              >
                {TIME_FORMAT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Currency">
              <select
                className={selectClass}
                value={form.currency}
                onChange={(event) => update("currency", event.target.value)}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>
      </div>
    </>
  );
}

function DangerZoneSection() {
  const {
    form,
    paused,
    pauseLoading,
    togglePause,
    deleteLoading,
    deleteConfirm,
    setDeleteConfirm,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteWorkspace,
  } = useGeneralSettings();

  return (
    <>
      <SaveBar title="Danger Zone" subtitle="Pause or permanently delete this workspace." />
      <div className="p-8">
        <SettingsAlerts />
        <Card className="border-warning/40 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-warning" size={20} />
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border px-4 py-4">
                <div>
                  <div className="text-sm font-medium text-foreground">Pause Workspace</div>
                  <p className="text-sm text-muted">Temporarily disable sending and campaigns.</p>
                </div>
                <button
                  type="button"
                  disabled={pauseLoading}
                  onClick={togglePause}
                  className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-background disabled:opacity-60"
                >
                  {pauseLoading ? "Updating…" : paused ? "Resume workspace" : "Pause workspace"}
                </button>
              </div>
              <div className="rounded-lg border border-warning/30 px-4 py-4">
                <div className="text-sm font-medium text-foreground">Delete Workspace</div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    className="mt-3 rounded-lg border border-warning/50 bg-warning/10 px-3.5 py-2 text-sm font-medium text-warning"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete workspace
                  </button>
                ) : (
                  <div className="mt-3 space-y-3">
                    <Field label={`Type "${form.organizationName}" to confirm`}>
                      <input
                        className={inputClass}
                        value={deleteConfirm}
                        onChange={(event) => setDeleteConfirm(event.target.value)}
                      />
                    </Field>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={deleteLoading || deleteConfirm.trim() !== form.organizationName.trim()}
                        onClick={deleteWorkspace}
                        className="rounded-lg bg-warning px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {deleteLoading ? "Deleting…" : "Permanently delete"}
                      </button>
                      <button
                        type="button"
                        className="px-3.5 py-2 text-sm text-muted"
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
        </Card>
      </div>
    </>
  );
}

export function GeneralSettingsSectionView({ section }: { section: string }) {
  switch (section) {
    case "organization":
      return <OrganizationSection />;
    case "branding":
      return <BrandingSection />;
    case "localization":
      return <LocalizationSection />;
    case "danger-zone":
      return <DangerZoneSection />;
    default:
      return (
        <PageHeader
          title={getSettingsAreaSectionLabel("general", section)}
          subtitle="This section is not available."
        />
      );
  }
}
