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
import { SETTINGS_AREAS, type SettingsAreaSection } from "@/lib/settings-area-sections";

export type SettingsAccordionGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  basePath: string;
  sections: SettingsAreaSection[];
};

const CHANNEL_AREA_IDS = [
  "channels-email",
  "channels-push",
  "channels-whatsapp",
  "channels-in-app",
  "channels-content-cards",
] as const;

const TOP_LEVEL_AREA_IDS = [
  "general",
  "workspace",
  "team-access",
  "domains-sending",
  "audience-consent",
  "tracking-data",
  "templates",
  "integrations",
  "webhooks",
  "notifications",
  "security",
  "billing-usage",
  "developer-api",
] as const;

function areaToGroup(areaId: string): SettingsAccordionGroup | null {
  const area = SETTINGS_AREAS[areaId];
  if (!area) return null;
  return {
    id: area.id,
    title: area.title,
    icon: area.icon,
    basePath: area.basePath,
    sections: area.sections,
  };
}

/** Single "Channels" accordion containing each channel area's sections when that channel is active. */
export const SETTINGS_CHANNELS_GROUP: SettingsAccordionGroup & {
  channelAreas: SettingsAccordionGroup[];
} = {
  id: "channels",
  title: "Channels",
  icon: Radio,
  basePath: "/settings/channels",
  sections: [],
  channelAreas: CHANNEL_AREA_IDS.map((id) => areaToGroup(id)).filter(Boolean) as SettingsAccordionGroup[],
};

export const SETTINGS_ACCORDION_GROUPS: SettingsAccordionGroup[] = [
  ...TOP_LEVEL_AREA_IDS.map((id) => areaToGroup(id)).filter(Boolean) as SettingsAccordionGroup[],
];

/** Order shown in the settings sidebar (matches product map). */
export const SETTINGS_SIDEBAR_ORDER: Array<{ type: "area"; id: string } | { type: "channels" }> = [
  { type: "area", id: "general" },
  { type: "area", id: "workspace" },
  { type: "area", id: "team-access" },
  { type: "channels" },
  { type: "area", id: "domains-sending" },
  { type: "area", id: "audience-consent" },
  { type: "area", id: "tracking-data" },
  { type: "area", id: "templates" },
  { type: "area", id: "integrations" },
  { type: "area", id: "webhooks" },
  { type: "area", id: "notifications" },
  { type: "area", id: "security" },
  { type: "area", id: "billing-usage" },
  { type: "area", id: "developer-api" },
];

export function getSettingsGroupForPath(pathname: string): string | null {
  if (pathname.startsWith("/settings/channels/")) return "channels";
  for (const id of TOP_LEVEL_AREA_IDS) {
    const area = SETTINGS_AREAS[id];
    if (area && (pathname === area.basePath || pathname.startsWith(`${area.basePath}/`))) {
      return id;
    }
  }
  return null;
}

export function sectionHref(basePath: string, slug: string) {
  return `${basePath}/${slug}`;
}

export const SETTINGS_AREA_ICONS = {
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
