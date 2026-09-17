"use client";

import Link from "next/link";
import { Field, inputClass } from "@/components/ui";
import {
  SettingsDataTable,
  SettingsFormSection,
  SettingsToggleRow,
  settingsSelectClass,
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

function ApiKeysTable({ apiKeys }: { apiKeys: ApiKeySummary[] }) {
  if (apiKeys.length === 0) {
    return (
      <p className="text-sm text-muted">
        No API keys yet.{" "}
        <Link href="/developer" className="text-primary hover:underline">
          Create keys in Developer →
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

export function TrackingDataSettingsPage({ initial }: { initial: Record<string, unknown> }) {
  const apiKeys = (initial.apiKeys as ApiKeySummary[] | undefined) ?? [];

  return (
    <SettingsPageShell
      pageKey="tracking-data"
      title="Tracking & Data"
      subtitle="SDK, events, identifiers, and retention."
      initial={initial}
    >
      {(form, setForm) => {
        const sdk = getObject(form.sdk);
        return (
          <>
            <SettingsFormSection title="SDK">
              <SettingsToggleRow
                label="Enable Visora SDK"
                checked={getBoolean(sdk.enabled)}
                onChange={(checked) => setNestedForm(setForm, "sdk", (s) => ({ ...s, enabled: checked }))}
              />
              <Field label="App identifier">
                <input
                  className={inputClass}
                  value={getString(sdk.appIdentifier)}
                  onChange={(event) =>
                    setNestedForm(setForm, "sdk", (s) => ({ ...s, appIdentifier: event.target.value }))
                  }
                />
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="API Keys">
              <ApiKeysTable apiKeys={apiKeys} />
            </SettingsFormSection>

            <SettingsFormSection title="Events">
              <SettingsToggleRow
                label="Track custom events"
                checked={getBoolean(form.trackEvents)}
                onChange={(checked) => setForm((prev) => ({ ...prev, trackEvents: checked }))}
              />
            </SettingsFormSection>

            <SettingsFormSection title="Attributes">
              <SettingsToggleRow
                label="Track user attributes"
                checked={getBoolean(form.trackAttributes)}
                onChange={(checked) => setForm((prev) => ({ ...prev, trackAttributes: checked }))}
              />
            </SettingsFormSection>

            <SettingsFormSection title="Sessions">
              <SettingsToggleRow
                label="Track sessions"
                checked={getBoolean(form.trackSessions)}
                onChange={(checked) => setForm((prev) => ({ ...prev, trackSessions: checked }))}
              />
            </SettingsFormSection>

            <SettingsFormSection title="Page Views">
              <SettingsToggleRow
                label="Track page views (web)"
                checked={getBoolean(form.trackPageViews)}
                onChange={(checked) => setForm((prev) => ({ ...prev, trackPageViews: checked }))}
              />
            </SettingsFormSection>

            <SettingsFormSection title="Visitor ID">
              <Field label="Strategy">
                <select
                  className={settingsSelectClass}
                  value={getString(form.visitorIdStrategy, "anonymous_cookie")}
                  onChange={(event) => setForm((prev) => ({ ...prev, visitorIdStrategy: event.target.value }))}
                >
                  <option value="anonymous_cookie">Anonymous cookie</option>
                  <option value="device_id">Device ID</option>
                </select>
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="User ID">
              <Field label="Strategy">
                <select
                  className={settingsSelectClass}
                  value={getString(form.userIdStrategy, "external_id")}
                  onChange={(event) => setForm((prev) => ({ ...prev, userIdStrategy: event.target.value }))}
                >
                  <option value="external_id">External ID</option>
                  <option value="email">Email</option>
                </select>
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="Data Retention">
              <Field label="Retention period (days)">
                <input
                  className={inputClass}
                  type="number"
                  min={30}
                  value={getNumber(form.dataRetentionDays, 365)}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, dataRetentionDays: Number(event.target.value) || 365 }))
                  }
                />
              </Field>
            </SettingsFormSection>
          </>
        );
      }}
    </SettingsPageShell>
  );
}

export function WebhooksSettingsPage({ initial }: { initial: Record<string, unknown> }) {
  return (
    <SettingsPageShell
      pageKey="webhooks"
      title="Webhooks"
      subtitle="Outbound HTTP notifications for workspace events."
      initial={initial}
    >
      {(form, setForm) => {
        const events = getObject(form.events);
        const deliveryHistory = getArray(form.deliveryHistory);
        const responseLogs = getArray(form.responseLogs);

        return (
          <>
            <SettingsFormSection title="Endpoint">
              <Field label="Webhook URL">
                <input
                  className={inputClass}
                  type="url"
                  value={getString(form.endpoint)}
                  onChange={(event) => setForm((prev) => ({ ...prev, endpoint: event.target.value }))}
                  placeholder="https://api.example.com/visora/webhook"
                />
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="Secret">
              <Field label="Signing secret">
                <input
                  className={inputClass}
                  type="password"
                  value={getString(form.secret)}
                  onChange={(event) => setForm((prev) => ({ ...prev, secret: event.target.value }))}
                  placeholder="whsec_..."
                />
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="Events">
              {[
                ["campaignCompleted", "Campaign completed"],
                ["campaignFailed", "Campaign failed"],
                ["userUpdated", "User updated"],
                ["segmentUpdated", "Segment updated"],
              ].map(([key, label]) => (
                <SettingsToggleRow
                  key={key}
                  label={label}
                  checked={getBoolean(events[key])}
                  onChange={(checked) =>
                    setNestedForm(setForm, "events", (e) => ({ ...e, [key]: checked }))
                  }
                />
              ))}
            </SettingsFormSection>

            <SettingsFormSection title="Delivery History">
              <SettingsDataTable
                columns={["Time", "Event", "Status"]}
                rows={deliveryHistory.map((row, index) => [
                  getString(row.at) ? new Date(getString(row.at)).toLocaleString() : "—",
                  getString(row.event),
                  getString(row.status),
                ])}
                emptyMessage="Deliveries will appear here after your endpoint receives events."
              />
            </SettingsFormSection>

            <SettingsFormSection title="Retry Policy">
              <Field label="Policy">
                <select
                  className={settingsSelectClass}
                  value={getString(form.retryPolicy, "exponential")}
                  onChange={(event) => setForm((prev) => ({ ...prev, retryPolicy: event.target.value }))}
                >
                  <option value="exponential">Exponential backoff</option>
                  <option value="linear">Linear backoff</option>
                  <option value="none">No retries</option>
                </select>
              </Field>
              <Field label="Max retries">
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={10}
                  value={getNumber(form.maxRetries, 5)}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, maxRetries: Number(event.target.value) }))
                  }
                />
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="Response Logs">
              <SettingsDataTable
                columns={["Time", "Status", "Preview"]}
                rows={responseLogs.map((row) => [
                  getString(row.at) ? new Date(getString(row.at)).toLocaleString() : "—",
                  String(getNumber(row.statusCode)),
                  getString(row.bodyPreview),
                ])}
                emptyMessage="Response bodies from delivery attempts will show here."
              />
            </SettingsFormSection>
          </>
        );
      }}
    </SettingsPageShell>
  );
}
