import type { SettingsPageKey } from "@/lib/settings-pages/types";

export const SETTINGS_AREA_PAGE_KEYS: Record<string, SettingsPageKey> = {
  "team-access": "team-access",
  "domains-sending": "domains-sending",
  "audience-consent": "audience-consent",
  "tracking-data": "tracking-data",
  webhooks: "webhooks",
  notifications: "notifications",
  security: "security",
  "billing-usage": "billing-usage",
  "developer-api": "developer-api",
  templates: "templates",
  integrations: "integrations",
  "channels-email": "channels-email",
  "channels-push": "channels-push",
  "channels-whatsapp": "channels-whatsapp",
  "channels-in-app": "channels-in-app",
  "channels-content-cards": "channels-content-cards",
};

export function getSettingsAreaPageKey(areaId: string): SettingsPageKey | undefined {
  return SETTINGS_AREA_PAGE_KEYS[areaId];
}
