import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Code2,
  CreditCard,
  Globe,
  LayoutTemplate,
  Plug,
  Radio,
  Shield,
  SlidersHorizontal,
  UserCheck,
  Users,
  Webhook,
  Workflow,
} from "lucide-react";

export type SettingsAreaSection = {
  slug: string;
  label: string;
};

export type SettingsAreaConfig = {
  id: string;
  title: string;
  icon: LucideIcon;
  basePath: string;
  sections: SettingsAreaSection[];
};

export const SETTINGS_AREAS: Record<string, SettingsAreaConfig> = {
  general: {
    id: "general",
    title: "General",
    icon: SlidersHorizontal,
    basePath: "/settings/general",
    sections: [
      { slug: "organization", label: "Organization" },
      { slug: "branding", label: "Branding" },
      { slug: "localization", label: "Localization" },
      { slug: "danger-zone", label: "Danger Zone" },
    ],
  },
  workspace: {
    id: "workspace",
    title: "Workspace",
    icon: Building2,
    basePath: "/settings/workspace",
    sections: [
      { slug: "workspace-details", label: "Workspace Details" },
      { slug: "environments", label: "Environments" },
      { slug: "data-settings", label: "Data Settings" },
    ],
  },
  "team-access": {
    id: "team-access",
    title: "Team & Access",
    icon: Users,
    basePath: "/settings/team-access",
    sections: [
      { slug: "team-members", label: "Team Members" },
      { slug: "roles", label: "Roles" },
      { slug: "permissions", label: "Permissions" },
      { slug: "audit-logs", label: "Audit Logs" },
    ],
  },
  "channels-email": {
    id: "channels-email",
    title: "Email",
    icon: Radio,
    basePath: "/settings/channels/email",
    sections: [
      { slug: "provider", label: "Provider" },
      { slug: "sending-domains", label: "Sending Domains" },
      { slug: "sender-identities", label: "Sender Identities" },
      { slug: "tracking", label: "Tracking" },
      { slug: "compliance", label: "Compliance" },
    ],
  },
  "channels-push": {
    id: "channels-push",
    title: "Push Notifications",
    icon: Radio,
    basePath: "/settings/channels/push",
    sections: [
      { slug: "platforms", label: "Platforms" },
      { slug: "applications", label: "Applications" },
      { slug: "providers", label: "Providers" },
      { slug: "device-tokens", label: "Device Tokens" },
      { slug: "tracking", label: "Tracking" },
      { slug: "settings", label: "Settings" },
    ],
  },
  "channels-whatsapp": {
    id: "channels-whatsapp",
    title: "WhatsApp",
    icon: Radio,
    basePath: "/settings/channels/whatsapp",
    sections: [
      { slug: "meta-connection", label: "Meta Connection" },
      { slug: "phone-numbers", label: "Phone Numbers" },
      { slug: "message-templates", label: "Message Templates" },
      { slug: "media", label: "Media" },
      { slug: "consent", label: "Consent" },
      { slug: "tracking", label: "Tracking" },
    ],
  },
  "channels-in-app": {
    id: "channels-in-app",
    title: "In-App Messages",
    icon: Radio,
    basePath: "/settings/channels/in-app",
    sections: [
      { slug: "sdk", label: "SDK" },
      { slug: "applications", label: "Applications" },
      { slug: "display", label: "Display" },
      { slug: "behavior", label: "Behavior" },
      { slug: "tracking", label: "Tracking" },
    ],
  },
  "channels-content-cards": {
    id: "channels-content-cards",
    title: "Content Cards",
    icon: Radio,
    basePath: "/settings/channels/content-cards",
    sections: [
      { slug: "sdk", label: "SDK" },
      { slug: "applications", label: "Applications" },
      { slug: "feed", label: "Feed" },
      { slug: "display", label: "Display" },
      { slug: "tracking", label: "Tracking" },
    ],
  },
  "domains-sending": {
    id: "domains-sending",
    title: "Domains & Sending",
    icon: Globe,
    basePath: "/settings/domains-sending",
    sections: [
      { slug: "sending-domains", label: "Sending Domains" },
      { slug: "dns", label: "DNS" },
      { slug: "sender-identities", label: "Sender Identities" },
      { slug: "link-tracking", label: "Link Tracking" },
    ],
  },
  "audience-consent": {
    id: "audience-consent",
    title: "Audience & Consent",
    icon: UserCheck,
    basePath: "/settings/audience-consent",
    sections: [
      { slug: "consent-management", label: "Consent Management" },
      { slug: "subscription-types", label: "Subscription Types" },
      { slug: "preference-center", label: "Preference Center" },
      { slug: "suppression", label: "Suppression" },
      { slug: "consent-logs", label: "Consent Logs" },
    ],
  },
  "tracking-data": {
    id: "tracking-data",
    title: "Tracking & Data",
    icon: Workflow,
    basePath: "/settings/tracking-data",
    sections: [
      { slug: "sdk", label: "SDK" },
      { slug: "identity", label: "Identity" },
      { slug: "events", label: "Events" },
      { slug: "user-attributes", label: "User Attributes" },
      { slug: "sessions", label: "Sessions" },
      { slug: "page-views", label: "Page Views" },
      { slug: "data-retention", label: "Data Retention" },
    ],
  },
  templates: {
    id: "templates",
    title: "Templates",
    icon: LayoutTemplate,
    basePath: "/settings/templates",
    sections: [
      { slug: "email-templates", label: "Email Templates" },
      { slug: "push-templates", label: "Push Templates" },
      { slug: "whatsapp-templates", label: "WhatsApp Templates" },
      { slug: "in-app-templates", label: "In-App Templates" },
      { slug: "content-card-templates", label: "Content Card Templates" },
    ],
  },
  integrations: {
    id: "integrations",
    title: "Integrations",
    icon: Plug,
    basePath: "/settings/integrations",
    sections: [
      { slug: "messaging", label: "Messaging" },
      { slug: "crm", label: "CRM" },
      { slug: "analytics", label: "Analytics" },
      { slug: "data", label: "Data" },
      { slug: "connected-apps", label: "Connected Apps" },
    ],
  },
  webhooks: {
    id: "webhooks",
    title: "Webhooks",
    icon: Webhook,
    basePath: "/settings/webhooks",
    sections: [
      { slug: "endpoints", label: "Endpoints" },
      { slug: "events", label: "Events" },
      { slug: "security", label: "Security" },
      { slug: "delivery-logs", label: "Delivery Logs" },
    ],
  },
  notifications: {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    basePath: "/settings/notifications",
    sections: [
      { slug: "campaign-notifications", label: "Campaign Notifications" },
      { slug: "system-notifications", label: "System Notifications" },
      { slug: "usage-notifications", label: "Usage Notifications" },
      { slug: "security-notifications", label: "Security Notifications" },
    ],
  },
  security: {
    id: "security",
    title: "Security",
    icon: Shield,
    basePath: "/settings/security",
    sections: [
      { slug: "account-security", label: "Account Security" },
      { slug: "api-security", label: "API Security" },
      { slug: "access-control", label: "Access Control" },
      { slug: "audit-logs", label: "Audit Logs" },
    ],
  },
  "billing-usage": {
    id: "billing-usage",
    title: "Billing & Usage",
    icon: CreditCard,
    basePath: "/settings/billing-usage",
    sections: [
      { slug: "plan", label: "Plan" },
      { slug: "usage", label: "Usage" },
      { slug: "limits", label: "Limits" },
      { slug: "billing", label: "Billing" },
      { slug: "usage-history", label: "Usage History" },
    ],
  },
  "developer-api": {
    id: "developer-api",
    title: "Developer",
    icon: Code2,
    basePath: "/settings/developer-api",
    sections: [
      { slug: "api", label: "API" },
      { slug: "sdk", label: "SDK" },
      { slug: "events-api", label: "Events API" },
      { slug: "user-api", label: "User API" },
      { slug: "developer-tools", label: "Developer Tools" },
    ],
  },
};

export function getSettingsArea(areaId: string): SettingsAreaConfig | undefined {
  return SETTINGS_AREAS[areaId];
}

export function getSettingsAreaSectionLabel(areaId: string, sectionSlug: string): string {
  const area = SETTINGS_AREAS[areaId];
  return area?.sections.find((section) => section.slug === sectionSlug)?.label ?? sectionSlug;
}

export function getDefaultSectionPath(areaId: string): string {
  const area = SETTINGS_AREAS[areaId];
  if (!area || area.sections.length === 0) return area?.basePath ?? "/settings";
  return `${area.basePath}/${area.sections[0].slug}`;
}

/** Field outline labels shown on generic section pages (from product map). */
export const SETTINGS_SECTION_FIELD_OUTLINES: Record<string, Record<string, string[]>> = {
  general: {
    organization: ["Organization Name", "Website", "Industry", "Country", "Time Zone", "Default Language"],
    branding: ["Organization Logo", "Brand Name", "Primary Color", "Secondary Color", "Favicon"],
    localization: ["Default Language", "Default Time Zone", "Date Format", "Time Format", "Currency"],
    "danger-zone": ["Pause Workspace", "Delete Workspace"],
  },
  workspace: {
    "workspace-details": ["Workspace Name", "Workspace ID", "Workspace Type", "Created Date"],
    environments: ["Development", "Staging", "Production"],
    "data-settings": ["Data Region", "Data Retention", "Default Data Policy"],
  },
};

export const SETTINGS_HUB_NAV_ICONS = {
  general: SlidersHorizontal,
  workspace: Building2,
  "team-access": Users,
  channels: Radio,
  "domains-sending": Globe,
  "audience-consent": UserCheck,
  "tracking-data": Workflow,
  templates: LayoutTemplate,
  integrations: Plug,
  webhooks: Webhook,
  notifications: Bell,
  security: Shield,
  "billing-usage": CreditCard,
  "developer-api": Code2,
};
