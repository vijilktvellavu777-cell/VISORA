"use client";

import { Check, Copy } from "lucide-react";
import { Button, Card, Field, PageHeader, inputClass } from "@/components/ui";
import { useWorkspaceSettings } from "@/components/workspace-settings-provider";
import type { WorkspaceEnvironmentId } from "@/lib/workspace-settings";
import {
  DATA_REGION_OPTIONS,
  DEFAULT_DATA_POLICY_OPTIONS,
  ENVIRONMENT_META,
  WORKSPACE_TYPE_OPTIONS,
} from "@/lib/workspace-settings";
import { getSettingsAreaSectionLabel } from "@/lib/settings-area-sections";

const selectClass = `${inputClass} appearance-none bg-surface`;

function Alerts() {
  const { message, error } = useWorkspaceSettings();
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
  const { save, saving } = useWorkspaceSettings();
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      action={
        <Button type="button" onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      }
    />
  );
}

function WorkspaceDetailsSection() {
  const { form, setForm, copiedId, copyWorkspaceId } = useWorkspaceSettings();
  return (
    <>
      <SaveBar title="Workspace Details" subtitle="Core workspace identifiers." />
      <div className="p-8">
        <Alerts />
        <Card className="space-y-4 p-6">
          <Field label="Workspace Name">
            <input
              className={inputClass}
              value={form.workspaceName}
              onChange={(event) => setForm((prev) => ({ ...prev, workspaceName: event.target.value }))}
            />
          </Field>
          <Field label="Workspace ID">
            <div className="flex gap-2">
              <input className={inputClass} readOnly value={form.workspaceId} />
              <button
                type="button"
                onClick={copyWorkspaceId}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm"
              >
                {copiedId ? <Check size={16} /> : <Copy size={16} />}
                {copiedId ? "Copied" : "Copy"}
              </button>
            </div>
          </Field>
          <Field label="Workspace Type">
            <select
              className={selectClass}
              value={form.workspaceType}
              onChange={(event) => setForm((prev) => ({ ...prev, workspaceType: event.target.value }))}
            >
              {WORKSPACE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Created Date">
            <input
              className={inputClass}
              readOnly
              value={new Date(form.createdAt).toLocaleString()}
            />
          </Field>
        </Card>
      </div>
    </>
  );
}

function EnvironmentsSection() {
  const { form, setForm } = useWorkspaceSettings();

  function setActiveEnvironment(id: WorkspaceEnvironmentId) {
    setForm((prev) => ({
      ...prev,
      environments: {
        development: {
          ...prev.environments.development,
          active: id === "development",
          enabled: id === "development" ? true : prev.environments.development.enabled,
        },
        staging: {
          ...prev.environments.staging,
          active: id === "staging",
          enabled: id === "staging" ? true : prev.environments.staging.enabled,
        },
        production: {
          ...prev.environments.production,
          active: id === "production",
          enabled: id === "production" ? true : prev.environments.production.enabled,
        },
      },
    }));
  }

  return (
    <>
      <SaveBar title="Environments" subtitle="Development, Staging, and Production." />
      <div className="p-8">
        <Alerts />
        <ul className="space-y-3">
          {(["development", "staging", "production"] as const).map((id) => {
            const meta = ENVIRONMENT_META[id];
            const env = form.environments[id];
            return (
              <li
                key={id}
                className={`rounded-lg border px-4 py-4 ${env.active ? "border-primary/30 bg-primary/[0.04]" : "border-border"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium">{meta.label}</div>
                    <p className="text-sm text-muted">{meta.description}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="activeEnvironment"
                      checked={env.active}
                      onChange={() => setActiveEnvironment(id)}
                    />
                    Set active
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function DataSettingsSection() {
  const { form, setForm } = useWorkspaceSettings();
  return (
    <>
      <SaveBar title="Data Settings" subtitle="Region, retention, and default policy." />
      <div className="p-8">
        <Alerts />
        <Card className="space-y-4 p-6">
          <Field label="Data Region">
            <div className="grid gap-3 sm:grid-cols-3">
              {DATA_REGION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, dataRegion: option.value }))}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    form.dataRegion === option.value
                      ? "border-primary/30 bg-primary/[0.04]"
                      : "border-border hover:bg-background"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Data Retention (days)">
            <input
              className={inputClass}
              type="number"
              min={30}
              value={form.dataRetentionDays}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dataRetentionDays: Number(event.target.value) || 365 }))
              }
            />
          </Field>
          <Field label="Default Data Policy">
            <select
              className={selectClass}
              value={form.defaultDataPolicy}
              onChange={(event) => setForm((prev) => ({ ...prev, defaultDataPolicy: event.target.value }))}
            >
              {DEFAULT_DATA_POLICY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </Card>
      </div>
    </>
  );
}

export function WorkspaceSettingsSectionView({ section }: { section: string }) {
  switch (section) {
    case "workspace-details":
      return <WorkspaceDetailsSection />;
    case "environments":
      return <EnvironmentsSection />;
    case "data-settings":
      return <DataSettingsSection />;
    default:
      return (
        <PageHeader
          title={getSettingsAreaSectionLabel("workspace", section)}
          subtitle="This section is not available."
        />
      );
  }
}
