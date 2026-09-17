"use client";

import Link from "next/link";
import { Field, inputClass } from "@/components/ui";
import {
  SettingsDataTable,
  SettingsFormSection,
  SettingsToggleRow,
} from "@/components/settings-form-section";
import {
  SettingsPageShell,
  getArray,
  getBoolean,
  getNumber,
  getObject,
  getString,
  setNestedForm,
} from "@/components/settings-page-shell";
import type { ApiKeySummary } from "@/lib/settings-pages/types";

const NOTIFICATION_ITEMS = [
  ["campaignCompleted", "Campaign Completed"],
  ["campaignFailed", "Campaign Failed"],
  ["deliveryIssues", "Delivery Issues"],
  ["integrationErrors", "Integration Errors"],
  ["billingAlerts", "Billing Alerts"],
  ["securityAlerts", "Security Alerts"],
  ["systemUpdates", "System Updates"],
] as const;

export function NotificationsSettingsPage({ initial }: { initial: Record<string, unknown> }) {
  return (
    <SettingsPageShell
      pageKey="notifications"
      title="Notifications"
      subtitle="Email and in-app alerts for your team."
      initial={initial}
    >
      {(form, setForm) => (
        <SettingsFormSection title="Alert preferences" description="Choose which events notify your team.">
          {NOTIFICATION_ITEMS.map(([key, label]) => (
            <SettingsToggleRow
              key={key}
              label={label}
              checked={getBoolean(form[key])}
              onChange={(checked) => setForm((prev) => ({ ...prev, [key]: checked }))}
            />
          ))}
        </SettingsFormSection>
      )}
    </SettingsPageShell>
  );
}

function ApiKeysBlock({ apiKeys }: { apiKeys: ApiKeySummary[] }) {
  return (
    <SettingsFormSection title="API Keys">
      <ApiKeysTable apiKeys={apiKeys} />
    </SettingsFormSection>
  );
}

function ApiKeysTable({ apiKeys }: { apiKeys: ApiKeySummary[] }) {
  if (apiKeys.length === 0) {
    return (
      <p className="text-sm text-muted">
        No API keys.{" "}
        <Link href="/developer" className="text-primary hover:underline">
          Open Developer hub →
        </Link>
      </p>
    );
  }
  return (
    <SettingsDataTable
      columns={["Name", "Key", "Type"]}
      rows={apiKeys.map((key) => [key.name, key.keyPreview, key.kind])}
    />
  );
}

export function SecuritySettingsPage({ initial }: { initial: Record<string, unknown> }) {
  const apiKeys = (initial.apiKeys as ApiKeySummary[] | undefined) ?? [];

  return (
    <SettingsPageShell
      pageKey="security"
      title="Security"
      subtitle="Authentication, access control, and monitoring."
      initial={initial}
    >
      {(form, setForm) => {
        const sessions = getArray(form.sessions);
        const accessLogs = getArray(form.accessLogs);
        const auditLogs = getArray(form.auditLogs);

        return (
          <>
            <SettingsFormSection title="Password">
              <Field label="New password">
                <input className={inputClass} type="password" placeholder="••••••••" disabled />
              </Field>
              <Field label="Confirm password">
                <input className={inputClass} type="password" placeholder="••••••••" disabled />
              </Field>
              <p className="text-xs text-muted">Password changes will be enabled with your identity provider.</p>
            </SettingsFormSection>

            <SettingsFormSection title="Two-Factor Authentication">
              <SettingsToggleRow
                label="Require 2FA for all members"
                checked={getBoolean(form.twoFactorEnabled)}
                onChange={(checked) => setForm((prev) => ({ ...prev, twoFactorEnabled: checked }))}
              />
            </SettingsFormSection>

            <SettingsFormSection title="Sessions">
              <SettingsDataTable
                columns={["Device", "Location", "Last active", ""]}
                rows={sessions.map((s) => [
                  getString(s.device),
                  getString(s.location),
                  new Date(getString(s.lastActive)).toLocaleString(),
                  getBoolean(s.current) ? "Current" : "",
                ])}
              />
            </SettingsFormSection>

            <ApiKeysBlock apiKeys={apiKeys} />

            <SettingsFormSection title="Access Logs">
              <SettingsDataTable
                columns={["Time", "Actor", "Action"]}
                rows={accessLogs.map((log) => [
                  new Date(getString(log.at)).toLocaleString(),
                  getString(log.actor),
                  getString(log.action),
                ])}
              />
            </SettingsFormSection>

            <SettingsFormSection title="Audit Logs">
              <SettingsDataTable
                columns={["Time", "Actor", "Action"]}
                rows={auditLogs.map((log) => [
                  new Date(getString(log.at)).toLocaleString(),
                  getString(log.actor),
                  getString(log.action),
                ])}
              />
            </SettingsFormSection>

            <SettingsFormSection title="IP Restrictions">
              <SettingsToggleRow
                label="Restrict access by IP"
                checked={getBoolean(form.ipRestrictionsEnabled)}
                onChange={(checked) => setForm((prev) => ({ ...prev, ipRestrictionsEnabled: checked }))}
              />
              <Field label="Allowed IPs (CIDR, one per line)">
                <textarea
                  className={`${inputClass} min-h-[100px] font-mono text-xs`}
                  value={getString(form.allowedIps)}
                  onChange={(event) => setForm((prev) => ({ ...prev, allowedIps: event.target.value }))}
                  placeholder="203.0.113.0/24"
                />
              </Field>
            </SettingsFormSection>
          </>
        );
      }}
    </SettingsPageShell>
  );
}

const USAGE_CHANNELS = [
  ["emails", "Emails"],
  ["push", "Push"],
  ["whatsapp", "WhatsApp"],
  ["inApp", "In-App"],
  ["contentCards", "Content Cards"],
] as const;

export function BillingUsageSettingsPage({ initial }: { initial: Record<string, unknown> }) {
  return (
    <SettingsPageShell
      pageKey="billing-usage"
      title="Billing & Usage"
      subtitle="Plan, consumption, invoices, and payment."
      initial={initial}
    >
      {(form, setForm) => {
        const usage = getObject(form.usage);
        const limits = getObject(form.limits);

        return (
          <>
            <SettingsFormSection title="Current Plan">
              <Field label="Plan">
                <select
                  className={inputClass}
                  value={getString(form.currentPlan, "growth")}
                  onChange={(event) => setForm((prev) => ({ ...prev, currentPlan: event.target.value }))}
                >
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="Usage">
              <ul className="space-y-4">
                {USAGE_CHANNELS.map(([key, label]) => {
                  const used = getNumber(usage[key]);
                  const limit = getNumber(limits[key], 1);
                  const pct = Math.min(100, Math.round((used / limit) * 100));
                  return (
                    <li key={key}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-foreground">{label}</span>
                        <span className="text-muted">
                          {used.toLocaleString()} / {limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-background">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </SettingsFormSection>

            <SettingsFormSection title="Limits">
              {USAGE_CHANNELS.map(([key, label]) => (
                <Field key={key} label={`${label} monthly limit`}>
                  <input
                    className={inputClass}
                    type="number"
                    min={0}
                    value={getNumber(limits[key])}
                    onChange={(event) =>
                      setNestedForm(setForm, "limits", (l) => ({
                        ...l,
                        [key]: Number(event.target.value),
                      }))
                    }
                  />
                </Field>
              ))}
            </SettingsFormSection>

            <SettingsFormSection title="Invoices">
              <p className="text-sm text-muted">Invoice history and PDF downloads will appear here.</p>
            </SettingsFormSection>

            <SettingsFormSection title="Payment Method">
              <p className="text-sm text-foreground">
                {getString(form.paymentMethodBrand, "Card")} ending in {getString(form.paymentMethodLast4, "4242")}
              </p>
              <button type="button" className="mt-2 text-sm text-primary hover:underline">
                Update payment method
              </button>
            </SettingsFormSection>

            <SettingsFormSection title="Upgrade / Downgrade">
              <p className="text-sm text-muted">
                Compare plans and change subscription tier. Contact sales for enterprise limits.
              </p>
              <button type="button" className="mt-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white">
                View plans
              </button>
            </SettingsFormSection>
          </>
        );
      }}
    </SettingsPageShell>
  );
}

const SDK_ITEMS = [
  ["web", "Web"],
  ["android", "Android"],
  ["ios", "iOS"],
  ["flutter", "Flutter"],
] as const;

export function DeveloperApiSettingsPage({ initial }: { initial: Record<string, unknown> }) {
  const apiKeys = (initial.apiKeys as ApiKeySummary[] | undefined) ?? [];

  return (
    <SettingsPageShell
      pageKey="developer-api"
      title="Developer"
      subtitle="API keys, SDKs, and API reference."
      initial={initial}
    >
      {(form, setForm) => {
        const sdks = getObject(form.sdks);
        const docsBase = getString(form.docsBaseUrl, "https://docs.visora.app");

        return (
          <>
            <ApiKeysBlock apiKeys={apiKeys} />

            <SettingsFormSection title="SDKs">
              {SDK_ITEMS.map(([key, label]) => {
                const sdk = getObject(sdks[key]);
                return (
                  <SettingsToggleRow
                    key={key}
                    label={label}
                    description={getBoolean(sdk.installed) ? "Installed in this workspace" : "Not configured"}
                    checked={getBoolean(sdk.installed)}
                    onChange={(checked) =>
                      setNestedForm(setForm, "sdks", (all) => ({
                        ...all,
                        [key]: { installed: checked },
                      }))
                    }
                  />
                );
              })}
            </SettingsFormSection>

            {[
              ["API Documentation", `${docsBase}`],
              ["Event API", `${docsBase}/events`],
              ["User API", `${docsBase}/users`],
              ["Campaign API", `${docsBase}/campaigns`],
              ["Webhooks", `${docsBase}/webhooks`],
            ].map(([title, href]) => (
              <SettingsFormSection key={title} title={title}>
                <a href={href} className="text-sm text-primary hover:underline" target="_blank" rel="noreferrer">
                  {href}
                </a>
              </SettingsFormSection>
            ))}
          </>
        );
      }}
    </SettingsPageShell>
  );
}
