"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, Card, Field, PageHeader, inputClass } from "@/components/ui";
import type { WorkspaceEnvironmentId, WorkspaceSettings } from "@/lib/workspace-settings";
import {
  DATA_REGION_OPTIONS,
  ENVIRONMENT_META,
  WORKSPACE_TYPE_OPTIONS,
} from "@/lib/workspace-settings";

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

export function WorkspaceSettingsPage({ initial }: { initial: WorkspaceSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<WorkspaceSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

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

  function toggleEnvironmentEnabled(id: WorkspaceEnvironmentId, enabled: boolean) {
    setForm((prev) => {
      const next = {
        ...prev.environments[id],
        enabled,
      };
      if (!enabled && next.active) {
        return prev;
      }
      return {
        ...prev,
        environments: {
          ...prev.environments,
          [id]: next,
        },
      };
    });
  }

  async function copyWorkspaceId() {
    try {
      await navigator.clipboard.writeText(form.workspaceId);
      setCopiedId(true);
      window.setTimeout(() => setCopiedId(false), 2000);
    } catch {
      setError("Could not copy workspace ID.");
    }
  }

  async function saveSettings() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/settings/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceName: form.workspaceName,
        workspaceType: form.workspaceType,
        environments: form.environments,
        dataRegion: form.dataRegion,
      }),
    });

    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not save workspace settings.");
      return;
    }

    const data = (await response.json()) as WorkspaceSettings;
    setForm(data);
    setMessage("Workspace settings saved.");
    router.refresh();
  }

  return (
    <div className="min-h-full bg-background">
      <PageHeader
        title="Workspace"
        subtitle="Workspace identity, environments, and data residency."
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

        <SettingsSection title="Workspace" description="Core identifiers for this Visora workspace.">
          <Field label="Workspace Name">
            <input
              className={inputClass}
              value={form.workspaceName}
              onChange={(event) => setForm((prev) => ({ ...prev, workspaceName: event.target.value }))}
              placeholder="VISORA"
            />
          </Field>
          <Field label="Workspace ID">
            <div className="flex gap-2">
              <input className={inputClass} value={form.workspaceId} readOnly aria-readonly />
              <button
                type="button"
                onClick={copyWorkspaceId}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-background"
              >
                {copiedId ? <Check size={16} className="text-success" /> : <Copy size={16} />}
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
        </SettingsSection>

        <SettingsSection
          title="Environments"
          description="Enable environments and choose which one is active for SDK and API traffic."
        >
          <ul className="space-y-3">
            {(["development", "staging", "production"] as const).map((id) => {
              const meta = ENVIRONMENT_META[id];
              const env = form.environments[id];
              return (
                <li
                  key={id}
                  className={`rounded-lg border px-4 py-4 transition ${
                    env.active ? "border-primary/30 bg-primary/[0.04]" : "border-border"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{meta.label}</span>
                        {env.active ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted">{meta.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={env.enabled}
                          disabled={env.active}
                          onChange={(event) => toggleEnvironmentEnabled(id, event.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary"
                        />
                        Enabled
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="radio"
                          name="activeEnvironment"
                          checked={env.active}
                          disabled={!env.enabled}
                          onChange={() => setActiveEnvironment(id)}
                          className="h-4 w-4 border-border text-primary"
                        />
                        Set active
                      </label>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </SettingsSection>

        <SettingsSection
          title="Data Region"
          description="Where workspace data is stored and processed."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {DATA_REGION_OPTIONS.map((option) => {
              const selected = form.dataRegion === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, dataRegion: option.value }))}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-primary/30 bg-primary/[0.04] ring-1 ring-primary/20"
                      : "border-border hover:border-primary/20 hover:bg-background"
                  }`}
                >
                  <div className="text-sm font-semibold text-foreground">{option.label}</div>
                  <p className="mt-1 text-xs text-muted">
                    {option.value === "US"
                      ? "United States data centers"
                      : option.value === "EU"
                        ? "European Union data centers"
                        : "India data centers"}
                  </p>
                </button>
              );
            })}
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
