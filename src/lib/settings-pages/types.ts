export const SETTINGS_PAGE_KEYS = [
  "team-access",
  "domains-sending",
  "audience-consent",
  "tracking-data",
  "webhooks",
  "notifications",
  "security",
  "billing-usage",
  "developer-api",
  "templates",
  "integrations",
  "channels-email",
  "channels-push",
  "channels-whatsapp",
  "channels-in-app",
  "channels-content-cards",
] as const;

export type SettingsPageKey = (typeof SETTINGS_PAGE_KEYS)[number];

export function isSettingsPageKey(value: string): value is SettingsPageKey {
  return (SETTINGS_PAGE_KEYS as readonly string[]).includes(value);
}

export type ApiKeySummary = {
  id: string;
  name: string;
  keyPreview: string;
  kind: string;
};
