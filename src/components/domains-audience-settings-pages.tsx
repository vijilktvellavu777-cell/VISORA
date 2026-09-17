"use client";

import Link from "next/link";
import { Field, inputClass } from "@/components/ui";
import {
  SettingsFormSection,
  SettingsToggleRow,
} from "@/components/settings-form-section";
import {
  SettingsPageShell,
  getArray,
  getBoolean,
  getObject,
  getString,
  getStringArray,
  setNestedForm,
} from "@/components/settings-page-shell";

export function DomainsSendingSettingsPage({ initial }: { initial: Record<string, unknown> }) {
  return (
    <SettingsPageShell
      pageKey="domains-sending"
      title="Domains & Sending"
      subtitle="Sending domains, tracking, DNS, and sender identities."
      initial={initial}
    >
      {(form, setForm) => {
        const dns = getObject(form.dns);
        const linkTracking = getObject(form.linkTracking);
        const sendingDomains = getArray(form.sendingDomains);
        const trackingDomains = getArray(form.trackingDomains);
        const senderIdentities = getArray(form.senderIdentities);

        return (
          <>
            <SettingsFormSection title="Sending Domains">
              {sendingDomains.map((item, index) => (
                <Field key={getString(item.id, String(index))} label={`Domain ${index + 1}`}>
                  <input
                    className={inputClass}
                    value={getString(item.domain)}
                    onChange={(event) => {
                      setForm((prev) => {
                        const next = [...getArray(prev.sendingDomains)];
                        next[index] = { ...next[index], domain: event.target.value };
                        return { ...prev, sendingDomains: next };
                      });
                    }}
                  />
                </Field>
              ))}
            </SettingsFormSection>

            <SettingsFormSection title="Tracking Domains">
              {trackingDomains.map((item, index) => (
                <Field key={getString(item.id, String(index))} label={`Tracking domain ${index + 1}`}>
                  <input
                    className={inputClass}
                    value={getString(item.domain)}
                    onChange={(event) => {
                      setForm((prev) => {
                        const next = [...getArray(prev.trackingDomains)];
                        next[index] = { ...next[index], domain: event.target.value };
                        return { ...prev, trackingDomains: next };
                      });
                    }}
                  />
                </Field>
              ))}
            </SettingsFormSection>

            <SettingsFormSection title="DNS Records" description="Expected records for deliverability.">
              <Field label="SPF">
                <textarea
                  className={`${inputClass} min-h-[72px] font-mono text-xs`}
                  value={getString(dns.spf)}
                  onChange={(event) =>
                    setNestedForm(setForm, "dns", (current) => ({ ...current, spf: event.target.value }))
                  }
                />
              </Field>
              <Field label="DKIM">
                <input
                  className={inputClass}
                  value={getString(dns.dkim)}
                  onChange={(event) =>
                    setNestedForm(setForm, "dns", (current) => ({ ...current, dkim: event.target.value }))
                  }
                />
              </Field>
              <Field label="DMARC">
                <textarea
                  className={`${inputClass} min-h-[72px] font-mono text-xs`}
                  value={getString(dns.dmarc)}
                  onChange={(event) =>
                    setNestedForm(setForm, "dns", (current) => ({ ...current, dmarc: event.target.value }))
                  }
                />
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="Link Tracking">
              <SettingsToggleRow
                label="Enable link tracking"
                checked={getBoolean(linkTracking.enabled)}
                onChange={(checked) =>
                  setNestedForm(setForm, "linkTracking", (current) => ({ ...current, enabled: checked }))
                }
              />
              <Field label="Tracking domain">
                <input
                  className={inputClass}
                  value={getString(linkTracking.domain)}
                  onChange={(event) =>
                    setNestedForm(setForm, "linkTracking", (current) => ({
                      ...current,
                      domain: event.target.value,
                    }))
                  }
                />
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="Sender Identities">
              {senderIdentities.map((identity, index) => (
                <div key={getString(identity.id, String(index))} className="grid gap-3 md:grid-cols-2">
                  <Field label="Display name">
                    <input
                      className={inputClass}
                      value={getString(identity.name)}
                      onChange={(event) => {
                        setForm((prev) => {
                          const next = [...getArray(prev.senderIdentities)];
                          next[index] = { ...next[index], name: event.target.value };
                          return { ...prev, senderIdentities: next };
                        });
                      }}
                    />
                  </Field>
                  <Field label="Email address">
                    <input
                      className={inputClass}
                      type="email"
                      value={getString(identity.email)}
                      onChange={(event) => {
                        setForm((prev) => {
                          const next = [...getArray(prev.senderIdentities)];
                          next[index] = { ...next[index], email: event.target.value };
                          return { ...prev, senderIdentities: next };
                        });
                      }}
                    />
                  </Field>
                </div>
              ))}
            </SettingsFormSection>
          </>
        );
      }}
    </SettingsPageShell>
  );
}

export function AudienceConsentSettingsPage({ initial }: { initial: Record<string, unknown> }) {
  const channelLabels: Record<string, string> = {
    email: "Email",
    push: "Push",
    whatsapp: "WhatsApp",
    inApp: "In-App",
    contentCards: "Content Cards",
  };

  return (
    <SettingsPageShell
      pageKey="audience-consent"
      title="Audience & Consent"
      subtitle="Consent, channel preferences, and subscription controls."
      initial={initial}
    >
      {(form, setForm) => {
        const consent = getObject(form.consentManagement);
        const channels = getObject(form.channelPreferences);
        const suppression = getObject(form.suppression);
        const unsubscribe = getObject(form.unsubscribe);
        const preferenceCenter = getObject(form.preferenceCenter);
        const subscriptionTypes = getStringArray(form.subscriptionTypes);
        const consentLogs = getArray(form.consentLogs);

        return (
          <>
            <SettingsFormSection title="Consent Management">
              <SettingsToggleRow
                label="Enable consent management"
                checked={getBoolean(consent.enabled)}
                onChange={(checked) =>
                  setNestedForm(setForm, "consentManagement", (c) => ({ ...c, enabled: checked }))
                }
              />
              <SettingsToggleRow
                label="Require explicit opt-in"
                checked={getBoolean(consent.requireOptIn)}
                onChange={(checked) =>
                  setNestedForm(setForm, "consentManagement", (c) => ({ ...c, requireOptIn: checked }))
                }
              />
            </SettingsFormSection>

            <SettingsFormSection title="Channel Preferences">
              {Object.entries(channelLabels).map(([key, label]) => (
                <SettingsToggleRow
                  key={key}
                  label={label}
                  checked={getBoolean(channels[key])}
                  onChange={(checked) =>
                    setNestedForm(setForm, "channelPreferences", (c) => ({ ...c, [key]: checked }))
                  }
                />
              ))}
            </SettingsFormSection>

            <SettingsFormSection title="Subscription Types">
              <Field label="Types (one per line)">
                <textarea
                  className={`${inputClass} min-h-[120px]`}
                  value={subscriptionTypes.join("\n")}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      subscriptionTypes: event.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="Suppression">
              <SettingsToggleRow
                label="Sync suppression lists"
                description="Keep global suppressions aligned with channel opt-outs."
                checked={getBoolean(suppression.syncSuppressionLists)}
                onChange={(checked) =>
                  setNestedForm(setForm, "suppression", (s) => ({ ...s, syncSuppressionLists: checked }))
                }
              />
              <Link href="/audience/suppression" className="text-sm text-primary hover:underline">
                Manage suppression lists →
              </Link>
            </SettingsFormSection>

            <SettingsFormSection title="Unsubscribe">
              <SettingsToggleRow
                label="One-click unsubscribe (RFC 8058)"
                checked={getBoolean(unsubscribe.oneClickEnabled)}
                onChange={(checked) =>
                  setNestedForm(setForm, "unsubscribe", (u) => ({ ...u, oneClickEnabled: checked }))
                }
              />
              <SettingsToggleRow
                label="Custom unsubscribe footer"
                checked={getBoolean(unsubscribe.customFooter)}
                onChange={(checked) =>
                  setNestedForm(setForm, "unsubscribe", (u) => ({ ...u, customFooter: checked }))
                }
              />
            </SettingsFormSection>

            <SettingsFormSection title="Preference Center">
              <SettingsToggleRow
                label="Hosted preference center"
                checked={getBoolean(preferenceCenter.enabled)}
                onChange={(checked) =>
                  setNestedForm(setForm, "preferenceCenter", (p) => ({ ...p, enabled: checked }))
                }
              />
              <Field label="Preference center URL">
                <input
                  className={inputClass}
                  value={getString(preferenceCenter.url)}
                  onChange={(event) =>
                    setNestedForm(setForm, "preferenceCenter", (p) => ({ ...p, url: event.target.value }))
                  }
                  placeholder="https://preferences.example.com"
                />
              </Field>
            </SettingsFormSection>

            <SettingsFormSection title="Consent Logs">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border bg-background text-muted">
                    <tr>
                      {["Time", "User", "Channel", "Action"].map((h) => (
                        <th key={h} className="px-4 py-2.5 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consentLogs.map((log, index) => (
                      <tr key={getString(log.id, String(index))} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">{new Date(getString(log.at)).toLocaleString()}</td>
                        <td className="px-4 py-3">{getString(log.user)}</td>
                        <td className="px-4 py-3">{getString(log.channel)}</td>
                        <td className="px-4 py-3">{getString(log.action)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SettingsFormSection>
          </>
        );
      }}
    </SettingsPageShell>
  );
}
